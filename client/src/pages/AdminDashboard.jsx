import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  TrendingUp, 
  Search,
  MessageSquare,
  Package,
  Layers,
  ArrowRight
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

export default function AdminDashboard({ onNavigate }) {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'shops' | 'users' | 'orders' | 'tickets'
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [shops, setShops] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ticket reply modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [ticketStatus, setTicketStatus] = useState('resolved');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, shopsRes, usersRes, ordersRes, ticketsRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/admin/analytics'),
        authFetch('/api/admin/shops'),
        authFetch('/api/admin/users'),
        authFetch('/api/admin/orders'),
        authFetch('/api/admin/tickets')
      ]);

      const [statsData, analyticsData, shopsData, usersData, ordersData, ticketsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        shopsRes.json(),
        usersRes.json(),
        ordersRes.json(),
        ticketsRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (analyticsData.success) setAnalytics(analyticsData.charts);
      if (shopsData.success) setShops(shopsData.shops);
      if (usersData.success) setUsersList(usersData.users);
      if (ordersData.success) setOrders(ordersData.orders);
      if (ticketsData.success) setTickets(ticketsData.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateShopStatus = async (shopId, status) => {
    try {
      const res = await authFetch(`/api/admin/shops/${shopId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Store status updated to ${status}`, 'success');
        await loadData();
      }
    } catch (e) {
      showToast('Failed to update shop status', 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await authFetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User account status: ${newStatus}`, 'info');
        await loadData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error modifying user', 'error');
    }
  };

  const handleTicketResolve = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      const res = await authFetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: ticketStatus,
          admin_response: adminResponse
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket updated and response sent to customer', 'success');
        setSelectedTicket(null);
        setAdminResponse('');
        await loadData();
      }
    } catch (e) {
      showToast('Failed to update ticket', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading platform administrative console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Admin Panel</span>
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-700">Root Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            LocalStore Platform Administration
          </h1>
        </div>

        {/* Global Stats Mini Counter */}
        <div className="flex items-center gap-4 bg-slate-900 text-white p-3 rounded-2xl text-xs shrink-0 shadow-md">
          <div>
            <div className="text-[10px] text-slate-400">Total GMV</div>
            <div className="font-extrabold text-sm text-emerald-400">₹{stats?.platform_sales?.toLocaleString()}</div>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div>
            <div className="text-[10px] text-slate-400">Total Orders</div>
            <div className="font-extrabold text-sm text-white">{stats?.orders}</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
        {[
          { id: 'overview', label: 'Platform KPIs & Analytics', icon: TrendingUp },
          { id: 'shops', label: `Shops Moderation (${shops.length})`, icon: Store },
          { id: 'users', label: `User Accounts (${usersList.length})`, icon: Users },
          { id: 'orders', label: `Global Orders (${orders.length})`, icon: Package },
          { id: 'tickets', label: `Customer Complaints (${tickets.length})`, icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Customers</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats?.customers}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Shopkeepers</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats?.shopkeepers}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Active Shops</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats?.total_shops}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Products</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats?.products}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Orders</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats?.orders}</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-2xs">
              <span className="text-[11px] text-purple-700 font-bold uppercase block">Open Tickets</span>
              <div className="text-xl sm:text-2xl font-black text-purple-900 mt-1">{stats?.open_tickets}</div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Daily Revenue Chart */}
            <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Platform GMV (Last 7 Days)</h2>
                  <p className="text-xs text-slate-500">Gross transaction volume across all local stores</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  Aggregated
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                {analytics?.daily ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.daily}>
                      <defs>
                        <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip 
                        formatter={(val) => [`₹${val}`, 'Platform GMV']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#7e22ce" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Top Performing Stores */}
            <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Top Performing Stores</h2>
                <p className="text-xs text-slate-500">Leading merchants by gross volume</p>
              </div>

              {analytics?.top_shops?.map((s, idx) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[130px]">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.order_count || 0} orders fulfilled</div>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">₹{s.total_volume || 0}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Shop Management & Approvals */}
      {activeTab === 'shops' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Registered Local Stores ({shops.length})</h2>
            <span className="text-xs text-slate-400">Approve new merchants, suspend violators, view catalog sizes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Store</th>
                  <th className="p-4">Owner Contact</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location / PIN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={s.logo} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-[10px] text-slate-400">{s.city} • Rating {s.rating}★</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{s.owner_name}</div>
                      <div className="text-[10px] text-slate-400">{s.owner_email}</div>
                      <div className="text-[10px] text-slate-400">{s.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-mono">{s.pincode}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{s.address}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        s.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateShopStatus(s.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Approve
                          </button>
                        )}
                        {s.status !== 'suspended' && (
                          <button
                            onClick={() => handleUpdateShopStatus(s.id, 'suspended')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('shop-details', { shopId: s.id })}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                          title="View store as customer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">User Management ({usersList.length})</h2>
            <span className="text-xs text-slate-400">Manage customers and shopkeepers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">City / PIN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'shopkeeper'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">{u.phone || 'N/A'}</td>
                    <td className="p-4 font-mono">{u.city} • {u.pincode}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">All Platform Orders ({orders.length})</h2>
            <span className="text-xs text-slate-400">Real-time marketplace transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-mono font-bold text-brand-700">{o.order_number}</td>
                    <td className="p-4 font-bold text-slate-900">{o.shop_name}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{o.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{o.delivery_phone}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900">₹{o.total}</td>
                    <td className="p-4 uppercase text-[10px] font-bold">{o.payment_method} ({o.payment_status})</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onNavigate('order-tracking', { orderNumber: o.order_number })}
                        className="text-brand-600 hover:underline font-bold"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Customer Complaints & Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Support Complaints & Disputes ({tickets.length})</h2>
              <p className="text-xs text-slate-500">Handle customer complaints against stores or delivery issues</p>
            </div>

            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] rounded">
                          {t.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-slate-400 text-xs">• Ticket #{t.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{t.subject}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong>{t.user_name}</strong> ({t.user_email}) {t.shop_name ? `• Store: ${t.shop_name}` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTicket(t);
                        setAdminResponse(t.admin_response || '');
                        setTicketStatus(t.status || 'resolved');
                      }}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
                    >
                      {t.admin_response ? 'Edit Resolution' : 'Reply & Resolve'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    "{t.description}"
                  </p>

                  {t.admin_response && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                      <strong>Admin Resolution:</strong> "{t.admin_response}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Resolve Complaint #{selectedTicket.id}</h3>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
              <div><strong>Subject:</strong> {selectedTicket.subject}</div>
              <div><strong>Customer Complaint:</strong> "{selectedTicket.description}"</div>
            </div>

            <form onSubmit={handleTicketResolve} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Official Response to Customer</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain resolution, store disciplinary action, or compensation details..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
