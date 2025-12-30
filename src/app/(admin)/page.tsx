// app/expense/page.tsx
import type { Metadata } from "next";
import RecentExpenses from "@/components/page-components/expense/RecentExpense";
import ExpenseDashboardContent from "@/components/page-components/dashboard/ExpenseDashboardContent";

export const metadata: Metadata = {
  title: "Expense Dashboard",
  description: "Track your expenses, monthly trends, and recent activity.",
};

export default function ExpenseDashboardPage() {
  return (
    <div className="">
      {/* Main Dashboard Content - Client Component */}
        <ExpenseDashboardContent />
    </div>
  );
}