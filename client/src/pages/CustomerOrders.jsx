import React, { useState, useEffect } from 'react';
import { Package, Clock, Store, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function CustomerOrders({ onNavigate }) {
  const { authFetch, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await authFetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  const handleReorder = async (order) => {
    for (const item of order.items) {
      await addToCart({ id: item.product_id, name: item.product_name, price: item.price, stock: 50, thumbnail: item.product_image }, item.quantity);
    }
    showToast('Items added to cart', 'success');
    onNavigate('cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Sign in to view orders</h2>
        <p className="text-xs text-slate-500 mt-1">Please log in to your account to view your past orders and live tracking.</p>
        <button
          onClick={() => onNavigate('login')}
          className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">No orders placed yet</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Start ordering from neighborhood stores to get fast 30-minute delivery.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          Explore Local Stores
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders & Purchases</h1>
        <p className="text-xs text-slate-500 mt-1">{orders.length} orders placed</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <span className="font-mono font-extrabold text-brand-700 text-sm">{o.order_number}</span>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ordered on {new Date(o.created_at).toLocaleDateString()} from <strong>{o.shop_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                  o.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : o.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-black text-slate-900">₹{o.total}</span>
              </div>
            </div>

            {/* Items preview */}
            <div className="space-y-2">
              {o.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <img src={item.product_image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                    <div>
                      <span className="font-bold text-slate-800">{item.product_name}</span>
                      <span className="text-slate-400 text-[10px] block">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{item.total_price}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono">Paid via {o.payment_method.toUpperCase()}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReorder(o)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Buy Again
                </button>
                <button
                  onClick={() => onNavigate('order-tracking', { orderNumber: o.order_number })}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-1"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
