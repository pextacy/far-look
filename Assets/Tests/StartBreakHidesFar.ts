// LEAF scenario (PLAN.md §10).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {
  debugField,
  edgeArrow,
  horizontalDistance,
  mustFind,
  resetLens,
  scoreCard,
  tap,
} from "./FarLookTestUtils"

// Criterion 1: Start break -> creature hops to a spot >= 5 m away, chime plays, edge arrow points to it.
@component
export class StartBreakHidesFar extends Scenario {
  async run(): Promise<void> {
    const c = resetLens()
    const interactor = new DefaultLeafInteractor()
    const start = c.cameraTransform.getWorldPosition()
    await tap(interactor, "Btn_StartBreak")
    await sleep(1600)
    expect(debugField("state")).toBe("hiding")
    const creature = mustFind("Creature")
    expect(creature.enabled).toBe(true)
    const d = horizontalDistance(creature.getTransform().getWorldPosition(), start)
    print("[LEAF] start_break_hides_far distance=" + d.toFixed(1))
    expect(d >= 499.5).toBe(true)
    // Spot_0 is 45 deg to the right, outside the view -> arrow visible.
    expect(edgeArrow().isShowing).toBe(true)
    // Chime (0.8 s) started on entering hiding at ~1.2 s, so it is still playing.
    const chime = mustFind("Sfx_Chime").getComponent("Component.AudioComponent") as AudioComponent
    expect(chime.isPlaying()).toBe(true)
  }
}
