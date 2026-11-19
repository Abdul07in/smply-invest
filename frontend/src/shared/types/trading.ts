export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "1D";
export type DrawingTool = "cursor" | "horizontal" | "trendline" | "note" | "entry" | "stop" | "target";
export type ActivityTab = "orders" | "positions" | "history" | "alerts";
export type PlanStatus = "Draft" | "Active" | "Monitoring" | "Paused" | "Triggered" | "Failed";
export type OrderStatus = "Working" | "Filled" | "Cancelled" | "Failed";
export type TradeSide = "Long" | "Short";
export type TriggerOperator = "above" | "below";
export type OrderType = "Market" | "Limit";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  lastPrice: number;
  change: number;
  changePercent: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PlanLevel {
  id: string;
  label: string;
  price: number;
  kind: "entry" | "stop" | "target";
}

export interface TradePlan {
  id: string;
  name: string;
  instrumentId: string;
  side: TradeSide;
  status: PlanStatus;
  triggerOperator: TriggerOperator;
  triggerPrice: number;
  timeframe: Timeframe;
  orderType: OrderType;
  autoExecute: boolean;
  entry: number;
  stop: number;
  target: number;
  quantity: number;
  note: string;
  lastExecutedCandleTime?: number;
  executionMessage?: string;
}

export interface PaperOrder {
  id: string;
  time: string;
  instrument: string;
  action: "Buy" | "Sell";
  quantity: number;
  price: number;
  status: OrderStatus;
  validity: string;
  planId?: string;
  orderType?: OrderType;
  realizedPnl?: number;
  failureReason?: string;
}

export interface Position {
  id: string;
  instrument: string;
  detail: string;
  side: "Long" | "Short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  returnPercent: number;
  planId?: string;
}

export interface ChartDrawing {
  id: string;
  tool: Exclude<DrawingTool, "cursor">;
  points: Array<{ time: number; price: number }>;
  text?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
}
