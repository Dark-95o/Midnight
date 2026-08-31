import React, { useState } from 'react';
import { Database, PlusCircle, AlertCircle, CheckCircle2, ShieldAlert, Dices, Copy, Check } from 'lucide-react';

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateRandomPasskey = () => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    setMemberSecret(`cloak-member-${randomHex}`);
  };

  const copyLeaf = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberSecret.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const result = await onRegister(memberSecret.trim());
      if (result.success && result.commitment) {
        setSuccessMsg(`Commitment leaf #${commitments.filter(c => c !== '0000000000000000000000000000000000000000000000000000000000000000').length - 1} registered to Merkle Tree!`);
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
    <div className="cream-card rounded-3xl p-6 border border-[#E5DFD5] shadow-sm relative overflow-hidden flex flex-col h-full min-h-[440px] bg-[#FFFDF9]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5DFD5]">
        <h2 className="text-xl font-extrabold text-[#1C1917] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#E5DFD5] flex items-center justify-center text-[#C2410C] shadow-sm">
            <Database className="w-5 h-5 text-[#C2410C]" />
          </div>
          <span>Admin Vault</span>
        </h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B45309] bg-[#F4EFE6] px-2.5 py-1 rounded-full border border-[#E5DFD5]">
          Merkle Manager
        </span>
      </div>

      <p className="text-xs text-[#57534E] mb-5 leading-relaxed">
        Register new member secrets into the Merkle tree allowlist. Secrets are hashed off-chain into 256-bit commitments before storing on-chain.
      </p>

      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F4EFE6] rounded-2xl border border-dashed border-[#D4CBBE]">
          <ShieldAlert className="w-8 h-8 text-[#B45309] mb-3" />
          <h3 className="text-sm font-bold text-[#1C1917]">Wallet Connection Required</h3>
          <p className="text-xs text-[#57534E] max-w-[240px] mt-1 leading-relaxed">
            Connect your wallet and switch to Admin role using simulator controls above.
          </p>
        </div>
      ) : !isAdmin ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#FDF4F0] rounded-2xl border border-dashed border-[#F87171]">
          <ShieldAlert className="w-8 h-8 text-[#C2410C] mb-3" />
          <h3 className="text-sm font-extrabold text-[#991B1B]">Admin Authority Required</h3>
          <p className="text-xs text-[#57534E] max-w-[250px] mt-1.5 leading-relaxed">
            Click <strong className="text-[#C2410C]">"Act as Admin"</strong> in the simulation bar above to unlock commitment registration privileges.
          </p>
        </div>
      ) : (
        <div className="space-y-5 flex-1 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                  New Member Secret / Passkey
                </label>
                <button
                  type="button"
                  onClick={generateRandomPasskey}
                  className="text-[10px] text-[#C2410C] hover:text-[#9A3412] font-mono flex items-center gap-1 bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E5DFD5] transition-all active:scale-95"
                >
                  <Dices className="w-3 h-3 text-[#C2410C]" /> Random Seed
                </button>
              </div>
              <input
                type="text"
                value={memberSecret}
                onChange={(e) => setMemberSecret(e.target.value)}
                placeholder="Enter passkey to register e.g. secret-member-x"
                className="w-full bg-[#F4EFE6] border border-[#E5DFD5] rounded-xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]/30 transition-all font-mono"
                required
              />
            </div>

            {successMsg && (
              <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-3 flex gap-2.5 items-start shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#166534] leading-normal font-mono">{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-[#FDF4F0] border border-[#F87171] rounded-xl p-3 flex gap-2.5 items-start shadow-sm">
                <AlertCircle className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#991B1B] leading-normal font-mono">{errorMsg}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !memberSecret.trim() || registeredCount >= maxLeaves}
              className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white disabled:opacity-50 py-3 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              {isSubmitting ? 'Registering...' : 'Register Shielded Commitment'}
            </button>
          </form>

          {/* Visual Merkle Slots Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#57534E]">Merkle Tree Slots ({maxLeaves}):</span>
              <span className="text-[#C2410C] font-bold font-mono">
                {registeredCount} filled / {maxLeaves - registeredCount} free
              </span>
            </div>

            {/* 16 Node Grid visual representation */}
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-[#F4EFE6] rounded-xl border border-[#E5DFD5]">
              {commitments.slice(0, maxLeaves).map((c, idx) => {
                const isFilled = c !== '0000000000000000000000000000000000000000000000000000000000000000';
                return (
                  <div
                    key={idx}
                    title={isFilled ? `Leaf #${idx}: ${c}` : `Empty Slot #${idx}`}
                    className={`h-6 rounded-md border text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                      isFilled
                        ? 'bg-[#C2410C] border-[#9A3412] text-white shadow-sm'
                        : 'bg-[#FFFDF9] border-[#E5DFD5] text-[#A8A29E]'
                    }`}
                  >
                    #{idx}
                  </div>
                );
              })}
            </div>

            {/* Registered Leaves Inspector */}
            <div className="bg-[#F4EFE6] border border-[#E5DFD5] rounded-xl p-3 h-24 overflow-y-auto font-mono text-[9.5px] text-[#57534E] space-y-1.5">
              {commitments
                .filter(c => c !== '0000000000000000000000000000000000000000000000000000000000000000')
                .map((c, i) => (
                  <div key={i} className="flex justify-between items-center gap-2 hover:bg-[#E5DFD5]/50 p-1 rounded transition-colors">
                    <span className="truncate text-[#1C1917]">
                      Leaf #{i}: <span className="text-[#C2410C] font-semibold">{c}</span>
                    </span>
                    <button
                      onClick={() => copyLeaf(c, i)}
                      className="text-[#C2410C] hover:text-[#9A3412] shrink-0 text-[9px] flex items-center gap-1"
                    >
                      {copiedIndex === i ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              {registeredCount === 0 && <div className="italic text-center py-2 text-[#A8A29E]">No active commitments registered yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

