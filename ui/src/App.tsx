import { useState, useEffect } from 'react';
import { Shield, Wallet, Info, Sparkles, RefreshCw, Cpu, ShieldCheck, Lock, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroVisualizer } from './components/HeroVisualizer';
import { MemberAccess } from './components/MemberAccess';
import { AdminVault } from './components/AdminVault';
import { Terminal } from './components/Terminal';
import type { TerminalEvent } from './components/Terminal';
import { CloakPassContract, hashValues, pad32 } from '../../contract/src/cloakpass';

const ADMIN_SK = 'admin-super-secret-key-12345';
const ADMIN_PK = hashValues([pad32('cloakpass:admin:v1'), ADMIN_SK]);

// Instantiate our simulated contract
const cloakPassSim = new CloakPassContract(ADMIN_PK);

export default function App() {
  // Wallet Connection Simulation
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletRole, setWalletRole] = useState<'admin' | 'user'>('user');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('500.00');
  const [walletType, setWalletType] = useState<'lace' | 'freighter' | 'mock' | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // App tabs
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');

  // Contract State Simulations
  const [commitments, setCommitments] = useState<string[]>(cloakPassSim.commitments.leaves);
  const [accessCount, setAccessCount] = useState(cloakPassSim.access_granted_count);
  const [terminalEvents, setTerminalEvents] = useState<TerminalEvent[]>([]);

  // Stepper Visualizer hooks
  const [currentSecret, setCurrentSecret] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [provingStep, setProvingStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [lastEventId, setLastEventId] = useState('');

  // Handle wallet connection simulation
  const connectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = async (type: 'lace' | 'freighter' | 'mock') => {
    setShowWalletModal(false);
    setWalletConnecting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setWalletConnected(true);
    setWalletConnecting(false);
    setWalletType(type);
    updateWalletState(type, walletRole);
  };

  const updateWalletState = (type: 'lace' | 'freighter' | 'mock' | null, role: 'admin' | 'user') => {
    if (!type) return;

    if (type === 'lace') {
      if (role === 'admin') {
        setWalletAddress('cloak_admin1p6x9u82r47zkd58d9v38xlqnswkxp095gskv9u');
        setWalletBalance('12,450.50 tADA');
      } else {
        setWalletAddress('cloak_user1q3r4xk9v05gskv9uxlqnswkxp095gskv9u3d2p');
        setWalletBalance('520.40 tADA');
      }
      logEvent('access', 'Connected to Lace Beta Wallet on Midnight Testnet.');
    } else if (type === 'freighter') {
      if (role === 'admin') {
        setWalletAddress('GBADMINFreighterStellarPublicKeyX7V2R89P');
        setWalletBalance('8,540.25 XLM');
      } else {
        setWalletAddress('GBMEMBERFreighterStellarPublicKey4X9P78Q3');
        setWalletBalance('160.50 XLM');
      }
      logEvent('access', 'Connected to Freighter Wallet via Stellar Bridge.');
    } else {
      if (role === 'admin') {
        setWalletAddress('mock_admin_key_12345');
        setWalletBalance('9,999.00 DEV');
      } else {
        setWalletAddress('mock_user_key_54321');
        setWalletBalance('100.00 DEV');
      }
      logEvent('access', 'Connected to Mock Developer Simulator Wallet.');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletType(null);
    logEvent('access', 'Wallet disconnected.');
  };

  useEffect(() => {
    if (walletConnected && walletType) {
      updateWalletState(walletType, walletRole);
    }
  }, [walletRole, walletConnected, walletType]);

  const logEvent = (type: 'access' | 'registration', details: string) => {
    const newEvent: TerminalEvent = {
      id: Math.random().toString(),
      blockNumber: 1542000 + terminalEvents.length * 3 + Math.floor(Math.random() * 3),
      txHash: '0x' + crypto.randomUUID().replace(/-/g, '').substring(0, 40),
      timestamp: new Date().toLocaleTimeString(),
      type,
      details
    };
    setTerminalEvents((prev) => [newEvent, ...prev]);
  };

  const clearLedgerState = () => {
    cloakPassSim.commitments.leaves = cloakPassSim.commitments.leaves.map(
      () => '0000000000000000000000000000000000000000000000000000000000000000'
    );
    cloakPassSim.access_granted_events.clear();
    cloakPassSim.access_granted_count = 0;
    setCommitments([...cloakPassSim.commitments.leaves]);
    setAccessCount(0);
    setTerminalEvents([]);
    setIsVerified(false);
    setCurrentSecret('');
    setLastEventId('');
    logEvent('registration', 'Contract ledger re-initialized to initial empty state.');
  };

  const handleRegisterCommitment = async (secret: string): Promise<{ success: boolean; commitment?: string; error?: string }> => {
    try {
      const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);

      cloakPassSim.registerWitnesses({
        get_admin_secret: () => ADMIN_SK,
        get_secret: () => '',
        get_membership_proof: () => ({ leaf: '', path: [] })
      });

      cloakPassSim.register_commitment(commitment);
      
      setCommitments([...cloakPassSim.commitments.leaves]);
      logEvent('registration', `Admin registered new commitment leaf: ${commitment.substring(0, 16)}...`);
      return { success: true, commitment };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to register' };
    }
  };

  const handleProveMembership = async (secret: string): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    setCurrentSecret(secret);
    setIsGenerating(true);
    setProvingStep(1);

    await new Promise((r) => setTimeout(r, 1200));
    setProvingStep(2);

    await new Promise((r) => setTimeout(r, 1500));
    setProvingStep(3);

    try {
      const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);
      const leafIndex = cloakPassSim.commitments.leaves.findIndex((c) => c === commitment);

      if (leafIndex === -1) {
        throw new Error('Secret is not registered in the allowlist commitments tree.');
      }

      const path = cloakPassSim.commitments.getPath(leafIndex);

      cloakPassSim.registerWitnesses({
        get_admin_secret: () => '',
        get_secret: () => secret,
        get_membership_proof: () => path
      });

      const eventId = hashValues([`session-${Date.now()}`]);
      cloakPassSim.prove_membership(eventId);

      setAccessCount(cloakPassSim.access_granted_count);
      setLastEventId(eventId);
      setIsVerified(true);
      setIsGenerating(false);

      logEvent('access', `Verification successful. Anonymous Event Granted: ${eventId.substring(0, 16)}...`);
      return { success: true, eventId };
    } catch (err: any) {
      setIsGenerating(false);
      setProvingStep(0);
      return { success: false, error: err.message || 'ZK proof validation failed' };
    }
  };

  const activeLeavesCount = commitments.filter(c => c !== '0000000000000000000000000000000000000000000000000000000000000000').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans overflow-x-hidden pb-16 selection:bg-[#E5DFD5] selection:text-[#C2410C]">
      
      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-[#E5DFD5] bg-[#FFFDF9]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#C2410C] flex items-center justify-center shadow-sm p-0.5">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#1C1917] flex items-center gap-2">
                CloakPass <span className="text-[10px] bg-[#F3EEE6] text-[#C2410C] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border border-[#E5DFD5] font-bold">Midnight ZK</span>
              </div>
              <span className="text-[11px] text-[#57534E] block leading-none font-mono">Shielded Access Gatekeeper</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-[#F3EEE6] border border-[#E5DFD5] px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-[#57534E]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              Midnight Testnet
            </div>

            {/* Wallet Button */}
            <AnimatePresence mode="wait">
              {!walletConnected ? (
                <motion.button
                  key="connect"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={connectWallet}
                  disabled={walletConnecting}
                  className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                  {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                </motion.button>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-[#F3EEE6] border border-[#E5DFD5] pl-3.5 pr-2 py-1.5 rounded-xl text-xs"
                >
                  <div className="text-right font-mono">
                    <span className="text-[9px] text-[#57534E] block">Balance ({walletType?.toUpperCase()}):</span>
                    <span className="font-bold text-[#C2410C]">{walletBalance}</span>
                  </div>
                  <div className="h-6 w-px bg-[#E5DFD5]"></div>
                  <button
                    onClick={disconnectWallet}
                    className="hover:text-[#C2410C] font-mono text-[10px] text-[#57534E] transition-colors uppercase font-bold tracking-wider"
                  >
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 relative z-10">
        
        {/* EDITORIAL HERO OVERVIEW SHOWCASE CARD (NO IMAGES) */}
        <div className="cream-card rounded-3xl p-8 md:p-10 border border-[#E5DFD5] shadow-sm relative overflow-hidden bg-[#FFFDF9]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Banner Left Info Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEE6] border border-[#E5DFD5] text-[#C2410C] font-mono text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" /> Next-Gen Shielded Access Verification
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1C1917] leading-tight">
                Zero-Knowledge Privacy Gateway
              </h1>

              <p className="text-sm text-[#57534E] leading-relaxed max-w-xl">
                CloakPass decouples user identity from membership validation. Verify access rights to private resources using Midnight Compact ZK-SNARK circuits without revealing your address or key.
              </p>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5DFD5]">
                <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#57534E] font-mono block uppercase tracking-wider font-semibold">Active Tree Leaves</span>
                  <span className="text-xl font-bold text-[#1C1917] font-mono mt-0.5 block">{activeLeavesCount} / 16</span>
                </div>
                <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#57534E] font-mono block uppercase tracking-wider font-semibold">Verified Proofs</span>
                  <span className="text-xl font-bold text-[#C2410C] font-mono mt-0.5 block">{accessCount}</span>
                </div>
                <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DFD5]">
                  <span className="text-[10px] text-[#57534E] font-mono block uppercase tracking-wider font-semibold">Circuit Protocol</span>
                  <span className="text-xl font-bold text-[#B45309] font-mono mt-0.5 block">Compact ZK</span>
                </div>
              </div>
            </div>

            {/* Banner Right Technical Overview Grid (Replacing Image) */}
            <div className="lg:col-span-5 bg-[#F4EFE6] rounded-2xl p-6 border border-[#E5DFD5] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] flex items-center gap-2 border-b border-[#E5DFD5] pb-3">
                <Server className="w-4 h-4 text-[#C2410C]" /> Protocol Specifications
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] space-y-1">
                  <span className="text-[10px] text-[#78716C] font-mono block">Merkle Tree</span>
                  <span className="font-bold text-[#1C1917]">Depth 4 (16 Slots)</span>
                </div>
                <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] space-y-1">
                  <span className="text-[10px] text-[#78716C] font-mono block">Prover System</span>
                  <span className="font-bold text-[#1C1917]">Plonk ZK-SNARK</span>
                </div>
                <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] space-y-1">
                  <span className="text-[10px] text-[#78716C] font-mono block">Privacy Tier</span>
                  <span className="font-bold text-[#15803D]">Shielded Nonce</span>
                </div>
                <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DFD5] space-y-1">
                  <span className="text-[10px] text-[#78716C] font-mono block">On-Chain State</span>
                  <span className="font-bold text-[#C2410C]">Immutable Nonce</span>
                </div>
              </div>

              <div className="bg-[#FFFDF9] p-3.5 rounded-xl border border-[#E5DFD5] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#57534E]">
                  <Lock className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Isolation: Local Browser WASM</span>
                </div>
                <span className="text-[10px] bg-[#E5DFD5] text-[#1C1917] px-2 py-0.5 rounded font-bold">Verified</span>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: HERO VISUALIZER & PUBLIC TERMINAL */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero ZK Visualizer Card */}
            <HeroVisualizer
              currentSecret={currentSecret}
              isGenerating={isGenerating}
              step={provingStep}
              isVerified={isVerified}
              eventId={lastEventId}
            />

            {/* Public Event Stream Terminal */}
            <Terminal events={terminalEvents} />
          </div>

          {/* RIGHT COLUMN: ACTION TABS & SIMULATION CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Simulator Role Helper Panel */}
            <div className="cream-card rounded-3xl p-6 border border-[#E5DFD5] bg-[#FFFDF9] shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4 shrink-0 text-[#C2410C]" />
                Simulator Role Controls
              </h3>
              <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
                Switch roles to simulate allowlist registration as Admin or proof verification as Member.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    setWalletRole('admin');
                    setActiveTab('admin');
                    if (!walletConnected) connectWallet();
                  }}
                  className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    walletRole === 'admin' && walletConnected
                      ? 'bg-[#C2410C] border-[#9A3412] text-white shadow-sm'
                      : 'bg-[#F4EFE6] border-[#E5DFD5] text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  Act as Admin
                </button>
                <button
                  onClick={() => {
                    setWalletRole('user');
                    setActiveTab('member');
                    if (!walletConnected) connectWallet();
                  }}
                  className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    walletRole === 'user' && walletConnected
                      ? 'bg-[#B45309] border-[#92400E] text-white shadow-sm'
                      : 'bg-[#F4EFE6] border-[#E5DFD5] text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  Act as Member
                </button>
              </div>

              <div className="border-t border-[#E5DFD5] pt-3 flex justify-between items-center text-[11px] font-mono">
                <span className="text-[#57534E]">Proof Events: <strong className="text-[#1C1917]">{accessCount}</strong></span>
                <button
                  onClick={clearLedgerState}
                  className="text-[#C2410C] hover:text-[#9A3412] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Ledger
                </button>
              </div>
            </div>

            {/* Action Tabs Selector */}
            <div className="bg-[#F4EFE6] rounded-2xl p-1 flex gap-1 border border-[#E5DFD5]">
              <button
                onClick={() => setActiveTab('member')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'member'
                    ? 'bg-[#FFFDF9] text-[#1C1917] border border-[#E5DFD5] shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Member Access
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#FFFDF9] text-[#1C1917] border border-[#E5DFD5] shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Admin Vault
              </button>
            </div>

            {/* Tab Cards Rendering */}
            <div className="min-h-[440px]">
              {activeTab === 'member' ? (
                <MemberAccess onProve={handleProveMembership} isConnected={walletConnected} />
              ) : (
                <AdminVault
                  onRegister={handleRegisterCommitment}
                  commitments={commitments}
                  maxLeaves={16}
                  isConnected={walletConnected}
                  isAdmin={walletRole === 'admin'}
                />
              )}
            </div>

          </div>

        </div>

      </main>

      {/* WALLET SELECTION MODAL */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-sm">
          <div className="cream-card w-full max-w-md p-6 rounded-3xl border border-[#E5DFD5] shadow-xl relative bg-[#FFFDF9]">
            <div className="flex items-center gap-2.5 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#C2410C]" />
              <h3 className="text-lg font-bold text-[#1C1917]">Select Wallet Provider</h3>
            </div>
            <p className="text-xs text-[#57534E] mb-6">Select a Midnight or Stellar compatible wallet to proceed.</p>
            
            <div className="space-y-3">
              {/* Lace Wallet */}
              <button
                onClick={() => handleWalletSelect('lace')}
                className="w-full bg-[#F4EFE6] hover:bg-[#E5DFD5]/60 border border-[#E5DFD5] p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#C2410C]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">Lace Wallet</div>
                    <span className="text-[10px] text-[#78716C] font-mono">Midnight Testnet</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#C2410C] font-bold uppercase tracking-wider bg-[#FFFDF9] px-2.5 py-1 rounded border border-[#E5DFD5]">Connect</span>
              </button>

              {/* Freighter Wallet */}
              <button
                onClick={() => handleWalletSelect('freighter')}
                className="w-full bg-[#F4EFE6] hover:bg-[#E5DFD5]/60 border border-[#E5DFD5] p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#B45309]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#B45309] transition-colors">Freighter Wallet</div>
                    <span className="text-[10px] text-[#78716C] font-mono">Stellar Integration</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#B45309] font-bold uppercase tracking-wider bg-[#FFFDF9] px-2.5 py-1 rounded border border-[#E5DFD5]">Connect</span>
              </button>

              {/* Mock Developer Wallet */}
              <button
                onClick={() => handleWalletSelect('mock')}
                className="w-full bg-[#F4EFE6] hover:bg-[#E5DFD5]/60 border border-[#E5DFD5] p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] border border-[#E5DFD5] flex items-center justify-center text-[#57534E]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#1C1917] transition-colors">Mock Wallet</div>
                    <span className="text-[10px] text-[#78716C] font-mono">Developer Simulator</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#57534E] font-bold uppercase tracking-wider bg-[#FFFDF9] px-2.5 py-1 rounded border border-[#E5DFD5]">Connect</span>
              </button>
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full mt-5 bg-[#F4EFE6] hover:bg-[#E5DFD5] py-2.5 rounded-xl text-xs font-bold text-[#57534E] transition-colors border border-[#E5DFD5]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

