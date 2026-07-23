import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { createAccessToken } from "@/lib/payments/tokens";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook mal configuré" }, { status: 400 });
  }

  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const targetUrl = session.metadata?.targetUrl;
    await createAccessToken({
      stripeSessionId: session.id,
      targetUrl: targetUrl || undefined,
      email: session.customer_details?.email || session.customer_email || undefined,
    });
    console.info("[stripe] checkout.session.completed", session.id);
  }

  return NextResponse.json({ received: true });
}
