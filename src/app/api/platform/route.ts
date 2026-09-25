import { guard, requireSession } from "@/lib/session";
import { listAdapters } from "@/prod/execution/registry";
import { oidcConfigured } from "@/prod/identity/oidc";
export async function GET() {
  try {
    await requireSession();
    return Response.json({
      ledger: { mode: process.env.DATABASE_URL ? "postgres" : "memory" },
      execution: listAdapters(),
      identity: { oidc: oidcConfigured(), webauthnRp: process.env.WEBAUTHN_RP_ID || "localhost" },
      custody: { provider: process.env.CUSTODY_PROVIDER || "simulated", keysInApp: false },
      secrets: { vault: Boolean(process.env.VAULT_ADDR) },
      executionMode: process.env.EXECUTION_MODE || "paper",
    });
  } catch (e) { return guard(e); }
}
