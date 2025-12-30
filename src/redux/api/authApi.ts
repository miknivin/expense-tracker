import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUser, setError, setLoading, setIsAuthenticated, logout } from "../slices/authSlice";

interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}

interface RegisterResponse {
  message: string;
  user: UserResponse;
}

interface MeResponse {
  success: boolean;
  user: UserResponse;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true));
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setIsAuthenticated(true));
        } catch (error: any) {
          dispatch(setError(error.error?.data?.error || "Login failed"));
          dispatch(setIsAuthenticated(false));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    register: builder.mutation<RegisterResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true));
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setIsAuthenticated(true));
        } catch (error: any) {
          dispatch(setError(error.error?.data?.error || "Registration failed"));
          dispatch(setIsAuthenticated(false));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true));
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
          dispatch(setIsAuthenticated(true));
        } catch (error: any) {
          dispatch(setError(error.error?.data?.message || "Failed to fetch user"));
          dispatch(setIsAuthenticated(false));
        } finally {
          dispatch(setLoading(false));
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logout());
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useLogoutMutation } = authApi;