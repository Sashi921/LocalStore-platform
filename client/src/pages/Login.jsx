import React, { useState } from 'react';
import { Store, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login({ onNavigate }) {
  const { login, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      
      if (res.user.role === 'shopkeeper') {
        onNavigate('shopkeeper-dashboard');
      } else if (res.user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      setLoading(true);
      const res = await demoLogin(role);
      showToast(`Logged in as ${role.toUpperCase()}: ${res.user.name}`, 'success');
      if (role === 'shopkeeper') {
        onNavigate('shopkeeper-dashboard');
      } else if (role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-fade-in">
      
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to LocalStore</h1>
        <p className="text-xs text-slate-500">Access your local orders, store dashboard, or customer profile</p>
      </div>

      {/* 1-Click Demo Login Box (For instant testing) */}
      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Quick 1-Click Demo Access</span>
        </div>
        <p className="text-[11px] text-emerald-700">Click below to test any role instantly with pre-populated data:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('customer')}
            className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors shadow-2xs"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('shopkeeper')}
            className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors shadow-2xs"
          >
            Shopkeeper
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors shadow-2xs"
          >
            Admin
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-brand-600 hover:underline"
          >
            Register Now
          </button>
        </div>
      </div>

    </div>
  );
}
