// src/components/nav.tsx
"use client";
// "use client" é necessário porque usamos usePathname,
// que lê a URL atual — isso só existe no browser, não no servidor

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// cn() é um utilitário do shadcn que combina classes Tailwind
// de forma condicional sem conflitos

const links = [
  { href: "/veiculos", label: "Veículos" },
  { href: "/fluxo", label: "Fluxo" },
];

export function Nav() {
  const pathname = usePathname();
  // pathname retorna a rota atual, ex: "/veiculos"
  // usamos isso para destacar o link ativo

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Logo / nome do projeto */}
        <span className="font-semibold tracking-tight text-sm">
          SP Urban Data
        </span>

        {/* Links de navegação */}
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                // classes base — sempre aplicadas
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                // classe condicional — só se a rota bater
                pathname === link.href
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}