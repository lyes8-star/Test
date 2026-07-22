import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().or(z.literal("")),
  type: z.enum(["visio", "presentiel", "telephone"]),
  date: z.string().min(8),
  slot: z.string().min(4),
  message: z.string().max(2000).optional().or(z.literal("")),
  consent: z.literal("on").or(z.literal(true)).or(z.literal("true")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse({
      ...body,
      consent: body.consent === true || body.consent === "on" || body.consent === "true" ? "on" : body.consent,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // En production : brancher e-mail / CRM / calendrier.
    console.info("[rdv]", {
      ...parsed.data,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
