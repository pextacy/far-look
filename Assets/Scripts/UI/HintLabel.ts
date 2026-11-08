// HintLabel — start hint above the desk ("Study as usual. Pip will find you." / "Then you find Pip.").
// Visible until the first break starts (state leaves "working" for the first time), then
// fades alpha to 0 over fadeMs and disables the Text component. Stays hidden afterwards.
// Root stays enabled; only the Text component is faded/disabled.
import {clock} from "../Core/Clock"
import {FarLookController} from "../FarLookController"
import {HINT_LINES} from "../Core/Copy"

const BODY = {size: 39, weight: 500} // type scale at 110 cm
const COLOR = new vec4(0.96, 0.98, 1, 1) // light white

@component
export class HintLabel extends BaseScriptComponent {
  @ui.label("Start hint, fades after the first break")
  @ui.separator
  @input
  @hint("FarLookController (read-only: state)")
  controller: FarLookController

  @input
  @hint("Distance from the user's eyes in cm; scales the text size (role size x distance / 110)")
  viewDistanceCm: number = 75

  @input
  @hint("Fade-out duration in ms")
  fadeMs: number = 800

  private text: Text
  private phase: "visible" | "fading" | "hidden" = "visible"
  private fadeT: number = 0
  private warned: boolean = false

  onAwake(): void {
    let t = this.sceneObject.getComponent("Component.Text") as Text
    if (!t) t = this.sceneObject.createComponent("Component.Text") as Text
    t.depthTest = true
    t.size = BODY.size * (this.viewDistanceCm / 110)
    t.weight = BODY.weight
    t.textFill.color = COLOR
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.text = HINT_LINES.join("\n")
    this.text = t
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onUpdate(): void {
    if (this.phase === "hidden") return
    if (!this.controller || !this.controller.machine) {
      if (!this.warned) {
        console.error("[HintLabel] missing input: controller")
        this.warned = true
      }
      return
    }
    if (this.phase === "visible") {
      if (this.controller.machine.state === "working") return
      this.phase = "fading"
      this.fadeT = 0
      console.log("[HintLabel] fade out")
    }
    // fading
    this.fadeT += clock.dt * 1000
    const k = this.fadeMs > 0 ? Math.min(1, this.fadeT / this.fadeMs) : 1
    this.text.textFill.color = new vec4(COLOR.x, COLOR.y, COLOR.z, COLOR.w * (1 - k))
    if (k >= 1) {
      this.text.enabled = false
      this.phase = "hidden"
      console.log("[HintLabel] hidden")
    }
  }
}
