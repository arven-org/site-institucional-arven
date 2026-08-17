/**
 * Fachada publica do modulo de contratos.
 *
 * IMPORTANTE: este barrel so exporta o que e seguro pra cliente E servidor.
 * Queries (com import "server-only") sao importadas diretamente de
 * `@/modules/contracts/queries` pelas paginas Server Component.
 */
export const MODULE_NAME = "contracts" as const;

export {
  CONTRACT_STATUSES,
  MRR_COUNTING_STATUSES,
  canTransition,
  assertTransition,
  type ContractStatus,
} from "@/modules/contracts/states";

export {
  contractCreateSchema,
  contractUpdateSchema,
  contractTransitionSchema,
} from "@/modules/contracts/schemas";
export type {
  ContractCreateInput,
  ContractCreateValues,
  ContractUpdateValues,
  ContractTransitionInput,
} from "@/modules/contracts/schemas";

export {
  createContract as createContractAction,
  updateContract as updateContractAction,
  transitionContractStatus as transitionContractStatusAction,
} from "@/modules/contracts/actions";

export { uploadPdfAction, getPdfSignedUrl, removePdfAction } from "@/modules/contracts/pdf-actions";
