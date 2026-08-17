"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)] text-[color:var(--color-fg)] shadow-xl",
          description: "text-[color:var(--color-fg-muted)]",
          actionButton: "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
          cancelButton: "bg-[color:var(--color-surface)] text-[color:var(--color-fg-muted)]",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
