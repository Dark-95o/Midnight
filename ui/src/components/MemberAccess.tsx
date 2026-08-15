import React, { useState } from 'react';
import { Key, Cpu, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberAccessProps {
  onProve: (secret: string) => Promise<{ success: boolean; eventId?: string; error?: string }>;
  isConnected: boolean;
}

export const MemberAccess: React.FC<MemberAccessProps> = ({ onProve, isConnected }) => {
  const [secret, setSecret] = useState('');
  const [step, setStep] = useState(0); // 0: Idle, 1: Witness, 2: Circuit, 3: TX, 4: Success
  const [error, setError] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  const handleProve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;

    setError(null);
    setLastEventId(null);
    setStep(1); // Witness Generation

    // Delay to simulate ZK proof steps visually
    await new Promise((r) => setTimeout(r, 1200));
    setStep(2); // Circuit Computation

    await new Promise((r) => setTimeout(r, 1500));
    setStep(3); // Shielded TX Submission

    try {
      const result = await onProve(secret.trim());
      if (result.success && result.eventId) {
        setLastEventId(result.eventId);
        setStep(4); // Success
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
    { label: 'Generating Private Witness', desc: 'Sourcing secret key and building path.' },
    { label: 'Computing ZK Circuit', desc: 'Evaluating constraints locally inside browser.' },
    { label: 'Submitting Shielded Tx', desc: 'Publishing proof & event ID to Midnight ledger.' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[400px]">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <Key className="w-5 h-5 text-cyberCyan" />
        Member Access Verification
      </h2>
      <p className="text-xs text-white/60 mb-6 leading-relaxed">
        Verify your inclusion in CloakPass by generating a zero-knowledge membership proof. Your key remains client-side.
      </p>

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-dashed border-white/10">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Wallet Connection Required</h3>
          <p className="text-xs text-white/50 max-w-[240px] mt-1">
            Please connect your Lace wallet in the top bar to verify membership.
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
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                    Private Membership Secret / Passkey
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="e.g. secret-member-x"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyberCyan/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2.5 items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-red-300 leading-normal">{error}</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!secret.trim()}
                className="w-full bg-gradient-to-r from-cyberCyan to-midnightViolet disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Cpu className="w-4 h-4" />
                Generate ZK Proof & Claim Access
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
                  <span className="text-xs font-bold text-cyberCyan uppercase tracking-widest animate-pulse">
                    Proving Membership...
                  </span>
                  <RefreshCw className="w-4 h-4 text-cyberCyan animate-spin" />
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
                          isPending ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] border ${
                            isDone
                              ? 'bg-cyberCyan/10 border-cyberCyan text-cyberCyan'
                              : isActive
                              ? 'bg-midnightViolet/20 border-midnightViolet text-white animate-pulse'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {isDone ? '✓' : currentIdx}
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-semibold ${
                              isActive ? 'text-white' : 'text-white/70'
                            }`}
                          >
                            {s.label}
                          </h4>
                          <p className="text-[10px] text-white/40 mt-0.5">{s.desc}</p>
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
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg cyan-glow">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">Membership Verified</h3>
                <p className="text-xs text-white/50 max-w-[240px] mt-1.5">
                  Your zero-knowledge proof was successfully verified on the public ledger.
                </p>

                {lastEventId && (
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-[10px] mt-4 max-w-[280px] w-full text-left truncate">
                    <span className="text-white/30 block mb-1">Public Access Event ID:</span>
                    <span className="text-emerald-400 font-semibold">{lastEventId}</span>
                  </div>
                )}
              </div>

              <button
                onClick={resetForm}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 active:scale-[0.99] transition-all"
              >
                Perform Another Verification
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
