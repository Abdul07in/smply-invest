# Simply Markets — Trading Workspace Functional Specification

**Status:** Product and implementation baseline  
**Reference:** [`smplyinvest.jpeg`](./smplyinvest.jpeg)  
**Primary goal:** Let a trader read a candlestick chart, mark a setup directly on it, turn that setup into an explicit trade plan, and execute or manage the trade from the same workspace.

## 1. Product summary

The reference image shows a desktop trading dashboard with a market ticker, charting area, trade controls, active-position and plan cards, and order/position/history tabs. The chart is the center of the workflow. A trader should be able to analyze price action and define the entry, stop, target, and rationale on the chart, then review the resulting plan and submit an order without losing the chart context.

The first implementation should support **paper trading** end to end. The visible Trading and Paper Trading sections imply that the product may eventually support both simulated and broker-connected execution. Real-money execution is a separate integration and must not be represented as available until a broker connection, order status handling, and user authorization are implemented.

## 2. Reference screen analysis

The screenshot contains these areas and signals:

1. **Primary navigation:** Trading, Investing, Learning, and Paper Trading, with account/profile controls.
2. **Market strip:** Nifty 50, Bank Nifty, and Sensex values, daily moves, and a market-open indicator with time.
3. **Chart toolbar:** Instrument selector, interval selector (15m shown), chart/indicator controls, undo/redo, settings, and fullscreen.
4. **Candlestick chart:** OHLC and change for the selected candle, EMA 20 and EMA 50 overlays, price scale, time scale, and quick range selectors (1D through All). Log/auto scale controls are shown.
5. **Trading summary:** Running and daily P&L.
6. **Trade actions:** Execute, Exit, and Plan.
7. **Active position:** Instrument/contract, direction, quantity, entry/current price, unrealized P&L, and return.
8. **Trade plan card:** A short natural-language plan and an edit affordance.
9. **Activity tables:** Open Orders, Positions, Trade History, and Alerts, including order status and Modify/Cancel actions.

The screen appears to show an existing long NIFTY call option position and a working buy order. The specification treats those as sample/reference content, not hard-coded application data.

## 3. Product principles and scope

- **Chart-linked:** Every plan level and annotation is attached to the instrument and chart time context where it was created.
- **Explicit before action:** A plan is saved as a draft until the user reviews it. A chart annotation or a price touching a level does not silently submit an order.
- **Traceable:** Plans, edits, order submissions, fills, exits, and cancellations have timestamps and statuses.
- **Clear mode:** The user can always tell whether they are in paper mode or connected live mode. The MVP is paper-only.
- **Useful without automation:** The user can create a plan, monitor it, and execute manually. Automatic trigger-to-order execution is a later, separately enabled capability.

### MVP includes

- A market/instrument selector, chart intervals, candlesticks, crosshair, OHLC readout, and a small set of common indicators (EMA 20/50).
- Chart annotations: horizontal price level, entry/stop/target levels, trend line, and free text note.
- Create, edit, save, duplicate, activate, pause, and archive trade plans.
- Paper orders and position tracking, including order states and basic P&L.
- Open Orders, Positions, Trade History, and Alerts views.
- Responsive layout that keeps chart interactions usable on smaller screens.

### Not in MVP

- Broker-connected/live trading, automated strategy execution, multi-leg options strategies, social sharing, advanced backtesting, and tax/accounting reports.
- Arbitrary scripting or strategy bots.

## 4. Main user journeys

### 4.1 Analyze and mark a chart

1. User opens Trading and chooses an instrument (for example, NIFTY 50 or a specific option contract) and interval.
2. The chart loads candles and indicates the selected instrument, interval, data freshness, and exchange time zone.
3. User moves the crosshair to inspect a candle. The header readout updates with that candle’s open, high, low, close, and change.
4. User chooses a drawing tool and clicks/taps the chart to place a level, line, or note. The mark is anchored to a price and, where applicable, a timestamp; it stays at the same market coordinate when the chart is panned or zoomed.
5. User can select, drag, edit, hide, or delete their marks. Undo/redo applies to chart edits in the current session. Saved marks persist with the plan or chart layout.

