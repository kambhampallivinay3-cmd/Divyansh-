import React, { useState } from 'react';
import { X, Search, PackageCheck, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types/store';
import { api } from '../../services/api';
import { formatINR } from '../../utils/currency';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOrderUpdated: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOrderUpdated
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const matchedOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !cancelReason.trim()) return;

    try {
      setSubmittingCancel(true);
      setCancelError(null);
      await api.requestOrderCancellation(selectedOrder.id, cancelReason);
      setCancelSuccess(true);
      onOrderUpdated();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to submit cancellation request');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'incoming':
        return <span className="text-amber-400 font-mono text-xs">Pending Owner Review</span>;
      case 'accepted':
        return <span className="text-emerald-400 font-mono text-xs">Accepted & Preparing</span>;
      case 'shipped':
        return <span className="text-sky-400 font-mono text-xs">Dispatched for Delivery</span>;
      case 'delivered':
        return <span className="text-emerald-400 font-mono text-xs">Delivered</span>;
      case 'declined':
        return <span className="text-red-400 font-mono text-xs">Declined</span>;
      case 'cancellation_requested':
        return <span className="text-orange-400 font-mono text-xs">Cancellation Under Review</span>;
      case 'cancelled':
        return <span className="text-neutral-400 font-mono text-xs">Cancelled</span>;
      default:
        return <span className="text-neutral-400 font-mono text-xs">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-800 rounded-lg">
              <PackageCheck className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Track Customer Order
              </h3>
              <p className="text-xs text-neutral-400">
                Check order confirmation status, dispatch tracking, and cancellation requests
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. VNX-1041) or Email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Orders selection list */}
            <div className="md:col-span-1 border border-neutral-800 rounded-xl bg-neutral-950/50 p-2 space-y-1.5 max-h-72 overflow-y-auto">
              <span className="text-[10px] font-mono text-neutral-500 uppercase px-2 block">
                Orders ({matchedOrders.length})
              </span>
              {matchedOrders.length === 0 ? (
                <p className="text-xs text-neutral-500 p-2">No orders found.</p>
              ) : (
                matchedOrders.map(ord => (
                  <button
                    key={ord.id}
                    onClick={() => { setSelectedOrder(ord); setShowCancelForm(false); setCancelSuccess(false); }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedOrder?.id === ord.id
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <div className="font-mono font-bold">{ord.orderNumber}</div>
                    <div className="text-[11px] truncate opacity-75">{ord.customerName}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">{formatINR(ord.total)} · {ord.status}</div>
                  </button>
                ))
              )}
            </div>

            {/* Selected Order Detailed View */}
            <div className="md:col-span-2 border border-neutral-800 rounded-xl bg-neutral-950/50 p-4 space-y-4">
              {selectedOrder ? (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-mono text-neutral-400">Order Reference</span>
                      <h4 className="text-lg font-bold text-white font-mono">{selectedOrder.orderNumber}</h4>
                      <span className="text-[11px] text-neutral-400">
                        Placed {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-500 block uppercase">Current Status</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Tracking info if accepted/shipped */}
                  {selectedOrder.trackingNumber && (
                    <div className="p-2.5 bg-sky-950/40 border border-sky-500/30 rounded-lg text-xs text-sky-200">
                      <strong>Tracking Reference:</strong> <span className="font-mono">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}

                  {/* Decline reason if declined */}
                  {selectedOrder.declineReason && (
                    <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
                      <strong>Notice from Owners:</strong> {selectedOrder.declineReason}
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-neutral-300">Ordered Items</span>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-neutral-900 rounded-lg text-xs">
                        <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{item.title}</div>
                          <div className="text-neutral-400 font-mono text-[11px]">
                            Qty: {item.quantity} · Size: {item.size}
                          </div>
                        </div>
                        <div className="font-mono text-white font-bold">{formatINR(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">Ship To</span>
                      <div>{selectedOrder.customerName}</div>
                      <div className="text-neutral-400">{selectedOrder.shippingAddress}, {selectedOrder.city}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total</span>
                      <div className="font-mono text-base font-bold text-white">{formatINR(selectedOrder.total)}</div>
                      <div className="text-neutral-400 font-mono text-[11px]">{selectedOrder.paymentMethod} Payment</div>
                    </div>
                  </div>

                  {/* Cancellation Request Section */}
                  <div className="pt-3 border-t border-neutral-800">
                    {cancelSuccess ? (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Cancellation request transmitted to owners Vinay & Divyansh for review.</span>
                      </div>
                    ) : selectedOrder.status === 'cancellation_requested' ? (
                      <div className="p-2.5 bg-orange-950/40 border border-orange-500/30 rounded-lg text-xs text-orange-200">
                        Cancellation request submitted. Awaiting approval by Vinay or Divyansh.
                      </div>
                    ) : selectedOrder.status === 'cancelled' ? (
                      <div className="text-xs text-neutral-400">This order has been cancelled.</div>
                    ) : !showCancelForm ? (
                      <button
                        onClick={() => setShowCancelForm(true)}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Need to cancel this order?
                      </button>
                    ) : (
                      <form onSubmit={handleCancelSubmit} className="space-y-2 p-3 bg-neutral-900 rounded-lg">
                        <span className="text-xs font-semibold text-white block">Request Order Cancellation</span>
                        {cancelError && <p className="text-xs text-red-400">{cancelError}</p>}
                        <textarea
                          rows={2}
                          placeholder="Reason for cancellation (e.g. wrong size, changed mind)..."
                          value={cancelReason}
                          onChange={e => setCancelReason(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCancelForm(false)}
                            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingCancel}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                          >
                            {submittingCancel ? 'Submitting...' : 'Submit Request to Owners'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-neutral-500 py-12 text-center">Select an order on the left to view details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
