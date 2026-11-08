// ScoreCard — UI Kit card beside the desk, shown after Pip is caught.
// Root ("ScoreCard") stays enabled so its UpdateEvent keeps polling the machine;
// visibility is toggled on a runtime child "Card" that holds the BackPlate + content.
// Line 1: "Found in N s. Rested N s." (Body), line 2: "Streak N." (Headline),
// footer: FOOTER (Caption, 60% white). Yaw-billboards toward the camera.
// Never mutates BreakMachine state; read-only view.
import {clock} from "../Core/Clock"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {
  FlexAlign,
  FlexAlignSelf,
  FlexDirection,
  FlexJustify,
} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FarLookController} from "../FarLookController"
import {FOOTER, scoreLines} from "../Core/Copy"
import {timingFor} from "../Core/Timing"

// Type scale at 110 cm (see specs-build-ui patterns → Typography).
const ROLE = {
  Body: {size: 39, weight: 500},
  Headline: {size: 54, weight: 700},
  Caption: {size: 38, weight: 500},
}
type Role = keyof typeof ROLE

const COLOR_LINE = new vec4(1, 1, 1, 1)
const COLOR_HEADLINE = new vec4(0.44, 0.89, 1, 1) // #6FE3FF cyan
const COLOR_FOOTER = new vec4(1, 1, 1, 0.6)

@component
export class ScoreCard extends BaseScriptComponent {
  @ui.label("Score card: shown on caught")
  @ui.separator
  @input
  @hint("FarLookController (read-only: state, streak, findMs)")
  controller: FarLookController

  @input
  @hint("Distance from the user's eyes in cm; scales text sizes (role size x distance / 110)")
  viewDistanceCm: number = 60

  @input
  @hint("Card width in cm")
  panelWidth: number = 26

  @input
  @hint("Card height in cm")
  panelHeight: number = 11

  @input
  @hint("Turn the card toward the camera every frame (yaw only)")
  billboard: boolean = true

  /** True while the card is visible. Read by LEAF. */
  isShowing: boolean = false

  private card: SceneObject
  private cardT: Transform
  private line1: Text
  private line2: Text
  private footer: Text
  private lastState: string = ""
  private shownMs: number = 0
  private cardMs: number = 4000

  onAwake(): void {
    this.buildCard()
    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  /** Concatenated text of all lines (LEAF asserts it contains "Found in"). */
  textContent(): string {
    const parts: string[] = []
    if (this.line1) parts.push(this.line1.text)
    if (this.line2) parts.push(this.line2.text)
    if (this.footer) parts.push(this.footer.text)
    return parts.join("\n")
  }

  private buildCard(): void {
    // "Card" holds everything visual. Created enabled so BackPlate/FlexLayout
    // initialise in OnStart; the first UpdateEvent hides it (before any render).
    this.card = global.scene.createSceneObject("Card")
    this.card.setParent(this.sceneObject)
    this.cardT = this.card.getTransform()
    this.cardT.setLocalPosition(vec3.zero())

    this.card.createComponent("Component.Canvas")
    const plate = this.card.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(this.panelWidth, this.panelHeight)

    // Content after the plate (hierarchy DFS paints it on top), +0.6 cm against z-fighting.
    const content = global.scene.createSceneObject("Content")
    content.setParent(this.card)
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.direction = FlexDirection.Column
    flex.justifyContent = FlexJustify.Center
    flex.alignItems = FlexAlign.Center
    flex.rowGap = 0.8
    flex.paddingLeft = 1.2
    flex.paddingRight = 1.2
    flex.paddingTop = 1.0
    flex.paddingBottom = 1.0
    flex.width = this.panelWidth
    flex.height = this.panelHeight

    // FlexLayout auto-discovers FlexItem children on start; addItems() would throw here.
    this.line1 = this.addLine(content, "Text_Score", "Body", COLOR_LINE, 2.0)
    this.line2 = this.addLine(content, "Text_Streak", "Headline", COLOR_HEADLINE, 2.6)
    this.footer = this.addLine(content, "Text_Footer", "Caption", COLOR_FOOTER, 1.6)
    this.footer.text = FOOTER
  }

  private addLine(parent: SceneObject, name: string, role: Role, color: vec4, h: number): Text {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = ""
    t.depthTest = true
    t.size = ROLE[role].size * (this.viewDistanceCm / 110)
    t.weight = ROLE[role].weight
    t.textFill.color = color
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-0.5, 0.5, -h / 2, h / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    return t
  }

  private show(): void {
    const m = this.controller.machine
    const lookMs = timingFor(this.controller.demoMode).lookMs
    this.cardMs = timingFor(this.controller.demoMode).cardMs
    const lines = scoreLines(m.findMs, m.streak, lookMs)
    this.line1.text = lines[0]
    this.line2.text = lines[1]
    this.footer.text = FOOTER
    this.shownMs = 0
    this.card.enabled = true
    this.isShowing = true
    this.faceCamera()
    console.log("[ScoreCard] show | " + lines[0] + " " + lines[1])
  }

  private hide(): void {
    if (this.card.enabled) this.card.enabled = false
    if (this.isShowing) console.log("[ScoreCard] hide")
    this.isShowing = false
  }

  private onUpdate(): void {
    if (!this.controller || !this.controller.machine) {
      if (this.lastState !== "missing") {
        console.error("[ScoreCard] missing input: controller")
        this.lastState = "missing"
        this.hide()
      }
      return
    }
    const state = this.controller.machine.state
    if (state === "caught" && this.lastState !== "caught") {
      this.show()
    } else if (state !== "caught") {
      this.hide()
    } else if (this.isShowing) {
      this.shownMs += clock.dt * 1000
      if (this.shownMs >= this.cardMs) this.hide()
    }
    this.lastState = state
    if (this.isShowing && this.billboard) this.faceCamera()
  }

  /** Yaw-only billboard: rotate the card's +Z (front face) toward the camera. */
  private faceCamera(): void {
    const camT = this.controller ? this.controller.cameraTransform : null
    if (!camT) return
    const d = camT.getWorldPosition().sub(this.cardT.getWorldPosition())
    d.y = 0
    if (d.length < 0.001) return
    this.cardT.setWorldRotation(quat.lookAt(d.normalize(), vec3.up()))
  }
}
