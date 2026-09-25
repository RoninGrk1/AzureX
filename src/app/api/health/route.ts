import { store } from "@/lib/store";
import { verifyChain } from "@/lib/audit";
export async function GET() {
  const chain = verifyChain(store.audit);
  return Response.json({ ok: true, service: "azurex", time: new Date().toISOString(), emergency: store.emergency, auditChainValid: chain.valid });
}
