import { COOKIE, getSession } from "@/lib/session";
import { record } from "@/lib/store";
export async function POST() {
  const session = await getSession();
  if (session) record(session.email, "user", "LOGOUT", "auth");
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
