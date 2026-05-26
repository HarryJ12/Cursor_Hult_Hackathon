import raw from "@/lib/data/game-events.json";
import type { GameEvent } from "./event-types";

export const demoEvents: readonly GameEvent[] = raw as GameEvent[];
