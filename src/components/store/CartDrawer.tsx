import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OrderItem } from '../../types/store';
import { api } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Checkout form states
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [notes, setNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await api.validateCoupon(couponCode, subtotal);
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (!customerName || !customerEmail || !shippingAddress) {
      setOrderError('Please enter full customer name, email, and shipping address.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const order = await api.createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city: city || 'Mumbai',
        postalCode: postalCode || '400050',
        items,
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        total,
        paymentMethod,
        notes
      });
      onClearCart();
      setIsCheckoutStep(false);
      onOrderSuccess(order);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              {isCheckoutStep ? 'Secure Checkout' : `Shopping Bag (${items.reduce((acc, i) => acc + i.quantity, 0)})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <p className="text-neutral-400 text-sm">Your shopping bag is currently empty.</p>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs bg-white text-black font-semibold rounded-lg uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Browse Drops
              </button>
            </div>
          ) : !isCheckoutStep ? (
            // Cart Items List
            <>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size}-${idx}`}
                    className="flex gap-3.5 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/80 items-center"
                  >
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg bg-neutral-950"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 flex-wrap">
                        <span className="font-mono">Size: {item.size}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums text-neutral-300 font-semibold">{formatINR(item.price)}</span>
                        {item.negotiationId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            🤝 Agreed Deal Price
                          </span>
                        )}
                        {item.originalPrice && item.originalPrice !== item.price && (
                          <span className="text-[10px] font-mono line-through text-neutral-500">
                            {formatINR(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-neutral-700 rounded bg-neutral-950">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, -1)}
                            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, 1)}
                            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.productId, item.size)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-2 border-t border-neutral-800">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Promo / Offer code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-red-400 mt-1.5">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                    <div>
                      <span className="font-mono font-bold tracking-wider">{appliedCoupon.code}</span> applied:
                      <span className="text-[11px] block text-emerald-400">{appliedCoupon.description}</span>
                    </div>
                    <span className="font-mono font-bold tabular-nums">-{formatINR(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Checkout Form
            <form onSubmit={handleCheckoutSubmit} id="checkout-form" className="space-y-3.5">
              {orderError && (
                <div className="p-3 text-xs bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg">
                  {orderError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="jordan@example.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 00000"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Shipping Street Address *</label>
                <input
                  type="text"
                  placeholder="Street name, apartment, suite"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Postal / PIN Code</label>
                  <input
                    type="text"
                    placeholder="400050"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'bg-neutral-800 text-white border-white/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    Cash on Delivery (COD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'bg-neutral-800 text-white border-white/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    Credit / Debit Card / UPI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Gate code, concierge instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer with Calculations & CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-800 bg-neutral-900/60 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount</span>
                  <span className="font-mono tabular-nums">-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 uppercase font-mono text-[11px]">Free Worldwide</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-lg">{formatINR(total)}</span>
              </div>
            </div>

            {!isCheckoutStep ? (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="py-2.5 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Back to Bag
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submittingOrder}
                  className="py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
