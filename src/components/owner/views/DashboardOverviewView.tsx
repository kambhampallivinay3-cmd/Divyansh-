import React from 'react';
import {
  DollarSign,
  Package,
  CircleDollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
  Inbox,
  AlertOctagon,
  Boxes
} from 'lucide-react';
import { OwnerProfile } from '../../../types/store';
import { OwnerSection } from '../OwnerSidebar';
import { formatINR } from '../../../utils/currency';

interface DashboardOverviewViewProps {
  stats: any;
  currentOwner: OwnerProfile;
  onNavigate: (section: OwnerSection) => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  stats,
  currentOwner,
  onNavigate
}) => {
  if (!stats) return <div className="p-8 text-neutral-400">Loading metrics...</div>;

  const kpis = [
    {
      label: 'Gross Sales Revenue',
      value: formatINR(stats.grossRevenue || 0),
      sub: `${stats.totalUnitsSold || 0} units delivered/confirmed`,
      icon: DollarSign,
      color: 'text-emerald-400',
      action: () => onNavigate('accepted_orders')
    },
    {
      label: 'Incoming Orders',
      value: stats.orders?.incoming || 0,
      sub: 'Awaiting co-owner acceptance',
      icon: Inbox,
      color: 'text-sky-400',
      action: () => onNavigate('incoming_orders')
    },
    {
      label: 'Price Negotiations',
      value: stats.negotiations?.pending || 0,
      sub: 'Active customer counter-offers',
      icon: CircleDollarSign,
      color: 'text-amber-400',
      action: () => onNavigate('negotiations')
    },
    {
      label: 'Low Stock Alerts',
      value: stats.inventory?.lowStock || 0,
      sub: `Across ${stats.inventory?.totalProducts || 0} active runway pieces`,
      icon: AlertTriangle,
      color: 'text-red-400',
      action: () => onNavigate('inventory')
    }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Welcome to Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-1">
            Executive Dashboard · {currentOwner.name}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time synchronization active with co-owner. You have full master privileges across store operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            + Add New Drop
          </button>
          <button
            onClick={() => onNavigate('festivals')}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Festival Drops
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 hover:border-neutral-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>{kpi.sub}</span>
                <ArrowUpRight className="w-3 h-3 group-hover:text-white transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Action Queues & Recent Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention Queues */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Urgent Owner Action Queues
            </h3>
            <span className="text-xs font-mono text-neutral-500">Priority Feed</span>
          </div>

          <div className="space-y-3">
            {/* Incoming Orders Action */}
            <div
              onClick={() => onNavigate('incoming_orders')}
              className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-sky-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Review Incoming Orders</div>
                  <div className="text-[11px] text-neutral-400">
                    {stats.orders?.incoming || 0} order(s) waiting for acceptance
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 bg-sky-500/10 rounded">
                Review
              </span>
            </div>

            {/* Negotiations Action */}
            <div
              onClick={() => onNavigate('negotiations')}
              className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Customer Price Negotiations</div>
                  <div className="text-[11px] text-neutral-400">
                    {stats.negotiations?.pending || 0} active counter-offer proposal(s)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded">
                Negotiate
              </span>
            </div>

            {/* Cancellation Requests Action */}
            <div
              onClick={() => onNavigate('cancellation_requests')}
              className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-red-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Order Cancellation Requests</div>
                  <div className="text-[11px] text-neutral-400">
                    {stats.orders?.cancellationRequests || 0} customer cancellation request(s)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 px-2 py-0.5 bg-red-500/10 rounded">
                Manage
              </span>
            </div>

            {/* Customer Bespoke Requests */}
            <div
              onClick={() => onNavigate('customer_requests')}
              className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-purple-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Bespoke Design Requests</div>
                  <div className="text-[11px] text-neutral-400">
                    {stats.customerRequests?.new || 0} unread customer styling request(s)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded">
                Open
              </span>
            </div>
          </div>
        </div>

        {/* Live Order Velocity */}
        <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Recent Store Activity
            </h3>
            <span className="text-xs font-mono text-neutral-500">Live Database</span>
          </div>

          <div className="space-y-3">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((ord: any) => (
                <div key={ord.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-white">{ord.orderNumber} · {ord.customerName}</div>
                    <div className="text-[11px] text-neutral-400">{ord.items.length} item(s) · {ord.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{formatINR(ord.total)}</div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">{ord.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-6 text-center">No orders recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
