"use client";
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster";
import { ActivityProvider } from "@/context/activity-context";
import { usePathname } from 'next/navigation'; 

const inter = Outfit({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname(); 
  const isRootPage = pathname === '/'; 

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-full`}>
        <ActivityProvider>
          {isRootPage ? (
            children 
          ) : (
            <AppShell>{children}</AppShell> 
          )}
        </ActivityProvider>
        <Toaster />
      </body>
    </html>
  );
}
