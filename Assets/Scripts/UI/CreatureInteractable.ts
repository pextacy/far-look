// CreatureInteractable — makes Pip catchable with a far pinch (SIK).
// Lives on the Creature root. Builds, at runtime:
//   - child "Creature_Collider" at local (0, 7, 0) with a sphere collider
//     (ColliderComponent has no shape offset, so the offset lives on a child;
//     the child is never scaled or rotated — CreatureView only touches Creature_Body),
//   - a SIK Interactable on the root (Direct/Indirect targeting). SIK's
//     InteractionManager auto-discovers colliders in the Interactable's
//     descendants when the Interactable registers in its onAwake, so the collider
//     is created first.
// On pinch release it emits creature:pinch on the bus; the controller decides
// whether that is a catch ("ready") or a wiggle ("hiding"). No state is mutated here.
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractionManager} from "SpectaclesInteractionKit.lspkg/Core/InteractionManager/InteractionManager"
import {bus, EV} from "../Core/Events"

const COLLIDER_NAME = "Creature_Collider"
// SIK Interactable.targetingMode bit flags: Direct = 1, Indirect = 2, Direct/Indirect = 3.
const TARGETING_DIRECT_INDIRECT = 3

@component
export class CreatureInteractable extends BaseScriptComponent {
  @ui.label("Creature interactable: far-pinch catch target")
  @ui.separator
  @input
  @hint("Sphere collider radius in cm (20 = 40 cm target, generous for a far pinch at 5 m)")
  colliderRadiusCm: number = 20

  @input
  @hint("Height of the collider centre above the creature root, in cm")
  colliderHeightCm: number = 7

  @input
  @hint("Draw the collider in the preview (debug only)")
  debugDrawCollider: boolean = false

  interactable: Interactable
  collider: ColliderComponent

  onAwake(): void {
    // 1. Collider first, so SIK finds it when the Interactable registers.
    this.collider = this.ensureCollider()

    // 2. Interactable on the root (reuse an authored one if present).
    const existing = this.sceneObject.getComponent(Interactable.getTypeName()) as Interactable
    this.interactable = existing
      ? existing
      : (this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable)
    this.interactable.targetingMode = TARGETING_DIRECT_INDIRECT
    if (this.interactable.colliders.indexOf(this.collider) < 0) {
      // Only happens with a pre-authored Interactable that registered before our
      // collider existed: add it and re-register (registerInteractable is idempotent).
      this.interactable.colliders.push(this.collider)
      InteractionManager.getInstance().registerInteractable(this.interactable)
    }

    // SIK rule: bind Interactable events in OnStartEvent.
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart(): void {
    // onTriggerEnd = pinch released while still hovering the creature. It fires
    // once per pinch (the interactable leaves its triggered state once, even with
    // several interactors) and matches SIK button "click" semantics, so a pinch
    // that slides off the creature does not count. onTriggerStart would also fire
    // once, but on pinch-down, before the user has committed.
    this.interactable.onTriggerEnd.add(() => {
      console.log("[Creature] pinch")
      bus.emit(EV.CREATURE_PINCH)
    })
    console.log("[Creature] interactable ready radius=" + this.colliderRadiusCm + " mode=" + this.interactable.targetingMode)
  }

  private ensureCollider(): ColliderComponent {
    // The collider sits on the Creature root itself (same object as the
    // Interactable). A child collider was reported by the preview pinch tool as
    // an obstruction in front of the root. The sphere is centred on the feet
    // (root origin); with radius 20 it still covers the whole 16 cm body.
    const host = this.sceneObject
    let col = host.getComponent("Physics.ColliderComponent") as ColliderComponent
    if (!col) col = host.createComponent("Physics.ColliderComponent") as ColliderComponent
    const sphere = Shape.createSphereShape()
    sphere.radius = this.colliderRadiusCm
    col.fitVisual = false
    col.shape = sphere
    col.intangible = false
    col.debugDrawEnabled = this.debugDrawCollider
    return col
  }
}
