import React from 'react';
import { Shop } from '../types';
import { 
  Star, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  Bike, 
  Car, 
  Footprints, 
  ShoppingBag,
  Info
} from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  isSelected: boolean;
  onSelect: () => void;
  onOpenProducts: () => void;
  onSelectTravelMode?: (mode: 'bike' | 'car' | 'walking') => void;
  activeTravelMode?: 'bike' | 'car' | 'walking';
}

export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  isSelected,
  onSelect,
  onOpenProducts,
  onSelectTravelMode,
  activeTravelMode = 'bike',
}) => {
  return (
    <div 
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner / Image & Badges */}
      <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
        <img 
          src={shop.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'} 
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Verification Pill */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          {shop.isVerified ? (
            <span className="flex items-center gap-1 bg-emerald-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              Verified Partner
            </span>
          ) : shop.isGoogleDiscovered ? (
            <span className="flex items-center gap-1 bg-indigo-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Info className="w-3 h-3" />
              Google Discovered
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-amber-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Community Suggestion
            </span>
          )}
        </div>

        {/* Grid Tag */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
            {shop.gridId}
          </span>
        </div>

        {/* Delivery ETA Pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-md border border-slate-100">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{shop.deliveryTimeMin ? `${shop.deliveryTimeMin} MINS` : '15-20 MINS'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-semibold">{shop.distanceKm ? `${shop.distanceKm} km` : '1.2 km'}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                {shop.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{shop.categoryLabel || shop.category}</p>
            </div>

            {shop.rating ? (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span className="text-xs font-bold">{shop.rating.toFixed(1)}</span>
                <span className="text-[10px] text-emerald-600">({shop.reviewCount})</span>
              </div>
            ) : null}
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{shop.address}</span>
          </div>

          {/* Travel Route Modes (Bike, Car, Walking) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px] font-semibold text-slate-400">Routes:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTravelMode?.('bike');
                }}
                title="Two-wheeler / Bike"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activeTravelMode === 'bike' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Bike className="w-3 h-3 text-emerald-600" />
                <span>{shop.travelTimes?.bike || Math.round((shop.distanceKm || 1.2) * 2.5)}m</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTravelMode?.('car');
                }}
                title="Four-wheeler / Car"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activeTravelMode === 'car' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3 h-3 text-blue-600" />
                <span>{shop.travelTimes?.car || Math.round((shop.distanceKm || 1.2) * 3.5)}m</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTravelMode?.('walking');
                }}
                title="Walking"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activeTravelMode === 'walking' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Footprints className="w-3 h-3 text-amber-600" />
                <span>{shop.travelTimes?.walking || Math.round((shop.distanceKm || 1.2) * 12)}m</span>
              </button>
            </div>
          </div>

          {/* Pricing & Free Delivery Notice */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Delivery: <strong className="text-slate-800">₹{shop.deliveryCharge}</strong></span>
            <span>Min Order: <strong className="text-slate-800">₹{shop.minOrder}</strong></span>
          </div>

          {/* Disclaimer for Google Places / Unverified Store */}
          {shop.isGoogleDiscovered && !shop.acceptsOrders && (
            <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-tight">
              ℹ️ Discovered via Google Maps. NearKart ordering is not yet enabled for this store.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={onSelect}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSelected ? 'Focused on Map' : 'View on Map'}
          </button>

          {shop.acceptsOrders ? (
            <button
              onClick={onOpenProducts}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Items</span>
            </button>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

