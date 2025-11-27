import React from 'react';
import { QuantAnalysisResult } from '../types';

interface SignalPanelProps {
  data: QuantAnalysisResult;
}

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex items-center gap-2 text-[10px] font-mono mb-1">
        <span className="w-16 text-slate-400 text-right">{label}</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full ${value > 70 ? 'bg-quant-neon' : value > 40 ? 'bg-yellow-500' : 'bg-quant-bear'}`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
        <span className="w-6 text-right text-white">{value}</span>
    </div>
);

export const SignalPanel: React.FC<SignalPanelProps> = ({ data }) => {
  // Find specific setup for current ticker if it exists in scanner list, or fallback
  const activeSetup = data.scanner.topLongs.find(s => s.ticker === data.ticker) || 
                      data.scanner.topShorts.find(s => s.ticker === data.ticker);
  
  const msc = data.mscScores;
  const isActionable = data.traderAction.includes("ENTER");
  
  return (
    <div className={`bg-slate-900/50 border border-slate-800 p-3 rounded-lg transition-all duration-1000 ${data.confidence.conviction > 70 ? 'shadow-[0_0_20px_rgba(0,240,255,0.15)] border-quant-neon/30' : ''}`}>
        
        {/* Contradiction Warning */}
        {data.contradictionWarning && (
             <div className="mb-3 bg-red-900/20 border border-red-800/50 text-red-400 text-xs p-2 rounded flex items-center gap-2 animate-pulse">
                 <span>⚠</span> {data.contradictionWarning}
             </div>
        )}

        <div className="flex gap-4 mb-4">
            {/* Trader Action Box */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-center flex flex-col justify-center relative overflow-hidden">
                <div className="text-[10px] text-slate-500 uppercase z-10 relative">Action Required</div>
                <div className={`text-xl font-bold z-10 relative ${isActionable ? 'text-quant-neon' : 'text-slate-300'}`}>
                    {data.traderAction}
                </div>
                {/* Background glow for action */}
                {isActionable && <div className="absolute inset-0 bg-quant-neon/10 blur-xl animate-pulse"></div>}
            </div>

            {/* Edge Score Gauge (Simplified Visual) */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-center flex flex-col justify-center">
                 <div className="text-[10px] text-slate-500 uppercase">Edge Score</div>
                 <div className={`text-xl font-bold ${data.edgeScore > 70 ? 'text-quant-bull' : data.edgeScore > 50 ? 'text-yellow-500' : 'text-slate-500'}`}>
                     {data.edgeScore}
                 </div>
            </div>
        </div>

        {/* MSC Logic */}
        <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Conviction Logic</h3>
                <span className="text-xs font-bold text-quant-neon">{data.confidence.conviction}%</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
                <div className="space-y-1">
                    <ScoreBar label="Structure" value={msc.structure} />
                    <ScoreBar label="Momentum" value={msc.momentum} />
                    <ScoreBar label="Liquidity" value={msc.liquidity} />
                </div>
                <div className="space-y-1">
                    <ScoreBar label="Flow" value={msc.flow} />
                    <ScoreBar label="Internals" value={msc.internals} />
                </div>
            </div>
        </div>

        {/* Confidence Vector */}
        <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-800 mb-3 bg-slate-900/30 rounded">
             <div>
                 <div className="text-[9px] text-slate-500 uppercase">Clarity</div>
                 <div className="text-xs text-white font-bold">{data.confidence.clarity}%</div>
             </div>
             <div>
                 <div className="text-[9px] text-slate-500 uppercase">Risk/Reward</div>
                 <div className="text-xs text-white font-bold">{data.confidence.risk.charAt(0)}/{data.confidence.reward.charAt(0)}</div>
             </div>
             <div>
                 <div className="text-[9px] text-slate-500 uppercase">Uncertainty</div>
                 <div className="text-xs text-slate-300 font-bold">{data.confidence.uncertainty}%</div>
             </div>
        </div>

        {/* Active Trade Plan for Current Ticker */}
        <div>
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-mono text-slate-500">TRADE PLAN</span>
                 {activeSetup && <span className={`text-[10px] px-1.5 rounded text-black font-bold ${activeSetup.direction === 'LONG' ? 'bg-quant-bull' : 'bg-quant-bear'}`}>{activeSetup.direction}</span>}
             </div>
             
             {activeSetup ? (
                 <div className="grid grid-cols-3 gap-2 text-center">
                     <div className="bg-slate-950 p-1 rounded border border-slate-800">
                         <div className="text-[9px] text-slate-500 uppercase">Entry</div>
                         <div className="text-xs font-bold text-white">{activeSetup.entry}</div>
                     </div>
                     <div className="bg-slate-950 p-1 rounded border border-slate-800">
                         <div className="text-[9px] text-slate-500 uppercase">Stop</div>
                         <div className="text-xs font-bold text-quant-warn">{activeSetup.stop}</div>
                     </div>
                     <div className="bg-slate-950 p-1 rounded border border-slate-800">
                         <div className="text-[9px] text-slate-500 uppercase">Target</div>
                         <div className="text-xs font-bold text-quant-bull">{activeSetup.targets[0]}</div>
                     </div>
                     <div className="col-span-3 text-[10px] text-slate-400 mt-1 text-left">
                         Size: <span className="text-white">{activeSetup.positionSize}</span> • Mgmt: <span className="text-white">{activeSetup.management}</span>
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-2 bg-slate-950 rounded border border-slate-800 border-dashed">
                     <span className="text-xs text-slate-500">No A+ Setup Active on {data.ticker}</span>
                 </div>
             )}
        </div>
    </div>
  );
};