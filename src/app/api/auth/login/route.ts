import { authenticate, issueSession } from "@/lib/auth";
import { COOKIE } from "@/lib/session";
import { record } from "@/lib/store";
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });
  const user = authenticate(email, password);
  if (!user) {
    record("anonymous", "user", "LOGIN_FAILED", "auth", { email });
    return Response.json({ error: "Invalid credentials." }, { status: 401 });
  }
  const token = issueSession(user);
  record(user.email, "user", "LOGIN", "auth", { role: user.role });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const res = Response.json({ user });
  res.headers.append("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}${secure}`);
  return res;
}
