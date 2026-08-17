import { useState, useEffect } from 'react';
import { Shield, Wallet, Info, Sparkles, RefreshCw, Cpu } from 'lucide-react';
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
  const [walletRole, setWalletRole] = useState<'admin' | 'user'>('user'); // admin or user
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
    await new Promise((r) => setTimeout(r, 1200));
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

  // Listen to role changes and update wallet details
  useEffect(() => {
    if (walletConnected && walletType) {
      updateWalletState(walletType, walletRole);
    }
  }, [walletRole, walletConnected, walletType]);

  // Log terminal activity helper
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

  // Clear/Reset entire Ledger State
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

  // Register commitment off-chain and on-chain
  const handleRegisterCommitment = async (secret: string): Promise<{ success: boolean; commitment?: string; error?: string }> => {
    try {
      // Calculate commitment
      const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);

      // Set admin witness
      cloakPassSim.registerWitnesses({
        get_admin_secret: () => ADMIN_SK,
        get_secret: () => '',
        get_membership_proof: () => ({ leaf: '', path: [] })
      });

      // Execute on-chain
      cloakPassSim.register_commitment(commitment);
      
      // Update state
      setCommitments([...cloakPassSim.commitments.leaves]);
      logEvent('registration', `Admin registered new commitment leaf: ${commitment.substring(0, 16)}...`);
      return { success: true, commitment };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to register' };
    }
  };

  // User proves membership
  const handleProveMembership = async (secret: string): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    setCurrentSecret(secret);
    setIsGenerating(true);
    setProvingStep(1); // Witness Generation

    await new Promise((r) => setTimeout(r, 1200));
    setProvingStep(2); // Circuit Computation

    await new Promise((r) => setTimeout(r, 1500));
    setProvingStep(3); // Shielded TX Submission

    try {
      // Find the index of the commitment of this secret in the Merkle Tree
      const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);
      const leafIndex = cloakPassSim.commitments.leaves.findIndex((c) => c === commitment);

      if (leafIndex === -1) {
        throw new Error('Secret is not registered in the allowlist commitments tree.');
      }

      // Generate Merkle path
      const path = cloakPassSim.commitments.getPath(leafIndex);

      // Register witness callbacks
      cloakPassSim.registerWitnesses({
        get_admin_secret: () => '',
        get_secret: () => secret,
        get_membership_proof: () => path
      });

      // Call circuit
      const eventId = hashValues([`session-${Date.now()}`]);
      cloakPassSim.prove_membership(eventId);

      // Update state
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

  return (
    <div className="min-h-screen bg-obsidian text-white relative font-sans overflow-x-hidden pb-12 selection:bg-cyberCyan/30 selection:text-cyberCyan">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyberCyan/5 to-transparent rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-midnightViolet/5 to-transparent rounded-full blur-[140px] pointer-events-none"></div>

      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-white/5 bg-obsidian/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyberCyan to-midnightViolet flex items-center justify-center shadow-lg cyan-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent flex items-center gap-1.5">
                CloakPass <span className="text-[10px] bg-cyberCyan/20 text-cyberCyan px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-cyberCyan/20">ZK-Gate</span>
              </div>
              <span className="text-[10px] text-white/40 block leading-none">Midnight Protocol allowed-member verifier</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-white/70">
              <span className="w-2 h-2 rounded-full bg-cyberCyan animate-pulse"></span>
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
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 text-cyberCyan" />
                  {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                </motion.button>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-white/5 border border-cyberCyan/20 pl-3 pr-2 py-1.5 rounded-xl text-xs"
                >
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 block">Balance ({walletType?.toUpperCase()}):</span>
                    <span className="font-mono font-bold text-cyberCyan">{walletBalance}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <button
                    onClick={disconnectWallet}
                    className="hover:text-red-400 font-mono text-[10px] text-white/70 transition-colors uppercase font-bold tracking-wider"
                  >
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: HERO VISUALIZER & PUBLIC TERMINAL */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Welcome Intro */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Private Zero-Knowledge Gatekeeper <Sparkles className="w-6 h-6 text-cyberCyan animate-pulse" />
            </h1>
            <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
              CloakPass enables members to prove eligibility to private portals in full privacy. Midnight's dual-state architecture verifies structural inclusion while masking addresses and transactions.
            </p>
          </div>

          {/* Hero ZK Visualizer */}
          <HeroVisualizer
            currentSecret={currentSecret}
            isGenerating={isGenerating}
            step={provingStep}
            isVerified={isVerified}
            eventId={lastEventId}
          />

          {/* Event Terminal */}
          <Terminal events={terminalEvents} />
        </div>

        {/* RIGHT COLUMN: ACTION TABS & SIMULATION PANEL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Simulation Helper Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 shadow-lg relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <Info className="w-4 h-4 shrink-0" />
              Developer Simulation Controls
            </h3>
            <p className="text-[11px] text-white/60 mb-4 leading-normal">
              Toggle roles instantly to test both perspectives of the allowlist flow.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setWalletRole('admin');
                  setActiveTab('admin');
                  if (!walletConnected) connectWallet();
                }}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  walletRole === 'admin' && walletConnected
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
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
                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  walletRole === 'user' && walletConnected
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                Act as Member
              </button>
            </div>

            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px]">
              <span className="text-white/40">Ledger Verifications: {accessCount}</span>
              <button
                onClick={clearLedgerState}
                className="text-red-400 hover:text-red-300 font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Reset State
              </button>
            </div>
          </div>

          {/* Action Tabs Container */}
          <div className="glass-panel rounded-2xl p-1.5 flex gap-1 border border-white/5 bg-black/40">
            <button
              onClick={() => setActiveTab('member')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'member'
                  ? 'bg-gradient-to-r from-cyberCyan/20 to-midnightViolet/20 border border-cyberCyan/30 text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Member Access
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-midnightViolet/20 to-cyberCyan/20 border border-midnightViolet/30 text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Admin Vault
            </button>
          </div>

          {/* Tab Content Rendering */}
          <div className="min-h-[400px]">
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

      </main>

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Select Wallet Provider</h3>
            <p className="text-xs text-white/50 mb-6 font-medium">Choose a wallet to connect to CloakPass.</p>
            
            <div className="space-y-3">
              {/* Lace Wallet */}
              <button
                onClick={() => handleWalletSelect('lace')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyberCyan/20 flex items-center justify-center text-cyberCyan">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-cyberCyan transition-colors">Lace Wallet</div>
                    <span className="text-[10px] text-white/40">Midnight Testnet</span>
                  </div>
                </div>
                <span className="text-[10px] text-cyberCyan font-bold uppercase tracking-wider">Connect</span>
              </button>

              {/* Freighter Wallet */}
              <button
                onClick={() => handleWalletSelect('freighter')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Freighter Wallet</div>
                    <span className="text-[10px] text-white/40">Stellar Integration</span>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-semibold">Connect</span>
              </button>

              {/* Mock Developer Wallet */}
              <button
                onClick={() => handleWalletSelect('mock')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Mock Wallet</div>
                    <span className="text-[10px] text-white/40">Developer Simulator</span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-semibold">Connect</span>
              </button>
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full mt-6 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-semibold text-white/70 transition-colors hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
