# PHASES — Far Look delivery schedule

> Idea changed from Asphaleia (earthquake) to Far Look (eye-break game) on Sat 7 Nov 2026 in P1. Repo and `.esproj` keep the old name.

All times Europe/Istanbul (UTC+3). Hard deadline: **Tue 10 Nov 2026, 01:00** (= Mon 9 Nov, 17:00 EST).
Internal deadline: **Mon 9 Nov, 22:00** submitted. The last three hours are buffer, not work time.

Available from start (Sat 7 Nov ~14:00): about 56 hours, of which ~30 are realistic working hours.

Each phase has an exit gate. Do not start the next phase until the gate is met, or a cut line has been applied and written in `devpost/build-log.md`.

---

## P0 — Setup and toolchain proof · Sat 14:00–16:00 (2 h)

- [~] Install Lens Studio 5.24.1 (done). Sign in to the developer platform (OPEN — human, before Asset Library/LEAF). If sign-in fails, uninstall and use 5.23.2 now.
- [x] Node.js LTS, Git, Claude Code installed and logged in.
- [x] Lens Studio → SPECS → Base Template → Save As `asphaleia/`.
- [x] Open a terminal in `asphaleia/`, start Claude Code there with Lens Studio open.
- [x] Install CLAD: `/plugin marketplace add lens-studio-devs/ls-extensions` then `/plugin install ls-clad@ls-extensions`.
- [x] `/mcp` shows `lens-studio` connected; ask "do you have the Lens Studio Execute Editor Code tool?" → yes.
- [x] `npx skills add challengepost/learn-specs --all -y`.
- [x] Copy the five planning files (CLAUDE.md, PRD.md, PLAN.md, DOCS.md, PHASES.md) into `asphaleia/`.
- [x] `git init`, `.gitignore` (Cache/, Workspaces/, .DS_Store). No commits or pushes without the human's go-ahead; the repo goes up as a single push.
- [x] Smoke test: ask the agent to add one cube 100 cm ahead and run `/verify-preview`. Delete it.

**Gate:** the agent can create and remove a scene object through MCP and see it in the preview.
**If blocked > 45 min:** post in Devpost Discord #specs-general with the exact error, switch LS version, keep going.

## P1 — Plan with plan-lens · Sat (done)

- [x] `plan-lens` run; idea changed to Far Look; learner approved the design.
- [x] `devpost/design-brief.md` written with `status: approved`.
- [x] PRD, PLAN, DOCS, PHASES, CLAUDE.md updated to Far Look.
- [ ] Screen-record clips: none recorded during the interview. Re-open the chat transcript on screen for a 5 s clip in P5.

**Gate met:** brief approved.

## P2 — Core flow on primitives · Sat evening – Sun 01:00

Before starting: Lens Studio open with the project, Claude Code restarted in the repo folder, `/mcp` shows `lens-studio` connected. Fresh chat (`/clear`). Paste Prompt A, then Prompt B (PLAN.md §9). Record the screen for the first 20 minutes.

- [ ] Step 0–2: project init, packages (SIK, UI Kit; LEAF if sign-in works), reset preview.
- [ ] Step 3: `FarLook` root, desk, 4 hiding spots, creature primitive at PLAN §3/§4; outline material; `LAYOUT_OK` logged.
- [ ] Core TS: `Events`, `Timing`, `GazeMath`, `HidingSpots`, `BreakMachine`, `Copy`. Compile clean.
- [ ] `FarLookController` + `DebugState`; `Btn_StartBreak` emits `break:start` (log line).
- [ ] `CreatureView` intro and hop to `Spot_0`; chime; `EdgeArrow` (criterion 1).
- [ ] `GazeSource` + `CatchRing`; ring fills only while looking (criterion 2), checked by hand with mouse look.
- [ ] One line per item in `devpost/build-log.md` (no commits until the human says so).

**Gate:** criteria 1 and 2 work by hand in the preview.
**Cut line if behind at Sun 01:00:** drop the arrow for spots that are in view; use only Spot_0 and Spot_1.

Sleep. Sun 01:00–09:00.

