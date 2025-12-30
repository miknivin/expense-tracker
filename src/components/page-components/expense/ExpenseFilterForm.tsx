// components/ExpenseFilterForm.tsx
import Input from '@/components/form/input/InputField';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import React, { useState } from 'react';

interface ExpenseFilterFormProps {
  onApply: (filters: Record<string, string>) => void;
  onClose: () => void;
  initialFilters?: Record<string, string>;
}

const ExpenseFilterForm: React.FC<ExpenseFilterFormProps> = ({
  onApply,
  onClose,
  initialFilters = {},
}) => {
  // Local state for form fields
  const [formData, setFormData] = useState({
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    minAmount: initialFilters.minAmount || '',
    maxAmount: initialFilters.maxAmount || '',
    search: initialFilters.search || '',
    categoryId: initialFilters.categoryId || '',
    hasBillPhoto: initialFilters.hasBillPhoto || '',
  });

  // Use RTK Query to fetch categories
  const {
    data: categories = [],
    isLoading: loadingCategories,
    isError,
  } = useGetCategoriesQuery(undefined);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build query object – only include non-empty values
    const query: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        query[key] = value;
      }
    });
    onApply(query);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: '',
      categoryId: '',
      hasBillPhoto: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            From Date
          </label>
          <Input
            type="date"
            className="native-picker"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            To Date
          </label>
          <Input
            type="date"
            className="native-picker"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Amount Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Min Amount (₹)
          </label>
          <Input
            type="number"
            name="minAmount"
            placeholder="0"
            value={formData.minAmount}
            onChange={handleChange}
            step={0.01}
            min="0"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Max Amount (₹)
          </label>
          <Input
            type="number"
            name="maxAmount"
            placeholder="100000"
            value={formData.maxAmount}
            onChange={handleChange}
            step={0.01}
            min="0"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Category
        </label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={loadingCategories || isError}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
        >
          <option value="">All Categories</option>
          {loadingCategories ? (
            <option>Loading...</option>
          ) : isError ? (
            <option>Error loading categories</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Search in Description */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Search Description
        </label>
        <Input
          type="text"
          name="search"
          placeholder="e.g., Enter description to search"
          value={formData.search}
          onChange={handleChange}
        />
      </div>

      {/* Has Bill Photo */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Bill Photo
        </label>
        <select
          name="hasBillPhoto"
          value={formData.hasBillPhoto}
          onChange={handleChange}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
        >
          <option value="">Any</option>
          <option value="true">With Photo</option>
          <option value="false">Without Photo</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          type="button"
          onClick={() => {
            handleReset();
            onApply({});
            onClose();
          }}
          className="px-4 py-2.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Clear All
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Apply Filters
          <svg
            className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 14 10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ExpenseFilterForm;