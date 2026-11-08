# CLAUDE.md — Far Look

Operating instructions for any coding agent working in this repository. Read this file fully before every session. When this file and `devpost/design-brief.md` disagree on product behaviour, the brief wins. When they disagree on process or engineering rules, this file wins.

## 1. What this repository is

A Lens for Snap SPECS, built for the Devpost hackathon **Learn AR with SPECS** (round ending Mon 9 Nov 2026, 17:00 EST = Tue 10 Nov 2026, 01:00 Europe/Istanbul).

**Far Look** turns the 20-20-20 eye break into hide-and-seek. While you study at a desk, a small timer dot fills. When it's time, a small creature (Pip) hops off the desk and hides 5–6 m away in the room. You find it (chime + edge arrow), look at it while a ring fills for 20 s, and pinch to catch it. Streak +1, back to work.

History: the repo, folder and `Asphaleia.esproj` keep the name of an earlier idea (Asphaleia, earthquake hazard hunt) dropped on 7 Nov 2026. Do not rename the project file.

Companion docs (read in this order when you need context):

| File | Use it for |
|---|---|
| `PRD.md` | What we build and why, users, scope, done criteria |
| `PLAN.md` | Architecture, scene graph, scripts, CLAD skill order, LEAF plan |
| `DOCS.md` | Research facts with sources, tool reference, video script, submission text |
| `PHASES.md` | Time-boxed schedule, exit gates, cut lines |
| `devpost/design-brief.md` | The approved plan-lens brief. Produced by the plan-lens interview, not by you |

## 2. Hard rules (hackathon eligibility — breaking any of these disqualifies the entry)

1. **The brief comes from the plan-lens interview.** Never write, rewrite or "improve" `devpost/design-brief.md` yourself. If it is missing, stop and tell the human to run `plan-lens`. Edits to the brief only happen inside a plan-lens session or by the human's hand.
2. **The Lens is built through CLAD and the Lens Studio MCP.** All scene edits, component wiring, asset imports and TypeScript go through the `lens-studio` MCP tools and the `ls-clad` skills/agents. Do not hand the human code to paste. Do not edit `.scene` files as raw text.
3. **New project only.** Everything under `Assets/` is created during the submission period. Snap packages from the SPECS Base Template (SIK, UI Kit, LEAF) are allowed and must be credited, not presented as our code.
4. **Runs in the Lens Studio preview.** No feature may depend on SPECS hardware. Every done criterion must be visible in Interactive Preview with mouse and keyboard.
5. **Nobody is recorded, identified or followed.** No camera frames, no face or person detection, no audio recording. The Lens never touches `/specs-camera`.

## 3. Environment

- Lens Studio **5.24.1** (fallback **5.23.2** if developer-platform sign-in fails — official FAQ workaround). Do not mix versions mid-project.
- Project created from **SPECS → Base Template → File > Save As**. The agent is started from the folder that contains the `.esproj` and `.mcp.json`.
- CLAD plugin: `ls-clad` from `lens-studio-devs/ls-extensions`.
- Skill pack: `npx skills add challengepost/learn-specs --all -y` (needs a recent Node.js; 22.x LTS is known to work).
- Preview: device **SPECS**, **Interactive Preview**, environment **Plane** (empty floor, so the virtual desk never intersects preview furniture and the 5–6 m hiding spots have open space).
- Before trusting any MCP result, confirm `/mcp` shows `lens-studio` connected and that the `ExecuteEditorCode` tool is listed. If it is not, stop and point the human to Snap's Troubleshoot MCP guide.

## 4. How to work (the loop)

1. Start every build session by loading `/lens-studio-router` (it loads `/lens-studio-field-notes`).
2. Run `/reset-preview-environment` before building a new section of the scene.
3. Make **one** behavioural change at a time. After each change:
   - recompile and read the logs (`/lens-log-analysis` — a clean compile is not proof the Lens ran),
   - run `/verify-preview` and state in one line what you saw.
4. When a feature matches a done criterion, lock it with a LEAF scenario (`/specs-leaf-write-scenarios`, then `/specs-leaf-run-in-preview`). Report PASS/FAIL per scenario, verbatim from the Logger.
5. Never claim something works without a log line, a screenshot from the preview or a LEAF result as evidence. If you could not verify, say "unverified".
6. Do not commit or push. Record the green step in `devpost/build-log.md`; the human decides when to commit (see §8).

