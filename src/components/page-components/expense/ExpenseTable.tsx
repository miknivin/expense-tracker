// src/components/expenses/ExpenseTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import EditIcon from "@/icons/EditIcon";
import DeleteIcon from "@/icons/DeleteIcon";
import { Expense } from "@/redux/api/expenseApi";
import Link from "next/link";



const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// In both ExpenseCard.tsx and ExpenseTable.tsx
export const formatAmount = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(num);
};

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Description
                </TableCell>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Amount
                </TableCell>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Bill
                </TableCell>
                <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className=" px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {expense.description}
                  </TableCell>
                  <TableCell className=" px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color="info">
                      {expense.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className=" px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatAmount(expense.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {expense.billPhoto ? (
                      <a
                        href={expense.billPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="col-span-1 flex items-center px-4 py-[17.5px] gap-3">
                    <Link
                      href={`/expense/${expense.id}`}
                      className="text-blue-800 hover:text-blue-600"
                    >
                      <EditIcon className="w-6 h-6" />
                    </Link>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-800 hover:text-red-600"
                    >
                      <DeleteIcon className="w-6 h-6" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}