// Token redaction utilities for logs and diagnostics
// Keep patterns tight to avoid mangling normal code/text

export type RedactionOverrides = {
  additionalPatterns?: RegExp[];
};

const defaultPatterns: Readonly<Record<string, RegExp>> = {
  // Private key blocks
  pkBlock: /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
  // OpenAI style keys
  openai: /sk-[A-Za-z0-9]{20,}/g,
  // GitHub PAT
  gh: /ghp_[A-Za-z0-9]{30,}/g,
  // Google API keys
  google: /AIza[0-9A-Za-z_\-]{30,}/g,
  // AWS Access Key ID
  awsId: /AKIA[0-9A-Z]{16}/g,
  // Slack tokens
  slack: /xox[baprs]-[A-Za-z0-9\-]{10,}/g,
  // JWT (3 dot-separated base64url segments)
  jwt: /\bey[JB][A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+/g,
  // Emails (mask local part)
  email: /\b([A-Za-z0-9._%+-])([A-Za-z0-9._%+-]*)(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
  // Generic hex/base64-ish tokens of length >= 32 next to "key" or "secret" labels
  labeledSecret: /\b(?:api[-_\s]*key|secret|token)[:=\s"']{1,5}([A-Za-z0-9_\-\/\+=]{32,})/gi,
};

/**
 * Redact sensitive substrings from input. Intended for logs and diagnostics.
 */
export function redact(input: string): string {
  if (!input) return input;
  let out = String(input);
  // OpenAI like keys
  out = out.replace(/\bsk-[A-Za-z0-9]{10,}\b/g, 'sk-***REDACTED***');
  // GitHub tokens
  out = out.replace(/\bghp_[A-Za-z0-9]{20,}\b/g, 'ghp_***REDACTED***');
  // AWS Access Key IDs
  out = out.replace(/\bAKIA[0-9A-Z]{12,}\b/g, 'AKIA***REDACTED***');
  // Basic JWT (header.payload.signature) redact payload/signature
  out = out.replace(
    /\beyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
    'jwt.[REDACTED].[REDACTED]'
  );
  // Emails: keep first char + domain
  out = out.replace(
    /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    '$1***@$2'
  );
  return out;
}

/**
 * Deeply redact string values inside an object/array for safe logging.
 */
export function redactDeep<T>(value: T): T {
  const seen = new WeakSet();
  const walk = (v: any): any => {
    if (v === null || v === undefined) return v;
    if (typeof v === 'string') return redact(v);
    if (typeof v !== 'object') return v;
    if (seen.has(v)) return v;
    seen.add(v);
    if (Array.isArray(v)) return v.map((x) => walk(x));
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = walk(val);
    }
    return out as any;
  };
  return walk(value);
}

export type { RedactionOverrides as TokenRedactionOverrides };
