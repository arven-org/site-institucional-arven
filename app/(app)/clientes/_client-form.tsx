"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
import { createClientAction, updateClientAction } from "@/modules/clients/public";
import { getOptionalStringField, getStringField } from "@/lib/forms";

interface ClientFormProps {
  initial?: {
    id: string;
    name: string;
    trade_name: string | null;
    document: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
  /** Quando definido, modal/form inline retorna o id criado em vez de redirecionar. */
  onCreated?: (clientId: string, name: string) => void;
}

type FieldErrors = Record<string, string[]>;

export function ClientForm({ initial, onCreated }: ClientFormProps) {
  const router = useRouter();
  const initialId = initial?.id;
  const isEdit = Boolean(initialId);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErrors({});
    const payload = {
      name: getStringField(formData, "name"),
      trade_name: getOptionalStringField(formData, "trade_name"),
      document: getOptionalStringField(formData, "document"),
      email: getOptionalStringField(formData, "email"),
      phone: getOptionalStringField(formData, "phone"),
      notes: getOptionalStringField(formData, "notes"),
    };

    startTransition(async () => {
      const result = initialId
        ? await updateClientAction({ ...payload, id: initialId })
        : await createClientAction(payload);

      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.message ?? "Nao deu certo. Tente de novo.");
        return;
      }

      toast.success(isEdit ? "Cliente atualizado." : "Cliente criado.");
      const createdId = result.data?.id;
      if (onCreated && createdId) {
        onCreated(createdId, payload.name);
        return;
      }
      if (createdId) {
        router.push(`/clientes/${createdId}`);
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Dados do cliente</CardTitle>
          <CardDescription>
            Documento e identificador unico. Edicoes ficam no historico via updated_at.
          </CardDescription>
        </div>
      </CardHeader>
      <form action={onSubmit}>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field className="md:col-span-2">
            <Label htmlFor="name">Nome / Razao social</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial?.name ?? ""}
              required
              maxLength={255}
            />
            <FieldError>{errors.name?.[0]}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="trade_name">Nome fantasia</Label>
            <Input id="trade_name" name="trade_name" defaultValue={initial?.trade_name ?? ""} />
            <FieldError>{errors.trade_name?.[0]}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="document">Documento (CNPJ/CPF)</Label>
            <Input
              id="document"
              name="document"
              defaultValue={initial?.document ?? ""}
              placeholder="00.000.000/0000-00"
            />
            <FieldDescription>Unico no sistema. Bloqueia duplicidade.</FieldDescription>
            <FieldError>{errors.document?.[0]}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initial?.email ?? ""}
              placeholder="contato@empresa.com"
            />
            <FieldError>{errors.email?.[0]}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={initial?.phone ?? ""}
              placeholder="(11) 0000-0000"
            />
            <FieldError>{errors.phone?.[0]}</FieldError>
          </Field>

          <Field className="md:col-span-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" name="notes" defaultValue={initial?.notes ?? ""} rows={4} />
            <FieldError>{errors.notes?.[0]}</FieldError>
          </Field>
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" type="button">
            <Link href={initialId ? `/clientes/${initialId}` : "/clientes"}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : isEdit ? "Salvar alteracoes" : "Criar cliente"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
