import Link from "next/link";
import { ArrowRight, FileText, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractStatusBadge } from "@/modules/contracts/components/status-badge";
import { formatBRLFromNumber, formatRelative } from "@/lib/format";
import { type ContractStatus } from "@/modules/contracts/public";
import { getCurrentMrr, listContracts } from "@/modules/contracts/queries";
import { getServerSupabase } from "@/lib/supabase/server";

interface LogWithContract {
  id: string;
  to_status: ContractStatus;
  from_status: ContractStatus | null;
  changed_at: string;
  contract_id: string;
  contract_client: string | null;
}

interface RawLogJoin {
  id: string;
  contract_id: string;
  from_status: ContractStatus | null;
  to_status: ContractStatus;
  changed_at: string;
  contract:
    | { client: { name: string } | { name: string }[] | null }
    | { client: { name: string } | { name: string }[] | null }[]
    | null;
}

async function getRecentTransitions(limit = 6): Promise<LogWithContract[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contract_status_log")
    .select(
      "id, contract_id, from_status, to_status, changed_at, contract:contract_id ( client:client_id ( name ) )",
    )
    .order("changed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as RawLogJoin[]).map((r) => {
    const contract = Array.isArray(r.contract) ? r.contract[0] : r.contract;
    const client = contract?.client;
    const clientName = client
      ? Array.isArray(client)
        ? (client[0]?.name ?? null)
        : client.name
      : null;
    return {
      id: r.id,
      contract_id: r.contract_id,
      from_status: r.from_status,
      to_status: r.to_status,
      changed_at: r.changed_at,
      contract_client: clientName,
    };
  });
}

export default async function HomePage() {
  const [mrr, latestContracts, transitions] = await Promise.all([
    getCurrentMrr(),
    listContracts({ status: ["active"] }),
    getRecentTransitions(),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Hoje"
        title="Estado da receita"
        description="Snapshot live, calculado direto dos contratos ativos."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="MRR atual"
          value={formatBRLFromNumber(mrr.mrr_cents)}
          hint="Soma dos contratos active"
        />
        <StatCard
          label="ARR (run-rate)"
          value={formatBRLFromNumber(mrr.mrr_cents * 12)}
          hint="MRR x 12, definicao a confirmar"
        />
        <StatCard
          label="Clientes ativos"
          value={mrr.active_clients.toString()}
          hint={`${mrr.active_contracts.toString()} contratos`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border-subtle)] px-5 py-4">
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Contratos ativos recentes
              </p>
              <h2 className="mt-1 text-sm font-medium text-[color:var(--color-fg)]">
                Top {Math.min(latestContracts.length, 5)} por criacao
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/contratos">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <CardContent className="px-0 py-0">
            {latestContracts.length === 0 ? (
              <div className="px-5 py-8 text-sm text-[color:var(--color-fg-subtle)]">
                Nenhum contrato ativo ainda.
              </div>
            ) : (
              <Table className="border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestContracts.slice(0, 5).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          href={`/contratos/${c.id}`}
                          className="hover:text-[color:var(--color-accent)]"
                        >
                          {c.client_name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatBRLFromNumber(c.mrr_cents)}
                      </TableCell>
                      <TableCell>
                        <ContractStatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-[color:var(--color-border-subtle)] px-5 py-4">
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Atividade
              </p>
              <h2 className="mt-1 text-sm font-medium text-[color:var(--color-fg)]">
                Ultimas mudancas de status
              </h2>
            </div>
          </div>
          <CardContent className="space-y-3 px-5 py-4">
            {transitions.length === 0 ? (
              <p className="text-sm text-[color:var(--color-fg-subtle)]">Sem atividade recente.</p>
            ) : (
              transitions.map((t) => (
                <Link
                  key={t.id}
                  href={`/contratos/${t.contract_id}`}
                  className="block rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-sm transition-colors hover:border-[color:var(--color-border)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[color:var(--color-fg)]">
                      {t.contract_client ?? "Contrato"}
                    </span>
                    <span className="text-[10px] tracking-[0.08em] text-[color:var(--color-fg-subtle)] uppercase">
                      {formatRelative(t.changed_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)]">
                    {t.from_status ? (
                      <ContractStatusBadge status={t.from_status} />
                    ) : (
                      <span className="text-[10px] tracking-[0.08em] uppercase">criado</span>
                    )}
                    <span className="text-[color:var(--color-fg-subtle)]">{"->"}</span>
                    <ContractStatusBadge status={t.to_status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <QuickLink
          href="/contratos/novo"
          icon={<FileText className="h-4 w-4" />}
          title="Criar contrato"
        />
        <QuickLink
          href="/clientes/novo"
          icon={<Users className="h-4 w-4" />}
          title="Criar cliente"
        />
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 px-5 py-5">
        <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
          {label}
        </p>
        <p className="font-[family-name:var(--font-serif)] text-3xl tracking-[var(--tracking-tight)] text-[color:var(--color-fg)]">
          {value}
        </p>
        <p className="text-xs text-[color:var(--color-fg-subtle)]">{hint}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface)] px-5 py-4 text-sm transition-colors hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-hover)]"
    >
      <span className="flex items-center gap-2 text-[color:var(--color-fg)]">
        {icon} {title}
      </span>
      <ArrowRight className="h-4 w-4 text-[color:var(--color-fg-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-fg)]" />
    </Link>
  );
}
