/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import AutocompleteSelect from "@/components/shared/AutoCompleteSelect";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} from "@/redux/api/categoryApi";
import { useCreateExpenseMutation } from "@/redux/api/expenseApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const ExpenseForm: React.FC = () => {
  const router = useRouter();
  const [date, setDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();

  const [createCategory, { isLoading: creatingCategory }] =
    useCreateCategoryMutation();

  const [createExpense, { isLoading: creatingExpense }] =
    useCreateExpenseMutation();

  const categoryNames = categories.map((cat) => cat.name);


  // Local file preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      let billPhotoUrl: string | null = null;

      // If there's a bill file, upload directly to Cloudinary using signed upload
      if (billFile) {
        // Step 1: Get signed parameters from server
        const timestamp = Math.round(new Date().getTime() / 1000);

        const sigResponse = await fetch("/api/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp }),
        });

        if (!sigResponse.ok) {
          const err = await sigResponse.json();
          throw new Error(err.error || "Failed to get upload signature");
        }

        const { signature, cloudName, apiKey } = await sigResponse.json();

        // Step 2: Upload file directly to Cloudinary
        const formData = new FormData();
        formData.append("file", billFile);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", "expenses/bills");

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json();
          throw new Error(errData.error?.message || "Failed to upload file");
        }

        const uploadData = await uploadResponse.json();
        billPhotoUrl = uploadData.secure_url; // Final public URL
      }

      // Step 3: Save expense with the returned URL
      await createExpense({
        date,
        description,
        amount: parseFloat(amount) || 0,
        billPhoto: billPhotoUrl,
        categoryId: selectedCategoryId,
      }).unwrap();

      toast.success("Expense saved successfully!");

      // Reset form
      setDate("");
      setDescription("");
      setAmount("");
      setCategoryInput("");
      setSelectedCategoryId("");
      setBillFile(null);
      setPreviewUrl(null);
      router.push("/expense");
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    }
  };

  const isSubmitting = creatingCategory || creatingExpense;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Date */}
        <div className="sm:col-span-2">
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date <span className="text-error-500">*</span>
          </label>
          <Input
            type="date"
            id="date"
            className="native-picker"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            hint="When did this expense occur?"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-error-500">*</span>
          </label>
          <textarea
            className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            id="description"
            placeholder="Enter description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (₹) <span className="text-error-500">*</span>
          </label>
          <Input
            type="number"
            id="amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={0.01}
            min="0"
            required
            hint="Enter amount in rupees"
          />
        </div>

        {/* Category Autocomplete */}
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
          {categoriesError && (
            <p className="mt-1 text-xs text-error-500">Failed to load categories</p>
          )}
        </div>

        {/* Bill Upload - Drag & Drop + Camera */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bill Photo / Receipt (Optional)
          </label>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 bg-slate-200 border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium dark:bg-slate-700 dark:hover:bg-slate-700"
            >
              <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, PDF (up to 10MB)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Local Preview */}
          {previewUrl && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview:
              </p>
              <div className="relative w-full h-64 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-theme-xs">
                {billFile?.type === "application/pdf" ? (
                  <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Bill preview"
                    className="w-full h-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setBillFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white dark:bg-gray-800/80 dark:text-gray-300"
                  aria-label="Remove file"
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
            className="w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;