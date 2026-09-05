export const ROLES = ["head", "arms", "torso", "lleg", "rleg"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_INFO: Record<Role, { label: string; short: string; emoji: string; blurb: string; keys: { key: string; does: string }[] }> = {
  head: {
    label: "Head & Eyes",
    short: "HEAD",
    emoji: "👀",
    blurb: "You steer the camera and the direction the body faces. Everyone sees what you see.",
    keys: [
      { key: "Mouse / A D", does: "Turn head (body follows)" },
      { key: "W S", does: "Look up / down" },
      { key: "Space", does: "SHOUT" },
    ],
  },
  arms: {
    label: "Arms & Hands",
    short: "ARMS",
    emoji: "🙌",
    blurb: "Reach, grab, carry, climb and throw. Crouch help from Torso makes ground grabs easier.",
    keys: [
      { key: "W S", does: "Raise / lower arms (pull up when hanging)" },
      { key: "A D", does: "Swing arms left / right" },
      { key: "Space", does: "Grab (hold) both hands" },
      { key: "Q / E", does: "Grab left / right hand" },
      { key: "Shift", does: "THROW held object" },
    ],
  },
  torso: {
    label: "Torso & Balance",
    short: "TORSO",
    emoji: "🧘",
    blurb: "Lean, crouch, brace. If the body falls over, you get it back up.",
    keys: [
      { key: "W S", does: "Lean forward / back" },
      { key: "A D", does: "Lean left / right" },
      { key: "Shift", does: "Crouch (reach the floor)" },
      { key: "Space", does: "Brace / GET UP" },
    ],
  },
  lleg: {
    label: "Left Leg",
    short: "L LEG",
    emoji: "🦵",
    blurb: "Take steps. Alternate with the right leg to walk. Lift both at once and... good luck.",
    keys: [
      { key: "W", does: "Step forward" },
      { key: "S", does: "Step back" },
      { key: "A D", does: "Side step" },
      { key: "Space", does: "Kick (both legs together = JUMP)" },
    ],
  },
  rleg: {
    label: "Right Leg",
    short: "R LEG",
    emoji: "🦿",
    blurb: "Take steps. Alternate with the left leg to walk. Timing is everything.",
    keys: [
      { key: "W", does: "Step forward" },
      { key: "S", does: "Step back" },
      { key: "A D", does: "Side step" },
      { key: "Space", does: "Kick (both legs together = JUMP)" },
    ],
  },
};

export interface RoleInput {
  f: number; // forward/back axis -1..1
  s: number; // side axis -1..1
  a: boolean; // space
  b: boolean; // shift
  q: boolean;
  e: boolean;
  lx: number; // head yaw (radians, absolute)
  ly: number; // head pitch (radians, absolute)
}

export const emptyInput = (): RoleInput => ({ f: 0, s: 0, a: false, b: false, q: false, e: false, lx: 0, ly: 0 });

export type Phase = "lobby" | "countdown" | "playing" | "results";

export interface PlayerInfo {
  id: string;
  name: string;
  teamId: number;
  roles: Role[];
  ready: boolean;
}

export interface TeamInfo {
  id: number;
  name: string;
  color: string;
  hostId: string | null;
  finishMs: number | null;
}

export interface RoomSnapshot {
  code: string;
  phase: Phase;
  challengeId: string;
  players: PlayerInfo[];
  teams: TeamInfo[];
  startAt: number | null;
  round: number;
  now: number;
  leaderId: string | null;
}

export interface ChallengeMeta {
  id: string;
  name: string;
  tagline: string;
  goal: string;
  icon: string;
}

export const CHALLENGES: ChallengeMeta[] = [
  { id: "wobble-run", name: "Wobble Run", tagline: "Hurdles, a skinny bridge, a ramp and a wall.", goal: "Reach the finish gate", icon: "🏁" },
  { id: "egg-express", name: "Egg Express", tagline: "Carry the giant egg. Do NOT drop it.", goal: "Deliver the egg to the pad", icon: "🥚" },
  { id: "slam-dunk", name: "Slam Dunk", tagline: "Pick up balls. Throw them in the hoop.", goal: "Score 3 baskets", icon: "🏀" },
];

export const TEAM_COLORS = ["#ff5d5d", "#4fa8ff", "#ffd23f", "#6ef29a", "#c58bff", "#ff9a3c"];

export const MAX_TEAM_SIZE = 5;

export function formatTime(ms: number | null | undefined): string {
  if (ms == null) return "--:--.--";
  const total = Math.max(0, Math.floor(ms));
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}
