"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHALLENGES, ROLES, ROLE_INFO, formatTime } from "@/game/types";
import { DbConnection, type EventContext } from "@/module_bindings";
import { SPACETIMEDB_MODULE, SPACETIMEDB_URI } from "@/game/net";

interface ScoreRow {
  id: string;
  challengeId: string;
  teamName: string;
  players: string[];
  timeMs: number;
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/** Live leaderboard straight from SpacetimeDB — no API routes involved. */
function useScoreFeed() {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [online, setOnline] = useState(false);
  const cache = useRef(new Map<string, { challengeId: string; teamName: string; players: string[]; timeMs: number }>());

  useEffect(() => {
    let disposed = false;
    const sync = () => {
      const list = [...cache.current.entries()]
        .map(([id, r]) => ({ id, ...r }))
        .sort((a, b) => a.timeMs - b.timeMs)
        .slice(0, 60);
      setRows(list);
    };
    const conn = DbConnection.builder()
      .withUri(SPACETIMEDB_URI)
      .withDatabaseName(SPACETIMEDB_MODULE)
      .onConnect((c) => {
        if (disposed) return;
        c.subscriptionBuilder()
          .onApplied(() => !disposed && setOnline(true))
          .subscribe(["SELECT * FROM score"]);
        c.db.score.onInsert((_ctx: EventContext, row) => {
          cache.current.set(row.id.toString(), { challengeId: row.challengeId, teamName: row.teamName, players: row.players, timeMs: Number(row.timeMs / 1000n) });
          sync();
        });
        c.db.score.onDelete((_ctx: EventContext, row) => {
          if (cache.current.delete(row.id.toString())) sync();
        });
      })
      .onConnectError(() => !disposed && setOnline(false))
      .onDisconnect(() => !disposed && setOnline(false))
      .build();
    return () => {
      disposed = true;
      conn.disconnect();
    };
  }, []);

  return { rows, online };
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const { rows, online } = useScoreFeed();

  useEffect(() => {
    setName(localStorage.getItem("singularity_name") ?? "");
  }, []);

  const saveName = () => {
    const n = name.trim().slice(0, 16) || `Player${Math.floor(Math.random() * 90 + 10)}`;
    localStorage.setItem("singularity_name", n);
    return n;
  };
  const create = (solo = false) => {
    saveName();
    setBusy(true);
    router.push(`/play/${makeCode()}${solo ? "?solo=1" : ""}`);
  };
  const join = () => {
    const c = code.trim().toUpperCase();
    if (c.length < 3) return;
    saveName();
    setBusy(true);
    router.push(`/play/${c}`);
  };

  const top = (challengeId: string, n: number) => rows.filter((r) => r.challengeId === challengeId).slice(0, n);

  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1d2a5a_0%,#0b1020_60%)] text-white">
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-16">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/70">Co-op physics party game · SpacetimeDB</div>
          <h1 className="mt-4 text-6xl font-black tracking-tight md:text-8xl">
            SINGULARITY <span className="text-[#ffd23f]">2</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
            Five players. <span className="font-black text-white">One body.</span> Someone steers the head, someone works the arms, someone keeps the torso balanced, and two people each own a leg. Walk, climb, grab, throw — and try not to fall in the water.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {ROLES.map((r) => (
            <div key={r} className="float rounded-2xl bg-white/5 p-4 text-center border border-white/10" style={{ animationDelay: `${Math.random() * 2}s` }}>
              <div className="text-4xl">{ROLE_INFO[r].emoji}</div>
              <div className="mt-1 font-black">{ROLE_INFO[r].label}</div>
              <div className="mt-1 text-xs text-white/60">{ROLE_INFO[r].blurb}</div>
            </div>
          ))}
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <label className="text-xs uppercase tracking-widest text-white/60">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              placeholder="e.g. Left Leg Larry"
              className="mt-1 w-full rounded-xl bg-black/40 px-4 py-3 text-lg font-bold outline-none ring-[#ffd23f] focus:ring-2"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button disabled={busy} onClick={() => create(false)} className="rounded-2xl bg-[#ffd23f] px-5 py-4 text-xl font-black text-black shadow-[0_6px_0_#b8931a] transition hover:brightness-110 active:translate-y-1 active:shadow-none disabled:opacity-60">
                Create room
                <div className="text-xs font-bold opacity-70">invite up to 5 per team</div>
              </button>
              <button disabled={busy} onClick={() => create(true)} className="rounded-2xl bg-white/10 px-5 py-4 text-xl font-black shadow-[0_6px_0_rgba(0,0,0,0.4)] transition hover:bg-white/20 active:translate-y-1 active:shadow-none disabled:opacity-60">
                Solo practice
                <div className="text-xs font-bold opacity-70">control all 5 parts (Tab to switch)</div>
              </button>
            </div>
            <div className="mt-5 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && join()}
                maxLength={6}
                placeholder="ROOM CODE"
                className="w-full rounded-xl bg-black/40 px-4 py-3 text-lg font-black tracking-[0.3em] outline-none ring-[#4fa8ff] focus:ring-2"
              />
              <button disabled={busy} onClick={join} className="rounded-xl bg-[#4fa8ff] px-6 py-3 text-lg font-black text-black hover:brightness-110 disabled:opacity-60">
                Join
              </button>
            </div>
            <div className="mt-5 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
              <div className="rounded-xl bg-black/30 p-3">
                <div className="font-black text-white">How walking works</div>
                Left leg presses <kbd className="rounded bg-white/15 px-1">W</kbd>, then right leg presses <kbd className="rounded bg-white/15 px-1">W</kbd>. Alternate. Both at once? You fall on your face.
              </div>
              <div className="rounded-xl bg-black/30 p-3">
                <div className="font-black text-white">How climbing works</div>
                Torso crouches, arms raise and grab the ledge, arms pull down, legs step, torso leans forward. Shouting helps.
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/60">Challenges & best times</div>
              <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${online ? "bg-[#6ef29a]/15 text-[#6ef29a]" : "bg-white/10 text-white/50"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-[#6ef29a]" : "bg-white/40"}`} />
                {online ? "live" : "offline"}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-4">
              {CHALLENGES.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <div className="font-black">{c.name}</div>
                      <div className="text-xs text-white/60">{c.tagline}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    {top(c.id, 5).length === 0 && <div className="text-xs text-white/40">No times yet.</div>}
                    {top(c.id, 5).map((row, i) => (
                      <div key={row.id} className="flex items-center gap-2 rounded-lg bg-black/30 px-2 py-1 text-xs">
                        <span className="w-4 font-black text-[#ffd23f]">{i + 1}</span>
                        <span className="flex-1 truncate font-bold">{row.teamName}</span>
                        <span className="font-mono">{formatTime(row.timeMs)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/40">Built with Three.js + Rapier physics + SpacetimeDB. Works best in Chrome with a keyboard and four friends yelling at you.</footer>
      </div>
    </main>
  );
}
