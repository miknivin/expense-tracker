// src/components/expenses/ExpenseCard.tsx
"use client";

import React, { useState } from "react";
import ExpenseLightbox from "./ExpenseLightbox";
import EditIcon from "@/icons/EditIcon";
import DeleteIcon from "@/icons/DeleteIcon";

import Link from "next/link";
import TagIcon from "@/icons/TagIcon";
import CalendarIcon from "@/icons/CalendarIcon";
import { Expense, useDeleteExpenseMutation } from "@/redux/api/expenseApi";
import { Modal } from "@/components/ui/modal";
import DeleteAlert from "@/components/shared/alerts/Delete";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatAmount = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(num);
};

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (id: string) => void; // Optional if you're using Link for edit
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteExpense(expense.id).unwrap();
      setIsDeleteModalOpen(false);
      // Optional: show success toast here
    } catch (error) {
      // Optional: show error toast
      console.error("Failed to delete expense:", error);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="max-w-sm py-2 px-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
        <div>
          <h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {expense.description}
          </h5>
        <div className="flex flex-col">
          <p className="mb-1 text-xs sm:text-sm text-gray-700 inline-flex items-center gap-1 dark:text-gray-400">
            <TagIcon className="w-4 h-4" />
            {expense.category?.name || "Uncategorized"}
          </p>

          <p className="mb-1 text-xs sm:text-sm text-gray-700 inline-flex items-center gap-1 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            {formatDate(expense.date)}
          </p>
        </div>


          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatAmount(expense.amount)}
          </p>

          {expense.billPhoto && (
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="mb-2 text-blue-600 hover:underline dark:text-blue-400 text-xs"
            >
              View Bill Photo/PDF →
            </button>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Link
            href={`/expense/${expense.id}`}
            className="p-2 text-blue-800 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Edit"
          >
            <EditIcon className="w-5 h-5" />
          </Link>

          <button
            onClick={handleDeleteClick}
            className="p-2 text-red-800 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Delete"
            disabled={isDeleting}
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox for bill photo/PDF */}
      <ExpenseLightbox
        open={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={expense.billPhoto}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <DeleteAlert
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Expense?"
          itemName={expense.description}
          confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
          cancelText="Cancel"
        />
      </Modal>
    </>
  );
}