import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NotFoundError } from "@/lib/errors";
import { getClient } from "@/modules/clients/queries";
import { ClientForm } from "@/app/(app)/clientes/_client-form";

export const metadata = { title: "Editar cliente" };

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let client;
  try {
    client = await getClient(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <div>
      <PageHeader eyebrow="Cliente" title={`Editar ${client.name}`} />
      <ClientForm
        initial={{
          id: client.id,
          name: client.name,
          trade_name: client.trade_name,
          document: client.document,
          email: client.email,
          phone: client.phone,
          notes: client.notes,
        }}
      />
    </div>
  );
}
