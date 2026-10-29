import { describe, expect, it } from 'vitest';

// Schema bagian 5.1: schema `public` di project Supabase cloud harus kosong.
// Butuh EXPO_PUBLIC_SUPABASE_URL + SUPABASE_ACCESS_TOKEN (Management API, hanya baca).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = url?.match(/^https:\/\/([^.]+)\./)?.[1];

// Tabel di public yang disetujui spec (tanpa data pribadi). MVP: tidak ada.
const APPROVED_PUBLIC_TABLES: string[] = [];

describe.skipIf(!ref || !token)('server Supabase', () => {
  it('schema public tidak berisi tabel di luar yang disetujui spec', async () => {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "select table_name from information_schema.tables where table_schema = 'public'",
        read_only: true,
      }),
    });
    expect(res.ok).toBe(true);
    const rows = (await res.json()) as { table_name: string }[];
    const extra = rows.map((r) => r.table_name).filter((n) => !APPROVED_PUBLIC_TABLES.includes(n));
    expect(extra).toEqual([]);
  });
});
