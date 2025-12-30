// app/expense/edit/[id]/page.tsx

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditExpenseForm from "@/components/page-components/expense/EditExpenseForm";

// Make the page async — this is REQUIRED for dynamic params in App Router
export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>; // params is a Promise!
}) {
  // Await the params to get the actual id
  const { id } = await params;

  console.log("Expense ID:", id); // Now correctly logs the real ID

  // Early return if somehow invalid (optional safety)
  if (!id) {
    return (
      <div className="p-8 text-center text-red-500">
        Invalid expense ID.
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Expense" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-2 dark:border-gray-800 dark:bg-white/3 xl:px-10 xl:py-3">
        <EditExpenseForm expenseId={id} />
      </div>
    </div>
  );
}