import * as React from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)]/30 px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {icon ? <div className="text-[color:var(--color-fg-subtle)]">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-[color:var(--color-fg)]">{title}</h3>
        {description ? (
          <p className="max-w-sm text-xs text-[color:var(--color-fg-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
