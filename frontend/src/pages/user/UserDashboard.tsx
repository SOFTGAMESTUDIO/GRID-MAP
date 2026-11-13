import React, { useState, useEffect } from 'react';
import { Shop, GridCell, Product, CartItem, Order } from '../../types';
import { NearKartMap } from '../../maps/NearKartMap';
import { CategoryFilter } from '../../components/CategoryFilter';
import { SmartRecommendationBar, RecommendationFilter } from '../../components/SmartRecommendationBar';
import { ShopCard } from '../../components/ShopCard';
import { ShopDetailsModal } from './ShopDetailsModal';
import { CartDrawer } from './CartDrawer';
import { LiveTrackingModal } from './LiveTrackingModal';
import { SuggestShopModal } from './SuggestShopModal';
import { 
  Search, 
  MapPin, 
  Compass, 
  Layers, 
  List, 
  Map as MapIcon, 
  Sparkles,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface UserDashboardProps {
  userLocation: [number, number];
  setUserLocation: (loc: [number, number]) => void;
  activeCity: string;
  cart: CartItem[];
  onAddToCart: (product: Product, shop: Shop) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
  isSuggestShopOpen: boolean;
  onCloseSuggestShop: () => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  userLocation,
  setUserLocation,
  activeCity,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  isCartOpen,
  onCloseCart,
  isSuggestShopOpen,
  onCloseSuggestShop,
  activeOrder,
  setActiveOrder,
}) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [grids, setGrids] = useState<GridCell[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState<RecommendationFilter>('all');
  const [travelMode, setTravelMode] = useState<'bike' | 'car' | 'walking'>('bike');
  const [viewMode, setViewMode] = useState<'split' | 'map_only' | 'list_only'>('split');
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);

  // Fetch shops and grids from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [shopsRes, gridsRes] = await Promise.all([
        fetch(`/api/shops?lat=${userLocation[0]}&lng=${userLocation[1]}&category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`),
        fetch('/api/grids'),
      ]);

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        setShops(shopsData.shops || []);
      }

      if (gridsRes.ok) {
        const gridsData = await gridsRes.json();
        setGrids(gridsData.grids || []);
      }
    } catch (err) {
      console.error('Failed to load shops or grids:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userLocation, selectedCategory, searchQuery]);

  // Handle Smart Recommendations filter
  const getFilteredShops = () => {
    let result = [...shops];

    if (activeRecommendation === 'nearest') {
      result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (activeRecommendation === 'fastest') {
      result.sort((a, b) => (a.deliveryTimeMin || 999) - (b.deliveryTimeMin || 999));
    } else if (activeRecommendation === 'best_rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeRecommendation === 'lowest_cost') {
      result.sort((a, b) => (a.deliveryCharge || 0) - (b.deliveryCharge || 0));
    } else if (activeRecommendation === 'best_overall') {
      result.sort((a, b) => {
        const scoreA = (a.isVerified ? 20 : 0) + (a.rating * 5) - (a.distanceKm || 1) * 3 - (a.deliveryCharge * 0.2);
        const scoreB = (b.isVerified ? 20 : 0) + (b.rating * 5) - (b.distanceKm || 1) * 3 - (b.deliveryCharge * 0.2);
        return scoreB - scoreA;
      });
    }

    return result;
  };

  const filteredShops = getFilteredShops();

  // Find Google Places Nearby
  const handleDiscoverGooglePlaces = async () => {
    setIsSearchingGoogle(true);
    try {
      const res = await fetch(`/api/places/discover?lat=${userLocation[0]}&lng=${userLocation[1]}&query=${encodeURIComponent(searchQuery || 'retail grocery')}`);
      if (res.ok) {
        // Refresh shops list to include newly discovered entries
        fetchData();
      }
    } catch (err) {
      console.error('Google discovery error:', err);
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      
      {/* Top Banner: Active Order Notification if an order is in progress */}
      {activeOrder && activeOrder.status !== 'DELIVERED' && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">Order in Progress</div>
              <div className="text-sm font-extrabold">{activeOrder.shopName} • Status: {activeOrder.status.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="px-4 py-1.5 bg-white text-emerald-800 text-xs font-black rounded-xl hover:bg-emerald-50 shadow-sm transition-all"
          >
            Track Live GPS
          </button>
        </div>
      )}

      {/* Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores, fresh milk, daily kirana items, pharmacies..."
            className="w-full text-xs pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
          />
          <button
            onClick={handleDiscoverGooglePlaces}
            disabled={isSearchingGoogle}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors"
            title="Scan Google Places API for unlisted retail shops"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{isSearchingGoogle ? 'Scanning...' : 'Find Nearby'}</span>
          </button>
        </div>

        {/* View Mode Switcher: Split / Map Only / List Only */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Split Map</span>
          </button>
          <button
            onClick={() => setViewMode('map_only')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'map_only' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Full Map</span>
          </button>
          <button
            onClick={() => setViewMode('list_only')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'list_only' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5 text-amber-600" />
            <span>List Only</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Smart Hyperlocal Recommendations Filter */}
      <SmartRecommendationBar
        activeFilter={activeRecommendation}
        onFilterChange={setActiveRecommendation}
        recommendations={{
          nearestName: shops[0]?.name,
          fastestEta: 10,
          bestRating: 4.9,
          lowestFee: 15,
        }}
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Interactive Map (Columns depend on viewMode) */}
        {viewMode !== 'list_only' && (
          <div className={`${viewMode === 'map_only' ? 'lg:col-span-12 h-[75vh] min-h-[540px]' : 'lg:col-span-6 xl:col-span-7 h-[680px] min-h-[540px]'} w-full sticky top-20`}>
            <NearKartMap
              center={userLocation}
              zoom={14}
              shops={filteredShops}
              grids={grids}
              selectedShop={selectedShop}
              onSelectShop={(shop) => setSelectedShop(shop)}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              activeOrder={activeOrder}
              showGrids={true}
              travelMode={travelMode}
              onTravelModeChange={setTravelMode}
              height="100%"
            />
          </div>
        )}

        {/* Shop Listing Grid */}
        {viewMode !== 'map_only' && (
          <div className={`${viewMode === 'list_only' ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-5'} space-y-4`}>
            
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">
                  {filteredShops.length} Stores Available
                </h2>
                <p className="text-xs text-slate-500">
                  Inside active grid cells around your location
                </p>
              </div>

              {selectedShop && (
                <button
                  onClick={() => setSelectedShop(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Shop Cards List */}
            {isLoading ? (
              <div className="space-y-4 py-8 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs">Finding nearest stores & calculating road routes...</p>
              </div>
            ) : filteredShops.length > 0 ? (
              <div className={`grid ${viewMode === 'list_only' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    isSelected={selectedShop?.id === shop.id}
                    onSelect={() => setSelectedShop(shop)}
                    onOpenProducts={() => {
                      setSelectedShop(shop);
                      setIsProductsModalOpen(true);
                    }}
                    onSelectTravelMode={(mode) => setTravelMode(mode)}
                    activeTravelMode={travelMode}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No shops found in this category</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Know a Kirana store or supermarket nearby that is missing on NearKart?
                </p>
                <button
                  onClick={onCloseSuggestShop}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Suggest Missing Shop</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Product Catalog Modal */}
      {selectedShop && (
        <ShopDetailsModal
          shop={selectedShop}
          isOpen={isProductsModalOpen}
          onClose={() => setIsProductsModalOpen(false)}
          cart={cart}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          onOpenCart={onCloseCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={onCloseCart}
        cart={cart}
        shops={shops}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        onClearCart={onClearCart}
        onOrderPlaced={(order) => {
          setActiveOrder(order);
          setIsTrackingModalOpen(true);
        }}
        userLocation={userLocation}
      />

      {/* Live Order Tracking Modal */}
      {activeOrder && (
        <LiveTrackingModal
          order={activeOrder}
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}

      {/* Suggest Missing Shop Modal */}
      <SuggestShopModal
        isOpen={isSuggestShopOpen}
        onClose={onCloseSuggestShop}
        userLocation={userLocation}
        onSubmissionSuccess={() => fetchData()}
      />

    </div>
  );
};