### 4.2 Create a trade plan from the chart

1. User selects **Plan** or **Create plan**. A plan editor opens beside the chart (drawer on narrow screens).
2. User sets direction (Long/Short), instrument/contract, entry condition or entry price, stop-loss, one or more targets, quantity or risk budget, and optional notes/setup name.
3. User can populate entry, stop, and target by selecting chart levels, or enter values in the editor. Values are editable in either place and stay synchronized.
4. Chart displays labeled plan levels and a risk/reward preview. Invalid relationships (for example, a long plan whose stop is not below its entry) are explained and cannot be activated until fixed. Conditional plans may define a trigger zone or rule rather than a fixed entry.
5. The user saves a draft or reviews and activates the plan. Review shows estimated quantity, maximum planned loss, target profit, risk/reward, and the execution mode.
6. An activated plan appears on the chart and in the Trade Plan card. Price reaching a plan level may create an in-app alert, but does not place an order unless a future automation setting is explicitly enabled.

### 4.3 Execute and manage a plan

1. User selects **Execute** from the plan or trade panel. A confirmation view summarizes instrument, side, quantity, order type, estimated price, stop, target, and paper/live mode.
2. In MVP, confirmation submits a paper order. The app displays a pending/working state and then a simulated fill according to the paper-trading rules configured for the environment. It must not pretend a fill occurred before the simulator returns one.
3. The order appears under Open Orders; a fill creates or updates a position. The position card displays quantity, average entry, current/last price, unrealized P&L, and return.
4. User can modify or cancel eligible open orders. User can exit a position (full or partial quantity); confirmation shows the expected effect. The resulting order/fill and realized P&L appear in history.
5. Plan status and position status are separate: a plan can be active while an order is working, and a position can remain open after the plan is completed or archived.

### 4.4 Review activity

Tabs show data scoped to the selected account and mode:

- **Open Orders:** working/pending orders, side, quantity, limit/trigger price, type, time-in-force, status, and permitted actions.
- **Positions:** open positions grouped by instrument, with quantity, average price, mark price, unrealized P&L, and exit action.
- **Trade History:** orders, fills, exits, realized P&L, and linked plan.
- **Alerts:** triggered price/plan alerts, read state, and navigation back to the relevant chart/plan.

## 5. Functional requirements

### 5.1 Chart and market data

- The chart must display OHLC candles with volume available as a chart toggle or pane.
- The initial instrument, interval, and visible range should have sensible defaults and be restorable per user.
- Symbol/contract and interval changes must refresh candles and chart metadata together; stale data must be visibly marked.
- Crosshair selection updates OHLC, time, and indicator values. Current quote and selected historical candle values must not be confused.
- EMA 20 and EMA 50 can be toggled; indicator names and parameters are visible. Indicator state is saved with the chart layout.
- Chart supports zoom, pan, autoscale, price/time axes, and quick range selection. Drawings remain attached to market coordinates when the viewport changes.
- Show loading, no-data, market-closed, delayed-data, and data-error states. The quote timestamp and whether data is delayed must be visible.
- MVP annotations: horizontal line/price level, trend line, entry/stop/target levels, text note, select/move/delete, undo/redo, show/hide, and color/label editing.
- An annotation can link to a plan. Deleting a drawing must not silently delete the linked plan; warn and offer to remove only the drawing or the plan too.

### 5.2 Trade plan

