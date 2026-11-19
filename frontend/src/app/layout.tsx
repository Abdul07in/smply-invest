import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { Providers } from "./Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: tradingCopy.app.browserTitle,
  description: tradingCopy.app.browserDescription,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppRouterCacheProvider options={{ enableCssLayer: true }}><Providers>{children}</Providers></AppRouterCacheProvider></body></html>;
}
