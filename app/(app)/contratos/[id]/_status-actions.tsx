"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canTransition,
  transitionContractStatusAction,
  type ContractStatus,
} from "@/modules/contracts/public";
import { useRouter } from "next/navigation";

const TRANSITIONS: {
  to: ContractStatus;
  label: string;
  variant: "primary" | "danger" | "secondary";
}[] = [
  { to: "active", label: "Ativar", variant: "primary" },
  { to: "ended", label: "Encerrar", variant: "secondary" },
  { to: "canceled", label: "Cancelar (churn)", variant: "danger" },
];

export function ContractStatusActions({ id, status }: { id: string; status: ContractStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState<ContractStatus | null>(null);

  function handle(to: ContractStatus) {
    setLast(to);
    startTransition(async () => {
      const result = await transitionContractStatusAction({ id, to });
      if (!result.ok) {
        toast.error(result.message ?? "Falha ao mudar status.");
        return;
      }
      toast.success(`Status alterado para ${to}.`);
      router.refresh();
    });
  }

  const available = TRANSITIONS.filter((t) => canTransition(status, t.to));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Acoes de status</CardTitle>
          <CardDescription>Trilha registrada automaticamente.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {available.length === 0 ? (
          <p className="text-sm text-[color:var(--color-fg-subtle)]">
            Estado terminal. Sem acoes manuais.
          </p>
        ) : (
          available.map((t) => (
            <Button
              key={t.to}
              variant={t.variant}
              className="w-full"
              disabled={pending && last === t.to}
              onClick={() => {
                handle(t.to);
              }}
            >
              {pending && last === t.to ? "Aplicando..." : t.label}
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
