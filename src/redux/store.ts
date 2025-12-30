import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./api/authApi";
import authReducer from "@/redux/slices/authSlice";
import { categoryApi } from "./api/categoryApi";
import { expenseApi } from "./api/expenseApi";
import { dashboardApi } from "./api/dashboardApi";
import { calendarApi } from "./api/calendarApi";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [expenseApi.reducerPath]: expenseApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [calendarApi.reducerPath]: calendarApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
        authApi.middleware,
        categoryApi.middleware,
        expenseApi.middleware,
        dashboardApi.middleware,
        calendarApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;