# Far Look

**Your eyes need something far away to look at. Pip hides there.**

Far Look is a Lens for Snap SPECS that turns the 20-20-20 eye break into hide-and-seek. Built for the Devpost hackathon **Learn AR with SPECS**.

## What it does

While you study, a small dot on your desk fills up. When it's time (or when you pinch **Start break**), a little creature called Pip pops up on the desk, waves, and hops away to hide 5–6 m across the room. A soft chime and an arrow at the edge of your view show where it went. Look at Pip for 20 seconds while a ring fills around it, pinch to catch it, and get back to work with your streak one higher. Not a good moment? **Snooze** and Pip comes back later.

## Who it's for

Students and desk workers who know they should take eye breaks and never do.

## Why glasses

The 20-20-20 rule asks you to look about 6 m away for 20 seconds. A phone or laptop sits 30–50 cm from your face, so the reminder lives on the very screen you should look away from. Glasses can put the thing you look at out in the room, at a real distance, with your hands free.

## Run it

1. Open `Asphaleia.esproj` in **Lens Studio 5.24.1** (the project file keeps the name of an earlier idea; the Lens is Far Look).
2. Preview panel: device **SPECS**, **Interactive Preview**, environment **Plane**.
3. Look down at the desk and click **Start break** (a click is a pinch). Or wait: in demo mode the work timer starts a break after 60 s.
4. Turn toward the arrow (right-drag or Shift + mouse), keep Pip near the centre of the view until the ring is full, then click Pip.

Demo timings: 60 s work, 20 s look, 30 s snooze. Real timings (20 min / 20 s / 5 min) are one switch away (`demoMode` on `FarLook/Controller`).

## How it was built

- **Planned** with the plan-lens skill → [`devpost/design-brief.md`](devpost/design-brief.md).
- **Built** by Claude Code through Snap's CLAD skills and agents and the Lens Studio MCP: scene construction, materials, SIK far-pinch interaction, UI Kit desk panel and score card, locally synthesised sound effects. Step-by-step log: [`devpost/build-log.md`](devpost/build-log.md).
- **Pure TypeScript core** (`Assets/Scripts/Core/`): break state machine, gaze maths, hiding spots, timing, copy. No Lens APIs, so it is deterministic and easy to test.
- **Views** (`Assets/Scripts/Views/`, `Assets/Scripts/UI/`) subscribe to the controller; UI only emits events (`break:start`, `break:snooze`, `creature:pinch`).

```
Assets/Scripts/
├── Core/        BreakMachine  GazeMath  HidingSpots  Timing  Events  Copy  Clock
├── Views/       CreatureView  CatchRing  EdgeArrow  TimerDot  AudioCues
├── UI/          DeskPanel  ScoreCard  StreakLabel  HintLabel  CreatureInteractable
└── FarLookController.ts
Assets/Tests/    5 LEAF scenarios + LeafIndex
```

## Tests (LEAF)

One scenario per done criterion, run in the Lens Studio preview. **5 / 5 passed.** Verbatim Logger output: [`devpost/leaf-results.md`](devpost/leaf-results.md).

| Scenario | Done criterion | Result |
|---|---|---|
| `start_break_hides_far` | Start break → Pip ≥ 5 m away, chime, edge arrow | PASSED |
| `ring_fills_only_when_looking` | Ring fills over 20 s while looking, pauses when not | PASSED |
| `catch_after_full_ring` | Pinch at full ring → caught, score card, streak +1 | PASSED |
| `snooze_returns_in_demo` | Snooze hides the break, back after 30 s (demo) | PASSED |
| `work_timer_auto_break` | 60 s demo work timer starts the break | PASSED |

To re-run: set `testMode` on `FarLook/Controller`, open the LEAF panel, run the scenarios one at a time with the preview camera at its default pose.

## Honesty

- Runs in the Lens Studio preview; **not tested on SPECS hardware**.
- Head direction stands in for eye tracking. LEAF can't turn the preview camera, so the ring test uses a test override; the real head-direction path was checked by hand.
- Hiding spots are fixed points in the preview room, not real room geometry.
- Whether looking at a virtual far object rests the eyes like a real one is unproven.
- **A break reminder, not medical advice.**

## Credits

- Snap packages included in `Packages/` and `Assets/AiPreviewAgentInspect.lspkg/` (Spectacles Interaction Kit, Spectacles UI Kit, LEAF, AI Preview Agent, Icons, Motion, Bitmoji 3D) are Snap's code under their own licenses, not ours.
- Built with Lens Studio, CLAD (`ls-clad`), the Lens Studio MCP, Claude Code and the plan-lens skill.

## License

Our own code (`Assets/Scripts/`, `Assets/Tests/`) is released under the MIT License.
