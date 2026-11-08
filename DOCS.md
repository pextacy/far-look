# DOCS — Far Look reference

Research, sources, tool reference and the text assets for submission. Facts here are what the Lens copy, the pitch and the video are allowed to claim.

> History: the repo started as **Asphaleia** (earthquake hazard hunt). On 7 Nov 2026 the idea changed to Far Look during the plan-lens session. File and folder names keep the old name.

---

## 1. Name

**Far Look**: the break is literally a far look. The creature is **Pip** (default name, can change).

## 2. Eye-break facts the product relies on

| Claim | Source | Where it is used |
|---|---|---|
| The 20-20-20 rule: every 20 minutes, look at something about 20 ft (6 m) away for 20 seconds | Recommended by the American Academy of Ophthalmology and the American Optometric Association (as reported by Medical News Today, Healthline). Check aao.org for the primary wording before quoting | Pitch, video hook, timings |
| Looking at screens does not necessarily damage eyesight, but can cause strain | AAO, as reported by Healthline | Pitch (keep the claim this soft) |
| Evidence for the exact numbers is limited; regular breaks from near work plausibly help | Medical News Today; Modern Optometry "Myth-Busting the 20/20/20 Rule"; a 2023 reminder-break trial (Talens-Estarelles et al., *Cont Lens Anterior Eye*), outcomes not verified by us | Honesty line, never a claim of benefit |
| SPECS display focus plane is about 1 m | learn-specs `ar-design-rules.md` | Risks: whether looking at a virtual object 6 m away rests the eyes like a real one is unproven |

**Content decisions**
- The Lens never claims to improve eyesight or treat anything. Card footer: "A break reminder, not medical advice."
- The pitch says "eye-care bodies recommend", not "science proves".
- Real-use timings follow the rule (20 min / 20 s / ~6 m). Demo timings are labelled as demo.

## 3. Why this idea (gap analysis)

Snapshot of public repos for this round (GitHub search, 7 Nov 2026) and the CLAD Summer Hackathon themes:

| Cluster | Examples seen | Count (approx.) |
|---|---|---|
| Hands-busy step coaches | cooking, PCB soldering, CPR, field triage, furniture assembly, repair, cleaning, skate drills | 13+ |
| Museum / education objects | historical objects, brain circuits, X-ray diffraction | 4+ |
| Spatial memory / checkpoints | setup checkpoint, interrupted-task memory | 2 |
| Fit / planning at real size | stone remnant on a vanity, shade shelters | 2 |
| Safety drills | kitchen fire | 1 |
| Recognition overlays | allergy menu, warehouse labels | 2 |

Snap's own showcase and community challenges lean on pool assistants, translation, rhythm games, memory-match and breathing lenses.

Gaps Far Look fills:
1. **Distance is the mechanic.** The game needs something 5–6 m away, which only see-through glasses can place. A phone version would make the problem worse.
2. **Wellbeing, daily, short.** A 30-second loop that repeats all day, not a one-off tutorial.
3. **Fits the preview honestly.** No recognition; head direction stands in for gaze; every criterion is mouse-testable.

## 4. Hackathon facts

| Item | Value |
|---|---|
| Deadline | Mon 9 Nov 2026, 17:00 EST = Tue 10 Nov 2026, 01:00 Europe/Istanbul |
| Prizes | 1st $1,250 · 2nd $750 · 3rd $500 (single pool, no separate tracks) |
| Judging | Design · Technical Implementation · Innovation/Idea · Presentation |
| Judges | Joe Holmes, Darlyze Calixte (Devpost) |
| Must have | New project · planned with the skill pack (`devpost/` folder in repo) · built with CLAD via Lens Studio MCP · runs in preview |
| Submit | Public YouTube video < 3:00 showing it working · public repo with LS project + `devpost/` · short description (what, who, what you learned) |
| Note | Reviewers do not clone or run the project. The video is the product |
| Rounds | A new round runs monthly with its own deadline |
| Teams | Allowed; one representative submits |

## 5. Tool reference (verified against Snap docs, Nov 2026)

**Setup order (from the skill pack README)**
1. Lens Studio → SPECS → Base Template → File > Save As.
2. Start the coding agent in that folder (with `.esproj` and `.mcp.json`), Lens Studio already open.
3. Install CLAD (`/plugin marketplace add lens-studio-devs/ls-extensions`, `/plugin install ls-clad@ls-extensions` in Claude Code).
4. `npx skills add challengepost/learn-specs --all -y`.
5. Say `plan-lens` → 20–30 min interview → `devpost/design-brief.md`.
6. `/clear`, then paste the official build prompt (PLAN.md §9, Prompt A, then Prompt B).

**MCP checks**
- Lens Studio: AI Assistant → AI Model Context Protocol (MCP) → Configure Server → server running; Copy MCP Config if the agent does not see it.
- Required LS plugins: AiAssistantV2, Agents-Docs, Core-ChatTools (Preferences → Plugins).
- Sanity check: ask the agent whether it has the "Lens Studio Execute Editor Code" tool.

**CLAD skills used here** — see PLAN.md §9. Key distinctions:
- `/specs-build-ui` is for flat panels and buttons; `/specs-interaction-recipes` is for hand actions on 3D objects. They connect through an event bus.
- `/verify-preview` while building (writes nothing); LEAF when locking in.
- `/lens-log-analysis`: a clean compile is not proof the Lens ran.

