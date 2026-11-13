import React from 'react';
import { ShopCategory } from '../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: '', label: 'All Shops', icon: '🏪' },
  { id: 'grocery', label: 'Grocery & Kirana', icon: '🌾' },
  { id: 'supermarket', label: 'Supermarkets', icon: '🛒' },
  { id: 'pharmacy', label: 'Pharmacy & Health', icon: '💊' },
  { id: 'fresh_produce', label: 'Fresh Fruits & Veggies', icon: '🥦' },
  { id: 'bakery', label: 'Bakery & Sweets', icon: '🥐' },
  { id: 'electronics', label: 'Electronics', icon: '⚡' },
  { id: 'restaurant', label: 'Food & Cafes', icon: '🍲' },
  { id: 'hardware', label: 'Hardware Store', icon: '🔧' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id || 'all'}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

