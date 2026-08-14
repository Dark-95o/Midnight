import React from 'react';
import { EyeOff, Cpu, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroVisualizerProps {
  currentSecret: string;
  isGenerating: boolean;
  step: number;
  isVerified: boolean;
  eventId: string;
}

export const HeroVisualizer: React.FC<HeroVisualizerProps> = ({
  currentSecret,
  isGenerating,
  step,
  isVerified,
  eventId
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border border-white/10 shadow-2xl">
      {/* Background ambient light gradients */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyberCyan/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-midnightViolet/10 rounded-full blur-2xl pointer-events-none"></div>

      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
        <Cpu className="w-5 h-5 text-cyberCyan animate-pulse" />
        Zero-Knowledge Privacy Boundary Visualizer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Client Side (Hidden) */}
        <motion.div 
          className="glass-panel p-4 rounded-xl border border-white/5 relative flex flex-col justify-between"
          whileHover={{ translateY: -2 }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Client Side</span>
              <Lock className="w-4 h-4 text-cyberCyan" />
            </div>
            <h3 className="text-base font-bold text-cyberCyan mb-2">Shielded Secrets</h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Private data resides purely in the user's browser, never transmitted to the network.
            </p>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[11px] truncate">
            <span className="text-white/40">Preimage:</span>{' '}
            {currentSecret ? (
              <span className="text-cyberCyan font-bold">●●●●●●●● (Secret Loaded)</span>
            ) : (
              <span className="text-white/30 italic">No Passkey Loaded</span>
            )}
          </div>
        </motion.div>

        {/* Midnight Network (ZK Proof Generation) */}
        <motion.div 
          className={`glass-panel p-4 rounded-xl border relative flex flex-col justify-between transition-all duration-500 ${
            isGenerating ? 'border-midnightViolet/50 purple-glow' : 'border-white/5'
          }`}
          whileHover={{ translateY: -2 }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Midnight Shield</span>
              <EyeOff className="w-4 h-4 text-midnightViolet animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-midnightViolet mb-2">ZK Proof Circuit</h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Compact circuit generates a zero-knowledge proof of allowance membership locally.
            </p>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[11px]">
            <span className="text-white/40">Status:</span>{' '}
            {isGenerating ? (
              <span className="text-midnightViolet font-bold animate-pulse">
                {step === 1 ? 'Generating Witness...' : 'Computing Proof...'}
              </span>
            ) : isVerified ? (
              <span className="text-emerald-400 font-bold">Proof Verified ✓</span>
            ) : (
              <span className="text-white/30 italic">Awaiting Action</span>
            )}
          </div>
        </motion.div>

        {/* Public Ledger (Anonymous Event) */}
        <motion.div 
          className={`glass-panel p-4 rounded-xl border relative flex flex-col justify-between transition-all duration-500 ${
            isVerified ? 'border-emerald-500/30 cyan-glow' : 'border-white/5'
          }`}
          whileHover={{ translateY: -2 }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Public Ledger</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-emerald-400 mb-2">Access Granted</h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Only an anonymous event nonce is recorded. Zero links to member addresses or secrets.
            </p>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] leading-tight">
            <div>
              <span className="text-white/40">Identity:</span>{' '}
              {isVerified ? (
                <span className="text-red-400 font-bold uppercase tracking-wider">[REDACTED]</span>
              ) : (
                <span className="text-white/30 italic">Awaiting...</span>
              )}
            </div>
            {isVerified && eventId && (
              <div className="mt-1 truncate">
                <span className="text-white/40">Event ID:</span>{' '}
                <span className="text-emerald-400 font-bold">{eventId.substring(0, 16)}...</span>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
