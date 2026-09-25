import { cookies } from "next/headers";
import { can, verifySession } from "./auth";
import type { Role, SessionPayload } from "./types";
export const COOKIE = "azurex_session";
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value);
}
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}
export async function requirePermission(permission: string): Promise<SessionPayload> {
  const session = await requireSession();
  if (!can(session.role as Role, permission)) throw new Error("FORBIDDEN");
  return session;
}
export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
export function guard(error: unknown): Response {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") return jsonError("Authentication required.", 401);
    if (error.message === "FORBIDDEN") return jsonError("Insufficient permissions.", 403);
    return jsonError(error.message, 400);
  }
  return jsonError("Unexpected error.", 500);
}
