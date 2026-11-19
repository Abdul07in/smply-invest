import type { AlertItem, Candle, Instrument, PaperOrder, Position, Timeframe, TradePlan } from "@/shared/types/trading";
import { tradingCopy } from "@/shared/copy/tradingCopy";

export const instruments: Instrument[] = [
  { id: "nifty-50", symbol: "NIFTY 50", name: "Nifty 50", exchange: "NSE", currency: "INR", lastPrice: 25174.35, change: 122.4, changePercent: 0.49 },
  { id: "bank-nifty", symbol: "BANK NIFTY", name: "Nifty Bank", exchange: "NSE", currency: "INR", lastPrice: 55703.2, change: 278.15, changePercent: 0.5 },
  { id: "sensex", symbol: "SENSEX", name: "BSE Sensex", exchange: "BSE", currency: "INR", lastPrice: 83563.57, change: 372.18, changePercent: 0.45 },
];

export const createCandles = (instrumentId: string, count = 72, timeframe: Timeframe = "15m"): Candle[] => {
  const instrument = instruments.find((item) => item.id === instrumentId) ?? instruments[0];
  const base = instrument.lastPrice * 0.982;
  const secondsByTimeframe: Record<Timeframe, number> = { "1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "1D": 86400 };
  const intervalSeconds = secondsByTimeframe[timeframe];
  const sampleMarketTime = Date.UTC(2026, 10, 15, 9, 30) / 1000;
  const now = Math.floor(sampleMarketTime / intervalSeconds) * intervalSeconds;
  let previous = base;
  return Array.from({ length: count }, (_, index) => {
    const trend = index * instrument.lastPrice * 0.00025;
    const wave = Math.sin(index * 0.55) * instrument.lastPrice * 0.00115 + Math.cos(index * 0.19) * instrument.lastPrice * 0.00075;
    const open = previous;
    const close = base + trend + wave;
    const spread = instrument.lastPrice * (0.00055 + (index % 5) * 0.00007);
    const candle = { time: now - (count - index) * intervalSeconds, open, high: Math.max(open, close) + spread, low: Math.min(open, close) - spread * 0.86, close, volume: 10_000 + Math.round((Math.sin(index * 1.9) + 1.5) * 28_000) };
    previous = close;
    return candle;
  });
};

export const initialPlans: TradePlan[] = [
  { id: "plan-001", name: "Opening range breakout", instrumentId: "nifty-50", side: "Long", status: "Active", triggerOperator: "above", triggerPrice: 25110, timeframe: "15m", orderType: "Market", autoExecute: true, entry: 25110, stop: 25040, target: 25250, quantity: 50, note: "Wait for a clean hold above the morning range." },
];

export const initialOrders: PaperOrder[] = [
  { id: "ord-1401", time: "14 Nov, 19:10", instrument: "NIFTY 50", action: "Buy", quantity: 50, price: 25110, status: "Working", validity: "Day" },
  { id: "ord-1398", time: "14 Nov, 09:42", instrument: "NIFTY 50", action: "Buy", quantity: 25, price: 25080, status: "Failed", validity: "Day", failureReason: tradingCopy.order.insufficientBuyingPower },
];

export const initialPositions: Position[] = [
  { id: "pos-201", instrument: "NIFTY 50 CE 25500", detail: "14 Nov expiry", side: "Long", quantity: 150, entryPrice: 92.5, currentPrice: 104.8, pnl: 1845, returnPercent: 13.3 },
];

export const initialAlerts: AlertItem[] = [
  { id: "alert-1", title: "NIFTY 50 price level", detail: "Crosses above ₹25,200", time: "10:42", read: false },
  { id: "alert-2", title: "Opening range breakout", detail: "Plan level reached · NIFTY 50", time: "09:48", read: false },
];

export const marketSummary = { runningPnl: 1845, dayPnl: 8320, buyingPower: 500000, marketOpen: true };

export const marketIndices = [
  { symbol: "NIFTY 50", price: "25,174.35", change: "122.40", percent: "0.49" },
  { symbol: "BANK NIFTY", price: "55,703.20", change: "278.15", percent: "0.50" },
  { symbol: "SENSEX", price: "83,563.57", change: "372.18", percent: "0.45" },
];
