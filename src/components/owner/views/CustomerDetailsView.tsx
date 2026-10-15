import React, { useState } from 'react';
import { Customer, OwnerProfile } from '../../../types/store';
import { formatINR } from '../../../utils/currency';
import { Search, Crown, User, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

interface CustomerDetailsViewProps {
  customers: Customer[];
  currentOwner: OwnerProfile;
}

export const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({
  customers,
  currentOwner
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'VIP' | 'Regular' | 'New'>('all');

  const filtered = customers.filter(c => {
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Clientele & VIP Relationship Management
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Customer Details ({customers.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by client or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            {['all', 'VIP', 'Regular', 'New'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t as any)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  tierFilter === t
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer CRM Table */}
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Client Tier</th>
                <th className="p-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 font-mono text-[11px]">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{cust.name}</span>
                    </div>
                  </td>

                  <td className="p-4 text-neutral-300">
                    <div className="font-mono text-[11px]">{cust.email}</div>
                    <div className="text-neutral-500 text-[10px]">{cust.phone || 'No phone'}</div>
                  </td>

                  <td className="p-4 text-neutral-300">
                    {cust.city || 'United States'}
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400 tabular-nums text-sm">
                    {formatINR(cust.totalSpent)}
                  </td>

                  <td className="p-4 font-mono text-neutral-300 tabular-nums">
                    {cust.ordersCount} orders
                  </td>

                  <td className="p-4">
                    {cust.tier === 'VIP' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Crown className="w-3 h-3 text-amber-400" />
                        VIP ARCHIVE
                      </span>
                    ) : cust.tier === 'New' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        NEW CLIENT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                        REGULAR
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-mono text-[11px] text-neutral-500">
                    {new Date(cust.lastOrderDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
