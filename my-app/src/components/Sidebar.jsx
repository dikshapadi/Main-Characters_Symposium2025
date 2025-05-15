
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Mic, Volume2, Bot, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
  { href: "/work-automation", label: "Work automation", icon: Settings },
  { href: "/stress-detection", label: "Stress Detection", icon: Activity },
  { href: "/voice-clarity", label: "Voice Clarity", icon: Mic },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/ai-therapist", label: "AI Therapist", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full p-3"> {/* Changed h-screen to h-full */}
      <div className="bg-gradient-to-b from-sky-50/90 to-sky-100/80 dark:from-teal-800/30 dark:to-teal-900/40 backdrop-blur-md border border-sky-200/60 dark:border-teal-700/30 rounded-2xl shadow-lg h-full flex flex-col py-6 px-3">
        <div className="px-4 mb-6 text-center">
          <h2 className="text-2xl font-semibold text-sky-900 dark:text-teal-50">
            Daura Desk
          </h2>
          <p className="text-xs text-sky-700/80 dark:text-teal-200/70">
            Your voice-enabled companion
          </p>
        </div>
        <nav className="space-y-2 px-2 flex-grow overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sky-800 dark:text-teal-100 hover:bg-sky-200/70 dark:hover:bg-teal-700/30 transition-all duration-200",
                  isActive && "bg-sky-200/90 dark:bg-teal-600/40 shadow-sm font-medium"
                )}
              >
                <IconComponent className="h-[18px] w-[18px] text-sky-600 dark:text-teal-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto mx-3 p-4 bg-gradient-to-br from-sky-100 to-sky-200/90 dark:from-teal-800/50 dark:to-teal-700/30 rounded-xl border border-sky-200/70 dark:border-teal-600/30 shadow-sm">
          <HelpCircle className="h-6 w-6 text-sky-700 dark:text-teal-200 mx-auto mb-2"/>
          <p className="text-sm font-medium text-sky-900 dark:text-teal-100 text-center">
            Need help?
          </p>
          <p className="text-xs text-sky-700/90 dark:text-teal-200/80 mt-1 text-center">
            Check our documentation or contact support for assistance
          </p>
          <Button
            variant="default"
            className="mt-3 w-full py-2 px-3 bg-sky-600/90 hover:bg-sky-700 dark:bg-teal-600/80 dark:hover:bg-teal-500/90 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            View Help Center
          </Button>
        </div>
      </div>
    </aside>
  );
}
