export type V3 = [number, number, number];

export interface StaticDef {
  pos: V3; // center
  size: V3; // full extents
  rot?: V3; // euler xyz
  color?: string;
  top?: string;
  kind?: "ground" | "block" | "wall" | "bridge" | "pillar" | "ramp" | "hurdle" | "pedestal";
  grab?: boolean;
}

export interface PropDef {
  kind: "ball" | "crate" | "egg";
  pos: V3;
  radius?: number;
  size?: V3;
  mass: number;
  color: string;
  fragile?: boolean;
  scoring?: boolean;
  deliverable?: boolean;
}

export interface ZoneDef {
  pos: V3;
  size: V3;
  spawn?: V3;
}

export interface LevelDef {
  id: string;
  spawn: V3;
  spawnYaw: number;
  statics: StaticDef[];
  props: PropDef[];
  checkpoints: ZoneDef[];
  finish?: ZoneDef;
  deliver?: ZoneDef;
  hoop?: { pos: V3; radius: number; zone: ZoneDef };
  targetScore?: number;
  killY: number;
  fragileForce?: number;
  objective: string;
}

const GRASS = "#7dd36a";
const GRASS_SIDE = "#4f8f43";
const STONE = "#c9c2b6";
const STONE_SIDE = "#8d857a";
const WOOD = "#d9a066";
const WOOD_SIDE = "#a06a3a";

function ground(pos: V3, size: V3, extra: Partial<StaticDef> = {}): StaticDef {
  return { pos, size, color: GRASS_SIDE, top: GRASS, kind: "ground", grab: false, ...extra };
}
function stone(pos: V3, size: V3, extra: Partial<StaticDef> = {}): StaticDef {
  return { pos, size, color: STONE_SIDE, top: STONE, kind: "block", grab: true, ...extra };
}
function wood(pos: V3, size: V3, extra: Partial<StaticDef> = {}): StaticDef {
  return { pos, size, color: WOOD_SIDE, top: WOOD, kind: "bridge", grab: true, ...extra };
}

const wobbleRun: LevelDef = {
  id: "wobble-run",
  spawn: [0, 0, 3],
  spawnYaw: 0,
  killY: -2.5,
  objective: "Reach the finish gate",
  statics: [
    ground([0, -0.5, 2], [12, 1, 12]),
    // hurdles field
    ground([0, -0.5, -10], [9, 1, 14]),
    stone([0, 0.18, -6.5], [6, 0.36, 0.3], { kind: "hurdle", color: "#e8564f", top: "#ff7a72" }),
    stone([0, 0.18, -9.5], [6, 0.36, 0.3], { kind: "hurdle", color: "#e8564f", top: "#ff7a72" }),
    stone([0, 0.18, -12.5], [6, 0.36, 0.3], { kind: "hurdle", color: "#e8564f", top: "#ff7a72" }),
    stone([-3.2, 0.5, -10], [0.4, 1, 14], { kind: "wall", color: "#f0e7d8", top: "#fff8ea" }),
    stone([3.2, 0.5, -10], [0.4, 1, 14], { kind: "wall", color: "#f0e7d8", top: "#fff8ea" }),
    // bridge over water
    wood([0, -0.15, -22], [1.5, 0.3, 11]),
    ground([0, -0.5, -30.5], [9, 1, 6]),
    // ramp up 2m over 6.2m
    { pos: [0, 0.98, -36.5], size: [4.5, 0.3, 6.6], rot: [0.313, 0, 0], color: WOOD_SIDE, top: WOOD, kind: "ramp", grab: false },
    stone([0, 1, -42], [7, 2, 6.2]),
    // climbing wall (1.3m above plateau)
    stone([0, 1.575, -49], [7, 3.15, 8], { color: "#7a8fb5", top: "#b7c6e6" }),
    // stairs down
    stone([0, 1.05, -54], [7, 2.1, 2]),
    stone([0, 0.525, -56], [7, 1.05, 2]),
    ground([0, -0.5, -62], [10, 1, 10]),
  ],
  props: [
    { kind: "crate", pos: [-1.2, 3.7, -47], size: [0.7, 0.7, 0.7], mass: 5, color: "#e3b04b" },
    { kind: "ball", pos: [1.3, 3.7, -50], radius: 0.45, mass: 3, color: "#8a5cff" },
    { kind: "crate", pos: [0.6, 3.7, -51.5], size: [0.6, 0.6, 0.6], mass: 4, color: "#e3b04b" },
  ],
  checkpoints: [
    { pos: [0, 1, -30.5], size: [9, 4, 6], spawn: [0, 0, -30] },
    { pos: [0, 3, -42], size: [7, 4, 6], spawn: [0, 2, -42] },
    { pos: [0, 5, -49], size: [7, 4, 8], spawn: [0, 3.15, -49] },
  ],
  finish: { pos: [0, 1.5, -64], size: [8, 4, 2] },
};