Order of CLAD skills for this Lens is fixed in `PLAN.md §6`. Follow it. Do **not** run `specs-experience-builder` as a one-shot on this project: it will invent its own scene and overwrite stable object names that the LEAF tests depend on.

## 5. Engineering rules

**Two runtimes, never mixed.** Lens runtime TypeScript (`/lens-api`) lives in `Assets/Scripts/`. Editor automation (`/editor-api`, `ExecuteEditorCode`) is only for building the scene and never ships in the Lens.

**Pure logic is separated from Lens APIs.** Everything in `Assets/Scripts/Core/` (break state machine, gaze maths, timing, hiding spots) must be plain TypeScript with no `SceneObject`, `getTime` or component references, so its results are deterministic and easy to assert in LEAF.

**Stable names.** Scene objects that tests touch use the exact names in `PLAN.md §3`. Never rename them. Never create two objects with the same name.

**SIK and UI Kit only for input.** Buttons are UI Kit buttons. The creature is a SIK `Interactable` caught with a far pinch (generous collider). No hand-rolled colliders-as-buttons, no custom gestures, no voice-only actions.

**Event bus.** UI modules emit events (`break:start`, `break:snooze`, `creature:pinch`); `FarLookController` subscribes. UI never mutates `BreakMachine` state directly.

**Units.** Lens Studio world units are centimetres. All positions and sizes in code are in cm and match `PLAN.md §4`.

**Additive display.** Black is transparent on SPECS. The creature, ring, outlines and text use bright, saturated colours from the palette in `PLAN.md §5`. Never rely on a dark shadow, dark text or a black panel to communicate anything.

**Comfort.** The camera never shakes. Only the creature moves, never the user's view. No content behind the user without an audio cue and an edge arrow.

**No network.** No `/specs-internet`, `/specs-ai-remote-service`, `/specs-snap-cloud`. All copy is hard-coded. The demo must never depend on a remote call.

## 6. Copy and content rules

- Eye-break guidance follows the 20-20-20 rule as recommended by the AAO / AOA (see `DOCS.md §2`). Real-use timings: 20 min work, 20 s look, spots 5–6 m away. Demo timings are labelled demo.
- Card text: max 2 lines, max ~40 characters per line, sentence case, no exclamation marks.
- The Lens never claims to improve, protect or treat eyesight. The score card carries one footer line: "A break reminder, not medical advice."
- Friendly, never nagging: no guilt copy when the user snoozes.

## 7. What to do when blocked

- MCP disconnected → stop editing, tell the human, link Snap's Troubleshoot MCP page. Do not try to repair Lens Studio preferences yourself.
- `build-mesh` job slow or failing → fall back to primitive boxes with the outline material (`PLAN.md §4`) and continue. Visual polish is a cut line, the flow is not.
- LEAF cannot drive an interaction → add a debug-only UI Kit button that triggers the same event, test through it, and record the gap in `devpost/leaf-results.md` under "not testable by LEAF".
- Two failed attempts at the same fix → stop, summarise what you tried and what the logs say, and ask the human.

## 8. Git

- **Never commit or push without the human's explicit go-ahead.** The whole project goes to GitHub as a single push at the end. Until then, record each green step in `devpost/build-log.md` instead of committing.
- When the human asks for a commit, use: `feat(scope): what changed — verified by <log|screenshot|LEAF id>`.
- Never commit `Cache/`, `Support/` or local tokens (`~/.lens_mcp_token.json` lives outside the repo; keep it that way).
- Add `.gitignore` entries for `Cache/`, `Workspaces/` and OS files before the first commit.
- Large binaries (GLB, WAV over 5 MB) go through Git LFS or are regenerated smaller.

## 9. Files you may create in the repo during the build

`Assets/**` (Lens content), `devpost/leaf-results.md` (test log), `devpost/build-log.md` (short dated log of which CLAD skills/agents and MCP tools were used — the video and the Technical Implementation score rely on it), `.gitignore`. Anything else: ask first.

## 10. Definition of done for any task

A task is done only when: it compiles with no new warnings, `/verify-preview` shows the expected behaviour, the related LEAF scenario passes (if one exists), and one line was appended to `devpost/build-log.md`.

## 11. Lens Studio reference

Lens Studio-generated project reference (kept up to date by Lens Studio): @AGENTS.md
