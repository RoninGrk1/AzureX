import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("portfolio:read");
    const queue = store.proposals.filter((p) => ["proposed","risk_check","cio_review","pending_approval"].includes(p.status));
    return Response.json({ queue, all: store.proposals });
  } catch (e) { return guard(e); }
}
