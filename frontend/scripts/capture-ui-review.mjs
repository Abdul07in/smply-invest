import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const output = new URL("../../.docs/ui-review/", import.meta.url);
await mkdir(fileURLToPath(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const loginPage = await loginContext.newPage();
  await loginPage.goto("http://localhost:3000");
  await loginPage.getByRole("heading", { name: "Welcome to your trading workspace" }).waitFor();
  await loginPage.screenshot({ path: fileURLToPath(new URL("login-desktop.png", output)), fullPage: true });
  await loginPage.setViewportSize({ width: 390, height: 844 });
  await loginPage.screenshot({ path: fileURLToPath(new URL("login-mobile.png", output)), fullPage: true });
  await loginContext.close();

  const workspaceContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await workspaceContext.addInitScript(() => localStorage.setItem("simply-markets:demo-session", "active"));
  const workspacePage = await workspaceContext.newPage();
  await workspacePage.goto("http://localhost:3000");
  await workspacePage.getByRole("heading", { name: "Your trading workspace" }).waitFor();
  await workspacePage.screenshot({ path: fileURLToPath(new URL("workspace-desktop.png", output)), fullPage: true });
  for (const size of [{ width: 768, height: 1024, name: "tablet" }, { width: 390, height: 844, name: "mobile" }, { width: 360, height: 800, name: "mobile-narrow" }]) {
    await workspacePage.setViewportSize({ width: size.width, height: size.height });
    await workspacePage.screenshot({ path: fileURLToPath(new URL(`workspace-${size.name}.png`, output)), fullPage: true });
  }
  await workspaceContext.close();
} finally {
  await browser.close();
}
