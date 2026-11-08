// Pure hiding-spot definitions and helpers for Far Look. No Lens APIs.
// Units: cm. Positive angle = to the user's right; forward is -Z.

import { V3 } from "./GazeMath";

export type SpotDef = { name: string; angleDeg: number; distanceCm: number };

export const SPOTS: SpotDef[] = [
    { name: "Spot_0", angleDeg: 45, distanceCm: 550 },
    { name: "Spot_1", angleDeg: -15, distanceCm: 600 },
    { name: "Spot_2", angleDeg: -80, distanceCm: 520 },
    { name: "Spot_3", angleDeg: 100, distanceCm: 500 },
];

export const MIN_DISTANCE_CM = 500;
export const MAX_ABS_ANGLE_DEG = 120;

const DEG_TO_RAD = Math.PI / 180;
// Tolerance for floating-point error in the horizontal-length sanity check.
const LEN_EPS = 1e-6;

/** Horizontal offset from the start position: x = sin(a)*d, y = 0, z = -cos(a)*d. */
export function spotOffset(def: SpotDef): V3 {
    const a = def.angleDeg * DEG_TO_RAD;
    return {
        x: Math.sin(a) * def.distanceCm,
        y: 0,
        z: -Math.cos(a) * def.distanceCm,
    };
}

/** World position of a spot: origin + offset, with y forced to eye height. */
export function spotPosition(def: SpotDef, origin: V3, eyeY: number): V3 {
    const o = spotOffset(def);
    return { x: origin.x + o.x, y: eyeY, z: origin.z + o.z };
}

/** Horizontal (XZ-plane) distance between two points. */
export function horizontalDistance(a: V3, b: V3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}

/** Checks distance >= MIN, |angle| <= MAX, and horizontal offset length >= MIN. */
export function validate(spots: SpotDef[] = SPOTS): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const zero: V3 = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        if (!(s.distanceCm >= MIN_DISTANCE_CM)) {
            errors.push(s.name + ": distance " + s.distanceCm + " < " + MIN_DISTANCE_CM);
        }
        if (!(Math.abs(s.angleDeg) <= MAX_ABS_ANGLE_DEG)) {
            errors.push(s.name + ": |angle| " + Math.abs(s.angleDeg) + " > " + MAX_ABS_ANGLE_DEG);
        }
        const h = horizontalDistance(spotOffset(s), zero);
        if (!(h >= MIN_DISTANCE_CM - LEN_EPS)) {
            errors.push(s.name + ": horizontal length " + h + " < " + MIN_DISTANCE_CM);
        }
    }
    return { ok: errors.length === 0, errors: errors };
}
