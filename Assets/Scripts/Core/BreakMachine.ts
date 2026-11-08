// Break state machine. Pure, deterministic, no Lens APIs.
import { Timing } from "./Timing";

export type BreakState = "working" | "intro" | "hiding" | "ready" | "snoozed" | "caught";

export type BreakSnapshot = {
  state: BreakState;
  ring: number;
  streak: number;
  spot: number;
  findMs: number;
  demo: boolean;
  workProgress: number;
  stateMs: number;
};

export type PinchResult = "caught" | "wiggle" | "ignored";

const MAX_DT_MS = 1000;

export class BreakMachine {
  onChange: ((from: BreakState, to: BreakState) => void) | null = null;

  private timing: Timing;
  private demo: boolean;
  private spotCount: number;

  private _state: BreakState = "working";
  private _ring = 0;
  private _streak = 0;
  private _spot = 0;
  private _findMs = 0;
  private nextSpot = 0;
  private workElapsed = 0;
  private stateMs = 0;

  constructor(timing: Timing, demo: boolean, spotCount: number = 4) {
    this.timing = timing;
    this.demo = demo;
    this.spotCount = Math.max(1, Math.floor(spotCount));
    this.reset();
  }

  get state(): BreakState { return this._state; }
  get ring(): number { return this._ring; }
  get streak(): number { return this._streak; }
  get spot(): number { return this._spot; }
  get findMs(): number { return this._findMs; }

  /** Back to a fresh session. Does not fire onChange. */
  reset(): void {
    this._state = "working";
    this._ring = 0;
    this._streak = 0;
    this._spot = 0;
    this._findMs = 0;
    this.nextSpot = 0;
    this.workElapsed = 0;
    this.stateMs = 0;
  }

  /** working -> intro. */
  startBreak(): boolean {
    if (this._state !== "working") return false;
    this.go("intro");
    return true;
  }

  /** hiding | ready -> snoozed. */
  snooze(): boolean {
    if (this._state !== "hiding" && this._state !== "ready") return false;
    this.go("snoozed");
    return true;
  }

  /** ready -> caught; hiding -> wiggle (no change); otherwise ignored. */
  pinch(): PinchResult {
    if (this._state === "ready") {
      this._streak += 1;
      this.go("caught");
      return "caught";
    }
    if (this._state === "hiding") return "wiggle";
    return "ignored";
  }

  /** Advance by dtMs. At most one transition per tick; leftover dt is dropped. */
  tick(dtMs: number, looking: boolean): void {
    if (!(dtMs >= 0)) return; // ignores negatives and NaN
    const dt = dtMs > MAX_DT_MS ? MAX_DT_MS : dtMs;
    this.stateMs += dt;
    const t = this.timing;

    switch (this._state) {
      case "working":
        this.workElapsed += dt;
        if (this.workElapsed >= t.workMs) this.go("intro");
        break;
      case "intro":
        if (this.stateMs >= t.introMs) this.go("hiding");
        break;
      case "hiding":
        if (looking) {
          this._ring = t.lookMs > 0 ? Math.min(1, this._ring + dt / t.lookMs) : 1;
          if (this._ring >= 1) {
            this._findMs = this.stateMs;
            this.go("ready");
          }
        }
        break;
      case "ready":
        break; // waits for pinch or snooze
      case "snoozed":
        if (this.stateMs >= t.snoozeMs) this.go("intro");
        break;
      case "caught":
        if (this.stateMs >= t.cardMs) this.go("working");
        break;
    }
  }

  snapshot(): BreakSnapshot {
    return {
      state: this._state,
      ring: this._ring,
      streak: this._streak,
      spot: this._spot,
      findMs: this._findMs,
      demo: this.demo,
      workProgress: this.workProgress(),
      stateMs: this.stateMs,
    };
  }

  /** e.g. "state=hiding;ring=0.45;streak=0;spot=0;findMs=0;demo=1" */
  snapshotString(): string {
    return "state=" + this._state +
      ";ring=" + this._ring.toFixed(2) +
      ";streak=" + this._streak +
      ";spot=" + this._spot +
      ";findMs=" + Math.round(this._findMs) +
      ";demo=" + (this.demo ? 1 : 0);
  }

  private workProgress(): number {
    const w = this.timing.workMs;
    if (w <= 0) return 1;
    const p = this.workElapsed / w;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  /** Single transition point: per-state entry work, stateMs = 0, then onChange. */
  private go(to: BreakState): void {
    const from = this._state;
    if (to === "intro") {
      this._spot = this.nextSpot;
      this.nextSpot = (this.nextSpot + 1) % this.spotCount;
      this._ring = 0;
      this._findMs = 0;
    } else if (to === "working" && from === "caught") {
      this.workElapsed = 0;
    }
    this._state = to;
    this.stateMs = 0;
    if (this.onChange) {
      try {
        this.onChange(from, to);
      } catch (e) {
        // a throwing listener must never corrupt the machine
      }
    }
  }
}
