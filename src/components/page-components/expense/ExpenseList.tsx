// src/app/expense/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetExpensesQuery,
  GetExpensesParams,
  useDeleteExpenseMutation,
} from "@/redux/api/expenseApi";
import ViewToggle from "./ViewToggle";
import ExpenseCard from "./ExpenseCard";
import ExpenseTable from "./ExpenseTable";
import Link from "next/link";
import Drawer from "@/components/ui/drawer/ReusableDrawer";
import ExpenseFilterForm from "./ExpenseFilterForm";
import { Modal } from "@/components/ui/modal";
import DeleteAlert from "@/components/shared/alerts/Delete";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export default function ExpensesList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  // Read initial filters from URL on mount
  const getInitialFiltersFromURL = useCallback((): GetExpensesParams => {
    const params = new URLSearchParams(searchParams);
    return {
      page: params.get("page") ? Number(params.get("page")) : 1,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : 20,
      sortBy: (params.get("sortBy") as any) || "date",
      sortOrder: (params.get("sortOrder") as "asc" | "desc") || "desc",
      startDate: params.get("startDate") || undefined,
      endDate: params.get("endDate") || undefined,
      minAmount: params.get("minAmount") || undefined,
      maxAmount: params.get("maxAmount") || undefined,
      categoryId: params.get("categoryId") || undefined,
      search: params.get("search") || undefined,
      hasBillPhoto: (params.get("hasBillPhoto") as "" | "true" | "false" | undefined) || "",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<GetExpensesParams>(getInitialFiltersFromURL);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense(expenseToDelete).unwrap();
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
      // Success handled automatically via RTK Query cache invalidation
    } catch (err) {
      console.error("Failed to delete expense:", err);
      // Optional: show error toast here
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  };
  // Sync filters → URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (key === "page" && value === 1) return; // don't show page=1
        if (key === "pageSize" && value === 20) return; // hide default pageSize
        if (key === "sortBy" && value === "date") return;
        if (key === "sortOrder" && value === "desc") return;
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    router.replace(`/expense${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, router]);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetExpensesQuery(filters);

  const expenses = response?.expenses ?? [];
  const pagination = response?.pagination;
  const currentPageSize = filters.pageSize || 20;
  const handleEdit = (id: string) => console.log("Edit expense:", id);
  const handleDelete = (id: string) => console.log("Delete expense:", id);

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
    setIsFilterOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = filters.search?.trim();
    setFilters((prev) => ({
      ...prev,
      search: trimmed || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Page numbers logic
  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = pagination.page;
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1,
    }));
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      !["page", "pageSize", "sortBy", "sortOrder"].includes(key) &&
      filters[key as keyof GetExpensesParams]
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading expenses...</div>;
  }

  if (isError) {
    const errorMessage =
      error && "status" in error && error.status === 401
        ? "Unauthorized. Please log in again."
        : "Failed to load expenses. Please try again.";
    return <div className="p-8 text-center text-red-500">{errorMessage}</div>;
  }
const deletingExpense = expenses.find((e) => e.id === expenseToDelete);
  return (
    <div className="container mx-auto ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-3 h-full">
            <select
              id="pageSize"
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-9 px-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-brand-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 fill-gray-500 dark:fill-gray-400" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search expenses..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="h-9 w-full sm:w-96 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400"
              >
                <span>↵ Enter</span>
              </button>
            </div>
          </form>
        </div>
        <div className="flex w-full md:w-auto  items-center justify-between md:justify-end gap-3">
          <ViewToggle
            viewMode={viewMode}
            onToggle={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          />
          
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3"
          >
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
          </button>

   

          <Link
            href="/expense/add"
            className="inline-flex items-center justify-center gap-1 rounded-lg px-5 py-2.5 text-sm font-medium bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
          >
            Add Expense
          </Link>
        </div>
      </div>

      {/* Refetch indicator */}
      {isFetching && !isLoading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-gray-600">Updating...</div>
        </div>
      )}

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No expenses found matching your filters.
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} onEdit={handleEdit}  />
              ))}
            </div>
          ) : (
            <ExpenseTable expenses={expenses} onEdit={handleEdit} onDelete={handleDeleteClick} />
          )}
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-10">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Previous
              </button>
            </li>

            {pageNumbers.map((pageNum) => (
              <li key={pageNum}>
                <button
                  onClick={() => handlePageChange(pageNum)}
                  aria-current={pageNum === pagination.page ? "page" : undefined}
                  className={
                    pageNum === pagination.page
                      ? "flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      : "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  }
                >
                  {pageNum}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Expenses">
        <ExpenseFilterForm
          onApply={handleApplyFilters}
          onClose={() => setIsFilterOpen(false)}
          initialFilters={{
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            minAmount: filters.minAmount || "",
            maxAmount: filters.maxAmount || "",
            search: filters.search || "",
            categoryId: filters.categoryId as string || "",
            hasBillPhoto: filters.hasBillPhoto || "",
          }}
        />
      </Drawer>
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <DeleteAlert
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Delete Expense?"
          itemName={deletingExpense?.description}
          confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
          cancelText="Cancel"
        />
      </Modal>
    </div>
  );
}