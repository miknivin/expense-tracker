// layout/ProtectedLayout.tsx  (or wherever you import it from)
'use client';


import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { SidebarProvider } from '@/context/SidebarContext';
import AdminLayout from '@/app/(admin)/layout';
import AuthLayout from '@/app/(full-width-pages)/(auth)/layout';
import { useGetMeQuery } from '@/redux/api/authApi';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, isError } = useGetMeQuery();
  const router = useRouter();
  const pathname = usePathname();

  // Optional: Redirect to login if trying to access a protected route while unauth
  // Skip redirect on public paths like /login, /register, /
  const isPublicPath = ['/signin', '/signup', '/'].includes(pathname);
  
  useEffect(() => {
    if (!isLoading && (isError || !data?.success) && !isPublicPath) {
      router.push('/signin');
    }
  }, [isLoading, isError, data, router, isPublicPath, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-xl">Checking authentication...</p>
      </div>
    );
  }

  const isAuthenticated = data?.success === true;

  // Authenticated → AdminLayout with SidebarProvider
  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AdminLayout>{children}</AdminLayout>
      </SidebarProvider>
    );
  }

  // Not authenticated → AuthLayout (no SidebarProvider)
  return <AuthLayout>{children}</AuthLayout>;
}