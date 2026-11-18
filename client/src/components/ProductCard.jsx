import React from 'react';
import { Star, ShoppingBag, Heart, Layers, Store, Check, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

export default function ProductCard({ product, onNavigate }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isCompared } = useCompare();

  const cartItem = items.find(i => i.product_id === product.id);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isCompared(product.id);

  // Discount percentage calculation
  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0 || !product.is_available;
  const isLowStock = !isOutOfStock && product.stock <= (product.low_stock_threshold || 5);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 flex flex-col h-full">
      
      {/* Top Badges & Actions */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-sm tracking-tight">
            {discountPercent}% OFF
          </span>
        )}
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-bold text-[10px] shadow-sm animate-pulse">
            Only {product.stock} left!
          </span>
        ) : null}
      </div>

      {/* Floating Action Buttons (Wishlist & Compare) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
            inWishlist 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
              : 'bg-white/80 text-slate-500 hover:text-rose-600 hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCompare(product);
          }}
          className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
            inCompare 
              ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
              : 'bg-white/80 text-slate-500 hover:text-indigo-600 hover:bg-white'
          }`}
          title={inCompare ? 'Remove from Comparison' : 'Compare product'}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <div 
        onClick={() => onNavigate('product-details', { productId: product.id })}
        className="relative pt-[80%] bg-slate-50 cursor-pointer overflow-hidden"
      >
        <img
          src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Name Tag */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.shop_id) {
                  onNavigate('shop-details', { shopId: product.shop_id });
                }
              }}
              className="text-[11px] font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1 truncate"
            >
              <Store className="w-3 h-3 text-brand-600 shrink-0" />
              <span className="truncate">{product.shop_name || 'Verified Local Shop'}</span>
            </button>

            {product.unit && (
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                {product.unit}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onNavigate('product-details', { productId: product.id })}
            className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-brand-600 cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-xs font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
            </div>
            {product.rating_count > 0 && (
              <span className="text-[11px] text-slate-400">
                ({product.rating_count})
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.price}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.original_price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block font-normal">Inclusive of all taxes</span>
          </div>

          {/* Cart Action */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex items-center bg-brand-50 border border-brand-200 rounded-xl p-0.5">
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-brand-800">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                  disabled={cartItem.quantity >= product.stock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md hover:shadow-brand-500/20 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
