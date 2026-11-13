import React, { useState } from 'react';
import { Shop, Product, CartItem } from '../../types';
import { ProductCard } from '../../components/ProductCard';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Star, 
  ShoppingBag,
  Info
} from 'lucide-react';

interface ShopDetailsModalProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (product: Product, shop: Shop) => void;
  onRemoveFromCart: (productId: string) => void;
  onOpenCart: () => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  shop,
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const products = shop.featuredProducts || [];
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const shopCartItems = cart.filter((item) => item.shopId === shop.id);
  const cartSubtotal = shopCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header with Shop Details */}
        <div className="relative bg-slate-900 text-white p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              src={shop.imageUrl} 
              alt={shop.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">{shop.name}</h2>
                {shop.isVerified ? (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    Google Discovered
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {shop.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {shop.openingHours || '8:00 AM - 10:00 PM'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  {shop.phone || '+91 98765 43210'}
                </span>
                {shop.rating ? (
                  <span className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    {shop.rating.toFixed(1)} ({shop.reviewCount} reviews)
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Products' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.product.id === product.id);
                const quantity = cartItem?.quantity || 0;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={quantity}
                    onAddToCart={() => onAddToCart(product, shop)}
                    onRemoveFromCart={() => onRemoveFromCart(product.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No items listed yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                This store is either awaiting product catalog sync or is an unverified listing.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Cart Bar (if user added items) */}
        {shopCartItems.length > 0 && (
          <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-xs text-slate-500">
                {shopCartItems.reduce((acc, i) => acc + i.quantity, 0)} items in cart
              </div>
              <div className="text-base font-black text-slate-900">
                ₹{cartSubtotal}
                <span className="text-xs font-normal text-slate-400 ml-1.5">+ ₹{shop.deliveryCharge} delivery</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart & Checkout</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

