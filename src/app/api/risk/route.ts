import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
import { evaluateTrade } from "@/lib/risk-engine";
export async function GET() {
  try {
    await requirePermission("risk:read");
    return Response.json({ limits: store.limits, emergency: store.emergency, snapshot: store.snapshot });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    await requirePermission("risk:read");
    const body = await req.json();
    const result = evaluateTrade({
      trade: { symbol: String(body.symbol ?? ""), side: body.side === "sell" ? "sell" : "buy", quantity: Number(body.quantity), price: Number(body.price), venue: body.venue ? String(body.venue) : undefined },
      positions: store.positions, snapshot: store.snapshot, limits: store.limits, emergency: store.emergency,
    });
    return Response.json({ result });
  } catch (e) { return guard(e); }
}
