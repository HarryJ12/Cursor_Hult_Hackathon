"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type TeamKey = "celtics" | "knicks";
type Sentiment = "hype" | "roast" | "neutral";
type Mode = "hype_my_team" | "roast_opponent" | "balanced_chaos";
type Intensity = "mild" | "spicy" | "unhinged_clean";
type Persona = "hype_announcer" | "boston_fan" | "sportscenter_parody" | "arena_mc";

type GameEvent = {
  quarter: string;
  time: string;
  score: { Celtics: number; Knicks: number };
  event: {
    type: string;
    player: string;
    team: "Celtics" | "Knicks";
    description: string;
  };
};

type CommentaryResponse = {
  commentary: string;
  sentiment: Sentiment;
  crowdEnergy: number;
  screenCaption?: string;
};

const TEAMS: Record<
  TeamKey,
  {
    name: string;
    short: string;
    color: string;
    accent: string;
    logo: string;
    record: string;
  }
> = {
  celtics: {
    name: "Boston Celtics",
    short: "Celtics",
    color: "#007A33",
    accent: "#BA9653",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    record: "61-21",
  },
  knicks: {
    name: "New York Knicks",
    short: "Knicks",
    color: "#006BB6",
    accent: "#F58426",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    record: "50-32",
  },
};

const DEMO_EVENTS: GameEvent[] = [
  {
    quarter: "Q4",
    time: "2:14",
    score: { Celtics: 104, Knicks: 101 },
    event: {
      type: "made_three",
      player: "Jayson Tatum",
      team: "Celtics",
      description: "Jayson Tatum hits a deep step-back three.",
    },
  },
  {
    quarter: "Q4",
    time: "1:58",
    score: { Celtics: 104, Knicks: 101 },
    event: {
      type: "missed_jumper",
      player: "Jalen Brunson",
      team: "Knicks",
      description: "Jalen Brunson misses a contested elbow jumper.",
    },
  },
  {
    quarter: "Q4",
    time: "1:36",
    score: { Celtics: 106, Knicks: 101 },
    event: {
      type: "dunk",
      player: "Jaylen Brown",
      team: "Celtics",
      description: "Jaylen Brown explodes for a transition dunk.",
    },
  },
  {
    quarter: "Q4",
    time: "1:21",
    score: { Celtics: 106, Knicks: 103 },
    event: {
      type: "and_one",
      player: "Mikal Bridges",
      team: "Knicks",
      description: "Mikal Bridges finishes through contact for an and-one.",
    },
  },
  {
    quarter: "Q4",
    time: "0:57",
    score: { Celtics: 109, Knicks: 103 },
    event: {
      type: "made_three",
      player: "Derrick White",
      team: "Celtics",
      description: "Derrick White splashes a corner three.",
    },
  },
  {
    quarter: "Q4",
    time: "0:44",
    score: { Celtics: 109, Knicks: 105 },
    event: {
      type: "layup",
      player: "Josh Hart",
      team: "Knicks",
      description: "Josh Hart scores on a hard baseline cut.",
    },
  },
  {
    quarter: "Q4",
    time: "0:19",
    score: { Celtics: 111, Knicks: 105 },
    event: {
      type: "block",
      player: "Kristaps Porzingis",
      team: "Celtics",
      description: "Kristaps Porzingis rejects the shot at the rim.",
    },
  },
  {
    quarter: "Q4",
    time: "0:00",
    score: { Celtics: 113, Knicks: 106 },
    event: {
      type: "final",
      player: "Final Buzzer",
      team: "Celtics",
      description: "Final buzzer. Celtics close it out in style.",
    },
  },
];

const VOICE_BY_PERSONA: Record<Persona, string> = {
  hype_announcer: "21m00Tcm4TlvDq8ikWAM",
  boston_fan: "29vD33N1CtxCmqQRPOHJ",
  sportscenter_parody: "AZnzlk1XvdvUeBnXmlld",
  arena_mc: "EXAVITQu4vr4xnSDxMaL",
};

