// Pure gaze maths for Far Look. No Lens APIs: plain numbers and objects only.
// Units: cm. Right-handed, +X right, +Y up, forward is -Z.

export type V3 = { x: number; y: number; z: number };
export type V2 = { x: number; y: number };

/** isLooking threshold (degrees). */
export const LOOK_DEG = 12;
/** Edge arrow appears when the angle rises above this (degrees). */
export const VIEW_SHOW_ARROW_DEG = 16;
/** Edge arrow hides when the angle drops below this (degrees, hysteresis). */
export const VIEW_HIDE_ARROW_DEG = 13;

const EPS = 1e-6;
const RAD_TO_DEG = 180 / Math.PI;

export function v3(x: number, y: number, z: number): V3 {
    return { x: x, y: y, z: z };
}

export function sub(a: V3, b: V3): V3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function dot(a: V3, b: V3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function length(a: V3): number {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

/** Unit vector; zero-safe (returns {0,0,0} for zero length). */
export function normalize(a: V3): V3 {
    const len = length(a);
    if (len < EPS) {
        return { x: 0, y: 0, z: 0 };
    }
    return { x: a.x / len, y: a.y / len, z: a.z / len };
}

/** Angle in degrees between `forward` and (to - from). 180 if either vector is zero length. */
export function angleDeg(forward: V3, from: V3, to: V3): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const lenD = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const lenF = length(forward);
    if (lenD < EPS || lenF < EPS) {
        return 180;
    }
    let c = (forward.x * dx + forward.y * dy + forward.z * dz) / (lenD * lenF);
    if (c > 1) c = 1;
    if (c < -1) c = -1;
    return Math.acos(c) * RAD_TO_DEG;
}

/** True when the target is within the look cone. */
export function isLooking(angle: number): boolean {
    return angle < LOOK_DEG;
}

/** In-view state with hysteresis: stays in view up to SHOW, re-enters below HIDE. */
export function nextInView(prevInView: boolean, angle: number): boolean {
    return prevInView ? angle <= VIEW_SHOW_ARROW_DEG : angle < VIEW_HIDE_ARROW_DEG;
}

/**
 * Screen-plane direction to the target (camera right/up basis), length 1.
 * Target behind with ~0 projection -> {1,0}; in front with ~0 projection -> {0,0}.
 */
export function arrowDir(right: V3, up: V3, forward: V3, from: V3, to: V3): V2 {
    const d = sub(to, from);
    const x = dot(d, right);
    const y = dot(d, up);
    const len = Math.sqrt(x * x + y * y);
    if (len < EPS) {
        return dot(d, forward) < 0 ? { x: 1, y: 0 } : { x: 0, y: 0 };
    }
    return { x: x / len, y: y / len };
}
