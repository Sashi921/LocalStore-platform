import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  Store, 
  AlertCircle, 
  Search,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OrderTracking({ orderNumber: initialOrderNumber, onNavigate }) {
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber || 'LOC-2026-90435');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const fetchTracking = async (number) => {
    if (!number) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/track/${encodeURIComponent(number.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrderData(data.order);
      } else {
        setOrderData(null);
        showToast(data.message || 'Order not found', 'error');
      }
    } catch (err) {
      showToast('Error tracking order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumberInput(initialOrderNumber);
      fetchTracking(initialOrderNumber);
    } else {
      fetchTracking(orderNumberInput);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracking(orderNumberInput);
  };

  const handleCancelOrder = async () => {
    if (!orderData) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      const res = await authFetch(`/api/orders/${orderData.id}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        showToast('Order cancelled successfully', 'info');
        fetchTracking(orderData.order_number);
      } else {
        showToast(data.message || 'Could not cancel order', 'error');
      }
    } catch (err) {
      showToast('Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const statusIcons = {
    placed: Package,
    confirmed: Clock,
    preparing: Store,
    out_for_delivery: Truck,
    delivered: CheckCircle2,
    cancelled: XCircle
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Live Order Tracking</h1>
          <p className="text-xs text-slate-500">Real-time status updates directly from neighborhood stores</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Order # (e.g. LOC-2026-90435)"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
            className="px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-48"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Track
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching real-time dispatch status...</p>
        </div>
      ) : orderData ? (
        <div className="space-y-6">
          
          {/* Main Status Timeline Card */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
            
            {/* Top Order Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                  Order Tracking Reference
                </span>
                <h2 className="text-2xl font-mono font-black text-slate-900">{orderData.order_number}</h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(orderData.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                  orderData.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : orderData.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  Status: {orderData.status.replace(/_/g, ' ')}
                </span>

                {['placed', 'confirmed'].includes(orderData.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Visual 5-Stage Timeline */}
            {orderData.status === 'cancelled' ? (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>This order was cancelled. Any items held have been released back to store stock.</span>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {orderData.timeline?.map((step, idx) => {
                    const Icon = statusIcons[step.step] || Package;
                    return (
                      <div
                        key={step.step}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                          step.current
                            ? 'bg-brand-50 border border-brand-200 font-bold scale-105 shadow-xs'
                            : step.completed
                            ? 'text-slate-700'
                            : 'text-slate-300 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs ${
                            step.completed
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">{step.label}</span>
                        {step.current && (
                          <span className="text-[10px] text-brand-600 font-semibold mt-0.5">● Current</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shopkeeper Notes if any */}
            {orderData.shopkeeper_notes && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-0.5">Note from Merchant:</strong>
                <span>"{orderData.shopkeeper_notes}"</span>
              </div>
            )}

          </div>

          {/* Store & Delivery Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Information */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-hidden">
                  <img src={orderData.shop_logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{orderData.shop_name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-600" />
                    <span>{orderData.shop_address}</span>
                  </div>
                </div>
              </div>

              {orderData.shop_phone && (
                <div className="pt-2">
                  <a
                    href={`tel:${orderData.shop_phone}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span>Call Store: {orderData.shop_phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Delivery Destination */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-slate-700 font-medium">{orderData.delivery_address}</p>
              <p className="text-slate-400 font-mono">{orderData.delivery_city} • PIN {orderData.delivery_pincode}</p>
              <p className="text-slate-600">Contact: {orderData.delivery_phone}</p>
              {orderData.customer_notes && (
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500 mt-2">
                  <strong>Instructions:</strong> {orderData.customer_notes}
                </div>
              )}
            </div>

          </div>

          {/* Ordered Items Breakdown */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ordered Products</h3>
            <div className="divide-y divide-slate-100">
              {orderData.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product_image} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                    <div>
                      <div className="font-bold text-slate-800">{item.product_name}</div>
                      <div className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{item.total_price}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Grand Total</span>
              <span>₹{orderData.total}</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Order not found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Please verify the order reference number (e.g. LOC-2026-90412) or check your order history.
          </p>
        </div>
      )}

    </div>
  );
}
