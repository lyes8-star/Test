import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { AUDIT_COOKIE, createAccessToken, getAccessToken } from "@/lib/payments/tokens";

/** Resolve Stripe success redirect or return current token status. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const jar = await cookies();
  const existing = jar.get(AUDIT_COOKIE)?.value;

  if (existing) {
    const record = await getAccessToken(existing);
    if (record) {
      return NextResponse.json({
        unlocked: true,
        scansRemaining: record.scansRemaining,
        expiresAt: record.expiresAt,
        targetUrl: record.targetUrl,
      });
    }
  }

  if (sessionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" || session.status === "complete") {
        const { token, record } = await createAccessToken({
          stripeSessionId: session.id,
          targetUrl: session.metadata?.targetUrl,
          email: session.customer_details?.email || session.customer_email || undefined,
        });
        const res = NextResponse.json({
          unlocked: true,
          scansRemaining: record.scansRemaining,
          expiresAt: record.expiresAt,
          targetUrl: record.targetUrl,
          token,
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
    } catch (e) {
      console.error("[audit/session]", e);
    }
  }

  const qToken = searchParams.get("token");
  if (qToken) {
    const record = await getAccessToken(qToken);
    if (record) {
      const res = NextResponse.json({
        unlocked: true,
        scansRemaining: record.scansRemaining,
        expiresAt: record.expiresAt,
        targetUrl: record.targetUrl,
      });
      res.cookies.set(AUDIT_COOKIE, qToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }
  }

  return NextResponse.json({ unlocked: false });
}
