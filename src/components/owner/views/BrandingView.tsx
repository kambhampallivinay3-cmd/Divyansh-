import React, { useState } from 'react';
import { SiteSettings, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { Sparkles, Check, Globe, Instagram, Mail, Eye } from 'lucide-react';

interface BrandingViewProps {
  settings: SiteSettings;
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const BrandingView: React.FC<BrandingViewProps> = ({
  settings,
  currentOwner,
  onRefresh
}) => {
  const [brandName, setBrandName] = useState(settings.branding.brandName);
  const [tagline, setTagline] = useState(settings.branding.tagline);
  const [monogram, setMonogram] = useState(settings.branding.monogram);
  const [watermarkText, setWatermarkText] = useState(settings.branding.watermarkText);
  const [contactEmail, setContactEmail] = useState(settings.branding.contactEmail);
  const [instagramHandle, setInstagramHandle] = useState(settings.branding.instagramHandle);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        branding: {
          brandName,
          tagline,
          monogram,
          watermarkText,
          contactEmail,
          instagramHandle
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update branding');
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
            Identity & Typography
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Logo and Branding
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure the brand wordmark, monogram emblem, collection watermark, and social handles across the e-commerce storefront.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Updating...' : success ? 'Branding Saved!' : 'Save Branding Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-300 mb-1">Store Brand Wordmark *</label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-outfit font-extrabold uppercase text-sm tracking-tight focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-300 mb-1">Monogram / Abbreviation</label>
              <input
                type="text"
                value={monogram}
                onChange={e => setMonogram(e.target.value)}
                placeholder="e.g. VNX"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">Watermark / Header Stamp</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                placeholder="e.g. VELNIX ARCHIVE 2026"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1">Official Brand Tagline</label>
            <textarea
              rows={2}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none font-light"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                Concierge Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-neutral-400" />
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </form>

        {/* Live Brand Preview Card */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
            Brand Lockup Live Preview
          </label>

          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6 text-center flex flex-col justify-center items-center shadow-2xl min-h-[320px]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-mono font-extrabold text-xl shadow-lg">
              {monogram || 'V'}
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-white tracking-tighter uppercase font-outfit">
                {brandName}
              </h3>
              <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto mt-2 leading-relaxed">
                {tagline}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest pt-2 border-t border-neutral-800 w-full justify-center">
              <span>{watermarkText}</span>
              <span>·</span>
              <span>{instagramHandle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
