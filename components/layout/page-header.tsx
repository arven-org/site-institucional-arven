import * as React from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex items-start justify-between gap-6", className)}>
      <div className="min-w-0 flex-1 space-y-2">
        {eyebrow ? (
          <p className="text-[10px] tracking-[0.18em] text-[color:var(--color-fg-subtle)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-serif)] text-2xl leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[color:var(--color-fg)] md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-[color:var(--color-fg-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
