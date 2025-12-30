// src/lib/redux/api/categoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Category = {
  id: string;
  name: string;
  description: string | null;
};

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/", // Next.js API routes
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // GET all categories
    getCategories: builder.query<Category[], void>({
      query: () => "api/category",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    // POST create new category
    createCategory: builder.mutation<
      Category,
      { name: string; description?: string }
    >({
      query: (body) => ({
        url: "api/category",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

// Exported hooks
export const { useGetCategoriesQuery, useCreateCategoryMutation } =
  categoryApi;