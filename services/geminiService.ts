import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, INITIAL_ANALYSIS } from "../constants";
import { QuantAnalysisResult, TradingMode } from "../types";

const apiKey = process.env.API_KEY || '';

export const getQuantAnalysis = async (input: string, mode: TradingMode = 'DAY'): Promise<QuantAnalysisResult> => {
  if (!apiKey) {
    console.error("API Key missing");
    return INITIAL_ANALYSIS;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `COMMAND: ${input}. 
      
      EXECUTE QUANTARCHITECT 4.0 PROTOCOL. 
      ACTIVE TRADING MODE: ${mode} (Adjust stops, targets, and logic for ${mode} timeframe).
      ENGAGE ALL ENGINES: SCANNER, MACRO, PORTFOLIO, LIQUIDITY, TAPE, EDGE SCORE, MICRO TAPE.
      SEARCH LATEST REAL-TIME DATA.
      `,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    const text = response.text;
    
    // Extract JSON from the response
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Quant Engine Error: Output format invalid (No JSON found)");
    }

    const data = JSON.parse(jsonMatch[0]) as QuantAnalysisResult;
    
    // Deep merge with fallback to prevent UI crashes
    const mergedData: QuantAnalysisResult = {
        ...INITIAL_ANALYSIS,
        ...data,
        freshness: {
            ...INITIAL_ANALYSIS.freshness,
            ...(data.freshness || {}),
            lastPrice: Number(data.freshness?.lastPrice) || 0
        },
        macro: { ...INITIAL_ANALYSIS.macro, ...(data.macro || {}) },
        scanner: {
            topLongs: data.scanner?.topLongs || [],
            topShorts: data.scanner?.topShorts || []
        },
        portfolio: data.portfolio || [],
        liquidityMap: { ...INITIAL_ANALYSIS.liquidityMap, ...(data.liquidityMap || {}) },
        mscScores: { ...INITIAL_ANALYSIS.mscScores, ...(data.mscScores || {}) },
        mtfAnalysis: { ...INITIAL_ANALYSIS.mtfAnalysis, ...(data.mtfAnalysis || {}) },
        optionsNeural: { ...INITIAL_ANALYSIS.optionsNeural, ...(data.optionsNeural || {}) },
        tapeAnalysis: { ...INITIAL_ANALYSIS.tapeAnalysis, ...(data.tapeAnalysis || {}) },
        microTape: { ...INITIAL_ANALYSIS.microTape, ...(data.microTape || {}) },
        confidence: { ...INITIAL_ANALYSIS.confidence, ...(data.confidence || {}) },
        alerts: data.alerts || [],
        technicals: { ...INITIAL_ANALYSIS.technicals, ...(data.technicals || {}) },
        ticker: (data.ticker || input).toUpperCase(),
        driverPriority: data.driverPriority || "Processing...",
        flowBattle: data.flowBattle || "BALANCED",
        traderAction: data.traderAction || "WAIT",
        edgeScore: data.edgeScore || 0,
        contradictionWarning: data.contradictionWarning || null
    };

    return mergedData;

  } catch (error) {
    console.error("QuantArchitect Analysis Failed:", error);
    return {
        ...INITIAL_ANALYSIS,
        ticker: input.toUpperCase(),
        mentorSummary: "CRITICAL ERROR: Data Uplink Failed. Check API Key or Internet Connection.",
        freshness: {
            ...INITIAL_ANALYSIS.freshness,
            delayMessage: "SYSTEM OFFLINE"
        }
    };
  }
};