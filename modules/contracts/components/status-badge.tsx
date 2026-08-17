import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { ContractStatus } from "@/modules/contracts/states";

const LABELS: Record<ContractStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  ended: "Encerrado",
  canceled: "Cancelado",
};

const VARIANTS: Record<ContractStatus, BadgeProps["variant"]> = {
  draft: "draft",
  active: "active",
  ended: "ended",
  canceled: "canceled",
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
