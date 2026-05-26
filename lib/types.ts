export type CommentaryMode = "hype_my_team" | "roast_opponent" | "balanced_chaos";
export type CommentaryIntensity = "mild" | "spicy" | "unhinged_clean";
export type CommentaryPersona =
  | "hype_announcer"
  | "boston_fan"
  | "sportscenter_parody"
  | "arena_mc";

export type CommentarySentiment = "hype" | "roast" | "neutral";

export type CommentaryRequest = {
  event: Record<string, unknown>;
  homeTeam: string;
  opposingTeam?: string;
  supportTeam?: string;
  targetTeam: string;
  mode: CommentaryMode;
  intensity: CommentaryIntensity;
  persona: CommentaryPersona;
};

export type CommentaryResponse = {
  commentary: string;
  sentiment: CommentarySentiment;
  crowdEnergy: number;
  screenCaption?: string;
};
