import React from 'react';
import { UserRole } from '../types';
import { 
  ShoppingBag, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  User, 
  PlusCircle, 
  Key,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSuggestShop: () => void;
  activeCity: string;
  onOpenApiKeySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  cartCount,
  onOpenCart,
  onOpenSuggestShop,
  activeCity,
  onOpenApiKeySettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & City Locality */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onRoleChange('customer')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">NearKart</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Grid 10-Min
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="font-medium text-slate-700">{activeCity}</span>
                  <span className="text-slate-400">• High Coverage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Central Role Selector Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Panel</span>
            </button>
            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Panel</span>
            </button>
            <button
              onClick={() => onRoleChange('driver')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'driver'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>Delivery Partner</span>
            </button>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Suggest Missing Shop Button */}
            {currentRole === 'customer' && (
              <button
                onClick={onOpenSuggestShop}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                title="Add a shop that is missing on the map"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Suggest Missing Shop</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-800 text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile View Role Switcher Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => onRoleChange('customer')}
            className={`text-xs font-semibold px-2 py-1 rounded ${
              currentRole === 'customer' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`text-xs font-semibold px-2 py-1 rounded ${
              currentRole === 'admin' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-600'
            }`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => onRoleChange('driver')}
            className={`text-xs font-semibold px-2 py-1 rounded ${
              currentRole === 'driver' ? 'text-amber-700 font-bold bg-amber-50' : 'text-slate-600'
            }`}
          >
            Delivery Partner
          </button>
        </div>

      </div>
    </header>
  );
};

