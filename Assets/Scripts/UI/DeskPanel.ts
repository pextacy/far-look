// DeskPanel — UI Kit panel lying on the front of the virtual desk.
// Two large buttons: "Start break" and "Snooze 5 min". Emits events on the
// shared bus; never touches BreakMachine state directly.
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import {bus, EV} from "../Core/Events"

// Type scale (Button role = 39 at 110 cm), scaled to the panel's viewing distance.
const BUTTON_ROLE_SIZE = 39

@component
export class DeskPanel extends BaseScriptComponent {
  @ui.label("Desk panel: Start break + Snooze buttons")
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Distance from the user's eyes in cm; scales the label size")
  viewDistanceCm: number = 55

  @input
  @hint("Width of each button in cm")
  buttonWidth: number = 14

  @input
  @hint("Height of each button in cm")
  buttonHeight: number = 5

  @input
  @hint("Start button label")
  startLabel: string = "Start break"

  @input
  @hint("Snooze button label")
  snoozeLabel: string = "Snooze 5 min"
  @ui.group_end

  private startBtn: Button | null = null
  private snoozeBtn: Button | null = null

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.sceneObject)
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))

    const pad = 1.2
    const gap = 1.5
    const panelW = this.buttonWidth * 2 + gap + pad * 2
    const panelH = this.buttonHeight + pad * 2
    plate.size = new vec2(panelW, panelH)

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.direction = FlexDirection.Row
    flex.justifyContent = FlexJustify.Center
    flex.alignItems = FlexAlign.Center
    flex.columnGap = gap
    flex.width = panelW
    flex.height = panelH

    this.startBtn = this.makeButton(content, flex, "Btn_StartBreak", this.startLabel)
    this.snoozeBtn = this.makeButton(content, flex, "Btn_Snooze", this.snoozeLabel)

    this.startBtn.onTriggerUp.add(() => {
      console.log("[DeskPanel] Btn_StartBreak -> " + EV.BREAK_START)
      bus.emit(EV.BREAK_START)
    })
    this.snoozeBtn.onTriggerUp.add(() => {
      console.log("[DeskPanel] Btn_Snooze -> " + EV.BREAK_SNOOZE)
      bus.emit(EV.BREAK_SNOOZE)
    })
  }

  private makeButton(parent: SceneObject, flex: FlexLayout, name: string, label: string): Button {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    const btn = so.createComponent(Button.getTypeName()) as Button
    const w = this.buttonWidth
    const h = this.buttonHeight
    btn.onInitialized.add(() => {
      btn.size = new vec3(w, h, 1)
    })
    // ElementContent is the sole child of the button face, so its auto-sizer is safe here.
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    ec.text = label
    // Seated users read this panel at ~55 cm and slightly from above; 2.2× keeps
    // the label clearly legible in the SPECS preview (checked by screenshot).
    ec.textSize = BUTTON_ROLE_SIZE * (this.viewDistanceCm / 110) * 2.2
    ec.sizeOverride = new vec2(w - 0.5, h - 0.5)
    // FlexLayout auto-discovers FlexItem children on start; addItems() would throw here.
    so.createComponent(FlexItem.getTypeName())
    return btn
  }
}
