// src/lib/redux/api/dashboardApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the shape of the monthly expense item
export type MonthlyExpense = {
  year: number;
  month: number; // 1-12
  monthName: string; // e.g., "Dec"
  yearMonth: string; // e.g., "2025-12"
  count: number;
  totalAmount: number | string; // Prisma Decimal comes as string
};

// Full dashboard stats response
export type DashboardStats = {
  totalExpenses: number;
  totalAmount: number | string; // Prisma Decimal → string
  monthlyExpenses: MonthlyExpense[];
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/", // Next.js API routes
  }),
  tagTypes: ["DashboardStats"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "api/dashboard/stats",
      // Optional: providesTags for future invalidation if needed
      providesTags: ["DashboardStats"],
    }),
  }),
});

// Exported hook
export const { useGetDashboardStatsQuery } = dashboardApi;