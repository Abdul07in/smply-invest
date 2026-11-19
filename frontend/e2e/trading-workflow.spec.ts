import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("sign-in rejects invalid email and missing password", async ({ page }) => {
  await page.getByLabel("Email address").fill("not-an-email");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Continue to paper trading" }).click();
  await expect(page.getByText("Enter a valid email address to continue.")).toBeVisible();

  await page.getByLabel("Email address").fill("trader@example.com");
  await page.getByLabel("Password").fill("");
  await page.getByRole("button", { name: "Continue to paper trading" }).click();
  await expect(page.getByText("Enter a password to continue.")).toBeVisible();
});

test("demo sign-in opens the paper trading workspace and restores after refresh", async ({ page }) => {
  await page.getByRole("button", { name: "Explore the demo" }).click();
  await expect(page.getByRole("heading", { name: "Your trading workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Place manual paper order" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Your trading workspace" })).toBeVisible();
});

test("chart timeframe and instrument selectors update the chart", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "1h", exact: true }).click();
  await expect(page.locator(".instrument-description")).toContainText("1h");

  await page.locator(".instrument-select").click();
  await page.locator(".instrument-popover > button").filter({ hasText: "BANK NIFTY" }).click();
  await expect(page.locator(".instrument-description")).toContainText("1h");
  await expect(page.locator(".instrument-name")).toContainText("BANK NIFTY");
});

test("chart drawing tools support undo and redo", async ({ page }) => {
  await enterDemo(page);
  const undo = page.getByRole("button", { name: "Undo last drawing" });
  const redo = page.getByRole("button", { name: "Redo drawing" });
  await expect(undo).toBeDisabled();
  await page.getByRole("button", { name: "Price level" }).click();
  await page.locator("svg.chart-canvas").click({ position: { x: 320, y: 150 } });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(undo).toBeDisabled();
  await expect(redo).toBeEnabled();
  await redo.click();
  await expect(undo).toBeEnabled();
});

test("a reusable candle-close plan can be created and enabled", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.getByLabel("Plan name").fill("Demo breakout setup");
  await page.getByLabel("Trigger price").fill("25100");
  await page.getByLabel("Signal timeframe").selectOption("15m");
  await page.getByLabel("Order type").selectOption("Market");
  await page.getByLabel("Entry price").fill("25150");
  await page.getByLabel("Stop loss").fill("25080");
  await page.getByLabel("Target price").fill("25300");
  await page.getByLabel("Quantity").fill("25");
  await page.getByRole("button", { name: "Save and enable" }).click();

  await expect(page.getByText("Plan saved and enabled. Start monitoring when you are ready.")).toBeVisible();
  const savedPlan = page.locator(".saved-plan-card").filter({ hasText: "Demo breakout setup" });
  await expect(savedPlan).toBeVisible();
  await expect(savedPlan).toContainText("15m closes above");
});

test("invalid trade plan levels prevent activation", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.getByLabel("Plan name").fill("Invalid setup");
  await page.getByLabel("Entry price").fill("25150");
  await page.getByLabel("Stop loss").fill("25200");
  await page.getByLabel("Target price").fill("25300");
  await expect(page.getByRole("button", { name: "Save and enable" })).toBeDisabled();
  await expect(page.getByText("Check the trigger, entry, stop, target, and quantity for this setup.")).toBeVisible();
});

test("paper limit order is reviewed and appears in trade history", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Place manual paper order" }).click();
  await expect(page.getByRole("heading", { name: "Review paper order" })).toBeVisible();
  await page.getByRole("button", { name: "Sell" }).click();
  await page.getByLabel("Order type").selectOption({ label: "Limit" });
  await page.getByLabel("Quantity").fill("12");
  await page.getByLabel("Limit price").fill("25120");
  await page.getByRole("button", { name: "Confirm paper order" }).click();

  await expect(page.getByText("Paper order submitted")).toBeVisible();
  await page.getByRole("button", { name: "Trade history" }).click();
  const submittedOrder = page.getByRole("row").filter({ hasText: "Sell" }).filter({ hasText: "12" });
  await expect(submittedOrder).toBeVisible();
  await expect(submittedOrder).toContainText("NIFTY 50");
});

test("mobile navigation drawer exposes navigation and sign-out", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterDemo(page);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("button", { name: "Investing" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Welcome to your trading workspace" })).toBeVisible();
});

test("only the selected enabled plan monitors and executes its candle signal", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.getByLabel("Plan name").fill("Unselected sell plan");
  await page.getByRole("button", { name: "Sell", exact: true }).click();
  await page.getByLabel("Trigger price").fill("25200");
  await page.getByLabel("Entry price").fill("25150");
  await page.getByLabel("Stop loss").fill("25200");
  await page.getByLabel("Target price").fill("24900");
  await page.getByRole("button", { name: "Save and enable" }).click();
  const cards = page.locator(".saved-plan-card");
  await expect(cards).toHaveCount(2);
  const initialPlan = cards.filter({ hasText: "Opening range breakout" });
  const unselectedPlan = cards.filter({ hasText: "Unselected sell plan" });
  await initialPlan.locator(".saved-plan-select").click();
  await initialPlan.getByRole("button", { name: "Execute selected plan" }).click();
  await expect(initialPlan.locator(".plan-status")).toContainText("Triggered");
  await expect(unselectedPlan.locator(".plan-status")).toContainText("Enabled");
  await expect(page.locator(".toast-message")).toContainText("Paper order placed from the selected plan.");
  await page.getByRole("button", { name: "Trade history" }).click();
  await expect(initialPlan.locator(".saved-plan-report")).toContainText("Successful1");
  await expect(page.getByRole("row").filter({ hasText: "Filled" })).toBeVisible();
});

test("manual-signal plans wait for review and can be edited, paused, and deleted", async ({ page }) => {
  await enterDemo(page);
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.getByLabel("Plan name").fill("Manual review plan");
  await page.getByLabel("Trigger price").fill("25100");
  await page.getByLabel("Entry price").fill("25150");
  await page.getByLabel("Stop loss").fill("25080");
  await page.getByLabel("Target price").fill("25300");
  await page.getByLabel("Automatically place a paper order when the signal triggers").uncheck();
  await page.getByRole("button", { name: "Save and enable" }).click();
  const card = page.locator(".saved-plan-card").filter({ hasText: "Manual review plan" });
  await card.getByRole("button", { name: "Execute selected plan" }).click();
  await expect(card.locator(".plan-status")).toContainText("Triggered");
  await expect(card.getByRole("button", { name: "Place order from plan" })).toBeVisible();
  await card.getByRole("button", { name: "Edit plan: Manual review plan" }).click();
  await expect(page.getByLabel("Plan name")).toHaveValue("Manual review plan");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  await card.getByRole("button", { name: "Plan paused" }).click();
  await expect(card.locator(".plan-status")).toContainText("Paused");
  await card.getByRole("button", { name: "Plan enabled" }).click();
  await expect(card.locator(".plan-status")).toContainText("Enabled");
  page.once("dialog", (dialog) => dialog.accept());
  await card.getByRole("button", { name: "Delete plan: Manual review plan" }).click();
  await expect(card).toHaveCount(0);
});

async function enterDemo(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Explore the demo" }).click();
  await expect(page.getByRole("heading", { name: "Your trading workspace" })).toBeVisible();
}
