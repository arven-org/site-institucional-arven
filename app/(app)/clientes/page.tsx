import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientStatusBadge } from "@/components/ui/status-badge";
import { listClients } from "@/modules/clients/queries";

export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        eyebrow="Diretorio"
        title="Clientes"
        description="Quem assina contratos com a Arven."
        actions={
          <Button asChild>
            <Link href="/clientes/novo">
              <Plus className="h-4 w-4" /> Novo cliente
            </Link>
          </Button>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Nenhum cliente cadastrado"
          description="Comece adicionando um cliente para depois vincular contratos."
          action={
            <Button asChild>
              <Link href="/clientes/novo">
                <Plus className="h-4 w-4" /> Novo cliente
              </Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clientes/${client.id}`}
                    className="font-medium text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
                  >
                    {client.name}
                  </Link>
                  {client.trade_name ? (
                    <span className="ml-2 text-xs text-[color:var(--color-fg-subtle)]">
                      {client.trade_name}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm text-[color:var(--color-fg-muted)]">
                  {client.document ?? "-"}
                </TableCell>
                <TableCell className="text-sm text-[color:var(--color-fg-muted)]">
                  {client.email ?? client.phone ?? "-"}
                </TableCell>
                <TableCell>
                  <ClientStatusBadge status={client.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
