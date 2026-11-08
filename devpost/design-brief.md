---
status: approved
---

# Design brief: Far Look (default name)

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
I'm at my desk studying on my laptop. After 20 minutes a small, bright creature hops onto my desk, waves, and runs off to hide in a far corner of the room, 5–6 m away. I find it, look at it for 20 seconds, and pinch to catch it. My streak goes up by one.

Where the learner uses it day to day: in bed, at school, outside, at a café with a friend. The video and the preview show the desk moment only (default).

## Why it belongs on glasses
- Uses: draws in the world, leaves your body free.
- Why it's better than the phone or laptop version: a phone or laptop break reminder keeps your eyes 30–50 cm from a screen. The 20-20-20 eye rule says to look about 6 m away for 20 seconds. Only glasses can put the thing you look at out in the room, at a real distance (default).

## Product or overlay
- Type: product. The creature and the break game are the experience.
- What the real version would sense: nothing.
- Stand-in for the preview: none needed. A virtual desk at real size stands in for the user's desk (default).

## Where things live
- Where the user is looking during the main task: down at the desk and laptop, about 60 cm away.
- Desk: virtual desk, 120 × 60 cm top, 75 cm high, directly in front of the start position (default).
- Timer dot and streak counter: on the desk, about 60 cm in front of the user, a little below eye level. Dot 3 cm across, streak text readable from the seat (default).
- Creature: about 15 cm tall (palm-sized), bright saturated colours. First it appears on the desk, then it hides 5–6 m away at eye level, at one of several fixed hiding spots around the room, never directly behind the user's starting view (default).
- Catch ring: around the creature, about 30 cm across, fills as you look at it (default).
- Score card: floats next to the desk at about 60 cm, shows find time and streak (default).
- Buttons: **Start break** and **Snooze 5 min**, UI Kit large buttons, on the desk next to the timer dot (default).

## Hands and input
- Start break: pinch the UI Kit button.
- Snooze 5 min: pinch the UI Kit button.
- Catch the creature: pinch it from a distance (SIK Interactable, far-field pinch).
- Looking at the creature fills the ring. The ring is driven by head direction, which is mouse look in the preview (default).
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Timer dot: always visible on the desk during work, small and quiet.
- Creature: shows when the break starts (timer ends or **Start break** pinched), hides once caught or snoozed.
- Catch ring: shows while the creature is hiding. It fills while the user looks at the creature, pauses while they look away.
- Score card: shows for 4 seconds after a catch, then fades.
- Work timer: 20 minutes for real use. Demo mode uses 60 seconds so the preview and video can show the full loop (default).
- If something needs attention out of view: when the creature hides, a soft chime plays from its direction and a small edge arrow points toward it until it is in view.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pinching **Start break** makes the creature appear on the desk and hop to a spot at least 5 m away. A chime plays and an edge arrow points to it.
2. Turning to face the creature fills the ring around it over 20 seconds. Looking away pauses the ring.
3. When the ring is full, pinching the creature catches it. The score card shows the find time and the streak goes up by 1.
4. Pinching **Snooze 5 min** hides the break. In demo mode it comes back after 30 seconds.
5. In demo mode, when the 60-second work timer ends, the break starts on its own.

## Out of scope
- Real eye tracking or measuring focus distance. Head direction stands in for gaze.
- Remembering the streak between sessions.
- Real room geometry. Hiding spots are fixed points in the virtual room.
- Multiplayer or sharing with friends.
- Any network, AI or voice features.

## Risks and open questions
- The idea was proposed by the agent; the learner chose it and approved the design as proposed.
- Using it at a café with a friend may interrupt the conversation. Kept as a real-life use, not shown in the demo.
- Looking 5–6 m away needs that much open space. The preview room provides it. Real rooms may not (feel unproven).
- Whether a 20-second look actually rests the eyes on glasses (focus plane about 1 m) is feel unproven and not a medical claim.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
