"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useGetMeQuery } from "@/redux/api/authApi";
import FullLoadingScreen from "@/components/loaders/FullScreenPrimaryLoader";
import { RootState } from "@/redux/store";

interface AuthProviderProps {
  children: React.ReactNode;
  requiresAuth?: boolean; // If true, redirect to /signin if not authenticated
}

export default function AuthProvider({ children, requiresAuth = false }: AuthProviderProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useGetMeQuery();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (pathname === "/signin" || pathname === "/signup")) {
        router.push("/");
      } else if (requiresAuth && !isAuthenticated && pathname !== "/signin" && pathname !== "/signup") {
        router.push("/signin");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, requiresAuth]);

  if (isLoading ) {
    return <div><FullLoadingScreen/></div>;
  }

  return <>{children}</>;
}