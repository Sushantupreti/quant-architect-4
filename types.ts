export enum MarketTrend {
    BULLISH = 'BULLISH',
    BEARISH = 'BEARISH',
    NEUTRAL = 'NEUTRAL',
    CHOPPY = 'CHOPPY'
  }

  export type TradingMode = 'SCALP' | 'DAY' | 'SWING';
  
  export interface MacroMetrics {
    vix: string;
    dxy: string;
    yields10y: string;
    spyQqqCorrelation: string;
    globalRisk: 'Risk-On' | 'Risk-Off' | 'Neutral';
    volatilityExp: string;
  }
  
  export interface TimeframeData {
    tf: '1m' | '5m' | '15m' | '1h' | '1d';
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  }
  
  export interface MultiTimeframeAnalysis {
    timeframes: TimeframeData[];
    alignmentRating: string; // e.g., "4/5 Bullish"
    bestTradeTimeframe: string;
  }
  
  export interface TradeSetup {
    ticker: string;
    type: string; // e.g., "VCP", "Breakout"
    direction: 'LONG' | 'SHORT';
    entry: string;
    stop: string;
    targets: string[];
    conviction: number;
    riskGrade: 'A' | 'B' | 'C';
    thesis: string;
    positionSize: string;
    riskReward: string;
    management: string;
  }
  
  export interface ScannerResult {
    topLongs: TradeSetup[];
    topShorts: TradeSetup[];
  }
  
  export interface PortfolioPosition {
    ticker: string;
    entryPrice: number;
    currentPrice: number;
    stopPrice: number;
    pnlPercent: number;
    convictionDecay: string; // e.g., "Stable", "Decaying"
    action: string; // "Hold", "Scale Out"
  }
  
  export interface LiquidityMap {
    demandZones: string[];
    supplyZones: string[];
    volumeShelves: string[];
    stopClusters: string[];
    traps: string[];
    avwapAnchors: string[];
  }
  
  export interface MSCScores {
    structure: number;
    momentum: number;
    liquidity: number;
    flow: number;
    internals: number;
    totalConviction: number;
  }
  
  export interface OptionsNeural {
    flowBias: 'Bullish' | 'Bearish' | 'Mixed' | 'Neutral';
    keyStrikes: string;
    sweeps: string;
    blocks: string;
    interpretation: string;
  }
  
  export interface TapeAnalysis {
    action: string;
    details: string[];
  }

  export interface MicroTape {
    lastSpread: string;
    imbalance: string; // e.g., "Bid Heavy 60%"
    volumeBurst: number; // 0-100
    rejectionWick: string; // e.g. "Top 20%"
  }

  export interface ConfidenceVector {
    conviction: number;
    clarity: number;
    risk: 'Low' | 'Medium' | 'High';
    reward: 'Low' | 'Medium' | 'High';
    uncertainty: number;
  }
  
  export interface Alert {
    id: string;
    ticker: string;
    message: string;
    type: 'BREAKOUT' | 'BREAKDOWN' | 'VOLUME' | 'NEWS';
    action: 'ENTER' | 'EXIT' | 'WATCH';
  }
  
  export interface DataFreshness {
    source: string;
    lastPrice: number;
    timestamp: string;
    isDelayed: boolean;
    delayMessage: string;
  }
  
  export interface QuantAnalysisResult {
    ticker: string; // Primary ticker being analyzed
    freshness: DataFreshness;
    macro: MacroMetrics;
    scanner: ScannerResult;
    portfolio: PortfolioPosition[];
    liquidityMap: LiquidityMap;
    mscScores: MSCScores;
    mtfAnalysis: MultiTimeframeAnalysis;
    optionsNeural: OptionsNeural;
    tapeAnalysis: TapeAnalysis;
    microTape: MicroTape;
    alerts: Alert[];
    mentorSummary: string;
    
    // New 4.0 Extended Metrics
    driverPriority: string;
    flowBattle: 'BUY DOMINANT' | 'SELL DOMINANT' | 'BALANCED';
    traderAction: string;
    edgeScore: number;
    confidence: ConfidenceVector;
    contradictionWarning: string | null;

    technicals: {
        rsi: number;
        macd: string;
        adx: number;
    }
  }
  
  export interface LogMessage {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
  }