const eggExpress: LevelDef = {
  id: "egg-express",
  spawn: [0, 0, 3],
  spawnYaw: 0,
  killY: -2.5,
  objective: "Deliver the egg to the glowing pad",
  fragileForce: 950,
  statics: [
    ground([0, -0.5, 2], [12, 1, 12]),
    stone([0, 0.3, 0], [0.7, 0.6, 0.7], { kind: "pedestal", color: "#b98cff", top: "#e5d4ff", grab: false }),
    ground([0, -0.5, -10], [9, 1, 14]),
    stone([0, 0.15, -7], [6, 0.3, 0.3], { kind: "hurdle", color: "#e8564f", top: "#ff7a72" }),
    stone([0, 0.15, -11], [6, 0.3, 0.3], { kind: "hurdle", color: "#e8564f", top: "#ff7a72" }),
    stone([-3.2, 0.5, -10], [0.4, 1, 14], { kind: "wall", color: "#f0e7d8", top: "#fff8ea" }),
    stone([3.2, 0.5, -10], [0.4, 1, 14], { kind: "wall", color: "#f0e7d8", top: "#fff8ea" }),
    // bumpy stepping blocks over water
    wood([0, -0.15, -19], [2.6, 0.3, 4.2]),
    wood([-1.0, -0.15, -23], [2.6, 0.3, 4.2]),
    wood([0.8, -0.15, -27], [2.6, 0.3, 4.2]),
    ground([0, -0.5, -33], [10, 1, 8]),
    stone([0, 0.35, -34], [2.4, 0.7, 2.4], { kind: "pedestal", color: "#3dc9c0", top: "#a4fff8", grab: false }),
  ],
  props: [{ kind: "egg", pos: [0, 0.95, 0], radius: 0.28, mass: 1.4, color: "#fff4d6", fragile: true, deliverable: true }],
  checkpoints: [{ pos: [0, 1, -10], size: [9, 4, 14], spawn: [0, 0, -4] }],
  deliver: { pos: [0, 1.2, -34], size: [2.4, 1.6, 2.4] },
};

const slamDunk: LevelDef = {
  id: "slam-dunk",
  spawn: [0, 0, 4],
  spawnYaw: 0,
  killY: -2.5,
  objective: "Throw 3 balls through the hoop",
  targetScore: 3,
  statics: [
    ground([0, -0.5, -3], [18, 1, 20]),
    stone([0, 0.5, -10.5], [1.6, 1, 1.6], { color: "#7a8fb5", top: "#b7c6e6" }),
    stone([-5, 0.25, -5], [1.5, 0.5, 1.5], { color: "#ffb347", top: "#ffd27f" }),
    stone([5, 0.25, -5], [1.5, 0.5, 1.5], { color: "#ffb347", top: "#ffd27f" }),
    { pos: [0, 2.2, -12.9], size: [0.25, 4.4, 0.25], color: "#555b6e", top: "#555b6e", kind: "pillar", grab: true },
    { pos: [0, 3.4, -12.75], size: [2.6, 1.6, 0.12], color: "#f4f4f8", top: "#f4f4f8", kind: "wall", grab: true },
  ],
  props: [
    { kind: "ball", pos: [-1.2, 0.5, 2], radius: 0.3, mass: 1.1, color: "#ff8a3d", scoring: true },
    { kind: "ball", pos: [0, 0.5, 1.5], radius: 0.3, mass: 1.1, color: "#ff8a3d", scoring: true },
    { kind: "ball", pos: [1.2, 0.5, 2], radius: 0.3, mass: 1.1, color: "#ff8a3d", scoring: true },
    { kind: "ball", pos: [-2.5, 0.5, 0], radius: 0.3, mass: 1.1, color: "#ff8a3d", scoring: true },
    { kind: "ball", pos: [2.5, 0.5, 0], radius: 0.3, mass: 1.1, color: "#ff8a3d", scoring: true },
  ],
  checkpoints: [],
  hoop: { pos: [0, 2.7, -12], radius: 0.62, zone: { pos: [0, 2.35, -12], size: [1.0, 0.5, 1.0] } },
};

export const LEVELS: Record<string, LevelDef> = {
  [wobbleRun.id]: wobbleRun,
  [eggExpress.id]: eggExpress,
  [slamDunk.id]: slamDunk,
};

export function getLevel(id: string): LevelDef {
  return LEVELS[id] ?? wobbleRun;
}
