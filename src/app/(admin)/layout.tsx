import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import MainContentWrapper from "@/layout/MainContentWrapper"; // New wrapper
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Optional debug log (can remove in production)
  console.log("admin side layout");

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop – these can stay as-is (likely client if they have interactivity) */}
      

      {/* Main content now wrapped in client component for dynamic margin */}
      <MainContentWrapper>{children}</MainContentWrapper>
    </div>
  );
}