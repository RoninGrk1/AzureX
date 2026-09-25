export async function getSecret(name: string): Promise<string> {
  if (!/^[A-Z0-9_]+$/.test(name)) throw new Error("Invalid secret name.");
  if (process.env.VAULT_ADDR) throw new Error("Vault transport is configured by ops; not attached in this environment.");
  const local = process.env[name];
  if (!local) throw new Error(`Secret ${name} is not present.`);
  return local;
}
export function redact(value: string): string {
  if (!value) return "";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 2)}…${value.slice(-2)}`;
}
