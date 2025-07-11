export function toISOStringNoMillis(date: Date): string {
  return date.toISOString().split(".")[0] + "Z";
}

export function toLocalDatetimeString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function encodeDate(
  date: Date | string | undefined
): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return toISOStringNoMillis(d);
}
