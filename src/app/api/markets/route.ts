import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("markets:read");
    const jittered = store.quotes.map((q) => ({ ...q, price: Number((q.price * (1 + (Math.random() - 0.5) * 0.0008)).toFixed(4)) }));
    return Response.json({ quotes: jittered, asOf: new Date().toISOString() });
  } catch (e) { return guard(e); }
}
