import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ReduxProvider from '@/providers/ReduxProvider';
import AuthProvider from '@/providers/AuthRedirectProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ReduxProvider>
          <AuthProvider requiresAuth={true}>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
