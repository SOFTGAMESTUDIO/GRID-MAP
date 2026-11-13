export type UserRole = 'customer' | 'admin' | 'driver';

export type ShopCategory = 
  | 'grocery'
  | 'supermarket'
  | 'pharmacy'
  | 'fresh_produce'
  | 'kirana'
  | 'bakery'
  | 'electronics'
  | 'restaurant'
  | 'hardware';

export interface Shop {
  id: string;
  name: string;
  category: ShopCategory;
  categoryLabel: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isGoogleDiscovered: boolean;
  googlePlaceId?: string;
  openingHours: string;
  isOpen: boolean;
  acceptsOrders: boolean;
  phone: string;
  imageUrl: string;
  gridId: string;
  deliveryTimeMin: number; // in minutes
  deliveryCharge: number; // in INR
  minOrder: number;
  featuredProducts?: Product[];
  distanceKm?: number;
  durationMinutes?: number;
  travelTimes?: {
    car: number;
    bike: number;
    walking: number;
  };
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  unit: string;
  imageUrl: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shopId: string;
  shopName: string;
}

export interface GridCell {
  id: string;
  h3Index: string;
  areaName: string;
  city: string;
  boundary: [number, number][]; // Lat, Lng pairs
  center: [number, number];
  shopCount: number;
  activeDrivers: number;
  status: 'active' | 'inactive';
  deliveryCharge: number;
  baseRadiusKm: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  polygon: [number, number][];
  isActive: boolean;
  totalGrids: number;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'SHOP_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    label: string;
    address: string;
    lat: number;
    lng: number;
  };
  shopId: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerLat?: number;
  deliveryPartnerLng?: number;
  otp: string;
  createdAt: string;
  estimatedDeliveryMinutes: number;
  deliveryInstructions?: string;
  routePolyline?: [number, number][];
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'ev';
  vehicleNumber: string;
  rating: number;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  currentOrderId?: string;
  totalDeliveries: number;
  earningsToday: number;
}

export interface ShopSubmission {
  id: string;
  shopName: string;
  category: ShopCategory;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  suggestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  notes?: string;
}

export interface GooglePlace {
  placeId: string;
  name: string;
  category: ShopCategory;
  categoryLabel: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingsTotal: number;
  openNow: boolean;
  imported: boolean;
  phone?: string;
}

export interface PlatformSettings {
  googleMapsApiKey: string;
  h3Resolution: number;
  commissionPercent: number;
  defaultDeliveryFee: number;
  autoAssignDrivers: boolean;
  activeCity: string;
  centerCoordinates: [number, number];
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

