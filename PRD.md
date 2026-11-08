# PRD — Far Look

> Your eyes need something far away to look at. Pip hides there.

| | |
|---|---|
| Product | A SPECS Lens that turns the 20-20-20 eye break into a hide-and-seek game in your room |
| Hackathon | Learn AR with SPECS (Devpost), deadline Mon 9 Nov 2026 17:00 EST / Tue 10 Nov 01:00 TRT |
| Platform | Snap SPECS, demonstrated in Lens Studio Interactive Preview |
| Status | Brief approved (`devpost/design-brief.md`, wins on conflicts). Pre-build |
| History | Replaces the earlier Asphaleia (earthquake) idea on 7 Nov 2026. Repo and `.esproj` keep the old name |

---

## 1. Problem

Students and desk workers spend hours looking at something 30–60 cm away. Eye-care bodies (the American Academy of Ophthalmology and the American Optometric Association) recommend the **20-20-20 rule**: every 20 minutes, look at something about 20 feet (6 m) away for 20 seconds. The evidence for the exact numbers is limited, but regular breaks from near work are low-cost and widely advised.

Nobody does it. Break-reminder apps pop up a notification on the same screen you are trying to look away from, you dismiss it, and you keep working. A reminder doesn't give you anything to look *at*, and it doesn't check that you looked.

## 2. Why glasses (and not a phone)

| Strength | How Far Look uses it |
|---|---|
| **Draws in the world** | The thing you look at during the break is placed in your room, 5–6 m away, at real distance. A phone or laptop can only show you something 30–50 cm from your face, which defeats the purpose. |
| **Leaves your body free** | The break needs no device in your hand. You just turn your head, find the creature, look, pinch. |

The test: on a phone, this game makes your eyes worse. On glasses, the game *is* the break.

## 3. Users

**Primary — a student, studying at a desk or in bed.** Studies on a laptop for hours, knows breaks matter, skips them. Needs: a break that's quick and a little fun, so it actually happens.

**Secondary — remote workers** with long screen days.

Out of scope as users: anyone needing treatment for an eye condition. This is a habit nudge, not medical advice.

## 4. The one spatial moment

I'm at my desk studying. After 20 minutes a small, bright creature (Pip) hops onto my desk, waves, and runs off to hide in a far corner of the room, 5–6 m away. A chime comes from its direction and a small arrow points the way. I turn, find it, and look at it while a ring around it fills for 20 seconds. Then I pinch to catch it. "Found in 6 s. Streak 3." Pip is back, and I'm back to work.

## 5. Experience flow

1. **Work.** A virtual desk sits in front of the user. A small timer dot fills over 20 minutes (60 s in demo mode). Streak counter and two buttons sit on the desk. One hint line: "Study as usual. Pip will find you."
2. **Break starts.** When the timer ends, or on **Start break**, Pip appears on the desk, waves, and hops to a hiding spot 5–6 m away.
3. **Find.** If Pip is out of view, a chime plays from its direction and an edge arrow points to it.
4. **Look.** While the user looks at Pip, a ring around it fills over 20 s. Looking away pauses the ring.
5. **Catch.** When the ring is full, pinching Pip catches it. A score card shows find time and streak for 4 s, then the work timer starts again.
6. **Snooze.** **Snooze 5 min** hides the break; it returns after 5 minutes (30 s in demo mode).

## 6. Scope

**In (v1, this deadline)**
- Virtual desk, timer dot, streak label, Start break and Snooze buttons.
- Creature with intro hop, 4 fixed hiding spots, chime and edge arrow.
- Head-direction look ring (20 s), pinch to catch, score card.
- Demo mode timings.
- LEAF scenarios for every done criterion.

**Out (v1)**
- Real eye tracking or focus distance.
- Saving the streak between sessions.
- Real room geometry (spots are fixed in the virtual room).
- Multiplayer, voice, network, AI.

**Later (v2+, pitch only)**
- Hiding spots chosen from the real room (world query on SPECS: far surfaces only).
- Daily streaks with persistence.
- Different creatures for different break lengths (stretch break, water break).

## 7. Preview stand-ins (honesty table)

| The real product would need | Stand-in in this build |
|---|---|
| The user's real desk | A real-size virtual desk |
| Knowing where the user's eyes focus | Head direction (camera forward), mouse look in the preview |
| A real 6 m sightline in the user's room | Fixed hiding spots in the preview room |
| 20 minutes of work | Demo mode: 60 s |

## 8. Done criteria

The brief's wording is final; copied here for convenience.

1. Pinching **Start break** makes the creature appear on the desk and hop to a spot at least 5 m away. A chime plays and an edge arrow points to it.
2. Turning to face the creature fills the ring around it over 20 seconds. Looking away pauses the ring.
3. When the ring is full, pinching the creature catches it. The score card shows the find time and the streak goes up by 1.
4. Pinching **Snooze 5 min** hides the break. In demo mode it comes back after 30 seconds.
5. In demo mode, when the 60-second work timer ends, the break starts on its own.

## 9. Success metrics

For the hackathon:
- 5/5 done criteria pass as LEAF scenarios (or a documented gap for the look path), logged in `devpost/leaf-results.md`.
- A first-time viewer can say what it does and why it needs glasses.
- Video under 3:00, shows plan → agent build → working Lens → tests.

For the product (hypotheses, not claims):
- Share of breaks taken vs snoozed.
- Self-reported eye tiredness at the end of a study day.

## 10. Design principles

1. **Work content sits where you already look**: on the desk, low, small.
2. **Show it, then get out of the way**: during work only a dot; the score card lasts 4 s.
3. **Few, big targets**: two buttons and one creature (with a generous collider).
4. **Keep it where they look**: anything out of view gets a chime and an edge arrow.
5. **Light, not dark**: bright creature and ring, no black.
6. **Honest**: never claims to fix or treat eyes. "A break reminder, not medical advice."

## 11. Judging criteria

| Criterion | Our answer |
|---|---|
| Design | One loop with a beginning and an end: work → break → find → look → catch → work. Every element passes the four glasses habits |
| Technical | Pure-logic core (BreakMachine, GazeMath); SIK + UI Kit only; LEAF scenario per criterion; build log naming each CLAD skill and MCP tool |
| Innovation | The visible entries are mostly step-by-step coaches. Far Look uses distance itself as the mechanic: the game only works because glasses can put something 6 m away |
| Presentation | Hook: "Your break reminder lives on the screen you're supposed to look away from." Moment in the first 40 s, agent build footage, LEAF pass panel |

## 12. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Judges read it as "just a timer" | Design | Lead the video with the hop across the room and the 6 m find |
| Health claims overstated | Credibility | Cite AAO/AOA recommendation, say evidence is limited, one-line disclaimer on the card |
| Far pinch on a small target | Usability | 40 cm collider around a 15 cm creature |
| LEAF can't turn the camera | Tech score | Test override for gaze; real path verified by hand and recorded |
| Sign-in blocks LEAF install | Tech score | Build first, resolve sign-in before P4 |
