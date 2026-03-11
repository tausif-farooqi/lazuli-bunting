"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bird, BarChart2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Predictions", icon: Bird },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/top-parks", label: "Top Parks", icon: Trophy },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row items-center gap-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href === "/stats" && pathname.startsWith("/stats")) ||
          (href === "/top-parks" && pathname.startsWith("/top-parks"));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-white/15 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 flex-none" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
