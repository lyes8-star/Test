import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().or(z.literal("")),
  formula: z.string().min(2).max(40),
  budget: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
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

    console.info("[devis]", {
      ...parsed.data,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
