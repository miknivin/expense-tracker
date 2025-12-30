// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticatedUser } from "@/lib/middleware/auth";
import { Prisma } from "@/lib/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Still authenticate — keep security (only logged-in users can access stats)
    const user = await isAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Restrict to admins only (uncomment if needed)
    // if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Define the cutoff: one year ago from today
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 2. Fetch total stats (all users, all time)
    const [totalExpensesResult, totalAmountResult] = await Promise.all([
      prisma.expense.count(), // No where clause → all expenses
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
    ]);

    // 3. Monthly breakdown — global (all users), last 12 months
    const monthlyRaw = await prisma.$queryRaw<
      Array<{
        year: number;
        month: number;
        count: bigint;
        total_amount: Prisma.Decimal | null;
      }>
    >`
      SELECT 
        EXTRACT(YEAR FROM date) AS year,
        EXTRACT(MONTH FROM date) AS month,
        COUNT(id) AS count,
        SUM(amount) AS total_amount
      FROM "expenses"
      WHERE date >= ${oneYearAgo}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
      ORDER BY year DESC, month DESC
    `;

    // 4. Format monthly data
    const monthlyWise = monthlyRaw.map((row) => {
      const year = Number(row.year);
      const month = Number(row.month);
      const date = new Date(year, month - 1);

      return {
        year,
        month,
        monthName: date.toLocaleString("en-US", { month: "short" }),
        yearMonth: `${year}-${month.toString().padStart(2, "0")}`,
        count: Number(row.count),
        totalAmount: row.total_amount ? row.total_amount.toString() : "0",
      };
    });

    // 5. Final response
    const stats = {
      totalExpenses: totalExpensesResult,
      totalAmount: totalAmountResult._sum.amount?.toString() || "0",
      monthlyExpenses: monthlyWise,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching global dashboard stats:", error);

    if (error.message?.includes("login") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}