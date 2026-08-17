import Link from "next/link";
import type { ContractRow } from "@/modules/contracts/queries";
import { ContractStatusBadge } from "@/modules/contracts/components/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatBRLFromNumber, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ContractsCompactTable({ contracts }: { contracts: ContractRow[] }) {
  if (contracts.length === 0) {
    return (
      <div className="px-5 py-6">
        <EmptyState
          title="Sem contratos"
          description="Nenhum contrato vinculado a este cliente ainda."
        />
      </div>
    );
  }
  return (
    <Table className="border-0">
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>MRR</TableHead>
          <TableHead>Inicio</TableHead>
          <TableHead>Fim</TableHead>
          <TableHead>Origem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <Link href={`/contratos/${c.id}`} className="hover:opacity-80">
                <ContractStatusBadge status={c.status} />
              </Link>
            </TableCell>
            <TableCell className="font-mono text-sm">{formatBRLFromNumber(c.mrr_cents)}</TableCell>
            <TableCell className="text-sm text-[color:var(--color-fg-muted)]">
              {formatDate(c.start_date)}
            </TableCell>
            <TableCell className="text-sm text-[color:var(--color-fg-muted)]">
              {c.end_date ? formatDate(c.end_date) : "indeterminado"}
            </TableCell>
            <TableCell className="text-xs tracking-[0.08em] text-[color:var(--color-fg-subtle)] uppercase">
              {c.source}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
