import { guard, requirePermission } from "@/lib/session";
import { record, store } from "@/lib/store";
import { evaluateWalletTx } from "@/lib/risk-engine";
import type { WalletTx } from "@/lib/types";
export async function GET() {
  try {
    await requirePermission("wallets:read");
    return Response.json({ transactions: store.walletTxs });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    const session = await requirePermission("wallets:transact");
    const body = await req.json();
    const walletId = String(body.walletId ?? "");
    const type = body.type as WalletTx["type"];
    const asset = String(body.asset ?? "");
    const amount = Number(body.amount);
    const destination = String(body.destination ?? "");
    const wallet = store.wallets.find((w) => w.id === walletId);
    if (!wallet) return Response.json({ error: "Unknown wallet." }, { status: 404 });
    if (!["deposit", "withdrawal", "transfer"].includes(type)) return Response.json({ error: "Invalid transaction type." }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "Invalid amount." }, { status: 400 });
    const allowlistHit = store.addressBook.some((a) => a.whitelisted && a.riskScreen !== "blocked" && (a.address.toLowerCase() === destination.toLowerCase() || a.label === destination));
    const mark = store.quotes.find((q) => q.symbol === asset)?.price;
    const usd = asset === "USDC" || asset === "USDT" || asset === "USD" ? amount : amount * (mark ?? 0);
    if (!Number.isFinite(usd) || usd <= 0) return Response.json({ error: "Cannot price this asset for the wallet limit check." }, { status: 400 });
    const risk = evaluateWalletTx({ tx: { type, usd, counterparty: destination }, limits: store.limits, emergency: store.emergency, allowlistHit: type === "deposit" ? true : allowlistHit });
    const tx: WalletTx = { id: store.id("wtx"), walletId, type, asset, amount, usd, counterparty: destination || undefined, status: risk.blocked ? "blocked" : "pending", createdAt: store.now() };
    store.walletTxs.unshift(tx);
    record(session.email, "user", risk.blocked ? "WALLET_TX_BLOCKED" : "WALLET_TX_SUBMITTED", `wallet:${walletId}`, { type, asset, amount, usd, blocked: risk.blocked });
    if (risk.blocked) return Response.json({ transaction: tx, risk }, { status: 422 });
    tx.status = "confirmed";
    return Response.json({ transaction: tx, risk }, { status: 201 });
  } catch (e) { return guard(e); }
}
