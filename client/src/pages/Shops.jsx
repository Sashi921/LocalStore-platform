import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Search, 
  Map as MapIcon, 
  Grid, 
  SlidersHorizontal,
  Navigation,
  Clock,
  ArrowRight
} from 'lucide-react';
import ShopCard from '../components/ShopCard';
import LeafletMap from '../components/LeafletMap';
import { useLocation } from '../context/LocationContext';

export default function Shops({ onNavigate }) {
  const { location, setIsModalOpen } = useLocation();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch('/api/products/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  // Fetch shops with location
  useEffect(() => {
    async function fetchShops() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (location.lat && location.lng) {
          params.append('lat', location.lat);
          params.append('lng', location.lng);
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (search) {
          params.append('search', search);
        }

        const res = await fetch(`/api/shops?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setShops(data.shops);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchShops, 150);
    return () => clearTimeout(timer);
  }, [location, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nearby Local Stores
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
              {shops.length} Stores Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered neighborhood businesses delivering to PIN <strong className="text-slate-800">{location.pincode}</strong> ({location.name})
          </p>
        </div>

        {/* View Switcher & Change Location */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Change Location</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-brand-600" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row: Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Stores
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === c.name
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search store name or street..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Content View: Grid or Map */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Blue pulsating dot is your delivery PIN center. Green pins are verified stores around you.</span>
            </div>
            <span className="font-bold">OpenStreetMap Powered</span>
          </div>

          <div className="h-[550px] w-full">
            <LeafletMap
              shops={shops}
              center={[location.lat || 28.6328, location.lng || 77.2197]}
              zoom={13}
              onSelectShop={(shop) => onNavigate('shop-details', { shopId: shop.id })}
            />
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                  <div className="w-full h-32 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shops.map((s) => (
                <ShopCard key={s.id} shop={s} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No stores found in this area</h3>
              <p className="text-xs text-slate-500 mt-1">Try switching to Connaught Place (110001) or Karol Bagh (110005) to see active registered shops.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Change Neighborhood
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
