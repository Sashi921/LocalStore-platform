import React, { useState } from 'react';
import { Store, User, Lock, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState('customer'); // 'customer' | 'shopkeeper'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');

  // Shopkeeper extra fields
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Groceries & Staples');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPincode, setShopPincode] = useState('110001');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Name, email and password are required', 'error');
      return;
    }

    if (role === 'shopkeeper' && !shopName) {
      showToast('Please provide your Store Name', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
        address,
        city,
        pincode,
        shopName: role === 'shopkeeper' ? shopName : undefined,
        shopCategory: role === 'shopkeeper' ? shopCategory : undefined,
        shopAddress: role === 'shopkeeper' ? (shopAddress || address) : undefined,
        shopPincode: role === 'shopkeeper' ? (shopPincode || pincode) : undefined
      });

      showToast(`Welcome to LocalStore, ${res.user.name}!`, 'success');
      if (role === 'shopkeeper') {
        onNavigate('shopkeeper-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create LocalStore Account</h1>
        <p className="text-xs text-slate-500">Shop from local businesses or start selling to nearby customers</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'customer'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>I am a Customer</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('shopkeeper')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'shopkeeper'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>I am a Local Shopkeeper</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {role === 'shopkeeper' ? 'Owner / Merchant Full Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Shopkeeper Specific Fields */}
          {role === 'shopkeeper' && (
            <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-200/80 space-y-3 animate-fade-in">
              <div className="font-bold text-brand-900 text-xs flex items-center gap-1.5">
                <Store className="w-4 h-4 text-brand-600" />
                <span>Store Registration Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Store / Shop Name *</label>
                  <input
                    type="text"
                    required={role === 'shopkeeper'}
                    placeholder="e.g. Green Valley Fresh Mart"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Category</label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-200 rounded-xl focus:outline-none"
                  >
                    <option value="Groceries & Staples">Groceries & Staples</option>
                    <option value="Bakery & Patisserie">Bakery & Patisserie</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Pharmacy & Wellness">Pharmacy & Wellness</option>
                    <option value="Dairy & Beverages">Dairy & Beverages</option>
                    <option value="Spices & Dry Fruits">Spices & Dry Fruits</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Store Street Address</label>
                  <input
                    type="text"
                    placeholder="Shop 14, Main Market, Connaught Place"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full p-2 bg-white border border-brand-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Store PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="110001"
                    value={shopPincode}
                    onChange={(e) => setShopPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2 bg-white border border-brand-200 rounded-xl focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Location */}
          {role === 'customer' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Default Delivery Address</label>
                <input
                  type="text"
                  placeholder="Apartment, Street name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="110001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Registering Account...' : role === 'shopkeeper' ? 'Register Store & Open Dashboard' : 'Create Customer Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-brand-600 hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>

    </div>
  );
}
