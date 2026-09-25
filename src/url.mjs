/** Accept ordinary web links, never executable or credential-bearing URLs. */
export function safeURL(value) {
  try { const u=new URL(value); return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password ? u.href : null; } catch { return null; }
}
