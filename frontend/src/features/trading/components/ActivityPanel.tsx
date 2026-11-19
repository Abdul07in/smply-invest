"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, BellRing, Check, Clock3, Ellipsis, ExternalLink, ListFilter } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import type { ActivityTab, AlertItem, PaperOrder, Position } from "@/shared/types/trading";

interface Props { orders: PaperOrder[]; positions: Position[]; alerts: AlertItem[]; onCancelOrder: (id: string) => void; onExitPosition: (id: string) => void; }
const tabs: Array<{ id: ActivityTab; label: string }> = [
  { id: "orders", label: tradingCopy.activity.orders },
  { id: "positions", label: tradingCopy.activity.positions },
  { id: "history", label: tradingCopy.activity.history },
  { id: "alerts", label: tradingCopy.activity.alerts },
];

export function ActivityPanel({ orders, positions, alerts, onCancelOrder, onExitPosition }: Props) {
  const [activeTab, setActiveTab] = useState<ActivityTab>("orders");
  return <section className="activity-card">
    <header className="activity-header"><div className="activity-tabs">{tabs.map((tab) => { const count = tab.id === "orders" ? orders.filter((order) => order.status === "Working").length : tab.id === "positions" ? positions.length : tab.id === "alerts" ? alerts.filter((alert) => !alert.read).length : 0; return <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}{count > 0 && <span className="tab-count">{count}</span>}</button>; })}</div><div className="activity-tools"><span className="activity-live"><i />{tradingCopy.order.paperMode}</span><button className="icon-button compact" aria-label={tradingCopy.common.settings}><ListFilter size={15} /></button><button className="icon-button compact" aria-label={tradingCopy.common.settings}><Ellipsis size={16} /></button></div></header>
    {activeTab === "orders" && <OrderTable orders={orders.filter((order) => order.status === "Working")} onCancel={onCancelOrder} />}
    {activeTab === "positions" && <PositionTable positions={positions} onExit={onExitPosition} />}
    {activeTab === "history" && <HistoryTable orders={orders} />}
    {activeTab === "alerts" && <AlertList alerts={alerts} />}
    <footer className="activity-footer"><span><Clock3 size={13} />{tradingCopy.market.quoteUpdated}</span><button>{activeTab === "alerts" ? tradingCopy.activity.alerts : tradingCopy.activity.title}<ExternalLink size={12} /></button></footer>
  </section>;
}

function OrderTable({ orders, onCancel }: { orders: PaperOrder[]; onCancel: (id: string) => void }) {
  return <div className="table-scroll"><table className="order-table"><thead><tr><th>{tradingCopy.activity.time}</th><th>{tradingCopy.activity.instrument}</th><th>{tradingCopy.activity.action}</th><th>{tradingCopy.activity.quantity}</th><th>{tradingCopy.activity.price}</th><th>{tradingCopy.activity.status}</th><th>{tradingCopy.activity.validity}</th><th>{tradingCopy.activity.actions}</th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td className="muted-cell" data-label={tradingCopy.activity.time}>{order.time}</td><td data-label={tradingCopy.activity.instrument}><strong>{order.instrument}</strong></td><td data-label={tradingCopy.activity.action}><span className={`order-side ${order.action.toLowerCase()}`}>{order.action === "Buy" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{order.action === "Buy" ? tradingCopy.activity.buy : tradingCopy.activity.sell}</span></td><td data-label={tradingCopy.activity.quantity}>{order.quantity}</td><td data-label={tradingCopy.activity.price}>{formatCurrency(order.price)}</td><td data-label={tradingCopy.activity.status}><span className={`order-status ${order.status.toLowerCase()}`}><i />{tradingCopy.activity[order.status.toLowerCase() as "working" | "filled" | "cancelled"]}</span></td><td data-label={tradingCopy.activity.validity}>{order.validity}</td><td data-label={tradingCopy.activity.actions}>{order.status === "Working" ? <button className="table-action" onClick={() => onCancel(order.id)}>{tradingCopy.activity.cancel}</button> : <span className="muted-cell">{tradingCopy.common.emptyValue}</span>}</td></tr>) : <EmptyRow />}</tbody></table></div>;
}

function PositionTable({ positions, onExit }: { positions: Position[]; onExit: (id: string) => void }) {
  return <div className="table-scroll"><table><thead><tr><th>{tradingCopy.activity.instrument}</th><th>{tradingCopy.position.quantity}</th><th>{tradingCopy.position.average}</th><th>{tradingCopy.position.ltp}</th><th>{tradingCopy.position.pnl}</th><th>{tradingCopy.position.returns}</th><th>{tradingCopy.activity.actions}</th></tr></thead><tbody>{positions.length ? positions.map((position) => <tr key={position.id}><td><strong>{position.instrument}</strong><small className="table-secondary">{position.detail}</small></td><td>{position.quantity}</td><td>{formatCurrency(position.entryPrice)}</td><td>{formatCurrency(position.currentPrice)}</td><td className={position.pnl >= 0 ? "positive" : "negative"}>{formatCurrency(position.pnl)}</td><td className={position.returnPercent >= 0 ? "positive" : "negative"}>{formatNumber(position.returnPercent)}%</td><td><button className="table-action" onClick={() => onExit(position.id)}>{tradingCopy.position.exit}</button></td></tr>) : <EmptyRow />}</tbody></table></div>;
}

function HistoryTable({ orders }: { orders: PaperOrder[] }) {
  return <div className="table-scroll"><table><thead><tr><th>{tradingCopy.activity.time}</th><th>{tradingCopy.activity.instrument}</th><th>{tradingCopy.activity.action}</th><th>{tradingCopy.activity.quantity}</th><th>{tradingCopy.activity.price}</th><th>{tradingCopy.activity.status}</th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td className="muted-cell">{order.time}</td><td><strong>{order.instrument}</strong></td><td>{order.action}</td><td>{order.quantity}</td><td>{formatCurrency(order.price)}</td><td><span className={`order-status ${order.status.toLowerCase()}`}><i />{tradingCopy.activity[order.status.toLowerCase() as "working" | "filled" | "cancelled" | "failed"]}{order.failureReason && <small className="table-secondary">{order.failureReason}</small>}</span></td></tr>) : <EmptyRow />}</tbody></table></div>;
}

function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return <div className="alert-list">{alerts.length ? alerts.map((alert) => <div className={`alert-row ${alert.read ? "read" : ""}`} key={alert.id}><span className="alert-icon"><BellRing size={15} /></span><div><strong>{alert.title}</strong><span>{alert.detail}</span></div><time>{alert.time}</time><button className="icon-button compact" aria-label={tradingCopy.common.close}><Check size={14} /></button></div>) : <div className="empty-state">{tradingCopy.activity.empty}</div>}</div>;
}

function EmptyRow() { return <tr><td colSpan={8} className="empty-table">{tradingCopy.activity.empty}</td></tr>; }