- Each plan has a name, instrument, side, entry definition, stop, targets, sizing method, quantity, notes, status, timestamps, and chart reference.
- Entry definition supports a fixed limit price or a price condition for manual monitoring. MVP execution remains user-confirmed.
- Sizing supports fixed quantity and risk-budget sizing. If account equity or contract multiplier is unavailable, risk-budget sizing is unavailable with a clear reason.
- For a long plan, stop is below entry and targets are above entry; inverse for short. Allow advanced exceptions only as a deliberate future feature.
- Show risk per unit, total planned risk, potential reward per target, and risk/reward. For derivatives, calculations use contract multiplier and instrument-specific tick/lot rules where available.
- Plan statuses: Draft, Active, Paused, Triggered (condition met; no order necessarily submitted), Executing (linked order exists), Completed, Invalidated, Archived.
- Editing an active plan records a revision and refreshes its chart labels. Editing entry/stop/target after a linked order is working must not modify that order silently.
- Plans can be saved without an order, duplicated, paused, resumed, completed, and archived.
- Every plan level is represented by a labeled chart drawing and an editor value; edits from either surface update the other.

### 5.3 Orders and positions

- Order entry supports the MVP order type(s) exposed by the paper simulator. The UI must clearly label unsupported order types.
- Order fields: account/mode, instrument, side, quantity, order type, limit/trigger price when applicable, time-in-force, linked plan, status, submitted time, and fills.
- Order statuses include Draft, Pending, Working, Partially Filled, Filled, Cancel Pending, Canceled, Rejected, and Expired where applicable.
- Duplicate submission must be prevented while a submit request is in flight; the user receives a clear result for success or failure.
- Modify/cancel actions are available only for eligible statuses and show clear errors if the order state changed concurrently.
- Position P&L must distinguish realized and unrealized values and show currency. Fees and slippage treatment must be stated in paper-trading settings.
- Exit supports full and partial quantity. Confirm the quantity and order type before submitting.
- Orders and positions are always scoped to the selected account and Paper/Live mode; mode changes must not mix the two.

### 5.4 Alerts and market status

- User can set an alert from a chart level or plan condition.
- Alerts show instrument, condition, trigger value/time, delivery state, and linked plan; duplicate alert firing is controlled.
- Market status and quote time are displayed in the exchange’s configured timezone (IST for the reference market). Do not assume market hours from the screenshot alone; obtain them from market configuration.

### 5.5 Navigation and layout

- Keep the chart as the dominant workspace with the trade panel beside it on desktop.
- At narrower widths, move the trade panel into a drawer or stacked panel without covering chart controls. Keep Execute/Plan reachable.
- The market strip, selected instrument, timeframe, Paper/Live mode, active plan, and selected tab should remain clear during navigation.
- Keyboard and touch interactions must have alternatives to drag-only actions. Drawing tools need keyboard-accessible selection and deletion.
- Provide visible focus, readable contrast, and labels for icon-only controls.

## 6. Core data concepts

| Entity | Key fields and relationships |
|---|---|
| Instrument | ID, symbol, display name, asset class, exchange, currency, tick size, lot size, multiplier, expiry/strike/right when applicable |
| Candle | Instrument ID, interval, start/end time, open, high, low, close, volume, source, delay/freshness metadata |
| Chart layout | User ID, instrument/interval defaults, visible range, indicators, chart preferences |
| Drawing | ID, user, instrument, chart interval, drawing type, market-coordinate points, style, text, optional plan ID |
| Trade plan | ID, account/mode, instrument, side, entry rule/price, stop, target list, size/risk method, notes, status, revision, timestamps |
| Order | ID, account/mode, instrument, side, quantity, order type, prices, validity, status, plan ID, submission/idempotency key |
| Fill | ID, order ID, quantity, fill price, fee, timestamp, source/simulator ID |
| Position | ID, account/mode, instrument, net quantity, average entry, mark price, realized/unrealized P&L |
| Alert | ID, user, instrument, rule/price, plan ID, status, triggered time, delivery state |

Use decimal-safe numeric representation for prices, quantities, and money. Store timestamps in UTC and render them in the exchange/user timezone. Preserve exchange-specific contract metadata so risk and P&L calculations do not rely on display strings.

## 7. Important interaction details

