import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  ArrowLeft,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ShopkeeperOrders({ onNavigate }) {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [noteInputs, setNoteInputs] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = selectedStatus === 'all' 
        ? '/api/shopkeeper/orders' 
        : `/api/shopkeeper/orders?status=${selectedStatus}`;
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const note = noteInputs[orderId] || '';
      const res = await authFetch(`/api/shopkeeper/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, shopkeeper_notes: note })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to "${newStatus.replace(/_/g, ' ')}"`, 'success');
        await fetchOrders();
      } else {
        showToast(data.message || 'Status update failed', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const statuses = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: 'New Orders' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'out_for_delivery', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <button
            onClick={() => onNavigate('shopkeeper-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept orders, update preparation stages, and dispatch riders
          </p>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                selectedStatus === s.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading store orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <span className="font-mono font-extrabold text-slate-900 text-base">{o.order_number}</span>
                    <div className="text-xs text-slate-400">
                      Ordered: {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                    o.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : o.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold uppercase">
                    {o.payment_method} ({o.payment_status})
                  </span>
                </div>
              </div>

              {/* Middle Section: Customer Info & Items */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                
                {/* Customer Details */}
                <div className="md:col-span-4 p-4 bg-slate-50 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    <span>{o.customer_name}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{o.delivery_phone}</span>
                  </div>
                  <div className="text-slate-600 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{o.delivery_address}, {o.delivery_city} - {o.delivery_pincode}</span>
                  </div>
                  {o.customer_notes && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200/60 text-slate-500 mt-2">
                      <strong>Customer note:</strong> "{o.customer_notes}"
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="md:col-span-8 space-y-2">
                  <div className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Ordered Products ({o.items?.length || 0})
                  </div>
                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {o.items?.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={item.product_image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <span className="font-bold text-slate-800">{item.product_name}</span>
                            <span className="text-slate-400 text-[11px] block">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900 text-sm">
                    <span>Order Value</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>

              </div>

              {/* Status Action Buttons & Notes */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Add dispatch note (e.g. Rider Rahul on scooter, packed fresh)..."
                    value={noteInputs[o.id] || ''}
                    onChange={(e) => setNoteInputs({ ...noteInputs, [o.id]: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {o.status === 'placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'confirmed')}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        Accept & Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'cancelled')}
                        className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {o.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'preparing')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Start Preparing & Packaging
                    </button>
                  )}

                  {o.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'out_for_delivery')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch for Delivery</span>
                    </button>
                  )}

                  {o.status === 'out_for_delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'delivered')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered & Paid</span>
                    </button>
                  )}

                  {['delivered', 'cancelled'].includes(o.status) && (
                    <span className="text-xs text-slate-400 font-semibold italic">
                      Order closed
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-400">Orders placed by customers will appear here in real-time.</p>
        </div>
      )}

    </div>
  );
}
