/**
 * Fachada publica do modulo de clientes.
 * Queries (server-only) sao importadas direto de `@/modules/clients/queries`.
 */
export const MODULE_NAME = "clients" as const;

export { clientCreateSchema, clientUpdateSchema } from "@/modules/clients/schemas";
export type { ClientCreateValues, ClientUpdateValues } from "@/modules/clients/schemas";
export {
  createClient as createClientAction,
  updateClient as updateClientAction,
} from "@/modules/clients/actions";
export type { ActionResult } from "@/modules/clients/actions";
