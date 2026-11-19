import { ArrowUpRight, Clock3, Info, Wallet } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { formatCurrency } from "@/shared/lib/formatters";
import { marketSummary } from "@/mock/data";

export function MarketOverview() {
  return <section className="workspace-heading">
    <div className="heading-main">
      <div className="eyebrow"><span className="mode-dot" />{tradingCopy.workspace.paperBadge}<span className="eyebrow-separator">·</span><Clock3 size={13} />{tradingCopy.market.quoteUpdated}</div>
      <h1>{tradingCopy.workspace.headline}</h1>
      <p>{tradingCopy.workspace.greeting}</p>
    </div>
    <div className="summary-area">
      <span className="summary-caption">{tradingCopy.workspace.performance}<Info size={13} /></span>
      <div className="summary-cards">
        <div className="summary-card">
          <span>{tradingCopy.workspace.runningPnl}</span><strong className="positive"><ArrowUpRight size={15} />{formatCurrency(marketSummary.runningPnl, 0)}</strong>
        </div>
        <div className="summary-card">
          <span>{tradingCopy.workspace.dayPnl}</span><strong className="positive"><ArrowUpRight size={15} />{formatCurrency(marketSummary.dayPnl, 0)}</strong>
        </div>
        <div className="summary-card buying-power">
          <span>{tradingCopy.workspace.quickActions}</span><strong><Wallet size={15} />{formatCurrency(marketSummary.buyingPower, 0)}</strong>
        </div>
      </div>
    </div>
  </section>;
}
