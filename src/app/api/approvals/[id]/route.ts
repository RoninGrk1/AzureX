import { guard, requirePermission } from "@/lib/session";
import { recalcSnapshot, record, store } from "@/lib/store";
import { evaluateTrade } from "@/lib/risk-engine";
import type { TradeProposal } from "@/lib/types";
function applyFill(order: TradeProposal) {
  const pos = store.positions.find((p) => p.symbol === order.asset);
  if (order.side === "sell" && (!pos || pos.quantity < order.quantity)) {
    throw new Error("INVENTORY: sell exceeds held quantity.");
  }
  const signed = order.side === "buy" ? order.quantity : -order.quantity;
  const cashDelta = order.side === "buy" ? -order.estimatedValue : order.estimatedValue;
  store.snapshot.cash += cashDelta;
  if (pos) {
    const newQty = pos.quantity + signed;
    if (newQty === 0) store.positions.splice(store.positions.indexOf(pos), 1);
    else {
      if (order.side === "buy") pos.avgCost = (pos.avgCost * pos.quantity + order.entry * order.quantity) / newQty;
      pos.quantity = newQty;
      pos.marketValue = pos.quantity * pos.lastPrice;
      pos.unrealizedPnl = (pos.lastPrice - pos.avgCost) * pos.quantity;
    }
  } else if (order.side === "buy") {
    store.positions.push({ id: store.id("pos"), symbol: order.asset, name: order.asset, assetClass: order.assetClass, quantity: order.quantity, avgCost: order.entry, lastPrice: order.entry, marketValue: order.estimatedValue, unrealizedPnl: 0, weight: 0, venue: "MANUAL" });
  }
  order.fillPrice = order.entry;
  recalcSnapshot();
}
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const order = store.proposals.find((p) => p.id === id);
    if (!order) return Response.json({ error: "Not found." }, { status: 404 });
    if (action === "cio_advance") {
      const session = await requirePermission("orders:cio_review");
      if (order.status !== "cio_review" && order.status !== "risk_check") return Response.json({ error: "Order is not in CIO review." }, { status: 409 });
      order.status = "pending_approval"; order.updatedAt = store.now();
      record(session.email, "user", "CIO_REVIEW", `order:${order.id}`, {});
      return Response.json({ order });
    }
    if (action === "approve") {
      const session = await requirePermission("orders:approve");
      if (order.status !== "pending_approval" && order.status !== "cio_review") return Response.json({ error: "Order is not awaiting approval." }, { status: 409 });
      const risk = evaluateTrade({ trade: { symbol: order.asset, side: order.side, quantity: order.quantity, price: order.entry }, positions: store.positions, snapshot: store.snapshot, limits: store.limits, emergency: store.emergency });
      order.riskApproval = risk;
      if (risk.blocked) { order.status = "blocked"; order.updatedAt = store.now(); return Response.json({ order, error: "Blocked by risk engine." }, { status: 422 }); }
      order.status = "approved"; order.approvedBy = session.email; order.updatedAt = store.now();
      record(session.email, "user", "ORDER_APPROVED", `order:${order.id}`);
      return Response.json({ order });
    }
    if (action === "reject") {
      const session = await requirePermission("orders:approve");
      order.status = "rejected"; order.updatedAt = store.now();
      record(session.email, "user", "ORDER_REJECTED", `order:${order.id}`, {});
      return Response.json({ order });
    }
    if (action === "execute") {
      const session = await requirePermission("orders:execute");
      if (order.status !== "approved") return Response.json({ error: "Order must be approved before execution." }, { status: 409 });
      if (store.emergency.pauseTrading || store.emergency.globalKillSwitch) return Response.json({ error: "Trading paused by emergency control." }, { status: 423 });
      const risk = evaluateTrade({ trade: { symbol: order.asset, side: order.side, quantity: order.quantity, price: order.entry }, positions: store.positions, snapshot: store.snapshot, limits: store.limits, emergency: store.emergency });
      if (risk.blocked) { order.status = "blocked"; order.riskApproval = risk; return Response.json({ order, error: "Blocked by risk engine." }, { status: 422 }); }
      applyFill(order);
      order.status = "filled"; order.updatedAt = store.now();
      record(session.email, "user", "ORDER_FILLED", `order:${order.id}`, { fillPrice: order.fillPrice });
      return Response.json({ order });
    }
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) { return guard(e); }
}
