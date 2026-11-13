-- ====================================================================
-- NearKart: Smart Hyperlocal Retail Platform Seed Data
-- ====================================================================

-- 1. Insert Initial Platform Admin & Drivers
INSERT INTO users (id, full_name, email, phone_number, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'NearKart Super Admin', 'admin@nearkart.com', '+919999900000', 'admin'),
('b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 'rajesh.driver@nearkart.com', '+919888877777', 'driver'),
('b0000000-0000-0000-0000-000000000002', 'Gurpreet Singh', 'gurpreet.driver@nearkart.com', '+919876511111', 'driver'),
('c0000000-0000-0000-0000-000000000001', 'Amanpreet Singh', 'amanpreet@gmail.com', '+919814012345', 'customer')
ON CONFLICT DO NOTHING;

-- 2. Shop Categories
INSERT INTO shop_categories (id, name, description, icon_name) VALUES
('kirana', 'Kirana & Daily Needs', 'Local neighborhood grocery stores and daily essentials', 'store'),
('supermarket', 'Supermarkets', 'Large multi-departmental grocery and household retail stores', 'shopping-cart'),
('pharmacy', 'Pharmacy & Health', 'Licensed medical dispensaries, OTC drugs and wellness essentials', 'activity'),
('fresh_produce', 'Fresh Fruits & Vegetables', 'Farm-fresh vegetables, organic produce and seasonal fruits', 'apple'),
('bakery', 'Bakery & Sweets', 'Freshly baked breads, pastries, confectionery and traditional sweets', 'coffee'),
('electronics', 'Electronics & Mobile', 'Mobile accessories, electronics and appliance repairs', 'smartphone'),
('hardware', 'Hardware & Sanitary', 'Home repair, plumbing, electrical fixtures and tools', 'tool')
ON CONFLICT DO NOTHING;

-- 3. H3 Geographical Grids (Ludhiana City Hubs)
INSERT INTO geographical_grids (id, h3_index, resolution, area_name, city, center_latitude, center_longitude, boundary_polygon, status, delivery_charge, base_radius_km, shop_count, active_drivers) VALUES
('GRID-LDH-001', '881ea12453fffff', 8, 'Model Town Central', 'Ludhiana', 30.8920, 75.8450, ST_PolygonFromText('POLYGON((75.840 30.890, 75.850 30.890, 75.850 30.895, 75.840 30.895, 75.840 30.890))', 4326), 'active', 20.00, 2.5, 4, 3),
('GRID-LDH-002', '881ea12455fffff', 8, 'Sarabha Nagar Market', 'Ludhiana', 30.9020, 75.8350, ST_PolygonFromText('POLYGON((75.830 30.900, 75.840 30.900, 75.840 30.905, 75.830 30.905, 75.830 30.900))', 4326), 'active', 25.00, 3.0, 3, 2),
('GRID-LDH-003', '881ea12457fffff', 8, 'Civil Lines', 'Ludhiana', 30.9120, 75.8550, ST_PolygonFromText('POLYGON((75.850 30.910, 75.860 30.910, 75.860 30.915, 75.850 30.915, 75.850 30.910))', 4326), 'active', 20.00, 2.8, 3, 2),
('GRID-LDH-004', '881ea12459fffff', 8, 'Ferozepur Road Hub', 'Ludhiana', 30.8950, 75.8150, ST_PolygonFromText('POLYGON((75.810 30.890, 75.820 30.890, 75.820 30.900, 75.810 30.900, 75.810 30.890))', 4326), 'active', 30.00, 3.5, 2, 1)
ON CONFLICT DO NOTHING;

-- 4. Initial Verified Shops
INSERT INTO shops (id, name, category_id, address, latitude, longitude, location, h3_grid_id, phone, rating, review_count, is_verified, is_google_discovered, accepts_orders, is_open, opening_hours, delivery_time_min, delivery_charge, min_order_amount, image_url) VALUES
('d0000000-0000-0000-0000-000000000001', 'Sharma Kirana & Daily Needs', 'kirana', 'Shop 14, Main Gol Market, Model Town, Ludhiana', 30.8935, 75.8465, ST_SetSRID(ST_MakePoint(75.8465, 30.8935), 4326), 'GRID-LDH-001', '+919814155667', 4.8, 342, TRUE, FALSE, TRUE, TRUE, '7:30 AM - 10:30 PM', 12, 20.00, 80.00, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'),
('d0000000-0000-0000-0000-000000000002', 'Punjab Super Market', 'supermarket', 'Block-D, Sarabha Nagar Main Market, Ludhiana', 30.9015, 75.8340, ST_SetSRID(ST_MakePoint(75.8340, 30.9015), 4326), 'GRID-LDH-002', '+919872233445', 4.7, 520, TRUE, FALSE, TRUE, TRUE, '8:00 AM - 11:00 PM', 15, 25.00, 150.00, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
('d0000000-0000-0000-0000-000000000003', 'Sanjeevani Medicos & Healthcare', 'pharmacy', 'Near Krishna Mandir, Model Town, Ludhiana', 30.8890, 75.8430, ST_SetSRID(ST_MakePoint(75.8430, 30.8890), 4326), 'GRID-LDH-001', '+919888011223', 4.9, 290, TRUE, FALSE, TRUE, TRUE, '24 Hours Open', 10, 15.00, 50.00, 'https://images.unsplash.com/photo-1586015555751-63c299c855a8?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;

-- 5. Delivery Partners
INSERT INTO delivery_partners (id, user_id, name, phone, vehicle_type, vehicle_number, rating, is_online, current_latitude, current_longitude, current_location, current_grid_id, total_deliveries, earnings_today) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', '+919888877777', 'bike', 'PB 10 EJ 4421', 4.9, TRUE, 30.8980, 75.8420, ST_SetSRID(ST_MakePoint(75.8420, 30.8980), 4326), 'GRID-LDH-001', 482, 840.00),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Gurpreet Singh', '+919876511111', 'scooter', 'PB 10 FB 1092', 4.8, TRUE, 30.9040, 75.8360, ST_SetSRID(ST_MakePoint(75.8360, 30.9040), 4326), 'GRID-LDH-002', 310, 620.00)
ON CONFLICT DO NOTHING;

