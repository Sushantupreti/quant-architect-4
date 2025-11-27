import React, { useState, useEffect, useCallback } from 'react';
import { Terminal } from './Terminal';
import { ChartWidget } from './ChartWidget';
import { SignalPanel } from './SignalPanel';
import { getQuantAnalysis } from '../services/geminiService';
import { LogMessage, QuantAnalysisResult, TradingMode } from '../types';
import { INITIAL_ANALYSIS } from '../constants';

export const Dashboard: React.FC = () => {
  const [ticker, setTicker] = useState('SPY');
  const [inputTicker, setInputTicker] = useState('');
  const [data, setData] = useState<QuantAnalysisResult>(INITIAL_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [tradingMode, setTradingMode] = useState<TradingMode>('DAY');

  const addLog = useCallback((message: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

  const fetchData = useCallback(async (input: string) => {
    setLoading(true);
    addLog(`QuantArchitect 4.0: Running Full System Diagnostics on [${input}] (Mode: ${tradingMode})...`, 'system');
    
    try {
      const result = await getQuantAnalysis(input, tradingMode);
      setData(result);
      
      addLog(`Macro & Market Data Synced. Source: ${result.freshness.source}`, 'info');
      if (result.freshness.isDelayed) {
          addLog(`WARNING: ${result.freshness.delayMessage}`, 'warning');
      }
      
      // Log Alerts
      if (result.alerts.length > 0) {
          result.alerts.forEach(a => {
              addLog(`ALERT: ${a.ticker} - ${a.message}`, 'warning');
          });
      }

      if (result.contradictionWarning) {
        addLog(`CONTRADICTION: ${result.contradictionWarning}`, 'warning');
      }

    } catch (error) {
      addLog(`System Failure: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addLog, tradingMode]);

  // Initial Load
  useEffect(() => {
    fetchData('SCAN MARKET');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
        const t = inputTicker.toUpperCase();
        setTicker(t);
        fetchData(t);
        setInputTicker('');
    }
  };

  // Macro Metric Component
  const MacroItem = ({ label, value, trend }: { label: string, value: string, trend?: string }) => (
      <div className="flex flex-col px-4 border-r border-slate-800 last:border-none">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
          <span className={`font-mono text-sm font-bold ${trend === 'Risk-Off' ? 'text-quant-bear' : trend === 'Risk-On' ? 'text-quant-bull' : 'text-white'}`}>
              {value}
          </span>
      </div>
  );

  const isHighConviction = data.confidence.conviction > 70;
  const flowBattleColor = data.flowBattle === 'BUY DOMINANT' ? 'text-quant-bull' : data.flowBattle === 'SELL DOMINANT' ? 'text-quant-bear' : 'text-slate-300';

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      
      {/* HEADER: Branding & Macro Intelligence Panel */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-lg shrink-0 z-50">
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3 px-2">
                <div className={`w-3 h-3 rounded-full bg-quant-neon shadow-[0_0_10px_#00f0ff] ${isHighConviction ? 'animate-ping' : 'animate-pulse'}`}></div>
                <h1 className="text-lg font-bold tracking-tighter text-white hidden md:block">
                    QUANT<span className="text-quant-neon">ARCHITECT</span> 4.0
                </h1>
            </div>

            {/* Trading Mode Toggle */}
            <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                {(['SCALP', 'DAY', 'SWING'] as TradingMode[]).map((mode) => (
                    <button 
                        key={mode}
                        onClick={() => setTradingMode(mode)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${tradingMode === mode ? 'bg-slate-800 text-quant-neon font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Macro Bar */}
            <div className="hidden xl:flex items-center">
                <MacroItem label="VIX" value={data.macro.vix} />
                <MacroItem label="DXY" value={data.macro.dxy} />
                <MacroItem label="Yields" value={data.macro.yields10y} />
                <MacroItem label="Risk Mode" value={data.macro.globalRisk} trend={data.macro.globalRisk} />
            </div>

            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    value={inputTicker}
                    onChange={(e) => setInputTicker(e.target.value)}
                    placeholder="CMD / TICKER..." 
                    className="bg-slate-950 border border-slate-700 rounded px-4 py-1 w-40 text-xs font-mono focus:outline-none focus:border-quant-neon text-white placeholder-slate-600 uppercase text-center"
                />
            </form>
        </div>
      </header>

      {/* MAIN LAYOUT: 3-Column Grid */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        
        {/* COL 1: Visual Intelligence (Chart, MTF, Tape) */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
             
             {/* Chart & Header Info */}
             <div className="flex justify-between items-end px-1">
                 <div>
                    <h2 className="text-2xl font-bold text-white">{data.ticker}</h2>
                    <span className="text-xs text-slate-500 font-mono">{data.freshness.source} @ {data.freshness.timestamp}</span>
                 </div>
                 <div className="text-right">
                    <div className={`text-3xl font-mono text-quant-neon font-bold ${isHighConviction ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`}>
                        ${data.freshness.lastPrice.toFixed(2)}
                    </div>
                 </div>
             </div>
             
             {/* Driver Priority Banner */}
             <div className="bg-slate-900 border-y border-slate-800 py-1 px-2 text-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-2">Primary Driver:</span>
                 <span className="text-xs font-bold text-white">{data.driverPriority}</span>
             </div>

             <ChartWidget data={data} isLoading={loading} />

            {/* Micro-Tape Widget */}
            <div className="grid grid-cols-4 gap-2 bg-slate-900/50 border border-slate-800 rounded p-2">
                <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Spread</div>
                    <div className="text-xs font-mono text-white">{data.microTape.lastSpread}</div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Imbalance</div>
                    <div className="text-xs font-mono text-quant-neon">{data.microTape.imbalance}</div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Vol Burst</div>
                    <div className="text-xs font-mono text-white">{data.microTape.volumeBurst}%</div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Wick Rej</div>
                    <div className="text-xs font-mono text-white">{data.microTape.rejectionWick}</div>
                </div>
            </div>

             {/* Multi-Timeframe Engine */}
             <div className={`bg-slate-900/50 border border-slate-800 rounded p-3 ${data.macro.globalRisk === 'Risk-Off' ? 'border-quant-bear/30 shadow-[0_0_15px_rgba(255,0,85,0.1)]' : ''}`}>
                 <h3 className="text-[10px] font-mono text-slate-400 uppercase mb-2">Multi-Timeframe Sync</h3>
                 <div className="flex justify-between items-center gap-1">
                     {data.mtfAnalysis.timeframes.map((tf, i) => (
                         <div key={i} className="flex flex-col items-center flex-1 bg-slate-950 py-1 rounded border border-slate-800/50">
                             <span className="text-[10px] text-slate-500">{tf.tf}</span>
                             <span className={`text-xs font-bold ${tf.trend === 'BULLISH' ? 'text-quant-bull' : tf.trend === 'BEARISH' ? 'text-quant-bear' : 'text-slate-400'}`}>
                                 {tf.trend === 'BULLISH' ? '▲' : tf.trend === 'BEARISH' ? '▼' : '—'}
                             </span>
                         </div>
                     ))}
                 </div>
                 <div className="mt-2 text-xs text-center text-slate-400">
                     Alignment: <span className="text-white font-bold">{data.mtfAnalysis.alignmentRating}</span> • Best TF: <span className="text-quant-neon">{data.mtfAnalysis.bestTradeTimeframe}</span>
                 </div>
             </div>
        </div>

        {/* COL 2: Logic Engine (Scanner, Portfolio, Signals) */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Mentor Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-l-4 border-quant-neon p-3 rounded shadow-lg">
                <div className="text-[10px] font-mono text-quant-neon mb-1 uppercase">Mentor Insight</div>
                <p className="text-sm text-white italic leading-snug">"{data.mentorSummary}"</p>
            </div>

            <SignalPanel data={data} />

            {/* Market Scanner Results */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex-1 min-h-[200px]">
                <h3 className="text-[10px] font-mono text-slate-400 uppercase mb-3 border-b border-slate-800 pb-1">Scanner: Top Opportunities</h3>
                
                <div className="space-y-3">
                    {data.scanner.topLongs.map((setup, i) => (
                        <div key={`long-${i}`} className="bg-slate-950 border border-slate-800 hover:border-quant-bull rounded p-2 group cursor-pointer transition-all" onClick={() => { setTicker(setup.ticker); fetchData(setup.ticker); }}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-quant-bull">{setup.ticker} <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1 rounded">LONG</span></span>
                                <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-white border border-slate-800">Grade {setup.riskGrade}</span>
                            </div>
                            <div className="text-xs text-slate-400 mb-1 truncate">{setup.type} • {setup.thesis}</div>
                        </div>
                    ))}
                    {data.scanner.topShorts.map((setup, i) => (
                        <div key={`short-${i}`} className="bg-slate-950 border border-slate-800 hover:border-quant-bear rounded p-2 group cursor-pointer transition-all" onClick={() => { setTicker(setup.ticker); fetchData(setup.ticker); }}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-quant-bear">{setup.ticker} <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1 rounded">SHORT</span></span>
                                <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-white border border-slate-800">Grade {setup.riskGrade}</span>
                            </div>
                            <div className="text-xs text-slate-400 mb-1 truncate">{setup.type} • {setup.thesis}</div>
                        </div>
                    ))}
                     {data.scanner.topLongs.length === 0 && data.scanner.topShorts.length === 0 && (
                        <div className="text-center text-xs text-slate-600 py-4">No A+ Setups found in current scan.</div>
                    )}
                </div>
            </div>

        </div>

        {/* COL 3: Environment Engine (Liquidity, Options, Alerts) */}
        <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            
            {/* Alerts Module */}
            <div className="bg-slate-900 border border-slate-800 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] font-mono text-slate-400 uppercase">Active Alerts</h3>
                    <span className="w-2 h-2 bg-quant-warn rounded-full animate-pulse"></span>
                </div>
                <div className="space-y-2">
                    {data.alerts.length > 0 ? data.alerts.map((alert, i) => (
                        <div key={i} className="text-xs bg-slate-950 p-2 rounded border-l-2 border-quant-warn">
                            <div className="font-bold text-white flex justify-between">
                                {alert.ticker} 
                                <span className="text-[9px] bg-slate-900 px-1 rounded">{alert.type}</span>
                            </div>
                            <div className="text-slate-400 mt-0.5">{alert.message}</div>
                        </div>
                    )) : <div className="text-xs text-slate-600 text-center italic">No critical alerts active</div>}
                </div>
            </div>

            {/* Flow Battle Meter */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-3">
                 <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                    <span className="text-slate-400">Flow Battle</span>
                    <span className={`font-bold ${flowBattleColor}`}>{data.flowBattle}</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                     <div className={`h-full bg-quant-bull transition-all duration-500`} style={{ width: data.flowBattle === 'BUY DOMINANT' ? '70%' : data.flowBattle === 'BALANCED' ? '50%' : '30%' }}></div>
                     <div className={`h-full bg-quant-bear transition-all duration-500`} style={{ width: data.flowBattle === 'SELL DOMINANT' ? '70%' : data.flowBattle === 'BALANCED' ? '50%' : '30%' }}></div>
                 </div>
            </div>

            {/* Liquidity Map */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-3">
                 <h3 className="text-[10px] font-mono text-slate-400 uppercase mb-2 border-b border-slate-800 pb-1">Liquidity Map</h3>
                 <div className="space-y-3 text-xs">
                     <div>
                         <span className="text-quant-bear block mb-1 font-bold">SUPPLY / RESISTANCE</span>
                         <div className="flex flex-wrap gap-1">
                            {data.liquidityMap.supplyZones.map((z, i) => (
                                <span key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">{z}</span>
                            ))}
                         </div>
                     </div>
                     <div>
                         <span className="text-quant-bull block mb-1 font-bold">DEMAND / SUPPORT</span>
                         <div className="flex flex-wrap gap-1">
                            {data.liquidityMap.demandZones.map((z, i) => (
                                <span key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">{z}</span>
                            ))}
                         </div>
                     </div>
                     <div>
                         <span className="text-orange-500 block mb-1 font-bold">TRAPS & STOPS</span>
                         <div className="flex flex-wrap gap-1">
                            {data.liquidityMap.traps.concat(data.liquidityMap.stopClusters).map((z, i) => (
                                <span key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">{z}</span>
                            ))}
                         </div>
                     </div>
                 </div>
            </div>

            {/* Options Flow */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex-1">
                 <h3 className="text-[10px] font-mono text-slate-400 uppercase mb-2">Options Neural</h3>
                 <div className="text-sm mb-2">
                     Bias: <span className={`font-bold ${data.optionsNeural.flowBias === 'Bullish' ? 'text-quant-bull' : data.optionsNeural.flowBias === 'Bearish' ? 'text-quant-bear' : 'text-white'}`}>
                        {data.optionsNeural.flowBias}
                     </span>
                 </div>
                 <div className="text-xs bg-slate-950 p-2 rounded text-slate-300 leading-relaxed border border-slate-800">
                     {data.optionsNeural.interpretation}
                 </div>
            </div>

        </div>

      </main>

      {/* FOOTER: Terminal */}
      <Terminal logs={logs} />
    </div>
  );
};