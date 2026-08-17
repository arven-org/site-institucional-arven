import { PageHeader } from "@/components/layout/page-header";
import { listClientOptions } from "@/modules/clients/queries";
import { ContractForm } from "@/app/(app)/contratos/_contract-form";

export const metadata = { title: "Novo contrato" };

export default async function NovoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await listClientOptions();

  return (
    <div>
      <PageHeader eyebrow="Receita" title="Novo contrato" />
      <ContractForm clients={clients} {...(clientId ? { defaultClientId: clientId } : {})} />
    </div>
  );
}
