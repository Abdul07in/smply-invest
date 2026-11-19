# Simply Markets web demo

Chart-first paper-trading demo built with Next.js App Router, React, and TypeScript. It follows the frontend boundary and product rules in `../.docs/simply-markets-aws-technical-blueprint.md`.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Run `npm run build` for a standalone production build (including static assets) or `npm run typecheck` for a TypeScript check.

## Project structure

```text
src/
  app/                         Next.js route and global styles
  features/trading/components/  Workspace, chart, dialogs, panels and navigation
  mock/data/                   Demo instruments, candles, plans, orders, positions and alerts
  shared/copy/                 UI labels, messages and accessible names
  shared/lib/                  Formatting and plan-risk calculations
  shared/services/             Trading service interface and mock implementation
  shared/types/                Frontend domain and service contracts
```

`TradingWorkspace` consumes `TradingService`; `MockTradingService` is the active adapter. A later HTTP adapter can implement the same contracts and connect to the blueprint’s versioned `/v1` API without moving sample records into feature components. Market-coordinate drawings are kept as timestamp/price points, separate from chart-library geometry. Demo paper-account changes and drawings are saved locally in the browser.

The demo is paper-only. Orders use deterministic mock behavior and do not contact a broker or represent real execution. All visible labels and messages are centralized in `src/shared/copy/tradingCopy.ts`; sample market and account records live in `src/mock/data/`.
