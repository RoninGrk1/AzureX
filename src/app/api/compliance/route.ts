import { guard, requirePermission } from "@/lib/session";
import { evaluateTravelRule } from "@/prod/compliance/travel-rule";
import { selectVenue } from "@/prod/compliance/best-execution";
export async function POST(req: Request) {
  try {
    await requirePermission("risk:read");
    const body = await req.json();
    if (body.kind === "travel_rule") {
      return Response.json({ result: evaluateTravelRule({ assetClass: String(body.assetClass ?? "crypto"), usd: Number(body.usd ?? 0), counterparty: body.counterparty, originatorName: body.originatorName }) });
    }
    if (body.kind === "best_execution") {
      return Response.json({ result: selectVenue(String(body.orderId ?? "unknown"), Array.isArray(body.quotes) ? body.quotes : []) });
    }
    return Response.json({ error: "Unknown compliance kind." }, { status: 400 });
  } catch (e) { return guard(e); }
}
