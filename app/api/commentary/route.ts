import { NextResponse } from "next/server";
import { generateCommentary } from "@/lib/api/commentary";
import type {
  CommentaryIntensity,
  CommentaryMode,
  CommentaryPersona,
  CommentaryRequest,
} from "@/lib/types";

export const runtime = "nodejs";

function isMode(value: unknown): value is CommentaryMode {
  return value === "hype_my_team" || value === "roast_opponent" || value === "balanced_chaos";
}

function isIntensity(value: unknown): value is CommentaryIntensity {
  return value === "mild" || value === "spicy" || value === "unhinged_clean";
}

function isPersona(value: unknown): value is CommentaryPersona {
  return value === "announcer";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Body must be an object." }, { status: 400 });
  }

  const event = body.event;
  const homeTeam = body.homeTeam;
  const targetTeam = body.targetTeam;
  const mode = body.mode;
  const intensity = body.intensity;
  const persona = body.persona;
  const opposingTeam = body.opposingTeam;
  const supportTeam = body.supportTeam;

  if (!isRecord(event)) {
    return NextResponse.json({ error: "`event` must be an object." }, { status: 400 });
  }
  if (typeof homeTeam !== "string" || !homeTeam) {
    return NextResponse.json({ error: "`homeTeam` is required." }, { status: 400 });
  }
  if (typeof targetTeam !== "string" || !targetTeam) {
    return NextResponse.json({ error: "`targetTeam` is required." }, { status: 400 });
  }
  if (!isMode(mode)) {
    return NextResponse.json({ error: "Invalid `mode`." }, { status: 400 });
  }
  if (!isIntensity(intensity)) {
    return NextResponse.json({ error: "Invalid `intensity`." }, { status: 400 });
  }
  if (!isPersona(persona)) {
    return NextResponse.json({ error: "Invalid `persona`." }, { status: 400 });
  }

  const payload: CommentaryRequest = {
    event,
    homeTeam,
    targetTeam,
    mode,
    intensity,
    persona,
    opposingTeam: typeof opposingTeam === "string" ? opposingTeam : undefined,
    supportTeam: typeof supportTeam === "string" ? supportTeam : undefined,
  };

  const commentary = await generateCommentary(payload);
  return NextResponse.json(commentary);
}
