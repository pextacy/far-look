// TimerDot — small cyan disc on the desk that fills while the user works.
// During "working" the fill disc's area grows linearly with workProgress
// (scale = 3 * sqrt(progress), min 0.1). In every other state the fill stays
// full and breathes gently (scale 2.8..3.2 at 1 Hz). Uses the scene's existing
// TimerDot_Base / TimerDot_Fill children; allocation-free per frame.
import {clock} from "../Core/Clock"
import {FarLookController} from "../FarLookController"

const FULL = 3
const MIN = 0.1
const THICK = 0.3
const PULSE_AMP = 0.2
const PULSE_HZ = 1

@component
export class TimerDot extends BaseScriptComponent {
  @ui.label("Timer dot (work progress)")
  @ui.separator
  @input
  @hint("FarLookController that owns the break state machine")
  controller: FarLookController

  @input
  @hint("The TimerDot_Fill child (cyan disc) that grows with work progress")
  fill: SceneObject

  private fillT: Transform
  private s: vec3 = new vec3(MIN, THICK, MIN)
  private lastX: number = -1

  onAwake(): void {
    if (!this.fill) {
      console.error("[TimerDot] missing input: fill")
      return
    }
    this.fillT = this.fill.getTransform()
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onUpdate(): void {
    const c = this.controller
    if (!c || !c.machine) return
    let x: number
    if (c.machine.state === "working") {
      const p = Math.max(0, Math.min(1, c.machine.snapshot().workProgress))
      x = Math.max(MIN, FULL * Math.sqrt(p))
    } else {
      x = FULL + PULSE_AMP * Math.sin(Math.PI * 2 * PULSE_HZ * clock.t)
    }
    if (Math.abs(x - this.lastX) < 1e-4) return
    this.lastX = x
    this.s.x = x
    this.s.y = THICK
    this.s.z = x
    this.fillT.setLocalScale(this.s)
  }
}
