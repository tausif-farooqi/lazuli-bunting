"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bird, BarChart2, Trophy, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Predictions", icon: Bird },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/top-parks", label: "Top Parks", icon: Trophy },
  { href: "/live", label: "Live Sightings", icon: Radio },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href === "/stats" && pathname.startsWith("/stats")) ||
          (href === "/top-parks" && pathname.startsWith("/top-parks")) ||
          (href === "/live" && pathname.startsWith("/live"));

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
