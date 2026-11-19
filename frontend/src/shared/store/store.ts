import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/state/authSlice";
import tradingReducer from "@/features/trading/state/tradingSlice";

export const makeStore = () => configureStore({ reducer: { auth: authReducer, trading: tradingReducer } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
