// src/components/ui/breadcrumb/PageBreadcrumb.tsx (or wherever it's located)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const pathname = usePathname();

  // Split pathname and filter out empty segments
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Helper: Check if a segment looks like a UUID (e.g., 32 hex chars with optional hyphens)
  const isUuidLike = (segment: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return uuidRegex.test(segment);
  };

  // Helper: Shorten UUID to last 6 characters (without hyphens)
  const shortenUuid = (uuid: string): string => {
    return uuid.replace(/-/g, "").slice(-6);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          {/* Home */}
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              href="/"
            >
              Home
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>

          {/* Dynamic segments */}
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;

            // Format display text
            let displayText = segment
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            // If it's a UUID and not the first segment, shorten it
            if (isUuidLike(segment) && index > 0) {
              displayText = shortenUuid(segment);
            }

            return (
              <li
                key={href}
                className={`text-sm ${
                  isLast
                    ? "font-medium text-gray-800 dark:text-white/90"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isLast ? (
                  <span>{displayText}</span>
                ) : (
                  <Link
                    className="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300"
                    href={href}
                  >
                    {displayText}
                    <svg
                      className="stroke-current"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;