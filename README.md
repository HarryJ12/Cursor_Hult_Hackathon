# TrashTalk: Live NBA AI Roasts 

<div align="center">

**Turn live game events into clean, team-biased hype and roast commentary for fans, watch parties, and demo screens**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![xAI](https://img.shields.io/badge/xAI-Grok%20API-111827.svg)](https://x.ai/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-7C3AED.svg)](https://elevenlabs.io/)

</div>

---

## Overview

Most sports commentary is one-size-fits-all.

Fans want a stream that sounds like *their side* of the rivalry, with personality and energy.

**TrashTalk** solves this by turning structured game events into:

- team-biased commentary
- family-friendly roast/hype reactions
- playable AI voice output
- live fan-energy signals for demo UX

This MVP focuses on an East Coast rivalry context (Boston vs New York), which keeps it regionally relevant for local fan culture while staying clean and sponsor-safe.

---

## Key Features

- **Single-screen live demo flow** with team selection and event playback
- **AI commentary generation** (`/api/commentary`) using Grok with guardrails
- **Voice synthesis** (`/api/voice`) via ElevenLabs when configured
- **Fallback resilience**: deterministic commentary if APIs are unavailable
- **Modes and intensity controls**: `hype_my_team`, `roast_opponent`, `balanced_chaos`
- **Sentiment + crowd energy scoring** for quick visual feedback

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19 + TypeScript
- Client-side state-driven UI in `app/page.tsx`

### Backend (API Routes)

- Next.js Route Handlers (`app/api/*`)
- Node.js runtime endpoints
- JSON contracts for commentary and voice payloads

### AI + Voice Integrations

- xAI Grok API (`grok-4.1-fast` default)
- ElevenLabs TTS (`eleven_multilingual_v2`)
- Safety-first prompt design (clean language, no identity-based attacks)

---

## Setup

### Prerequisites

- Node.js 20+
- npm 10+
- xAI API key (required for live LLM commentary)
- ElevenLabs API key + voice ID (optional for TTS)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Cursor_Hult_Hackathon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Set the values in `.env.local`:
```env
XAI_API_KEY=your_xai_key
XAI_MODEL=grok-4.1-fast
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_DEFAULT_VOICE_ID=your_voice_id
```

4. **Run development server**
```bash
npm run dev
```

5. **Open the app**

Visit [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

---

## Project Structure

```txt
Cursor_Hult_Hackathon/
├── app/
│   ├── page.tsx
│   └── api/
│       ├── commentary/route.ts
│       └── voice/route.ts
├── lib/
│   ├── api/
│   │   ├── commentary.ts
│   │   └── voice.ts
│   ├── prompts/
│   │   └── crowdcast.ts
│   ├── events/
│   │   ├── demo-events.ts
│   │   └── event-types.ts
│   ├── data/
│   │   └── game-events.json
│   └── types.ts
├── scripts/
│   └── seed-demo-events.ts
├── .env.example
├── package.json
└── README.md
```

---

## Data Flow

### Commentary Generation Flow

```txt
Live Event (UI) -> POST /api/commentary
               -> buildSystemPrompt() + game context
               -> Grok API (or local fallback response)
               -> JSON: commentary + sentiment + crowdEnergy
               -> UI feed + energy meter
```

### Voice Playback Flow

```txt
Generated commentary line -> POST /api/voice
                         -> ElevenLabs TTS (if configured)
                         -> Base64 audio URL
                         -> Browser playback in UI
```

---

## API Contracts

### `POST /api/commentary`

Input:
```ts
{
  event: Record<string, unknown>,
  homeTeam: string,
  opposingTeam?: string,
  supportTeam?: string,
  targetTeam: string,
  mode: "hype_my_team" | "roast_opponent" | "balanced_chaos",
  intensity: "mild" | "spicy" | "unhinged_clean",
  persona: "announcer"
}
```

Output:
```ts
{
  commentary: string,
  sentiment: "hype" | "roast" | "neutral",
  crowdEnergy: number,
  screenCaption?: string
}
```

### `POST /api/voice`

Input:
```ts
{
  text: string,
  voiceId?: string
}
```

Output:
```ts
{
  audioUrl: string | null,
  provider?: "elevenlabs" | "browser_fallback",
  message?: string
}
```

---

## Regional Relevance (Northeast MVP)

- Built around a **Boston vs New York** NBA rivalry scenario for immediate local context
- Uses language style that matches **regional fan culture** without crossing moderation boundaries
- Keeps content **family-friendly** so it can be used in hackathon demos, student showcases, and sponsor-facing pilots

---

## Demo Notes

- No auth and no live sports feed required for MVP
- Uses deterministic sample game events for predictable demos
- If external APIs fail, app still works with local fallback commentary

---

## License

Copyright (c) 2026 TrashTalk.
All rights reserved.

---

<div align="center">

**Built by Team TrashTalk at the Hult Hackathon 2026**

</div>
