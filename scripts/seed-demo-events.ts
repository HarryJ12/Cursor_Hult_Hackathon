import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GameEvent } from "../lib/events/event-types";

const events: GameEvent[] = [
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "4:30",
    score: { Celtics: 101, Knicks: 99 },
    event: {
      type: "made_three",
      player: "Jayson Tatum",
      team: "Celtics",
      description: "Jayson Tatum buries a 27-foot pull-up three from the right wing.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "4:05",
    score: { Celtics: 101, Knicks: 99 },
    event: {
      type: "missed_jumper",
      player: "Jalen Brunson",
      team: "Knicks",
      description: "Jalen Brunson pulls up from the elbow and clangs it off the front rim.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "3:38",
    score: { Celtics: 103, Knicks: 99 },
    event: {
      type: "dunk",
      player: "Jaylen Brown",
      team: "Celtics",
      description: "Jaylen Brown takes it coast-to-coast and finishes with a one-handed slam.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "3:10",
    score: { Celtics: 103, Knicks: 99 },
    event: {
      type: "turnover",
      player: "Karl-Anthony Towns",
      team: "Knicks",
      description: "Karl-Anthony Towns loses the handle on the perimeter and coughs it up.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "2:42",
    score: { Celtics: 103, Knicks: 99 },
    event: {
      type: "foul",
      player: "Josh Hart",
      team: "Knicks",
      description: "Josh Hart hacks Derrick White on the drive — shooting foul called.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "2:18",
    score: { Celtics: 103, Knicks: 99 },
    event: {
      type: "block",
      player: "Kristaps Porzingis",
      team: "Celtics",
      description: "Kristaps Porzingis rises up and swats OG Anunoby's layup attempt off the glass.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "1:55",
    score: { Celtics: 103, Knicks: 99 },
    event: {
      type: "timeout",
      player: "",
      team: "Knicks",
      description: "Tom Thibodeau calls a full timeout to draw something up out of the break.",
    },
  },
  {
    game: "Celtics vs Knicks",
    quarter: "4th",
    time: "0:00",
    score: { Celtics: 112, Knicks: 108 },
    event: {
      type: "game_end",
      player: "",
      team: "Celtics",
      description: "Final buzzer — Celtics close it out 112 to 108 over the Knicks.",
    },
  },
];

const outPath = join(__dirname, "..", "lib", "data", "game-events.json");
writeFileSync(outPath, JSON.stringify(events, null, 2) + "\n");
console.log(`Wrote ${events.length} events to ${outPath}`);