## P3 — Catch, snooze, timer · Sun 10:00–17:00

- [ ] Creature far-pinch interactable with 40 cm collider; early pinch wiggles; pinch at full ring catches (criterion 3).
- [ ] `ScoreCard` with find time, streak, disclaimer footer; hides after 4 s.
- [ ] `Btn_Snooze`, snoozed state, return after 30 s in demo (criterion 4).
- [ ] Work timer + `TimerDot`; auto break after 60 s in demo (criterion 5).
- [ ] `StreakLabel`, `Hint_Label`.
- [ ] `/build-sfx` for chime, hop, catch, ring tick; `/icon-selector` + `/font-selector` before any UI rework.
- [ ] Full run by hand, two breaks in a row, from a fresh preview reset.

**Gate:** all five criteria work by hand in one uninterrupted run.
**Cut lines if behind at Sun 17:00 (in order):** (1) drop ring tick sound; (2) drop wiggle; (3) StreakLabel only on the score card.

## P4 — Tests, comfort pass, polish · Sun 17:00 – Mon 01:00

- [ ] Human: resolve developer-platform sign-in (needed for LEAF) before this phase starts.
- [ ] `/specs-leaf-write-scenarios` for the five scenarios in PLAN.md §10; add the `testMode` hooks.
- [ ] `/specs-leaf-run-in-preview`; fix until 5/5 PASS or document the gap (gaze override).
- [ ] Paste Logger output into `devpost/leaf-results.md` with date and LS version.
- [ ] Comfort pass using the brief's "After the build" section.
- [ ] Label each feature "logic proven" or "feel unproven" in `devpost/leaf-results.md`.
- [ ] Optional, only if all above is green by Sun 23:00: `/build-mesh` creature with the same bounds; re-run LEAF after swapping.
- [ ] Hide `DebugState` render for the demo build; tests still read it.

**Gate:** 5/5 LEAF (or 4/5 with a documented, honest gap), clean Logger, comfort pass done.

Sleep. Mon 01:00–09:00.

## P5 — Video, repo, submission · Mon 10:00–22:00 (12 h window, ~6 h work)

- [ ] 10:00–12:00 Capture: two clean full runs in Interactive Preview at 1080p; separate close-ups for the hop, the find, the ring and the catch; LEAF panel with PASSED lines; plan-lens and agent-build clips from P1/P2.
- [ ] 12:00–13:00 Record voice-over from DOCS.md §7. Read slowly; aim for 2:40.
- [ ] 13:00–15:30 Edit. Moment on screen before 0:40. Label sped-up agent footage. Captions.
- [ ] 15:30 Show the video to one person who has not seen the project. Ask: what does it do, why glasses? Fix whatever they got wrong.
- [ ] 16:30 Upload to YouTube as **Public**. Copy the link.
- [ ] 17:00 Repo final pass: README written from DOCS.md §8 (what, who, why glasses, how built, honesty, LEAF results, run instructions), credits for Snap packages, MIT for own code, video link at top. Push. Open the repo logged-out to confirm it is public and `devpost/` is visible.
- [ ] 18:00 Devpost form: title, tagline, description from DOCS.md §8 with the "What we learned" filled from real experience, video link, repo link, screenshots (hop, ring, score card, LEAF panel), built-with tags.
- [ ] 19:00 Run the judging self-check (DOCS.md §9). Fix anything cheap.
- [ ] **22:00 Submit.** Confirm the project shows as Submitted on "My projects".

**Gate:** Submitted, public video, public repo with LS project and `devpost/`.

## Buffer · Mon 22:00 – Tue 01:00

Only for: a broken link, a video that won't process, a private repo. No new features.

---

## Daily stand-up questions (ask yourself at the start of each block)

1. Which done criterion did I move to "works by hand" or "PASS" since the last block?
2. What is the single riskiest thing left, and am I doing it now?
3. Am I polishing something a judge won't see in a 3-minute video?

## Scope guard

If an idea is not in PRD §6 "In", it goes to "Later" in the PRD and nowhere else this round. The monthly rounds mean v2 (real-room hiding spots, persistent streaks) can be a new project next round.
