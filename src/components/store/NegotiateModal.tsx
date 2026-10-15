import React, { useState, useEffect } from 'react';
import {
  X,
  CircleDollarSign,
  Send,
  CheckCircle2,
  Plus,
  Minus,
  Clock,
  MessageSquare,
  AlertCircle,
  ShoppingBag,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  User,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Product, Negotiation, NegotiationMessage } from '../../types/store';
import { api } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';

interface NegotiateModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onNegotiationCreated: () => void;
  onAddToCartWithAgreedPrice?: (product: Product, agreedPrice: number, negotiationId: string, size?: string) => void;
  availableProducts?: Product[];
}

export const NegotiateModal: React.FC<NegotiateModalProps> = ({
  product: initialProduct,
  isOpen = true,
  onClose,
  onNegotiationCreated,
  onAddToCartWithAgreedPrice,
  availableProducts = []
}) => {
  if (!isOpen && !initialProduct) return null;

  // Selected active product to negotiate on
  const [activeProduct, setActiveProduct] = useState<Product | null>(initialProduct);

  // Active top tab: 'new_offer' or 'active_negotiations'
  const [activeTab, setActiveTab] = useState<'new_offer' | 'active_negotiations'>(
    initialProduct ? 'new_offer' : 'active_negotiations'
  );

  // Customer credentials / remembered info
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('velnix_cust_name') || '');
  const [customerEmail, setCustomerEmail] = useState(() => localStorage.getItem('velnix_cust_email') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('velnix_cust_phone') || '');

  // Form states for NEW OFFER
  const [offeredPrice, setOfferedPrice] = useState<number>(() => {
    return initialProduct ? Math.round(initialProduct.price * 0.85) : 3000;
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  // Active negotiations state
  const [customerNegotiations, setCustomerNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegId, setSelectedNegId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Customer counteroffer form in thread
  const [counterPrice, setCounterPrice] = useState<number>(3000);
  const [counterText, setCounterText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync activeProduct when initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setActiveProduct(initialProduct);
      setOfferedPrice(Math.round(initialProduct.price * 0.85));
      setActiveTab('new_offer');
    }
  }, [initialProduct]);

  // Load customer's negotiations if email is known
  const loadCustomerThreads = async (emailToUse?: string) => {
    const email = (emailToUse || customerEmail).trim().toLowerCase();
    if (!email) return;
    try {
      setLoadingHistory(true);
      const threads = await api.getCustomerNegotiations(email);
      setCustomerNegotiations(threads || []);
      if (threads && threads.length > 0 && !selectedNegId) {
        setSelectedNegId(threads[0].id);
      }
    } catch (err) {
      console.error('Failed to load customer negotiations:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (customerEmail) {
      loadCustomerThreads(customerEmail);
    }
  }, [customerEmail]);

  // Selected negotiation object
  const currentNeg = customerNegotiations.find(n => n.id === selectedNegId) || customerNegotiations[0] || null;

  // Sync counter price default when selecting thread
  useEffect(() => {
    if (currentNeg) {
      // Default counter to halfway between current offer and product price or latest owner counter
      if (currentNeg.latestOwnerCounter) {
        setCounterPrice(Math.round((currentNeg.currentOffer + currentNeg.latestOwnerCounter) / 2));
      } else {
        setCounterPrice(currentNeg.currentOffer);
      }
    }
  }, [currentNeg?.id, currentNeg?.status]);

  // Adjust price helper (+ / -)
  const adjustOfferPrice = (delta: number) => {
    const base = activeProduct?.price || 10000;
    setOfferedPrice(prev => Math.max(100, Math.min(base * 2, prev + delta)));
  };

  const adjustCounterPrice = (delta: number) => {
    if (!currentNeg) return;
    setCounterPrice(prev => Math.max(100, Math.min(currentNeg.productPrice, prev + delta)));
  };

  const applyOfferPercentage = (percentDiscount: number) => {
    if (!activeProduct) return;
    const discounted = Math.round(activeProduct.price * (1 - percentDiscount / 100));
    setOfferedPrice(discounted);
  };

  // Submit NEW OFFER
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Please provide a valid email address so the owners can contact you.');
      return;
    }
    if (!offeredPrice || offeredPrice <= 0) {
      alert('Please enter a valid offer price in ₹ (INR).');
      return;
    }

    try {
      setSubmittingOffer(true);
      // Persist customer details in local storage
      localStorage.setItem('velnix_cust_name', customerName);
      localStorage.setItem('velnix_cust_email', customerEmail.toLowerCase());
      if (customerPhone) localStorage.setItem('velnix_cust_phone', customerPhone);

      const created = await api.startNegotiation({
        productId: activeProduct.id,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail.toLowerCase(),
        customerPhone,
        offeredPrice: Number(offeredPrice),
        quantity: Number(quantity),
        message: message || `Hi Vinay & Divyansh! I would like to offer ${formatINR(offeredPrice)} for ${quantity} unit(s) of ${activeProduct.title}.`
      });

      setOfferSuccessMsg(`Your offer of ${formatINR(offeredPrice)} was securely submitted to Vinay and Divyansh!`);
      onNegotiationCreated();
      // Reload threads and switch to history
      await loadCustomerThreads(customerEmail);
      setSelectedNegId(created.id);
      setActiveTab('active_negotiations');
    } catch (err: any) {
      alert(err.message || 'Failed to submit offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Customer replies with COUNTEROFFER
  const handleCustomerCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNeg) return;
    setReplyError(null);

    if (!counterPrice || counterPrice <= 0) {
      setReplyError('Please enter a valid counter offer price.');
      return;
    }

    try {
      setSubmittingReply(true);
      const updated = await api.replyNegotiation(currentNeg.id, {
        sender: 'customer',
        senderName: customerName || currentNeg.customerName,
        customerEmail: customerEmail.toLowerCase(),
        text: counterText || `I counter-offer ${formatINR(counterPrice)}. Can we do this price?`,
        counterPrice: Number(counterPrice),
        action: 'counter'
      });

      setCounterText('');
      setCustomerNegotiations(prev => prev.map(n => n.id === updated.id ? updated : n));
      onNegotiationCreated();
    } catch (err: any) {
      setReplyError(err.message || 'Failed to submit counteroffer.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Customer ACCEPTS owner's counteroffer
  const handleCustomerAccept = async () => {
    if (!currentNeg) return;
    if (!confirm(`Confirm acceptance of ${formatINR(currentNeg.latestOwnerCounter || currentNeg.currentOffer)} for ${currentNeg.productTitle}? This will finalize your agreed price.`)) {
      return;
    }

    try {
      setSubmittingReply(true);
      const targetPrice = currentNeg.latestOwnerCounter || currentNeg.currentOffer;
      const updated = await api.replyNegotiation(currentNeg.id, {
        sender: 'customer',
        senderName: customerName || currentNeg.customerName,
        customerEmail: customerEmail.toLowerCase(),
        text: `Deal accepted! I agree to the price of ${formatINR(targetPrice)}. Thank you!`,
        counterPrice: targetPrice,
        action: 'accept'
      });

      setCustomerNegotiations(prev => prev.map(n => n.id === updated.id ? updated : n));
      onNegotiationCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to accept offer.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Customer DECLINES
  const handleCustomerDecline = async () => {
    if (!currentNeg) return;
    if (!confirm('Are you sure you want to decline this negotiation?')) return;

    try {
      setSubmittingReply(true);
      const updated = await api.replyNegotiation(currentNeg.id, {
        sender: 'customer',
        senderName: customerName || currentNeg.customerName,
        customerEmail: customerEmail.toLowerCase(),
        text: 'I decline this price offer. Thank you for your time.',
        action: 'decline'
      });

      setCustomerNegotiations(prev => prev.map(n => n.id === updated.id ? updated : n));
      onNegotiationCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to decline negotiation.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Proceed to Checkout at Agreed Price
  const handleProceedToCart = () => {
    if (!currentNeg || !currentNeg.agreedPrice) return;
    const targetProd: Product | undefined =
      (activeProduct && activeProduct.id === currentNeg.productId ? activeProduct : undefined) ||
      availableProducts.find(p => p.id === currentNeg.productId) ||
      availableProducts[0];

    if (targetProd && onAddToCartWithAgreedPrice) {
      onAddToCartWithAgreedPrice(
        {
          ...targetProd,
          id: currentNeg.productId,
          title: currentNeg.productTitle,
          price: currentNeg.agreedPrice,
          images: [currentNeg.productImage]
        },
        currentNeg.agreedPrice,
        currentNeg.id,
        'M'
      );
      onClose();
    } else {
      alert(`Agreed price of ${formatINR(currentNeg.agreedPrice)} registered with voucher code: ${currentNeg.discountCodeIssued}`);
    }
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper status color
  const getStatusBadge = (status: Negotiation['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> Deal Accepted
          </span>
        );
      case 'countered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" /> Owner Counter-Offered
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
            <Clock className="w-3 h-3" /> Pending Owner Review
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-700">
            Offer Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Direct Price Negotiation
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded">
                  Live Indian Rupee (₹)
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Bargain directly with brand owners Vinay Kambhampalli & Divyansh
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

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-6 gap-2">
          <button
            onClick={() => setActiveTab('new_offer')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'new_offer'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Make New Price Offer</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('active_negotiations');
              if (customerEmail) loadCustomerThreads(customerEmail);
            }}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'active_negotiations'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>My Offers & Counteroffers ({customerNegotiations.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: MAKE NEW PRICE OFFER */}
          {activeTab === 'new_offer' && (
            <div className="space-y-6">
              {offerSuccessMsg && (
                <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{offerSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('active_negotiations')}
                    className="font-bold underline uppercase ml-3 cursor-pointer text-white"
                  >
                    View Counteroffers ➔
                  </button>
                </div>
              )}

              {/* Product Card or Selector */}
              {activeProduct ? (
                <div className="flex items-center gap-4 p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <img
                    src={resolveImageUrl(activeProduct.images[0])}
                    alt={activeProduct.title}
                    className="w-20 h-20 object-cover rounded-xl border border-neutral-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                      {activeProduct.sku} · Luxury Collection
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{activeProduct.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-neutral-400">Standard Price:</span>
                      <span className="text-sm font-mono font-bold text-neutral-200">
                        {formatINR(activeProduct.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                  Please select a product from the collection below to propose a price.
                </div>
              )}

              <form onSubmit={handleCreateOffer} className="space-y-5">
                {/* Desired Price Controls (+ / - buttons and input) */}
                <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white uppercase tracking-wider block">
                        Your Desired Price in ₹ (INR)
                      </label>
                      <p className="text-[11px] text-neutral-400">
                        Adjust with quick stepper buttons or enter your specific amount
                      </p>
                    </div>
                    {activeProduct && (
                      <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 bg-amber-400/10 rounded-lg border border-amber-400/30">
                        {Math.round(((activeProduct.price - offeredPrice) / activeProduct.price) * 100)}% Discount
                      </span>
                    )}
                  </div>

                  {/* Main Stepper Box */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => adjustOfferPrice(-500)}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                      title="Decrease by ₹500"
                    >
                      -₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustOfferPrice(-100)}
                      className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white cursor-pointer transition-colors"
                      title="Decrease by ₹100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Numeric Input */}
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-neutral-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={activeProduct ? activeProduct.price * 2 : 50000}
                        value={offeredPrice}
                        onChange={e => setOfferedPrice(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-400 rounded-xl pl-8 pr-4 py-2.5 text-base text-white font-mono font-bold focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustOfferPrice(100)}
                      className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white cursor-pointer transition-colors"
                      title="Increase by ₹100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustOfferPrice(500)}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                      title="Increase by ₹500"
                    >
                      +₹500
                    </button>
                  </div>

                  {/* Percentage Presets */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase mr-1">
                      Quick Discounts:
                    </span>
                    {[10, 15, 20, 25].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyOfferPercentage(pct)}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        -{pct}% ({activeProduct ? formatINR(Math.round(activeProduct.price * (1 - pct / 100))) : ''})
                      </button>
                    ))}
                  </div>

                  {/* Quantity */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-900">
                    <span className="text-xs text-neutral-400">Order Quantity:</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-2.5 py-1 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="px-2.5 py-1 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-mono text-neutral-300">
                        Total Offer Value: <strong className="text-white">{formatINR(offeredPrice * quantity)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jordan Hayes"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="jordan@example.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Message / Counter Proposal Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell Vinay & Divyansh why you'd like this price, multiple piece inquiries, or sizing requirements..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submittingOffer
                      ? 'Submitting to Vinay & Divyansh...'
                      : `Submit Direct Offer of ${formatINR(offeredPrice)}`}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY OFFERS & COUNTEROFFERS */}
          {activeTab === 'active_negotiations' && (
            <div className="space-y-6">
              {/* Email Lookup Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white">Your Negotiation Account</span>
                    <p className="text-[11px] text-neutral-400">
                      Offers and counteroffers tied to your email
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter email to track offers..."
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => loadCustomerThreads(customerEmail)}
                    disabled={loadingHistory || !customerEmail}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {customerNegotiations.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-neutral-950/50 rounded-2xl border border-neutral-800/80">
                  <CircleDollarSign className="w-10 h-10 text-neutral-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white uppercase">
                    No Active Negotiations Found
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    {customerEmail
                      ? `No price proposals found for ${customerEmail}. Start by making an offer on any luxury drop!`
                      : 'Enter your email address above to view your ongoing negotiations, or propose an offer on any product.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('new_offer')}
                    className="mt-2 px-4 py-2 bg-amber-400 text-black text-xs font-bold uppercase rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Propose an Offer Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Thread Selector */}
                  <div className="lg:col-span-4 space-y-2.5 max-h-[550px] overflow-y-auto">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block px-1">
                      Your Active Threads ({customerNegotiations.length})
                    </span>
                    {customerNegotiations.map(neg => {
                      const isSelected = (currentNeg?.id === neg.id);
                      return (
                        <div
                          key={neg.id}
                          onClick={() => setSelectedNegId(neg.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                            isSelected
                              ? 'bg-neutral-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/20'
                              : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={resolveImageUrl(neg.productImage)}
                              alt={neg.productTitle}
                              className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-800"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{neg.productTitle}</h5>
                              <span className="text-[10px] font-mono text-neutral-400">
                                Retail: {formatINR(neg.productPrice)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/60">
                            <span className="font-mono text-neutral-300">
                              Current: <strong className="text-amber-400">{formatINR(neg.currentOffer)}</strong>
                            </span>
                            {getStatusBadge(neg.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Negotiation Details, History & Controls */}
                  {currentNeg ? (
                    <div className="lg:col-span-8 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
                      {/* Thread Header with 4-KPI Overview */}
                      <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveImageUrl(currentNeg.productImage)}
                              alt={currentNeg.productTitle}
                              className="w-12 h-12 object-cover rounded-xl border border-neutral-800"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-white">{currentNeg.productTitle}</h4>
                              <span className="text-[10px] font-mono text-neutral-400">
                                Thread ID: {currentNeg.id} · Qty: {currentNeg.quantity} unit(s)
                              </span>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(currentNeg.status)}
                          </div>
                        </div>

                        {/* Negotiation History & Price Metrics Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                          <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                            <span className="text-[10px] text-neutral-500 uppercase block">Retail Price</span>
                            <span className="text-xs font-bold text-neutral-300">{formatINR(currentNeg.productPrice)}</span>
                          </div>
                          <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                            <span className="text-[10px] text-neutral-500 uppercase block">Your Latest Offer</span>
                            <span className="text-xs font-bold text-amber-400">
                              {formatINR(currentNeg.latestCustomerOffer || currentNeg.initialOffer)}
                            </span>
                          </div>
                          <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                            <span className="text-[10px] text-neutral-500 uppercase block">Owner Counter</span>
                            <span className="text-xs font-bold text-blue-400">
                              {currentNeg.latestOwnerCounter ? formatINR(currentNeg.latestOwnerCounter) : 'Pending'}
                            </span>
                          </div>
                          <div className={`p-2 rounded-xl border ${
                            currentNeg.status === 'accepted'
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                          }`}>
                            <span className="text-[10px] uppercase block">Final Agreed Price</span>
                            <span className="text-xs font-bold">
                              {currentNeg.agreedPrice ? formatINR(currentNeg.agreedPrice) : 'In Progress'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline & Message History */}
                      <div className="p-4 flex-1 overflow-y-auto space-y-3.5 max-h-[300px] bg-neutral-950">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                          Negotiation Timeline & Message History
                        </span>

                        {currentNeg.messages.map((msg: NegotiationMessage, idx: number) => {
                          const isCustomer = msg.sender === 'customer';
                          return (
                            <div
                              key={msg.id || idx}
                              className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mb-1">
                                <span>{isCustomer ? 'You' : msg.senderName}</span>
                                <span>·</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div
                                className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed space-y-1.5 ${
                                  isCustomer
                                    ? 'bg-amber-950/40 text-amber-100 rounded-tr-none border border-amber-500/30'
                                    : 'bg-neutral-900 text-neutral-200 rounded-tl-none border border-neutral-700'
                                }`}
                              >
                                <p>{msg.text}</p>
                                {msg.offerPrice && (
                                  <div className="font-mono font-bold text-[11px] pt-1 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-neutral-400">Offer Amount:</span>
                                    <span className="text-amber-300">{formatINR(msg.offerPrice)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Deal Agreement Finalized Banner */}
                        {currentNeg.status === 'accepted' && (
                          <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm uppercase">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span>Agreement Finalized at {formatINR(currentNeg.agreedPrice || currentNeg.currentOffer)}!</span>
                            </div>
                            <p className="text-xs text-neutral-300">
                              The agreed price has been locked into the secure database. You can proceed directly to checkout.
                            </p>
                            {currentNeg.discountCodeIssued && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-neutral-700 rounded-lg text-xs font-mono">
                                <span className="text-neutral-400">Voucher Code:</span>
                                <strong className="text-white">{currentNeg.discountCodeIssued}</strong>
                                <button
                                  type="button"
                                  onClick={() => copyCoupon(currentNeg.discountCodeIssued!)}
                                  className="text-amber-400 hover:text-white cursor-pointer ml-1"
                                >
                                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={handleProceedToCart}
                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Add to Bag & Checkout at {formatINR(currentNeg.agreedPrice || currentNeg.currentOffer)}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Active Negotiation Action Controls (Counteroffer / Accept / Decline) */}
                      {currentNeg.status !== 'accepted' && currentNeg.status !== 'declined' && (
                        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 space-y-3">
                          {replyError && (
                            <div className="p-2 text-xs bg-red-950 text-red-300 rounded-lg border border-red-500/30">
                              {replyError}
                            </div>
                          )}

                          {/* Quick Acceptance of Owner Counteroffer */}
                          {currentNeg.status === 'countered' && currentNeg.latestOwnerCounter && (
                            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                              <div>
                                <span className="text-xs font-bold text-amber-300 block">
                                  Owner Counter-Offer Available: {formatINR(currentNeg.latestOwnerCounter)}
                                </span>
                                <p className="text-[11px] text-neutral-300">
                                  Vinay & Divyansh offered this price. You can accept it immediately to lock the deal!
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleCustomerAccept}
                                disabled={submittingReply}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Accept {formatINR(currentNeg.latestOwnerCounter)}</span>
                              </button>
                            </div>
                          )}

                          {/* Submit New Counteroffer with Increase / Decrease controls */}
                          <form onSubmit={handleCustomerCounter} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-300">
                                Submit Your Counter-Offer:
                              </span>
                              <span className="text-[11px] font-mono text-neutral-400">
                                Adjust in ₹100 or ₹500 steps
                              </span>
                            </div>

                            {/* Stepper Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => adjustCounterPrice(-500)}
                                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-mono font-bold cursor-pointer"
                              >
                                -₹500
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustCounterPrice(-100)}
                                className="p-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-400">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max={currentNeg.productPrice}
                                  value={counterPrice}
                                  onChange={e => setCounterPrice(Number(e.target.value))}
                                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                                  required
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => adjustCounterPrice(100)}
                                className="p-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustCounterPrice(500)}
                                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-mono font-bold cursor-pointer"
                              >
                                +₹500
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Message to owners (e.g. Can we meet at this price for immediate order?)..."
                                value={counterText}
                                onChange={e => setCounterText(e.target.value)}
                                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                              />
                              <button
                                type="submit"
                                disabled={submittingReply}
                                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{submittingReply ? 'Sending...' : 'Send Counter'}</span>
                              </button>
                            </div>
                          </form>

                          {/* Decline Option */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleCustomerDecline}
                              className="text-[11px] font-mono text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              Decline & close negotiation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="lg:col-span-8 p-12 text-center text-neutral-500">
                      Select a negotiation thread on the left.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
