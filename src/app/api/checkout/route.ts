import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, isStripeConfigured, siteOrigin } from "@/lib/payments/stripe";
import { AUDIT_COOKIE, createAccessToken } from "@/lib/payments/tokens";
import { assertPublicHttpUrl } from "@/lib/audit/ssrf";

const schema = z.object({
  url: z.string().min(8).max(2048),
  email: z.string().email().max(180).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    let target: URL;
    try {
      target = await assertPublicHttpUrl(parsed.data.url);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "URL refusée" },
        { status: 400 },
      );
    }

    const origin = siteOrigin().replace(/\/$/, "");
    const successBase = `${origin}/autodiagnostic`;

    // Dev / smoke: no Stripe keys → unlock immediately
    if (!isStripeConfigured()) {
      const { token } = await createAccessToken({
        targetUrl: target.toString(),
        email: parsed.data.email || undefined,
        stripeSessionId: `dev_${Date.now()}`,
      });
      const unlockUrl = `${successBase}?unlocked=1&token=${encodeURIComponent(token)}&url=${encodeURIComponent(target.toString())}`;
      const res = NextResponse.json({
        demo: true,
        url: unlockUrl,
        message:
          "Mode démo (STRIPE_SECRET_KEY absent) : accès débloqué sans paiement. Configurez Stripe pour la production.",
      });
      res.cookies.set(AUDIT_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }

    const session = await createCheckoutSession({
      targetUrl: target.toString(),
      customerEmail: parsed.data.email || undefined,
      successUrl: `${successBase}?session_id={CHECKOUT_SESSION_ID}&url=${encodeURIComponent(target.toString())}`,
      cancelUrl: `${successBase}?canceled=1&url=${encodeURIComponent(target.toString())}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Session Stripe invalide" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json({ error: "Impossible de créer le paiement" }, { status: 500 });
  }
}
