import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  MapPin, 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  ChevronDown, 
  LogOut, 
  Package, 
  LayoutDashboard, 
  ShieldCheck, 
  Menu, 
  X,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocation } from '../context/LocationContext';
import { useCompare } from '../context/CompareContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { location, setIsModalOpen } = useLocation();
  const { comparedProducts, setIsOpen: setCompareOpen } = useCompare();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (e) {
        console.error(e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (item.type === 'product') {
      onNavigate('product-details', { productId: item.id });
    } else if (item.type === 'shop') {
      onNavigate('shop-details', { shopId: item.id });
    } else if (item.type === 'category') {
      onNavigate('products', { category: item.slug });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">LOCAL PROMISE</span>
            <span>Supporting neighborhood stores. 100% Genuine items delivered in under 45 mins!</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('shops')} className="hover:underline flex items-center gap-1">
              Find Stores on Map
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('help')} className="hover:underline">
              Help & Support
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Local<span className="text-brand-600">Store</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                  Neighborhood Mart
                </span>
              </div>
            </button>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden lg:flex items-center gap-2 pl-3 pr-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs font-medium text-slate-700 transition-colors border border-slate-200/70"
              title="Click to change your delivery location"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <div className="text-left max-w-[150px] truncate">
                <span className="text-slate-400 text-[10px] block leading-none font-normal">Deliver to:</span>
                <span className="font-semibold text-slate-800 truncate block leading-tight">{location.name.split(',')[0]}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Search Bar with live autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-2 hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, groceries, electronics or local shops..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="p-2 border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                        <div className="text-xs text-slate-400 capitalize">
                          {item.type} {item.price ? `• ₹${item.price}` : ''} {item.category ? `• ${item.category}` : ''}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Compare Floating Button (if items selected) */}
            {comparedProducts.length > 0 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                title="Compare Selected Products"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline">Compare</span>
                <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {comparedProducts.length}
                </span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold">Cart</span>
            </button>

            {/* User Account Dropdown */}
            <div ref={dropdownRef} className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in divide-y divide-slate-100">
                      <div className="px-4 py-2.5">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                        <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-brand-50 text-brand-700">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('profile');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile & Addresses
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('orders');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          My Orders & Tracking
                        </button>
                      </div>

                      {/* Role Specific Navigation */}
                      {(role === 'shopkeeper' || role === 'admin') && (
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('shopkeeper-dashboard');
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-brand-700 hover:bg-brand-50 flex items-center gap-2 font-semibold"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-600" />
                            Shopkeeper Portal
                          </button>
                        </div>
                      )}

                      {role === 'admin' && (
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('admin-dashboard');
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            Admin Control Center
                          </button>
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            onNavigate('home');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Subnav Category Bar */}
      <div className="bg-slate-50 border-t border-slate-200/60 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs py-2 overflow-x-auto gap-6 scrollbar-none font-medium text-slate-600">
            <div className="flex items-center gap-6 shrink-0">
              <button 
                onClick={() => onNavigate('products', { category: 'all' })}
                className={`hover:text-brand-600 transition-colors ${currentPage === 'products' ? 'text-brand-600 font-bold' : ''}`}
              >
                All Products
              </button>
              <button 
                onClick={() => onNavigate('products', { category: 'Groceries & Staples' })}
                className="hover:text-brand-600 transition-colors"
              >
                Groceries & Staples
              </button>
              <button 
                onClick={() => onNavigate('products', { category: 'Bakery & Patisserie' })}
                className="hover:text-brand-600 transition-colors"
              >
                Fresh Bakery
              </button>
              <button 
                onClick={() => onNavigate('products', { category: 'Electronics & Gadgets' })}
                className="hover:text-brand-600 transition-colors"
              >
                Electronics
              </button>
              <button 
                onClick={() => onNavigate('products', { category: 'Pharmacy & Wellness' })}
                className="hover:text-brand-600 transition-colors"
              >
                Pharmacy
              </button>
              <button 
                onClick={() => onNavigate('shops')}
                className={`hover:text-brand-600 flex items-center gap-1 transition-colors ${currentPage === 'shops' ? 'text-brand-600 font-bold' : ''}`}
              >
                <Store className="w-3.5 h-3.5 text-brand-600" />
                Explore Nearby Shops
              </button>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-slate-500">
              <button onClick={() => onNavigate('about')} className="hover:text-brand-600">About Us</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-brand-600">Contact</button>
              <button onClick={() => onNavigate('help')} className="hover:text-brand-600">Help Center</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products or shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Location button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Deliver to: {location.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <div className="space-y-1 text-sm font-medium text-slate-700">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('products'); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Browse Products
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('shops'); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-brand-600" />
              Nearby Shops Map
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('cart'); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="bg-brand-100 text-brand-800 text-xs px-2 py-0.5 rounded-full font-bold">{itemCount}</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Wishlist</span>
              <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('orders'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  My Orders
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  My Profile
                </button>
                {(role === 'shopkeeper' || role === 'admin') && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('shopkeeper-dashboard'); }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-brand-50 text-brand-700 font-semibold"
                  >
                    Shopkeeper Dashboard
                  </button>
                )}
                {role === 'admin' && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('admin-dashboard'); }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-semibold"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); onNavigate('home'); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                  className="flex-1 py-2 text-center text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('register'); }}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-brand-600 text-white rounded-xl"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
