import React from 'react';
import { ArrowLeft, RefreshCw, Shield, User, ExternalLink } from 'lucide-react';
import { OwnerProfile } from '../../types/store';

interface OwnerHeaderProps {
  currentOwner: OwnerProfile;
  sectionTitle: string;
  onSwitchOwner: (targetId: 'vinay' | 'divyansh') => void;
  onBackToStore: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  currentOwner,
  sectionTitle,
  onSwitchOwner,
  onBackToStore
}) => {
  const isVinay = currentOwner.email.toLowerCase() === 'kambhampallivinay1@gmail.com';

  return (
    <header className="h-16 bg-neutral-900 border-b border-neutral-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Breadcrumb section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Return to customer store view"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Storefront</span>
        </button>

        <span className="text-neutral-600">/</span>

        <h1 className="text-sm font-bold text-white uppercase tracking-tight font-outfit">
          {sectionTitle}
        </h1>
      </div>

      {/* Dual Owner Switcher & Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold font-mono">
            {isVinay ? 'VK' : 'DS'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-white leading-none">
              {currentOwner.name}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono leading-none mt-1">
              {currentOwner.email}
            </div>
          </div>
        </div>

        {/* Quick Switch to the other co-owner */}
        <button
          onClick={() => onSwitchOwner(isVinay ? 'divyansh' : 'vinay')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium rounded-lg border border-neutral-700 transition-all cursor-pointer"
          title={`Switch view to co-owner ${isVinay ? 'Divyansh' : 'Vinay Kambhampalli'}`}
        >
          <RefreshCw className="w-3 h-3 text-amber-400" />
          <span>Switch to {isVinay ? 'Divyansh' : 'Vinay'}</span>
        </button>

        {/* Live Customer Storefront quick launch */}
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:from-amber-300 hover:to-amber-200 transition-all cursor-pointer"
          title="Open the Customer Place (Storefront) to browse drops and place orders"
        >
          <span>🛍️ Customer Place (Store)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
