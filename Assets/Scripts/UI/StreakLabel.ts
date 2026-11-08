// StreakLabel — "Streak N" text on the desk, tilted toward the user (authored rotation).
// Polls controller.machine.streak each frame and rewrites the text only on change.
// Read-only view; never mutates BreakMachine state.
import {FarLookController} from "../FarLookController"
import {streakLabel} from "../Core/Copy"

const SUBHEADLINE = {size: 41, weight: 700} // type scale at 110 cm
const COLOR = new vec4(0.85, 0.97, 1, 1) // light cyan-white

@component
export class StreakLabel extends BaseScriptComponent {
  @ui.label("Streak label on the desk")
  @ui.separator
  @input
  @hint("FarLookController (read-only: streak)")
  controller: FarLookController

  @input
  @hint("Distance from the user's eyes in cm; scales the text size (role size x distance / 110)")
  viewDistanceCm: number = 60

  private text: Text
  private lastStreak: number = -1
  private warned: boolean = false

  onAwake(): void {
    let t = this.sceneObject.getComponent("Component.Text") as Text
    if (!t) t = this.sceneObject.createComponent("Component.Text") as Text
    t.depthTest = true
    t.size = SUBHEADLINE.size * (this.viewDistanceCm / 110)
    t.weight = SUBHEADLINE.weight
    t.textFill.color = COLOR
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.text = streakLabel(0)
    this.text = t
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onUpdate(): void {
    if (!this.controller || !this.controller.machine) {
      if (!this.warned) {
        console.error("[StreakLabel] missing input: controller")
        this.warned = true
      }
      return
    }
    const s = this.controller.machine.streak
    if (s === this.lastStreak) return
    this.lastStreak = s
    this.text.text = streakLabel(s)
  }
}
