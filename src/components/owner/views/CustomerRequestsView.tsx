import React, { useState } from 'react';
import { CustomerRequest, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { MessageSquareText, Sparkles, Check, Clock, User, Send, Filter } from 'lucide-react';

interface CustomerRequestsViewProps {
  requests: CustomerRequest[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const CustomerRequestsView: React.FC<CustomerRequestsViewProps> = ({
  requests,
  currentOwner,
  onRefresh
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<CustomerRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [newStatus, setNewStatus] = useState<CustomerRequest['status']>('quoted');
  const [updating, setUpdating] = useState(false);

  const filtered = requests.filter(r => (filter === 'all' ? true : r.status === filter));

  const handleOpenReq = (req: CustomerRequest) => {
    setSelectedReq(req);
    setResponseNotes(req.responseNotes || '');
    setNewStatus(req.status);
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setUpdating(true);
      await api.updateCustomerRequest(selectedReq.id, {
        status: newStatus,
        responseNotes,
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      setSelectedReq(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: CustomerRequest['status']) => {
    switch (status) {
      case 'new': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'in_review': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'quoted': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'fulfilled': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'declined': return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Client Concierge & VIP Requests
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Customer Requests ({requests.length})
          </h2>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto">
          {['all', 'new', 'in_review', 'quoted', 'fulfilled', 'declined'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                filter === st
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          No customer requests found in this status category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(req => (
            <div
              key={req.id}
              onClick={() => handleOpenReq(req)}
              className="p-5 bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-xl space-y-3 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getStatusColor(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-purple-400 uppercase">
                  {req.requestType.replace('_', ' ')}
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                  {req.subject}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-3 mt-1.5 font-light leading-relaxed">
                  {req.message}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span className="font-semibold">{req.customerName}</span>
                  {req.budget && <span className="font-mono text-emerald-400">{req.budget}</span>}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono truncate">{req.customerEmail}</div>

                {req.handledByName && (
                  <div className="text-[10px] font-mono text-neutral-400 pt-1">
                    Handled by: <strong className="text-neutral-200">{req.handledByName}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Response Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                  {selectedReq.requestType.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-white uppercase mt-0.5 font-outfit">
                  {selectedReq.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Customer specs */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-300">
                <div><strong>Client:</strong> {selectedReq.customerName}</div>
                <div><strong>Email:</strong> {selectedReq.customerEmail}</div>
                <div><strong>Phone:</strong> {selectedReq.customerPhone || 'N/A'}</div>
                <div><strong>Budget:</strong> {selectedReq.budget || 'Custom Quote'}</div>
              </div>
              <div className="pt-2 border-t border-neutral-800 text-neutral-200 font-light leading-relaxed">
                {selectedReq.message}
              </div>
            </div>

            {/* Owner Response Form */}
            <form onSubmit={handleSaveResponse} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Update Status</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['new', 'in_review', 'quoted', 'fulfilled', 'declined'] as CustomerRequest['status'][]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-1.5 px-2 text-[11px] font-mono uppercase rounded-lg border transition-colors cursor-pointer ${
                        newStatus === st
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Executive Response / Quotation Notes
                </label>
                <textarea
                  rows={3}
                  value={responseNotes}
                  onChange={e => setResponseNotes(e.target.value)}
                  placeholder="Record quote breakdown, fabric availability, or reply message sent to the client..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-neutral-500">
                  Responding as: <strong className="text-white">{currentOwner.name}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReq(null)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save & Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
