import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Check, 
  ArrowRight, 
  Store, 
  Plus, 
  Lock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';

export default function Checkout({ onNavigate, onOrderSuccess }) {
  const { items, subtotal, deliveryFee, discountAmount, total, coupon, clearCart } = useCart();
  const { user, isAuthenticated, authFetch, demoLogin } = useAuth();
  const { showToast } = useToast();
  const { location } = useLocation();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Address fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [streetAddress, setStreetAddress] = useState(user?.address || 'Flat 302, Regency Apartments, KG Marg');
  const [city, setCity] = useState(user?.city || 'New Delhi');
  const [pincode, setPincode] = useState(location.pincode || '110001');

  // Online card demo fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      authFetch('/api/auth/addresses')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.addresses.length > 0) {
            setAddresses(data.addresses);
            setSelectedAddressId(data.addresses[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in or use customer demo login to complete order', 'error');
      return;
    }

    let finalAddress = streetAddress;
    let finalPhone = phone;
    let finalCity = city;
    let finalPincode = pincode;

    if (selectedAddressId !== 'new') {
      const selected = addresses.find(a => a.id === selectedAddressId);
      if (selected) {
        finalAddress = selected.street_address;
        finalPhone = selected.phone;
        finalCity = selected.city;
        finalPincode = selected.pincode;
      }
    }

    if (!finalAddress || !finalPhone || !finalPincode) {
      showToast('Delivery address, phone number and PIN code are required', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          delivery_address: finalAddress,
          delivery_city: finalCity,
          delivery_pincode: finalPincode,
          delivery_phone: finalPhone,
          payment_method: paymentMethod,
          coupon_code: coupon ? coupon.code : null,
          customer_notes: customerNotes
        })
      });

      const data = await res.json();

      if (data.success) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        showToast('Order placed successfully! Thank you.', 'success');
        clearCart();
        onOrderSuccess(data.order);
      } else {
        showToast(data.message || 'Failed to place order', 'error');
      }
    } catch (err) {
      showToast('Error communicating with order server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <button
          onClick={() => onNavigate('products')}
          className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Return to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Checkout & Delivery</h1>
        <p className="text-xs text-slate-500 mt-1">Confirm your delivery details and choose a payment method</p>
      </div>

      {/* Guest Warning & 1-Click Demo Login Banner */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">Sign in to complete checkout</h4>
              <p className="text-[11px] text-amber-700">Login to save your delivery addresses and track live orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => demoLogin('customer')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              ⚡ 1-Click Customer Login
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-amber-200"
            >
              Standard Login
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Delivery Address */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
              </div>
            </div>

            {/* Saved Addresses Radio List */}
            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-700">Choose from saved addresses:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`p-3.5 rounded-2xl border cursor-pointer text-xs flex flex-col justify-between transition-colors ${
                        selectedAddressId === a.id
                          ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{a.label || 'Home'}</span>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="accent-brand-600"
                        />
                      </div>
                      <div className="text-slate-600 leading-snug">{a.street_address}</div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono">{a.city} • PIN {a.pincode}</div>
                    </label>
                  ))}
                  
                  {/* Option to enter a new address */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer text-xs flex items-center gap-2 ${
                      selectedAddressId === 'new'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                      className="accent-brand-600"
                    />
                    <span>Enter a different address below</span>
                  </label>
                </div>
              </div>
            )}

            {/* Address Input Form */}
            {selectedAddressId === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address / House No. / Landmark</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Delivery Notes for Shopkeeper / Rider (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ring bell twice, leave with security guard, call when nearby"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Section 2: Payment Mode */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-950 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold">Cash on Delivery</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-brand-600"
                  />
                </div>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Pay cash or scan QR code when your local store delivery rider arrives.
                </p>
              </label>

              {/* Demo Online Payment */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'online'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-950 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <span className="text-sm font-bold">Demo Online Payment</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="accent-brand-600"
                  />
                </div>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Instant simulated UPI / Cards payment with demo authorization.
                </p>
              </label>

            </div>

            {/* Online payment demo card view */}
            {paymentMethod === 'online' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Simulated Card / UPI Gateway</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">Test Mode Sandbox</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block font-mono">CARD NUMBER</label>
                    <input
                      type="text"
                      disabled
                      value={cardNumber}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-200 p-2 rounded-lg text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">EXP / CVV</label>
                    <input
                      type="text"
                      disabled
                      value={`${cardExpiry} • ${cardCvv}`}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-200 p-2 rounded-lg text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Review & Confirmation Button */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900">Items in Order ({items.length})</h2>

            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img src={i.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-100" />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">{i.name}</div>
                      <div className="text-[10px] text-slate-400">Qty: {i.quantity} × ₹{i.price}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Store Delivery Fee</span>
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({coupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Payable</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              {submitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Place Order (₹{total})</span>
                </>
              )}
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Guaranteed Neighborhood Delivery</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