export default function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const [mode, setMode] = useState<Mode>("balanced_chaos");
  const [intensity, setIntensity] = useState<Intensity>("spicy");
  const [persona, setPersona] = useState<Persona>("arena_mc");
  const [eventIndex, setEventIndex] = useState(0);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commentary, setCommentary] = useState<CommentaryResponse>({
    commentary: "Choose your side to start the chaos.",
    sentiment: "neutral",
    crowdEnergy: 64,
    screenCaption: "TRASH TALK LIVE",
  });
  const [history, setHistory] = useState<Array<{ play: string; line: string; sentiment: Sentiment }>>([]);

  const currentEvent = DEMO_EVENTS[eventIndex];
  const supportTeamName = selectedTeam === "celtics" ? "Celtics" : "Knicks";
  const targetTeamName = selectedTeam === "celtics" ? "Knicks" : "Celtics";

  const teamTheme = useMemo(() => {
    if (!selectedTeam) {
      return { main: "#00d4ff", accent: "#ff7a00" };
    }
    return { main: TEAMS[selectedTeam].color, accent: TEAMS[selectedTeam].accent };
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) return;
    runCommentary(0);
    const timer = setInterval(() => {
      setEventIndex((prev) => {
        const next = (prev + 1) % DEMO_EVENTS.length;
        runCommentary(next);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, mode, intensity, persona]);

  async function runCommentary(index: number) {
    setIsLoadingCommentary(true);
    const ev = DEMO_EVENTS[index];
    try {
      const response = await fetch("/api/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: ev.event,
          homeTeam: "Celtics",
          opposingTeam: "Knicks",
          supportTeam: supportTeamName,
          targetTeam: targetTeamName,
          mode,
          intensity,
          persona,
        }),
      });

      const data = (await response.json()) as CommentaryResponse;
      const safeData: CommentaryResponse = {
        commentary: data?.commentary || "That play just shifted the energy in the building.",
        sentiment: data?.sentiment || "neutral",
        crowdEnergy: Number.isFinite(data?.crowdEnergy) ? data.crowdEnergy : 72,
        screenCaption: data?.screenCaption || "MOMENTUM SWING",
      };
      setCommentary(safeData);
      setHistory((prev) =>
        [{ play: ev.event.description, line: safeData.commentary, sentiment: safeData.sentiment }, ...prev].slice(0, 5)
      );
    } catch {
      const fallback: CommentaryResponse = {
        commentary: `${supportTeamName} bringing heat while ${targetTeamName} scramble to respond.`,
        sentiment: "neutral",
        crowdEnergy: 70,
        screenCaption: "LIVE MOMENT",
      };
      setCommentary(fallback);
      setHistory((prev) =>
        [{ play: ev.event.description, line: fallback.commentary, sentiment: fallback.sentiment }, ...prev].slice(0, 5)
      );
    } finally {
      setIsLoadingCommentary(false);
    }
  }

  async function handleSpeak() {
    setIsSpeaking(true);
    try {
      const voiceId = VOICE_BY_PERSONA[persona];
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentary.commentary, voiceId }),
      });
      const data = (await response.json()) as { audioUrl?: string | null };

      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
        return;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(commentary.commentary);
        utter.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
        return;
      }
      setIsSpeaking(false);
    } catch {
      setIsSpeaking(false);
    }
  }

  if (!selectedTeam) {
    return (
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.livePill}>LIVE DEMO</div>
          <h1 style={styles.title}>TrashTalk</h1>
          <p style={styles.subtitle}>Pick your side. Let AI glaze your team and cook the other one.</p>
        </section>

        <section style={styles.matchCard}>
          <button
            style={{
              ...styles.teamSide,
              borderColor: "rgba(0,122,51,0.65)",
              boxShadow: "0 0 36px rgba(0,122,51,0.28)",
            }}
            onClick={() => setSelectedTeam("celtics")}
          >
            <img alt="Celtics logo" src={TEAMS.celtics.logo} style={styles.logo} />
            <div style={styles.teamName}>{TEAMS.celtics.short}</div>
            <div style={styles.teamRecord}>{TEAMS.celtics.record}</div>
            <span style={styles.chooseBtn}>Choose Team</span>
          </button>
          <div style={styles.versus}>VS</div>
          <button
            style={{
              ...styles.teamSide,
              borderColor: "rgba(0,107,182,0.7)",
              boxShadow: "0 0 36px rgba(0,107,182,0.3), 0 0 16px rgba(245,132,38,0.2)",
            }}
            onClick={() => setSelectedTeam("knicks")}
          >
            <img alt="Knicks logo" src={TEAMS.knicks.logo} style={styles.logo} />
            <div style={styles.teamName}>{TEAMS.knicks.short}</div>
            <div style={styles.teamRecord}>{TEAMS.knicks.record}</div>
            <span style={styles.chooseBtn}>Choose Team</span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={{ ...styles.scoreboard, borderColor: `${teamTheme.main}66` }}>
        <div style={styles.scoreTeam}>
          <img alt="Celtics logo" src={TEAMS.celtics.logo} style={styles.miniLogo} />
          <span>Celtics</span>
          <strong>{currentEvent.score.Celtics}</strong>
        </div>
        <div style={styles.centerClock}>
          <span style={styles.liveDot} />
          {currentEvent.quarter} · {currentEvent.time}
        </div>
        <div style={styles.scoreTeam}>
          <img alt="Knicks logo" src={TEAMS.knicks.logo} style={styles.miniLogo} />
          <span>Knicks</span>
          <strong>{currentEvent.score.Knicks}</strong>
        </div>
      </header>

      <section style={styles.grid}>
        <aside style={styles.panel}>
          <h3 style={styles.panelTitle}>Control Booth</h3>
          <label style={styles.label}>Mode</label>
          <select style={styles.select} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="hype_my_team">Hype My Team</option>
            <option value="roast_opponent">Roast Opponent</option>
            <option value="balanced_chaos">Balanced Chaos</option>
          </select>
          <label style={styles.label}>Intensity</label>
          <select style={styles.select} value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
            <option value="mild">Mild</option>
            <option value="spicy">Spicy</option>
            <option value="unhinged_clean">Unhinged but Clean</option>
          </select>
          <label style={styles.label}>Voice Persona</label>
          <select style={styles.select} value={persona} onChange={(e) => setPersona(e.target.value as Persona)}>
            <option value="hype_announcer">Hype Announcer</option>
            <option value="boston_fan">Boston Fan</option>
            <option value="sportscenter_parody">SportsCenter Parody</option>
            <option value="arena_mc">Arena MC</option>
          </select>
          <button style={styles.switchBtn} onClick={() => setSelectedTeam(null)}>
            Switch Team
          </button>
        </aside>

        <section style={styles.centerPanel}>
          <div style={styles.eventCard}>
            <p style={styles.kicker}>Current Play</p>
            <h2 style={styles.eventLine}>{currentEvent.event.description}</h2>
            <p style={styles.meta}>
              {currentEvent.event.player} · {currentEvent.event.team}
            </p>
          </div>

          <div style={styles.orbWrap}>
            <button
              onClick={handleSpeak}
              disabled={isLoadingCommentary}
              style={{
                ...styles.orb,
                boxShadow: isSpeaking
                  ? `0 0 48px ${teamTheme.main}99, 0 0 80px ${teamTheme.accent}55`
                  : `0 0 30px ${teamTheme.main}55`,
                transform: isSpeaking ? "scale(1.04)" : "scale(1)",
              }}
            >
              🎙️
            </button>
            <div style={styles.orbLabel}>{isSpeaking ? "Talking..." : "Tap to speak"}</div>
          </div>
        </section>

        <aside style={styles.panel}>
          <h3 style={styles.panelTitle}>Trash Feed</h3>
          <div style={styles.energyRow}>
            <span>AI Energy</span>
            <strong>{commentary.crowdEnergy}</strong>
          </div>
          <div style={styles.energyTrack}>
            <div style={{ ...styles.energyFill, width: `${Math.max(5, commentary.crowdEnergy)}%`, background: teamTheme.main }} />
          </div>
          <div style={styles.sentimentPills}>
            <span style={{ ...styles.pill, background: commentary.sentiment === "hype" ? "#22c55e33" : "#1f2937" }}>Hype</span>
            <span style={{ ...styles.pill, background: commentary.sentiment === "roast" ? "#f9731633" : "#1f2937" }}>Roast</span>
            <span style={{ ...styles.pill, background: commentary.sentiment === "neutral" ? "#38bdf833" : "#1f2937" }}>Neutral</span>
          </div>
          <div style={styles.commentaryBox}>
            {isLoadingCommentary ? <div style={styles.skeleton} /> : <p style={styles.commentaryText}>{commentary.commentary}</p>}
          </div>
          <div style={styles.historyList}>
            {history.map((item, idx) => (
              <article key={`${item.play}-${idx}`} style={styles.historyItem}>
                <div style={styles.historyPlay}>{item.play}</div>
                <div style={styles.historyLine}>{item.line}</div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 20% 0%, #111425, #07080f 45%, #05060b 100%)",
    color: "#f5f7ff",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    padding: "24px",
  },
  hero: { textAlign: "center", margin: "30px auto 20px", maxWidth: 760 },
  livePill: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#ff313126",
    color: "#ff8e8e",
    border: "1px solid #ff313166",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.7,
  },
  title: { fontSize: "clamp(34px, 8vw, 64px)", margin: "12px 0 8px", fontWeight: 800, letterSpacing: -1 },
  subtitle: { margin: 0, color: "#b9bfd6", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: 1.5 },
  matchCard: {
    margin: "22px auto",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 14,
    maxWidth: 1080,
    alignItems: "stretch",
  },
  teamSide: {
    background: "#141827",
    border: "1px solid #2b334f",
    borderRadius: 20,
    padding: "24px 18px",
    display: "grid",
    justifyItems: "center",
    alignContent: "center",
    cursor: "pointer",
    transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  logo: { width: 120, height: 120, objectFit: "contain" },
  teamName: { fontSize: 32, fontWeight: 800, letterSpacing: -0.6, marginTop: 10 },
  teamRecord: { color: "#a8afc8", fontSize: 14, marginTop: 2 },
  chooseBtn: {
    marginTop: 16,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #3c486f",
    background: "#1d2440",
    color: "#f1f5ff",
    fontSize: 13,
    fontWeight: 700,
  },
  versus: {
    alignSelf: "center",
    color: "#7780a0",
    fontWeight: 800,
    letterSpacing: 2,
    fontSize: 20,
    padding: "0 4px",
  },
  scoreboard: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 12,
    alignItems: "center",
    background: "#0f1321",
    border: "1px solid #3a4165",
    borderRadius: 16,
    padding: "14px 16px",
    maxWidth: 1100,
    margin: "0 auto 16px",
  },
  scoreTeam: { display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700 },
  miniLogo: { width: 30, height: 30, objectFit: "contain" },
  centerClock: { color: "#ffbebe", fontWeight: 700, fontSize: 14, justifySelf: "center", display: "flex", alignItems: "center", gap: 8 },
  liveDot: { width: 9, height: 9, borderRadius: "50%", background: "#ff3131", boxShadow: "0 0 12px #ff3131" },
  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 1.2fr minmax(260px, 1fr)",
    gap: 14,
  },
  panel: {
    background: "#111526",
    border: "1px solid #2c3352",
    borderRadius: 14,
    padding: 14,
    minHeight: 420,
  },
  panelTitle: { margin: "4px 0 12px", fontSize: 16, fontWeight: 700 },
  label: { display: "block", marginTop: 10, marginBottom: 6, fontSize: 12, color: "#aab3d4", fontWeight: 600 },
  select: {
    width: "100%",
    background: "#0c1020",
    color: "#eff2ff",
    border: "1px solid #2f3860",
    borderRadius: 10,
    padding: "10px 11px",
    fontSize: 13,
  },
  switchBtn: {
    marginTop: 14,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #38436e",
    background: "#1a2240",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  centerPanel: {
    background: "#111526",
    border: "1px solid #2c3352",
    borderRadius: 14,
    padding: 14,
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: 10,
  },
  eventCard: { background: "#0c1020", border: "1px solid #2f3860", borderRadius: 12, padding: 12 },
  kicker: { margin: 0, color: "#96a3d3", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" },
  eventLine: { margin: "8px 0 6px", fontSize: 22, lineHeight: 1.2 },
  meta: { margin: 0, color: "#b7c0e0", fontSize: 13 },
  orbWrap: { display: "grid", justifyItems: "center", alignContent: "center", gap: 10 },
  orb: {
    width: 134,
    height: 134,
    borderRadius: "50%",
    border: "1px solid #425086",
    background: "radial-gradient(circle at 30% 30%, #2b3460, #141a31 58%, #0b1020)",
    color: "#fff",
    fontSize: 46,
    cursor: "pointer",
    transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  orbLabel: { color: "#aab3d5", fontSize: 13, fontWeight: 600 },
  energyRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#d5dcf7" },
  energyTrack: { marginTop: 8, width: "100%", height: 10, background: "#1c233f", borderRadius: 999, overflow: "hidden" },
  energyFill: { height: "100%", borderRadius: 999, transition: "width 320ms cubic-bezier(0.22, 1, 0.36, 1)" },
  sentimentPills: { display: "flex", gap: 7, marginTop: 12 },
  pill: { borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 700, color: "#edf1ff" },
  commentaryBox: {
    marginTop: 10,
    minHeight: 78,
    background: "#0c1020",
    border: "1px solid #2f3860",
    borderRadius: 10,
    padding: 10,
  },
  commentaryText: { margin: 0, lineHeight: 1.45, fontSize: 14 },
  skeleton: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    background: "linear-gradient(90deg, #1a2240, #2b3560, #1a2240)",
  },
  historyList: { marginTop: 10, display: "grid", gap: 8 },
  historyItem: { background: "#0c1020", border: "1px solid #2f3860", borderRadius: 10, padding: "9px 10px" },
  historyPlay: { fontSize: 12, color: "#98a5d4", marginBottom: 4 },
  historyLine: { fontSize: 13, lineHeight: 1.4 },
};