**LEAF essentials**
- Scenario = class extending `Scenario` with `async run()`; register in a `@scenariosIndex` index attached to a scene object.
- Interactors: `DefaultLeafInteractor` (trigger, drag, hover on SIK interactables), `LeafHandInteractor`, `IkBodyInteractor`.
- `drag(target, dragVector, durationMs)`; `hover(target, ms?)`; utilities `findSceneObjectByName`, `findInteractableByName`, `nextFrame()`, `sleep(ms)`.
- `expect`: `toBe`, `toEqual`, `toBeCloseTo`, `toBeGreaterThan`, `toBeLessThan`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, `.not`.
- Always `await`; un-awaited failures pass silently. LEAF only drives SIK interactables.
- Results: Logger shows PASSED / FAILED per scenario.

**Preview controls**: WASD move, Q/E down/up, right-drag or Shift to look, click = pinch.

**What the preview cannot show** (keep out of criteria): two-hand and custom gestures, live camera vision, persistence between sessions, two people in one Lens, real feel (comfort, tracking dropouts).

## 6. plan-lens interview — record

Done on 7 Nov 2026. The learner asked the agent to propose ideas, chose "eye-break hunt" from a list, and approved the agent's proposed design. The brief records this under Risks. Learner's own input: they would use it in bed, at school, outside and at a café with a friend.

## 7. Demo video script (target 2:40)

Recording: Lens Studio Interactive Preview, 1080p, SPECS device, Plane environment, demo mode. Voice-over recorded separately. Agent-build footage is real, sped up and labelled.

| Time | Picture | Voice-over (approx.) |
|---|---|---|
| 0:00–0:12 | Desk with a laptop-sized glow, timer dot filling | "Eye doctors say: every 20 minutes, look 6 metres away for 20 seconds. Your reminder pops up on the screen you're supposed to look away from." |
| 0:12–0:40 | The moment: Pip hops onto the desk, waves, hops across the room; chime, arrow; turn, ring fills, pinch, "Found in 6 s. Streak 1." | "This is Far Look, for SPECS. When it's time, Pip hides somewhere far away. Find it, look at it for 20 seconds, catch it." |
| 0:40–1:05 | Second break: Pip in view; snooze shown briefly | "It never stays on screen. A dot while you work, a creature when you need a break, then it's gone." |
| 1:05–1:25 | Why glasses: split frame of phone (30 cm) vs Pip (6 m) | "A phone can't show you anything far away. Glasses can, and that is the whole break." |
| 1:25–2:20 | Process: plan-lens chat, brief, Claude Code + CLAD skills, LEAF panel | "Planned with plan-lens, built by Claude Code through CLAD and the Lens Studio MCP, tested with LEAF, one scenario per done criterion." |
| 2:20–2:40 | Streak 3, Pip waves | "A break reminder, not medical advice. Just a reason to look up." |

Checklist before upload: under 3:00 · captions · public · title "Far Look — a 20-20-20 eye-break game for SPECS (Learn AR with SPECS)" · repo link in description.

## 8. Devpost submission text (draft, edit after the build)

**Tagline**: Your eyes need something far away to look at. Pip hides there.

**What it does**
Far Look turns the 20-20-20 eye break into hide-and-seek. While you study, a small dot on your desk fills up. When it's time, a little creature called Pip hops off your desk and hides 5–6 metres away. A chime and an arrow help you find it. Look at it for 20 seconds while a ring fills, pinch to catch it, and get back to work with your streak one higher.

**Who it's for**
Students and desk workers who know they should take eye breaks and never do.

**Why glasses**
The break only works if you look far away. A phone or laptop can't show you anything more than half a metre from your face. Glasses can put Pip across the room, at real distance, with your hands free.

**How we built it**
Planned with the Devpost Learn plan-lens skill (brief in `devpost/`). Built by Claude Code through Snap's CLAD plugin and the Lens Studio MCP in Lens Studio 5.24.1: scene construction, SIK far-pinch interaction, UI Kit panel and card, generated sound effects. Pure TypeScript core for the break state machine and gaze maths. LEAF scenarios, one per done criterion (results in `devpost/leaf-results.md`).

**What we learned**
(fill after build)

**Honesty**
Runs in the Lens Studio preview; not tested on SPECS hardware. Head direction stands in for eye tracking. Hiding spots are fixed in the preview room. Whether a virtual far object rests the eyes like a real one is unproven. A break reminder, not medical advice.

**Built with**: Lens Studio, SPECS Interaction Kit, SPECS UI Kit, LEAF, CLAD (ls-clad), Lens Studio MCP, Claude Code, TypeScript, plan-lens skill.

## 9. Judging self-check (run before recording)

- [ ] Design: does the loop have a clear end? Is anything floating in front of the face? Does anything stay up when not needed?
- [ ] Technical: build log lists the CLAD skills and MCP tools used; LEAF results; no warnings in Logger.
- [ ] Innovation: can someone describe it without "step-by-step guide" or "timer app"?
- [ ] Presentation: Pip's hop is on screen before 0:40; the video shows plan, build and tests.

## 10. Sources

- Devpost — Learn AR with SPECS: overview, resources, FAQ (learn-specs.devpost.com)
- challengepost/learn-specs: README, `skills/plan-lens/SKILL.md`, references, template
- Snap — CLAD Agents and Skills; Test Your Lens With LEAF; Troubleshoot Lens Studio MCP (developers.specs.com)
- lens-studio-devs/ls-extensions (GitHub)
- Medical News Today — 20-20-20 rule: https://www.medicalnewstoday.com/articles/321536
- Healthline — 20-20-20 rule: https://www.healthline.com/health/eye-health/20-20-20-rule
- Modern Optometry — Myth-Busting the 20/20/20 Rule: https://modernod.com/topics/myopia/myth-busting-the-202020-rule/38651/
- Talens-Estarelles et al. (2023), *Contact Lens and Anterior Eye* (not verified first-hand)
- Snap newsroom / Business Today / GamesBeat / 9to5Mac — SPECS 2026 launch and showcase lenses
- Lenslist — Spectacles Community Challenge #8 winners
