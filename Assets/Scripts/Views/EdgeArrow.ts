// EdgeArrow — yellow cone near the edge of the view pointing toward the hidden
// creature. Shown only in "hiding"/"ready" while the creature is out of view
// (controller.inView already has hysteresis). Not parented to the camera: the
// world transform is set every frame from the camera basis. 1 RenderMeshVisual.
// The cone mesh tip points along +Y in mesh space; local +Z faces the viewer.
// Units: cm.
import {clock} from "../Core/Clock"
import {FarLookController} from "../FarLookController"
import {arrowDir} from "../Core/GazeMath"

const ARROW_COLOR = new vec4(1, 0.824, 0.247, 1) // #FFD23F
const NUDGE_HZ = 2
const NUDGE_CM = 0.6

@component
export class EdgeArrow extends BaseScriptComponent {
  @ui.label("Edge arrow (points at the hidden creature)")
  @ui.separator
  @input
  @hint("FarLookController that owns the break state and camera")
  controller: FarLookController

  @input
  @hint("Cone mesh; its tip must point along +Y in mesh space")
  mesh: RenderMesh

  @input
  @hint("Unlit material; cloned and tinted yellow")
  material: Material

  @input
  @hint("Distance in front of the eyes in cm")
  distanceCm: number = 60

  @input
  @hint("Offset from the view centre toward the edge in cm (at distanceCm)")
  edgeRadiusCm: number = 13

  @input
  @hint("Arrow length (tip to base) in cm")
  sizeCm: number = 3

  private meshObj: SceneObject
  private tr: Transform
  private showing: boolean = false
  private nudgeT: number = 0

  /** True while the arrow is visible (read by LEAF). */
  get isShowing(): boolean {
    return this.showing
  }

  onAwake(): void {
    this.tr = this.sceneObject.getTransform()

    this.meshObj = global.scene.createSceneObject("EdgeArrow_Mesh")
    this.meshObj.setParent(this.sceneObject)
    const mt = this.meshObj.getTransform()
    mt.setLocalRotation(quat.quatIdentity())

    const rmv = this.meshObj.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (this.mesh) {
      rmv.mesh = this.mesh
      // Normalise the cone so its height along +Y equals sizeCm and its centre sits at the pivot.
      const mn = this.mesh.aabbMin
      const mx = this.mesh.aabbMax
      const h = mx.y - mn.y
      const k = h > 1e-4 ? this.sizeCm / h : this.sizeCm
      mt.setLocalScale(new vec3(k, k, k))
      mt.setLocalPosition(new vec3(-(mn.x + mx.x) * 0.5 * k, -(mn.y + mx.y) * 0.5 * k, -(mn.z + mx.z) * 0.5 * k))
    } else {
      console.error("[EdgeArrow] missing input: mesh")
    }
    if (this.material) {
      const mat = this.material.clone()
      mat.mainPass.baseColor = ARROW_COLOR
      rmv.mainMaterial = mat
    } else {
      console.error("[EdgeArrow] missing input: material")
    }

    this.meshObj.enabled = false
    this.createEvent("OnStartEvent").bind(() => this.tr.setWorldScale(vec3.one()))
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private setShowing(v: boolean): void {
    if (v === this.showing) return
    this.showing = v
    this.meshObj.enabled = v
    console.log("[EdgeArrow] " + (v ? "show" : "hide"))
  }

  private onUpdate(): void {
    const c = this.controller
    if (!c || !c.machine) return
    const camT = c.cameraTransform
    const state = c.machine.state
    const want = (state === "hiding" || state === "ready") && !c.inView && !!camT
    if (!want) {
      this.setShowing(false)
      this.nudgeT = 0
      return
    }

    const camPos = camT.getWorldPosition()
    const rot = camT.getWorldRotation()
    const camFwd = rot.multiplyVec3(new vec3(0, 0, -1))
    const camRight = rot.multiplyVec3(new vec3(1, 0, 0))
    const camUp = rot.multiplyVec3(new vec3(0, 1, 0))

    const d = arrowDir(camRight, camUp, camFwd, camPos, c.currentSpotPosition)
    if (d.x === 0 && d.y === 0) {
      // Target dead ahead: nothing to point at.
      this.setShowing(false)
      return
    }
    const pointDir = camRight.uniformScale(d.x).add(camUp.uniformScale(d.y)).normalize()

    this.nudgeT += clock.dt
    const nudge = NUDGE_CM * Math.sin(Math.PI * 2 * NUDGE_HZ * this.nudgeT)

    const pos = camPos
      .add(camFwd.uniformScale(this.distanceCm))
      .add(pointDir.uniformScale(this.edgeRadiusCm + nudge))
    this.tr.setWorldPosition(pos)
    // Local +Z faces the camera, local +Y (cone tip) along the pointing direction.
    this.tr.setWorldRotation(quat.lookAt(camFwd.uniformScale(-1), pointDir))

    this.setShowing(true)
  }
}
