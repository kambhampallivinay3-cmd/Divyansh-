import React from 'react';
import { ShieldCheck, Mail, Instagram, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../../types/store';

interface StoreFooterProps {
  settings: SiteSettings;
  onOpenRequests: () => void;
  onOpenTrackOrder: () => void;
  onOpenOwnerAuth: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({
  settings,
  onOpenRequests,
  onOpenTrackOrder,
  onOpenOwnerAuth
}) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-xl font-extrabold text-white tracking-tighter uppercase font-outfit">
              {settings.branding.brandName}
            </span>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              {settings.branding.tagline}. Handcrafted luxury silhouettes built for extreme architectural elegance.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 uppercase">
              {settings.branding.watermarkText}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#collection-grid" className="hover:text-white transition-colors">
                  Runway Drops
                </a>
              </li>
              <li>
                <button onClick={onOpenRequests} className="hover:text-white transition-colors text-left cursor-pointer">
                  Bespoke Design Concierge
                </button>
              </li>
              <li>
                <button onClick={onOpenTrackOrder} className="hover:text-white transition-colors text-left cursor-pointer">
                  Track Delivery
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Concierge
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center gap-2 text-neutral-300">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hover:text-white transition-colors">
                  <a href={`mailto:${settings.branding.contactEmail}`} className="hover:underline">
                    {settings.branding.contactEmail}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <Instagram className="w-3.5 h-3.5 text-neutral-500" />
                <span>{settings.branding.instagramHandle}</span>
              </li>
            </ul>
          </div>

          {/* Owner Entrance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Administration
            </h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Restricted portal for verified brand co-owners Vinay & Divyansh.
            </p>
            <button
              onClick={onOpenOwnerAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner Lobby Entrance</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <div>
            © {new Date().getFullYear()} {settings.branding.brandName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Co-Founder Engine</span>
            <span>·</span>
            <span>Dual-Owner Master Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
