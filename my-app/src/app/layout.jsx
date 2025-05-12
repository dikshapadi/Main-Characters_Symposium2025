
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster";

const inter = Outfit({ subsets: ['latin'] });



export const metadata = {
  title: 'Daura Desk',
  description: 'Integrated assistive platform for accessibility and productivity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-full`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
