# <TITLE> — direction v1
**Gate:** 0 intake   <!-- update as each gate passes: 2 concept ✓ · 3 storyboard ✓ · 5 rough r01 … -->
**Format:** 1080×1920 · 60 fps · 45 s (2700 f) · ends on <brand>
**Remember:** <the one sentence the viewer should leave with>
**Line:** <the copy>
**Idea:** <the organising idea — what every transition means>

## Brief
- audience · where it plays (feed / site / pitch) · variants (9:16 / 16:9 / 1:1)
- **Facts (locked, real only):** logo <path> · product screens <paths> · names, numbers, claims <source>
- **Choices (ours):** camera, motion, transitions, copy rhythm, sound
- **Unacceptable:** <e.g. invented UI or metrics, redrawn logo, centred-text-on-gradient look, unreadable copy>

## Style guide
- ground · ink · accent(s) (hex) · image treatment · texture (grain / paper / none)
- typefaces (2 max), sizes at 1080 w
- composition: where the eye goes first in each beat
- pacing: mean frames between meaningful changes (measured from the reference if one exists)
- motion by class: micro UI <snap, ≤3 f settle> · panels <settle> · camera <slow, near-invisible> · headlines <fast in, long hold> · hero/brand <…>
- banned defaults: <list>
- from the reference: keep <traits> · don't copy <subjects, logos, copy>

## Beats (frames @60)
| f | beat | viewer now knows | entry → exit state | technique / morph | sound |
|---|---|---|---|---|---|

## Formats
<per variant: what changes (type scale, element count, camera path, holds); same story and states>

## Sound
tempo · music approach · signature sounds · where the breath goes · the ending

## FLOOR 13 — Episode 1 (as built)
Remember: you are always one floor higher than safe. Format 1080x1920 @60, 45 s. Look A (cutaway tower), $0 budget, Kokoro (am_michael) voiceover + karaoke captions.
Continuity element: the floor counter (13 → 12 → 11). Series rule: every episode ends on the next floor number as the cliffhanger.
Sound: code-made (audio/mix.py): heartbeat, door bangs, zombie groans, wind, rope creaks, snap, glass, bass hit. Gate: delivered, awaiting notes.
Re-render: cd engine && npm i && CHROME_PATH=<chrome> node capture.js --from 0 --to 2699 --sub 2 --out ../render/frames; python3 audio/mix.py (run inside audio/).

## SERIES BIBLE (from Ep 2 redo, 2026-10-30)
Hook: stuck on floor 13; every episode ends one floor lower. Goal: rescue vans leave street level at SUNRISE (countdown chip on screen, 48:00 at Ep2).
Villain: THE LANDLORD (tie zombie, var 1, RENT DUE clipboard). Ignores every distraction; only wants Dev (rent). Running gag + threat.
Ally (from Ep4): Mira, a survivor in the lobby security room, on a walkie-talkie.
- Ep1 Floor 13: three options (elevator/stairs/window) -> bedsheet rope -> rope ends at 10 -> zombie climbs down -> kick.
- Ep2 Floor 10 (redo): crash in -> sits on remote, TV: vans leave at sunrise -> landlord climbs in -> hallway, fire hose -> Mom calls, "go fetch" -> landlord ignores phone, grabs hose as Dev dives.
RULES (from Ep3 on): grounded logic. Zombies only shamble, grab, bite, follow sound; no skills (no climbing gear, no machines). Every event needs a physical cause the viewer can see. Tone: mysterious.
- Ep3 Floor 9 "The Hose" (v2): landlord follows down the hose; a stumbling zombie hits the valve -> water -> jet knocks landlord off, he falls into the dark (body never seen). Hose swing -> floor 7 gym: power on, empty treadmill running, zombies chained inside the glass studio, "DON'T TRUST THE LOBBY" on the mirror; Mira radios from the lobby.
- Ep4 Floor 7 "Who Is Mira": walkie talk; Mira knows Dev's name (how?). Gym bag holds a keycard "B. PATEL - MAINTENANCE" (the landlord's). Studio chain was locked from the outside: someone survives up here.
- Ep5 Floor 5 "Maintenance": service stairwell via the keycard; generator noise explains the power; a survivor's camp; tapes/notes about the lobby.
- Ep6 Lobby "Sunrise": the van, Mira's truth, the landlord's fate. Season-2 hook.
REVEAL MAP (plant -> payoff): Mira knows Dev's name (Ep4) -> she ran the front desk / building intercom (Ep6). Patel's keycard + note (Ep4) -> Patel locked infected tenants away to protect others, then was bitten; "rent" = Dev's unpaid rent envelope held the spare service-stair key (Ep5/6). Mirror "DON'T TRUST THE LOBBY" (Ep3) -> written by the survivor behind the STAFF door (Ep5), who saw the van take people who never came back (Ep6).
- Ep5 DONE "Behind the Door": Ray (night maintenance, orange jumpsuit) wrote the mirror; generator = power; Patel bitten saving Ray; van idling, doors open, nobody inside; Mira watches via cameras; Ray rips the cable. End poll: Ray or Mira?
- Ep6 PLAN "The Van": floors 5->1 via service stairs; Dev's rent envelope (Patel kept asking) holds the lobby security-room key; Mira = front-desk night clerk locked in the security room; the van driver...
