import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  CircleDollarSign,
  Inbox,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Shirt,
  Layers,
  Users,
  Palette,
  Sparkles,
  Flame,
  BadgePercent,
  Boxes
} from 'lucide-react';

export type OwnerSection =
  | 'dashboard'
  | 'customer_requests'
  | 'negotiations'
  | 'incoming_orders'
  | 'accepted_orders'
  | 'declined_orders'
  | 'cancellation_requests'
  | 'products'
  | 'categories'
  | 'customer_details'
  | 'theme_background'
  | 'branding'
  | 'festivals'
  | 'discounts'
  | 'inventory';

interface OwnerSidebarProps {
  currentSection: OwnerSection;
  onSelectSection: (section: OwnerSection) => void;
  onBackToStore?: () => void;
  counts: {
    incomingOrders: number;
    cancellationRequests: number;
    pendingNegotiations: number;
    newRequests: number;
    lowStockProducts: number;
  };
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  currentSection,
  onSelectSection,
  onBackToStore,
  counts
}) => {
  const navItems: { id: OwnerSection; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'customer_requests', label: 'Customer Requests', icon: MessageSquareText, badge: counts.newRequests, badgeColor: 'bg-purple-500' },
    { id: 'negotiations', label: 'Negotiate With Customers', icon: CircleDollarSign, badge: counts.pendingNegotiations, badgeColor: 'bg-amber-500' },
    { id: 'incoming_orders', label: 'Incoming Orders', icon: Inbox, badge: counts.incomingOrders, badgeColor: 'bg-sky-500' },
    { id: 'accepted_orders', label: 'Accepted Orders', icon: CheckCircle },
    { id: 'declined_orders', label: 'Declined Orders', icon: XCircle },
    { id: 'cancellation_requests', label: 'Order Cancellation Requests', icon: AlertOctagon, badge: counts.cancellationRequests, badgeColor: 'bg-red-500' },
    { id: 'products', label: 'Products — Add, Edit, Delete', icon: Shirt },
    { id: 'categories', label: 'Categories Management', icon: Layers },
    { id: 'customer_details', label: 'Customer Details & Places', icon: Users },
    { id: 'theme_background', label: 'Website Theme and Background', icon: Palette },
    { id: 'branding', label: 'Logo and Branding', icon: Sparkles },
    { id: 'festivals', label: 'Festival Themes', icon: Flame },
    { id: 'discounts', label: 'Offers, Coupons, and Discounts', icon: BadgePercent },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: counts.lowStockProducts, badgeColor: 'bg-amber-600' }
  ];

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0 min-h-screen">
      {/* Lobby Brand Label */}
      <div className="p-4 border-b border-neutral-800 space-y-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-semibold block">
            Authorized Command Center
          </span>
          <h2 className="text-base font-extrabold text-white tracking-tight uppercase font-outfit mt-0.5">
            VELNIX OWNER LOBBY
          </h2>
        </div>
        {onBackToStore && (
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            title="Open customer storefront view"
          >
            <span>🛍️ Customer Place (Store)</span>
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full text-white tabular-nums ${
                    item.badgeColor || 'bg-neutral-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Co-Ownership Guarantee Marker */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/80 text-[10px] text-neutral-500 font-mono">
        <div className="text-neutral-400 font-medium">Dual-Owner Synced</div>
        <div>Vinay · Divyansh (Equal Privileges)</div>
      </div>
    </aside>
  );
};
