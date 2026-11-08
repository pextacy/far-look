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

// Criterion 3: when the ring is full, pinching the creature catches it; score card + streak +1.
@component
export class CatchAfterFullRing extends Scenario {
  async run(): Promise<void> {
    const c = resetLens()
    const interactor = new DefaultLeafInteractor()
    const streakBefore = c.machine.streak
    await tap(interactor, "Btn_StartBreak")
    await sleep(1600)
    c.forceLookAtCreature(true)
    await sleep(21000)
    expect(debugField("state")).toBe("ready")
    await tap(interactor, "Creature")
    await sleep(300)
    c.forceLookAtCreature(null)
    expect(debugField("state")).toBe("caught")
    expect(c.machine.streak).toBe(streakBefore + 1)
    const card = scoreCard()
    expect(card.isShowing).toBe(true)
    const text = card.textContent()
    print("[LEAF] catch_after_full_ring card=" + text.split("\n").join(" | "))
    expect(text.includes("Found in")).toBe(true)
  }
}
