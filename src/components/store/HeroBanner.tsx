import React from 'react';
import { ArrowDown, Flame, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../../types/store';
import { resolveImageUrl } from '../../utils/imageHelper';

interface HeroBannerProps {
  settings: SiteSettings;
  onExploreClick: () => void;
  onBespokeClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreClick,
  onBespokeClick
}) => {
  return (
    <section className="relative w-full h-[540px] sm:h-[620px] overflow-hidden bg-neutral-950 flex items-end">
      {/* Editorial Background Image with Scrim */}
      <img
        src={resolveImageUrl('/src/assets/images/hero_velnix_campaign_1791891336301.jpg')}
        alt="VELNIX.WEAR Campaign"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70 filter contrast-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-300 font-mono">
            <span>{settings.branding.watermarkText}</span>
            <span aria-hidden="true">/</span>
            <span>AUTUMN RUNWAY EDITION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none font-outfit uppercase">
            Architectural <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              Streetwear
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-light leading-relaxed">
            {settings.branding.tagline}. Hand-tailored heavyweight silhouettes engineered for modern urban utility and extreme durability.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onBespokeClick}
              className="px-5 py-3 bg-neutral-900/80 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <span>Custom Bespoke Piece</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
