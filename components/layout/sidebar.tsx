"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, FileText, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  disabled?: boolean;
}

const NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/metas", label: "Metas", icon: BarChart3, disabled: true },
  { href: "/alertas", label: "Alertas", icon: Bell, disabled: true },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg)] md:flex">
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          className="flex items-baseline gap-2 text-[color:var(--color-fg)] transition-opacity hover:opacity-80"
        >
          <span className="font-[family-name:var(--font-serif)] text-base tracking-[var(--tracking-tight)]">
            Arven
          </span>
          <span className="text-[10px] tracking-[0.18em] text-[color:var(--color-fg-subtle)] uppercase">
            Contratos
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          const disabled = item.disabled === true;
          const className = cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
            disabled
              ? "cursor-not-allowed text-[color:var(--color-fg-disabled)]"
              : active
                ? "bg-[color:var(--color-surface)] text-[color:var(--color-fg)]"
                : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-fg)]",
          );

          if (disabled) {
            return (
              <span key={item.href} className={className} aria-disabled="true" title="Em breve">
                <Icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto text-[10px] tracking-[0.12em] text-[color:var(--color-fg-disabled)] uppercase">
                  Em breve
                </span>
              </span>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3 text-[10px] tracking-[0.18em] text-[color:var(--color-fg-subtle)] uppercase">
        v0.1
      </div>
    </aside>
  );
}
