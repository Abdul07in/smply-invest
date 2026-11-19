"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Crosshair, Eraser, Expand, LineChart, LocateFixed, Minus, Pencil, Plus, Redo2, Settings2, Shield, Target, Undo2, Waves } from "lucide-react";
import { tradingCopy, timeframeOptions } from "@/shared/copy/tradingCopy";
import { formatNumber } from "@/shared/lib/formatters";
import type { Candle, ChartDrawing, DrawingTool, Instrument, Timeframe, TradePlan } from "@/shared/types/trading";

interface Props {
  instrument: Instrument;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (value: Timeframe) => void;
  plan?: TradePlan;
  drawings: ChartDrawing[];
  onAddDrawing: (drawing: ChartDrawing) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRemoveDrawing: (id: string) => void;
  onSetPlanLevel: (kind: "entry" | "stop" | "target", price: number) => void;
  canRedo: boolean;
}

const chartCopy = tradingCopy.chart;
const chartGeometry = { left: 58, right: 26, top: 20, bottom: 48 };
const palette = { background: "#0f1722", grid: "#243140", muted: "#8593a4", text: "#cbd5e1", up: "#3ecf9b", down: "#f16d77", blue: "#76a7ff", orange: "#f0b66d" };

const movingAverage = (candles: Candle[], period: number) => candles.map((candle, index) => {
  const range = candles.slice(Math.max(0, index - period + 1), index + 1);
  return { time: candle.time, value: range.reduce((sum, item) => sum + item.close, 0) / range.length };
});

