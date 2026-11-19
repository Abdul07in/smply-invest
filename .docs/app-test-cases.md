# Simply Markets demo test cases

These end-to-end cases cover the browser demo’s main user journey. They run against the local mock trading service; no broker or external account is contacted.

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| AUTH-01 | Sign-in validation | Submit an invalid email, then submit a valid-format email without a password. | Each submission stays on sign-in and shows the matching validation message. |
| AUTH-02 | Demo sign-in and session restore | Choose **Explore the demo**, then refresh the page. | The trading workspace opens and remains available after refresh. |
| CHART-01 | Change chart timeframe and instrument | Select `1h`, open the instrument selector, and choose BANK NIFTY. | Chart header reflects the selected timeframe and instrument. |
| CHART-02 | Drawing history | Choose Price level, click the chart, undo the drawing, then redo it. | Undo/redo availability follows the drawing state and the drawing is restored. |
| PLAN-01 | Create a reusable candle-close plan | Enter a unique name, Buy/Sell side, close-above/below condition, timeframe, order type, quantity, stop and target; save and enable. | The plan appears in Saved trading plans with its full trigger and execution settings. |
| PLAN-02 | Reject invalid or duplicate plans | Enter a setup with invalid risk levels, missing trigger or an already-used plan name. | Validation explains the issue and saving remains disabled. |
| PLAN-03 | Manage multiple plans | Save multiple Buy and Sell plans, select each, edit one, pause/resume it, and delete another. | The selected plan is distinct, its settings persist, and each status/delete action updates the list. |
| PLAN-04 | Execute only the selected plan | Execute an enabled plan with a matching candle close while another plan remains saved. | Only the selected plan monitors and creates an order; the candle signal cannot create a duplicate. |
| PLAN-05 | Automatic and manual signal handling | Enable automatic execution for one plan and disable it for another, then trigger both signals. | Automatic plan places a paper order; manual plan shows a signal and requires order review. |
| PLAN-06 | Plan-wise reports and order outcomes | Review Saved trading plans, open positions, open orders and trade history after execution. | Total executions, successful/failed outcomes, daily P&L and plan-specific P&L/history are visible. |
| ORDER-01 | Submit a paper limit order | Open order review, choose Short and Limit, set quantity and price, then confirm. | Review identifies paper execution; confirmation appears and the order is visible in trade history. |
| ORDER-02 | Exit position and cancel pending order | Cancel a Working order, then exit an open position. | The pending order is marked Cancelled and the position closes with a history record. |
| NAV-01 | Mobile navigation and sign-out | At a 24.375rem viewport, open the navigation drawer and choose Sign out. | Drawer is usable at mobile width and the sign-in screen returns. |

Run the suite from `frontend` with `npm run test:e2e`. The Playwright configuration starts a local Next.js development server on port 3001.
