
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";

export function AppShell({ children }) {
  const pathname = usePathname();
  const [yearForCopyright, setYearForCopyright] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState('light'); // Default to light

  useEffect(() => {
    setIsClient(true);
    setYearForCopyright(new Date().getFullYear());

    // Theme initialization
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const AppLogo = () => (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-ai-hint="abstract logo">
        <path d="M19.9721 10.1321C19.9721 10.132 19.9721 10.132 19.9721 10.1319C19.9721 6.57405 17.0839 3.68118 13.5334 3.68118C10.5583 3.68118 8.04212 5.76252 7.33488 8.51284C7.09352 8.46978 6.844 8.44743 6.59 8.44743C4.38223 8.44743 2.59 10.2397 2.59 12.4474C2.59 14.6552 4.38223 16.4474 6.59 16.4474H6.90878C7.18386 19.3475 9.64125 21.6812 12.6334 21.6812C15.6256 21.6812 18.083 19.3475 18.358 16.4474H19.1501C21.090 16.4474 22.6667 14.8708 22.6667 12.9308C22.6667 11.1376 21.3716 9.6448 19.6709 9.43496C19.8827 9.6566 19.9721 9.98393 19.9721 10.1321Z" fill="currentColor"></path>
      </svg>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <header className="border-b border-border h-16 px-4 flex items-center justify-between sticky top-0 z-30 bg-card text-card-foreground col-span-full">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-auto border-r-0" 
            >
               <Sidebar />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <AppLogo />
            <span>Daura Desk</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <p className="mr-2 text-sm text-muted-foreground hidden md:block">
            Welcome, Alex Morgan
          </p>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" className="rounded-full" onClick={toggleTheme}>
            {isClient && theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground">AM</AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      <div className="hidden md:block sticky top-16 h-[calc(100vh-4rem)] z-20">
        <Sidebar />
      </div>

      <div className="flex flex-col">
        <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto bg-background">
          {children}
        </main>
        <footer className="p-4 border-t text-center text-xs text-muted-foreground bg-card">
            {isClient && yearForCopyright !== null ? `© ${yearForCopyright} Daura Desk` : `© Daura Desk`}
        </footer>
      </div>
    </div>
  );
}
