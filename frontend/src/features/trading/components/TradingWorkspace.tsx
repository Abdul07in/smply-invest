"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, CircleHelp, Search, Star } from "lucide-react";
import { ActivityPanel } from "@/features/trading/components/ActivityPanel";
import { AppNavigation } from "@/features/trading/components/AppNavigation";
import { CandlestickChart } from "@/features/trading/components/CandlestickChart";
import { ExitPositionDialog } from "@/features/trading/components/ExitPositionDialog";
import { MarketOverview } from "@/features/trading/components/MarketOverview";
import { OrderConfirmDialog } from "@/features/trading/components/OrderConfirmDialog";
import { PlanEditorDialog } from "@/features/trading/components/PlanEditorDialog";
import { SavedPlansPanel } from "@/features/trading/components/SavedPlansPanel";
import { TradePanel } from "@/features/trading/components/TradePanel";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { addDrawing as addDrawingAction, cancelPaperOrder, closePaperPosition, deleteTradePlan, hydrateDrawings, hydrateWatchlist, loadWorkspace, processMonitoringPlans, redoDrawing as redoDrawingAction, removeDrawing as removeDrawingAction, saveTradePlan, selectTradePlan, setInstrument, setTimeframe, setTradePlanStatus, startTradePlan, submitPaperOrder, toggleWatchlist, undoDrawing as undoDrawingAction } from "@/features/trading/state/tradingSlice";
import type { ChartDrawing, Instrument, OrderType, PlanStatus, Timeframe, TradePlan } from "@/shared/types/trading";

