import { buildSystemPrompt } from "../prompts/crowdcast";
import type {
  CommentaryRequest,
  CommentaryResponse,
  CommentarySentiment,
} from "../types";

function clampEnergy(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseSentiment(value: unknown): CommentarySentiment {
  if (value === "hype" || value === "roast" || value === "neutral") return value;
  return "neutral";
}

function fallbackResponse(input: CommentaryRequest): CommentaryResponse {
  const team = input.supportTeam ?? input.homeTeam;
  const base =
    input.mode === "roast_opponent"
      ? `${String(input.event.description ?? "Play")} and ${input.targetTeam} are getting cooked.`
      : `${team} just made a statement play.`;

  const sentiment: CommentarySentiment =
    input.mode === "roast_opponent" ? "roast" : input.mode === "hype_my_team" ? "hype" : "neutral";

  const energy = input.intensity === "mild" ? 62 : input.intensity === "spicy" ? 78 : 92;

  return {
    commentary: base.slice(0, 180),
    sentiment,
    crowdEnergy: clampEnergy(energy),
    screenCaption: "PLAY OF THE MOMENT",
  };
}

export async function generateCommentary(input: CommentaryRequest): Promise<CommentaryResponse> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return fallbackResponse(input);

  const system = buildSystemPrompt(input.mode, input.intensity, input.persona);
  const userPrompt = [
    "Game context:",
    `Home team: ${input.homeTeam}`,
    `Opposing team: ${input.opposingTeam ?? "Unknown"}`,
    `User wants to support: ${input.supportTeam ?? input.homeTeam}`,
    `Target to roast when appropriate: ${input.targetTeam}`,
    `Mode: ${input.mode}`,
    `Intensity: ${input.intensity}`,
    `Persona: ${input.persona}`,
    "",
    "Current event JSON:",
    JSON.stringify(input.event),
    "",
    "Generate one alternate commentary line.",
  ].join("\n");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL ?? "grok-4.1-fast",
      temperature: 0.9,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    return fallbackResponse(input);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawText = payload.choices?.[0]?.message?.content ?? "";
  let parsed: Partial<CommentaryResponse> = {};

  try {
    parsed = JSON.parse(rawText) as Partial<CommentaryResponse>;
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]) as Partial<CommentaryResponse>;
      } catch {
        parsed = {};
      }
    }
  }

  if (!parsed.commentary) {
    return fallbackResponse(input);
  }

  return {
    commentary: String(parsed.commentary).slice(0, 220),
    sentiment: parseSentiment(parsed.sentiment),
    crowdEnergy: clampEnergy(Number(parsed.crowdEnergy ?? 75)),
    screenCaption: parsed.screenCaption ? String(parsed.screenCaption).slice(0, 48) : undefined,
  };
}
