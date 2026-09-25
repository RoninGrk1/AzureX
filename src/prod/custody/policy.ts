const FORBIDDEN_FIELDS = ["privateKey", "private_key", "privkey", "seed", "mnemonic", "xprv", "secretKey", "secret_key"];
export function assertNoPrivateMaterial(payload: unknown, path = "payload"): void {
  if (!payload || typeof payload !== "object") return;
  if (Array.isArray(payload)) {
    payload.forEach((item, i) => assertNoPrivateMaterial(item, `${path}[${i}]`));
    return;
  }
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (FORBIDDEN_FIELDS.includes(key)) {
      throw new Error(`Custody policy violation: ${path}.${key} is forbidden. AzureX never handles private keys.`);
    }
    if (value && typeof value === "object") assertNoPrivateMaterial(value, `${path}.${key}`);
  }
}
export type CustodyAction = "list_balances" | "propose_transfer" | "sign_request";
export function custodyAllowed(action: CustodyAction, humanApproved: boolean): { ok: boolean; reason: string } {
  if (action === "sign_request" && !humanApproved) {
    return { ok: false, reason: "Signing requests require human authorization." };
  }
  return { ok: true, reason: "Allowed. Keys remain in the custodian / HSM." };
}
