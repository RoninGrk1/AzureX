import { guard, requirePermission } from "@/lib/session";
import { verifyChain } from "@/lib/audit";
import { store } from "@/lib/store";
export async function GET(req: Request) {
  try {
    await requirePermission("audit:read");
    const url = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 80)));
    return Response.json({ events: store.audit.slice(-limit).reverse(), chain: verifyChain(store.audit), count: store.audit.length });
  } catch (e) { return guard(e); }
}
