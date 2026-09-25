import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("research:read");
    return Response.json({ briefs: store.outputs.slice(0, 20), agents: store.agents });
  } catch (e) { return guard(e); }
}
