const REDACTED = "[REDACTED]";

export function validateOAuthRedirect(
  target: string | null | undefined,
  registered: string | null | undefined,
): string | null {
  if (!target || !registered) return null;

  try {
    const destination = new URL(target);
    const expected = new URL(registered);
    if (!(["https:", "http:"] as const).includes(destination.protocol as "https:" | "http:"))
      return null;
    if (destination.username || destination.password || expected.username || expected.password)
      return null;
    if (destination.origin !== expected.origin || destination.pathname !== expected.pathname)
      return null;
    if (destination.hash !== expected.hash) return null;

    for (const key of new Set(expected.searchParams.keys())) {
      const required = expected.searchParams.getAll(key);
      const received = destination.searchParams.getAll(key);
      if (required.some((value) => !received.includes(value))) return null;
    }

    return destination.toString();
  } catch {
    return null;
  }
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, `Bearer ${REDACTED}`)
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, REDACTED)
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, `$1${REDACTED}@`)
    .replace(
      /((?:access[_-]?token|refresh[_-]?token|authorization|api[_-]?key|apikey|password|secret)["']?\s*[:=]\s*["']?)[^\s,"'&}]+/gi,
      `$1${REDACTED}`,
    );
}

export function redactSensitiveValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[TRUNCATED]";
  if (typeof value === "string") return redactSensitiveText(value);
  if (value instanceof Error) {
    const safe = new Error(redactSensitiveText(value.message));
    safe.name = value.name;
    if (value.stack) safe.stack = redactSensitiveText(value.stack);
    return safe;
  }
  if (Array.isArray(value)) return value.map((item) => redactSensitiveValue(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        /token|authorization|api.?key|password|secret/i.test(key)
          ? REDACTED
          : redactSensitiveValue(item, depth + 1),
      ]),
    );
  }
  return value;
}
