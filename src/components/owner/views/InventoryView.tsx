import React, { useState, useEffect } from 'react';
import { OwnerProfile, Product, InventoryLog } from '../../../types/store';
import { api } from '../../../services/api';
import { Boxes, AlertTriangle, Plus, History, ArrowUpRight, Check } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  currentOwner,
  onRefresh
}) => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [restockModal, setRestockModal] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockReason, setRestockReason] = useState('Supplier batch replenishment');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      const data = await api.getInventory();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModal || restockAmount <= 0) return;

    try {
      setSubmitting(true);
      await api.restock(restockModal.id, restockAmount, restockReason, currentOwner.name);
      setRestockModal(null);
      await loadInventoryData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Restock failed');
    } finally {
      setSubmitting(false);
    }
  };

  const quickRestock = async (product: Product, amount: number) => {
    try {
      await api.restock(product.id, amount, `Quick +${amount} restock by ${currentOwner.name}`, currentOwner.name);
      await loadInventoryData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Restock failed');
    }
  };

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Warehouse & Supply Chain
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Inventory & Stock Audit
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time stock monitoring, low-stock threshold triggers, and full restock audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono">
            Total Inventory: <strong className="text-white tabular-nums">{totalUnits} units</strong>
          </div>
          {lowStockCount > 0 && (
            <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lowStockCount} Low Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="p-4">Product Piece</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Available Units</th>
                <th className="p-4">Status Alert</th>
                <th className="p-4">Quick Add Units</th>
                <th className="p-4 text-right">Custom Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {products.map(p => {
                const isLow = p.stock <= 5;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded bg-neutral-900" />
                        <span className="font-bold text-white line-clamp-1">{p.title}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-neutral-300 font-semibold">
                      {p.sku}
                    </td>

                    <td className="p-4 font-mono text-base font-bold tabular-nums text-white">
                      {p.stock}
                    </td>

                    <td className="p-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/10 text-red-300 border border-red-500/30">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Critical Low ({p.stock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Healthy Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => quickRestock(p, 5)}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 text-[11px] font-mono cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => quickRestock(p, 20)}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 text-[11px] font-mono cursor-pointer"
                        >
                          +20
                        </button>
                        <button
                          onClick={() => quickRestock(p, 50)}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 text-[11px] font-mono cursor-pointer"
                        >
                          +50
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setRestockModal(p);
                          setRestockAmount(15);
                        }}
                        className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Stock Audit Trail */}
      <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Warehouse Activity Audit Trail
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">Persistent Ledger</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white">{log.productTitle}</span>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {log.reason} · by <strong className="text-neutral-300">{log.by}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <span
                  className={`font-bold tabular-nums ${
                    log.delta > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {log.delta > 0 ? `+${log.delta}` : log.delta} units
                </span>
                <div className="text-[10px] text-neutral-500">
                  New stock: {log.newStock} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restock Custom Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              Restock: {restockModal.title}
            </h3>

            <form onSubmit={handleRestock} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Units to Add to Stock *
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Audit Reason / Source *
                </label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={e => setRestockReason(e.target.value)}
                  placeholder="e.g. Shipment batch arrival from factory"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModal(null)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
