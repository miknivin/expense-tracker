"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  // Dynamic class for main content margin based on sidebar state
  const router = useRouter();

  // Redirect to /signin if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, router]);


  if (!isAuthenticated) {
    return null; // or <div>Loading...</div> if you prefer a loader
  }
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      <AppSidebar />
      <Backdrop />
      {/* Header – assuming it may need client features too */}
      <AppHeader />
      {/* Page Content */}
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        {children}
      </div>
    </div>
  );
}