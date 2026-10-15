import React, { useState } from 'react';
import { SiteSettings, OwnerProfile, FestivalTheme } from '../../../types/store';
import { api } from '../../../services/api';
import { Flame, Sparkles, Check, Gift, Tag, PartyPopper } from 'lucide-react';

interface FestivalThemesViewProps {
  settings: SiteSettings;
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const FestivalThemesView: React.FC<FestivalThemesViewProps> = ({
  settings,
  currentOwner,
  onRefresh
}) => {
  const [active, setActive] = useState(settings.festival.active);
  const [type, setType] = useState<FestivalTheme['type']>(settings.festival.type);
  const [title, setTitle] = useState(settings.festival.title);
  const [bannerMessage, setBannerMessage] = useState(settings.festival.bannerMessage);
  const [promoCode, setPromoCode] = useState(settings.festival.promoCode);
  const [discountBadge, setDiscountBadge] = useState(settings.festival.discountBadge);
  const [showFloatingEffects, setShowFloatingEffects] = useState(settings.festival.showFloatingEffects);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = [
    {
      id: 'diwali',
      name: 'Diwali Luxe Celebration',
      title: 'Diwali Luxe Celebration Drop',
      banner: 'FESTIVAL OF LIGHTS EXCLUSIVE: 15% OFF ALL TECHNICAL OUTERWEAR WITH CODE LIGHTS15',
      code: 'LIGHTS15',
      badge: '15% OFF',
      icon: Flame,
      color: 'border-amber-500/40 text-amber-300'
    },
    {
      id: 'black_friday',
      name: 'Black Friday / Cyber Drop',
      title: 'Black Friday Cyber Week Archive',
      banner: 'MAXIMUM DISCOUNT EVENT: 25% OFF APPAREL CATALOG WITH CODE CYBER25',
      code: 'CYBER25',
      badge: '25% OFF',
      icon: Sparkles,
      color: 'border-red-500/40 text-red-300'
    },
    {
      id: 'christmas',
      name: 'Holiday Season / Winter Archive',
      title: 'Winter Solstice & Holiday Collection',
      banner: 'FROST EDITION: FREE EXPRESS SHIPPING ACROSS INDIA + ₹500 OFF OVER ₹2,500 WITH CODE WINTER50',
      code: 'WINTER50',
      badge: '₹500 OFF',
      icon: Gift,
      color: 'border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'new_year',
      name: 'New Year 2027 Runway Launch',
      title: 'New Year Genesis Drop',
      banner: 'NEW YEAR RUNWAY LAUNCH: 20% OFF ALL 2027 SILHOUETTES WITH CODE GENESIS20',
      code: 'GENESIS20',
      badge: '20% OFF',
      icon: PartyPopper,
      color: 'border-purple-500/40 text-purple-300'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setType(p.id as any);
    setTitle(p.title);
    setBannerMessage(p.banner);
    setPromoCode(p.code);
    setDiscountBadge(p.badge);
    setActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        festival: {
          active,
          type,
          title,
          bannerMessage,
          promoCode,
          discountBadge,
          showFloatingEffects
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update festival settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Storefront Campaigns
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Festival Themes & Celebration Mode
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Activate festive modes like Diwali, Black Friday, Christmas, and New Year with bespoke banner styling and promo vouchers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : success ? 'Festival Live!' : 'Publish Festival Mode'}</span>
        </button>
      </div>

      {/* Preset Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
          One-Click Festival Drops
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map(p => {
            const Icon = p.icon;
            const isSelected = type === p.id && active;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-400 ring-1 ring-amber-400/30'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Code: <strong className="text-white">{p.code}</strong> ({p.badge})
                </div>
                <button
                  type="button"
                  className="w-full py-1 text-[11px] font-mono uppercase rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
                >
                  Apply Template
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-white uppercase">
            Active Campaign Parameters
          </h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
            />
            <span className="text-white font-bold uppercase text-[11px] font-mono">
              {active ? 'Festival Mode: ACTIVE LIVE' : 'Festival Mode: DISABLED'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-neutral-300 mb-1">Campaign Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1">Promo Voucher Code</label>
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. LIGHTS15"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Top Announcement Banner Text *
          </label>
          <textarea
            rows={2}
            value={bannerMessage}
            onChange={e => setBannerMessage(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="floating-fx"
            checked={showFloatingEffects}
            onChange={e => setShowFloatingEffects(e.target.checked)}
            className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
          />
          <label htmlFor="floating-fx" className="text-neutral-300 font-medium cursor-pointer">
            Display subtle ambient festive luminescence & sparkles on homepage
          </label>
        </div>
      </form>
    </div>
  );
};
