# LEAF results — Far Look

Run: 2026-11-08 ~11:00–11:03 Europe/Istanbul · Lens Studio 5.24.1 (5.24.1.26100516) · Interactive Preview, SPECS 27, Plane · LEAF 2.0.2 (matched to SIK 2.0 / runtime 0.18.0) · run via `open_leaf_panel` + `run_leaf_scenario` (serial, preview).

Scenarios live in `Assets/Tests/`, registered by `Assets/Tests/LeafIndex.ts` on `FarLook/Controller`. Each starts with `FarLookController.resetForTest()` (testMode hook).

| ID | Done criterion | Result |
|---|---|---|
| `start_break_hides_far` | 1 — Start break → creature ≥ 5 m away, chime, edge arrow | PASSED |
| `ring_fills_only_when_looking` | 2 — ring fills over 20 s while looking, pauses when not | PASSED |
| `catch_after_full_ring` | 3 — full ring + pinch → caught, score card, streak +1 | PASSED |
| `snooze_returns_in_demo` | 4 — Snooze hides the break, back after 30 s (demo) | PASSED |
| `work_timer_auto_break` | 5 — 60 s demo work timer starts the break | PASSED |

Note: the MCP `run_leaf_scenario` call for `work_timer_auto_break` (61.5 s) timed out on the transport side; the PASSED line below is the Lens-side scenario manager's verdict.

## Logger output (verbatim)

```
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  0.000s]RUNS: start_break_hides_far with args: []
[Assets/Tests/StartBreakHidesFar.ts:29] [LEAF] start_break_hides_far distance=550.0
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  2.273s]PASSED: start_break_hides_far
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  0.000s]RUNS: ring_fills_only_when_looking with args: []
[Assets/Tests/RingFillsOnlyWhenLooking.ts:31] [LEAF] ring_fills_only_when_looking r1=0.501 r2=0.501
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [ 14.811s]PASSED: ring_fills_only_when_looking
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  0.000s]RUNS: catch_after_full_ring with args: []
[Assets/Tests/CatchAfterFullRing.ts:36] [LEAF] catch_after_full_ring card=Found in 21 s. Rested 20 s. | Streak 1. | A break reminder, not medical advice.
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [ 23.280s]PASSED: catch_after_full_ring
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  0.000s]RUNS: snooze_returns_in_demo with args: []
[Assets/Tests/SnoozeReturnsInDemo.ts:31] [LEAF] snooze_returns_in_demo state after wait=hiding
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [ 34.047s]PASSED: snooze_returns_in_demo
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [  0.000s]RUNS: work_timer_auto_break with args: []
[Assets/Tests/WorkTimerAutoBreak.ts:24] [LEAF] work_timer_auto_break state=hiding
[Packages/Leaf.lspkg/Utils/common/Logger.ts:89] I [DefaultLeafScenarioManager] [ 61.507s]PASSED: work_timer_auto_break
```

## Not testable by LEAF

- **Real head direction filling the ring.** LEAF cannot turn the preview camera, so `ring_fills_only_when_looking` uses the `forceLookAtCreature()` test override. The real path was checked by hand: preview camera turned to Spot_0 (`MovePreviewCamera lookAt`) → DebugState `ring=0.30`, turned away → `ring=0.42` twice (paused); screenshot shows the green arc filling clockwise.
- **Far pinch from the hand.** LEAF's `DefaultLeafInteractor.trigger` drives the Interactable directly. A preview hand pinch (`PreviewInteractTool`) on `Creature` at 5.5 m was also verified by hand → score card "Found in 20 s. Rested 20 s. / Streak 1."
- **Chime direction.** The test checks the chime AudioComponent is playing; whether it sounds like it comes from the creature's side is feel unproven (no AudioListener spatialisation verified).

## Logic proven / feel unproven

| Feature | Label |
|---|---|
| Break state machine, timers (demo 60 s / 30 s / 20 s), streak | logic proven |
| Creature hides 5–6 m away, deterministic spot order | logic proven |
| Edge arrow shows when out of view | logic proven |
| Ring fills only while looking (head direction) | logic proven (override) + checked by hand |
| Far pinch on a 15 cm creature at 5 m | logic proven in preview; feel unproven on real hands |
| Whether a 20 s look at a glasses focal plane rests the eyes | feel unproven, no medical claim |

## Re-running

The demo build ships with `FarLook/Controller` → FarLookController `testMode = false`. Turn it on before running LEAF (`resetForTest()` refuses otherwise), then off again for recording.
