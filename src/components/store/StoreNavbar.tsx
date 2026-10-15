import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, SlidersHorizontal, MessageSquarePlus, CircleDollarSign } from 'lucide-react';
import { SiteSettings, OwnerProfile } from '../../types/store';

interface NavbarProps {
  settings: SiteSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenRequests: () => void;
  onOpenTrackOrder: () => void;
  onOpenNegotiate?: () => void;
  currentOwner: OwnerProfile | null;
  onToggleOwnerLobby: () => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  categories: { id: string; name: string }[];
}

export const StoreNavbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenRequests,
  onOpenTrackOrder,
  onOpenNegotiate,
  currentOwner,
  onToggleOwnerLobby,
  selectedCategory,
  onSelectCategory,
  categories
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectCategory('all')}
            className="flex items-baseline gap-2.5 text-left group cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tighter text-white font-outfit uppercase">
              {settings.branding.brandName}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
              {settings.branding.monogram}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-900 border border-neutral-700/80 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Customer Place
            </span>
          </button>
        </div>

        {/* Category Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-neutral-300">
          <button
            onClick={() => onSelectCategory('all')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all' ? 'text-white font-semibold underline underline-offset-8' : 'hover:text-white'
            }`}
          >
            All Drops
          </button>
          {categories.slice(0, 4).map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id ? 'text-white font-semibold underline underline-offset-8' : 'hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={onOpenRequests}
            className="text-neutral-400 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Bespoke Request
          </button>
          {onOpenNegotiate && (
            <button
              onClick={onOpenNegotiate}
              className="text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Price Offers</span>
            </button>
          )}
        </nav>

        {/* Action Controls & Owner Access */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenNegotiate && (
            <button
              onClick={onOpenNegotiate}
              className="sm:hidden flex items-center justify-center p-2 text-amber-300 bg-neutral-900 border border-amber-500/30 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Price Negotiations & Counteroffers"
            >
              <CircleDollarSign className="w-4 h-4 text-amber-400" />
            </button>
          )}
          <button
            onClick={onOpenTrackOrder}
            className="hidden sm:flex text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            Track Order
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 text-neutral-200 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Owner Lobby Command Trigger */}
          <button
            onClick={onToggleOwnerLobby}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentOwner
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Owner Lobby</span>
            {currentOwner && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
