import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist({ onNavigate }) {
  const { items } = useWishlist();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Your wishlist is empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Save your favorite local products, bakery items, or gadgets to order later in one click.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          Discover Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Wishlist & Favorites</h1>
        <p className="text-xs text-slate-500 mt-1">{items.length} saved products</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id || p.product_id} product={p} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}
