import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Store, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Cart({ onNavigate }) {
  const { 
    items, 
    subtotal, 
    deliveryFee, 
    discountAmount, 
    total, 
    coupon, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const { showToast } = useToast();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
    setCouponInput('');
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Your shopping cart is empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Explore fresh groceries, bakery treats, electronics, or wellness essentials from local neighborhood stores.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          Explore Local Products
        </button>
      </div>
    );
  }

  const primaryShopName = items[0]?.shop_name || 'Local Neighborhood Store';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-brand-600" />
            <span>Ordering from: <strong className="text-slate-800">{primaryShopName}</strong></span>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Unit: {item.unit || 'Item'} • ₹{item.price} each
                  </div>
                  {item.is_out_of_stock ? (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Out of stock
                    </span>
                  ) : item.stock <= 5 ? (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-1">
                      Only {item.stock} left in store
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Quantity Stepper & Price */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900 text-base">
                    ₹{item.price * item.quantity}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {/* Quick Coupons Selection */}
          <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Available Discount Coupons</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'WELCOME50', label: '50% OFF (Up to ₹150)' },
                { code: 'LOCAL10', label: '10% Instant Off' },
                { code: 'FESTIVE25', label: '25% Special Savings' }
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleApplyCoupon(c.code)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="font-mono">{c.code}</span>
                  <span className="text-[10px] text-emerald-600 font-normal">({c.label})</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Have a coupon code?</label>
              {coupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Applied: {coupon.code}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={applying}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Store Delivery Fee</span>
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Grand Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Assurance Note */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe payments via Cash on Delivery or Secure Online Gateway</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
