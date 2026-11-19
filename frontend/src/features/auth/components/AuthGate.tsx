"use client";

import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { authCopy } from "@/shared/copy/authCopy";
import { LoginScreen } from "./LoginScreen";
import { TradingWorkspace } from "@/features/trading/components/TradingWorkspace";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { restoreSession, signIn as authSignIn, signOut as authSignOut } from "@/features/auth/state/authSlice";

const SESSION_KEY = "simply-markets:demo-session";

export function AuthGate() {
  const dispatch = useAppDispatch();
  const { ready, signedIn } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession(window.localStorage.getItem(SESSION_KEY) === "active"));
  }, [dispatch]);

  const signIn = () => {
    window.localStorage.setItem(SESSION_KEY, "active");
    dispatch(authSignIn());
  };
  const signOut = () => {
    window.localStorage.removeItem(SESSION_KEY);
    dispatch(authSignOut());
  };

  if (!ready) return <Box className="auth-loading"><CircularProgress size={22} /><Typography color="text.secondary">{authCopy.sessionRestored}</Typography></Box>;
  return signedIn ? <TradingWorkspace onLogout={signOut} /> : <LoginScreen onSignIn={signIn} />;
}
