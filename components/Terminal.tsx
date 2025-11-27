import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';

interface TerminalProps {
  logs: LogMessage[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border-t border-slate-800 h-48 flex flex-col font-mono text-xs p-2 overflow-hidden relative">
      <div className="absolute top-0 right-0 px-2 py-1 bg-slate-900 text-slate-500 text-[10px] border-b border-l border-slate-800 uppercase tracking-wider">
        System Log // Live
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pt-6 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className={`flex gap-2 ${
            log.type === 'error' ? 'text-quant-bear' : 
            log.type === 'success' ? 'text-quant-bull' : 
            log.type === 'warning' ? 'text-quant-warn' : 
            log.type === 'system' ? 'text-quant-neon' : 'text-slate-400'
          }`}>
            <span className="opacity-50">[{log.timestamp}]</span>
            <span className="font-bold uppercase">[{log.type}]</span>
            <span>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};