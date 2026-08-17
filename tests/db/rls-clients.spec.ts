/**
 * RLS de public.clients
 *  - select aberto pra authenticated
 *  - insert/update so admin+owner
 *  - delete nao tem policy: deny pra todos via authenticated
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createTestUser,
  dbEnabled,
  deleteUser,
  makeServiceClient,
  signInAs,
  uniqueEmail,
} from "./helpers";

const describeRls = dbEnabled ? describe : describe.skip;

describeRls("RLS clients", () => {
  const adminEmail = uniqueEmail("admin");
  const memberEmail = uniqueEmail("member");

  const serviceClient = makeServiceClient();
  let adminClient: Awaited<ReturnType<typeof signInAs>>;
  let memberClient: Awaited<ReturnType<typeof signInAs>>;
  let adminId = "";
  let memberId = "";
  let seededClientId = "";

  beforeAll(async () => {
    const adminAuth = await createTestUser(serviceClient, adminEmail, "admin");
    const memberAuth = await createTestUser(serviceClient, memberEmail, "member");
    adminId = adminAuth.id;
    memberId = memberAuth.id;

    adminClient = await signInAs(adminEmail, adminAuth.password);
    memberClient = await signInAs(memberEmail, memberAuth.password);

    // Seed via service-role pra ter pelo menos um cliente visivel.
    const { data, error } = await serviceClient
      .from("clients")
      .insert({ name: "Cliente Seed", document: `SEED-${Date.now().toString()}` })
      .select("id")
      .single();
    if (error) throw error;
    seededClientId = data.id;
  }, 30_000);

  afterAll(async () => {
    if (seededClientId) await serviceClient.from("clients").delete().eq("id", seededClientId);
    if (adminId) await deleteUser(serviceClient, adminId);
    if (memberId) await deleteUser(serviceClient, memberId);
  });

  it("admin LE clientes", async () => {
    const { data, error } = await adminClient.from("clients").select("id").limit(5);
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
  });

  it("member LE clientes", async () => {
    const { data, error } = await memberClient.from("clients").select("id").limit(5);
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
  });

  it("admin INSERE cliente", async () => {
    const { data, error } = await adminClient
      .from("clients")
      .insert({ name: "Inserido por admin" })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    if (data?.id) await serviceClient.from("clients").delete().eq("id", data.id);
  });

  it("member NAO insere", async () => {
    const { error } = await memberClient.from("clients").insert({ name: "Tentativa de member" });
    expect(error).not.toBeNull();
  });

  it("admin ATUALIZA cliente", async () => {
    const { error } = await adminClient
      .from("clients")
      .update({ notes: "atualizado por admin" })
      .eq("id", seededClientId);
    expect(error).toBeNull();
  });

  it("member NAO atualiza", async () => {
    const { error, data } = await memberClient
      .from("clients")
      .update({ notes: "tentativa de member" })
      .eq("id", seededClientId)
      .select();
    const touched = error === null ? data.length : 0;
    expect(touched).toBe(0);
  });

  it("admin NAO deleta (sem policy de delete)", async () => {
    const { error, data } = await adminClient
      .from("clients")
      .delete()
      .eq("id", seededClientId)
      .select();
    const deleted = error === null ? data.length : 0;
    expect(deleted).toBe(0);
  });
});
