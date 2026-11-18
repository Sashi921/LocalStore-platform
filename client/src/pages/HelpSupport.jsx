import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function HelpSupport({ onNavigate }) {
  const { authFetch, isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  // Ticket Form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('delivery');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authFetch('/api/support/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTickets();
  }, [isAuthenticated]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to submit a support ticket', 'error');
      onNavigate('login');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, category, description })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket submitted! Our support team will assist shortly.', 'success');
        setSubject('');
        setDescription('');
        await fetchTickets();
      } else {
        showToast(data.message || 'Failed to submit', 'error');
      }
    } catch (err) {
      showToast('Error filing ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How fast is local delivery on LocalStore?',
      a: 'Because products are fulfilled directly from neighborhood stores within 5-10 kilometers of your PIN code, average delivery time is between 25 to 45 minutes.'
    },
    {
      q: 'What payment methods can I use?',
      a: 'We support Cash on Delivery (cash or UPI scan at delivery) as well as simulated Instant Online Card/UPI payments.'
    },
    {
      q: 'Can I cancel or modify my order after placing it?',
      a: 'Yes, as long as the store has not marked your order as "Dispatched", you can cancel it directly from the Live Order Tracking screen with 1 click.'
    },
    {
      q: 'How do local shopkeepers get onboarded?',
      a: 'Local merchants can register via the Merchant Registration portal. Once their shop profile, hours, and catalog are approved by administration, their store immediately appears on the neighborhood map.'
    },
    {
      q: 'What if I receive a damaged or missing item?',
      a: 'You can submit a complaint ticket using the form below with your order number. Our platform moderation team contacts the store merchant directly to resolve it or arrange an instant replacement.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2 pb-6 border-b border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Help & Customer Care Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Need help with an ongoing local delivery, order return or shopkeeper query? We're here for you.
        </p>
      </div>

      {/* Quick Contact Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-2xs">
          <PhoneCall className="w-5 h-5 text-brand-600 mx-auto" />
          <h4 className="font-bold text-slate-900 text-xs">Customer Helpline</h4>
          <p className="text-[11px] text-slate-400">+91 11 4000 8800</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-2xs">
          <Mail className="w-5 h-5 text-brand-600 mx-auto" />
          <h4 className="font-bold text-slate-900 text-xs">Email Assistance</h4>
          <p className="text-[11px] text-slate-400">support@localstore.market</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-brand-600 mx-auto" />
          <h4 className="font-bold text-slate-900 text-xs">Resolution Guarantee</h4>
          <p className="text-[11px] text-slate-400">Response within 2 business hours</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions</h2>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-brand-600 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-fade-in pl-1">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket / Complaint Creation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit a Support Request or Dispute</h2>
            <p className="text-xs text-slate-500">Our customer support specialists will review and reply directly to your account</p>
          </div>
        </div>

        <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="delivery">Late Delivery / Rider Issue</option>
                <option value="quality">Product Quality / Damaged Item</option>
                <option value="payment">Payment & Refund Inquiry</option>
                <option value="shop_complaint">Report a Store</option>
                <option value="other">General Inquiries</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subject / Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sourdough loaf was missing from order LOC-2026-90435"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Please provide specifics such as order reference number, affected items, and photos if applicable..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
          </button>
        </form>
      </div>

      {/* Customer's Previous Submitted Tickets */}
      {tickets.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Submitted Tickets ({tickets.length})</h2>
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div key={t.id} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{t.description}"
                </p>
                {t.admin_response && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                    <strong>Admin Response:</strong> "{t.admin_response}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
