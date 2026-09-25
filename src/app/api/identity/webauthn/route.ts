import { guard, requireSession } from "@/lib/session";
import { beginWebAuthn, consumeChallenge } from "@/prod/identity/webauthn";
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json().catch(() => ({}));
    if (body.action === "begin") return Response.json(beginWebAuthn(session.userId));
    if (body.action === "finish") {
      const ok = consumeChallenge(session.userId, String(body.challenge ?? ""));
      return Response.json({ ok });
    }
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) { return guard(e); }
}
