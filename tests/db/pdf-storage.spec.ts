/**
 * Integration: upload de PDF privado + signed URL contra Supabase Storage local.
 * Usa service-role (a unica via, por design).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { dbEnabled, makeServiceClient } from "./helpers";

const describeStorage = dbEnabled ? describe : describe.skip;

describeStorage("Storage contracts (PDF)", () => {
  const serviceClient = makeServiceClient();
  let clientId = "";
  let contractId = "";
  const path = `__test__/${Date.now().toString()}.pdf`;
  const buffer = Buffer.from("%PDF-1.4\n%fake test pdf bytes\n%%EOF\n", "utf-8");

  beforeAll(async () => {
    const { data: client } = await serviceClient
      .from("clients")
      .insert({ name: "Storage Test" })
      .select("id")
      .single();
    clientId = client!.id;
    const { data: contract } = await serviceClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 100000,
        start_date: "2026-01-01",
      })
      .select("id")
      .single();
    contractId = contract!.id;
  }, 30_000);

  afterAll(async () => {
    await serviceClient.storage.from("contracts").remove([path]);
    if (contractId) await serviceClient.from("contracts").delete().eq("id", contractId);
    if (clientId) await serviceClient.from("clients").delete().eq("id", clientId);
  });

  it("service-role faz upload no bucket privado", async () => {
    const { error } = await serviceClient.storage
      .from("contracts")
      .upload(path, buffer, { contentType: "application/pdf", upsert: true });
    expect(error).toBeNull();
  });

  it("gera signed URL e o download funciona", async () => {
    const { data, error } = await serviceClient.storage.from("contracts").createSignedUrl(path, 60);
    expect(error).toBeNull();
    expect(data?.signedUrl).toMatch(/^https?:\/\//);

    const res = await fetch(data!.signedUrl);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("%PDF-1.4");
  });

  it("authenticated SEM signed URL nao acessa direto", async () => {
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anon) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const auth = createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Sem policy, authenticated nao consegue listar/baixar
    const { data, error } = await auth.storage.from("contracts").list("__test__");
    // Pode retornar lista vazia (sem policy) ou erro; o que nao pode e ver o arquivo.
    if (error) {
      expect(error.message).toMatch(/permission|denied|policy|unauthorized/i);
    } else {
      expect(data.find((f) => path.endsWith(f.name))).toBeUndefined();
    }
  });
});
