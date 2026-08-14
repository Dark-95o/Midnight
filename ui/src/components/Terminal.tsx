import React from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';
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
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyberCyan" />
          <span className="text-sm font-semibold text-white/90 tracking-wide">Public Ledger Event Terminal</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
        </div>
      </div>

      {/* Terminal Feed */}
      <div className="flex-1 overflow-y-auto font-mono text-xs text-white/80 space-y-2.5 pr-2">
        {events.length === 0 ? (
          <div className="text-white/30 italic text-center py-12">
            No public events detected on ledger. Awaiting shielded transactions...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="border-l-2 border-cyberCyan/50 pl-3 py-0.5 hover:bg-white/5 transition-colors rounded-r-md"
              >
                <div className="flex flex-wrap items-center gap-2 text-white/50 text-[11px]">
                  <span className="text-cyberCyan font-bold">[{event.timestamp}]</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold text-white/80">
                    {event.type}
                  </span>
                  <span>Block: #{event.blockNumber}</span>
                  <span className="text-white/30 truncate max-w-[200px]">Tx: {event.txHash}</span>
                </div>
                <div className="text-white/90 text-xs mt-1 flex items-start gap-1">
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/40" />
                  <span className="break-all">{event.details}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
