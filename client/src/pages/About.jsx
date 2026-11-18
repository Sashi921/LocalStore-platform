import React from 'react';
import { Store, HeartHandshake, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';

export default function About({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 bg-brand-50 text-brand-700 font-extrabold text-xs rounded-full uppercase tracking-wider">
          Our Vision & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Powering Neighborhood Retailers with Modern Technology
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          LocalStore is built on a simple conviction: local stores are the beating heart of our communities. We empower mom-and-pop grocers, artisanal bakeries, pharmacies, and tech merchants to connect directly with nearby residents.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Local First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By shopping locally, 80%+ of your spend stays within your immediate community, sustaining local entrepreneurs and families.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Hyper-Fast Fulfillment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Zero cross-country shipping delays. Your items come from stores within 2 to 8 kilometers, arriving fresh in 25-45 minutes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Trusted Quality</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every shopkeeper on our platform undergoes verification. You can review shops, check opening hours, and track riders in real-time.
          </p>
        </div>
      </div>

      {/* Story Card */}
      <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">The LocalStore Journey</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          While global conglomerate marketplaces centralized warehouses and eroded local street markets, neighborhood shopkeepers lost foot traffic. LocalStore gives every local merchant an enterprise-grade digital storefront: automated stock management, live map geolocation, and instant customer dispatch without high franchise fees.
        </p>
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
          >
            Start Shopping Local
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20"
          >
            Register Your Store
          </button>
        </div>
      </div>

    </div>
  );
}
