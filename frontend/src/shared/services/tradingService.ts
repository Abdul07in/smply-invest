import { createCandles, initialAlerts, initialOrders, initialPlans, initialPositions, instruments } from "@/mock/data";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import type { AlertItem, Candle, Instrument, OrderType, PaperOrder, Position, Timeframe, TradePlan } from "@/shared/types/trading";

export interface TradingSnapshot {
  instruments: Instrument[];
  candles: Candle[];
  plans: TradePlan[];
  orders: PaperOrder[];
  positions: Position[];
  alerts: AlertItem[];
}

export interface TradingService {
  loadWorkspace(instrumentId: string, timeframe: Timeframe): Promise<TradingSnapshot>;
  loadCandles(instrumentId: string, timeframe: Timeframe): Promise<Candle[]>;
  savePlan(plan: TradePlan): Promise<TradePlan>;
  deletePlan(planId: string): Promise<void>;
  setPlanStatus(planId: string, status: TradePlan["status"]): Promise<TradePlan>;
  startPlan(planId: string): Promise<TradePlan>;
  monitorPlan(planId: string, candle: Candle): Promise<TradePlan>;
  processMonitoringPlans(instrumentId: string): Promise<void>;
  submitPaperOrder(order: Omit<PaperOrder, "id" | "time" | "status" | "validity"> & { orderType?: OrderType }): Promise<PaperOrder>;
  cancelPaperOrder(orderId: string): Promise<void>;
  closePosition(positionId: string): Promise<void>;
}

/** Demo implementation. Replace with an HTTP adapter without changing feature components. */
export class MockTradingService implements TradingService {
  private plans = structuredClone(initialPlans);
  private orders = structuredClone(initialOrders);
  private positions = structuredClone(initialPositions);
  private alerts = structuredClone(initialAlerts);
  private hydrated = false;
  private marketTick = 0;

