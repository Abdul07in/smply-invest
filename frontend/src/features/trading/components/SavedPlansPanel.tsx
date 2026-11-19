import { Check, Play, Pause, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import type { PaperOrder, PlanStatus, TradePlan } from "@/shared/types/trading";

interface Props {
  plans: TradePlan[];
  orders: PaperOrder[];
  selectedPlanId: string | null;
  onSelect: (plan: TradePlan) => void;
  onEdit: (plan: TradePlan) => void;
  onDelete: (plan: TradePlan) => void;
  onStatusChange: (plan: TradePlan, status: PlanStatus) => void;
  onExecute: (plan: TradePlan) => void;
  onPlaceOrder: (plan: TradePlan) => void;
}

export function SavedPlansPanel({ plans, orders, selectedPlanId, onSelect, onEdit, onDelete, onStatusChange, onExecute, onPlaceOrder }: Props) {
  const completedCount = orders.filter((order) => order.status === "Filled" || order.status === "Failed").length;
  const realizedPnl = orders.reduce((total, order) => total + (order.realizedPnl ?? 0), 0);
  return <section className="saved-plans-panel">
    <header className="saved-plans-heading"><div><span className="panel-eyebrow">{tradingCopy.workspace.planPerformance}</span><h2>{tradingCopy.workspace.savedPlans}</h2><p>{tradingCopy.workspace.plansDescription}</p></div><div className="report-summary"><ReportMetric label={tradingCopy.workspace.executedTrades} value={String(completedCount)} /><ReportMetric label={tradingCopy.workspace.planPnl} value={formatCurrency(realizedPnl, 0)} positive={realizedPnl >= 0} /></div></header>
    {plans.length ? <div className="saved-plan-list">{plans.map((plan) => {
      const isSelected = plan.id === selectedPlanId;
      const planOrders = orders.filter((order) => order.planId === plan.id);
      const succeeded = planOrders.filter((order) => order.status === "Filled").length;
      const failed = planOrders.filter((order) => order.status === "Failed").length;
      const pnl = planOrders.reduce((total, order) => total + (order.realizedPnl ?? 0), 0);
      const isRunning = plan.status === "Monitoring";
      return <article key={plan.id} className={`saved-plan-card ${isSelected ? "selected" : ""}`}>
        <div className="saved-plan-card-top"><button className="saved-plan-select" onClick={() => onSelect(plan)} aria-pressed={isSelected}><span className="saved-plan-check">{isSelected && <Check size={13} />}</span><span><strong>{plan.name}</strong><small>{plan.instrumentId === "nifty-50" ? tradingCopy.workspace.mainIndex : plan.instrumentId.toUpperCase()} · {plan.timeframe}</small></span></button><span className={`plan-status status-${plan.status.toLowerCase()}`}><i />{tradingCopy.planStatus[plan.status.toLowerCase() as keyof typeof tradingCopy.planStatus]}</span></div>
        <p className="saved-plan-condition"><span className={`saved-side ${plan.side === "Long" ? "buy" : "sell"}`}>{plan.side === "Long" ? tradingCopy.plan.buy : tradingCopy.plan.sell}</span>{plan.timeframe} {tradingCopy.trigger[plan.triggerOperator]} {formatCurrency(plan.triggerPrice, 0)}<span className="saved-order-type">{plan.orderType}</span></p>
        <div className="saved-plan-levels"><span>{tradingCopy.plan.quantity}<strong>{plan.quantity}</strong></span><span>{tradingCopy.plan.stop}<strong>{formatCurrency(plan.stop)}</strong></span><span>{tradingCopy.plan.target}<strong>{formatCurrency(plan.target)}</strong></span><span>{tradingCopy.plan.orderType}<strong>{plan.orderType}</strong></span><span>{tradingCopy.workspace.autoExecution}<strong>{plan.autoExecute ? tradingCopy.workspace.yes : tradingCopy.workspace.no}</strong></span></div>
        <div className="saved-plan-report"><span>{tradingCopy.workspace.successfulOrders}<strong>{succeeded}</strong></span><span>{tradingCopy.workspace.failedOrders}<strong>{failed}</strong></span><span>{tradingCopy.workspace.planPnl}<strong className={pnl >= 0 ? "positive" : "negative"}>{formatCurrency(pnl, 0)}</strong></span></div>
        {plan.executionMessage && <p className="saved-plan-message">{plan.executionMessage}</p>}
        <footer className="saved-plan-actions"><button className="button-primary" onClick={() => onExecute(plan)} disabled={isRunning || plan.status === "Draft" || plan.status === "Failed" || plan.status === "Triggered"}><Play size={14} />{isRunning ? tradingCopy.workspace.monitoring : tradingCopy.workspace.executePlan}</button>{plan.status === "Triggered" && !plan.autoExecute && <button className="button-secondary" onClick={() => onPlaceOrder(plan)}>{tradingCopy.workspace.placePlanOrder}</button>}<button className="button-secondary" onClick={() => onEdit(plan)} aria-label={`${tradingCopy.plan.edit}: ${plan.name}`}><Pencil size={14} />{tradingCopy.plan.edit}</button><button className="button-quiet" onClick={() => onStatusChange(plan, plan.status === "Paused" || plan.status === "Draft" ? "Active" : "Paused")} aria-label={plan.status === "Paused" ? tradingCopy.workspace.planResumed : tradingCopy.workspace.planPaused}>{plan.status === "Monitoring" ? <Pause size={14} /> : <span>{plan.status === "Paused" ? tradingCopy.workspace.planResumed : tradingCopy.workspace.planPaused}</span>}</button><button className="button-quiet danger-quiet" onClick={() => onDelete(plan)} aria-label={`${tradingCopy.workspace.deletePlan}: ${plan.name}`}><Trash2 size={14} /></button>{isRunning && <span className="saved-monitor-note"><TrendingUp size={13} />{tradingCopy.workspace.signalStatus}</span>}</footer>
      </article>;
    })}</div> : <div className="empty-state saved-plans-empty">{tradingCopy.workspace.noSavedPlans}</div>}
  </section>;
}

function ReportMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const Icon = positive === undefined ? null : positive ? TrendingUp : TrendingDown;
  return <div className="report-metric"><span>{label}</span><strong className={positive ? "positive" : ""}>{Icon && <Icon size={14} />}{value}</strong></div>;
}
