# Nifty 50 – Predefined Trading Plan & Execution System

## 1. Project Overview

The objective of this project is to develop a smart trading dashboard where users can create, save, manage, and execute multiple predefined trading plans for Nifty 50.

Users can define specific Buy and Sell conditions based on price levels and candle closing prices. Instead of manually monitoring the market and placing trades, users can create multiple trading strategies in advance and execute the desired plan whenever required.

## 2. Key Features

### A. Trading Dashboard

- Display the Nifty 50 live market price.
- Show live candlestick charts.
- Support multiple timeframes (1 min, 5 min, 15 min, 30 min, etc.).
- Display technical indicators such as EMA 20 and EMA 50.
- Show Running P&L and Day P&L.
- Display active positions and open orders.
- Provide access to Trade History and Alerts.

### B. Create & Manage Trading Plans

- Users can create multiple predefined trading plans.
- Each plan should have a unique name.
- Users can configure Buy and Sell conditions separately.
- Save plans for future use.
- Edit, delete, activate, or deactivate saved plans.
- Allow users to select any saved plan whenever required.

### C. Buy Execution Conditions

Users should be able to create Buy plans based on specific price and candle closing conditions.

Example:

- Plan Name: Nifty Buy Plan 1
- Instrument: Nifty 50
- Condition: Buy when the 15-minute candle closes above ₹95.
- Order Type: Market / Limit
- Quantity: 150
- Stop Loss: ₹90
- Target Price: ₹110

The system should automatically execute the Buy order when the configured condition is satisfied, provided the user has activated the plan and enabled automatic execution.

### D. Sell Execution Conditions

Users should also be able to create multiple Sell plans.

Example:

- Plan Name: Nifty Sell Plan 1
- Condition: Sell when the 15-minute candle closes below ₹105.
- Quantity: 150
- Stop Loss: ₹110
- Target Price: ₹95

The system should execute the Sell order when the configured conditions are met.

### E. Multiple Plan Management

- Create multiple Buy and Sell plans with different price levels.
- Save all plans in the system.
- Display all saved plans in a separate section.
- Select the required plan from the saved plans list.
- Execute only the selected plan.
- Allow users to modify conditions before execution.
- Prevent duplicate order execution for the same signal.

### F. Execute & Exit Functionality

- Provide an Execute button to start the selected trading plan.
- Provide an Exit button to close an active position.
- Display the current order execution status.
- Show entry price, current price, quantity, and unrealized P&L.
- Allow users to cancel pending orders.

### G. Trading Reports

- Display daily profit and loss.
- Show total executed trades.
- Maintain complete trade history.
- Display successful and failed order executions.
- Show plan-wise performance reports.

## 3. Expected Workflow

1. Open the Nifty 50 Trading Dashboard.
2. Create a new Buy or Sell trading plan.
3. Enter the required price conditions and candle timeframe.
4. Configure quantity, stop loss, and target price.
5. Save the trading plan.
6. Create multiple plans with different conditions.
7. Select the required plan from the saved plans list.
8. Click the Execute button.
9. The system monitors the market conditions.
10. When the configured conditions are satisfied, the system executes the order.
11. Display the executed order and live P&L.
12. Exit the position whenever required.

## 4. Main Objective

The main objective is to provide a flexible and user-friendly trading system where users can prepare multiple trading strategies in advance, save them, and execute their preferred strategy with a single click.

Users should not need to enter the same trading conditions repeatedly. They can simply select an existing plan and execute it when the market setup is suitable.
