import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  X,
  ShieldAlert,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { OwnerProfile } from '../../types/store';
import { api } from '../../services/api';

// Pre-approved authorized owner accounts strictly defined by requirements
const AUTHORIZED_OWNERS = [
  {
    email: 'kambhampallivinay1@gmail.com',
    name: 'Vinay Kambhampalli',
    role: 'Co-Owner & Executive Lead',
    monogram: 'VK'
  },
  {
    email: 'ds694206968@gmail.com',
    name: 'Divyansh (Co-Owner)',
    role: 'Co-Owner & Executive Lead',
    monogram: 'DS'
  }
];

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (owner: OwnerProfile) => void;
  currentOwner: OwnerProfile | null;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated
}) => {
  if (!isOpen) return null;

  // View state: 'login' or 'setup_password'
  const [mode, setMode] = useState<'login' | 'setup_password'>('login');

  // Form states
  const [selectedEmail, setSelectedEmail] = useState<string>('kambhampallivinay1@gmail.com');
  const [customEmail, setCustomEmail] = useState('');
  const [isUsingCustom, setIsUsingCustom] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password reset/setup states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeEmail = isUsingCustom ? customEmail.trim().toLowerCase() : selectedEmail;

  // Handle password sign-in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const emailToUse = activeEmail.trim().toLowerCase();
    if (!emailToUse) {
      setError('Please select or enter an authorized owner email address.');
      return;
    }

    if (!password) {
      setError('Please enter your owner password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.ownerLogin(emailToUse, password);
      onAuthenticated(res.owner);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Owner authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle setting / updating owner password
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const emailToUse = activeEmail.trim().toLowerCase();
    if (!emailToUse) {
      setError('Please select or enter an authorized owner email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.setupOwnerPassword(emailToUse, newPassword, currentPassword || undefined);
      setSuccessMsg(res.message || 'Password successfully updated.');
      setPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update owner password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-950/80 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block mb-1">
            VELNIX.WEAR SECURITY GATEWAY
          </span>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight font-outfit">
            Owner Dashboard Login
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Password-based authentication. Strictly restricted to pre-approved authorized co-owners.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2.5 animate-in shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* MODE 1: Standard Password Sign-In */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                  1. Select Authorized Owner
                </span>

                <div className="space-y-2">
                  {AUTHORIZED_OWNERS.map(owner => {
                    const isSelected = !isUsingCustom && selectedEmail === owner.email;
                    return (
                      <button
                        key={owner.email}
                        type="button"
                        onClick={() => {
                          setSelectedEmail(owner.email);
                          setIsUsingCustom(false);
                          setError(null);
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-neutral-950 hover:bg-neutral-800/80 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected
                                ? 'bg-amber-400 text-black'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {owner.monogram}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{owner.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                                Authorized Co-Owner
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              {owner.email}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Email toggle */}
                <div className="mt-2.5 pt-2 border-t border-neutral-800/70">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Or enter registered owner email:</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="email"
                      placeholder="Enter authorized owner email..."
                      value={customEmail}
                      onFocus={() => setIsUsingCustom(true)}
                      onChange={e => {
                        setCustomEmail(e.target.value);
                        setIsUsingCustom(true);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Owner Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('setup_password');
                      setError(null);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                  >
                    Change / Setup Password
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter account password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Initial Password Quick-Fill Helper */}
                <div className="mt-2 p-2 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>Default: <code className="text-amber-300 font-bold">VelnixOwner@2026</code></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassword('VelnixOwner@2026')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer uppercase"
                  >
                    Quick Fill
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Owner Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 text-[10px] text-neutral-500 font-mono text-center">
                OTP verification is removed. Access is verified server-side with salted SHA-512 hashes.
              </div>
            </form>
          ) : (
            /* MODE 2: Setup / Change Password */
            <form onSubmit={handleSetupPassword} className="space-y-3.5">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                  Configuring Password For
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {activeEmail}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Current Password (optional if initial setup)
                </label>
                <input
                  type="password"
                  placeholder="Enter current password if set..."
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  New Password (min. 8 characters)
                </label>
                <input
                  type="password"
                  placeholder="Enter new strong password..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Save New Owner Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
