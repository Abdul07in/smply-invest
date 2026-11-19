"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ShieldCheck, X } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency } from "@/shared/lib/formatters";
import type { Instrument, OrderType, TradePlan } from "@/shared/types/trading";

interface Props { open: boolean; instrument: Instrument; initialQuantity: number; plan?: TradePlan; onClose: () => void; onSubmit: (side: "Buy" | "Sell", quantity: number, price: number, orderType: OrderType, planId?: string) => void; }

export function OrderConfirmDialog({ open, instrument, initialQuantity, plan, onClose, onSubmit }: Props) {
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [price, setPrice] = useState(instrument.lastPrice);
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  useEffect(() => { if (open) { setSide(plan ? plan.side === "Long" ? "Buy" : "Sell" : "Buy"); setQuantity(plan?.quantity ?? initialQuantity); setPrice(plan?.entry ?? instrument.lastPrice); setOrderType(plan?.orderType ?? "Market"); } }, [open, initialQuantity, instrument.lastPrice, plan]);
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="dialog order-dialog" role="dialog" aria-modal="true" aria-labelledby="order-title">
      <header className="dialog-header"><div><span className="dialog-kicker">{tradingCopy.order.paperMode}</span><h2 id="order-title">{tradingCopy.order.title}</h2><p>{tradingCopy.order.subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label={tradingCopy.common.close}><X size={18} /></button></header>
      <div className="dialog-content">
        <div className="order-instrument"><div className="instrument-avatar"><ShieldCheck size={17} /></div><div><strong>{instrument.symbol}</strong><span>{instrument.name} · {instrument.exchange}</span></div><strong>{formatCurrency(instrument.lastPrice)}</strong></div>
        <div className="form-row"><fieldset className="direction-field"><legend>{tradingCopy.order.side}</legend><div className="segmented-control"><button className={side === "Buy" ? "selected long" : ""} onClick={() => setSide("Buy")}><ArrowUp size={13} />{tradingCopy.activity.buy}</button><button className={side === "Sell" ? "selected short" : ""} onClick={() => setSide("Sell")}><ArrowDown size={13} />{tradingCopy.activity.sell}</button></div></fieldset><label className="field-label">{tradingCopy.order.orderType}<select value={orderType} onChange={(event) => setOrderType(event.target.value as "Market" | "Limit")}><option>{tradingCopy.order.market}</option><option>{tradingCopy.order.limit}</option></select></label></div>
        <div className="form-row"><label className="field-label">{tradingCopy.order.quantity}<input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></label>{orderType === "Limit" && <label className="field-label">{tradingCopy.order.price}<input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>}</div>
        <div className="order-review-row"><span>{tradingCopy.order.mode}</span><strong><i className="mode-dot" />{tradingCopy.order.paperMode}</strong></div>
        <div className="simulator-warning"><ShieldCheck size={16} /><span>{tradingCopy.order.info}</span></div>
      </div>
      <footer className="dialog-footer"><button className="button-quiet" onClick={onClose}>{tradingCopy.order.cancel}</button><button className="button-primary" onClick={() => onSubmit(side, quantity, orderType === "Market" ? instrument.lastPrice : price, orderType, plan?.id)}>{tradingCopy.order.confirm}</button></footer>
    </section>
  </div>;
}
