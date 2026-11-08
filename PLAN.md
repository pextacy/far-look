# PLAN — Far Look technical plan

How the Lens is built. Product behaviour comes from `devpost/design-brief.md` (wins on conflicts) and `PRD.md`; schedule is in `PHASES.md`; agent rules are in `CLAUDE.md`.

> The repo and project file are still named `Asphaleia` (an earlier idea, dropped on 7 Nov 2026). Do not rename `Asphaleia.esproj`. The Lens itself is **Far Look**.

---

## 1. Build principles

1. Flow before polish. The five done criteria working on primitives beats a beautiful creature with one working interaction.
2. Logic is pure and testable; visuals subscribe to state.
3. Every interaction goes through SIK or UI Kit, so it works with the mouse and with LEAF.
4. One change, one verification, one build-log line.

## 2. Architecture

```
            ┌──────────── UI layer (UI Kit, SIK) ─────────────┐
 pinch ───► │ DeskPanel (Btn_StartBreak, Btn_Snooze)  Creature │
            └──────────────┬──────────────────────────────────┘
                           │ emits events (EventBus)
                           ▼
                 ┌───────────────────────┐   reads view direction
                 │   FarLookController   │◄── GazeSource (camera fwd,
                 │ orchestrates, timers  │    test override in testMode)
                 └─────────┬─────────────┘
                           │ calls tick(dtMs, looking)
                           ▼
        ┌──────────── Core (pure TypeScript) ─────────────┐
        │ BreakMachine  GazeMath  HidingSpots  Timing     │
        │ Events  Copy                                    │
        └─────────┬───────────────────────────────────────┘
                  │ state snapshots
                  ▼
     ┌──────────── View layer ─────────────────────────────┐
     │ CreatureView  CatchRing  TimerDot  StreakLabel      │
     │ ScoreCard  EdgeArrow  AudioCues  DebugState         │
     └─────────────────────────────────────────────────────┘
```

**Events (string constants in `Core/Events.ts`)**

| Event | Payload | Emitted by |
|---|---|---|
| `break:start` | — | DeskPanel (`Btn_StartBreak`) or controller when the work timer ends |
| `break:snooze` | — | DeskPanel (`Btn_Snooze`) |
| `creature:pinch` | — | Creature interactable |
| `state:changed` | `BreakSnapshot` | FarLookController |

## 3. Scene graph (stable names — tests depend on them)

```
Camera                                  (Base Template, world tracking)
SpectaclesInteractionKit                (Base Template)
FarLook
├── Controller                          FarLookController, LeafIndex
├── Desk                                anchored in front of the start position, top at y = 75
│   ├── Desk_Top                        120 × 4 × 60 box, light outline material
│   ├── TimerDot                        3 cm disc on the desk, fills as work time passes
│   ├── StreakLabel                     Text "Streak 0", on the desk, faces user
│   └── DeskPanel                       UI Kit frame lying angled on the desk front
│       ├── Btn_StartBreak              UI Kit large button "Start break"
│       └── Btn_Snooze                  UI Kit large button "Snooze 5 min"
├── Creature                            ~15 cm tall; SIK Interactable (far pinch); CreatureView
│   ├── Creature_Body                   primitive (sphere + eyes) until /build-mesh
│   └── CatchRing                       30 cm ring around the creature, fill 0..1
├── HidingSpots
│   ├── Spot_0 … Spot_3                 empty markers at fixed positions (§4)
├── UI
│   ├── ScoreCard                       UI Kit frame beside the desk; Text_Score
│   ├── Hint_Label                      start hint, fades after the first break
│   └── EdgeArrow                       points at the creature when it is out of view
├── Audio                               Sfx_Chime, Sfx_Hop, Sfx_Catch, Sfx_RingTick
└── Debug
    └── DebugState                      Text_DebugState (hidden in demo; read by LEAF)
```

## 4. Layout (cm, relative to the camera start position, camera looks toward −z)

