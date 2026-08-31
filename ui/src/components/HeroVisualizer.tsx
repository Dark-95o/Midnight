import React from 'react';
import { EyeOff, Cpu, Globe, Lock, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
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
    <div className="cream-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-[#E5DFD5] shadow-sm bg-[#FFFDF9]">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3EEE6] text-[#C2410C] border border-[#E5DFD5] uppercase tracking-wider">
              Circuit Topology
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3EEE6] text-[#B45309] border border-[#E5DFD5] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#B45309]" /> Dual-State ZK
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C1917]">
            Zero-Knowledge Privacy Boundary Visualizer
          </h2>
        </div>

        {/* Live Step Badge */}
        <div className="flex items-center gap-2 bg-[#F4EFE6] border border-[#E5DFD5] px-3.5 py-2 rounded-xl font-mono text-xs text-[#57534E]">
          <span className="text-[#78716C]">Pipeline:</span>
          {isGenerating ? (
            <span className="text-[#C2410C] font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              {step === 1 ? 'Witness Build' : 'Constraint Solving'}
            </span>
          ) : isVerified ? (
            <span className="text-[#15803D] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> Verified On-Chain
            </span>
          ) : (
            <span className="text-[#78716C] italic">Awaiting Proof Request</span>
          )}
        </div>
      </div>

      {/* Flowchart Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Step 1: Client Private Key Node */}
        <motion.div 
          className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E5DFD5] relative flex flex-col justify-between hover:border-[#D4CBBE] transition-all shadow-sm"
          whileHover={{ translateY: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#C2410C] font-mono font-bold text-xs">
              01
            </div>
            <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider flex items-center gap-1 bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#E5DFD5]">
              <ShieldAlert className="w-3 h-3 text-[#C2410C]" /> Client Only
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#1C1917] mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C2410C]" /> Private Preimage
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Passkey and private parameters reside strictly inside local browser memory.
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] font-mono text-[11px] space-y-1">
            <div className="text-[#78716C] text-[10px] flex justify-between">
              <span>Memory Location:</span>
              <span className="text-[#C2410C] font-bold">WASM Isolation</span>
            </div>
            <div className="truncate">
              <span className="text-[#78716C]">Status:</span>{' '}
              {currentSecret ? (
                <span className="text-[#B45309] font-bold tracking-wider">●●●●●●●● (Staged)</span>
              ) : (
                <span className="text-[#A8A29E] italic">No Key Loaded</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Step 2: Midnight ZK Prover Node */}
        <motion.div 
          className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all duration-300 shadow-sm ${
            isGenerating ? 'bg-[#FFFDF9] border-[#C2410C]' : 'bg-[#F4EFE6] border-[#E5DFD5]'
          }`}
          whileHover={{ translateY: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#B45309] font-mono font-bold text-xs">
              02
            </div>
            <span className="text-[10px] font-mono font-bold text-[#B45309] uppercase tracking-wider flex items-center gap-1 bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#E5DFD5]">
              <Cpu className="w-3 h-3 text-[#B45309]" /> Compact Prover
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#1C1917] mb-1 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#B45309]" /> Midnight Circuit
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Compact ZK circuit computes allowance membership proof without leaking identity.
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] font-mono text-[11px] space-y-1">
            <div className="text-[#78716C] text-[10px] flex justify-between">
              <span>ZK Engine:</span>
              <span className="text-[#B45309] font-bold">SNARK Plonk</span>
            </div>
            <div className="truncate">
              <span className="text-[#78716C]">State:</span>{' '}
              {isGenerating ? (
                <span className="text-[#C2410C] font-bold">
                  {step === 1 ? 'Building Witness' : 'Computing Proof'}
                </span>
              ) : isVerified ? (
                <span className="text-[#15803D] font-bold">Proof Verified ✓</span>
              ) : (
                <span className="text-[#A8A29E] italic">Ready to Prove</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Step 3: Public Ledger Nonce Node */}
        <motion.div 
          className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all duration-300 shadow-sm ${
            isVerified ? 'bg-[#FFFDF9] border-[#15803D]' : 'bg-[#F4EFE6] border-[#E5DFD5]'
          }`}
          whileHover={{ translateY: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#15803D] font-mono font-bold text-xs">
              03
            </div>
            <span className="text-[10px] font-mono font-bold text-[#15803D] uppercase tracking-wider flex items-center gap-1 bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#E5DFD5]">
              <Globe className="w-3 h-3 text-[#15803D]" /> Public State
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#1C1917] mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#15803D]" /> Access Nonce
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Only anonymous event proof is posted on-chain. Address and balance stay private.
            </p>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] font-mono text-[11px] space-y-1">
            <div className="text-[#78716C] text-[10px] flex justify-between">
              <span>On-Chain Record:</span>
              <span className="text-[#15803D] font-bold">100% Anonymous</span>
            </div>
            <div className="truncate">
              <span className="text-[#78716C]">Event ID:</span>{' '}
              {isVerified && eventId ? (
                <span className="text-[#1C1917] font-bold">{eventId.substring(0, 14)}...</span>
              ) : (
                <span className="text-[#A8A29E] italic">Awaiting Nonce</span>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

