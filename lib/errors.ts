/**
 * Tipos de erro da aplicacao. Use estes ao inves de jogar string solta.
 * Erros conhecidos devem ser instancias destes; tudo o mais e bug.
 */

export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Nao autenticado.", options?: ErrorOptions) {
    super("auth/unauthenticated", message, options);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acao nao permitida.", options?: ErrorOptions) {
    super("auth/forbidden", message, options);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  readonly details: unknown;

  constructor(message: string, details?: unknown, options?: ErrorOptions) {
    super("validation/invalid", message, options);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, options?: ErrorOptions) {
    super("not-found", `${resource} nao encontrado.`, options);
    this.name = "NotFoundError";
  }
}
