/* eslint-disable @next/next/no-img-element */
// src/app/expense/edit/[id]/page.tsx  OR  components/expenses/EditExpenseForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import AutocompleteSelect from "@/components/shared/AutoCompleteSelect";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} from "@/redux/api/categoryApi";
import {
  useGetExpenseByIdQuery,
  useUpdateExpenseMutation,
} from "@/redux/api/expenseApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const formatDateForInput = (isoString: string) => {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

interface EditExpenseFormProps {
  expenseId: string;
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({ expenseId }) => {
  const router = useRouter();

  // Fetch expense data
  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
  } = useGetExpenseByIdQuery(expenseId);

  const expense = expenseData?.expense;

  // Form state
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingBillUrl, setExistingBillUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const [createCategory, { isLoading: creatingCategory }] = useCreateCategoryMutation();
  const [updateExpense, { isLoading: updatingExpense }] = useUpdateExpenseMutation();

  const categoryNames = categories.map((cat) => cat.name);

  // Prefill form when expense loads
  useEffect(() => {
    if (expense) {
      setDate(formatDateForInput(expense.date));
      setDescription(expense.description);
      setAmount(expense.amount);
      setExistingBillUrl(expense.billPhoto);

      const cat = categories.find((c) => c.id === expense.categoryId);
      if (cat) {
        setCategoryInput(cat.name);
        setSelectedCategoryId(cat.id);
      }
    }
  }, [expense, categories]);

  // File preview (new upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear existing URL if new file selected
      setExistingBillUrl(null);
    }
  };

  const handleCategorySelect = (selectedName: string) => {
    const category = categories.find((cat) => cat.name === selectedName);
    if (category) {
      setSelectedCategoryId(category.id);
      setCategoryInput(selectedName);
    }
  };

  const handleAddNewCategory = async () => {
    if (!categoryInput.trim()) return;
    try {
      const newCategory = await createCategory({
        name: categoryInput.trim().toUpperCase(),
        description: "",
      }).unwrap();
      setSelectedCategoryId(newCategory.id);
      setCategoryInput(newCategory.name);
    } catch (err) {
      setError("Failed to create new category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setError("Please select or create a category");
      return;
    }
    setError(null);

    try {
      let billPhotoUrl: string | null = existingBillUrl; // Keep old if no new upload

      if (billFile) {
        // Upload new bill photo to Cloudinary (same logic as create)
        const timestamp = Math.round(new Date().getTime() / 1000);
        const sigResponse = await fetch("/api/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp }),
        });

        if (!sigResponse.ok) throw new Error("Failed to get upload signature");

        const { signature, cloudName, apiKey } = await sigResponse.json();

        const formData = new FormData();
        formData.append("file", billFile);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", "expenses/bills");

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: "POST", body: formData }
        );

        if (!uploadResponse.ok) throw new Error("Upload failed");

        const uploadData = await uploadResponse.json();
        billPhotoUrl = uploadData.secure_url;
      }

      // Update expense
      await updateExpense({
        id: expenseId,
        date,
        description,
        amount: parseFloat(amount) || 0,
        billPhoto: billPhotoUrl,
        categoryId: selectedCategoryId,
      }).unwrap();

      toast.success("Expense updated successfully!");
      router.push("/expense");
    } catch (err: any) {
      setError(err.message || "Failed to update expense");
    }
  };

  const isSubmitting = creatingCategory || updatingExpense;

  // Loading state
  if (expenseLoading) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-gray-500">
        Loading expense...
      </div>
    );
  }

  // Error state
  if (expenseError || !expense) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-red-500">
        Failed to load expense. It may not exist or you don&rsquo;t have access.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">
        Edit Expense
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Same form fields as create, just prefilled */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date <span className="text-error-500">*</span>
          </label>
          <Input
            type="date"
            className="native-picker"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-error-500">*</span>
          </label>
          <textarea
            className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90"
            placeholder="Enter description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (₹) <span className="text-error-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={0.01}
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category <span className="text-error-500">*</span>
          </label>
          <AutocompleteSelect
            data={categoryNames}
            value={categoryInput}
            onChange={setCategoryInput}
            onSelect={handleCategorySelect}
            onNoMatchClick={handleAddNewCategory}
            isLoading={categoriesLoading || creatingCategory}
            customInputClass="h-11 rounded-lg border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Type to search or add new category
          </p>
        </div>

        {/* Bill Photo */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bill Photo / Receipt (Optional)
          </label>

          {/* Show existing bill if no new upload */}
          {existingBillUrl && !previewUrl && (
            <div className="mt-4">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Bill:
              </p>
              <div className="relative w-full h-64 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-theme-xs">
                <img
                  src={existingBillUrl}
                  alt="Current bill"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setExistingBillUrl(null)}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white"
                  aria-label="Remove current bill"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Upload new */}
          <div className="flex items-center justify-center w-full mt-4">
            <label
              htmlFor="dropzone-file-edit"
              className="flex flex-col items-center justify-center w-full h-64 bg-slate-200 border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium dark:bg-slate-700"
            >
              <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                <svg className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload new</span> or drag
                </p>
              </div>
              <input
                id="dropzone-file-edit"
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* New file preview */}
          {previewUrl && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                New Preview:
              </p>
              <div className="relative w-full h-64 rounded-lg border overflow-hidden shadow-theme-xs">
                <img src={previewUrl} alt="New bill" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setBillFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="sm:col-span-2">
          {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? "Updating..." : "Update Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpenseForm;