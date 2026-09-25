import { guard, requireSession } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requireSession();
    return Response.json({ alerts: store.alerts });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    await requireSession();
    const body = await req.json().catch(() => ({}));
    const alert = store.alerts.find((a) => a.id === String(body.id ?? ""));
    if (alert) alert.acknowledged = true;
    return Response.json({ alerts: store.alerts });
  } catch (e) { return guard(e); }
}
