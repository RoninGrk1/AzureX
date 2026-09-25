import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("wallets:read");
    return Response.json({ wallets: store.wallets, addressBook: store.addressBook, note: "Private keys are never stored, logged, or exposed to agents." });
  } catch (e) { return guard(e); }
}
