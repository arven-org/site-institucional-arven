"use client";

import { useTransition } from "react";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: { email: string };
}

export function Header({ user }: HeaderProps) {
  const [, startTransition] = useTransition();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg)] px-6">
      <div className="text-xs text-[color:var(--color-fg-subtle)]">
        {/* breadcrumbs entram aqui em v2 */}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-fg)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40 focus-visible:outline-none">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-xs uppercase">
              {user.email[0]}
            </span>
            <span className="hidden md:inline">{user.email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sessao</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              <User className="h-4 w-4" /> {user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                startTransition(async () => {
                  await signOut();
                });
              }}
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
