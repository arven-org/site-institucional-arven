import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractStatusBadge } from "@/modules/contracts/components/status-badge";
import { formatBRLFromNumber, formatDate } from "@/lib/format";
import { type ContractStatus } from "@/modules/contracts/public";
import { listContracts } from "@/modules/contracts/queries";
import { ContractStatusFilter } from "./_status-filter";

export const metadata = { title: "Contratos" };

const ALL_STATUSES: ContractStatus[] = ["draft", "active", "ended", "canceled"];

function parseStatusFilter(value: string | string[] | undefined): ContractStatus[] {
  if (!value) return ["active"];
  const raw = Array.isArray(value) ? value : value.split(",");
  const valid = raw.filter((v): v is ContractStatus =>
    (ALL_STATUSES as readonly string[]).includes(v),
  );
  return valid.length > 0 ? valid : ["active"];
}

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const params = await searchParams;
  const statuses = parseStatusFilter(params.status);
  const contracts = await listContracts({ status: statuses });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Receita"
        title="Contratos"
        description="Fonte da verdade do MRR. Cada linha aqui conta na conta."
        actions={
          <Button asChild>
            <Link href="/contratos/novo">
              <Plus className="h-4 w-4" /> Novo contrato
            </Link>
          </Button>
        }
      />

      <ContractStatusFilter active={statuses} />

      {contracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Sem contratos neste filtro"
          description="Mude os filtros acima ou crie um contrato novo."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/contratos/${c.id}`}
                    className="font-medium text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
                  >
                    {c.client_name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatBRLFromNumber(c.mrr_cents)}
                </TableCell>
                <TableCell className="text-sm text-[color:var(--color-fg-muted)]">
                  {formatDate(c.start_date)}
                  <span className="mx-1.5 text-[color:var(--color-fg-subtle)]">a</span>
                  {c.end_date ? formatDate(c.end_date) : "indeterminado"}
                </TableCell>
                <TableCell>
                  <ContractStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-xs tracking-[0.08em] text-[color:var(--color-fg-subtle)] uppercase">
                  {c.source}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
