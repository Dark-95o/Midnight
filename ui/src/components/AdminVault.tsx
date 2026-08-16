import React, { useState } from 'react';
import { Database, PlusCircle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AdminVaultProps {
  onRegister: (secret: string) => Promise<{ success: boolean; commitment?: string; error?: string }>;
  commitments: string[];
  maxLeaves: number;
  isConnected: boolean;
  isAdmin: boolean;
}

export const AdminVault: React.FC<AdminVaultProps> = ({
  onRegister,
  commitments,
  maxLeaves,
  isConnected,
  isAdmin
}) => {
  const [memberSecret, setMemberSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberSecret.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const result = await onRegister(memberSecret.trim());
      if (result.success && result.commitment) {
        setSuccessMsg(`Commitment successfully registered: ${result.commitment.substring(0, 16)}...`);
        setMemberSecret('');
      } else {
        throw new Error(result.error || 'Failed to register commitment');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registeredCount = commitments.filter(c => c !== '0000000000000000000000000000000000000000000000000000000000000000').length;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[400px]">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <Database className="w-5 h-5 text-midnightViolet" />
        Admin Shielded Vault
      </h2>
      <p className="text-xs text-white/60 mb-6 leading-relaxed">
        Register new member secrets to the allowlist commitments tree. The member's plain secret is hashed off-chain and registered anonymously.
      </p>

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-dashed border-white/10">
          <ShieldAlert className="w-8 h-8 text-yellow-500 mb-3 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Wallet Connection Required</h3>
          <p className="text-xs text-white/50 max-w-[240px] mt-1">
            Please connect your Lace wallet to access the Admin Vault.
          </p>
        </div>
      ) : !isAdmin ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-dashed border-white/10">
          <ShieldAlert className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-sm font-semibold text-white">Unauthorized Access</h3>
          <p className="text-xs text-white/50 max-w-[240px] mt-1">
            Connected address does not have admin authority to modify this allowlist.
          </p>
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                New Member Secret / Passkey (to be committed)
              </label>
              <input
                type="text"
                value={memberSecret}
                onChange={(e) => setMemberSecret(e.target.value)}
                placeholder="e.g. secret-member-x"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-midnightViolet/50 transition-colors"
                required
              />
            </div>

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-300 leading-normal">{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-red-300 leading-normal">{errorMsg}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !memberSecret.trim() || registeredCount >= maxLeaves}
              className="w-full bg-gradient-to-r from-midnightViolet to-cyberCyan disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Registering...' : 'Register Shielded Commitment'}
            </button>
          </form>

          {/* Current commitments count & logs */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white/50">Allowlist Commitments Tree Capacity:</span>
              <span className="text-cyberCyan font-bold">
                {registeredCount} / {maxLeaves} slots used
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyberCyan h-full transition-all duration-500"
                style={{ width: `${(registeredCount / maxLeaves) * 100}%` }}
              ></div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-3 h-24 overflow-y-auto font-mono text-[9px] text-white/40 space-y-1">
              <div className="text-white/60 mb-1 border-b border-white/5 pb-1">Registered Commitment Leaves:</div>
              {commitments
                .filter(c => c !== '0000000000000000000000000000000000000000000000000000000000000000')
                .map((c, i) => (
                  <div key={i} className="truncate">
                    Leaf #{i}: <span className="text-white/70">{c}</span>
                  </div>
                ))}
              {registeredCount === 0 && <div className="italic text-center py-2">No active commitments registered yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
