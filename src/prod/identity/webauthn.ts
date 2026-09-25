import { createHash, randomBytes } from "crypto";
const challenges = new Map<string, { exp: number; challenge: string }>();
export function beginWebAuthn(userId: string) {
  const challenge = randomBytes(32).toString("base64url");
  challenges.set(userId, { challenge, exp: Date.now() + 60_000 });
  return { challenge, rpId: process.env.WEBAUTHN_RP_ID || "localhost", timeoutMs: 60_000 };
}
export function consumeChallenge(userId: string, challenge: string): boolean {
  const row = challenges.get(userId);
  if (!row) return false;
  challenges.delete(userId);
  if (row.exp < Date.now()) return false;
  const a = Buffer.from(row.challenge);
  const b = Buffer.from(challenge);
  if (a.length !== b.length) return false;
  return createHash("sha256").update(a).digest("hex") === createHash("sha256").update(b).digest("hex");
}
