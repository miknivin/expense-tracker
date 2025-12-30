// src/components/ecommerce/MonthlyLimitProgress.tsx (or wherever you place it)
"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";

import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { formatAmount } from "../expense/ExpenseTable";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MonthlyLimitProgressProps {
  currentMonthSpent: number | string; // Total spent this month (Decimal → string or number)
  monthlyLimit?: number; // Optional: default ₹1,00,000
}

export default function MonthlyLimitProgress({
  currentMonthSpent = 0,
  monthlyLimit = 100000, // ₹1 Lakh default
}: MonthlyLimitProgressProps) {
  // Convert to number safely
  const spentNum = typeof currentMonthSpent === "string" ? parseFloat(currentMonthSpent) : currentMonthSpent;
  const progress = Math.min((spentNum / monthlyLimit) * 100, 100); // Cap at 100%
  const isOverLimit = spentNum > monthlyLimit;
  const remaining = monthlyLimit - spentNum;

  const series = [progress];

  const options: ApexOptions = {
    colors: isOverLimit ? ["#ef4444"] : ["#465FFF"], // Red if over limit
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: isOverLimit ? "#ef4444" : "#1D2939",
            formatter: () => `${progress.toFixed(1)}%`,
          },
        },
      },
    },
    fill: { type: "solid" },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Limit
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Track spending against your ₹1 Lakh monthly limit
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem onItemClick={() => setIsOpen(false)}>
                View Details
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart options={options} series={series} type="radialBar" height={330} />
          </div>

          {/* Progress Badge */}
          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
              isOverLimit
                ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                : "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
            }`}
          >
            {isOverLimit ? `-${formatAmount(Math.abs(remaining))}` : `+${formatAmount(remaining)} left`}
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {isOverLimit
            ? `You've exceeded your monthly limit by ${formatAmount(Math.abs(remaining))}. Consider reviewing your expenses.`
            : `You've spent ${formatAmount(spentNum)} this month. Keep it up — you're under your ₹1 Lakh limit!`}
        </p>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Monthly Limit
          </p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ₹1,00,000
          </p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800" />
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Spent This Month
          </p>
          <p className={`text-base font-semibold sm:text-lg ${isOverLimit ? "text-error-600" : "text-gray-800 dark:text-white/90"}`}>
            {formatAmount(spentNum)}
          </p>
        </div>
      </div>
    </div>
  );
}