import "server-only";

import { getServiceSupabase } from "@/lib/supabase/service";
import { log } from "@/lib/logger";

const BUCKET = "contracts";

/**
 * Upload de PDF pra Storage privado. Operacao privilegiada via service-role
 * (RLS de storage.objects nega tudo pra authenticated; a unica via e por aqui).
 */
export async function uploadContractPdf({
  clientId,
  contractId,
  file,
}: {
  clientId: string;
  contractId: string;
  file: { arrayBuffer: () => Promise<ArrayBuffer>; type: string; size: number };
}): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Apenas PDFs sao aceitos.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("PDF acima de 25MB.");
  }

  const path = `${clientId}/${contractId}.pdf`;
  const buffer = await file.arrayBuffer();

  const supabase = getServiceSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) {
    log.error("contract_pdf_upload_failed", { contractId, error: error.message });
    throw error;
  }
  return path;
}

/**
 * Gera URL assinada de curta duracao pra visualizar/baixar o PDF.
 * TTL padrao: 5 minutos. Servidor sempre gera; cliente nunca tem acesso direto.
 */
export async function createContractPdfSignedUrl(path: string, ttlSeconds = 300): Promise<string> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, ttlSeconds);
  if (error) {
    log.error("contract_pdf_signed_url_failed", { path, error: error.message });
    throw error;
  }
  return data.signedUrl;
}

export async function deleteContractPdf(path: string): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    log.error("contract_pdf_delete_failed", { path, error: error.message });
    throw error;
  }
}
