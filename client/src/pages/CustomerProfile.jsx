import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Plus, Trash2, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CustomerProfile({ onNavigate }) {
  const { user, authFetch, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'New Delhi');
  const [pincode, setPincode] = useState(user?.pincode || '110001');
  const [address, setAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newPincode, setNewPincode] = useState('110001');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await authFetch('/api/auth/addresses');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, city, pincode, address })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Profile updated successfully', 'success');
        await refreshProfile();
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/auth/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label: newLabel,
          full_name: newFullName,
          phone: newPhone,
          street_address: newStreet,
          city: city || 'New Delhi',
          pincode: newPincode,
          is_default: addresses.length === 0 ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Address added to your address book', 'success');
        setIsAddingAddress(false);
        setNewStreet('');
        await fetchAddresses();
      }
    } catch (e) {
      showToast('Error adding address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await authFetch(`/api/auth/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Address removed', 'info');
        await fetchAddresses();
      }
    } catch (e) {
      showToast('Error deleting address', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Customer Account & Addresses</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your personal credentials, contact info, and delivery destinations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Profile Info Form */}
        <div className="md:col-span-6 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
              <span className="text-[10px] text-slate-400 font-mono">Role: {user?.role?.toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-colors mt-2"
            >
              {savingProfile ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Address Book */}
        <div className="md:col-span-6 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Saved Addresses</h2>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {/* Add Address Form Toggle */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Recipient Name"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <input
                type="text"
                placeholder="Street address / Flat No."
                required
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="PIN code"
                  required
                  maxLength={6}
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1 bg-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-brand-600 text-white rounded-lg font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* Addresses list */}
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.label || 'Home'}</span>
                    {a.is_default ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-100 text-brand-800">Default</span>
                    ) : null}
                  </div>
                  <div className="text-slate-600 mt-1 leading-snug">{a.street_address}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{a.city} • PIN {a.pincode} • {a.phone}</div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(a.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
