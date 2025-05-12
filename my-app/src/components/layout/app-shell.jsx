
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, BookOpenText, BrainCircuit, Menu, MicVocal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/stress-detection", label: "Stress Detection", icon: HeartPulse },
  { href: "/journal", label: "Journal", icon: BookOpenText },
  { href: "/voice-clarity", label: "Voice Clarity", icon: MicVocal },
];

export function AppShell({ children }) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Daura Desk</h1>
        </Link>
      </div>
      <nav className="flex-grow px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50",
              pathname === item.href && "bg-accent text-primary font-medium"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Daura Desk
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        {sidebarContent}
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              {sidebarContent}
            </SheetContent>
          </Sheet>
           <Link href="/" className="flex items-center gap-2 md:hidden">
             <BrainCircuit className="h-7 w-7 text-primary" />
             <span className="text-xl font-semibold text-foreground">Daura Desk</span>
           </Link>
        </header>
        <main className="flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

