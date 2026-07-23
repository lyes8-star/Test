import Stripe from "stripe";
import { auditProduct, siteConfig } from "@/lib/site";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key);
}

export async function createCheckoutSession(input: {
  targetUrl: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail || undefined,
    client_reference_id: `audit:${Date.now()}`,
    metadata: {
      product: auditProduct.id,
      targetUrl: input.targetUrl,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: auditProduct.currency,
          unit_amount: auditProduct.priceCents,
          product_data: {
            name: auditProduct.name,
            description: `Autodiagnostic exigence : ${auditProduct.pillars.join(", ")}. ${auditProduct.scansIncluded} scans · ${auditProduct.validityDays} jours.`,
          },
        },
      },
    ],
    locale: "fr",
  });

  return session;
}

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
}
