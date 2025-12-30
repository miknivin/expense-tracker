// src/components/ecommerce/EcommerceMetrics.tsx
"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon, BoxIconLine } from "@/icons";
import { formatAmount } from "../page-components/expense/ExpenseTable";

interface EcommerceMetricsProps {
  totalExpenses: number;
  totalSpent: number | string;
}

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({
  totalExpenses = 0,
  totalSpent = 0,
}) => {
  // Sample growth percentages - you can compute real ones later
  const expensesGrowth = 11.01; // or calculate from previous month
  const spentGrowth = -9.05;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Expenses */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Expenses
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalExpenses.toLocaleString()}
            </h4>
          </div>
          <Badge color={expensesGrowth > 0 ? "success" : "error"}>
            {expensesGrowth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(expensesGrowth)}%
          </Badge>
        </div>
      </div>

      {/* Total Spent */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Spent
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatAmount(totalSpent)}
            </h4>
          </div>
          <Badge color={spentGrowth > 0 ? "success" : "error"}>
            {spentGrowth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {Math.abs(spentGrowth)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};