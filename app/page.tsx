"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type TeamKey = "celtics" | "knicks";
type Sentiment = "hype" | "roast" | "neutral";
type Mode = "hype_my_team" | "roast_opponent" | "balanced_chaos";
type Intensity = "mild" | "spicy" | "unhinged_clean";
type Persona = "announcer";

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

const CELTICS_CANNED_SPICY: Array<{
  line: string;
  sentiment: Sentiment;
  crowdEnergy: number;
  screenCaption: string;
}> = [
  {
    line: "Jayson Tatum my glorious king hits a deep step back three, making the Knicks wet their diapers.",
    sentiment: "hype",
    crowdEnergy: 96,
    screenCaption: "TATUM FROM DEEP",
  },
  {
    line: "Knicks players always losing aura.",
    sentiment: "roast",
    crowdEnergy: 78,
    screenCaption: "NO AURA",
  },
  {
    line: "My glorious king and his amazing footwork — the Knicks need a GPS to see him. He can't be stopped.",
    sentiment: "hype",
    crowdEnergy: 95,
    screenCaption: "JB UNSTOPPABLE",
  },
  {
    line: "Mikal Bridges been on half the league and still getting passed around.",
    sentiment: "roast",
    crowdEnergy: 70,
    screenCaption: "BRIDGES EXPOSED",
  },
  {
    line: "The crowd and I are exploding right now. Knicks, what are we doing?",
    sentiment: "hype",
    crowdEnergy: 97,
    screenCaption: "WHITE FROM THE CORNER",
  },
  {
    line: "Josh Hart is just Jalen Brunson's sidekick, cant do anything himself smh.",
    sentiment: "roast",
    crowdEnergy: 72,
    screenCaption: "HAIRLINE WATCH",
  },
  {
    line: "Celtics, what are we doing??? Porzingis sent that one back to sender.",
    sentiment: "hype",
    crowdEnergy: 92,
    screenCaption: "KP REJECTS",
  },
  {
    line: "OH MY GOD CELTICS FOR THE WIN. GOODBYE KNICKS.",
    sentiment: "hype",
    crowdEnergy: 100,
    screenCaption: "CELTICS WIN",
  },
];

const CELTICS_CANNED_UNHINGED: Array<{
  line: string;
  sentiment: Sentiment;
  crowdEnergy: number;
  screenCaption: string;
}> = [
  {
    line: "Tatum just dropped that from way downtown and the Knicks crowd went silent like somebody unplugged the arena.",
    sentiment: "hype",
    crowdEnergy: 100,
    screenCaption: "SILENCER THREE",
  },
  {
    line: "He looks like the default 2K face scan before customization.",
    sentiment: "roast",
    crowdEnergy: 90,
    screenCaption: "DEFAULT BUILD",
  },
  {
    line: "Brown took off like he had cheat codes. Knicks defense looked stuck in warmups.",
    sentiment: "hype",
    crowdEnergy: 99,
    screenCaption: "CHEAT CODE DUNK",
  },
  {
    line: "Mikal Bridges been on half the league and still getting passed around.",
    sentiment: "roast",
    crowdEnergy: 92,
    screenCaption: "BRIDGES EXPOSED",
  },
  {
    line: "Derrick White from the corner again. Knicks are collecting jump-shot trauma in real time.",
    sentiment: "hype",
    crowdEnergy: 98,
    screenCaption: "CORNER DAGGER",
  },
  {
    line: "That's a lucky lay, he not doin that again.",
    sentiment: "roast",
    crowdEnergy: 90,
    screenCaption: "LUCKY BOUNCE",
  },
  {
    line: "Porzingis just sent that shot to another zip code. Rim protection on full lockdown.",
    sentiment: "hype",
    crowdEnergy: 97,
    screenCaption: "ZIP CODE BLOCK",
  },
  {
    line: "Final buzzer, Celtics handled business. Knicks can hold this scoreboard all night.",
    sentiment: "hype",
    crowdEnergy: 100,
    screenCaption: "GAME OVER",
  },
];

const FIXED_VOICE_ID = "qZkuFcRFTdS6vkYu5ABx";
const TALKING_GUY_IMAGE = "/images/trash-talk-guy.png";

