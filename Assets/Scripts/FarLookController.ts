// FarLookController — orchestrates the break loop.
// Owns the pure BreakMachine, reads the view direction, places the creature,
// and fans state out to views. UI never mutates the machine: it emits bus events.
import {BreakMachine, BreakState} from "./Core/BreakMachine"
import {timingFor} from "./Core/Timing"
import {bus, EV} from "./Core/Events"
import {angleDeg, isLooking, nextInView, V3} from "./Core/GazeMath"
import {SPOTS, validate} from "./Core/HidingSpots"
import {advanceClock, clock} from "./Core/Clock"

export type StateListener = (from: BreakState, to: BreakState) => void

@component
export class FarLookController extends BaseScriptComponent {
  @ui.label("Far Look controller")
  @ui.separator
  @input
  @hint("Demo timings (60 s work, 30 s snooze). Real timings when off.")
  demoMode: boolean = true

  @input
  @hint("Test hooks for LEAF (resetForTest, forceLookAtCreature). Off in the demo build.")
  testMode: boolean = false

  @input
  @hint("Video capture only: slows every Far Look animation and timer (1 = real time). Keep at 1 in the demo build.")
  captureTimeScale: number = 1

  @input
  @hint("Camera Object (the user's head)")
  cameraObject: SceneObject

  @input
  @hint("Creature root object")
  creature: SceneObject

  @input
  @hint("Parent of Spot_0 … Spot_3")
  spotsRoot: SceneObject

  @input
  @allowUndefined
  @hint("Text mirror of the state snapshot (read by LEAF)")
  debugText: Text

  machine: BreakMachine
  /** Last computed angle between view direction and the creature (deg). */
  gazeAngle: number = 180
  /** Hysteresis in-view flag; edge arrow shows when false during hiding/ready. */
  inView: boolean = true
  /** Last value of "is the user looking at the creature". */
  looking: boolean = false

  private lookOverride: boolean | null = null
  private listeners: StateListener[] = []
  private spotWorld: vec3[] = []
  private deskWorld: vec3 = vec3.zero()
  private eyeY: number = 0
  private camT: Transform
  private creatureT: Transform
  private camPos: V3 = {x: 0, y: 0, z: 0}
  private camFwd: V3 = {x: 0, y: 0, z: -1}
  private lastDebug: string = ""

