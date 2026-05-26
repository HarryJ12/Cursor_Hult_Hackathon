export type TeamName = "Celtics" | "Knicks";

export type EventType =
  | "made_three"
  | "missed_jumper"
  | "dunk"
  | "turnover"
  | "foul"
  | "block"
  | "timeout"
  | "game_end";

export type Quarter = "1st" | "2nd" | "3rd" | "4th" | "OT";

export interface GameEventDetail {
  type: EventType;
  player: string;
  team: TeamName;
  description: string;
}

export interface GameScore {
  Celtics: number;
  Knicks: number;
}

export interface GameEvent {
  game: "Celtics vs Knicks";
  quarter: Quarter;
  time: string;
  score: GameScore;
  event: GameEventDetail;
}
