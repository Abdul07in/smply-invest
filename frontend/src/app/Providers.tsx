"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { useRef } from "react";
import { appTheme } from "@/shared/theme/appTheme";
import { makeStore } from "@/shared/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  storeRef.current ??= makeStore();
  return <Provider store={storeRef.current}><ThemeProvider theme={appTheme}><CssBaseline />{children}</ThemeProvider></Provider>;
}
