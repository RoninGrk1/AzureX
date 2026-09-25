import { createHmac, timingSafeEqual } from "crypto";
import type { Role, SessionPayload, User } from "./types";
const SESSION_TTL_SEC = 60 * 60 * 12;
export const DEMO_USERS: Array<User & { password: string }> = [
  { id: "usr_principal", email: "principal@azurex.local", name: "Alexandra Chen", role: "principal", mfaEnabled: true, password: "AzureX-Demo-2026!" },
  { id: "usr_risk", email: "risk@azurex.local", name: "Marcus Hale", role: "risk_officer", mfaEnabled: true, password: "AzureX-Demo-2026!" },
  { id: "usr_auditor", email: "audit@azurex.local", name: "Priya Nair", role: "auditor", mfaEnabled: true, password: "AzureX-Demo-2026!" },
];
export function secret(): string { return process.env.SESSION_SECRET || "azurex-dev-secret-change-in-production"; }
export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}
export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now() / 1000) return null;
    if (!payload.userId || !payload.email || !payload.role) return null;
    return payload;
  } catch { return null; }
}
export function issueSession(user: User): string {
  return signSession({ userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC });
}
export function authenticate(email: string, password: string): User | null {
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;
  const a = Buffer.from(password); const b = Buffer.from(user.password);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const { password: _pw, ...safe } = user; return safe;
}
const PERMISSIONS: Record<string, Role[]> = {
  "portfolio:read": ["principal", "cio", "risk_officer", "trader", "auditor", "ops"],
  "markets:read": ["principal", "cio", "risk_officer", "trader", "auditor", "ops"],
  "research:read": ["principal", "cio", "risk_officer", "trader", "auditor"],
  "agents:read": ["principal", "cio", "risk_officer", "trader", "auditor"],
  "agents:run": ["principal", "cio"],
  "orders:propose": ["principal", "cio", "trader"],
  "orders:approve": ["principal"],
  "orders:cio_review": ["principal", "cio"],
  "orders:execute": ["principal", "trader"],
  "risk:read": ["principal", "cio", "risk_officer", "auditor"],
  "risk:write": ["principal", "risk_officer"],
  "wallets:read": ["principal", "cio", "risk_officer", "auditor", "ops"],
  "wallets:transact": ["principal"],
  "audit:read": ["principal", "risk_officer", "auditor", "ops"],
  "emergency:write": ["principal", "risk_officer"],
};
export function can(role: Role, permission: string): boolean { return PERMISSIONS[permission]?.includes(role) ?? false; }