export function CandlestickChart({ instrument, candles, timeframe, onTimeframeChange, plan, drawings, onAddDrawing, onUndo, onRedo, onRemoveDrawing, onSetPlanLevel, canRedo }: Props) {
  const [tool, setTool] = useState<DrawingTool>("cursor");
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [trendStart, setTrendStart] = useState<{ time: number; price: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 900, height: 460 });

  useEffect(() => {
    const element = chartWrapRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setChartSize({ width: Math.max(500, rect.width), height: Math.max(280, rect.height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const values = useMemo(() => {
    const low = Math.min(...candles.map((item) => item.low), ...(plan ? [plan.stop] : []));
    const high = Math.max(...candles.map((item) => item.high), ...(plan ? [plan.target] : []));
    const padding = (high - low) * 0.12 || instrument.lastPrice * 0.01;
    return { min: low - padding, max: high + padding, ema20: movingAverage(candles, 20), ema50: movingAverage(candles, 50) };
  }, [candles, instrument.lastPrice, plan]);

  const view = useMemo(() => ({
    x: (index: number) => chartGeometry.left + index / Math.max(candles.length - 1, 1) * (chartSize.width - chartGeometry.left - chartGeometry.right),
    y: (price: number) => chartGeometry.top + (values.max - price) / (values.max - values.min) * (chartSize.height - chartGeometry.top - chartGeometry.bottom),
  }), [chartSize, values, candles.length]);

  const selected = candles[hoverIndex ?? candles.length - 1];
  const last = candles[candles.length - 1];
  const plotBottom = chartSize.height - chartGeometry.bottom;
  const plotRight = chartSize.width - chartGeometry.right;
  const priceTicks = Array.from({ length: 6 }, (_, index) => values.max - index * (values.max - values.min) / 5);
  const xTicks = [0, 1, 2, 3, 4, 5].map((index) => Math.round(index * (candles.length - 1) / 5));

  const pointerToMarket = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = (event.clientX - rect.left) / rect.width * chartSize.width;
    const y = (event.clientY - rect.top) / rect.height * chartSize.height;
    const index = Math.max(0, Math.min(candles.length - 1, Math.round((x - chartGeometry.left) / (plotRight - chartGeometry.left) * (candles.length - 1))));
    const price = values.max - (y - chartGeometry.top) / (plotBottom - chartGeometry.top) * (values.max - values.min);
    return { time: candles[index].time, price: Math.max(values.min, Math.min(values.max, price)), index };
  };

  const handleClick = (event: React.PointerEvent<SVGSVGElement>) => {
    if (tool === "cursor") return;
    const marketPoint = pointerToMarket(event);
    if (!marketPoint) return;
    if (tool === "entry" || tool === "stop" || tool === "target") {
      onSetPlanLevel(tool, marketPoint.price);
      onAddDrawing({ id: `drawing-${Date.now()}`, tool: "horizontal", points: [marketPoint], text: tool === "entry" ? chartCopy.legendEntry : tool === "stop" ? chartCopy.legendStop : chartCopy.legendTarget });
      setTool("cursor");
      return;
    }
    if (tool === "trendline" && !trendStart) { setTrendStart(marketPoint); return; }
    const points = tool === "trendline" && trendStart ? [trendStart, marketPoint] : [marketPoint];
    onAddDrawing({ id: `drawing-${Date.now()}`, tool, points, text: tool === "note" ? chartCopy.notePlaceholder : undefined });
    setTrendStart(null);
    setTool("cursor");
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = pointerToMarket(event);
    if (point) setHoverIndex(point.index);
  };

  const emaPath = (items: Array<{ time: number; value: number }>) => items.map((item, index) => `${index ? "L" : "M"}${view.x(index)},${view.y(item.value)}`).join(" ");

  return <section className="chart-card">
    <div className="chart-topline">
      <div className="instrument-heading">
        <div className="instrument-avatar"><LineChart size={18} /></div>
        <div><div className="instrument-name"><strong>{instrument.symbol}</strong><span className="exchange-tag">{instrument.exchange}</span></div><span className="instrument-description">{instrument.name} · {timeframe}</span></div>
      </div>
      <div className="chart-quote"><strong className="quote-value">₹{formatNumber(instrument.lastPrice)}</strong><span className="positive">+{formatNumber(instrument.change)} ({formatNumber(instrument.changePercent)}%)</span></div>
      <button className="icon-button chart-settings" aria-label={tradingCopy.common.settings}><Settings2 size={16} /></button>
    </div>
    <div className="chart-toolbar">
      <div className="timeframe-select" aria-label={chartCopy.timeframe}>{timeframeOptions.map((option) => <button key={option} className={timeframe === option ? "selected" : ""} onClick={() => onTimeframeChange(option)}>{option}</button>)}</div>
      <div className="toolbar-divider" />
      <div className="drawing-tools" aria-label={chartCopy.tools}>
        <button title={chartCopy.cursor} aria-label={chartCopy.cursor} className={tool === "cursor" ? "tool-active" : ""} onClick={() => { setTool("cursor"); setTrendStart(null); }}><Crosshair size={16} /></button>
        <button title={chartCopy.horizontal} aria-label={chartCopy.horizontal} className={tool === "horizontal" ? "tool-active" : ""} onClick={() => setTool("horizontal")}><Minus size={16} /></button>
        <button title={chartCopy.trendline} aria-label={chartCopy.trendline} className={tool === "trendline" ? "tool-active" : ""} onClick={() => setTool("trendline")}><Waves size={16} /></button>
        <button title={chartCopy.note} aria-label={chartCopy.note} className={tool === "note" ? "tool-active" : ""} onClick={() => setTool("note")}><Pencil size={15} /></button>
      </div>
      <div className="toolbar-divider optional-divider" />
      <div className="plan-level-tools" aria-label={chartCopy.tools}>
        <button className={`plan-tool entry-tool ${tool === "entry" ? "tool-active" : ""}`} title={chartCopy.setEntry} aria-label={chartCopy.setEntry} onClick={() => setTool("entry")}><LocateFixed size={12} /><span>{chartCopy.entryShort}</span></button>
        <button className={`plan-tool stop-tool ${tool === "stop" ? "tool-active" : ""}`} title={chartCopy.setStop} aria-label={chartCopy.setStop} onClick={() => setTool("stop")}><Shield size={12} /><span>{chartCopy.stopShort}</span></button>
        <button className={`plan-tool target-tool ${tool === "target" ? "tool-active" : ""}`} title={chartCopy.setTarget} aria-label={chartCopy.setTarget} onClick={() => setTool("target")}><Target size={12} /><span>{chartCopy.targetShort}</span></button>
      </div>
      <div className="toolbar-divider optional-divider" />
      <button className={`toolbar-label ${showEma20 ? "on" : ""}`} onClick={() => setShowEma20((value) => !value)}><i className="indicator-dot ema20-dot" />{chartCopy.ema20}</button>
      <button className={`toolbar-label ${showEma50 ? "on" : ""}`} onClick={() => setShowEma50((value) => !value)}><i className="indicator-dot ema50-dot" />{chartCopy.ema50}</button>
      <button className={`toolbar-label volume-toggle ${showVolume ? "on" : ""}`} onClick={() => setShowVolume((value) => !value)}><i className="indicator-dot volume-dot" />{chartCopy.volume}</button>
      <div className="toolbar-spacer" />
      <button className="icon-button compact" onClick={onUndo} aria-label={chartCopy.undo} disabled={drawings.length === 0}><Undo2 size={15} /></button>
      <button className="icon-button compact" onClick={onRedo} aria-label={chartCopy.redo} disabled={!canRedo}><Redo2 size={15} /></button>
      <button className="icon-button compact fullscreen-button" aria-label={chartCopy.fullscreen}><Expand size={15} /></button>
    </div>
    <div className="chart-readout">
      <span className="readout-symbol">{instrument.symbol} · {timeframe}</span>
      <span>{chartCopy.ohlc.open} <b>{formatNumber(selected.open)}</b></span><span>{chartCopy.ohlc.high} <b className="positive-text">{formatNumber(selected.high)}</b></span><span>{chartCopy.ohlc.low} <b className="negative-text">{formatNumber(selected.low)}</b></span><span>{chartCopy.ohlc.close} <b className={selected.close >= selected.open ? "positive-text" : "negative-text"}>{formatNumber(selected.close)}</b></span>
      <span className={selected.close >= selected.open ? "positive-text" : "negative-text"}>{selected.close >= selected.open ? "+" : "−"}{formatNumber(Math.abs(selected.close - selected.open))}</span>
    </div>
    <div className="chart-canvas-wrap" ref={chartWrapRef}>
      <svg ref={svgRef} className={`chart-canvas ${tool !== "cursor" ? "draw-mode" : ""}`} viewBox={`0 0 ${chartSize.width} ${chartSize.height}`} preserveAspectRatio="none" onPointerDown={handleClick} onPointerMove={handlePointerMove} onPointerLeave={() => setHoverIndex(null)}>
        <defs><clipPath id="plot-clip"><rect x={chartGeometry.left} y={chartGeometry.top} width={plotRight - chartGeometry.left} height={plotBottom - chartGeometry.top} /></clipPath></defs>
        <rect width={chartSize.width} height={chartSize.height} fill={palette.background} />
        {priceTicks.map((tick, index) => <g key={`y-${index}`}><line x1={chartGeometry.left} x2={plotRight} y1={view.y(tick)} y2={view.y(tick)} stroke={palette.grid} strokeDasharray={index === priceTicks.length - 1 ? "0" : "3 5"} /><text x={chartSize.width - 5} y={view.y(tick) + 4} textAnchor="end" fill={palette.muted} fontSize="12">{formatNumber(tick, 0)}</text></g>)}
        {xTicks.map((index) => <g key={`x-${index}`}><line x1={view.x(index)} x2={view.x(index)} y1={chartGeometry.top} y2={plotBottom} stroke={palette.grid} strokeDasharray="3 5" /><text x={view.x(index)} y={chartSize.height - 16} textAnchor="middle" fill={palette.muted} fontSize="12">{new Date(candles[index].time * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" })}</text></g>)}
        <g clipPath="url(#plot-clip)">
          {showVolume && candles.map((candle, index) => { const x = view.x(index); const h = candle.volume / Math.max(...candles.map((item) => item.volume)) * 38; return <rect key={`volume-${candle.time}`} x={x - 2.6} y={plotBottom - h} width={5.2} height={h} fill={candle.close >= candle.open ? palette.up : palette.down} opacity="0.18" />; })}
          {candles.map((candle, index) => { const x = view.x(index); const color = candle.close >= candle.open ? palette.up : palette.down; const bodyTop = view.y(Math.max(candle.open, candle.close)); const bodyBottom = view.y(Math.min(candle.open, candle.close)); const bodyHeight = Math.max(bodyBottom - bodyTop, 1.4); return <g key={candle.time}><line x1={x} x2={x} y1={view.y(candle.high)} y2={view.y(candle.low)} stroke={color} strokeWidth="1.25" /><rect x={x - 3.1} y={bodyTop} width={6.2} height={bodyHeight} fill={color} rx="0.6" /></g>; })}
          {showEma20 && <path d={emaPath(values.ema20)} fill="none" stroke={palette.blue} strokeWidth="1.8" />}
          {showEma50 && <path d={emaPath(values.ema50)} fill="none" stroke={palette.orange} strokeWidth="1.8" />}
          {plan && <g className="plan-lines">{[[plan.entry, tradingCopy.chart.legendEntry, palette.blue], [plan.stop, tradingCopy.chart.legendStop, palette.down], [plan.target, tradingCopy.chart.legendTarget, palette.up]].map(([price, label, color]) => <g key={String(label)}><line x1={chartGeometry.left} x2={plotRight} y1={view.y(Number(price))} y2={view.y(Number(price))} stroke={String(color)} strokeWidth="1.5" strokeDasharray="7 5" /><rect x={chartGeometry.left + 8} y={view.y(Number(price)) - 17} width={64} height={18} rx="4" fill={String(color)} opacity="0.92" /><text x={chartGeometry.left + 40} y={view.y(Number(price)) - 4} textAnchor="middle" fill="#08111b" fontSize="11" fontWeight="700">{label as string}</text></g>)}</g>}
          {drawings.map((drawing) => { const first = drawing.points[0]; const x1 = view.x(Math.max(0, candles.findIndex((item) => item.time === first.time))); const y1 = view.y(first.price); if (drawing.tool === "horizontal") return <g key={drawing.id} onPointerDown={(event) => { event.stopPropagation(); onRemoveDrawing(drawing.id); }}><line x1={chartGeometry.left} x2={plotRight} y1={y1} y2={y1} stroke={drawing.text === chartCopy.legendEntry ? palette.blue : drawing.text === chartCopy.legendStop ? palette.down : drawing.text === chartCopy.legendTarget ? palette.up : "#c3a6ff"} strokeWidth="1.6" strokeDasharray="5 4" /><circle cx={plotRight - 2} cy={y1} r="4" fill={drawing.text === chartCopy.legendEntry ? palette.blue : drawing.text === chartCopy.legendStop ? palette.down : drawing.text === chartCopy.legendTarget ? palette.up : "#c3a6ff"} /><text x={chartGeometry.left + 8} y={y1 - 7} fill={drawing.text ? "#d8e3ef" : "#d8c7ff"} fontSize="12">{drawing.text ? `${drawing.text} · ${formatNumber(first.price)}` : formatNumber(first.price)}</text></g>;
            if (drawing.tool === "trendline" && drawing.points[1]) { const endIndex = candles.findIndex((item) => item.time === drawing.points[1].time); return <line key={drawing.id} x1={x1} x2={view.x(Math.max(0, endIndex))} y1={y1} y2={view.y(drawing.points[1].price)} stroke="#c3a6ff" strokeWidth="2" onPointerDown={(event) => { event.stopPropagation(); onRemoveDrawing(drawing.id); }} />; }
            return <g key={drawing.id} onPointerDown={(event) => { event.stopPropagation(); onRemoveDrawing(drawing.id); }}><rect x={x1 + 5} y={y1 - 22} width="142" height="22" rx="5" fill="#332b46" stroke="#9273c4" /><text x={x1 + 12} y={y1 - 7} fill="#e6d9ff" fontSize="12">{drawing.text}</text></g>;
          })}
          {hoverIndex !== null && <g><line x1={view.x(hoverIndex)} x2={view.x(hoverIndex)} y1={chartGeometry.top} y2={plotBottom} stroke="#90a0b2" strokeDasharray="3 4" opacity="0.7" /><circle cx={view.x(hoverIndex)} cy={view.y(candles[hoverIndex].close)} r="3.4" fill="#dbeafe" stroke={palette.background} strokeWidth="1.4" /></g>}
        </g>
        {priceTicks.map((tick, index) => <text key={`label-${index}`} x={chartSize.width - 5} y={view.y(tick) + 4} textAnchor="end" fill={palette.muted} fontSize="12">{formatNumber(tick, 0)}</text>)}
        <line x1={chartGeometry.left} x2={plotRight} y1={view.y(last.close)} y2={view.y(last.close)} stroke={palette.up} strokeDasharray="3 4" opacity="0.65" />
        <rect x={plotRight - 59} y={view.y(last.close) - 10} width="54" height="20" rx="4" fill={palette.up} /><text x={plotRight - 32} y={view.y(last.close) + 4} textAnchor="middle" fill="#08111b" fontSize="11" fontWeight="700">{formatNumber(last.close, 0)}</text>
      </svg>
      {tool !== "cursor" && <div className="draw-hint"><Crosshair size={13} />{tool === "entry" ? chartCopy.setEntry : tool === "stop" ? chartCopy.setStop : tool === "target" ? chartCopy.setTarget : chartCopy.drawingHint}</div>}
      {hoverIndex !== null && <div className="crosshair-tag">{chartCopy.price}: {formatNumber(candles[hoverIndex].close)}</div>}
      <div className="chart-zoom-controls"><button aria-label={chartCopy.autoScale}><Plus size={13} /></button><button aria-label={chartCopy.autoScale}><Minus size={13} /></button><button aria-label={chartCopy.autoScale}><ChevronDown size={13} /></button></div>
    </div>
    <div className="chart-footer"><div className="range-selectors">{chartCopy.range.map((range, index) => <button key={`${range}-${index}`} className={index === 0 ? "active" : ""}>{range}</button>)}</div><div className="chart-footer-right"><span><span className="fresh-dot" />{tradingCopy.market.quoteUpdated}</span><button className="autoscale-button"><Check size={12} />{chartCopy.autoScale}</button></div></div>
    <div className="chart-drawing-footer"><span><Eraser size={13} />{drawings.length}</span><span>{tool === "cursor" ? chartCopy.cursor : tool === "horizontal" ? chartCopy.horizontal : tool === "trendline" ? chartCopy.trendline : tool === "note" ? chartCopy.note : tool === "entry" ? chartCopy.setEntry : tool === "stop" ? chartCopy.setStop : chartCopy.setTarget}</span><span>{chartCopy.legendEntry}<i className="indicator-dot ema20-dot" />{chartCopy.legendStop}<i className="indicator-dot" style={{ background: palette.down }} />{chartCopy.legendTarget}<i className="indicator-dot" style={{ background: palette.up }} /></span></div>
  </section>;
}
