/**
 * Extrai valor de FormData como string, descartando Files e nulls.
 * Use no client antes de mandar pra server action: garante que o payload
 * e JSON-serializable mesmo se o form tiver inputs misturados.
 */
export function getStringField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function getOptionalStringField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  return value.length > 0 ? value : null;
}
