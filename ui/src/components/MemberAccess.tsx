import React, { useState } from 'react';
import { Key, Cpu, RefreshCw, AlertTriangle, ShieldCheck, Sparkles, Eye, EyeOff, Dices, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberAccessProps {
  onProve: (secret: string) => Promise<{ success: boolean; eventId?: string; error?: string }>;
  isConnected: boolean;
}

export const MemberAccess: React.FC<MemberAccessProps> = ({ onProve, isConnected }) => {
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Witness, 2: Circuit, 3: TX, 4: Success
  const [error, setError] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const PRESET_PASSKEYS = ['secret-member-key-1', 'vip-passkey-beta-99', 'stealth-access-alpha'];

  const generateRandomSecret = () => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    setSecret(`cloak-member-${randomHex}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;

    setError(null);
    setLastEventId(null);
    setStep(1);

    await new Promise((r) => setTimeout(r, 1200));
    setStep(2);

    await new Promise((r) => setTimeout(r, 1500));
    setStep(3);

    try {
      const result = await onProve(secret.trim());
      if (result.success && result.eventId) {
        setLastEventId(result.eventId);
        setStep(4);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during proof verification');
      setStep(0);
    }
  };

  const resetForm = () => {
    setSecret('');
    setStep(0);
    setError(null);
    setLastEventId(null);
  };

  const stepsList = [
    { label: 'Sourcing Private Witness', desc: 'Constructing Merkle proof path locally.' },
    { label: 'Evaluating ZK Circuit', desc: 'Processing constraint satisfaction inside browser.' },
    { label: 'Submitting Shielded Tx', desc: 'Posting anonymous event nonce to Midnight ledger.' }
  ];

  return (
    <div className="cream-card rounded-3xl p-6 border border-[#E5DFD5] shadow-sm relative overflow-hidden flex flex-col h-full min-h-[440px] bg-[#FFFDF9]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5DFD5]">
        <h2 className="text-xl font-extrabold text-[#1C1917] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#E5DFD5] flex items-center justify-center text-[#C2410C] shadow-sm">
            <Key className="w-5 h-5 text-[#C2410C]" />
          </div>
          <span>Member Verification</span>
        </h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2410C] bg-[#F4EFE6] px-2.5 py-1 rounded-full border border-[#E5DFD5]">
          Client Shielded
        </span>
      </div>

      <p className="text-xs text-[#57534E] mb-5 leading-relaxed">
        Prove eligibility in CloakPass by compiling a zero-knowledge membership proof. Your key never leaves your device.
      </p>

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F4EFE6] rounded-2xl border border-dashed border-[#D4CBBE]">
          <AlertTriangle className="w-8 h-8 text-[#B45309] mb-3" />
          <h3 className="text-sm font-bold text-[#1C1917]">Wallet Connection Required</h3>
          <p className="text-xs text-[#57534E] max-w-[240px] mt-1 leading-relaxed">
            Connect your wallet using the top bar to initiate ZK proof generation.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleProve}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      Private Passkey / Secret Seed
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomSecret}
                      className="text-[10px] text-[#C2410C] hover:text-[#9A3412] font-mono flex items-center gap-1 bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E5DFD5] transition-all active:scale-95"
                    >
                      <Dices className="w-3 h-3 text-[#C2410C]" /> Random Key
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Enter passkey e.g. secret-member-key-1"
                      className="w-full bg-[#F4EFE6] border border-[#E5DFD5] rounded-xl px-4 py-3 pr-10 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]/30 transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Preset Fast Keys */}
                <div>
                  <span className="text-[10px] text-[#78716C] block mb-1.5 uppercase font-bold tracking-wider">
                    Preset Allowlist Secrets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PASSKEYS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSecret(k)}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#F4EFE6] hover:bg-[#E5DFD5] text-[#1C1917] border border-[#E5DFD5] transition-all active:scale-95"
                      >
                        + {k}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-[#FDF4F0] border border-[#F87171] rounded-xl p-3 flex gap-2.5 items-start shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-[#991B1B] leading-normal font-mono">{error}</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!secret.trim()}
                className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white disabled:opacity-50 py-3 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
              >
                <Cpu className="w-4 h-4 stroke-[2.5]" />
                Compile ZK Proof & Claim Access
              </button>
            </motion.form>
          )}

          {step >= 1 && step <= 3 && (
            <motion.div
              key="stepper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div className="space-y-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 animate-spin text-[#C2410C]" /> Computing Proof Constraints...
                  </span>
                  <RefreshCw className="w-4 h-4 text-[#B45309] animate-spin" />
                </div>

                <div className="space-y-4">
                  {stepsList.map((s, idx) => {
                    const currentIdx = idx + 1;
                    const isPending = step < currentIdx;
                    const isActive = step === currentIdx;
                    const isDone = step > currentIdx;

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 items-start transition-all duration-300 ${
                          isPending ? 'opacity-40' : 'opacity-100'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] border ${
                            isDone
                              ? 'bg-[#15803D] border-[#15803D] text-white'
                              : isActive
                              ? 'bg-[#C2410C] border-[#C2410C] text-white shadow-sm'
                              : 'bg-[#F4EFE6] border-[#E5DFD5] text-[#78716C]'
                          }`}
                        >
                          {isDone ? '✓' : currentIdx}
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-bold ${
                              isActive ? 'text-[#C2410C]' : 'text-[#1C1917]'
                            }`}
                          >
                            {s.label}
                          </h4>
                          <p className="text-[10px] text-[#57534E] mt-0.5 font-mono">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#F4EFE6] border border-[#E5DFD5] flex items-center justify-center mb-3 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-[#15803D]" />
                </div>
                <h3 className="text-base font-extrabold text-[#1C1917]">Verification Confirmed!</h3>
                <p className="text-xs text-[#57534E] max-w-[260px] mt-1 leading-relaxed">
                  Your allowance proof was accepted by Midnight smart contract. Zero private data revealed.
                </p>

                {lastEventId && (
                  <div className="bg-[#F4EFE6] border border-[#E5DFD5] p-3 rounded-xl font-mono text-[10px] mt-4 max-w-[280px] w-full text-left relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#78716C] font-bold uppercase text-[9px]">Public Anonymous Event ID:</span>
                      <button
                        onClick={() => copyToClipboard(lastEventId)}
                        className="text-[#C2410C] hover:text-[#9A3412] flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="text-[#1C1917] font-bold break-all">{lastEventId}</span>
                  </div>
                )}
              </div>

              <button
                onClick={resetForm}
                className="w-full bg-[#F4EFE6] border border-[#E5DFD5] text-[#1C1917] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#E5DFD5] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#C2410C]" /> Verify Another Key
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

