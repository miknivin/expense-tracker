"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  HorizontaLDots,
  PlusIcon, // Make sure you have a PlusIcon in your icons folder
} from "../icons/index";

import RecieptIcon from "@/icons/RecieptIcon";
import PlusThickIcon from "@/icons/PlusThickIcon";
import TagIcon from "@/icons/TagIcon";

// Replace this with your actual Expenses icon (e.g., ReceiptIcon, DollarIcon, etc.)
// For now using CalenderIcon as placeholder – change it to the correct one

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  hasAddButton?: boolean; // Only true for Expenses
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <RecieptIcon />, // ← Your Expenses icon here
    name: "Expenses",
    path: "/expense",
    hasAddButton: true,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <HorizontaLDots />
            )}
          </h2>

          <ul className="flex flex-col gap-4">
            {navItems.map((item) => {
              const showTextAndButton = isExpanded || isHovered || isMobileOpen;

              return (
                <li key={item.name}>
                  <div
                    className={`menu-item group flex items-center  ${
                      isActive(item.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    } ${
                      !showTextAndButton
                        ? "lg:justify-center"
                        : "justify-between"
                    }
                     ${item.hasAddButton ? "border border-gray-200 dark:border-gray-700" : ""}
                    `
                   
                  }
                  >
                    {/* Left side: Icon + Text (link to main page) */}
                    <Link
                      href={item.path}
                      className="flex items-center flex-1 min-w-0"
                    >
                      <span
                        className={`${
                          isActive(item.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {showTextAndButton && (
                        <span className="menu-item-text truncate">
                          {item.name}
                        </span>
                      )}
                    </Link>

                    {/* Right side: + button only for Expenses */}
                    {item.hasAddButton && showTextAndButton && (
                      <Link
                        href="/expense/add"
                        className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition"
                        aria-label="Add new expense"
                      >
                        <PlusThickIcon/>
                      </Link>
                    )}
                    
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>


      </div>
    </aside>
  );
};

export default AppSidebar;