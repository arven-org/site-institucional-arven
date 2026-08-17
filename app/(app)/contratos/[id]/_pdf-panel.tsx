"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, Upload, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPdfSignedUrl, removePdfAction, uploadPdfAction } from "@/modules/contracts/public";
import { useRouter } from "next/navigation";

export function PdfPanel({ contractId, hasPdf }: { contractId: string; hasPdf: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [opening, setOpening] = useState(false);

  function handleUpload() {
    inputRef.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("contractId", contractId);
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadPdfAction(formData);
      if (!result.ok) {
        toast.error(result.message ?? "Falha ao enviar PDF.");
        return;
      }
      toast.success("PDF anexado.");
      router.refresh();
    });
  }

  async function openPdf() {
    setOpening(true);
    try {
      const result = await getPdfSignedUrl({ contractId });
      if (!result.ok || !result.url) {
        toast.error(result.message ?? "Nao foi possivel gerar o link.");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } finally {
      setOpening(false);
    }
  }

  function remove() {
    startTransition(async () => {
      const result = await removePdfAction({ contractId });
      if (!result.ok) {
        toast.error(result.message ?? "Falha ao remover.");
        return;
      }
      toast.success("PDF removido.");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>PDF do contrato assinado</CardTitle>
          <CardDescription>
            Bucket privado. Acesso so via URL assinada de 5 minutos gerada no servidor.
          </CardDescription>
        </div>
        {hasPdf ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void openPdf();
              }}
              disabled={opening}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {opening ? "Gerando link..." : "Abrir PDF"}
            </Button>
            <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleUpload} disabled={pending}>
            <Upload className="h-3.5 w-3.5" /> {pending ? "Enviando..." : "Anexar PDF"}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </CardHeader>
      {!hasPdf ? (
        <CardContent className="flex items-center gap-3 text-sm text-[color:var(--color-fg-subtle)]">
          <FileText className="h-4 w-4" /> Nenhum PDF anexado.
        </CardContent>
      ) : null}
    </Card>
  );
}
