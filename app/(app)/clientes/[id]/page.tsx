import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientStatusBadge } from "@/components/ui/status-badge";
import { NotFoundError } from "@/lib/errors";
import { formatDateLong } from "@/lib/format";
import { getClient } from "@/modules/clients/queries";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let client;
  try {
    client = await getClient(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cliente"
        title={client.name}
        {...(client.trade_name ? { description: client.trade_name } : {})}
        actions={
          <div className="flex items-center gap-3">
            <ClientStatusBadge status={client.status} />
            <Button asChild variant="secondary" size="sm">
              <Link href={`/clientes/${client.id}/editar`}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Identificacao</CardTitle>
              <CardDescription>Dados cadastrais.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Documento
              </p>
              <p className="mt-1 text-[color:var(--color-fg)]">{client.document ?? "-"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Cadastro
              </p>
              <p className="mt-1 text-[color:var(--color-fg)]">
                {formatDateLong(client.created_at)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Email
              </p>
              <p className="mt-1 text-[color:var(--color-fg)]">{client.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.12em] text-[color:var(--color-fg-subtle)] uppercase">
                Telefone
              </p>
              <p className="mt-1 text-[color:var(--color-fg)]">{client.phone ?? "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Observacoes</CardTitle>
              <CardDescription>Notas internas do time.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--color-fg)]">
            {client.notes ? (
              <p className="whitespace-pre-wrap">{client.notes}</p>
            ) : (
              <p className="text-[color:var(--color-fg-subtle)]">Sem observacoes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ContractsForClient clientId={client.id} />
    </div>
  );
}

import { listContractsByClient } from "@/modules/contracts/queries";
import { ContractsCompactTable } from "@/modules/contracts/components/contracts-compact-table";

async function ContractsForClient({ clientId }: { clientId: string }) {
  const contracts = await listContractsByClient(clientId);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Contratos deste cliente</CardTitle>
          <CardDescription>Historico completo, todos os estados.</CardDescription>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href={{ pathname: "/contratos/novo", query: { clientId } }}>Novo contrato</Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ContractsCompactTable contracts={contracts} />
      </CardContent>
    </Card>
  );
}
