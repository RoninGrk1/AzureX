export interface OidcClaims { sub: string; email: string; name?: string; roles?: string[]; amr?: string[]; }
export function mapOidcRole(claims: OidcClaims) {
  const roles = (claims.roles ?? []).map((r) => r.toLowerCase());
  if (roles.includes("principal") || roles.includes("owner")) return "principal";
  if (roles.includes("risk") || roles.includes("risk_officer")) return "risk_officer";
  if (roles.includes("auditor") || roles.includes("audit")) return "auditor";
  if (roles.includes("trader")) return "trader";
  if (roles.includes("ops")) return "ops";
  return null;
}
export function oidcConfigured(): boolean {
  return Boolean(process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID);
}
export function authorizeOidc(claims: OidcClaims): { ok: boolean; role: string | null; reason: string } {
  const role = mapOidcRole(claims);
  if (!role) return { ok: false, role: null, reason: "No AzureX role mapped from IdP claims." };
  if ((role === "principal" || role === "risk_officer") && !(claims.amr ?? []).some((a) => ["hwk", "webauthn", "mfa"].includes(a))) {
    return { ok: false, role, reason: "Principal and risk officer must authenticate with hardware MFA." };
  }
  return { ok: true, role, reason: "OIDC + MFA accepted." };
}
