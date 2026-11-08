// LEAF scenario index for Far Look. Lives on FarLook/Controller (PLAN.md §3).
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {StartBreakHidesFar} from "./StartBreakHidesFar"
import {RingFillsOnlyWhenLooking} from "./RingFillsOnlyWhenLooking"
import {CatchAfterFullRing} from "./CatchAfterFullRing"
import {SnoozeReturnsInDemo} from "./SnoozeReturnsInDemo"
import {WorkTimerAutoBreak} from "./WorkTimerAutoBreak"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "start_break_hides_far", typename: StartBreakHidesFar.getTypeName()},
    {id: "ring_fills_only_when_looking", typename: RingFillsOnlyWhenLooking.getTypeName()},
    {id: "catch_after_full_ring", typename: CatchAfterFullRing.getTypeName()},
    {id: "snooze_returns_in_demo", typename: SnoozeReturnsInDemo.getTypeName()},
    {id: "work_timer_auto_break", typename: WorkTimerAutoBreak.getTypeName()},
  ]
}
