"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uuidSchema } from "@/lib/validation/zod-helpers";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import {
  createContractPdfSignedUrl,
  deleteContractPdf,
  uploadContractPdf,
} from "@/modules/contracts/server/storage";

export interface PdfActionResult {
  ok: boolean;
  message?: string;
  url?: string;
}

export async function uploadPdfAction(formData: FormData): Promise<PdfActionResult> {
  await requireUser();
  const contractId = uuidSchema.safeParse(formData.get("contractId"));
  const file = formData.get("file");
  if (!contractId.success || !(file instanceof File)) {
    return { ok: false, message: "Arquivo ou contrato invalido." };
  }

  const supabase = await getServerSupabase();
  const { data: contract, error: readErr } = await supabase
    .from("contracts")
    .select("client_id")
    .eq("id", contractId.data)
    .single();
  if (readErr) {
    return { ok: false, message: "Contrato nao encontrado." };
  }

  try {
    const path = await uploadContractPdf({
      clientId: contract.client_id,
      contractId: contractId.data,
      file,
    });
    const { error: upErr } = await supabase
      .from("contracts")
      .update({ pdf_path: path })
      .eq("id", contractId.data);
    if (upErr) return { ok: false, message: upErr.message };

    revalidatePath(`/contratos/${contractId.data}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Falha no upload." };
  }
}

export async function getPdfSignedUrl(input: unknown): Promise<PdfActionResult> {
  await requireUser();
  const parsed = z.object({ contractId: uuidSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Entrada invalida." };

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contracts")
    .select("pdf_path")
    .eq("id", parsed.data.contractId)
    .single();
  if (error || !data.pdf_path) {
    return { ok: false, message: "Este contrato nao tem PDF anexado." };
  }

  try {
    const url = await createContractPdfSignedUrl(data.pdf_path);
    return { ok: true, url };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Falha ao gerar URL." };
  }
}

export async function removePdfAction(input: unknown): Promise<PdfActionResult> {
  await requireUser();
  const parsed = z.object({ contractId: uuidSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Entrada invalida." };

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contracts")
    .select("pdf_path")
    .eq("id", parsed.data.contractId)
    .single();
  if (error || !data.pdf_path) return { ok: false, message: "Nao ha PDF pra remover." };

  try {
    await deleteContractPdf(data.pdf_path);
    const { error: upErr } = await supabase
      .from("contracts")
      .update({ pdf_path: null })
      .eq("id", parsed.data.contractId);
    if (upErr) return { ok: false, message: upErr.message };

    revalidatePath(`/contratos/${parsed.data.contractId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Falha ao remover." };
  }
}
