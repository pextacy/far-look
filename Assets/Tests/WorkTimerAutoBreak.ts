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

// Criterion 5: in demo mode the 60 s work timer starts the break on its own.
@component
export class WorkTimerAutoBreak extends Scenario {
  async run(): Promise<void> {
    resetLens()
    expect(debugField("state")).toBe("working")
    await sleep(61500)
    const s = debugField("state")
    print("[LEAF] work_timer_auto_break state=" + s)
    expect(s === "intro" || s === "hiding").toBe(true)
  }
}
