import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { tradingService, type TradingSnapshot } from "@/shared/services/tradingService";
import type { ChartDrawing, PlanStatus, Timeframe, TradePlan } from "@/shared/types/trading";

export const loadWorkspace = createAsyncThunk<TradingSnapshot, { instrumentId: string; timeframe: Timeframe }>(
  "trading/loadWorkspace",
  ({ instrumentId, timeframe }) => tradingService.loadWorkspace(instrumentId, timeframe),
);
export const saveTradePlan = createAsyncThunk("trading/saveTradePlan", (plan: TradePlan) => tradingService.savePlan(plan));
export const deleteTradePlan = createAsyncThunk("trading/deleteTradePlan", (planId: string) => tradingService.deletePlan(planId));
export const setTradePlanStatus = createAsyncThunk("trading/setTradePlanStatus", ({ planId, status }: { planId: string; status: PlanStatus }) => tradingService.setPlanStatus(planId, status));
export const startTradePlan = createAsyncThunk("trading/startTradePlan", (planId: string) => tradingService.startPlan(planId));
export const processMonitoringPlans = createAsyncThunk("trading/processMonitoringPlans", (instrumentId: string) => tradingService.processMonitoringPlans(instrumentId));
export const submitPaperOrder = createAsyncThunk("trading/submitPaperOrder", (order: Parameters<typeof tradingService.submitPaperOrder>[0]) => tradingService.submitPaperOrder(order));
export const cancelPaperOrder = createAsyncThunk("trading/cancelPaperOrder", (orderId: string) => tradingService.cancelPaperOrder(orderId));
export const closePaperPosition = createAsyncThunk("trading/closePaperPosition", (positionId: string) => tradingService.closePosition(positionId));

interface TradingState {
  instrumentId: string;
  timeframe: Timeframe;
  snapshot: TradingSnapshot | null;
  loadStatus: "idle" | "loading" | "ready" | "failed";
  loadError: string | null;
  activeLoadRequestId?: string;
  drawingsByInstrument: Record<string, ChartDrawing[]>;
  redoByInstrument: Record<string, ChartDrawing[]>;
  watchlistIds: string[];
  selectedPlanId: string | null;
}

const initialState: TradingState = {
  instrumentId: "nifty-50",
  timeframe: "15m",
  snapshot: null,
  loadStatus: "idle",
  loadError: null,
  drawingsByInstrument: {},
  redoByInstrument: {},
  watchlistIds: [],
  selectedPlanId: "plan-001",
};

const tradingSlice = createSlice({
  name: "trading",
  initialState,
  reducers: {
    setInstrument(state, action: PayloadAction<string>) {
      state.instrumentId = action.payload;
      state.redoByInstrument[action.payload] ??= [];
    },
    setTimeframe(state, action: PayloadAction<Timeframe>) { state.timeframe = action.payload; },
    selectTradePlan(state, action: PayloadAction<string | null>) { state.selectedPlanId = action.payload; },
    hydrateDrawings(state, action: PayloadAction<{ instrumentId: string; drawings: ChartDrawing[] }>) {
      state.drawingsByInstrument[action.payload.instrumentId] = action.payload.drawings;
    },
    addDrawing(state, action: PayloadAction<{ instrumentId: string; drawing: ChartDrawing }>) {
      state.drawingsByInstrument[action.payload.instrumentId] ??= [];
      state.drawingsByInstrument[action.payload.instrumentId].push(action.payload.drawing);
      state.redoByInstrument[action.payload.instrumentId] = [];
    },
    removeDrawing(state, action: PayloadAction<{ instrumentId: string; drawingId: string }>) {
      state.drawingsByInstrument[action.payload.instrumentId] = (state.drawingsByInstrument[action.payload.instrumentId] ?? []).filter((drawing) => drawing.id !== action.payload.drawingId);
    },
    undoDrawing(state, action: PayloadAction<string>) {
      const drawings = state.drawingsByInstrument[action.payload] ?? [];
      const removed = drawings.pop();
      if (removed) state.redoByInstrument[action.payload] = [...(state.redoByInstrument[action.payload] ?? []), removed];
    },
    redoDrawing(state, action: PayloadAction<string>) {
      const redo = state.redoByInstrument[action.payload] ?? [];
      const restored = redo.pop();
      if (restored) state.drawingsByInstrument[action.payload] = [...(state.drawingsByInstrument[action.payload] ?? []), restored];
    },
    toggleWatchlist(state, action: PayloadAction<string>) {
      state.watchlistIds = state.watchlistIds.includes(action.payload)
        ? state.watchlistIds.filter((id) => id !== action.payload)
        : [...state.watchlistIds, action.payload];
    },
    hydrateWatchlist(state, action: PayloadAction<string[]>) { state.watchlistIds = action.payload; },
  },
  extraReducers(builder) {
    builder
      .addCase(loadWorkspace.pending, (state, action) => {
        state.loadStatus = "loading";
        state.loadError = null;
        state.activeLoadRequestId = action.meta.requestId;
      })
      .addCase(loadWorkspace.fulfilled, (state, action) => {
        if (state.activeLoadRequestId !== action.meta.requestId) return;
        state.snapshot = action.payload;
        if (!state.selectedPlanId || !action.payload.plans.some((plan) => plan.id === state.selectedPlanId)) state.selectedPlanId = action.payload.plans[0]?.id ?? null;
        state.loadStatus = "ready";
        state.activeLoadRequestId = undefined;
      })
      .addCase(loadWorkspace.rejected, (state, action) => {
        if (state.activeLoadRequestId !== action.meta.requestId) return;
        state.loadStatus = "failed";
        state.loadError = action.error.message ?? null;
        state.activeLoadRequestId = undefined;
      });
  },
});

export const {
  setInstrument, setTimeframe, selectTradePlan, hydrateDrawings, addDrawing, removeDrawing,
  undoDrawing, redoDrawing, toggleWatchlist, hydrateWatchlist,
} = tradingSlice.actions;
export default tradingSlice.reducer;
