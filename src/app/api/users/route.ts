import { guard, requireSession } from "@/lib/session";
import { DEMO_USERS } from "@/lib/auth";
export async function GET() {
  try {
    const session = await requireSession();
    if (session.role !== "principal" && session.role !== "ops" && session.role !== "auditor") {
      return Response.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    return Response.json({ users: DEMO_USERS.map(({ password: _p, ...u }) => u) });
  } catch (e) { return guard(e); }
}
