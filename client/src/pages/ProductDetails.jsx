import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Store, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Layers, 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MessageSquare, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ productId, onNavigate }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isCompared } = useCompare();
  const { isAuthenticated, authFetch } = useAuth();
  const { showToast } = useToast();

  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        setProductData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!productData || !productData.product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => onNavigate('products')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to products
        </button>
      </div>
    );
  }

  const { product, reviews, frequently_bought_together, recommendations } = productData;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isCompared(product.id);

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'];

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to submit a review', 'error');
      onNavigate('login');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await authFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          shop_id: product.shop_id,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review submitted! Thank you.', 'success');
        setNewComment('');
        await fetchProduct();
      } else {
        showToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      showToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-brand-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('products', { category: product.category_name })} className="hover:text-brand-600">
          {product.category_name}
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-xl shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx ? 'border-brand-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Shop Header Pill */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('shop-details', { shopId: product.shop_id })}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Store className="w-4 h-4 text-brand-600" />
              <span>{product.shop_name}</span>
              <span className="text-slate-400 font-normal">• {product.shop_pincode}</span>
            </button>

            <span className="text-xs text-brand-700 bg-brand-50 font-semibold px-2.5 py-1 rounded-lg">
              {product.category_name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating & Reviews Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
            </div>
            <span className="text-xs text-slate-400">
              {product.rating_count} verified customer ratings
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-brand-700 font-medium">
              ⚡ {product.sales_count || 10}+ ordered recently
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-base text-slate-400 line-through font-semibold">
                  ₹{product.original_price}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{product.original_price - product.price}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Unit packaging: <strong className="text-slate-700">{product.unit || 'Standard Item'}</strong> • Taxes included
            </p>
          </div>

          {/* Stock Availability */}
          <div>
            {product.stock <= 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                Currently Out of Stock
              </span>
            ) : product.stock <= (product.low_stock_threshold || 5) ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg animate-pulse">
                ⚠️ Only {product.stock} left in store! Order soon.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                <Check className="w-4 h-4" />
                In Stock & Ready for Rapid Local Dispatch
              </span>
            )}
          </div>

          {/* Quantity Selector & Main Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (₹{product.price * quantity})</span>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shrink-0"
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist & Compare Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  inWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => addToCompare(product)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  inCompare
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{inCompare ? 'Comparing Product' : 'Compare Product'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">Local Delivery</div>
                <div className="text-[11px] text-slate-400">Within 30-45 mins from dispatch</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">Direct From Merchant</div>
                <div className="text-[11px] text-slate-400">Fresh quality guaranteed</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequently_bought_together && frequently_bought_together.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Frequently Bought Together</h2>
            <p className="text-xs text-slate-500">Popular items ordered along with this product from {product.shop_name}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {frequently_bought_together.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Similar Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">More From Nearby Stores</h2>
            <p className="text-xs text-slate-500">Related items in {product.category_name}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews & Ratings Section */}
      <section className="pt-8 border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Review Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Write a Customer Review</h3>
            <p className="text-xs text-slate-500">Share your shopping experience with nearby neighbors</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Review Feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How was the product quality and packaging? Would you recommend it?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Customer Reviews ({reviews.length})</h3>

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-xs space-y-2">
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
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No reviews yet for this product. Be the first to review!</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
