import React, { useState, useEffect } from 'react';
import { Shop, GridCell, ShopSubmission, GooglePlace, Order, DeliveryPartner, PlatformSettings, AuditLog } from '../../types';
import { NearKartMap } from '../../maps/NearKartMap';
import {
  BarChart3,
  Layers,
  Store,
  CheckCircle2,
  XCircle,
  Plus,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  DollarSign,
  Sparkles,
  Key,
  Sliders,
  FileText,
  AlertTriangle,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'grid_map' | 'shops' | 'submissions' | 'places' | 'orders' | 'settings'>('grid_map');
  const [analytics, setAnalytics] = useState<any>({
    totalShops: 18,
    verifiedShops: 12,
    googleDiscovered: 6,
    pendingApprovals: 3,
    activeGrids: 8,
    activeDrivers: 5,
    totalOrders: 42,
    totalRevenue: 28450,
  });

  const [grids, setGrids] = useState<GridCell[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [submissions, setSubmissions] = useState<ShopSubmission[]>([]);
  const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DeliveryPartner[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    googleMapsApiKey: '',
    h3Resolution: 8,
    commissionPercent: 12,
    defaultDeliveryFee: 25,
    autoAssignDrivers: true,
    activeCity: 'Ludhiana, Punjab',
    centerCoordinates: [30.9010, 75.8573],
  });

  const [selectedGrid, setSelectedGrid] = useState<GridCell | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [newShopForm, setNewShopForm] = useState<Partial<Shop>>({
    name: '',
    category: 'kirana',
    address: '',
    phone: '',
    lat: 30.9010,
    lng: 75.8573,
    deliveryCharge: 20,
    minOrder: 100,
    deliveryTimeMin: 15,
    isOpen: true,
    acceptsOrders: true,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    try {
      const [gridsRes, shopsRes, subRes, ordRes, drvRes, setRes] = await Promise.all([
        fetch('/api/grids'),
        fetch('/api/shops'),
        fetch('/api/admin/submissions'),
        fetch('/api/orders'),
        fetch('/api/drivers'),
        fetch('/api/admin/settings'),
      ]);

      if (gridsRes.ok) {
        const d = await gridsRes.json();
        setGrids(d.grids || []);
        if (d.grids?.length > 0 && !selectedGrid) setSelectedGrid(d.grids[0]);
      }
      if (shopsRes.ok) {
        const d = await shopsRes.json();
        setShops(d.shops || []);
      }
      if (subRes.ok) {
        const d = await subRes.json();
        setSubmissions(d || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d || []);
      }
      if (drvRes.ok) {
        const d = await drvRes.json();
        setDrivers(d || []);
      }
      if (setRes.ok) {
        const d = await setRes.json();
        setSettings(d);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle Grid status
  const handleToggleGrid = async (grid: GridCell) => {
    const nextStatus = grid.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/grids/${grid.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setGrids((prev) =>
          prev.map((g) => (g.id === grid.id ? { ...g, status: nextStatus } : g))
        );
        if (selectedGrid?.id === grid.id) {
          setSelectedGrid({ ...selectedGrid, status: nextStatus });
        }
        setStatusMessage(`Grid ${grid.id} is now ${nextStatus.toUpperCase()}`);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Grid configuration
  const handleUpdateGridConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrid) return;

    try {
      const res = await fetch(`/api/grids/${selectedGrid.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryCharge: selectedGrid.deliveryCharge,
          baseRadiusKm: selectedGrid.baseRadiusKm,
        }),
      });
      if (res.ok) {
        setStatusMessage(`Updated settings for ${selectedGrid.id}`);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approve / Reject shop submission
  const handleReviewSubmission = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        loadData();
        setStatusMessage(`Shop submission ${action === 'approve' ? 'Approved & Added to Map' : 'Rejected'}`);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Import Google Place
  const handleImportGooglePlace = async (place: GooglePlace) => {
    try {
      const res = await fetch('/api/places/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: place.placeId }),
      });
      if (res.ok) {
        loadData();
        setStatusMessage(`Imported ${place.name} into verified NearKart shops!`);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setStatusMessage('Platform & Google Maps settings saved successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create manual shop
  const handleCreateManualShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newShopForm,
          isVerified: true,
          isGoogleDiscovered: false,
          gridId: selectedGrid ? selectedGrid.id : 'GRID-LDH-001',
          rating: 4.8,
          reviewCount: 1,
        }),
      });
      if (res.ok) {
        setIsAddingShop(false);
        loadData();
        setStatusMessage('New shop registered and published to grid!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900">Admin Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic H3 spatial grids, shop approvals, Google Places review queue, and fleet dispatch.
          </p>
        </div>

        {statusMessage && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold animate-fadeIn">
            ✓ {statusMessage}
          </div>
        )}

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live State</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        {[
          { id: 'grid_map', label: 'Grid Map Manager', icon: Layers },
          { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
          { id: 'shops', label: 'Shops & Partners', icon: Store },
          { id: 'submissions', label: `Pending Approvals (${submissions.length})`, icon: Clock },
          { id: 'places', label: 'Google Places Queue', icon: Sparkles },
          { id: 'orders', label: 'Orders & Dispatch', icon: Truck },
          { id: 'settings', label: 'Settings & API Keys', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              <Icon className="w-4 h-4 text-emerald-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Grid Map Management (Full-screen interactive spatial grid engine) */}
      {activeTab === 'grid_map' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* Map Canvas (7 cols) */}
            <div className="lg:col-span-8 h-[650px] min-h-[540px] w-full relative rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              <NearKartMap
                center={settings.centerCoordinates}
                zoom={13}
                shops={shops}
                grids={grids}
                selectedShop={selectedShop}
                onSelectShop={(s) => setSelectedShop(s)}
                userLocation={settings.centerCoordinates}
                drivers={drivers}
                showGrids={true}
                height="100%"
              />

              <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Operating Zone</div>
                <div className="text-sm font-extrabold text-slate-900">{settings.activeCity}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">H3 Hex Index Resolution: {settings.h3Resolution}</div>
              </div>
            </div>

            {/* Grid Management Inspector (4 cols) */}
            <div className="lg:col-span-4 space-y-4">

              {/* Selected Grid Cell Details */}
              {selectedGrid ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400">{selectedGrid.id}</div>
                      <h3 className="font-extrabold text-base text-slate-900">{selectedGrid.areaName}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleGrid(selectedGrid)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${selectedGrid.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                    >
                      {selectedGrid.status === 'active' ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Shops Inside</div>
                      <div className="text-lg font-black text-slate-900">{selectedGrid.shopCount}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Active Drivers</div>
                      <div className="text-lg font-black text-slate-900">{selectedGrid.activeDrivers}</div>
                    </div>
                  </div>

                  {/* Grid Configuration Form */}
                  <form onSubmit={handleUpdateGridConfig} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Grid Hyperlocal Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={selectedGrid.deliveryCharge}
                        onChange={(e) =>
                          setSelectedGrid({ ...selectedGrid, deliveryCharge: Number(e.target.value) })
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Service Radius (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedGrid.baseRadiusKm}
                        onChange={(e) =>
                          setSelectedGrid({ ...selectedGrid, baseRadiusKm: Number(e.target.value) })
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Save Grid Parameters
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center text-slate-400">
                  Select a grid cell to inspect and modify.
                </div>
              )}

              {/* Grid Cells List */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Registered Grids ({grids.length})
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    {grids.filter((g) => g.status === 'active').length} Active
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {grids.map((grid) => (
                    <div
                      key={grid.id}
                      onClick={() => setSelectedGrid(grid)}
                      className={`p-2.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${selectedGrid?.id === grid.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{grid.areaName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{grid.id} • {grid.shopCount} shops</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${grid.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {grid.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Analytics & KPIs */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase">Total Registered Shops</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{analytics.totalShops}</div>
              <div className="text-[11px] text-emerald-600 mt-1">12 Verified • 6 Google Discovered</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase">Pending Approvals</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{submissions.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Community submitted Kiranas</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase">Active Grid Cells</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{grids.filter((g) => g.status === 'active').length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Across Ludhiana City</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase">Platform Revenue</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹{analytics.totalRevenue}</div>
              <div className="text-[11px] text-slate-400 mt-1">12% Commission on {orders.length} orders</div>
            </div>
          </div>

          {/* Quick audit logs */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Live Platform Audit Logs</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">GRID_UPDATED:</span>
                  <span className="text-slate-600 ml-2">GRID-LDH-001 delivery fee set to ₹20</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">Just now</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">ORDER_DISPATCHED:</span>
                  <span className="text-slate-600 ml-2">Assigned Rajesh Kumar (Driver) to Order #ORD-8492</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">4 mins ago</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">GOOGLE_PLACES_DISCOVERY:</span>
                  <span className="text-slate-600 ml-2">Discovered 4 new retail businesses in Sarabha Nagar</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">18 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Shops Management & Manual Add */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Registered Platform Stores ({shops.length})</h2>
            <button
              onClick={() => setIsAddingShop(!isAddingShop)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Store Manually</span>
            </button>
          </div>

          {/* Add Shop Form */}
          {isAddingShop && (
            <form onSubmit={handleCreateManualShop} className="bg-white p-5 rounded-3xl border border-emerald-300 shadow-md space-y-4">
              <h3 className="font-black text-sm text-slate-900">Add New Shop to Grid Map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopForm.name}
                    onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                    placeholder="e.g. Daily Fresh Mart"
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newShopForm.category}
                    onChange={(e) => setNewShopForm({ ...newShopForm, category: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50 font-medium"
                  >
                    <option value="kirana">Kirana Store</option>
                    <option value="grocery">Grocery & Staples</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="fresh_produce">Fruits & Veggies</option>
                    <option value="bakery">Bakery</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newShopForm.phone}
                    onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Address *</label>
                  <input
                    type="text"
                    required
                    value={newShopForm.address}
                    onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                    placeholder="Road, Locality, Ludhiana"
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    value={newShopForm.deliveryCharge}
                    onChange={(e) => setNewShopForm({ ...newShopForm, deliveryCharge: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingShop(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Register Store & Publish
                </button>
              </div>
            </form>
          )}

          {/* Shops Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Store Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Assigned Grid</th>
                    <th className="p-4">Status & Type</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Delivery Rate</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{shop.name}</div>
                        <div className="text-[11px] text-slate-400">{shop.address}</div>
                      </td>
                      <td className="p-4 capitalize font-medium text-slate-600">{shop.category}</td>
                      <td className="p-4 font-mono font-bold text-slate-700">{shop.gridId}</td>
                      <td className="p-4">
                        {shop.isVerified ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            ✓ Verified Platform Shop
                          </span>
                        ) : (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Google Discovered
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-yellow-600">★ {shop.rating.toFixed(1)}</td>
                      <td className="p-4 font-bold">₹{shop.deliveryCharge}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedShop(shop);
                            setActiveTab('grid_map');
                          }}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          View On Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Pending Shop Submissions from Customers */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Customer Submitted Missing Shops</h2>
              <p className="text-xs text-slate-500">Verify local physical stores submitted by community users.</p>
            </div>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold">
              {submissions.length} Pending
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">All submissions cleared!</h3>
              <p className="text-xs text-slate-400 mt-1">No pending community shop suggestions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{sub.shopName}</h4>
                        <span className="text-[11px] font-bold capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {sub.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{sub.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-[11px]">GPS: {sub.lat.toFixed(4)}, {sub.lng.toFixed(4)}</span>
                      </div>
                      {sub.phone && <div>Phone: <strong className="text-slate-800">{sub.phone}</strong></div>}
                      {sub.notes && <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 italic">"{sub.notes}"</div>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReviewSubmission(sub.id, 'reject')}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReviewSubmission(sub.id, 'approve')}
                      className="flex items-center gap-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Add to Grid</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Google Places Discovery Queue */}
      {activeTab === 'places' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-3xl">
            <h3 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Google Places API (New) Business Discovery
            </h3>
            <p className="text-xs text-indigo-800 mt-1">
              Search and import real businesses found via Google Places into NearKart's verified shop catalog with 1-click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                placeId: 'ChIJ_111_gplaces_ldh_01',
                name: 'Singla Departmental Store',
                category: 'grocery' as const,
                categoryLabel: 'Grocery Store',
                address: 'Main Market, Sarabha Nagar, Ludhiana',
                lat: 30.8985,
                lng: 75.8320,
                rating: 4.6,
                userRatingsTotal: 340,
                openNow: true,
                imported: false,
              },
              {
                placeId: 'ChIJ_222_gplaces_ldh_02',
                name: 'Apollo Pharmacy & Wellness',
                category: 'pharmacy' as const,
                categoryLabel: 'Pharmacy',
                address: 'Model Town Extn, Ludhiana',
                lat: 30.8870,
                lng: 75.8450,
                rating: 4.7,
                userRatingsTotal: 512,
                openNow: true,
                imported: false,
              },
              {
                placeId: 'ChIJ_333_gplaces_ldh_03',
                name: 'Bake Fresh Confectionery',
                category: 'bakery' as const,
                categoryLabel: 'Bakery',
                address: 'College Road, Civil Lines, Ludhiana',
                lat: 30.9120,
                lng: 75.8480,
                rating: 4.8,
                userRatingsTotal: 620,
                openNow: true,
                imported: false,
              },
            ].map((place) => (
              <div key={place.placeId} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      Google Places
                    </span>
                    <span className="text-xs font-bold text-yellow-600">★ {place.rating} ({place.userRatingsTotal})</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-2">{place.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{place.address}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <span>View on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleImportGooglePlace(place)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Import to NearKart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Orders & Dispatch Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Live Orders & Dispatch Monitor ({orders.length})</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivery Driver</th>
                  <th className="p-4">OTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-800">#{ord.orderNumber || ord.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-slate-900">{ord.shopName}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.deliveryAddress.address}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900">₹{ord.total}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {ord.deliveryPartnerName || 'Unassigned'}
                    </td>
                    <td className="p-4 font-mono font-extrabold text-emerald-700">{ord.otp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: Platform Settings & Google Maps Keys */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 border-b pb-3">
            <Key className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Platform Credentials & Spatial Engine</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Maps Platform API Key
            </label>
            <input
              type="text"
              value={settings.googleMapsApiKey}
              onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Requires: Maps JavaScript API, Places API (New), Routes API. (Leave blank to use NearKart's built-in high performance vector map with zero API fees).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                H3 Hex Resolution (7-9)
              </label>
              <input
                type="number"
                min="6"
                max="10"
                value={settings.h3Resolution}
                onChange={(e) => setSettings({ ...settings, h3Resolution: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
              />
              <span className="text-[10px] text-slate-400">Res 8 = ~0.7 km² hexagon cells</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                value={settings.commissionPercent}
                onChange={(e) => setSettings({ ...settings, commissionPercent: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Hyperlocal Delivery Base Charge (₹)
            </label>
            <input
              type="number"
              value={settings.defaultDeliveryFee}
              onChange={(e) => setSettings({ ...settings, defaultDeliveryFee: Number(e.target.value) })}
              className="w-full text-xs p-2.5 rounded-xl border bg-slate-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Save Platform Configuration
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
