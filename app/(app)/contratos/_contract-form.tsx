"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createContractAction,
  updateContractAction,
  type ContractStatus,
} from "@/modules/contracts/public";
import type { ClientOption } from "@/modules/clients/queries";
import { ClientForm } from "@/app/(app)/clientes/_client-form";
import { getOptionalStringField, getStringField } from "@/lib/forms";

interface ContractFormProps {
  clients: ClientOption[];
  defaultClientId?: string;
  initial?: {
    id: string;
    client_id: string;
    status: ContractStatus;
    mrr_cents: number;
    start_date: string;
    end_date: string | null;
    source: "manual" | "google_form" | "migration";
    source_ref: string | null;
    renewal_of: string | null;
  };
}

type FieldErrors = Record<string, string[]>;

function centsToReaisDisplay(cents: number): string {
  const whole = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, "0");
  return `${whole.toLocaleString("pt-BR")},${frac}`;
}

export function ContractForm({ clients, defaultClientId, initial }: ContractFormProps) {
  const router = useRouter();
  const initialId = initial?.id;
  const isEdit = Boolean(initialId);

  const [clientId, setClientId] = useState(initial?.client_id ?? defaultClientId ?? "");
  const [status, setStatus] = useState<ContractStatus>(initial?.status ?? "active");
  const [source, setSource] = useState<"manual" | "google_form" | "migration">(
    initial?.source ?? "manual",
  );
  const [clientList, setClientList] = useState(clients);
  const [newClientOpen, setNewClientOpen] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function handleClientCreated(id: string, name: string) {
    setClientList((prev) =>
      [...prev, { id, name, trade_name: null }].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setClientId(id);
    setNewClientOpen(false);
    toast.success(`Cliente ${name} criado e selecionado.`);
  }

  function onSubmit(formData: FormData) {
    setErrors({});
    const payload = {
      client_id: clientId,
      mrr_reais: getStringField(formData, "mrr_reais"),
      start_date: getStringField(formData, "start_date"),
      end_date: getOptionalStringField(formData, "end_date"),
      status,
      source,
      source_ref: getOptionalStringField(formData, "source_ref"),
      renewal_of: getOptionalStringField(formData, "renewal_of"),
    };

    startTransition(async () => {
      const result = initialId
        ? await updateContractAction({ ...payload, id: initialId })
        : await createContractAction(payload);

      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.message ?? "Nao deu certo.");
        return;
      }

      toast.success(isEdit ? "Contrato atualizado." : "Contrato criado.");
      const createdId = result.data?.id;
      if (createdId) {
        router.push(`/contratos/${createdId}`);
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>A quem este contrato pertence.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <Field>
            <Label htmlFor="client_id">Cliente</Label>
            <Select value={clientId} onValueChange={setClientId} disabled={isEdit}>
              <SelectTrigger id="client_id" className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.trade_name ? (
                      <span className="ml-1 text-[color:var(--color-fg-subtle)]">
                        ({c.trade_name})
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.client_id?.[0]}</FieldError>
          </Field>
          {!isEdit ? (
            <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                  <Plus className="h-4 w-4" /> Novo cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar cliente</DialogTitle>
                  <DialogDescription>Sai daqui ja selecionado no contrato.</DialogDescription>
                </DialogHeader>
                <ClientForm onCreated={handleClientCreated} />
              </DialogContent>
            </Dialog>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>O MRR e a fonte da verdade do faturamento mensal.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field>
            <Label htmlFor="mrr_reais">MRR (R$)</Label>
            <Input
              id="mrr_reais"
              name="mrr_reais"
              required
              defaultValue={initial ? centsToReaisDisplay(initial.mrr_cents) : ""}
              placeholder="3.500,00"
            />
            <FieldDescription>
              Formato brasileiro com virgula. Armazenado em centavos.
            </FieldDescription>
            <FieldError>{errors.mrr_reais?.[0]}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="status">Status inicial</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as ContractStatus);
              }}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                {isEdit ? <SelectItem value="ended">Encerrado</SelectItem> : null}
                {isEdit ? <SelectItem value="canceled">Cancelado</SelectItem> : null}
              </SelectContent>
            </Select>
            <FieldDescription>
              Manual nasce ativo por padrao. Draft fica na fila de aprovacao.
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Vigencia</CardTitle>
            <CardDescription>Datas de inicio e fim. Fim em branco = indeterminado.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field>
            <Label htmlFor="start_date">Inicio</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={initial?.start_date ?? ""}
              required
            />
            <FieldError>{errors.start_date?.[0]}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="end_date">Fim previsto</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={initial?.end_date ?? ""}
            />
            <FieldError>{errors.end_date?.[0]}</FieldError>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Origem e metadados</CardTitle>
            <CardDescription>De onde veio e a quem se vincula.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field>
            <Label htmlFor="source">Origem</Label>
            <Select
              value={source}
              onValueChange={(v) => {
                setSource(v as "manual" | "google_form" | "migration");
              }}
              disabled={isEdit}
            >
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="google_form">Google Form</SelectItem>
                <SelectItem value="migration">Migracao</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <Label htmlFor="source_ref">Referencia externa</Label>
            <Input
              id="source_ref"
              name="source_ref"
              defaultValue={initial?.source_ref ?? ""}
              placeholder="ID do form, codigo de planilha..."
            />
          </Field>
          <Field className="md:col-span-2">
            <Label htmlFor="renewal_of">Renovacao de</Label>
            <Input
              id="renewal_of"
              name="renewal_of"
              defaultValue={initial?.renewal_of ?? ""}
              placeholder="UUID do contrato anterior, se for renovacao"
            />
            <FieldDescription>Vincula este contrato como sucessor de outro.</FieldDescription>
            <FieldError>{errors.renewal_of?.[0]}</FieldError>
          </Field>
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" type="button">
            <Link href="/contratos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pending || !clientId}>
            {pending ? "Salvando..." : isEdit ? "Salvar alteracoes" : "Criar contrato"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
