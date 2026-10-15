import React, { useState, useEffect } from 'react';
import { Negotiation, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { formatINR } from '../../../utils/currency';
import {
  CircleDollarSign,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Percent,
  Check,
  Tag
} from 'lucide-react';

interface NegotiationsViewProps {
  negotiations: Negotiation[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const NegotiationsView: React.FC<NegotiationsViewProps> = ({
  negotiations,
  currentOwner,
  onRefresh
}) => {
  const [selectedNegId, setSelectedNegId] = useState<string>(negotiations[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'pending' | 'countered' | 'accepted' | 'declined'>('all');
  const [replyText, setReplyText] = useState('');
  const [counterPrice, setCounterPrice] = useState<number>(3000);
  const [actionType, setActionType] = useState<'counter' | 'accept' | 'decline' | 'message'>('counter');
  const [submitting, setSubmitting] = useState(false);

  const selectedNeg = negotiations.find(n => n.id === selectedNegId) || negotiations[0] || null;

  // Initialize counterPrice when selecting a thread
  useEffect(() => {
    if (selectedNeg) {
      if (selectedNeg.latestOwnerCounter) {
        setCounterPrice(selectedNeg.latestOwnerCounter);
      } else {
        // Default to halfway between retail price and customer offer
        const custOffer = selectedNeg.latestCustomerOffer || selectedNeg.currentOffer;
        const midPoint = Math.round((selectedNeg.productPrice + custOffer) / 2);
        setCounterPrice(midPoint);
      }
    }
  }, [selectedNeg?.id]);

  // Quick price adjustment steppers (+ / -)
  const adjustCounterPrice = (delta: number) => {
    if (!selectedNeg) return;
    setCounterPrice(prev => Math.max(100, Math.min(selectedNeg.productPrice, prev + delta)));
  };

  const setPresetPrice = (type: 'split' | 'minus10' | 'minus15' | 'minus500') => {
    if (!selectedNeg) return;
    const custOffer = selectedNeg.latestCustomerOffer || selectedNeg.currentOffer;
    switch (type) {
      case 'split':
        setCounterPrice(Math.round((selectedNeg.productPrice + custOffer) / 2));
        break;
      case 'minus10':
        setCounterPrice(Math.round(selectedNeg.productPrice * 0.90));
        break;
      case 'minus15':
        setCounterPrice(Math.round(selectedNeg.productPrice * 0.85));
        break;
      case 'minus500':
        setCounterPrice(Math.max(100, selectedNeg.productPrice - 500));
        break;
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeg) return;

    try {
      setSubmitting(true);
      const isAccept = actionType === 'accept';
      const isCounter = actionType === 'counter';
      const isDecline = actionType === 'decline';

      const targetPrice = isAccept
        ? (selectedNeg.latestCustomerOffer || selectedNeg.currentOffer)
        : isCounter
        ? Number(counterPrice)
        : undefined;

      const defaultMsg = isAccept
        ? `Offer of ${formatINR(targetPrice!)} accepted by ${currentOwner.name}! Deal confirmed and voucher code generated.`
        : isCounter
        ? `Owner counter-offer: ${formatINR(counterPrice)} proposed by ${currentOwner.name}.`
        : isDecline
        ? `Offer declined by ${currentOwner.name}.`
        : `Message from co-owner ${currentOwner.name}.`;

      await api.replyNegotiation(selectedNeg.id, {
        sender: 'owner',
        senderName: currentOwner.name,
        text: replyText || defaultMsg,
        counterPrice: targetPrice,
        action: actionType === 'message' ? undefined : actionType,
        handledBy: currentOwner.id
      });

      setReplyText('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick one-click accept customer's latest offer
  const handleQuickAccept = async () => {
    if (!selectedNeg) return;
    const custOffer = selectedNeg.latestCustomerOffer || selectedNeg.currentOffer;
    if (!confirm(`Accept customer ${selectedNeg.customerName}'s offer of ${formatINR(custOffer)} for ${selectedNeg.productTitle}? This will finalize the agreed price in the database.`)) {
      return;
    }

    try {
      setSubmitting(true);
      await api.replyNegotiation(selectedNeg.id, {
        sender: 'owner',
        senderName: currentOwner.name,
        text: `Offer of ${formatINR(custOffer)} accepted by ${currentOwner.name}! Voucher code generated.`,
        counterPrice: custOffer,
        action: 'accept',
        handledBy: currentOwner.id
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept offer');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Negotiation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'countered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
            <Clock className="w-3 h-3" /> Counter-Offered
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Deal Finalized
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
            <XCircle className="w-3 h-3" /> Declined
          </span>
        );
    }
  };

  const filteredNegotiations = negotiations.filter(n => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Live B2C Price Negotiations
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded">
              Indian Currency (₹ INR)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Owner Negotiation Console ({negotiations.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">
            Active Owner: <strong className="text-white">{currentOwner.name}</strong>
          </span>
          <button
            onClick={onRefresh}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All (${negotiations.length})` },
          { id: 'pending', label: `Pending Review (${negotiations.filter(n => n.status === 'pending').length})` },
          { id: 'countered', label: `Countered (${negotiations.filter(n => n.status === 'countered').length})` },
          { id: 'accepted', label: `Accepted (${negotiations.filter(n => n.status === 'accepted').length})` },
          { id: 'declined', label: `Declined (${negotiations.filter(n => n.status === 'declined').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {negotiations.length === 0 ? (
        <div className="py-24 text-center text-neutral-500 text-sm">
          No negotiation offers recorded yet in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          {/* Threads List Sidebar */}
          <div className="lg:col-span-4 border border-neutral-800 rounded-2xl bg-neutral-950/60 p-3 space-y-2 overflow-y-auto max-h-[640px]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase px-2 block">
              Negotiation Threads ({filteredNegotiations.length})
            </span>
            {filteredNegotiations.map(neg => {
              const isSelected = selectedNeg?.id === neg.id;
              return (
                <div
                  key={neg.id}
                  onClick={() => { setSelectedNegId(neg.id); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400/60 shadow-lg ring-1 ring-amber-400/20'
                      : 'bg-neutral-950/80 border-neutral-800 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[150px]">
                      {neg.customerName}
                    </span>
                    {getStatusBadge(neg.status)}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <img src={neg.productImage} alt={neg.productTitle} className="w-10 h-10 object-cover rounded-lg border border-neutral-800" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate font-medium">{neg.productTitle}</div>
                      <div className="flex items-baseline gap-2 text-[11px] font-mono">
                        <span className="text-neutral-400">Offer: <strong className="text-amber-400">{formatINR(neg.currentOffer)}</strong></span>
                        <span className="text-neutral-500 line-through">{formatINR(neg.productPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800/80">
                    <span>Qty: {neg.quantity} unit(s)</span>
                    <span>{new Date(neg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Negotiation Chat & Counter Console */}
          {selectedNeg ? (
            <div className="lg:col-span-8 border border-neutral-800 rounded-2xl bg-neutral-950/80 flex flex-col justify-between overflow-hidden">
              {/* Thread Header with 4-KPI Overview & Previous Offers Display */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={selectedNeg.productImage} alt={selectedNeg.productTitle} className="w-12 h-12 object-cover rounded-xl border border-neutral-800 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase">{selectedNeg.productTitle}</h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5 flex-wrap">
                        <span>Customer: <strong className="text-white">{selectedNeg.customerName}</strong></span>
                        <span>·</span>
                        <span className="text-neutral-400">{selectedNeg.customerEmail}</span>
                        {selectedNeg.customerPhone && (
                          <>
                            <span>·</span>
                            <span>{selectedNeg.customerPhone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {getStatusBadge(selectedNeg.status)}
                    {selectedNeg.status !== 'accepted' && (
                      <button
                        onClick={handleQuickAccept}
                        disabled={submitting}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-md disabled:opacity-50"
                        title="Accept latest customer offer immediately"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept {formatINR(selectedNeg.latestCustomerOffer || selectedNeg.currentOffer)}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI Metrics Summary (Original Price, Latest Customer Offer, Latest Owner Counter, Status, Agreed Price) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase block">Original Price</span>
                    <span className="text-xs font-bold text-neutral-300">{formatINR(selectedNeg.productPrice)}</span>
                  </div>
                  <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase block">Latest Customer Offer</span>
                    <span className="text-xs font-bold text-amber-400">
                      {formatINR(selectedNeg.latestCustomerOffer || selectedNeg.initialOffer)}
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase block">Latest Owner Counter</span>
                    <span className="text-xs font-bold text-sky-400">
                      {selectedNeg.latestOwnerCounter ? formatINR(selectedNeg.latestOwnerCounter) : 'None yet'}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    selectedNeg.status === 'accepted'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}>
                    <span className="text-[10px] uppercase block">Agreed Final Price</span>
                    <span className="text-xs font-bold">
                      {selectedNeg.agreedPrice ? formatINR(selectedNeg.agreedPrice) : 'In Negotiation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Message History & Previous Offers */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[360px] bg-neutral-950">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Negotiation Thread History
                </span>

                {selectedNeg.messages.map((msg, idx) => {
                  const isOwner = msg.sender === 'owner';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mb-1">
                        <span>{isOwner ? `Co-Owner (${msg.senderName})` : msg.senderName}</span>
                        <span>·</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed space-y-1 ${
                          isOwner
                            ? 'bg-neutral-900 text-white rounded-tr-none border border-neutral-700'
                            : 'bg-amber-950/30 text-amber-100 rounded-tl-none border border-amber-500/30'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.offerPrice && (
                          <div className="font-mono font-bold text-[11px] pt-1 border-t border-white/10 text-amber-300 flex items-center justify-between">
                            <span className="text-neutral-400">Offer Price:</span>
                            <span>{formatINR(msg.offerPrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Agreed Deal Banner */}
                {selectedNeg.status === 'accepted' && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center text-xs text-emerald-300 space-y-1.5">
                    <div className="font-bold flex items-center justify-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Deal Finalized at {formatINR(selectedNeg.agreedPrice || selectedNeg.currentOffer)}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Approved by {selectedNeg.handledByName || 'Co-Owner'}. The final price is updated and locked in the database.
                    </p>
                    {selectedNeg.discountCodeIssued && (
                      <div className="font-mono text-xs text-white pt-1">
                        Auto-Generated Customer Voucher Code: <strong>{selectedNeg.discountCodeIssued}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Controls & Input Box */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 space-y-3">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'counter', label: 'Counter-Offer (₹)' },
                    { id: 'accept', label: 'Accept Offer' },
                    { id: 'message', label: 'Message' },
                    { id: 'decline', label: 'Decline Offer' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActionType(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                        actionType === tab.id
                          ? tab.id === 'accept'
                            ? 'bg-emerald-600 text-white'
                            : tab.id === 'decline'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-400 text-black font-bold'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendReply} className="space-y-3">
                  {/* Stepper Controls when Countering */}
                  {actionType === 'counter' && (
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-300">
                          Owner Counter-Price (₹ INR):
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          Retail: {formatINR(selectedNeg.productPrice)}
                        </span>
                      </div>

                      {/* Increase / Decrease Stepper Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustCounterPrice(-500)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-mono font-bold cursor-pointer"
                          title="Decrease counter by ₹500"
                        >
                          -₹500
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustCounterPrice(-100)}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 cursor-pointer"
                          title="Decrease counter by ₹100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={selectedNeg.productPrice}
                            value={counterPrice}
                            onChange={e => setCounterPrice(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-400 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                            required
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => adjustCounterPrice(100)}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 cursor-pointer"
                          title="Increase counter by ₹100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustCounterPrice(500)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-mono font-bold cursor-pointer"
                          title="Increase counter by ₹500"
                        >
                          +₹500
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setPresetPrice('split')}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                        >
                          Split Difference
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetPrice('minus10')}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                        >
                          -10% ({formatINR(Math.round(selectedNeg.productPrice * 0.9))})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetPrice('minus15')}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                        >
                          -15% ({formatINR(Math.round(selectedNeg.productPrice * 0.85))})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetPrice('minus500')}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 cursor-pointer"
                        >
                          -₹500
                        </button>
                      </div>
                    </div>
                  )}

                  {actionType === 'accept' && (
                    <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                      <span>
                        Accepting customer's offer of <strong className="text-white">{formatINR(selectedNeg.latestCustomerOffer || selectedNeg.currentOffer)}</strong>.
                      </span>
                      <span className="text-[11px] font-mono">Agreed price will be locked</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        actionType === 'accept'
                          ? 'Optional note for customer (e.g. Pleasure doing business!)...'
                          : actionType === 'counter'
                          ? 'Explain counter offer (e.g. We can do ₹3,200 due to premium Japanese denim)...'
                          : actionType === 'decline'
                          ? 'Explain why offer is declined (e.g. Price is firm on this limited drop)...'
                          : 'Write response to customer...'
                      }
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Transmitting...' : 'Transmit'}</span>
                    </button>
                  </div>
                </form>

                <div className="text-[10px] font-mono text-neutral-500">
                  Transmitting as authorized co-owner: <strong className="text-neutral-300">{currentOwner.name}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center text-neutral-500">
              Select a negotiation thread on the left to review and respond.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
