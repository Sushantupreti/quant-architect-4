import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { QuantAnalysisResult } from '../types';

interface ChartWidgetProps {
  data: QuantAnalysisResult;
  isLoading: boolean;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data, isLoading }) => {
  // Helper to determine trend from MTF Analysis
  const trendRaw = data.mtfAnalysis?.alignmentRating || "Neutral";
  const isBullish = trendRaw.toUpperCase().includes("BULLISH");
  const isBearish = trendRaw.toUpperCase().includes("BEARISH");
  const trendColor = isBullish ? '#00ff9d' : isBearish ? '#ff0055' : '#94a3b8';
  
  // Get Volatility from Macro
  const volatilityRaw = data.macro?.volatilityExp || "Normal";

  // Simulate intraday data points based on current price and trend for visualization
  // In a real app, this would be actual historical data arrays
  const chartData = useMemo(() => {
    if (data.freshness.lastPrice === 0) return [];
    
    const points = [];
    const now = new Date();
    const volatility = volatilityRaw.includes("High") ? 0.008 : 0.003;
    const trendBias = isBullish ? 0.0015 : isBearish ? -0.0015 : 0;

    let price = data.freshness.lastPrice * (1 - (trendBias * 50)); // Backtrack start price

    for (let i = 0; i < 50; i++) {
        const time = new Date(now.getTime() - (50 - i) * 5 * 60000); // 5 min candles back
        // Random walk with trend bias
        const change = price * (Math.random() * volatility - (volatility/2) + trendBias);
        price += change;
        points.push({
            time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            price: parseFloat(price.toFixed(2)),
            vwap: parseFloat((price * (1 + (Math.random() * 0.002 - 0.001))).toFixed(2))
        });
    }
    // Ensure last point matches current price exactly
    points.push({
        time: 'Now',
        price: data.freshness.lastPrice,
        vwap: data.freshness.lastPrice
    });
    return points;
  }, [data.freshness.lastPrice, isBullish, isBearish, volatilityRaw]);

  // Extract numeric values from string ranges for reference lines (simple parser)
  const parseLevel = (str: string) => {
    const match = str.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[0]) : null;
  };

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-900/30 border border-slate-800/50 rounded-lg animate-pulse">
        <div className="text-center">
            <div className="text-quant-neon font-mono text-xl mb-2">QUANTARCHITECT 4.0</div>
            <div className="text-slate-500 text-sm">Establishing Secure Data Uplink...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-slate-900/50 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
             <h2 className="text-3xl font-bold text-white flex items-baseline gap-3">
                {data.ticker} 
                <span className={`text-2xl ${isBullish ? 'text-quant-bull' : isBearish ? 'text-quant-bear' : 'text-slate-400'}`}>
                    ${data.freshness.lastPrice.toFixed(2)}
                </span>
             </h2>
             <div className="flex gap-2 text-xs font-mono mt-1">
                 <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">VOL: {volatilityRaw}</span>
                 <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ALIGN: {trendRaw}</span>
             </div>
        </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={5} hide />
          <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(val) => val.toFixed(2)} orientation="right" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
            itemStyle={{ color: '#00f0ff' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={trendColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
          <Area type="monotone" dataKey="vwap" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" fill="none" isAnimationActive={false} />
          
          {/* Render Supply Zones (Red Lines) */}
          {data.liquidityMap.supplyZones.slice(0,2).map((level, idx) => {
             const price = parseLevel(level);
             if (!price) return null;
             return (
                <ReferenceLine 
                    key={`sup-${idx}`} 
                    y={price} 
                    stroke="#ff0055" 
                    strokeDasharray="3 3" 
                    label={{ position: 'left', value: 'SUPPLY', fontSize: 9, fill: '#ff0055' }} 
                />
             );
          })}

          {/* Render Demand Zones (Green Lines) */}
          {data.liquidityMap.demandZones.slice(0,2).map((level, idx) => {
             const price = parseLevel(level);
             if (!price) return null;
             return (
                <ReferenceLine 
                    key={`dem-${idx}`} 
                    y={price} 
                    stroke="#00ff9d" 
                    strokeDasharray="3 3" 
                    label={{ position: 'left', value: 'DEMAND', fontSize: 9, fill: '#00ff9d' }} 
                />
             );
          })}

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};