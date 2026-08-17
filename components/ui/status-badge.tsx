import { Badge } from "@/components/ui/badge";

export function ClientStatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <Badge variant={status === "active" ? "active" : "ended"}>
      {status === "active" ? "Ativo" : "Inativo"}
    </Badge>
  );
}
