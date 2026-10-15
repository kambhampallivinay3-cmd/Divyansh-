import React, { useState } from 'react';
import { Sparkles, Copy, Check, Flame } from 'lucide-react';
import { FestivalTheme } from '../../types/store';

interface FestivalBannerProps {
  festival: FestivalTheme;
}

export const FestivalBanner: React.FC<FestivalBannerProps> = ({ festival }) => {
  const [copied, setCopied] = useState(false);

  if (!festival.active || festival.type === 'none') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(festival.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const festivalThemeColors = {
    diwali: 'from-amber-950 via-yellow-950/80 to-stone-950 border-amber-500/30 text-amber-200',
    black_friday: 'from-neutral-950 via-red-950/70 to-neutral-950 border-red-500/30 text-red-200',
    christmas: 'from-emerald-950 via-teal-950/80 to-stone-950 border-emerald-500/30 text-emerald-200',
    new_year: 'from-purple-950 via-indigo-950/80 to-stone-950 border-purple-500/30 text-purple-200',
    halloween: 'from-orange-950 via-neutral-950 to-neutral-950 border-orange-500/30 text-orange-200',
    none: ''
  }[festival.type] || 'from-neutral-900 to-neutral-950 border-neutral-700 text-neutral-200';

  return (
    <aside aria-label="Festive announcement" className={`relative overflow-hidden bg-gradient-to-r ${festivalThemeColors} border-b px-4 py-2 text-xs transition-all`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {festival.type === 'diwali' ? (
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="font-semibold uppercase tracking-wider">{festival.title}:</span>
          <span className="opacity-90">{festival.bannerMessage}</span>
        </div>

        {festival.promoCode && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 hover:bg-black/60 border border-white/20 rounded font-mono text-[11px] transition-colors cursor-pointer shrink-0"
          >
            <span>CODE: <strong className="text-white tracking-widest">{festival.promoCode}</strong></span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-70" />}
          </button>
        )}
      </div>
    </aside>
  );
};
