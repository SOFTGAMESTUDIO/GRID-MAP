import React from 'react';
import { Product } from '../types';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="max-h-full max-w-full object-contain p-2 hover:scale-105 transition-transform" 
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
            {discount}% OFF
          </span>
        )}
      </div>

      <div>
        <div className="text-[11px] text-slate-400 font-medium">{product.unit}</div>
        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5 leading-snug">
          {product.name}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
          {product.description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-slate-900">₹{product.price}</span>
          {discount > 0 && (
            <span className="text-[10px] text-slate-400 line-through ml-1.5">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {quantityInCart > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-2 py-1 shadow-sm">
            <button 
              onClick={onRemoveFromCart}
              className="p-0.5 hover:bg-emerald-700 rounded transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold min-w-[14px] text-center">{quantityInCart}</span>
            <button 
              onClick={onAddToCart}
              className="p-0.5 hover:bg-emerald-700 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAddToCart}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>ADD</span>
          </button>
        )}
      </div>
    </div>
  );
};

