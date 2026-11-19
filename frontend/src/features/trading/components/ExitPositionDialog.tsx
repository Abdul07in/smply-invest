"use client";

import { X } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency } from "@/shared/lib/formatters";
import type { Position } from "@/shared/types/trading";

interface Props { position?: Position; onCancel: () => void; onConfirm: (positionId: string) => void; }

export function ExitPositionDialog({ position, onCancel, onConfirm }: Props) {
  if (!position) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="dialog order-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title">
      <header className="dialog-header"><div><span className="dialog-kicker">{tradingCopy.order.paperMode}</span><h2 id="exit-title">{tradingCopy.position.exitTitle}</h2><p>{tradingCopy.position.exitBody}</p></div><button className="icon-button" onClick={onCancel} aria-label={tradingCopy.common.close}><X size={18} /></button></header>
      <div className="dialog-content"><div className="order-instrument"><div><strong>{position.instrument}</strong><span>{position.quantity} · {formatCurrency(position.currentPrice)}</span></div><strong>{tradingCopy.position.exit}</strong></div><div className="simulator-warning">{tradingCopy.order.info}</div></div>
      <footer className="dialog-footer"><button className="button-quiet" onClick={onCancel}>{tradingCopy.order.cancel}</button><button className="button-primary" onClick={() => onConfirm(position.id)}>{tradingCopy.position.confirmExit}</button></footer>
    </section>
  </div>;
}
