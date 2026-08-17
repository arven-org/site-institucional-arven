import { APP_TIMEZONE } from "@/lib/dates/billing";

const dateShort = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateLong = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTimeShort = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function toDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;
  // YYYY-MM-DD do Postgres: parseia como UTC pra evitar slip de TZ
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T12:00:00Z`);
  }
  return new Date(input);
}

export function formatDate(input: string | Date | null | undefined): string {
  const d = toDate(input);
  return d ? dateShort.format(d) : "";
}

export function formatDateLong(input: string | Date | null | undefined): string {
  const d = toDate(input);
  return d ? dateLong.format(d) : "";
}

export function formatDateTime(input: string | Date | null | undefined): string {
  const d = toDate(input);
  return d ? dateTimeShort.format(d) : "";
}

const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "week", seconds: 604_800 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3_600 },
  { unit: "minute", seconds: 60 },
];

export function formatRelative(
  input: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  const d = toDate(input);
  if (!d) return "";
  const diffSeconds = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);
  for (const { unit, seconds } of UNITS) {
    if (abs >= seconds) {
      return relative.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return relative.format(diffSeconds, "second");
}
