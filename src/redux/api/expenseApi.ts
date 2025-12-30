// src/lib/redux/api/expenseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Category = {
  id: string;
  name: string;
  description: string | null;
};

export type User = {
  id: string;
  name: string | null;
  email: string;
};

export type Expense = {
  id: string;
  date: string;
  description: string;
  amount: string;
  billPhoto: string | null;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  category: Category;
};

export type GetExpensesResponse = {
  expenses: Expense[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type GetExpensesParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  categoryId?: string | string[];
  search?: string;
  hasBillPhoto?: "true" | "false" | "";
  userId?: string;
};

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
  }),
  tagTypes: ["Expense", "DashboardStats"], // ← Added DashboardStats tag
  endpoints: (builder) => ({
    getExpenses: builder.query<GetExpensesResponse, GetExpensesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else {
              searchParams.append(key, String(value));
            }
          });
        }
        const queryString = searchParams.toString();
        return `api/expense${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.expenses.map(({ id }) => ({ type: "Expense" as const, id })),
              { type: "Expense", id: "LIST" },
            ]
          : [{ type: "Expense", id: "LIST" }],
    }),

    getExpenseById: builder.query<{ expense: Expense }, string>({
      query: (id) => `api/expense/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    createExpense: builder.mutation<
      Expense,
      {
        date: string;
        description: string;
        amount: number;
        billPhoto?: string | null;
        categoryId: string;
      }
    >({
      query: (body) => ({
        url: "api/expense",
        method: "POST",
        body,
      }),
      // Invalidate both expense list and dashboard stats
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        { type: "DashboardStats" }, // ← Triggers refetch of dashboard
      ],
    }),

    updateExpense: builder.mutation<
      Expense,
      {
        id: string;
        date: string;
        description: string;
        amount: number;
        billPhoto?: string | null;
        categoryId: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `api/expense/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
        { type: "DashboardStats" }, // ← Triggers refetch of dashboard
      ],
    }),

    deleteExpense: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `api/expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
        { type: "DashboardStats" }, // ← Triggers refetch of dashboard
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useGetExpenseByIdQuery,
  useDeleteExpenseMutation,
} = expenseApi;