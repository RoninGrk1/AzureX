import { guard, requirePermission } from "@/lib/session";
import { record, store } from "@/lib/store";
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("orders:approve");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const order = store.proposals.find((p) => p.id === id);
    if (!order) return Response.json({ error: "Not found." }, { status: 404 });
    if (body.decision === "reject") {
      order.status = "rejected";
      record(session.email, "user", "ORDER_REJECTED", `order:${id}`, {});
    } else {
      order.status = "approved";
      order.approvedBy = session.email;
      record(session.email, "user", "ORDER_APPROVED", `order:${id}`, {});
    }
    order.updatedAt = store.now();
    return Response.json({ order });
  } catch (e) { return guard(e); }
}
