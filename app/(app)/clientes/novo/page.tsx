import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/app/(app)/clientes/_client-form";

export const metadata = { title: "Novo cliente" };

export default function NovoClientePage() {
  return (
    <div>
      <PageHeader eyebrow="Diretorio" title="Novo cliente" />
      <ClientForm />
    </div>
  );
}
