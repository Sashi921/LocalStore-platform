import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Star, 
  Check, 
  X,
  PackageX
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Products({ onNavigate, initialCategory = 'all', initialSearch = '' }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedShop, setSelectedShop] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories and shops for filters
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, shopRes] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/shops')
        ]);
        const catData = await catRes.json();
        const shopData = await shopRes.json();
        if (catData.success) setCategories(catData.categories);
        if (shopData.success) setShops(shopData.shops);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedShop && selectedShop !== 'all') params.append('shop_id', selectedShop);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        if (minRating) params.append('min_rating', minRating);
        if (inStockOnly) params.append('in_stock', '1');
        if (sortBy) params.append('sort', sortBy);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchProducts, 150);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedShop, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedShop('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setSortBy('popularity');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Neighborhood Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} products available from local stores
          </p>
        </div>

        {/* Sort & Filter toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            >
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Category
              </label>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedCategory === c.name || selectedCategory === c.slug
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.product_count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Filter */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Local Shop
              </label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="all">All Local Stores</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Customer Rating
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: '4★ and above', val: '4' },
                  { label: '3★ and above', val: '3' },
                  { label: 'Any rating', val: '' }
                ].map((r) => (
                  <label key={r.val} className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(r.val)}
                      className="accent-brand-600"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-brand-600 w-4 h-4 rounded"
                />
                <span>In Stock items only</span>
              </label>
            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                  <div className="w-full h-36 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try loosening your filters, selecting another category, or searching for a different keyword.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