| Object | Position (x, y, z) | Notes |
|---|---|---|
| Desk centre | (0, 75, −70) | front edge 40 cm ahead, 120 wide, 60 deep |
| DeskPanel | (0, 78, −48) | tilted 30° toward user, 30 × 12 cm |
| TimerDot | (−35, 76, −55) | |
| StreakLabel | (35, 80, −55) | |
| Creature on desk (intro) | (0, 76, −75) | |
| ScoreCard | (45, 110, −60) | yaw-billboard to user |
| Eye height (reference) | camera y at start | spots use this value ± 20 |

Hiding spots: distance 500–600 cm from the start position, horizontal angle from forward (positive = right). None behind the user (|angle| ≤ 120°).

| Spot | Angle | Distance | In view at start? |
|---|---|---|---|
| `Spot_0` | +45° | 550 | no → arrow + chime (used first, so the demo shows the arrow) |
| `Spot_1` | −15° | 600 | yes |
| `Spot_2` | −80° | 520 | no |
| `Spot_3` | +100° | 500 | no |

Spot order is deterministic: `0, 1, 2, 3, 0 …`. `HidingSpots.validate()` asserts every spot is ≥ 500 cm away and |angle| ≤ 120°, and logs `LAYOUT_OK`.

## 5. Visual language (additive display safe)

| Element | Colour | Notes |
|---|---|---|
| Desk outline | `#6FE3FF` cyan | 15% fill, bright edges |
| Creature body | `#FFD23F` warm yellow, `#FF7AD9` pink accents | emissive, no dark areas; eyes are white with light-blue pupils, never black |
| Catch ring, empty | `#FFFFFF` 30% | thin |
| Catch ring, filling | `#5CFF8A` green | arc grows clockwise |
| Timer dot | `#6FE3FF` cyan | fills as work time passes |
| Edge arrow | `#FFD23F` | |
| Card | UI Kit default backplate, light theme | text `#FFFFFF` |

Never black. Never red as the only signal.

## 6. Core logic

### 6.1 Timing (pure)

```ts
type Timing = { workMs: number; lookMs: number; snoozeMs: number; cardMs: number };
REAL = { workMs: 20*60_000, lookMs: 20_000, snoozeMs: 5*60_000, cardMs: 4_000 }
DEMO = { workMs: 60_000,    lookMs: 20_000, snoozeMs: 30_000,   cardMs: 4_000 }
```

Demo mode is the default in this build (a `demoMode` input on the controller, `true`).

### 6.2 GazeMath (pure)

```ts
angleDeg(forward: V3, from: V3, to: V3) = angle between forward and (to - from)
isLooking  = angleDeg < 12          // inside the narrow SPECS view, near centre
isInView   = angleDeg < 16          // edge arrow hides when true
arrowDir(forward, from, to)         // 2D direction on the view edge
```

`V3` is a plain `{x,y,z}` type, not `vec3`, so Core stays free of Lens APIs.

### 6.3 BreakMachine (pure)

```
working ──workMs elapsed | break:start──► intro (1 200 ms: appear on desk, wave, hop away)
intro ──1 200 ms──► hiding   (creature at next spot, chime from its direction)
hiding ──looking: ring += dt/lookMs; not looking: ring paused──► (ring = 1) ready
hiding|ready ──break:snooze──► snoozed
snoozed ──snoozeMs elapsed──► intro
ready ──creature:pinch──► caught (streak += 1, findMs recorded)
hiding ──creature:pinch──► hiding (creature wiggles, nothing else)
caught ──cardMs──► working (work timer resets)
```

`findMs` = time from entering `hiding` to the ring first becoming full.

Snapshot string for the debug label (keep the format stable, LEAF reads it):

```
state=hiding;ring=0.45;streak=0;spot=0;findMs=0;demo=1
```

### 6.4 Copy (pure)

- Hint: `Study as usual. Pip will find you.` / `Then you find Pip.`
- Score card: `Found in {s} s. Rested 20 s.` / `Streak {n}.`
- Snooze toast: none (the creature just hides).
- Footer on score card (small): `A break reminder, not medical advice.`

## 7. View components

