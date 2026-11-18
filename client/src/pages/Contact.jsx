import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact({ onNavigate }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Your message has been sent to LocalStore Support!', 'success');
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">Contact Us</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Have questions about partnering with us or feedback about your neighborhood shopping experience? Get in touch!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info */}
        <div className="md:col-span-5 p-6 bg-slate-900 text-white rounded-3xl space-y-6">
          <div>
            <h2 className="text-lg font-bold">LocalStore Headquarters</h2>
            <p className="text-xs text-slate-400 mt-1">Operational hubs in Central Delhi, Karol Bagh, & Noida</p>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Block B, Connaught Place, New Delhi 110001</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <span>+91 11 4000 8800 (Mon - Sun, 8 AM - 10 PM)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span>contact@localstore.market</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Interested in listing your retail store? Contact merchant support directly at <strong className="text-white">sellers@localstore.market</strong>.
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Send Us a Direct Message</h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Priya Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Tell us what you need or give us your suggestions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
