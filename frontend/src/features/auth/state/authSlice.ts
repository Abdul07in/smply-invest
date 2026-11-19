import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState { ready: boolean; signedIn: boolean; }

const initialState: AuthState = { ready: false, signedIn: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSession(state, action: PayloadAction<boolean>) { state.signedIn = action.payload; state.ready = true; },
    signIn(state) { state.signedIn = true; state.ready = true; },
    signOut(state) { state.signedIn = false; state.ready = true; },
  },
});

export const { restoreSession, signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
