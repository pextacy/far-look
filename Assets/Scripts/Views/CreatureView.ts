// CreatureView — drives Pip's pose as a pure function of (machine state, stateMs).
// Lives on the Creature root. Every frame while visible it writes:
//   - root world position (desk / hop arc / hiding spot + bob),
//   - body (Creature_Body) local scale and local rotation (yaw, wave, wiggle).
// Scale and rotation go on the body child, never on the root, so the collider
// under the root (Creature_Collider) stays unit-scale and unrotated (SIK rule).
// Overrides the controller's teleports on state entry because it runs every frame.
// Assumes the Creature root itself has identity world rotation.
import {clock} from "../Core/Clock"
import {FarLookController} from "../FarLookController"
import {bus, EV} from "../Core/Events"

const DEG = Math.PI / 180
const INTRO_GROW_MS = 300
const INTRO_WAVE_END_MS = 700
const INTRO_HOP_MS = 500
const WAVE_DEG = 15
const WAVE_CYCLES = 2
const POP_UP_MS = 150
const POP_TOTAL_MS = 400
const POP_PEAK = 1.3
const WIGGLE_MS = 300
const WIGGLE_DEG = 10
const WIGGLE_CYCLES = 3

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

function easeOutCubic(x: number): number {
  const k = 1 - clamp01(x)
  return 1 - k * k * k
}

@component
export class CreatureView extends BaseScriptComponent {
  @ui.label("Creature view: intro hop, bob, pop, wiggle")
  @ui.separator
  @input
  @hint("FarLookController that owns the break state machine")
  controller: FarLookController

  @input
  @hint("Creature_Body child holding the meshes (receives scale and rotation)")
  body: SceneObject

  @input
  @hint("Height of the hop arc above the straight desk-to-spot line, in cm")
  hopPeakCm: number = 60

  @input
  @hint("Idle bob amplitude while hiding, in cm")
  bobCm: number = 2

  @input
  @hint("Idle bob frequency while hiding, in Hz")
  bobHz: number = 1

  @input
  @hint("Extra yaw in degrees if the mesh front is not +Z (0 = mesh faces +Z)")
  facingOffsetDeg: number = 0

  private rootT: Transform
  private bodyT: Transform | null = null
  private restScale: vec3 = vec3.one()
  private restRot: quat = quat.quatIdentity()
  private pos: vec3 = new vec3(0, 0, 0)
  private scl: vec3 = new vec3(1, 1, 1)
  private wiggleStart: number = -1
  private warned: boolean = false

  onAwake(): void {
    this.rootT = this.sceneObject.getTransform()
    if (this.body) {
      this.bodyT = this.body.getTransform()
      const s = this.bodyT.getLocalScale()
      this.restScale = new vec3(s.x, s.y, s.z)
      this.restRot = this.bodyT.getLocalRotation()
    } else {
      console.error("[CreatureView] missing input: body (Creature_Body)")
    }

    // Early pinch leaves the machine in "hiding" (pinch() returns "wiggle"),
    // so this check is independent of listener order on the bus.
    bus.on(EV.CREATURE_PINCH, () => {
      if (this.controller && this.controller.machine && this.controller.machine.state === "hiding") {
        this.wiggle()
      }
    })

    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /** Starts a 300 ms yaw wiggle overlay on the body ("not yet"). */
  wiggle(): void {
    this.wiggleStart = clock.t
  }

  private onUpdate(): void {
    const c = this.controller
    if (!c || !c.machine || !this.bodyT) {
      if (!this.warned) {
        this.warned = true
        console.error("[CreatureView] missing input: controller or body")
      }
      return
    }
    const desk = c.deskPosition
    const spot = c.currentSpotPosition
    if (!desk || !spot) return

    const state = c.machine.state
    const t = c.machine.snapshot().stateMs
    let scale = 1
    let yaw = 0
    let roll = 0

    if (state === "intro") {
      if (t < INTRO_WAVE_END_MS) {
        this.setPos(desk.x, desk.y, desk.z)
        yaw = this.yawToCamera(desk)
        if (t < INTRO_GROW_MS) {
          scale = easeOutCubic(t / INTRO_GROW_MS)
        } else {
          const w = (t - INTRO_GROW_MS) / (INTRO_WAVE_END_MS - INTRO_GROW_MS)
          roll = WAVE_DEG * DEG * Math.sin(2 * Math.PI * WAVE_CYCLES * w)
        }
      } else {
        const u = clamp01((t - INTRO_WAVE_END_MS) / INTRO_HOP_MS)
        this.setPos(
          desk.x + (spot.x - desk.x) * u,
          desk.y + (spot.y - desk.y) * u + 4 * this.hopPeakCm * u * (1 - u),
          desk.z + (spot.z - desk.z) * u
        )
        yaw = Math.atan2(spot.x - desk.x, spot.z - desk.z)
      }
    } else if (state === "hiding" || state === "ready") {
      const bob = this.bobCm * Math.sin(2 * Math.PI * this.bobHz * clock.t)
      this.setPos(spot.x, spot.y + bob, spot.z)
      yaw = this.yawToCamera(spot)
    } else if (state === "caught") {
      this.setPos(spot.x, spot.y, spot.z)
      yaw = this.yawToCamera(spot)
      if (t < POP_UP_MS) {
        scale = 1 + (POP_PEAK - 1) * easeOutCubic(t / POP_UP_MS)
      } else if (t < POP_TOTAL_MS) {
        scale = POP_PEAK * (1 - clamp01((t - POP_UP_MS) / (POP_TOTAL_MS - POP_UP_MS)))
      } else {
        scale = 0
      }
    } else {
      // working / snoozed: the controller hides the creature; nothing to pose.
      return
    }

    // Wiggle overlay (yaw), time-based so it survives state ticks.
    if (this.wiggleStart >= 0) {
      const w = (clock.t - this.wiggleStart) * 1000
      if (w < WIGGLE_MS) {
        yaw += WIGGLE_DEG * DEG * Math.sin(2 * Math.PI * WIGGLE_CYCLES * (w / WIGGLE_MS))
      } else {
        this.wiggleStart = -1
      }
    }

    this.rootT.setWorldPosition(this.pos)

    const s = Math.max(scale, 0.0001) // avoid a degenerate zero-scale matrix
    this.scl.x = this.restScale.x * s
    this.scl.y = this.restScale.y * s
    this.scl.z = this.restScale.z * s
    this.bodyT.setLocalScale(this.scl)

    const rot = quat.fromEulerAngles(0, yaw + this.facingOffsetDeg * DEG, roll).multiply(this.restRot)
    this.bodyT.setLocalRotation(rot)
  }

  private setPos(x: number, y: number, z: number): void {
    this.pos.x = x
    this.pos.y = y
    this.pos.z = z
  }

  /** Yaw (radians, about +Y) that turns the +Z front from `from` towards the camera. */
  private yawToCamera(from: vec3): number {
    const camT = this.controller.cameraTransform
    if (!camT) return 0
    const cp = camT.getWorldPosition()
    const dx = cp.x - from.x
    const dz = cp.z - from.z
    if (dx * dx + dz * dz < 1e-6) return 0
    return Math.atan2(dx, dz)
  }
}