  private hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const saved = window.localStorage.getItem("simply-markets:paper-account");
      if (!saved) return;
      const state = JSON.parse(saved) as Partial<Pick<TradingSnapshot, "plans" | "orders" | "positions" | "alerts">>;
      if (state.plans) this.plans = state.plans.map((plan) => ({ ...plan, triggerOperator: plan.triggerOperator ?? "above", triggerPrice: plan.triggerPrice ?? plan.entry, timeframe: plan.timeframe ?? "15m", orderType: plan.orderType ?? "Market", autoExecute: plan.autoExecute ?? true }));
      if (state.orders) this.orders = state.orders;
      if (state.positions) this.positions = state.positions;
      if (state.alerts) this.alerts = state.alerts;
    } catch {
      window.localStorage.removeItem("simply-markets:paper-account");
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("simply-markets:paper-account", JSON.stringify({ plans: this.plans, orders: this.orders, positions: this.positions, alerts: this.alerts }));
  }

  async loadWorkspace(instrumentId: string, timeframe: Timeframe): Promise<TradingSnapshot> {
    this.hydrate();
    const candles = await this.loadCandles(instrumentId, timeframe);
    const lastCandle = candles[candles.length - 1];
    const marketInstruments = instruments.map((instrument) => instrument.id === instrumentId ? { ...instrument, lastPrice: lastCandle.close, change: lastCandle.close - instrument.lastPrice, changePercent: (lastCandle.close - instrument.lastPrice) / instrument.lastPrice * 100 } : instrument);
    return { instruments: marketInstruments, candles, plans: this.plans, orders: this.orders, positions: this.positions, alerts: this.alerts };
  }

  async loadCandles(instrumentId: string, timeframe: Timeframe) {
    const candles = createCandles(instrumentId, 72, timeframe);
    const prior = candles[candles.length - 1];
    const instrument = instruments.find((item) => item.id === instrumentId) ?? instruments[0];
    const secondsByTimeframe: Record<Timeframe, number> = { "1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "1D": 86400 };
    this.marketTick += 1;
    const close = instrument.lastPrice * (1 + Math.sin(this.marketTick * 0.73) * 0.0016);
    const spread = instrument.lastPrice * 0.00045;
    const candle: Candle = { ...prior, time: Math.floor(Date.now() / 1000) + this.marketTick * secondsByTimeframe[timeframe], open: prior.close, close, high: Math.max(prior.close, close) + spread, low: Math.min(prior.close, close) - spread, volume: prior.volume + this.marketTick * 175 };
    return [...candles.slice(0, -1), candle];
  }

  async savePlan(plan: TradePlan) {
    this.hydrate();
    if (this.plans.some((item) => item.id !== plan.id && item.name.trim().toLowerCase() === plan.name.trim().toLowerCase())) throw new Error(tradingCopy.plan.duplicateName);
    const savedPlan = structuredClone(plan);
    this.plans = [savedPlan, ...this.plans.filter((item) => item.id !== savedPlan.id)];
    this.persist();
    return structuredClone(savedPlan);
  }

  async deletePlan(planId: string) {
    this.hydrate();
    this.plans = this.plans.filter((plan) => plan.id !== planId);
    this.persist();
  }

  async setPlanStatus(planId: string, status: TradePlan["status"]) {
    this.hydrate();
    if (!this.plans.some((item) => item.id === planId)) throw new Error(tradingCopy.workspace.planMissing);
    this.plans = this.plans.map((item) => item.id === planId ? { ...item, status } : status === "Monitoring" && item.status === "Monitoring" ? { ...item, status: "Active" } : item);
    this.persist();
    return structuredClone(this.plans.find((item) => item.id === planId) as TradePlan);
  }

  async monitorPlan(planId: string, candle: Candle) {
    this.hydrate();
    const plan = this.plans.find((item) => item.id === planId);
    if (!plan) throw new Error(tradingCopy.workspace.planMissing);
    if (plan.status !== "Active" && plan.status !== "Monitoring") throw new Error(tradingCopy.workspace.planMustBeEnabled);
    const signalMatched = plan.triggerOperator === "above" ? candle.close > plan.triggerPrice : candle.close < plan.triggerPrice;
    if (!signalMatched) {
      this.plans = this.plans.map((item) => item.id === planId ? { ...item, status: "Monitoring", executionMessage: undefined } : item);
      this.persist();
      return structuredClone(this.plans.find((item) => item.id === planId) as TradePlan);
    }
    if (plan.lastExecutedCandleTime === candle.time) {
      this.plans = this.plans.map((item) => item.id === planId ? { ...item, status: "Monitoring", executionMessage: tradingCopy.workspace.executionAlreadyHandled } : item);
      this.persist();
      return structuredClone(this.plans.find((item) => item.id === planId) as TradePlan);
    }
    if (!plan.autoExecute) {
      this.plans = this.plans.map((item) => item.id === planId ? { ...item, status: "Triggered", lastExecutedCandleTime: candle.time, executionMessage: tradingCopy.workspace.signalHit } : item);
      this.persist();
      return structuredClone(this.plans.find((item) => item.id === planId) as TradePlan);
    }
    const instrument = instruments.find((item) => item.id === plan.instrumentId) ?? instruments[0];
    const order = this.makeOrder({
      instrument: instrument.symbol,
      action: plan.side === "Long" ? "Buy" : "Sell",
      quantity: plan.quantity,
      price: plan.orderType === "Market" ? candle.close : plan.entry,
      planId: plan.id,
      orderType: plan.orderType,
    });
    this.orders = [order, ...this.orders];
    if (order.status === "Filled") this.applyFilledOrder(order);
    this.plans = this.plans.map((item) => item.id === planId ? { ...item, status: order.status === "Failed" ? "Failed" : "Triggered", lastExecutedCandleTime: candle.time, executionMessage: order.status === "Failed" ? order.failureReason : tradingCopy.workspace.orderPlaced } : item);
    this.persist();
    return structuredClone(this.plans.find((item) => item.id === planId) as TradePlan);
  }

  async startPlan(planId: string) {
    await this.setPlanStatus(planId, "Monitoring");
    const plan = this.plans.find((item) => item.id === planId);
    if (!plan) throw new Error(tradingCopy.workspace.planMissing);
    const candles = await this.loadCandles(plan.instrumentId, plan.timeframe);
    return this.monitorPlan(planId, candles[candles.length - 1]);
  }

  async processMonitoringPlans(instrumentId: string) {
    this.hydrate();
    const plans = this.plans.filter((plan) => plan.instrumentId === instrumentId && plan.status === "Monitoring");
    for (const plan of plans) {
      const candles = await this.loadCandles(plan.instrumentId, plan.timeframe);
      await this.monitorPlan(plan.id, candles[candles.length - 1]);
    }
  }

  async submitPaperOrder(input: Omit<PaperOrder, "id" | "time" | "status" | "validity"> & { orderType?: OrderType }) {
    this.hydrate();
    const order = this.makeOrder(input);
    this.orders = [order, ...this.orders];
    if (order.status === "Filled") this.applyFilledOrder(order);
    this.persist();
    return order;
  }

  async cancelPaperOrder(orderId: string) { this.hydrate(); this.orders = this.orders.map((order) => order.id === orderId && order.status === "Working" ? { ...order, status: "Cancelled" } : order); this.persist(); }

  async closePosition(positionId: string) {
    this.hydrate();
    const position = this.positions.find((item) => item.id === positionId);
    if (position) {
      const order = this.makeOrder({ instrument: position.instrument, action: position.side === "Long" ? "Sell" : "Buy", quantity: position.quantity, price: position.currentPrice, planId: position.planId, realizedPnl: position.pnl, orderType: "Market" });
      this.orders = [order, ...this.orders];
    }
    this.positions = this.positions.filter((item) => item.id !== positionId);
    this.persist();
  }

  private makeOrder(input: Omit<PaperOrder, "id" | "time" | "status" | "validity"> & { orderType?: OrderType }): PaperOrder {
    const invalid = !Number.isFinite(input.price) || input.price <= 0 || !Number.isFinite(input.quantity) || input.quantity <= 0;
    const orderType = input.orderType ?? "Market";
    return {
      ...input,
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date()),
      status: invalid ? "Failed" : orderType === "Limit" ? "Working" : "Filled",
      failureReason: invalid ? tradingCopy.order.invalidOrder : input.failureReason,
      validity: "Day",
      orderType,
    };
  }

  private applyFilledOrder(order: PaperOrder) {
    const current = this.positions.find((position) => position.instrument === order.instrument && position.side === (order.action === "Buy" ? "Long" : "Short"));
    const side = order.action === "Buy" ? "Long" : "Short";
    if (current) {
      const quantity = current.quantity + order.quantity;
      this.positions = this.positions.map((position) => position.id === current.id ? { ...position, entryPrice: (current.entryPrice * current.quantity + order.price * order.quantity) / quantity, quantity } : position);
    } else {
      this.positions = [{ id: `pos-${Date.now()}`, instrument: order.instrument, detail: "Paper position", side, quantity: order.quantity, entryPrice: order.price, currentPrice: order.price, pnl: 0, returnPercent: 0, planId: order.planId }, ...this.positions];
    }
  }
}

export const tradingService: TradingService = new MockTradingService();
