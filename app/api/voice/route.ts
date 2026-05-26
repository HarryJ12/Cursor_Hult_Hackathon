import { NextResponse } from "next/server";
import { synthesizeVoice } from "@/lib/api/voice";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be an object." }, { status: 400 });
  }

  const { text, voiceId } = body as { text?: unknown; voiceId?: unknown };

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }

  const audioUrl = await synthesizeVoice(
    text.trim().slice(0, 800),
    typeof voiceId === "string" && voiceId ? voiceId : undefined
  );

  if (!audioUrl) {
    return NextResponse.json(
      {
        audioUrl: null,
        provider: "browser_fallback",
        message: "ElevenLabs not configured or unavailable. Use browser speech synthesis fallback.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ audioUrl, provider: "elevenlabs" });
}
