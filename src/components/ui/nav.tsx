"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/veiculos", label: "Veículos",      icon: BarChart2 },
  { href: "/fluxo",   label: "Fluxo urbano",   icon: GitFork   },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 px-6 py-3 border-b bg-background">
      {/* Logo / título */}
      <span className="font-semibold text-sm mr-6 text-foreground tracking-tight">
        SP Urban Data
      </span>

      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}