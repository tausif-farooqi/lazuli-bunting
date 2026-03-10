"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bird, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Predictions", icon: Bird },
  { href: "/stats", label: "Stats Dashboard", icon: BarChart2 },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-20 border-b border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-1 py-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === href || (href === "/stats" && pathname.startsWith("/stats"))
                  ? "bg-white/15 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
