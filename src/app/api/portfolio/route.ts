import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("portfolio:read");
    return Response.json({
      snapshot: store.snapshot,
      positions: store.positions,
      allocation: {
        equity: store.positions.filter((p) => p.assetClass === "equity" || p.assetClass === "etf").reduce((s, p) => s + p.weight, 0),
        crypto: store.positions.filter((p) => p.assetClass === "crypto").reduce((s, p) => s + p.weight, 0),
        cash: store.snapshot.nav > 0 ? store.snapshot.cash / store.snapshot.nav : 0,
      },
    });
  } catch (e) { return guard(e); }
}
