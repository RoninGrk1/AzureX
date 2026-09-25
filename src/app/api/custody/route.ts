import { guard, requirePermission } from "@/lib/session";
import { assertNoPrivateMaterial } from "@/prod/custody/policy";
export async function GET() {
  try {
    await requirePermission("wallets:read");
    return Response.json({ provider: process.env.CUSTODY_PROVIDER || "simulated", keysHeldByApp: false, balances: [{ vaultId: "vault-prime", asset: "USDC", available: 890000, usd: 890000 }] });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    const session = await requirePermission("wallets:transact");
    const body = await req.json();
    assertNoPrivateMaterial(body);
    return Response.json({ result: { requestId: "cust_pending", status: "pending_custodian_policy", approvedBy: session.email } });
  } catch (e) { return guard(e); }
}
