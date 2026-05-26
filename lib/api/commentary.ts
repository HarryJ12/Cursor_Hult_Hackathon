import { buildSystemPrompt } from "../prompts/crowdcast";
import type {
  CommentaryPersona,
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

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isTooLiteral(eventDescription: string, commentary: string): boolean {
  const eventNorm = normalizeText(eventDescription);
  const commentaryNorm = normalizeText(commentary);
  if (!eventNorm || !commentaryNorm) return false;
  return commentaryNorm.includes(eventNorm) || eventNorm.includes(commentaryNorm);
}

function getEventType(input: CommentaryRequest): string {
  return String(input.event.type ?? "").toLowerCase();
}

function getEventTeam(input: CommentaryRequest): string {
  return String(input.event.team ?? "");
}

function isNegativeEventType(eventType: string): boolean {
  const negativeTypes = [
    "missed",
    "turnover",
    "foul",
    "offensive_foul",
    "blocked",
    "block",
    "rejected",
    "airball",
  ];
  return negativeTypes.some((t) => eventType.includes(t));
}

function isPositiveEventType(eventType: string): boolean {
  const positiveTypes = ["made", "three", "dunk", "layup", "and_one", "assist", "steal", "block", "final"];
  return positiveTypes.some((t) => eventType.includes(t));
}

function inferSentiment(input: CommentaryRequest): CommentarySentiment {
  const eventType = getEventType(input);
  const eventTeam = getEventTeam(input).toLowerCase();
  const supportTeam = String(input.supportTeam ?? input.homeTeam).toLowerCase();
  const targetTeam = String(input.targetTeam).toLowerCase();
  const negative = isNegativeEventType(eventType);
  const positive = isPositiveEventType(eventType);

  if (input.mode === "roast_opponent") {
    if (eventTeam === targetTeam && negative) return "roast";
    if (eventTeam === supportTeam && positive) return "hype";
    return "neutral";
  }

  if (input.mode === "hype_my_team") {
    if (eventTeam === supportTeam && positive) return "hype";
    if (eventTeam === targetTeam && negative) return "hype";
    return "neutral";
  }

  // balanced_chaos: roast any team that fails, hype any team that shines
  if (negative) return "roast";
  if (positive) return "hype";
  return "neutral";
}

const PERSONA_REACTIONS: Record<CommentaryPersona, Record<CommentarySentiment, string[]>> = {
  hype_announcer: {
    hype: ["That arena just exploded!", "Statement play. Absolute authority.", "Big-time moment under bright lights."],
    roast: ["That possession just got embarrassed on national TV.", "That was a lowlight in real time.", "Defense checked out and paid for it."],
    neutral: ["Momentum is shifting right now.", "This game just got spicy.", "The pressure is climbing every possession."],
  },
  boston_fan: {
    hype: ["Garden is rocking right now.", "That was pure Boston swagger.", "He just sent the building into orbit."],
    roast: ["That looked like defense running on dial-up.", "They got cooked and everybody saw it.", "That play was rough, no sugarcoating."],
    neutral: ["This one is getting chaotic fast.", "Nobody is breathing easy now.", "This game is on edge every trip."],
  },
  sportscenter_parody: {
    hype: ["Highlight reel just got a new cover photo.", "Clip that and loop it all week.", "That was all gas, zero hesitation."],
    roast: ["That possession belongs in a blooper package.", "Shot selection entered witness protection.", "They just speed-ran a bad decision."],
    neutral: ["Tension meter is officially red.", "Both sides are trading haymakers now.", "This game script keeps getting weird."],
  },
  arena_mc: {
    hype: ["Crowd up! That was nasty work!", "Hands up! Big-time bucket!", "That was cold-blooded execution!"],
    roast: ["Ooof, that was a brick parade!", "Defense asleep, scoreboard awake!", "That possession was straight turbulence!"],
    neutral: ["Everybody up, this one is tight!", "Noise up, pressure is rising!", "Game on a knife edge right now!"],
  },
};

function pickLine(lines: string[], seed: string): string {
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return lines[hash % lines.length];
}

function fallbackResponse(input: CommentaryRequest): CommentaryResponse {
  const eventDescription = String(input.event.description ?? "Play");
  const eventTeam = getEventTeam(input) || "That team";
  const sentiment = inferSentiment(input);
  const persona = input.persona ?? "arena_mc";
  const reaction = pickLine(
    PERSONA_REACTIONS[persona][sentiment],
    `${eventDescription}|${persona}|${input.mode}|${input.intensity}`
  );

  const baseLine =
    sentiment === "roast"
      ? `${reaction} ${eventTeam} just got put on a lowlight reel.`
      : sentiment === "hype"
      ? `${reaction} Crowd energy is through the roof.`
      : `${reaction}`;

  const energy = input.intensity === "mild" ? 62 : input.intensity === "spicy" ? 78 : 92;

  return {
    commentary: baseLine.slice(0, 180),
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
    "In balanced_chaos mode, roast whichever team made the bad play and hype whichever team made the good play.",
    "Do not narrate the play literally. React to it with funny emotional commentary.",
    "Keep it clean and witty. No profanity or identity attacks.",
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

  let commentaryText = String(parsed.commentary).slice(0, 220);
  const eventDescription = String(input.event.description ?? "");
  if (isTooLiteral(eventDescription, commentaryText)) {
    const fallback = fallbackResponse(input);
    commentaryText = fallback.commentary;
  }

  const inferredSentiment = inferSentiment(input);
  const chosenSentiment = parseSentiment(parsed.sentiment);
  const finalSentiment = input.mode === "balanced_chaos" ? inferredSentiment : chosenSentiment;
  const baseEnergy = clampEnergy(Number(parsed.crowdEnergy ?? 75));
  const finalEnergy =
    finalSentiment === "roast" ? Math.max(80, baseEnergy) : finalSentiment === "hype" ? Math.max(78, baseEnergy) : baseEnergy;

  return {
    commentary: commentaryText,
    sentiment: finalSentiment,
    crowdEnergy: finalEnergy,
    screenCaption: parsed.screenCaption ? String(parsed.screenCaption).slice(0, 48) : undefined,
  };
}
