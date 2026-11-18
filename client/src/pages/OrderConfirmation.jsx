import React from 'react';
import { CheckCircle2, Package, MapPin, ArrowRight, Store, ShoppingBag } from 'lucide-react';

export default function OrderConfirmation({ order, onNavigate }) {
  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">No recent order</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      
      {/* Success Card */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Order Placed Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Thank you for supporting your local neighborhood store! The shopkeeper has received your order and will start packing immediately.
        </p>

        {/* Order Number Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block max-w-sm w-full mx-auto">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Your Order Reference Number</div>
          <div className="text-lg font-mono font-extrabold text-brand-700 mt-0.5">{order.order_number}</div>
        </div>

        {/* Quick Order Stats */}
        <div className="grid grid-cols-2 gap-4 text-left p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Paid/Payable</span>
            <span className="font-extrabold text-slate-900 text-sm">₹{order.total}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Payment Mode</span>
            <span className="font-extrabold text-slate-900 uppercase text-xs">{order.payment_method}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('order-tracking', { orderNumber: order.order_number })}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

      </div>

    </div>
  );
}
