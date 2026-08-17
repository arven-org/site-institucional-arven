import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NotFoundError } from "@/lib/errors";
import { getContract } from "@/modules/contracts/queries";
import { listClientOptions } from "@/modules/clients/queries";
import { ContractForm } from "@/app/(app)/contratos/_contract-form";

export const metadata = { title: "Editar contrato" };

export default async function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract;
  try {
    contract = await getContract(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const clients = await listClientOptions();

  return (
    <div>
      <PageHeader eyebrow="Contrato" title={`Editar contrato de ${contract.client_name}`} />
      <ContractForm
        clients={clients}
        initial={{
          id: contract.id,
          client_id: contract.client_id,
          status: contract.status,
          mrr_cents: contract.mrr_cents,
          start_date: contract.start_date,
          end_date: contract.end_date,
          source: contract.source,
          source_ref: contract.source_ref,
          renewal_of: contract.renewal_of,
        }}
      />
    </div>
  );
}
