// CatchRing — the "look here" progress ring above the creature.
// Builds two runtime MeshBuilder annuli on child objects: Ring_Base (full
// circle, dim white) and Ring_Fill (arc from 12 o'clock clockwise, as seen by
// the viewer, covering controller.machine.ring). Billboards to the camera every
// frame, is visible only in "hiding"/"ready", and pulses once on "ready".
// Draw calls: 2 RenderMeshVisuals. Units: cm.
import {clock} from "../Core/Clock"
import {FarLookController} from "../FarLookController"

const BASE_COLOR = new vec4(0.3, 0.3, 0.3, 1) // dim white on additive display
const FILL_COLOR = new vec4(0.361, 1, 0.541, 1) // #5CFF8A
const PULSE_MS = 400
const PULSE_GAIN = 0.25
const REBUILD_STEP = 0.005
const FILL_Z_OFFSET = 0.05 // cm toward the viewer, avoids z-fighting with the base

@component
export class CatchRing extends BaseScriptComponent {
  @ui.label("Catch ring (look progress)")
  @ui.separator
  @input
  @hint("FarLookController that owns the break state machine")
  controller: FarLookController

  @input
  @hint("Unlit material; cloned per ring and tinted via mainPass.baseColor")
  material: Material

  @input
  @hint("Outer diameter of the ring in cm")
  diameterCm: number = 30

  @input
  @hint("Radial thickness of the ring band in cm")
  thicknessCm: number = 1.6

  @input
  @hint("Segments for a full circle (fill arc uses a proportional count)")
  segments: number = 64

  /** Number of "ready" pulses played so far (read by LEAF). */
  pulseCount: number = 0

  private baseObj: SceneObject
  private fillObj: SceneObject
  private baseBuilder: MeshBuilder
  private fillBuilder: MeshBuilder
  private tr: Transform
  private baseScale: vec3 = vec3.one()
  private scaleTmp: vec3 = vec3.one()
  private lastFill: number = -1
  private lastState: string = ""
  private pulseT: number = -1 // ms since pulse start, -1 = idle
  private visible: boolean = true

  onAwake(): void {
    this.tr = this.sceneObject.getTransform()
    this.baseScale = this.tr.getLocalScale()

    const base = this.makeRingObject("Ring_Base", BASE_COLOR, 0)
    this.baseObj = base.obj
    this.baseBuilder = base.builder
    const fill = this.makeRingObject("Ring_Fill", FILL_COLOR, FILL_Z_OFFSET)
    this.fillObj = fill.obj
    this.fillBuilder = fill.builder

    this.buildArc(this.baseBuilder, 1, 0)
    this.setFill(0)
    this.setVisible(false)

    if (!this.material) console.error("[CatchRing] missing input: material")
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private makeRingObject(name: string, color: vec4, z: number): {obj: SceneObject; builder: MeshBuilder} {
    const obj = global.scene.createSceneObject(name)
    obj.setParent(this.sceneObject)
    const t = obj.getTransform()
    t.setLocalPosition(new vec3(0, 0, z))
    t.setLocalRotation(quat.quatIdentity())
    t.setLocalScale(vec3.one())

    const builder = new MeshBuilder([
      {name: "position", components: 3},
      {name: "normal", components: 3, normalized: true},
      {name: "texture0", components: 2},
    ])
    builder.topology = MeshTopology.Triangles
    builder.indexType = MeshIndexType.UInt16

    const rmv = obj.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = builder.getMesh()
    if (this.material) {
      const mat = this.material.clone()
      mat.mainPass.baseColor = color
      rmv.mainMaterial = mat
    }
    return {obj: obj, builder: builder}
  }

  /**
   * Rebuilds `b` as an annulus arc in local XY (facing +Z). Starts at 12 o'clock
   * (+Y) and runs clockwise as seen from +Z: point = (sin a, cos a) * r.
   */
  private buildArc(b: MeshBuilder, fraction: number, z: number): void {
    const vc = b.getVerticesCount()
    const ic = b.getIndicesCount()
    if (ic > 0) b.eraseIndices(0, ic)
    if (vc > 0) b.eraseVertices(0, vc)

    const f = Math.max(0, Math.min(1, fraction))
    if (f <= 0) return
    const full = Math.max(8, Math.floor(this.segments))
    const n = Math.max(1, Math.ceil(full * f))
    const ro = this.diameterCm * 0.5
    const ri = Math.max(0, ro - this.thicknessCm)
    const span = Math.PI * 2 * f

    const verts: number[] = []
    for (let i = 0; i <= n; i++) {
      const a = (span * i) / n
      const s = Math.sin(a)
      const c = Math.cos(a)
      const u = i / n
      // inner (even), outer (odd)
      verts.push(s * ri, c * ri, z, 0, 0, 1, u, 0)
      verts.push(s * ro, c * ro, z, 0, 0, 1, u, 1)
    }
    const idx: number[] = []
    for (let i = 0; i < n; i++) {
      const n0 = i * 2
      const o0 = n0 + 1
      const n1 = n0 + 2
      const o1 = n0 + 3
      // CCW seen from +Z (angle grows clockwise, so order is inner, next-outer, outer)
      idx.push(n0, o1, o0)
      idx.push(n0, n1, o1)
    }
    b.appendVerticesInterleaved(verts)
    b.appendIndices(idx)
    b.updateMesh()
  }

  private setFill(f: number): void {
    this.lastFill = f
    if (f > 0) this.buildArc(this.fillBuilder, f, 0)
    this.fillObj.enabled = this.visible && f > 0
  }

  private setVisible(v: boolean): void {
    this.visible = v
    this.baseObj.enabled = v
    this.fillObj.enabled = v && this.lastFill > 0
  }

  private onUpdate(): void {
    const c = this.controller
    if (!c || !c.machine) return
    const state = c.machine.state
    const show = state === "hiding" || state === "ready"
    if (show !== this.visible) this.setVisible(show)

    if (show) {
      const ring = Math.max(0, Math.min(1, c.machine.ring))
      const atEnd = (ring <= 0 || ring >= 1) && ring !== this.lastFill
      if (atEnd || Math.abs(ring - this.lastFill) >= REBUILD_STEP) this.setFill(ring)
    }

    if (state === "ready" && this.lastState !== "ready") {
      this.pulseT = 0
      this.pulseCount++
      console.log("[CatchRing] pulse " + this.pulseCount)
    }
    this.lastState = state

    this.updatePulse()
    if (show) this.billboard()
  }

  private updatePulse(): void {
    let k = 1
    if (this.pulseT >= 0) {
      this.pulseT += clock.dt * 1000
      if (this.pulseT >= PULSE_MS) {
        this.pulseT = -1
      } else {
        k = 1 + PULSE_GAIN * Math.sin((Math.PI * this.pulseT) / PULSE_MS)
      }
    }
    this.scaleTmp.x = this.baseScale.x * k
    this.scaleTmp.y = this.baseScale.y * k
    this.scaleTmp.z = this.baseScale.z * k
    this.tr.setLocalScale(this.scaleTmp)
  }

  /** Local +Z toward the camera, world up kept as up so the ring stays upright. */
  private billboard(): void {
    const camT = this.controller.cameraTransform
    if (!camT) return
    const toCam = camT.getWorldPosition().sub(this.tr.getWorldPosition())
    if (toCam.length < 1e-3) return
    const dir = toCam.normalize()
    if (Math.abs(dir.dot(vec3.up())) > 0.999) return // degenerate, keep last rotation
    this.tr.setWorldRotation(quat.lookAt(dir, vec3.up()))
  }
}
