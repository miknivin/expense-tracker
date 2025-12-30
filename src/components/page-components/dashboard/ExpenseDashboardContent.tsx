// src/components/page-components/expense/ExpenseDashboardContent.tsx
"use client";


import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import { useGetDashboardStatsQuery } from "@/redux/api/dashboardApi";
import MonthlyLimitProgress from "./MonthlyLimitProgress";
import RecentExpenses from "../expense/RecentExpense";

export default function ExpenseDashboardContent() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="mt-5 h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900 dark:bg-red-950/30">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  // Prepare data for components
  const metricsProps = {
    totalExpenses: stats.totalExpenses,
    totalSpent: stats.totalAmount,
    // You can add more derived metrics here (e.g., avg per month)
  };

  const chartProps = {
    monthlyData: stats.monthlyExpenses.map((m) => ({
      month: m.monthName,
      amount: Number(m.totalAmount), // Convert Decimal string to number
    })),
  };
  const today = new Date();
  const currentMonthName = today.toLocaleString("en-US", { month: "short" });
  const currentMonthData = stats.monthlyExpenses.find(
    (m) => m.monthName === currentMonthName
  );
  const currentMonthSpent = currentMonthData?.totalAmount || 0;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics {...metricsProps} />
        <MonthlySalesChart monthlyData={chartProps.monthlyData} />
        </div>
        <div className="col-span-12 xl:col-span-5">
            <MonthlyLimitProgress currentMonthSpent={currentMonthSpent} />
        </div>
        
      <div className="col-span-12">
        <RecentExpenses />
      </div>
    </div>
  );
}