import React, { useState } from 'react';
import { SiteSettings, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { Palette, Check, Sparkles, Monitor, Eye } from 'lucide-react';

interface ThemeBackgroundViewProps {
  settings: SiteSettings;
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const ThemeBackgroundView: React.FC<ThemeBackgroundViewProps> = ({
  settings,
  currentOwner,
  onRefresh
}) => {
  const [preset, setPreset] = useState<SiteSettings['theme']['preset']>(settings.theme.preset);
  const [backgroundStyle, setBackgroundStyle] = useState<SiteSettings['theme']['backgroundStyle']>(settings.theme.backgroundStyle);
  const [accentColor, setAccentColor] = useState<string>(settings.theme.accentColor);
  const [cardTone, setCardTone] = useState<SiteSettings['theme']['cardTone']>(settings.theme.cardTone);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    {
      id: 'obsidian',
      name: 'Obsidian Luxury',
      desc: 'Deep titanium slate, high contrast monochrome, minimalist Japanese streetwear aesthetic.',
      accent: '#38bdf8'
    },
    {
      id: 'cyber_neon',
      name: 'Cyber Neon',
      desc: 'Dark asphalt canvas with sharp electric cyan and lime accents for futuristic technical wear.',
      accent: '#06b6d4'
    },
    {
      id: 'brutalist_raw',
      name: 'Brutalist Raw',
      desc: 'Architectural concrete tones, sharp hairline dividers, heavy geometric display weights.',
      accent: '#f97316'
    },
    {
      id: 'minimal_chalk',
      name: 'Minimal Chalk',
      desc: 'Subdued graphite foundation with pure chalk highlights for high-fashion runway exclusivity.',
      accent: '#ffffff'
    }
  ];

  const backgroundStyles = [
    { id: 'solid', name: 'Solid Minimalist', desc: 'Clean, distraction-free neutral dark luxury canvas.' },
    { id: 'mesh', name: 'Ambient Radial Glow', desc: 'Subtle top atmospheric spotlight simulating runway stage illumination.' },
    { id: 'grid', name: 'Architectural Grid', desc: 'Technical hairline coordinate grid for cyber apparel aesthetic.' },
    { id: 'grain', name: 'Film Grain Texture', desc: 'Tactile editorial noise giving organic analog feel to the storefront.' }
  ];

  const accentPalette = [
    { label: 'Cyan Glow', hex: '#38bdf8' },
    { label: 'Hyper Emerald', hex: '#10b981' },
    { label: 'Electric Amber', hex: '#f59e0b' },
    { label: 'Crimson Drop', hex: '#ef4444' },
    { label: 'Purple Luxe', hex: '#a855f7' },
    { label: 'Stark White', hex: '#ffffff' }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        theme: {
          preset,
          backgroundStyle,
          accentColor,
          cardTone
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update theme');
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
            Aesthetic Configuration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Website Theme and Background
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Customize the storefront color grading, background geometry, and primary brand accents. Updates apply live to all shoppers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : savedSuccess ? 'Published Live!' : 'Save & Publish Theme'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
              1. Curated Theme Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setPreset(p.id as any);
                    setAccentColor(p.accent);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    preset === p.id
                      ? 'bg-neutral-900 border-amber-400 ring-1 ring-amber-400/30'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-light">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Background Styling */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
              2. Storefront Background Styling
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backgroundStyles.map(bg => (
                <div
                  key={bg.id}
                  onClick={() => setBackgroundStyle(bg.id as any)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    backgroundStyle === bg.id
                      ? 'bg-neutral-900 border-amber-400 ring-1 ring-amber-400/30'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{bg.name}</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-light">{bg.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Accent Color */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
              3. Interactive Accent Palette
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {accentPalette.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccentColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    accentColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'bg-neutral-800 border-white text-white font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Viewport Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-white uppercase font-mono tracking-wider">
              Live Preview Simulation
            </label>
            <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Dynamic Shader
            </span>
          </div>

          <div
            className={`p-6 rounded-2xl border border-neutral-800 relative overflow-hidden transition-all duration-300 min-h-[380px] flex flex-col justify-between ${
              preset === 'cyber_neon'
                ? 'bg-neutral-950'
                : preset === 'brutalist_raw'
                ? 'bg-stone-950'
                : preset === 'minimal_chalk'
                ? 'bg-[#0f1115]'
                : 'bg-neutral-950'
            }`}
          >
            {/* Background simulation layer */}
            {backgroundStyle === 'mesh' && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${accentColor} 0%, transparent 70%)`
                }}
              />
            )}
            {backgroundStyle === 'grid' && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            )}

            {/* Simulated storefront card */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-extrabold uppercase tracking-tight text-white font-outfit text-sm">
                  {settings.branding.brandName}
                </span>
                <span className="text-[10px] font-mono" style={{ color: accentColor }}>
                  LIVE DEMO
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 backdrop-blur-sm">
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  Preset: {preset.replace('_', ' ')}
                </span>
                <h4 className="text-base font-bold text-white font-outfit uppercase">
                  Tactical Modular Outerwear
                </h4>
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-lg font-bold text-white">₹3,499</span>
                  <span className="text-xs" style={{ color: accentColor }}>
                    Free Shipping
                  </span>
                </div>
                <button
                  type="button"
                  className="w-full py-2 text-xs font-bold uppercase rounded-lg transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: accentColor,
                    color: accentColor === '#ffffff' ? '#000000' : '#ffffff'
                  }}
                >
                  Simulated CTA Button
                </button>
              </div>
            </div>

            <div className="relative z-10 pt-4 text-[10px] font-mono text-neutral-500 border-t border-white/10 flex justify-between">
              <span>Background: {backgroundStyle}</span>
              <span>Accent: {accentColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
