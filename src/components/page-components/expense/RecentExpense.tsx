"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

import { useState } from "react";
import { useGetExpensesQuery } from "@/redux/api/expenseApi";
import { formatAmount } from "./ExpenseTable";
import ExpenseLightbox from "./ExpenseLightbox";

export default function RecentExpenses() {
  // Fetch latest 5 expenses
  const { data, isLoading, isError } = useGetExpensesQuery({
    page: 1,
    pageSize: 5,
    sortBy: "date",
    sortOrder: "desc",
  });

  const expenses = data?.expenses ?? [];

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleViewBill = (billPhoto: string | null) => {
    if (billPhoto) {
      setLightboxSrc(billPhoto);
      setLightboxOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Recent Expenses
        </h3>
        <div className="text-center py-8 text-gray-500">Loading recent expenses...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Recent Expenses
        </h3>
        <div className="text-center py-8 text-red-500">Failed to load expenses</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Expenses
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Expense
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Amount
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Bill
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell  className="py-8 text-center text-gray-500">
                    No expenses yet
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    {/* Description + Date */}
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 line-clamp-1">
                          {expense.description}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {new Date(expense.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {expense.category?.name || "Uncategorized"}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                      {formatAmount(expense.amount)}
                    </TableCell>

                    {/* View Bill Link */}
                    <TableCell className="py-3">
                      {expense.billPhoto ? (
                        <button
                          onClick={() => handleViewBill(expense.billPhoto)}
                          className="text-blue-600 hover:underline text-theme-xs dark:text-blue-400"
                        >
                          View Bill →
                        </button>
                      ) : (
                        <span className="text-gray-400 text-theme-xs">—</span>
                      )}
                    </TableCell>


                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reusable Lightbox */}
      <ExpenseLightbox
        open={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
          setLightboxSrc(null);
        }}
        src={lightboxSrc}
      />
    </>
  );
}