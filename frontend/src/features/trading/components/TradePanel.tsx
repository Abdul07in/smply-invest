import { ArrowDownRight, ArrowUpRight, ArrowUpRightFromSquare, ChevronRight, CircleHelp, MoreHorizontal, Pencil, Plus, ShieldCheck, SlidersHorizontal, TrendingUp } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { getPlanMetrics } from "@/shared/lib/planMath";
import type { Instrument, Position, TradePlan } from "@/shared/types/trading";

interface Props {
  instrument: Instrument;
  plan?: TradePlan;
  position?: Position;
  onCreatePlan: () => void;
  onEditPlan: (plan: TradePlan) => void;
  onExecute: () => void;
  onPlaceManualOrder: () => void;
  onExit: () => void;
}

export function TradePanel({ instrument, plan, position, onCreatePlan, onEditPlan, onExecute, onPlaceManualOrder, onExit }: Props) {
  const metrics = plan ? getPlanMetrics(plan) : null;
  return <aside className="trade-panel">
    <div className="panel-section account-section">
      <div className="panel-section-header"><div><span className="panel-eyebrow">{tradingCopy.workspace.quickActions}</span><h2>{tradingCopy.workspace.paperBadge}</h2></div><button className="icon-button compact"><MoreHorizontal size={17} /></button></div>
      <div className="action-buttons"><button className="primary-action" onClick={onExecute} disabled={!plan || plan.status === "Monitoring" || plan.status === "Triggered" || plan.status === "Failed"}><ArrowUpRight size={15} />{tradingCopy.workspace.executePlan}</button><button className="secondary-action" onClick={onCreatePlan}><Plus size={15} />{tradingCopy.workspace.planButton}</button></div>
      <button className="manual-order-link" onClick={onPlaceManualOrder}>{tradingCopy.workspace.manualOrder}</button>
      <div className="execution-note"><ShieldCheck size={13} />{tradingCopy.order.info}</div>
    </div>
    <div className="panel-section position-section">
      <div className="panel-section-header"><div><span className="panel-eyebrow">{tradingCopy.position.title}</span><h2>{position?.instrument ?? tradingCopy.workspace.noPosition}</h2></div>{position && <span className="side-pill long-pill">{position.side === "Long" ? tradingCopy.plan.long : tradingCopy.plan.short}</span>}</div>
      {position ? <>
        <span className="position-detail">{position.detail}</span>
        <div className="position-stats">
          <Metric label={tradingCopy.position.quantity} value={String(position.quantity)} />
          <Metric label={tradingCopy.position.average} value={formatCurrency(position.entryPrice)} />
          <Metric label={tradingCopy.position.ltp} value={formatCurrency(position.currentPrice)} />
        </div>
        <div className="position-pnl-row"><div><span>{tradingCopy.position.pnl}</span><strong className={position.pnl >= 0 ? "positive" : "negative"}>{formatCurrency(position.pnl, 0)}</strong></div><div className="return-chip"><TrendingUp size={13} />{formatNumber(position.returnPercent)}%</div></div>
        <button className="exit-position-button" onClick={onExit}><ArrowDownRight size={14} />{tradingCopy.position.exit}</button>
      </> : <div className="empty-panel"><p>{tradingCopy.workspace.noPosition}</p></div>}
    </div>
    <div className="panel-section plan-section">
      <div className="panel-section-header"><div><span className="panel-eyebrow">{tradingCopy.plan.title}</span><h2>{plan?.name ?? tradingCopy.workspace.noPlan}</h2></div>{plan && <button className="text-button" onClick={() => onEditPlan(plan)}><Pencil size={13} />{tradingCopy.plan.edit}</button>}</div>
      {plan ? <>
        <div className="plan-summary-top"><span className={`plan-status status-${plan.status.toLowerCase()}`}><i />{tradingCopy.planStatus[plan.status.toLowerCase() as keyof typeof tradingCopy.planStatus]}</span><span className="instrument-tiny">{instrument.symbol} · {plan.side === "Long" ? tradingCopy.plan.long : tradingCopy.plan.short}</span></div>
        <p className="plan-note">{plan.executionMessage ?? `${tradingCopy.trigger[plan.triggerOperator]} ${formatCurrency(plan.triggerPrice, 0)} · ${plan.timeframe}. ${plan.note}`}</p>
        <div className="plan-levels">
          <PlanLevel label={tradingCopy.plan.entry} price={plan.entry} tone="entry" />
          <PlanLevel label={tradingCopy.plan.stop} price={plan.stop} tone="stop" />
          <PlanLevel label={tradingCopy.plan.target} price={plan.target} tone="target" />
        </div>
        <div className="risk-reward"><div><span>{tradingCopy.plan.risk}</span><strong>{formatCurrency(metrics?.risk ?? 0, 0)}</strong></div><div><span>{tradingCopy.plan.ratio}</span><strong>{formatNumber(metrics?.ratio ?? 0)} : 1</strong></div><div className="reward-metric"><span>{tradingCopy.plan.reward}</span><strong>{formatCurrency(metrics?.reward ?? 0, 0)}</strong></div></div>
      </> : <button className="create-plan-card" onClick={onCreatePlan}><span className="plus-circle"><Plus size={14} /></span><span>{tradingCopy.plan.create}<small>{tradingCopy.plan.subtitle}</small></span><ChevronRight size={15} /></button>}
      {plan && <div className="plan-card-foot"><span><CircleHelp size={13} />{tradingCopy.plan.levelsHint}</span><button aria-label={tradingCopy.plan.edit} onClick={() => onEditPlan(plan)}><ArrowUpRightFromSquare size={14} /></button></div>}
    </div>
    <div className="panel-section watchlist-mini">
      <div className="panel-section-header"><div><span className="panel-eyebrow">{tradingCopy.chart.title}</span><h2>{instrument.exchange} · {instrument.currency}</h2></div><button className="icon-button compact"><SlidersHorizontal size={15} /></button></div>
      <div className="watchlist-row"><span className="watchlist-symbol">{instrument.symbol}</span><strong>{formatCurrency(instrument.lastPrice)}</strong><span className="positive">+{formatNumber(instrument.changePercent)}%</span></div>
    </div>
  </aside>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="position-metric"><span>{label}</span><strong>{value}</strong></div>; }
function PlanLevel({ label, price, tone }: { label: string; price: number; tone: string }) { return <div className={`plan-level ${tone}`}><span><i />{label}</span><strong>{formatCurrency(price)}</strong></div>; }
