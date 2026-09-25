export type SqlRow = Record<string, unknown>;
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
export async function pingDb(): Promise<{ ok: boolean; mode: "postgres" | "memory" }> {
  if (!hasDatabase()) return { ok: true, mode: "memory" };
  try {
    const pg = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    await pool.query("SELECT 1 AS ok");
    await pool.end();
    return { ok: true, mode: "postgres" };
  } catch {
    return { ok: false, mode: "postgres" };
  }
}
