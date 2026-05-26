# Cursor_Hult_Hackathon

## Trash Talk — Team Agent Handoff

This README is the shared source of truth so all three of us (and our agents) can work in parallel without overlap.

## Product

- Name: **Trash Talk**
- One-liner: **AI-powered alternate commentary that turns live game events into team-biased, family-friendly hype or roast audio for fans, watch parties, and stadium screens.**

This is not a generic AI commentator. This is personalized fan commentary for the team you love and the team you want cooked.

## Pitch (exact framing)

> Sports broadcasts are still one-size-fits-all. CrowdCast AI turns live game events into personalized alternate commentary for fans, watch parties, and stadium screens. Pick your team, pick your vibe, and the app generates clean, funny, team-biased commentary with voice playback in real time.

## Ownership

- **You (Harry):** API + ElevenLabs + Grok integration.
- **Frontend owner:** UI only.
- **Database owner:** game/event persistence in JSON-ready format for backend consumption.

### Frontend scope (strict)

- One page only
- No auth
- No DB dependency required for MVP demo
- Left: controls
- Center: live event card
- Right: generated commentary + voice
- Button: `Generate next call`
- Crowd reaction meter
- Sentiment label (`hype` | `roast` | `neutral`)

### Backend/AI scope

- `POST /api/commentary`
- LLM prompt + safety rules
- JSON response schema
- Optional `POST /api/voice` with ElevenLabs

### Data scope

- Store one Celtics/Lakers game timeline
- Event objects in JSON structure backend can consume
- Keep schema simple and deterministic

## Recommended File Structure

Use this as the baseline structure so each person can own their area cleanly. It is okay to add files (for scripts or helpers), but stay close to this layout.

```txt
Cursor_Hult_Hackathon/
├─ README.md
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ .env.example
├─ app/
│  ├─ page.tsx                         # Single-page MVP UI (frontend owner)
│  └─ api/
│     ├─ commentary/
│     │  └─ route.ts                   # Grok/LLM commentary generation (backend owner)
│     └─ voice/
│        └─ route.ts                   # ElevenLabs TTS (optional, backend owner)
├─ components/
│  ├─ controls/
│  │  ├─ TeamSelector.tsx
│  │  ├─ ModeSelector.tsx
│  │  ├─ IntensitySelector.tsx
│  │  └─ PersonaSelector.tsx
│  ├─ game/
│  │  ├─ LiveEventCard.tsx
│  │  ├─ ScoreBoard.tsx
│  │  └─ CrowdEnergyMeter.tsx
│  └─ commentary/
│     ├─ CommentaryPanel.tsx
│     ├─ SentimentBadge.tsx
│     └─ AudioPlayerButton.tsx
├─ lib/
│  ├─ events/
│  │  ├─ demo-events.ts                # 8 hardcoded events for demo flow
│  │  └─ event-types.ts
│  ├─ prompts/
│  │  └─ crowdcast-system-prompt.ts
│  ├─ api/
│  │  ├─ commentary-client.ts
│  │  └─ voice-client.ts
│  ├─ audio/
│  │  └─ browser-speech.ts             # Fallback if ElevenLabs is not ready
│  └─ data/
│     └─ game-events.json              # DB partner can own and evolve this contract
├─ scripts/
│  └─ seed-demo-events.ts              # optional helper script
└─ public/
   └─ audio/                           # optional cached/generated clips
```

## MVP Inputs

- Sport: NBA
- Home team: Celtics
- Opposing team: Lakers
- Fan mode:
  - Hype my team
  - Roast opponent
  - Balanced chaos
- Intensity:
  - Mild
  - Spicy
  - Unhinged but clean
- Voice:
  - Hype announcer
  - Boston fan
  - SportsCenter parody
  - Arena MC

## Fake event JSON example

```json
{
  "game": "Celtics vs Lakers",
  "quarter": "4th",
  "time": "1:12",
  "score": {
    "Celtics": 104,
    "Lakers": 101
  },
  "event": {
    "type": "made_three",
    "player": "Jayson Tatum",
    "team": "Celtics",
    "description": "Jayson Tatum makes a 27-foot three pointer"
  }
}
```

## Demo event sequence (hardcoded)

1. Tatum hits 3
2. LeBron misses jumper
3. Brown dunk
4. Davis turnover
5. Reaves foul
6. Porzingis block
7. Lakers timeout
8. Celtics win

## API Contracts

### `POST /api/commentary`

Input:

```ts
{
  event,
  homeTeam,
  targetTeam,
  mode,
  intensity,
  persona
}
```

Output:

```ts
{
  commentary: string,
  sentiment: "hype" | "roast" | "neutral",
  crowdEnergy: number
}
```

### `POST /api/voice` (optional)

Input:

```ts
{ text, voiceId }
```

Output:

```ts
{ audioUrl }
```

If ElevenLabs slows us down, use browser speech synthesis for MVP.

## LLM Core System Prompt

```txt
You are CrowdCast AI, a sports alternate-commentary engine for live fan experiences.

Your job is to turn structured game events into short, punchy, family-friendly commentary lines that feel like a live arena announcer mixed with a funny sports fan.

Rules:
- Keep commentary under 28 words.
- No profanity.
- No slurs.
- No sexual content.
- No hate based on protected traits.
- Do not mention injuries unless the event explicitly includes one.
- Roast only the athletic moment, decision, or play, not the person's identity.
- Make it funny, fast, and specific to the event.
- If the event benefits the user's team, hype the user's team.
- If the event hurts the opposing team, roast the opponent lightly.
- Use basketball culture and fan language.
- Avoid sounding like a generic chatbot.
- Return valid JSON only.

Return:
{
  "commentary": "...",
  "sentiment": "hype" | "roast" | "neutral",
  "crowdEnergy": 0-100,
  "screenCaption": "short caption for stadium/watch-party display"
}
```

User prompt template:

```txt
Game context:
Home team: {{homeTeam}}
Opposing team: {{opposingTeam}}
User wants to support: {{supportTeam}}
Target to roast when appropriate: {{targetTeam}}
Mode: {{mode}}
Intensity: {{intensity}}
Persona: {{persona}}

Current event:
{{eventJson}}

Generate one alternate commentary line.
```

## Example outputs

```json
{
  "commentary": "Tatum just pulled up from Cambridge and dropped it right on their heads.",
  "sentiment": "hype",
  "crowdEnergy": 94,
  "screenCaption": "TATUM FROM DEEP"
}
```

```json
{
  "commentary": "LeBron had the whole calendar year to line that up and still left it short.",
  "sentiment": "roast",
  "crowdEnergy": 88,
  "screenCaption": "NOT THIS TIME"
}
```

```json
{
  "commentary": "Anthony Davis just handed that possession over like it came with a receipt.",
  "sentiment": "roast",
  "crowdEnergy": 82,
  "screenCaption": "FREE DELIVERY"
}
```

## Do Not Build

- live ESPN integration
- real video understanding
- login
- database-heavy profile systems
- social feed
- true livestream sync
- complex voice cloning

## Sponsorship angle

Brands can sponsor commentary modes:

- Red Bull Hype Mode
- Dunkin Boston Mode
- NBA Finals Chaos Mode

## Final MVP

1. Select team + target
2. Click through fake live events
3. Generate funny commentary
4. Play voice
5. Show crowd energy meter
