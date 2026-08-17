/* eslint-disable no-console -- arquivo oficial de logging. */

/**
 * Logger estruturado, JSON em prod, pretty em dev.
 * Sem dependencia externa. Se virar gargalo, troca por pino sem mudar API.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function emit(level: LogLevel, message: string, payload?: LogPayload): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...payload,
  };

  if (isProd) {
    const line = JSON.stringify(entry);
    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
    return;
  }

  const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
  if (level === "error") {
    console.error(prefix, message, payload ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, payload ?? "");
  } else {
    console.log(prefix, message, payload ?? "");
  }
}

export const log = {
  debug(message: string, payload?: LogPayload): void {
    emit("debug", message, payload);
  },
  info(message: string, payload?: LogPayload): void {
    emit("info", message, payload);
  },
  warn(message: string, payload?: LogPayload): void {
    emit("warn", message, payload);
  },
  error(message: string, payload?: LogPayload): void {
    emit("error", message, payload);
  },
};
