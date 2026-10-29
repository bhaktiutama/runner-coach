/** UUID dibuat di perangkat (TRD 3.1). */
export function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return (require('expo-crypto') as typeof import('expo-crypto')).randomUUID();
}

export const nowIso = () => new Date().toISOString();