| Component | Responsibility | Key details |
|---|---|---|
| `CreatureView` | Creature motion | Intro: scale 0→1 over 300 ms on the desk, wave 400 ms, then parabolic hop to the spot over 500 ms (peak +60 cm). Idle bob ±2 cm at 1 Hz while hiding. Wiggle ±10° yaw for 300 ms on early pinch. Scripted, not physics, deterministic |
| `CatchRing` | Fill arc | Reads `snapshot.ring`; full ring pulses once and plays `Sfx_RingTick` |
| `TimerDot` | Work progress | Fill = elapsed / workMs |
| `StreakLabel` | Streak text | Reads `snapshot.streak` |
| `ScoreCard` | UI Kit frame | Shows on `caught` for `cardMs`; copy from `Copy` |
| `EdgeArrow` | Off-view pointer | Shown while `state ∈ {hiding, ready}` and `!isInView`; positioned at the view edge in `arrowDir` |
| `AudioCues` | Spatial audio | Chime on `hiding` (spatialised at the creature), hop on intro, catch on `caught`, tick at ring full |
| `DebugState` | Text mirror of the snapshot | Hidden in demo builds (disabled render), always updated |
| `GazeSource` | View direction | Camera world forward and position; in `testMode`, `forceLookAtCreature(bool)` overrides `isLooking` |

## 8. Placement and comfort numbers

- Work-time content (desk, dot, panel, label) sits 40–80 cm away, below eye level, where the user already looks while studying.
- The creature is the only far object, 5–6 m away at eye height ± 20 cm. That distance is the point of the game.
- Design against the conservative view (about 37° × 32°). `isLooking` uses 12°, so the creature must be near the centre of the view.
- Buttons are UI Kit large; arms stay low (desk height).
- The view never moves; only the creature does. No content directly behind the user.

## 9. CLAD skill sequence (follow in order)

| Step | Skill / agent | Output |
|---|---|---|
| 0 | `/lens-studio-router`, `/specs-project-init` | Project validated for SPECS, preview device set |
| 1 | `/ensure-package-installed` (SIK, UI Kit), `/specs-leaf-install-packages` | Packages matched to SIK version (LEAF needs developer sign-in; if blocked, continue and come back) |
| 2 | `/reset-preview-environment` | Clean preview baseline |
| 3 | `/scene-construction` + `/materials` | `FarLook` root, desk, hiding spots, creature primitive, outline material, palette; `LAYOUT_OK` |
| 4 | `script-author` agent with `/lens-api` | `Core/*.ts` (pure) first, then controller and views. Up to 3 script-author agents may run in parallel on separate files; only one agent edits the scene |
| 5 | `/specs-interaction-recipes` | Creature far-pinch interactable |
| 6 | `/icon-selector`, `/font-selector`, then `/specs-build-ui` | Desk panel, score card (icons and font first — the UI skill consumes them) |
| 7 | `/build-sfx` | chime, hop, catch, ring tick |
| 8 | `/verify-preview` after each step above | One-line verification in chat + build log |
| 9 | `/specs-leaf-write-scenarios`, `/specs-leaf-run-in-preview` (or `live-lens-tester` agent) | 5 scenarios + results |
| 10 | `/specs-capture-perf-trace` | Frame-cost check during `hiding` |
| 11 | `/build-mesh` (optional) | Creature model replacing the primitive, same 15 cm bounds |

Use `editor-api-specialist` for any multi-object scene edit to keep the main context small. Do **not** run `specs-experience-builder` as a one-shot.

### Prompts to paste (in a fresh chat)

Prompt A — the official kickoff (required by the skill pack):
> Read devpost/design-brief.md and build it for SPECS. Follow the brief closely. Get the basic flow working first, then add detail. Write and run LEAF tests for each done criterion, and tell me which pass.

Prompt B — immediately after, to bind the build to this plan:
> Before building, read CLAUDE.md and PLAN.md. Use the scene names in PLAN.md §3, the layout in §4 and the CLAD skill order in §9. Do not run specs-experience-builder. One agent edits the scene; up to 3 script-author agents may write separate scripts in parallel. Keep going step by step until all five done criteria are verified.

## 10. LEAF test plan

