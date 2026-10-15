import React, { useState } from 'react';
import { Discount, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { formatINR } from '../../../utils/currency';
import { Plus, Trash2, Tag, Percent, DollarSign, Calendar, Check, X } from 'lucide-react';

interface DiscountsViewProps {
  discounts: Discount[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const DiscountsView: React.FC<DiscountsViewProps> = ({
  discounts,
  currentOwner,
  onRefresh
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(15);
  const [minSpend, setMinSpend] = useState<number>(2000);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;

    try {
      setSubmitting(true);
      await api.addDiscount({
        code: code.trim().toUpperCase(),
        discountType,
        value: Number(value),
        minSpend: Number(minSpend),
        maxUses: Number(maxUses),
        isActive: true,
        description: description || `${value}${discountType === 'percentage' ? '%' : '₹'} discount code`,
        expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString()
      });
      setModalOpen(false);
      setCode('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create discount');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon code permanently?')) return;
    try {
      await api.deleteDiscount(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Promotional Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Offers, Coupons, and Discounts ({discounts.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Create and track promotional vouchers, festival codes, and agreed negotiation discounts verified at checkout.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Value</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {discounts.map(disc => (
                <tr key={disc.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-white text-sm">
                    <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded tracking-wider">
                      {disc.code}
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400 tabular-nums text-sm">
                    {disc.discountType === 'percentage' ? `${disc.value}% OFF` : `${formatINR(disc.value)} OFF`}
                  </td>

                  <td className="p-4 font-mono text-neutral-300 tabular-nums">
                    {formatINR(disc.minSpend)}
                  </td>

                  <td className="p-4 font-mono text-neutral-300 tabular-nums">
                    {disc.usedCount} / {disc.maxUses}
                  </td>

                  <td className="p-4 text-neutral-300 text-xs max-w-xs truncate">
                    {disc.description}
                  </td>

                  <td className="p-4">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      disc.isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {disc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(disc.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. AUTUMN20"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (₹ INR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Minimum Order (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={minSpend}
                    onChange={e => setMinSpend(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={e => setMaxUses(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. VIP 20% off promotion"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Issue Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