- Chart click behavior depends on the selected tool. With the crosshair tool active, a click inspects; with a drawing tool active, clicks place/edit that drawing. Always show the active tool.
- Plan levels should have distinct labels and visual styles (Entry, Stop, Target 1, Target 2). Include a legend or accessible equivalent; color alone cannot carry meaning.
- Dragging a stop or target changes the plan value only after pointer release, then recalculates risk and asks for confirmation if the plan is active. If a linked broker order is later supported, order changes require a separate confirmation.
- Show an unsaved-changes indicator. Navigating away from an edited draft prompts to save or discard.
- If live data disconnects, preserve drawings and draft plans, freeze live-dependent calculations, and label quotes as stale. Do not submit using an unmarked stale quote.
- When a plan condition is crossed between incoming updates, use the data provider’s event/candle semantics and label the observed trigger time; do not claim tick-accurate triggering from candle-only data.

## 8. Non-functional requirements

- Chart interaction remains responsive during normal pan/zoom/drawing; data refresh must not reset the viewport or lose unsaved drawings.
- Show market-data source, last update time, and delay status. Handle reconnect and retry without duplicate orders.
- Persist plan/order/position changes reliably and keep an auditable event history.
- Protect account data and credentials; broker secrets (future integration) must never be exposed to the browser.
- Use server-side validation for order, quantity, instrument, tick-size, and plan constraints. Client-side validation is for feedback only.
- Provide accessible names, keyboard operation for key flows, and non-color status indicators.

## 9. Acceptance criteria for the MVP

1. A user can select an instrument and interval, load candlesticks, inspect OHLC values, and toggle EMA overlays.
2. A user can place, move, label, hide, undo, redo, and delete chart levels and a trend line; marks stay aligned to price/time after pan and zoom and persist after reload.
3. A user can create a draft plan with entry, stop, target, side, quantity, and notes from either the chart or editor; changing a level in either place updates the other.
4. The plan review displays total planned risk and reward and blocks activation when required values or directional relationships are invalid.
5. Activating a plan creates visible chart labels and an active plan card without submitting an order.
6. A user can submit a paper order from the plan after reviewing a confirmation; it appears in Open Orders with honest pending/working/fill status.
7. A simulated fill creates or updates the matching position; P&L and return recalculate from the documented paper pricing/fee assumptions.
8. A user can cancel an eligible order and close all or part of a position; activity and realized P&L appear in history.
9. A user can create a price alert from a plan level and see its triggered state and linked chart context.
10. The UI clearly identifies paper mode, stale/delayed data, and market status; no paper action is presented as a live broker fill.

## 10. Open implementation decisions

Resolve these before connecting real execution or committing to detailed API contracts:

- Which market-data vendor and supported exchanges/instruments provide candles, quotes, corporate actions, and derivatives metadata?
- Will chart prices be exchange-native candles, vendor candles, or an internal normalized feed? What is the permitted delay for each mode?
- Which paper fill model should be used (instant simulated fill, quote-based fill, candle-based fill, fees/slippage)? It must be documented and consistent.
- Which broker(s), order types, account types, and authorization flow are in scope for live execution?
- Will options be in the first MVP, and where do authoritative lot sizes, multipliers, expiry, and tick sizes come from?
- Are plan conditions only visual alerts in MVP, or is any server-side monitoring required?
- What should happen to a plan when its instrument expires, is halted, or becomes unavailable?

## 11. Suggested delivery sequence

1. **Chart foundation:** instrument/interval selection, candle data, chart interactions, indicators, annotations, persistence.
2. **Plan workflow:** editor, level synchronization, risk preview, validation, lifecycle, alerts.
3. **Paper execution:** order confirmation, simulator, order states, positions, P&L, activity history.
4. **Hardening:** responsive/accessibility pass, stale-feed and error states, auditability, performance.
5. **Live brokerage:** only after provider, authorization, order lifecycle, reconciliation, and operational behavior have been specified and reviewed.

