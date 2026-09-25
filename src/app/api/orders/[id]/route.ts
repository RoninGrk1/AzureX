import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("portfolio:read");
    const { id } = await ctx.params;
    const order = store.proposals.find((p) => p.id === id);
    if (!order) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ order });
  } catch (e) { return guard(e); }
}
