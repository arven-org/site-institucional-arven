import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatusBadge } from "@/modules/contracts/components/status-badge";
import { NotFoundError } from "@/lib/errors";
import { formatBRLFromNumber, formatDate, formatDateTime } from "@/lib/format";
import { getContract, getContractStatusHistory } from "@/modules/contracts/queries";
import { ContractStatusActions } from "./_status-actions";
import { PdfPanel } from "./_pdf-panel";

export default async function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract;
  try {
    contract = await getContract(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const history = await getContractStatusHistory(id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Contrato"
        title={contract.client_name || "Contrato"}
        description={`Vigencia ${formatDate(contract.start_date)} ${contract.end_date ? `a ${formatDate(contract.end_date)}` : "indeterminada"}.`}
        actions={
          <div className="flex items-center gap-3">
            <ContractStatusBadge status={contract.status} />
            <Button asChild variant="secondary" size="sm">
              <Link href={`/contratos/${contract.id}/editar`}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Resumo financeiro</CardTitle>
              <CardDescription>
                Cliente:{" "}
                <Link
                  href={`/clientes/${contract.client_id}`}
                  className="text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
                >
                  {contract.client_name}
                </Link>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <KV label="MRR" value={formatBRLFromNumber(contract.mrr_cents)} mono />
            <KV label="ARR (run-rate)" value={formatBRLFromNumber(contract.mrr_cents * 12)} mono />
            <KV label="Inicio" value={formatDate(contract.start_date)} />
            <KV
              label="Fim"
              value={contract.end_date ? formatDate(contract.end_date) : "indeterminado"}
            />
            <KV
              label="Cancelado em"
              value={contract.canceled_at ? formatDate(contract.canceled_at) : "-"}
            />
            <KV
              label="Encerrado em"
              value={contract.ended_at ? formatDate(contract.ended_at) : "-"}
            />
            <KV label="Origem" value={contract.source} />
            <KV label="Renovacao de" value={contract.renewal_of ?? "-"} mono />
          </CardContent>
        </Card>

        <ContractStatusActions id={contract.id} status={contract.status} />
      </div>

      <PdfPanel contractId={contract.id} hasPdf={Boolean(contract.pdf_path)} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historico de status</CardTitle>
            <CardDescription>Trilha imutavel gravada pelo trigger no banco.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-[color:var(--color-fg-subtle)]">Sem mudancas registradas.</p>
          ) : (
            <ol className="space-y-3">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center gap-4 rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-[color:var(--color-fg-muted)]">
                    {h.from_status ? (
                      <ContractStatusBadge status={h.from_status} />
                    ) : (
                      <span className="text-xs tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                        criado
                      </span>
                    )}
                    <span className="text-[color:var(--color-fg-subtle)]">{"->"}</span>
                    <ContractStatusBadge status={h.to_status} />
                  </div>
                  <span className="ml-auto text-xs text-[color:var(--color-fg-subtle)]">
                    {formatDateTime(h.changed_at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
        {label}
      </p>
      <p className={`mt-1 text-[color:var(--color-fg)] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
