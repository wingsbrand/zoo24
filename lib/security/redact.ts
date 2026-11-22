// Redakcja sekretów i PII przed logowaniem / audytem. Stosować do KAŻDEGO logu integracji.

const SECRET_KEYS = /^(access_?token|token|secret|app_?secret|authorization|cookie|password|appsecret_proof|api_?key|refresh_?token|client_?secret|email|e-mail|phone|telefon|address|adres)$/i;

const PATTERNS: [RegExp, string][] = [
  [/(access_token|appsecret_proof|client_secret|refresh_token|token|key)=([^&\s"']+)/gi, "$1=[REDACTED]"],
  [/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, "Bearer [REDACTED]"],
  [/\bEAA[A-Za-z0-9]{10,}\b/g, "[REDACTED_META_TOKEN]"], // format tokenów Meta
  [/\bya29\.[A-Za-z0-9\-_]+/g, "[REDACTED_GOOGLE_TOKEN]"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[REDACTED_EMAIL]"],
  [/(?<!\d)(?:\+?48[\s-]?)?(?:\d[\s-]?){9}(?!\d)/g, "[REDACTED_PHONE]"],
];

export function redactString(input: string): string {
  return PATTERNS.reduce((s, [re, rep]) => s.replace(re, rep), input);
}

export function redact<T>(value: T, depth = 0): T {
  if (depth > 8) return "[TRUNCATED]" as unknown as T;
  if (typeof value === "string") return redactString(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1)) as unknown as T;
  if (value && typeof value === "object") {
    if (value instanceof Error) {
      return { name: value.name, message: redactString(value.message) } as unknown as T;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEYS.test(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out as T;
  }
  return value;
}

/** Bezpieczny logger: zawsze redaguje. Jedyny dozwolony sposób logowania w modułach integracji. */
export function safeLog(level: "info" | "warn" | "error", msg: string, meta?: unknown): string {
  const line = `[zoo24:${level}] ${redactString(msg)}${meta === undefined ? "" : " " + JSON.stringify(redact(meta))}`;
  if (process.env.NODE_ENV !== "test") console[level](line);
  return line;
}
