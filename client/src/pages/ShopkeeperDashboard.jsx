import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Store, 
  Plus, 
  ArrowRight,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ShopkeeperDashboard({ onNavigate }) {
  const { authFetch, user, shop } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          authFetch('/api/shopkeeper/stats'),
          authFetch('/api/shopkeeper/analytics')
        ]);
        const statsData = await statsRes.json();
        const analyticsData = await analyticsRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (analyticsData.success) setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error loading shopkeeper dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading merchant analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              Merchant Control Hub
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-700">{shop?.name || 'Local Store'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Store Performance & Orders
          </h1>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('shopkeeper-products')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Products</span>
          </button>

          <button
            onClick={() => onNavigate('shopkeeper-orders')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Orders ({stats?.pending_orders || 0})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{stats?.total_revenue?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {stats?.total_orders || 0} customer orders</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{stats?.today_revenue?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats?.today_orders || 0} orders placed today
          </div>
        </div>

        {/* Pending Orders Action */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats?.pending_orders || 0}
          </div>
          <button
            onClick={() => onNavigate('shopkeeper-orders')}
            className="text-[11px] font-bold text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>Process live orders</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {stats?.low_stock_count || 0}
          </div>
          <button
            onClick={() => onNavigate('shopkeeper-products')}
            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span>Restock inventory</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Analytics Charts & Best Sellers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Analytics (Last 7 Days)</h2>
              <p className="text-xs text-slate-500">Daily earnings fulfilled by your shop</p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
              Live Store Data
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {analytics?.charts?.daily ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.charts.daily}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(val) => [`₹${val}`, 'Daily Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Right: Best Selling Products */}
        <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Top Selling Products</h2>
            <p className="text-xs text-slate-500">Highest volume items</p>
          </div>

          {analytics?.charts?.top_products && analytics.charts.top_products.length > 0 ? (
            <div className="space-y-3">
              {analytics.charts.top_products.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[130px]">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">{item.total_units_sold} units sold</div>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">₹{item.total_earned}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">New store: sales will appear here as orders are delivered.</p>
          )}
        </div>

      </div>

      {/* Low Stock Alerts Section */}
      {analytics?.low_stock_alerts && analytics.low_stock_alerts.length > 0 && (
        <div className="p-6 bg-amber-50/70 rounded-3xl border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Low-Stock Inventory Warnings ({analytics.low_stock_alerts.length})</span>
            </div>
            <button
              onClick={() => onNavigate('shopkeeper-products')}
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              Update stock quantities
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analytics.low_stock_alerts.map((alert) => (
              <div key={alert.id} className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img src={alert.thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 truncate">{alert.name}</div>
                    <div className="text-rose-600 font-bold text-[11px]">Only {alert.stock} left in stock</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('shopkeeper-products')}
                  className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-[10px] shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
