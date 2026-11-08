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

// Criterion 2: the ring fills only while looking; looking away pauses it.
@component
export class RingFillsOnlyWhenLooking extends Scenario {
  async run(): Promise<void> {
    const c = resetLens()
    const interactor = new DefaultLeafInteractor()
    await tap(interactor, "Btn_StartBreak")
    await sleep(1600)
    c.forceLookAtCreature(true)
    await sleep(10000)
    c.forceLookAtCreature(false)
    const r1 = c.machine.ring
    await sleep(3000)
    const r2 = c.machine.ring
    c.forceLookAtCreature(null)
    print("[LEAF] ring_fills_only_when_looking r1=" + r1.toFixed(3) + " r2=" + r2.toFixed(3))
    expect(r1).toBeCloseTo(0.5, 1)
    expect(r2).toBeCloseTo(r1, 3)
  }
}
