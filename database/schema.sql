-- ====================================================================
-- NearKart: Smart Hyperlocal Retail, Store Discovery & Delivery Platform
-- PostgreSQL + PostGIS Database Architecture Schema
-- ====================================================================

-- Enable PostGIS Extension for geospatial indexing and spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Customers
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'admin', 'driver', 'shop_owner')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Saved Addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(30) NOT NULL CHECK (label IN ('HOME', 'WORK', 'OTHER')),
    address_line TEXT NOT NULL,
    landmark VARCHAR(150),
    postal_code VARCHAR(15),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location GEOMETRY(Point, 4326),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_addresses_location ON user_addresses USING GIST(location);

-- 3. Geographical Grids (H3 Spatial Indexing System)
CREATE TABLE IF NOT EXISTS geographical_grids (
    id VARCHAR(50) PRIMARY KEY, -- e.g. GRID-LDH-001
    h3_index VARCHAR(25) NOT NULL UNIQUE,
    resolution INTEGER NOT NULL DEFAULT 8,
    area_name VARCHAR(100) NOT NULL,
    city VARCHAR(80) NOT NULL,
    center_latitude NUMERIC(10, 7) NOT NULL,
    center_longitude NUMERIC(10, 7) NOT NULL,
    center_point GEOMETRY(Point, 4326),
    boundary_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    delivery_charge NUMERIC(8, 2) NOT NULL DEFAULT 25.00,
    base_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 3.0,
    shop_count INTEGER DEFAULT 0,
    active_drivers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_geo_grids_center ON geographical_grids USING GIST(center_point);
CREATE INDEX IF NOT EXISTS idx_geo_grids_boundary ON geographical_grids USING GIST(boundary_polygon);

-- 4. Service Areas (High-level polygon operational boundaries)
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(80) NOT NULL,
    boundary_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_areas_boundary ON service_areas USING GIST(boundary_polygon);

-- 5. Shop Categories
CREATE TABLE IF NOT EXISTS shop_categories (
    id VARCHAR(50) PRIMARY KEY, -- e.g. grocery, kirana, pharmacy
    name VARCHAR(80) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Shops & Retail Stores
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category_id VARCHAR(50) REFERENCES shop_categories(id),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location GEOMETRY(Point, 4326),
    h3_grid_id VARCHAR(50) REFERENCES geographical_grids(id),
    phone VARCHAR(20),
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_google_discovered BOOLEAN DEFAULT FALSE,
    google_place_id VARCHAR(100) UNIQUE,
    accepts_orders BOOLEAN DEFAULT TRUE,
    is_open BOOLEAN DEFAULT TRUE,
    opening_hours VARCHAR(100) DEFAULT '8:00 AM - 10:00 PM',
    delivery_time_min INTEGER DEFAULT 15,
    delivery_charge NUMERIC(8, 2) DEFAULT 20.00,
    min_order_amount NUMERIC(8, 2) DEFAULT 100.00,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shops_h3_grid ON shops(h3_grid_id);

-- 7. Google Places Cache / Discovery Registry
CREATE TABLE IF NOT EXISTS google_places (
    place_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id VARCHAR(50),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location GEOMETRY(Point, 4326),
    rating NUMERIC(3, 2),
    user_ratings_total INTEGER,
    open_now BOOLEAN DEFAULT TRUE,
    is_imported BOOLEAN DEFAULT FALSE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_google_places_location ON google_places USING GIST(location);

-- 8. Customer Missing Shop Submissions (Approval Queue)
CREATE TABLE IF NOT EXISTS shop_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_name VARCHAR(150) NOT NULL,
    category_id VARCHAR(50) REFERENCES shop_categories(id),
    address TEXT NOT NULL,
    phone VARCHAR(20),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location GEOMETRY(Point, 4326),
    photo_url TEXT,
    suggested_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by_admin_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shop_submissions_status ON shop_submissions(status);

-- 9. Product Catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    description TEXT,
    unit VARCHAR(40) NOT NULL, -- e.g. 500g, 1L, 1 pc
    image_url TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);

-- 10. Delivery Partners (Drivers / Riders)
CREATE TABLE IF NOT EXISTS delivery_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) DEFAULT 'bike' CHECK (vehicle_type IN ('bike', 'scooter', 'ev')),
    vehicle_number VARCHAR(30) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    is_online BOOLEAN DEFAULT TRUE,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    current_location GEOMETRY(Point, 4326),
    current_grid_id VARCHAR(50) REFERENCES geographical_grids(id),
    total_deliveries INTEGER DEFAULT 0,
    earnings_today NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON delivery_partners USING GIST(current_location);

-- 11. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_latitude NUMERIC(10, 7) NOT NULL,
    delivery_longitude NUMERIC(10, 7) NOT NULL,
    delivery_location GEOMETRY(Point, 4326),
    shop_id UUID REFERENCES shops(id),
    shop_name VARCHAR(150) NOT NULL,
    shop_address TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(8, 2) NOT NULL,
    taxes NUMERIC(8, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ORDER_PLACED' CHECK (status IN (
        'ORDER_PLACED',
        'SHOP_ACCEPTED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'DRIVER_ASSIGNED',
        'PICKED_UP',
        'ON_THE_WAY',
        'DELIVERED',
        'CANCELLED'
    )),
    delivery_partner_id UUID REFERENCES delivery_partners(id),
    delivery_otp VARCHAR(6) NOT NULL,
    estimated_delivery_minutes INTEGER DEFAULT 15,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(delivery_partner_id);

-- 12. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL
);

-- 13. Platform Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(80) NOT NULL,
    details TEXT,
    performed_by VARCHAR(100) DEFAULT 'system',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

