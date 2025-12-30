import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ExpenseForm from "@/components/page-components/expense/ExpenseForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expense",
  description: "",
};

export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add expense" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-2 dark:border-gray-800 dark:bg-white/3 xl:px-10 xl:py-3">
        <ExpenseForm/>
      </div>
    </div>
  );
}
