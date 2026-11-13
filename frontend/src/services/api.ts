import { 
  Shop, 
  GridCell, 
  ServiceArea, 
  Order, 
  DeliveryPartner, 
  ShopSubmission, 
  GooglePlace, 
  PlatformSettings,
  AuditLog
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Shops
  getShops: (params?: { category?: string; search?: string; lat?: number; lng?: number; gridId?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.lat) query.append('lat', params.lat.toString());
    if (params?.lng) query.append('lng', params.lng.toString());
    if (params?.gridId) query.append('gridId', params.gridId);
    if (params?.sort) query.append('sort', params.sort);
    return fetchJSON<{ shops: Shop[]; count: number }>(`/shops?${query.toString()}`);
  },

  getShopById: (id: string) => fetchJSON<Shop>(`/shops/${id}`),

  getRecommendations: (lat: number, lng: number, category?: string) => {
    const query = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
    if (category) query.append('category', category);
    return fetchJSON<{
      nearest: Shop | null;
      fastest: Shop | null;
      bestRated: Shop | null;
      lowestDelivery: Shop | null;
      bestOverall: Shop | null;
    }>(`/shops/recommendations?${query.toString()}`);
  },

  submitMissingShop: (data: Partial<ShopSubmission>) => 
    fetchJSON<{ message: string; submission: ShopSubmission }>('/shops/suggest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Grids & Map Service
  getGrids: () => fetchJSON<{ grids: GridCell[]; activeCity: string; center: [number, number] }>('/grids'),

  updateGridStatus: (id: string, status: 'active' | 'inactive') => 
    fetchJSON<GridCell>(`/grids/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateGridConfig: (id: string, updates: { deliveryCharge?: number; baseRadiusKm?: number; status?: 'active' | 'inactive' }) =>
    fetchJSON<GridCell>(`/grids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getServiceAreas: () => fetchJSON<ServiceArea[]>('/grids/service-areas'),

  saveServiceArea: (area: Partial<ServiceArea>) =>
    fetchJSON<ServiceArea>('/grids/service-areas', {
      method: 'POST',
      body: JSON.stringify(area),
    }),

  // Google Places Discovery
  getGooglePlaces: (lat: number, lng: number, query?: string) => {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
    if (query) params.append('query', query);
    return fetchJSON<GooglePlace[]>(`/places/discover?${params.toString()}`);
  },

  importGooglePlace: (placeId: string) =>
    fetchJSON<{ message: string; shop: Shop }>(`/places/import`, {
      method: 'POST',
      body: JSON.stringify({ placeId }),
    }),

  // Orders
  createOrder: (orderData: any) =>
    fetchJSON<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getOrder: (id: string) => fetchJSON<Order>(`/orders/${id}`),

  getAllOrders: () => fetchJSON<Order[]>('/orders'),

  assignDriverToOrder: (orderId: string, driverId: string) =>
    fetchJSON<Order>(`/orders/${orderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    }),

  updateOrderStatus: (orderId: string, status: string) =>
    fetchJSON<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Driver Panel
  getDriverProfile: (id = 'driver-1') => fetchJSON<DeliveryPartner>(`/drivers/${id}`),

  getAllDrivers: () => fetchJSON<DeliveryPartner[]>('/drivers'),

  toggleDriverOnline: (id: string, isOnline: boolean) =>
    fetchJSON<DeliveryPartner>(`/drivers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline }),
    }),

  updateDriverLocation: (id: string, lat: number, lng: number) =>
    fetchJSON<DeliveryPartner>(`/drivers/${id}/location`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    }),

  driverAcceptOrder: (driverId: string, orderId: string) =>
    fetchJSON<Order>(`/drivers/${driverId}/accept-order`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  completeDeliveryOTP: (orderId: string, otp: string) =>
    fetchJSON<{ success: boolean; message: string; order: Order }>(`/orders/${orderId}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  // Admin Management
  getAnalytics: () => fetchJSON<{
    totalShops: number;
    verifiedShops: number;
    googleDiscovered: number;
    pendingApprovals: number;
    activeGrids: number;
    activeDrivers: number;
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
  }>('/admin/analytics'),

  getPendingSubmissions: () => fetchJSON<ShopSubmission[]>('/admin/submissions'),

  reviewSubmission: (id: string, action: 'approve' | 'reject') =>
    fetchJSON<{ message: string; shop?: Shop }>(`/admin/submissions/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  addManualShop: (shopData: Partial<Shop>) =>
    fetchJSON<Shop>('/admin/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    }),

  getSettings: () => fetchJSON<PlatformSettings>('/admin/settings'),

  updateSettings: (settings: Partial<PlatformSettings>) =>
    fetchJSON<PlatformSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getAuditLogs: () => fetchJSON<AuditLog[]>('/admin/audit-logs'),
};

