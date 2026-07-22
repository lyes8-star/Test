import { NextResponse } from "next/server";
import { z } from "zod";
import { replyFor, wantsLead, leadPrompt } from "@/lib/chat";

const schema = z.object({
  message: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Message invalide" }, { status: 400 });
    }

    const message = parsed.data.message;
    if (wantsLead(message)) {
      return NextResponse.json({
        reply: leadPrompt("name"),
        startLead: true,
        actions: ["lead"],
        suggestions: [],
      });
    }

    const result = replyFor(message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
