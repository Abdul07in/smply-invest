# Simply Markets

Paper-trading dashboard demo for Nifty 50 with a candlestick chart, saved trading plans, candle-close triggers, simulated orders, and plan performance summaries.

## Frontend

The Next.js app is in [`frontend`](./frontend). It uses React, TypeScript, MUI, Tailwind CSS v4, and Redux Toolkit.

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Run `npm run typecheck` and `npm run test:e2e` from `frontend` to validate the app.

All trading is simulated in the browser. The active `MockTradingService` follows the same service boundary intended for a future backend integration; it does not send orders to a broker.

## Project notes

Product requirements, technical blueprint, functional specification, and test cases are in [`.docs`](./.docs). The frontend structure and adapter contract are described in [`frontend/README.md`](./frontend/README.md).
