import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Star, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ShopDetails({ shopId, onNavigate }) {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchShop() {
      try {
        setLoading(true);
        const res = await fetch(`/api/shops/${shopId}`);
        const data = await res.json();
        if (data.success) {
          setShopData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [shopId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 text-sm">Loading store details...</p>
      </div>
    );
  }

  if (!shopData || !shopData.shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Shop not found</h2>
        <button
          onClick={() => onNavigate('shops')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to stores
        </button>
      </div>
    );
  }

  const { shop, products, reviews } = shopData;

  const categories = ['all', ...new Set(products.map(p => p.category_name))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_name === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('shops')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all shops</span>
      </button>

      {/* Shop Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md">
        <div className="h-48 sm:h-64 w-full relative">
          <img
            src={shop.banner || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200'}
            alt={shop.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
        </div>

        {/* Shop Info Overlay */}
        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-start sm:items-end gap-5">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-white shrink-0 overflow-hidden">
              <img
                src={shop.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                alt={shop.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1.5 text-white">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wide">
                  {shop.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                  shop.is_open_now ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                }`}>
                  {shop.is_open_now ? '● Open Now' : '● Closed'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight">{shop.name}</h1>
              
              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  {shop.address}, {shop.pincode}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  {shop.opening_time} - {shop.closing_time}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-xs shrink-0">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 font-bold text-amber-400 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{shop.rating?.toFixed(1) || '4.8'}</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">{shop.rating_count || 10} ratings</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="font-bold text-white text-sm">₹{shop.delivery_fee}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Delivery Fee</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="font-bold text-white text-sm">{products.length}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Store Catalog</h2>
            <p className="text-xs text-slate-500">Available items dispatched directly from {shop.name}</p>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                  selectedCategory === c
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c === 'all' ? 'All Items' : c}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Customer Store Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="pt-8 border-t border-slate-200/80 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Store Reviews & Feedback ({reviews.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-800">{r.user_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
