// AudioCues — one AudioComponent per cue, created at runtime under the "Audio" object.
// hop on "intro", chime on "hiding" (played from a child moved to the hiding spot),
// tick on "ready", catch on "caught". Every play logs "[Audio] SFX <name>" (LEAF asserts
// the chime line). A missing track logs "[Audio] SFX <name> (no track)" and continues.
// One sound at a time: playing hop/chime/catch stops the other non-tick sounds; the tick
// neither stops nor is stopped.
// Chime spatialisation (position effect only) is enabled only when the camera already has
// an AudioListenerComponent; otherwise the chime plays non-spatial and a note is logged.
import {FarLookController} from "../FarLookController"
import {BreakState} from "../Core/BreakMachine"

type CueName = "chime" | "hop" | "tick" | "catch"

type Cue = {
  name: CueName
  track: AudioTrackAsset | undefined
  audio: AudioComponent | null
  obj: SceneObject
}

@component
export class AudioCues extends BaseScriptComponent {
  @ui.label("Audio cues (hop, chime, tick, catch)")
  @ui.separator
  @input
  @hint("FarLookController (state transitions, current hiding spot, camera)")
  controller: FarLookController

  @input
  @allowUndefined
  @hint("Creature root; fallback position for the chime if the controller has no spot")
  creature: SceneObject

  @input
  @allowUndefined
  @hint("Chime played when Pip hides (spatialised at the hiding spot)")
  chime: AudioTrackAsset

  @input
  @allowUndefined
  @hint("Hop played when Pip jumps off the desk (intro)")
  hop: AudioTrackAsset

  @input
  @allowUndefined
  @hint("Catch played when Pip is caught")
  catchSfx: AudioTrackAsset

  @input
  @allowUndefined
  @hint("Tick played when the look ring is full (ready)")
  ringTick: AudioTrackAsset

  @input
  @hint("Spatialise the chime at the hiding spot (needs an AudioListenerComponent on the camera)")
  spatialChime: boolean = true

  @input
  @hint("Playback volume for all cues (0..1)")
  volume: number = 1

  private cues: {[k in CueName]?: Cue} = {}
  private spatialChecked: boolean = false

  onAwake(): void {
    this.cues.chime = this.makeCue("chime", "Sfx_Chime", this.chime)
    this.cues.hop = this.makeCue("hop", "Sfx_Hop", this.hop)
    this.cues.tick = this.makeCue("tick", "Sfx_RingTick", this.ringTick)
    this.cues.catch = this.makeCue("catch", "Sfx_Catch", this.catchSfx)
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart(): void {
    // Short SFX tied to user actions → low latency (property writes in OnStart per specs-audio).
    const names: CueName[] = ["chime", "hop", "tick", "catch"]
    for (const n of names) {
      const c = this.cues[n]
      if (c && c.audio) c.audio.playbackMode = Audio.PlaybackMode.LowLatency
    }
    if (!this.controller) {
      console.error("[Audio] missing input: controller")
      return
    }
    this.controller.addStateListener((from: BreakState, to: BreakState) => this.onState(from, to))
  }

  private onState(from: BreakState, to: BreakState): void {
    if (from === to) return
    if (to === "intro") this.play("hop")
    else if (to === "hiding") this.playChime()
    else if (to === "ready") this.play("tick")
    else if (to === "caught") this.play("catch")
  }

  /** Reuse an authored child with this name if present, else create one. One AudioComponent per cue. */
  private makeCue(name: CueName, objName: string, track: AudioTrackAsset | undefined): Cue {
    let obj: SceneObject | null = null
    const n = this.sceneObject.getChildrenCount()
    for (let i = 0; i < n; i++) {
      const ch = this.sceneObject.getChild(i)
      if (ch.name === objName) obj = ch
    }
    if (!obj) {
      obj = global.scene.createSceneObject(objName)
      obj.setParent(this.sceneObject)
    }
    let audio: AudioComponent | null = null
    if (track) {
      audio = obj.getComponent("Component.AudioComponent") as AudioComponent
      if (!audio) audio = obj.createComponent("Component.AudioComponent") as AudioComponent
      audio.audioTrack = track
      audio.volume = this.volume
    }
    return {name, track, audio, obj}
  }

  private playChime(): void {
    const c = this.cues.chime
    if (!c) return
    let p: vec3 | null = null
    if (this.controller) p = this.controller.currentSpotPosition
    if (!p && this.creature) p = this.creature.getTransform().getWorldPosition()
    if (p) c.obj.getTransform().setWorldPosition(p)
    if (c.audio && !this.spatialChecked) this.setupSpatial(c.audio)
    this.play("chime")
  }

  private setupSpatial(audio: AudioComponent): void {
    this.spatialChecked = true
    if (!this.spatialChime) return
    const cam = this.controller ? this.controller.cameraObject : null
    const listener = cam ? cam.getComponent("Component.AudioListenerComponent") : null
    if (!listener) {
      console.log("[Audio] no AudioListenerComponent on the camera; chime plays non-spatial")
      return
    }
    // Position effect only (left/right/front placement). Distance attenuation stays off:
    // its default maxDistance (100) would silence a chime 5-6 m away.
    audio.spatialAudio.enabled = true
    audio.spatialAudio.positionEffect.enabled = true
    audio.spatialAudio.distanceEffect.enabled = false
    audio.spatialAudio.directivityEffect.enabled = false
    console.log("[Audio] chime spatialised at the hiding spot")
  }

  private play(name: CueName): void {
    const c = this.cues[name]
    if (!c || !c.audio) {
      console.log("[Audio] SFX " + name + " (no track)")
      return
    }
    if (name !== "tick") this.stopOthers(name)
    if (c.audio.isPlaying()) c.audio.stop(false)
    c.audio.play(1)
    console.log("[Audio] SFX " + name)
  }

  private stopOthers(except: CueName): void {
    const names: CueName[] = ["chime", "hop", "catch"]
    for (const n of names) {
      if (n === except) continue
      const c = this.cues[n]
      if (c && c.audio && c.audio.isPlaying()) c.audio.stop(false)
    }
  }
}
