import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface CustomerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
}

export const CustomerRequestModal: React.FC<CustomerRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [requestType, setRequestType] = useState<'bespoke_design' | 'bulk_order' | 'vip_styling' | 'collaboration'>('bespoke_design');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName || !customerEmail || !message) {
      setError('Please provide your name, email and details of your request.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createCustomerRequest({
        customerName,
        customerEmail,
        customerPhone,
        requestType,
        subject: subject || `${requestType.replace('_', ' ').toUpperCase()} Inquiry`,
        message,
        budget
      });
      setSuccess(true);
      onRequestSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Submit Customer Request
              </h3>
              <p className="text-xs text-neutral-400">
                Bespoke runway designs, bulk corporate gifting & styling concierge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white uppercase">
              Request Received by Owners!
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
              Thank you {customerName}. Vinay and Divyansh have received your special inquiry in the Owner Lobby and will get back to you with custom sketches, pricing, or turnaround timeline.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            {error && (
              <div className="p-3 text-xs bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Inquiry Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bespoke_design', label: 'Bespoke Design' },
                  { id: 'bulk_order', label: 'Bulk Order' },
                  { id: 'vip_styling', label: 'VIP Styling' },
                  { id: 'collaboration', label: 'Collaboration' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRequestType(t.id as any)}
                    className={`py-2 px-3 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                      requestType === t.id
                        ? 'bg-purple-950/60 text-purple-200 border-purple-500/50'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Patel"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="maya@example.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Estimated Budget (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000 - ₹1,00,000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of request..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Detailed Specifications & Notes *
              </label>
              <textarea
                rows={3}
                placeholder="Describe fabrics, size requirements, branding patches, target dates, etc."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Send Inquiry to Owners'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
