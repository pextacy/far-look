// Shared helpers for the Far Look LEAF scenarios.
// Scene names used here are the stable names from PLAN.md §3.
import {FarLookController} from "../Scripts/FarLookController"
import {EdgeArrow} from "../Scripts/Views/EdgeArrow"
import {ScoreCard} from "../Scripts/UI/ScoreCard"
import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"

export function mustFind(name: string): SceneObject {
  const so = findSceneObjectByName(name)
  if (!so) throw new Error(`Scene object "${name}" not found`)
  return so
}

export function controller(): FarLookController {
  const c = mustFind("Controller").getComponent(FarLookController.getTypeName()) as FarLookController
  if (!c) throw new Error("FarLookController not found on Controller")
  return c
}

export function edgeArrow(): EdgeArrow {
  return mustFind("EdgeArrow").getComponent(EdgeArrow.getTypeName()) as EdgeArrow
}

export function scoreCard(): ScoreCard {
  return mustFind("ScoreCard").getComponent(ScoreCard.getTypeName()) as ScoreCard
}

/** Text of the DebugState label, e.g. "state=hiding;ring=0.45;streak=0;spot=0;findMs=0;demo=1". */
export function debugState(): string {
  const t = mustFind("DebugState").getComponent("Component.Text") as Text
  return t.text
}

export function debugField(key: string): string {
  const parts = debugState().split(";")
  for (let i = 0; i < parts.length; i++) {
    const kv = parts[i].split("=")
    if (kv[0] === key) return kv[1]
  }
  return ""
}

export async function tap(interactor: DefaultLeafInteractor, name: string): Promise<void> {
  const it = findInteractableByName(name, undefined, true)
  if (!it) throw new Error(`Interactable "${name}" not found or not enabled`)
  await interactor.trigger(it)
}

/** Every scenario starts from the same state (testMode hook on the controller). */
export function resetLens(): FarLookController {
  const c = controller()
  if (!c.testMode) throw new Error("Controller.testMode must be on for LEAF runs")
  c.resetForTest()
  return c
}

export function horizontalDistance(a: vec3, b: vec3): number {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz)
}