Location: `Assets/Tests/`. Index: `LeafIndex` on `FarLook/Controller`. Interactor: `DefaultLeafInteractor`. Every async call awaited. Each scenario starts with `controller.resetForTest()` (testMode only): state `working`, timers zero, streak 0, spot index 0.

| ID | Criterion | Steps | Assertions |
|---|---|---|---|
| `start_break_hides_far` | 1 | trigger `Btn_StartBreak`; sleep 1 600 | debug `state=hiding`; distance(`Creature`, start) ≥ 500; `EdgeArrow` enabled (Spot_0 is out of view); chime played (controller logs `SFX chime`) |
| `ring_fills_only_when_looking` | 2 | start break; sleep 1 600; `forceLookAtCreature(true)`; sleep 10 000; read ring; `forceLookAtCreature(false)`; sleep 3 000; read ring | first ring ≈ 0.5 (toBeCloseTo, 1); second ring equals first (paused) |
| `catch_after_full_ring` | 3 | start break; look forced; sleep 21 000; trigger `Creature`; sleep 300 | debug `state=caught`, `streak=1`; `ScoreCard` enabled; text contains `Found in` |
| `snooze_returns_in_demo` | 4 | start break; sleep 1 600; trigger `Btn_Snooze`; sleep 300; check; sleep 30 500 | after snooze: `Creature` disabled, `state=snoozed`; after wait: `state=hiding` |
| `work_timer_auto_break` | 5 | (demo) sleep 61 500 | debug `state=intro` or `state=hiding` |

Notes:
- Scenario 2 cannot turn the preview camera from LEAF, so it uses the `GazeSource` test override. The real head-direction path is checked by hand in `/verify-preview` (mouse look) and recorded in `devpost/leaf-results.md` under "not testable by LEAF".
- The `testMode` hooks live in `FarLookController`, are set only by LEAF, and are documented as such.
- Results are copied verbatim from the Logger into `devpost/leaf-results.md` with date and LS version.

## 11. Performance budget

- Draw calls under 25. Creature ≤ 3 meshes; ring is one mesh with a fill parameter.
- No per-frame allocations in the controller; animation uses pre-allocated vec3/quat.
- One sound at a time except the ring tick.

## 12. Repo layout at submission

```
asphaledia/
├── Asphaleia.esproj          (project file name kept; Lens is "Far Look")
├── .gitignore
├── Assets/
│   ├── Scene.scene
│   ├── Scripts/
│   │   ├── Core/        Events.ts Timing.ts GazeMath.ts HidingSpots.ts BreakMachine.ts Copy.ts
│   │   ├── Views/       CreatureView.ts CatchRing.ts TimerDot.ts StreakLabel.ts ScoreCard.ts EdgeArrow.ts AudioCues.ts DebugState.ts GazeSource.ts
│   │   ├── UI/          DeskPanel.ts CreatureInteractable.ts
│   │   └── FarLookController.ts
│   ├── Tests/           5 scenarios + LeafIndex.ts
│   ├── Materials/  Audio/  Icons/  Fonts/
├── Packages/            SIK, UI Kit, Leaf (Snap, credited)
├── devpost/
│   ├── design-brief.md      (plan-lens, approved)
│   ├── leaf-results.md
│   └── build-log.md
├── CLAUDE.md  PRD.md  PLAN.md  DOCS.md  PHASES.md
```

## 13. Risk register (technical)

| Risk | Signal | Response |
|---|---|---|
| MCP not connected | `/mcp` lacks `lens-studio` | Stop; Snap Troubleshoot MCP; restart agent after LS is open |
| Developer-platform sign-in fails | LEAF / Asset Library install errors | Build without LEAF first; human resolves sign-in or switches to 5.23.2 before P4 |
| Far pinch on a 15 cm target at 5 m is hard | Ray misses in preview | Enlarge the creature's collider to 40 cm (visual stays 15 cm) |
| Camera height in preview differs from assumed eye height | Creature above/below view | Read camera y at start; spots use it at runtime |
| Edge arrow jitters at the threshold | Flicker | Hysteresis: show at > 16°, hide at < 13° |
| LEAF timing flaky | Intermittent FAIL | Drive time from `getTime()` deltas; assert after `sleep(total + 500)` |
