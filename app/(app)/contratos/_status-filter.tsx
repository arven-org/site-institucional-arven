"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/cn";
import type { ContractStatus } from "@/modules/contracts/public";

const OPTIONS: { value: ContractStatus | "all"; label: string }[] = [
  { value: "active", label: "Ativos" },
  { value: "draft", label: "Rascunhos" },
  { value: "ended", label: "Encerrados" },
  { value: "canceled", label: "Cancelados" },
  { value: "all", label: "Todos" },
];

export function ContractStatusFilter({ active }: { active: ContractStatus[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setStatus(value: ContractStatus | "all") {
    const next = new URLSearchParams(params.toString());
    if (value === "all") {
      next.set("status", "draft,active,ended,canceled");
    } else {
      next.set("status", value);
    }
    startTransition(() => {
      router.push(`/contratos?${next.toString()}`);
    });
  }

  function isActive(value: ContractStatus | "all"): boolean {
    if (value === "all") return active.length === 4;
    return active.length === 1 && active[0] === value;
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={pending}
          onClick={() => {
            setStatus(option.value);
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            isActive(option.value)
              ? "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg)] shadow-sm"
              : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
