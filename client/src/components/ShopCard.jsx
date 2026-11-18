import React from 'react';
import { Star, MapPin, Clock, ArrowRight, Zap, ShoppingBag } from 'lucide-react';

export default function ShopCard({ shop, onNavigate }) {
  return (
    <div 
      onClick={() => onNavigate('shop-details', { shopId: shop.id })}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Banner & Logo */}
      <div className="relative h-32 bg-slate-100 overflow-hidden">
        <img
          src={shop.banner || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800'}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        
        {/* Open / Closed Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
            shop.is_open_now 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-rose-500/90 text-white'
          }`}>
            {shop.is_open_now ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Distance Badge if available */}
        {shop.distance_km !== null && shop.distance_km !== undefined && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{shop.distance_km} km away</span>
          </div>
        )}

        {/* Shop Logo Floating Over Banner */}
        <div className="absolute -bottom-5 left-4">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-slate-100 overflow-hidden">
            <img
              src={shop.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'}
              alt={shop.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-7 px-4 pb-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
              {shop.category}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{shop.rating?.toFixed(1) || '4.8'}</span>
              <span className="text-slate-400 font-normal text-[11px]">({shop.rating_count || 12})</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base mt-2 group-hover:text-brand-600 transition-colors line-clamp-1">
            {shop.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {shop.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{shop.address}, {shop.pincode}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{shop.opening_time} - {shop.closing_time}</span>
          </div>

          <div className="flex items-center gap-1 text-brand-700 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </div>
  );
}
