import React from 'react';
import { Store, ShieldCheck, Zap, Truck, HeartHandshake, PhoneCall, Mail } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Platform Value Proposition Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Real Local Shops</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from verified neighborhood merchants</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express 30-Min Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ultra-fast local delivery straight to your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Items</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fresh produce, authentic spices & trusted brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Empower Local Economy</h4>
              <p className="text-xs text-slate-400 mt-0.5">Every purchase helps your neighborhood vendors thrive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        
        {/* Brand Info */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Local<span className="text-brand-400">Store</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            LocalStore bridges the gap between beloved neighborhood retailers and nearby residents. Discover fresh produce, sourdough loaves, tech gadgets, and daily medicines delivered within minutes.
          </p>

          <div className="mt-6 flex flex-col gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-brand-400" />
              <span>Customer Helpline: +91 11 4000 8800 (8 AM - 10 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400" />
              <span>support@localstore.market</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Shop by Category</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><button onClick={() => onNavigate('products', { category: 'Groceries & Staples' })} className="hover:text-white transition-colors">Organic Groceries</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'Bakery & Patisserie' })} className="hover:text-white transition-colors">Artisan Bakery</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'Electronics & Gadgets' })} className="hover:text-white transition-colors">Tech Accessories</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'Pharmacy & Wellness' })} className="hover:text-white transition-colors">Pharmacy & First Aid</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'Spices & Dry Fruits' })} className="hover:text-white transition-colors">Spices & Dry Fruits</button></li>
          </ul>
        </div>

        {/* For Shopkeepers */}
        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">For Shopkeepers</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><button onClick={() => onNavigate('register')} className="hover:text-white transition-colors">Register Your Store</button></li>
            <li><button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">Merchant Portal Login</button></li>
            <li><button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">Merchant Growth Guide</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Local Merchant Stories</button></li>
          </ul>
        </div>

        {/* Support & Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Customer Support</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><button onClick={() => onNavigate('orders')} className="hover:text-white transition-colors">Track Your Order</button></li>
            <li><button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">Help Center & FAQs</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">File a Complaint / Ticket</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About LocalStore</button></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 LocalStore Marketplace Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Safeguards</span>
        </div>
      </div>
    </footer>
  );
}
