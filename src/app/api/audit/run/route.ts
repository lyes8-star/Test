import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { runSiteAudit } from "@/lib/audit/runSiteAudit";
import { assertPublicHttpUrl } from "@/lib/audit/ssrf";
import { AUDIT_COOKIE, consumeScan, getAccessToken } from "@/lib/payments/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  url: z.string().min(8).max(2048),
  token: z.string().min(10).optional(),
});

const running = new Set<string>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const jar = await cookies();
    const token = parsed.data.token || jar.get(AUDIT_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Accès non débloqué — paiement requis" }, { status: 401 });
    }

    const record = await getAccessToken(token);
    if (!record) {
      return NextResponse.json({ error: "Jeton expiré ou invalide" }, { status: 401 });
    }
    if (record.scansRemaining <= 0) {
      return NextResponse.json({ error: "Quota de scans épuisé" }, { status: 403 });
    }

    let url: URL;
    try {
      url = await assertPublicHttpUrl(parsed.data.url);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "URL refusée" },
        { status: 400 },
      );
    }

    if (running.has(token)) {
      return NextResponse.json({ error: "Un scan est déjà en cours pour ce jeton" }, { status: 429 });
    }

    running.add(token);
    try {
      const consumed = await consumeScan(token);
      if (!consumed) {
        return NextResponse.json({ error: "Impossible de consommer un scan" }, { status: 403 });
      }

      const report = await Promise.race([
        runSiteAudit(url.toString()),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout audit (90s)")), 90000),
        ),
      ]);

      return NextResponse.json({
        ok: true,
        report,
        scansRemaining: consumed.scansRemaining,
      });
    } finally {
      running.delete(token);
    }
  } catch (e) {
    console.error("[audit/run]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Échec du scan" },
      { status: 500 },
    );
  }
}
