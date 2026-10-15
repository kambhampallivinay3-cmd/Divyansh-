import React, { useState } from 'react';
import { Order, OwnerProfile, OrderStatus } from '../../../types/store';
import { api } from '../../../services/api';
import { formatINR } from '../../../utils/currency';
import {
  Inbox,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Truck,
  Printer,
  ChevronRight,
  Eye,
  Check,
  X,
  Search
} from 'lucide-react';
import { OwnerSection } from '../OwnerSidebar';

interface OrdersManagerViewProps {
  orders: Order[];
  currentSection: OwnerSection;
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const OrdersManagerView: React.FC<OrdersManagerViewProps> = ({
  orders,
  currentSection,
  currentOwner,
  onRefresh
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionModal, setActionModal] = useState<'decline' | 'ship' | 'details' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Map sidebar sections to status filters
  const getFilterStatus = (): OrderStatus | 'all' => {
    switch (currentSection) {
      case 'incoming_orders': return 'incoming';
      case 'accepted_orders': return 'accepted';
      case 'declined_orders': return 'declined';
      case 'cancellation_requests': return 'cancellation_requested';
      default: return 'all';
    }
  };

  const activeStatus = getFilterStatus();

  const filteredOrders = orders.filter(o => {
    const matchesStatus =
      activeStatus === 'all'
        ? true
        : activeStatus === 'accepted'
        ? o.status === 'accepted' || o.status === 'shipped' || o.status === 'delivered'
        : o.status === activeStatus;

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getTitle = () => {
    switch (currentSection) {
      case 'incoming_orders': return 'Incoming Orders';
      case 'accepted_orders': return 'Accepted Orders';
      case 'declined_orders': return 'Declined Orders';
      case 'cancellation_requests': return 'Order Cancellation Requests';
      default: return 'Store Orders';
    }
  };

  const getSubtitle = () => {
    switch (currentSection) {
      case 'incoming_orders': return 'New customer orders pending acceptance or review by co-owners';
      case 'accepted_orders': return 'Confirmed orders in fulfillment, shipping, or delivered state';
      case 'declined_orders': return 'Archived orders rejected with documented reasons';
      case 'cancellation_requests': return 'Customer cancellation petitions requiring owner resolution';
      default: return 'Full store ledger';
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      setSubmitting(true);
      await api.updateOrderStatus(orderId, 'accepted', {
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !declineReason.trim()) return;

    try {
      setSubmitting(true);
      await api.updateOrderStatus(selectedOrder.id, 'declined', {
        declineReason,
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      setActionModal(null);
      setDeclineReason('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to decline order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setSubmitting(true);
      await api.updateOrderStatus(selectedOrder.id, 'shipped', {
        trackingNumber: trackingNumber || `TRACK-VNX-${Date.now().toString().slice(-6)}`,
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      setActionModal(null);
      setTrackingNumber('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to mark shipped');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCancellation = async (orderId: string) => {
    if (!window.confirm('Approve cancellation and restock ordered pieces back into inventory?')) return;
    try {
      setSubmitting(true);
      await api.updateOrderStatus(orderId, 'cancelled', {
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve cancellation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectCancellation = async (orderId: string) => {
    try {
      setSubmitting(true);
      await api.updateOrderStatus(orderId, 'accepted', {
        handledBy: currentOwner.id,
        handledByName: currentOwner.name
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reject cancellation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Order Lifecycle Management
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            {getTitle()} ({filteredOrders.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">{getSubtitle()}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search order #, customer, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 w-56 sm:w-64"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="py-24 text-center text-neutral-500 text-sm">
          No orders found in this section.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-2xl bg-neutral-950/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
                <tr>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total & Payment</th>
                  <th className="p-4">Status & Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4 font-mono">
                      <div className="font-bold text-white">{order.orderNumber}</div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-neutral-400 text-[11px]">{order.customerEmail}</div>
                      <div className="text-neutral-500 text-[10px]">{order.city}</div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                            <span>{item.quantity}x</span>
                            <span className="truncate max-w-[140px]">{item.title}</span>
                            <span className="font-mono text-neutral-500">({item.size})</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-sm font-bold text-white tabular-nums">{formatINR(order.total)}</div>
                      <div className="text-[10px] text-neutral-400">
                        {order.paymentMethod} · {order.paymentStatus}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                          {order.status.replace('_', ' ')}
                        </span>
                        {order.cancellationReason && (
                          <div className="text-[11px] text-red-300 font-light max-w-xs mt-1">
                            <strong>Reason:</strong> {order.cancellationReason}
                          </div>
                        )}
                        {order.declineReason && (
                          <div className="text-[11px] text-neutral-400 font-light max-w-xs mt-1">
                            <strong>Declined:</strong> {order.declineReason}
                          </div>
                        )}
                        {order.handledByName && (
                          <div className="text-[10px] text-neutral-500 font-mono">
                            By: {order.handledByName}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Actions for Incoming Orders */}
                        {order.status === 'incoming' && (
                          <>
                            <button
                              onClick={() => handleAccept(order.id)}
                              disabled={submitting}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                              title="Accept Order"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActionModal('decline');
                              }}
                              disabled={submitting}
                              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 font-semibold rounded text-[11px] uppercase transition-colors cursor-pointer flex items-center gap-1 border border-neutral-700"
                              title="Decline Order"
                            >
                              <X className="w-3 h-3" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {/* Actions for Accepted Orders */}
                        {(order.status === 'accepted' || order.status === 'shipped') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setActionModal('ship');
                            }}
                            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-sky-500/30 rounded text-[11px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>{order.status === 'shipped' ? 'Update Tracking' : 'Dispatch'}</span>
                          </button>
                        )}

                        {/* Actions for Cancellation Requests */}
                        {order.status === 'cancellation_requested' && (
                          <>
                            <button
                              onClick={() => handleApproveCancellation(order.id)}
                              disabled={submitting}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded text-[11px] uppercase transition-colors cursor-pointer"
                            >
                              Approve Cancel
                            </button>
                            <button
                              onClick={() => handleRejectCancellation(order.id)}
                              disabled={submitting}
                              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] uppercase transition-colors cursor-pointer"
                            >
                              Keep Active
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionModal('details');
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="View Full Order Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decline Order Modal with reason */}
      {actionModal === 'decline' && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              Decline Order #{selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-neutral-400">
              Provide an official rationale for declining this order. Items will be automatically returned to inventory stock.
            </p>
            <form onSubmit={handleDeclineSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Reason (e.g. Incomplete shipping address, suspected payment anomaly, or out-of-stock piece)..."
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch / Tracking Modal */}
      {actionModal === 'ship' && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              Dispatch Order #{selectedOrder.orderNumber}
            </h3>
            <form onSubmit={handleShipSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Courier / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FEDEX-VNX-994120"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {actionModal === 'details' && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white font-mono">
                Invoice Reference: {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-neutral-400 hover:text-white text-xs cursor-pointer">
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-300">
                <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                <div><strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}</div>
                <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <strong className="block text-neutral-400 mb-1">Destination Address:</strong>
                <div>{selectedOrder.shippingAddress}, {selectedOrder.city} {selectedOrder.postalCode}</div>
              </div>
              <div className="space-y-2">
                <strong className="block text-neutral-400">Order Items:</strong>
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-neutral-950 rounded">
                    <span>{i.title} (Size {i.size}) x {i.quantity}</span>
                    <span className="font-mono">{formatINR(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-neutral-800 font-mono">
                <span>Total Paid/Due</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