  onAwake(): void {
    this.machine = new BreakMachine(timingFor(this.demoMode), this.demoMode, SPOTS.length)
    this.machine.onChange = (from, to) => this.onStateChange(from, to)

    bus.on(EV.BREAK_START, () => {
      const ok = this.machine.startBreak()
      console.log("[FarLook] event " + EV.BREAK_START + (ok ? "" : " (ignored in " + this.machine.state + ")"))
    })
    bus.on(EV.BREAK_SNOOZE, () => {
      const ok = this.machine.snooze()
      console.log("[FarLook] event " + EV.BREAK_SNOOZE + (ok ? "" : " (ignored in " + this.machine.state + ")"))
    })
    bus.on(EV.CREATURE_PINCH, () => {
      const r = this.machine.pinch()
      console.log("[FarLook] event " + EV.CREATURE_PINCH + " -> " + r)
    })

    this.createEvent("OnStartEvent").bind(() => this.onStart())
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /** Views subscribe here (called after the machine has transitioned). */
  addStateListener(fn: StateListener): void {
    this.listeners.push(fn)
  }

  /** Creature rest position on the desk (world). */
  get deskPosition(): vec3 {
    return this.deskWorld
  }

  /** World position of the spot the creature is currently using. */
  get currentSpotPosition(): vec3 {
    return this.spotWorld[this.machine.spot] || this.deskWorld
  }

  get cameraTransform(): Transform {
    return this.camT
  }

  // ---- LEAF test hooks (testMode only) ----

  resetForTest(): void {
    if (!this.testMode) {
      console.warn("[FarLook] resetForTest ignored: testMode is off")
      return
    }
    this.lookOverride = null
    this.machine.reset()
    this.onStateChange("working", "working")
    console.log("[FarLook] resetForTest")
  }

  forceLookAtCreature(on: boolean | null): void {
    if (!this.testMode) {
      console.warn("[FarLook] forceLookAtCreature ignored: testMode is off")
      return
    }
    this.lookOverride = on
    console.log("[FarLook] forceLookAtCreature " + on)
  }

  getDebugString(): string {
    return this.machine.snapshotString()
  }

  // ---- lifecycle ----

  private onStart(): void {
    if (!this.cameraObject || !this.creature || !this.spotsRoot) {
      console.error("[FarLook] missing input: cameraObject, creature or spotsRoot")
      return
    }
    this.camT = this.cameraObject.getTransform()
    this.creatureT = this.creature.getTransform()
    this.deskWorld = this.creatureT.getWorldPosition()

    // Hiding spots sit at the user's eye height at start (risk register: preview camera height varies).
    this.eyeY = this.camT.getWorldPosition().y
    const n = this.spotsRoot.getChildrenCount()
    for (let i = 0; i < SPOTS.length; i++) {
      let p: vec3 | null = null
      for (let c = 0; c < n; c++) {
        const child = this.spotsRoot.getChild(c)
        if (child.name === SPOTS[i].name) p = child.getTransform().getWorldPosition()
      }
      if (!p) {
        console.error("[FarLook] missing hiding spot " + SPOTS[i].name)
        p = vec3.zero()
      }
      this.spotWorld.push(new vec3(p.x, this.eyeY, p.z))
    }

    const v = validate()
    const start = this.camT.getWorldPosition()
    let minDist = 1e9
    for (let i = 0; i < this.spotWorld.length; i++) {
      const d = this.spotWorld[i].sub(start)
      minDist = Math.min(minDist, Math.sqrt(d.x * d.x + d.z * d.z))
    }
    if (v.ok && minDist >= 499.5) {
      console.log("[FarLook] LAYOUT_OK spots=" + this.spotWorld.length + " minDist=" + minDist.toFixed(0) + " eyeY=" + this.eyeY.toFixed(1))
    } else {
      console.error("[FarLook] LAYOUT_FAIL " + v.errors.join("; ") + " minDist=" + minDist.toFixed(0))
    }

    this.creature.enabled = false
    this.writeDebug()
    console.log("[FarLook] ready demo=" + (this.demoMode ? 1 : 0) + " test=" + (this.testMode ? 1 : 0))
  }

  private onUpdate(): void {
    clock.scale = this.captureTimeScale > 0 ? this.captureTimeScale : 1
    advanceClock(getDeltaTime())
    if (!this.camT) return
    const dtMs = clock.dt * 1000

    const cp = this.camT.getWorldPosition()
    const fwd = this.camT.getWorldRotation().multiplyVec3(vec3.forward().uniformScale(-1))
    this.camPos.x = cp.x; this.camPos.y = cp.y; this.camPos.z = cp.z
    this.camFwd.x = fwd.x; this.camFwd.y = fwd.y; this.camFwd.z = fwd.z

    const s = this.machine.state
    if (s === "hiding" || s === "ready") {
      this.gazeAngle = angleDeg(this.camFwd, this.camPos, this.creatureT.getWorldPosition())
      this.inView = nextInView(this.inView, this.gazeAngle)
    } else {
      this.gazeAngle = 180
      this.inView = true
    }
    this.looking = this.lookOverride !== null ? this.lookOverride : isLooking(this.gazeAngle)

    this.machine.tick(dtMs, this.looking)
    this.writeDebug()
  }

  private onStateChange(from: BreakState, to: BreakState): void {
    console.log("[FarLook] STATE " + from + " -> " + to + " | " + this.machine.snapshotString())
    if (this.creature && this.creatureT) {
      if (to === "intro") {
        this.creature.enabled = true
        this.creatureT.setWorldPosition(this.deskWorld)
      } else if (to === "hiding") {
        this.creature.enabled = true
        this.creatureT.setWorldPosition(this.currentSpotPosition)
        this.inView = false
      } else if (to === "snoozed" || to === "working") {
        this.creature.enabled = false
      }
    }
    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](from, to)
      } catch (e) {
        console.error("[FarLook] listener error: " + e)
      }
    }
  }

  private writeDebug(): void {
    const s = this.machine.snapshotString()
    if (s === this.lastDebug) return
    this.lastDebug = s
    if (this.debugText) this.debugText.text = s
  }
}
