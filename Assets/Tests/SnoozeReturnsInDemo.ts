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

// Criterion 4: Snooze hides the break; in demo mode it comes back after 30 s.
@component
export class SnoozeReturnsInDemo extends Scenario {
  async run(): Promise<void> {
    resetLens()
    const interactor = new DefaultLeafInteractor()
    await tap(interactor, "Btn_StartBreak")
    await sleep(1600)
    await tap(interactor, "Btn_Snooze")
    await sleep(300)
    expect(debugField("state")).toBe("snoozed")
    expect(mustFind("Creature").enabled).toBe(false)
    // 30 s snooze + 1.2 s intro.
    await sleep(31800)
    const s = debugField("state")
    print("[LEAF] snooze_returns_in_demo state after wait=" + s)
    expect(s === "hiding" || s === "intro").toBe(true)
  }
}
