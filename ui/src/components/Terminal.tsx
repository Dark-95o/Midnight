import React, { useState } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Download, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TerminalEvent {
  id: string;
  blockNumber: number;
  txHash: string;
  timestamp: string;
  type: 'access' | 'registration';
  details: string;
}

interface TerminalProps {
  events: TerminalEvent[];
}

export const Terminal: React.FC<TerminalProps> = ({ events }) => {
  const [filter, setFilter] = useState<'all' | 'access' | 'registration'>('all');
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesFilter = filter === 'all' || e.type === filter;
    const matchesSearch =
      search === '' ||
      e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.txHash.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cloakpass-ledger-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="cream-card rounded-3xl p-6 border border-[#E5DFD5] shadow-sm relative overflow-hidden flex flex-col h-[320px] bg-[#FFFDF9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5DFD5] pb-4 mb-4 gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#F4EFE6] border border-[#E5DFD5] flex items-center justify-center text-[#C2410C] shadow-sm">
            <TerminalIcon className="w-4 h-4 text-[#C2410C]" />
          </div>
          <div>
            <span className="text-base font-extrabold text-[#1C1917] tracking-wide block leading-none">
              Ledger Event Stream
            </span>
            <span className="text-[10px] font-mono text-[#78716C]">Midnight Block Monitor</span>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tx / details..."
              className="bg-[#F4EFE6] border border-[#E5DFD5] rounded-xl text-[10px] font-mono px-2.5 py-1 text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#C2410C] w-32 sm:w-40"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-[#F4EFE6] p-0.5 rounded-xl border border-[#E5DFD5] text-[10px] font-mono font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-[#FFFDF9] text-[#1C1917] border border-[#E5DFD5] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilter('access')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                filter === 'access' ? 'bg-[#FFFDF9] text-[#C2410C] border border-[#E5DFD5] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              Access
            </button>
            <button
              onClick={() => setFilter('registration')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                filter === 'registration' ? 'bg-[#FFFDF9] text-[#B45309] border border-[#E5DFD5] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Download JSON Log */}
          <button
            onClick={exportLogs}
            disabled={events.length === 0}
            title="Export JSON Logs"
            className="p-1 rounded-lg bg-[#F4EFE6] hover:bg-[#E5DFD5] text-[#1C1917] border border-[#E5DFD5] disabled:opacity-30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Feed */}
      <div className="flex-1 overflow-y-auto font-mono text-xs text-[#1C1917] space-y-2 pr-2">
        {filteredEvents.length === 0 ? (
          <div className="text-[#A8A29E] italic text-center py-12 flex flex-col items-center gap-2">
            <Radio className="w-5 h-5 text-[#A8A29E]" />
            <span>No matching public ledger events recorded. Awaiting ZK transactions...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`border-l-2 pl-3 py-1.5 transition-all rounded-r-xl bg-[#F4EFE6]/60 border-[#E5DFD5] ${
                  event.type === 'access'
                    ? 'border-l-[#C2410C]'
                    : 'border-l-[#B45309]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[#57534E] text-[11px]">
                  <span className="text-[#1C1917] font-bold font-mono">[{event.timestamp}]</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      event.type === 'access'
                        ? 'bg-[#FDF4F0] text-[#C2410C] border border-[#F87171]/40'
                        : 'bg-[#FEFCE8] text-[#B45309] border border-[#F59E0B]/40'
                    }`}
                  >
                    {event.type}
                  </span>
                  <span className="text-[#78716C]">Block: #{event.blockNumber}</span>
                  <span className="text-[#A8A29E] truncate max-w-[180px]">Tx: {event.txHash}</span>
                </div>
                <div className="text-[#1C1917] text-xs mt-1 flex items-start gap-1">
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C2410C]" />
                  <span className="break-all font-mono font-medium">{event.details}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

