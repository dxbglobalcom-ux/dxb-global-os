// Secret redaction for audit payloads (T-3-13). Any object key matching the
// pattern gets its VALUE replaced before persistence — recursively, arrays included.
const SECRET_KEY = /password|token|key|secret|authorization/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}
