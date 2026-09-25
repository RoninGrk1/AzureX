import { guard, requirePermission } from "@/lib/session";
import { record, store } from "@/lib/store";
import { evaluateTrade } from "@/lib/risk-engine";
import type { AssetClass, Side } from "@/lib/types";
export async function GET() {
  try {
    await requirePermission("portfolio:read");
    return Response.json({ orders: store.proposals });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    const session = await requirePermission("orders:propose");
    const body = await req.json();
    const asset = String(body.asset ?? "").toUpperCase();
    const side: Side = body.side === "sell" ? "sell" : "buy";
    const quantity = Number(body.quantity);
    const price = Number(body.price ?? store.quotes.find((q) => q.symbol === asset)?.price);
    const assetClass: AssetClass = body.assetClass ?? "equity";
    const venue = body.venue ? String(body.venue) : undefined;
    if (!asset || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) {
      return Response.json({ error: "Invalid order fields." }, { status: 400 });
    }
    const risk = evaluateTrade({
      trade: { symbol: asset, side, quantity, price, venue },
      positions: store.positions, snapshot: store.snapshot, limits: store.limits, emergency: store.emergency,
    });
    const mutable = {
      id: store.id("ord"), asset, assetClass, side, quantity, estimatedValue: quantity * price, entry: price,
      riskUsd: Number(body.riskUsd ?? quantity * price * 0.05), expectedSlippageBps: Number(body.expectedSlippageBps ?? 8),
      portfolioImpact: body.portfolioImpact ? String(body.portfolioImpact) : `${side} ${quantity} ${asset}`,
      reasoning: String(body.reasoning ?? "Manual proposal"),
      evidence: Array.isArray(body.evidence) ? body.evidence.map(String) : ["Manual ticket"],
      agentId: body.agentId ?? "execution",
      status: risk.blocked ? "blocked" as const : "cio_review" as const,
      riskApproval: risk, createdAt: store.now(), updatedAt: store.now(),
    };
    store.proposals.unshift(mutable);
    record(session.email, "user", risk.blocked ? "ORDER_BLOCKED" : "ORDER_PROPOSED", `order:${mutable.id}`, { asset, side, quantity, blocked: risk.blocked });
    return Response.json({ order: mutable }, { status: risk.blocked ? 422 : 201 });
  } catch (e) { return guard(e); }
}
