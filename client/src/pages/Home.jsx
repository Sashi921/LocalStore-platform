import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Search,
  CheckCircle,
  Truck
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ShopCard from '../components/ShopCard';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

export default function Home({ onNavigate }) {
  const { location, setIsModalOpen } = useLocation();
  const { demoLogin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load categories
        const catRes = await fetch('/api/products/categories');
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.categories);

        // Load featured products
        const prodRes = await fetch('/api/products?limit=8&sort=popularity');
        const prodData = await prodRes.json();
        if (prodData.success) setFeaturedProducts(prodData.products);

        // Load nearby shops with location lat/lng
        const shopRes = await fetch(`/api/shops?lat=${location.lat}&lng=${location.lng}&limit=4`);
        const shopData = await shopRes.json();
        if (shopData.success) setNearbyShops(shopData.shops);

        // Load active coupons
        const coupRes = await fetch('/api/coupons');
        const coupData = await coupRes.json();
        if (coupData.success) setCoupons(coupData.coupons);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [location]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-8 pb-14 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 text-brand-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>DIRECT FROM YOUR NEIGHBORHOOD MERCHANTS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Fresh, Authentic & <span className="text-brand-600">Delivered in 30 Mins</span> from Local Stores.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Discover organic produce, bakery delights, electronics and medicines from trusted shops right around your street. Supporting local retailers has never been this easy!
              </p>

              {/* Delivery Locality Pill */}
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Current Delivery Neighborhood</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate max-w-xs">{location.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  Change PIN
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 flex items-center gap-2"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('shops')}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 transition-all shadow-xs flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-brand-600" />
                  <span>Find Stores on Map</span>
                </button>
              </div>

              {/* Quick Demo Credentials Access Notice for Reviewers */}
              <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-600">Quick Test:</span>
                <button onClick={() => demoLogin('customer')} className="text-brand-600 hover:underline font-medium">Customer Demo</button>
                <span>•</span>
                <button onClick={() => demoLogin('shopkeeper')} className="text-brand-600 hover:underline font-medium">Shopkeeper Demo</button>
                <span>•</span>
                <button onClick={() => demoLogin('admin')} className="text-brand-600 hover:underline font-medium">Admin Demo</button>
              </div>

            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                    alt="Fresh Local Mart"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-5 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                          98%
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Satisfied Neighbors</div>
                          <div className="text-xs text-slate-400">Over 1,200 local orders fulfilled this month</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        ⚡ 25 Min Avg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Highlights */}
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Order by 9 PM</div>
                    <div className="text-xs font-bold text-slate-900">Same-Day Delivery</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Verified Quality</div>
                    <div className="text-xs font-bold text-slate-900">100% Genuine Items</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Active Discount Coupons Carousel */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-700 text-white shadow-md flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                    Special Offer
                  </span>
                  <div className="text-lg font-black mt-1">{c.discount_percent}% OFF</div>
                  <div className="text-xs text-white/80">Code: <span className="font-mono font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">{c.code}</span></div>
                </div>
                <div className="text-right text-xs">
                  <span className="block text-white/80">Min Order</span>
                  <span className="font-bold">₹{c.min_order_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Icons Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Explore by Category</h2>
            <p className="text-xs text-slate-500">Pick from our freshly stocked neighborhood sections</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500 hover:shadow-lg cursor-pointer transition-all text-center flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {cat.product_count} items
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Local Stores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Nearby Neighborhood Stores</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                Around PIN {location.pincode}
              </span>
            </div>
            <p className="text-xs text-slate-500">Handpicked registered shops delivering to your location</p>
          </div>
          <button
            onClick={() => onNavigate('shops')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View on Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Trending Neighborhood Products</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular Today
              </span>
            </div>
            <p className="text-xs text-slate-500">Fast-selling items from verified local shops</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Shopkeeper Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 text-xs font-extrabold rounded-full border border-brand-500/30">
              GROW YOUR LOCAL BUSINESS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Are you a local shopkeeper? Start selling on LocalStore.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Reach thousands of nearby residents, receive daily orders, update stock seamlessly and grow your store revenue with zero technical hassle.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-brand-500/30"
              >
                Register Your Shop
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors border border-white/20"
              >
                Learn How It Works
              </button>
            </div>
          </div>
          <div className="absolute right-6 -bottom-10 opacity-10 sm:opacity-20 pointer-events-none">
            <Store className="w-96 h-96" />
          </div>
        </div>
      </section>

    </div>
  );
}