export function TradingWorkspace({ onLogout }: { onLogout: () => void }) {
  const dispatch = useAppDispatch();
  const { instrumentId, timeframe, snapshot, loadStatus, drawingsByInstrument, redoByInstrument, watchlistIds, selectedPlanId } = useAppSelector((state) => state.trading);
  const drawings = drawingsByInstrument[instrumentId] ?? [];
  const redoStack = redoByInstrument[instrumentId] ?? [];
  const isWatchlisted = watchlistIds.includes(instrumentId);
  const [pendingPlanLevels, setPendingPlanLevels] = useState<Partial<Pick<TradePlan, "entry" | "stop" | "target">>>({});
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TradePlan | undefined>();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderPlan, setOrderPlan] = useState<TradePlan | undefined>();
  const [positionToExitId, setPositionToExitId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [instrumentMenuOpen, setInstrumentMenuOpen] = useState(false);
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const selectedPlanHydrated = useRef(false);

  useEffect(() => { dispatch(loadWorkspace({ instrumentId, timeframe })); }, [dispatch, instrumentId, timeframe]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`simply-markets:drawings:${instrumentId}`);
      dispatch(hydrateDrawings({ instrumentId, drawings: saved ? JSON.parse(saved) as ChartDrawing[] : [] }));
    } catch {
      dispatch(hydrateDrawings({ instrumentId, drawings: [] }));
    }
  }, [dispatch, instrumentId]);
  useEffect(() => {
    try { dispatch(hydrateWatchlist(JSON.parse(window.localStorage.getItem("simply-markets:watchlist") ?? "[]") as string[])); }
    catch { dispatch(hydrateWatchlist([])); }
  }, [dispatch]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 3200); return () => window.clearTimeout(timer); }, [toast]);
  const selectedPlan = snapshot?.plans.find((plan) => plan.id === selectedPlanId);
  useEffect(() => {
    if (!snapshot || selectedPlanHydrated.current) return;
    selectedPlanHydrated.current = true;
    const storedPlanId = window.localStorage.getItem("simply-markets:selected-plan");
    if (storedPlanId && snapshot.plans.some((plan) => plan.id === storedPlanId) && storedPlanId !== selectedPlanId) dispatch(selectTradePlan(storedPlanId));
  }, [dispatch, selectedPlanId, snapshot]);
  useEffect(() => { if (selectedPlanHydrated.current && selectedPlanId) window.localStorage.setItem("simply-markets:selected-plan", selectedPlanId); }, [selectedPlanId]);

  const instrument = snapshot?.instruments.find((item) => item.id === instrumentId) as Instrument | undefined;
  const candles = snapshot?.candles ?? [];
  const activePlan = selectedPlan?.instrumentId === instrumentId ? selectedPlan : undefined;
  const position = snapshot?.positions[0];
  const positionToExit = snapshot?.positions.find((item) => item.id === positionToExitId);
  const filteredInstruments = useMemo(() => (snapshot?.instruments ?? []).filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(instrumentSearch.toLowerCase())), [snapshot, instrumentSearch]);
  useEffect(() => {
    if (activePlan?.status !== "Monitoring") return;
    const timer = window.setInterval(async () => {
      await dispatch(processMonitoringPlans(instrumentId));
      await dispatch(loadWorkspace({ instrumentId, timeframe }));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activePlan?.id, activePlan?.status, dispatch, instrumentId, timeframe]);

  const reload = useCallback(async () => { await dispatch(loadWorkspace({ instrumentId, timeframe })).unwrap(); }, [dispatch, instrumentId, timeframe]);
  const changeInstrument = (id: string) => {
    if (selectedPlan?.status === "Monitoring" && selectedPlan.instrumentId !== id) dispatch(setTradePlanStatus({ planId: selectedPlan.id, status: "Active" }));
    dispatch(setInstrument(id));
    setInstrumentMenuOpen(false);
  };
  const persistDrawings = (instrumentKey: string, next: ChartDrawing[]) => window.localStorage.setItem(`simply-markets:drawings:${instrumentKey}`, JSON.stringify(next));
  const addDrawing = (drawing: ChartDrawing) => { const next = [...drawings, drawing]; dispatch(addDrawingAction({ instrumentId, drawing })); persistDrawings(instrumentId, next); };
  const removeDrawing = (id: string) => { const next = drawings.filter((drawing) => drawing.id !== id); dispatch(removeDrawingAction({ instrumentId, drawingId: id })); persistDrawings(instrumentId, next); };
  const undoDrawing = () => { if (!drawings.length) return; const next = drawings.slice(0, -1); dispatch(undoDrawingAction(instrumentId)); persistDrawings(instrumentId, next); };
  const redoDrawing = () => { const latest = redoStack[redoStack.length - 1]; if (!latest) return; const next = [...drawings, latest]; dispatch(redoDrawingAction(instrumentId)); persistDrawings(instrumentId, next); };

  const openCreatePlan = () => { setEditingPlan(undefined); setPlanDialogOpen(true); };
  const openEditPlan = (plan: TradePlan) => { setEditingPlan(plan); setPlanDialogOpen(true); };
  const savePlan = async (plan: TradePlan, activate: boolean) => {
    const nextPlan = { ...plan, status: activate ? "Active" as const : "Draft" as const };
    await dispatch(saveTradePlan(nextPlan)).unwrap();
    dispatch(selectTradePlan(nextPlan.id));
    await reload();
    setPlanDialogOpen(false);
    setPendingPlanLevels({});
    setToast(activate ? tradingCopy.plan.activated : tradingCopy.plan.saved);
  };

  const selectPlan = (plan: TradePlan) => {
    if (selectedPlan?.id !== plan.id && selectedPlan?.status === "Monitoring") dispatch(setTradePlanStatus({ planId: selectedPlan.id, status: "Active" }));
    dispatch(selectTradePlan(plan.id));
    if (plan.instrumentId !== instrumentId) dispatch(setInstrument(plan.instrumentId));
  };

  const executePlan = async (plan: TradePlan) => {
    selectPlan(plan);
    const updated = await dispatch(startTradePlan(plan.id)).unwrap();
    await reload();
    setToast(updated.status === "Triggered" ? updated.executionMessage ?? tradingCopy.workspace.signalHit : tradingCopy.workspace.planStarted);
  };

  const updatePlanStatus = async (plan: TradePlan, status: PlanStatus) => {
    await dispatch(setTradePlanStatus({ planId: plan.id, status })).unwrap();
    await reload();
    setToast(status === "Paused" ? tradingCopy.workspace.planPaused : tradingCopy.workspace.planResumed);
  };

  const removePlan = async (plan: TradePlan) => {
    if (!window.confirm(tradingCopy.workspace.confirmDeletePlan)) return;
    await dispatch(deleteTradePlan(plan.id)).unwrap();
    dispatch(selectTradePlan(snapshot?.plans.find((item) => item.id !== plan.id)?.id ?? null));
    await reload();
    setToast(tradingCopy.workspace.planDeleted);
  };

  const openManualOrder = (plan?: TradePlan) => { if (plan) selectPlan(plan); setOrderPlan(plan); setOrderDialogOpen(true); };

  const setPlanLevelFromChart = async (kind: "entry" | "stop" | "target", price: number) => {
    if (activePlan) {
      await dispatch(saveTradePlan({ ...activePlan, [kind]: price })).unwrap();
      await reload();
      return;
    }
    setPendingPlanLevels((current) => ({ ...current, [kind]: price }));
  };

  const submitOrder = async (side: "Buy" | "Sell", quantity: number, price: number, orderType: OrderType, planId?: string) => {
    if (!instrument) return;
    await dispatch(submitPaperOrder({ instrument: instrument.symbol, action: side, quantity, price, orderType, planId })).unwrap();
    await reload();
    setOrderDialogOpen(false);
    setOrderPlan(undefined);
    setToast(tradingCopy.order.submitted);
  };

  const cancelOrder = async (id: string) => { await dispatch(cancelPaperOrder(id)).unwrap(); await reload(); setToast(tradingCopy.activity.orderCancelled); };
  const closePosition = async (id: string) => { await dispatch(closePaperPosition(id)).unwrap(); await reload(); setToast(tradingCopy.position.exited); };
  const requestExit = (id: string) => setPositionToExitId(id);
  const confirmExit = async (id: string) => { await closePosition(id); setPositionToExitId(null); };

  if (loadStatus === "failed") return <main className="app-shell min-h-dvh w-full"><div className="loading-state">{tradingCopy.common.workspaceFailed}</div></main>;
  if (!snapshot || !instrument || loadStatus === "loading") return <main className="app-shell min-h-dvh w-full"><div className="loading-state">{tradingCopy.common.loading}</div></main>;

  return <main className="app-shell min-h-dvh w-full" id="workspace">
    <AppNavigation onSearch={() => setInstrumentMenuOpen(true)} onUnavailableSection={() => setToast(tradingCopy.app.sectionNotInDemo)} onLogout={onLogout} />
    <div className="workspace-body">
      <MarketOverview />
      <div className="instrument-selector-row">
        <div className="instrument-select-wrap">
          <button className="instrument-select" onClick={() => setInstrumentMenuOpen((value) => !value)}><span className="instrument-select-icon"><Search size={15} /></span><strong>{instrument.symbol}</strong><ChevronDown size={14} /></button>
          {instrumentMenuOpen && <div className="instrument-popover"><div className="instrument-search"><Search size={14} /><input autoFocus value={instrumentSearch} onChange={(event) => setInstrumentSearch(event.target.value)} placeholder={tradingCopy.common.search} /></div>{filteredInstruments.map((item) => <button key={item.id} onClick={() => changeInstrument(item.id)} className={item.id === instrumentId ? "selected" : ""}><span><strong>{item.symbol}</strong><small>{item.name} · {item.exchange}</small></span><span className={item.change >= 0 ? "positive" : "negative"}>{formatCurrency(item.lastPrice)}</span></button>)}</div>}
        </div>
        <div className="instrument-row-price"><strong>{formatCurrency(instrument.lastPrice)}</strong><span className="positive"><ChevronUp size={13} />{formatNumber(instrument.change)} ({formatNumber(instrument.changePercent)}%)</span></div>
        <span className="chart-data-label"><i className="fresh-dot" />{tradingCopy.market.dataFresh}</span>
        <button className="watchlist-add" onClick={() => { const next = isWatchlisted ? watchlistIds.filter((id) => id !== instrumentId) : [...watchlistIds, instrumentId]; dispatch(toggleWatchlist(instrumentId)); window.localStorage.setItem("simply-markets:watchlist", JSON.stringify(next)); setToast(isWatchlisted ? tradingCopy.common.removedFromWatchlist : tradingCopy.common.addedToWatchlist); }} aria-label={isWatchlisted ? tradingCopy.common.removeFromWatchlist : tradingCopy.common.addToWatchlist}><Star size={14} fill={isWatchlisted ? "currentColor" : "none"} />{isWatchlisted ? tradingCopy.common.removeFromWatchlist : tradingCopy.common.addToWatchlist}</button>
      </div>
      <div className="workspace-grid">
        <div className="main-column">
          <CandlestickChart instrument={instrument} candles={candles} timeframe={timeframe} onTimeframeChange={(next) => dispatch(setTimeframe(next))} plan={activePlan} drawings={drawings} onAddDrawing={addDrawing} onUndo={undoDrawing} onRedo={redoDrawing} onRemoveDrawing={removeDrawing} onSetPlanLevel={setPlanLevelFromChart} canRedo={redoStack.length > 0} />
          <ActivityPanel orders={snapshot.orders} positions={snapshot.positions} alerts={snapshot.alerts} onCancelOrder={cancelOrder} onExitPosition={requestExit} />
        </div>
        <TradePanel instrument={instrument} plan={activePlan} position={position} onCreatePlan={openCreatePlan} onEditPlan={openEditPlan} onExecute={() => activePlan && executePlan(activePlan)} onPlaceManualOrder={() => openManualOrder()} onExit={() => position && requestExit(position.id)} />
      </div>
      <SavedPlansPanel plans={snapshot.plans} orders={snapshot.orders} selectedPlanId={selectedPlanId} onSelect={selectPlan} onEdit={(plan) => { selectPlan(plan); openEditPlan(plan); }} onDelete={removePlan} onStatusChange={updatePlanStatus} onExecute={executePlan} onPlaceOrder={openManualOrder} />
      <footer className="page-footer"><span>{tradingCopy.app.tagline}</span><span><i className="fresh-dot" />{tradingCopy.order.paperMode}<span className="footer-dot">·</span>{tradingCopy.common.exchangeTime}</span><button aria-label={tradingCopy.common.settings}><CircleHelp size={14} /></button></footer>
    </div>
    <PlanEditorDialog open={planDialogOpen} instrument={instrument} plan={editingPlan} existingPlans={snapshot.plans} seedLevels={pendingPlanLevels} onClose={() => setPlanDialogOpen(false)} onSave={savePlan} />
    <OrderConfirmDialog open={orderDialogOpen} instrument={instrument} initialQuantity={orderPlan?.quantity ?? activePlan?.quantity ?? 50} plan={orderPlan} onClose={() => { setOrderDialogOpen(false); setOrderPlan(undefined); }} onSubmit={submitOrder} />
    <ExitPositionDialog position={positionToExit} onCancel={() => setPositionToExitId(null)} onConfirm={confirmExit} />
    {toast && <div className="toast-message"><span className="toast-check"><ChevronUp size={13} /></span>{toast}<button onClick={() => setToast("")} aria-label={tradingCopy.common.dismiss}>×</button></div>}
  </main>;
}
