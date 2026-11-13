import React from 'react';
import { Zap, Navigation2, Star, DollarSign, Award } from 'lucide-react';

export type RecommendationFilter = 
  | 'all'
  | 'nearest'
  | 'fastest'
  | 'best_rated'
  | 'lowest_cost'
  | 'best_overall';

interface SmartRecommendationBarProps {
  activeFilter: RecommendationFilter;
  onFilterChange: (filter: RecommendationFilter) => void;
  recommendations?: {
    nearestName?: string;
    fastestEta?: number;
    bestRating?: number;
    lowestFee?: number;
  };
}

export const SmartRecommendationBar: React.FC<SmartRecommendationBarProps> = ({
  activeFilter,
  onFilterChange,
  recommendations,
}) => {
  const tabs = [
    {
      id: 'all' as RecommendationFilter,
      label: 'All Shops',
      icon: null,
      sub: 'Grid List',
    },
    {
      id: 'best_overall' as RecommendationFilter,
      label: 'Best Overall',
      icon: <Award className="w-3.5 h-3.5 text-purple-500" />,
      sub: 'Top Recommended',
    },
    {
      id: 'fastest' as RecommendationFilter,
      label: 'Fastest Delivery',
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
      sub: recommendations?.fastestEta ? `~${recommendations.fastestEta} mins` : 'Rapid 10-15m',
    },
    {
      id: 'nearest' as RecommendationFilter,
      label: 'Nearest Road Distance',
      icon: <Navigation2 className="w-3.5 h-3.5 text-blue-500" />,
      sub: 'Shortest route',
    },
    {
      id: 'best_rated' as RecommendationFilter,
      label: 'Best Rated',
      icon: <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />,
      sub: 'Top reviews',
    },
    {
      id: 'lowest_cost' as RecommendationFilter,
      label: 'Lowest Delivery',
      icon: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
      sub: '₹0 - ₹15',
    },
  ];

  return (
    <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-1.5 px-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          🧠 Smart Hyperlocal Engine
        </span>
        <span className="text-[11px] text-slate-400">
          Traffic-aware road routing & stock availability
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.icon && (
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {tab.icon}
                </div>
              )}
              <div>
                <div className="text-xs font-bold leading-tight">{tab.label}</div>
                <div className={`text-[10px] leading-tight ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {tab.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

