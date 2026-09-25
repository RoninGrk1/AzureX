import { guard, requirePermission } from "@/lib/session";
import { record, store } from "@/lib/store";
import type { RiskLimits } from "@/lib/types";
export async function PUT(req: Request) {
  try {
    const session = await requirePermission("risk:write");
    const body = (await req.json()) as Partial<RiskLimits>;
    const next = { ...store.limits };
    const numericKeys: (keyof RiskLimits)[] = ["maxPositionSizePct","maxAssetConcentrationPct","maxGrossExposure","maxNetExposure","maxLeverage","minLiquidityPct","dailyLossThresholdPct","drawdownThresholdPct","maxWalletTxUsd"];
    for (const key of numericKeys) {
      if (body[key] !== undefined) {
        const n = Number(body[key]);
        if (!Number.isFinite(n) || n < 0) return Response.json({ error: `Invalid ${key}` }, { status: 400 });
        (next[key] as number) = n;
      }
    }
    if (Array.isArray(body.blockedCounterparties)) next.blockedCounterparties = body.blockedCounterparties.map(String);
    store.limits = next;
    record(session.email, "user", "LIMITS_UPDATED", "risk", { limits: next });
    return Response.json({ limits: store.limits });
  } catch (e) { return guard(e); }
}