export default function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const [mode, setMode] = useState<Mode>("balanced_chaos");
  const [intensity, setIntensity] = useState<Intensity>("spicy");
  const [persona, setPersona] = useState<Persona>("announcer");
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stopVoice() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

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
    runCommentary(eventIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, mode, intensity, persona, eventIndex]);

  const goPrev = () => setEventIndex((i) => Math.max(0, i - 1));
  const goNext = () => setEventIndex((i) => Math.min(DEMO_EVENTS.length - 1, i + 1));
  const replay = () => runCommentary(eventIndex);

  async function runCommentary(index: number) {
    stopVoice();
    setIsLoadingCommentary(true);
    const ev = DEMO_EVENTS[index];
    const celticsCanned =
      intensity === "unhinged_clean"
        ? CELTICS_CANNED_UNHINGED
        : intensity === "spicy"
        ? CELTICS_CANNED_SPICY
        : null;

    if (selectedTeam === "celtics" && celticsCanned?.[index]) {
      const canned = celticsCanned[index];
      const data: CommentaryResponse = {
        commentary: canned.line,
        sentiment: canned.sentiment,
        crowdEnergy: canned.crowdEnergy,
        screenCaption: canned.screenCaption,
      };
      setCommentary(data);
      setHistory((prev) =>
        [{ play: ev.event.description, line: data.commentary, sentiment: data.sentiment }, ...prev].slice(0, 5)
      );
      setIsLoadingCommentary(false);
      void playVoice(data.commentary);
      return;
    }

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
      void playVoice(safeData.commentary);
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
      void playVoice(fallback.commentary);
    } finally {
      setIsLoadingCommentary(false);
    }
  }

  async function playVoice(text: string) {
    stopVoice();
    setIsSpeaking(true);
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: FIXED_VOICE_ID }),
      });
      const data = (await response.json()) as { audioUrl?: string | null };

      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          if (audioRef.current === audio) audioRef.current = null;
          setIsSpeaking(false);
        };
        await audio.play();
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
          <label style={styles.label}>Commentary Persona</label>
          <select style={styles.select} value={persona} onChange={(e) => setPersona(e.target.value as Persona)}>
            <option value="announcer">Announcer</option>
          </select>
          <button
            style={styles.switchBtn}
            onClick={() => {
              setSelectedTeam(null);
              setEventIndex(0);
            }}
          >
            Switch Team
          </button>
        </aside>

        <section style={styles.centerPanel}>
          <div style={styles.eventCard}>
            <div style={styles.eventHeader}>
              <p style={styles.kicker}>Current Play</p>
              <span style={styles.playCount}>
                Play {eventIndex + 1} / {DEMO_EVENTS.length}
              </span>
            </div>
            <h2 style={styles.eventLine}>{currentEvent.event.description}</h2>
            <p style={styles.meta}>
              {currentEvent.event.player} · {currentEvent.event.team}
            </p>
            <div style={styles.navRow}>
              <button
                style={{ ...styles.navBtn, opacity: eventIndex === 0 ? 0.4 : 1 }}
                onClick={goPrev}
                disabled={eventIndex === 0 || isLoadingCommentary}
              >
                ◀ Prev
              </button>
              <button
                style={{ ...styles.navBtn, background: `${teamTheme.main}33`, borderColor: `${teamTheme.main}aa` }}
                onClick={replay}
                disabled={isLoadingCommentary}
              >
                ↻ Replay
              </button>
              <button
                style={{
                  ...styles.navBtn,
                  background: isSpeaking ? "#ff313126" : "#1a2240",
                  borderColor: isSpeaking ? "#ff3131aa" : "#38436e",
                  opacity: isSpeaking ? 1 : 0.45,
                }}
                onClick={stopVoice}
                disabled={!isSpeaking}
              >
                ⏹ Stop
              </button>
              <button
                style={{ ...styles.navBtn, opacity: eventIndex === DEMO_EVENTS.length - 1 ? 0.4 : 1 }}
                onClick={goNext}
                disabled={eventIndex === DEMO_EVENTS.length - 1 || isLoadingCommentary}
              >
                Next ▶
              </button>
            </div>
          </div>

          <div style={styles.orbWrap}>
            <div style={styles.orbTitle}>TRASH TALK</div>
            <div
              style={{
                ...styles.orb,
                boxShadow: isSpeaking
                  ? `0 0 48px ${teamTheme.main}99, 0 0 80px ${teamTheme.accent}55`
                  : `0 0 30px ${teamTheme.main}55`,
                transform: isSpeaking ? "scale(1.04)" : "scale(1)",
              }}
            >
              <img alt="Trash talk host" src={TALKING_GUY_IMAGE} style={styles.orbImage} />
            </div>
            <div style={styles.orbLabel}>{isSpeaking ? "Mic Hot" : "Standby"}</div>
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
  eventHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  playCount: { fontSize: 12, color: "#96a3d3", fontWeight: 700, letterSpacing: 0.4 },
  navRow: { display: "flex", gap: 8, marginTop: 12 },
  navBtn: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid #38436e",
    background: "#1a2240",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "opacity 160ms",
  },
  kicker: { margin: 0, color: "#96a3d3", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" },
  eventLine: { margin: "8px 0 6px", fontSize: 22, lineHeight: 1.2 },
  meta: { margin: 0, color: "#b7c0e0", fontSize: 13 },
  orbWrap: { display: "grid", justifyItems: "center", alignContent: "center", gap: 10 },
  orbTitle: { fontSize: 14, letterSpacing: 1.1, color: "#f2c94c", fontWeight: 800 },
  orb: {
    width: 134,
    height: 134,
    borderRadius: "50%",
    border: "1px solid #425086",
    background: "radial-gradient(circle at 30% 30%, #2b3460, #141a31 58%, #0b1020)",
    color: "#fff",
    fontSize: 46,
    transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1)",
    display: "grid",
    placeItems: "center",
  },
  orbLabel: { color: "#aab3d5", fontSize: 13, fontWeight: 600 },
  orbImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #3b4777",
  },
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
