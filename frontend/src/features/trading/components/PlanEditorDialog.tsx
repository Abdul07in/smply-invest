"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { timeframeOptions, tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { getPlanMetrics } from "@/shared/lib/planMath";
import type { Instrument, OrderType, Timeframe, TradePlan, TriggerOperator } from "@/shared/types/trading";

interface Props { open: boolean; instrument: Instrument; plan?: TradePlan; existingPlans: TradePlan[]; seedLevels?: Partial<Pick<TradePlan, "entry" | "stop" | "target">>; onClose: () => void; onSave: (plan: TradePlan, activate: boolean) => void; }

export function PlanEditorDialog({ open, instrument, plan, existingPlans, seedLevels, onClose, onSave }: Props) {
  const [form, setForm] = useState<TradePlan>(plan ?? createEmptyPlan(instrument));
  useEffect(() => { if (open) setForm(plan ? { ...plan, ...seedLevels } : { ...createEmptyPlan(instrument), ...seedLevels }); }, [open, plan, instrument, seedLevels]);
  if (!open) return null;
  const metrics = getPlanMetrics(form);
  const duplicateName = existingPlans.some((item) => item.id !== form.id && item.name.trim().toLowerCase() === form.name.trim().toLowerCase());
  const valid = metrics.valid && form.triggerPrice > 0 && form.name.trim().length > 0 && !duplicateName;
  const set = <K extends keyof TradePlan>(key: K, value: TradePlan[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (activate: boolean) => onSave({ ...form, id: form.id || `plan-${Date.now()}` }, activate);

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="dialog plan-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-title">
      <header className="dialog-header"><div><span className="dialog-kicker">{tradingCopy.plan.title}</span><h2 id="plan-title">{plan ? tradingCopy.plan.edit : tradingCopy.plan.create}</h2><p>{tradingCopy.plan.subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label={tradingCopy.common.close}><X size={18} /></button></header>
      <div className="dialog-content">
        <label className="field-label">{tradingCopy.plan.name}<input value={form.name} placeholder={tradingCopy.plan.namePlaceholder} onChange={(event) => set("name", event.target.value)} /></label>
        <div className="form-row"><label className="field-label">{tradingCopy.plan.instrument}<input value={instrument.symbol} readOnly /></label><fieldset className="direction-field"><legend>{tradingCopy.plan.direction}</legend><div className="segmented-control"><button type="button" className={form.side === "Long" ? "selected long" : ""} onClick={() => set("side", "Long")}><ArrowUp size={13} />{tradingCopy.plan.buy}</button><button type="button" className={form.side === "Short" ? "selected short" : ""} onClick={() => set("side", "Short")}><ArrowDown size={13} />{tradingCopy.plan.sell}</button></div></fieldset></div>
        <div className="form-row"><label className="field-label">{tradingCopy.plan.condition}<select value={form.triggerOperator} onChange={(event) => set("triggerOperator", event.target.value as TriggerOperator)}><option value="above">{tradingCopy.plan.above}</option><option value="below">{tradingCopy.plan.below}</option></select></label><NumberField label={tradingCopy.plan.triggerPrice} value={form.triggerPrice} onChange={(value) => set("triggerPrice", value)} /></div>
        <div className="form-row"><label className="field-label">{tradingCopy.plan.timeframe}<select value={form.timeframe} onChange={(event) => set("timeframe", event.target.value as Timeframe)}>{timeframeOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="field-label">{tradingCopy.plan.orderType}<select value={form.orderType} onChange={(event) => set("orderType", event.target.value as OrderType)}><option value="Market">{tradingCopy.plan.market}</option><option value="Limit">{tradingCopy.plan.limit}</option></select></label></div>
        <div className="form-row three-fields">
          <NumberField label={tradingCopy.plan.entry} value={form.entry} onChange={(value) => set("entry", value)} />
          <NumberField label={tradingCopy.plan.stop} value={form.stop} onChange={(value) => set("stop", value)} />
          <NumberField label={tradingCopy.plan.target} value={form.target} onChange={(value) => set("target", value)} />
        </div>
        <div className="form-row"><NumberField label={tradingCopy.plan.quantity} value={form.quantity} onChange={(value) => set("quantity", value)} step={1} /><div className="metric-preview"><span>{tradingCopy.plan.risk}</span><strong>{formatCurrency(metrics.risk, 0)}</strong><span>{tradingCopy.plan.reward} · {formatCurrency(metrics.reward, 0)} · {formatNumber(metrics.ratio)} : 1</span></div></div>
        <label className="field-label">{tradingCopy.plan.notes}<textarea rows={3} value={form.note} placeholder={tradingCopy.plan.notesPlaceholder} onChange={(event) => set("note", event.target.value)} /></label>
        <label className="auto-execution-option"><input type="checkbox" checked={form.autoExecute} onChange={(event) => set("autoExecute", event.target.checked)} /><span>{tradingCopy.workspace.autoExecution}</span></label>
        {!valid && <div className="form-error">{duplicateName ? tradingCopy.plan.duplicateName : tradingCopy.plan.invalid}</div>}
        <div className="levels-help">{tradingCopy.plan.levelsHint}</div>
      </div>
      <footer className="dialog-footer"><button className="button-quiet" onClick={onClose}>{tradingCopy.plan.cancel}</button><div><button className="button-secondary" onClick={() => submit(false)} disabled={!valid}>{tradingCopy.plan.saveDraft}</button><button className="button-primary" onClick={() => submit(true)} disabled={!valid}>{tradingCopy.plan.activate}</button></div></footer>
    </section>
  </div>;
}

function createEmptyPlan(instrument: Instrument): TradePlan {
  return { id: "", name: "", instrumentId: instrument.id, side: "Long", status: "Draft", triggerOperator: "above", triggerPrice: instrument.lastPrice, timeframe: "15m", orderType: "Market", autoExecute: true, entry: instrument.lastPrice, stop: instrument.lastPrice - 100, target: instrument.lastPrice + 180, quantity: 50, note: "" };
}

function NumberField({ label, value, onChange, step = 0.05 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return <label className="field-label">{label}<input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
