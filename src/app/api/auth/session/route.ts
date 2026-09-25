import { getSession } from "@/lib/session";
import { DEMO_USERS } from "@/lib/auth";
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  const user = DEMO_USERS.find((u) => u.id === session.userId);
  if (!user) return Response.json({ user: null });
  const { password: _p, ...safe } = user;
  return Response.json({ user: safe });
}
