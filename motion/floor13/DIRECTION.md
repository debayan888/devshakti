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
- Ep3 Floor 9 "The Hose": hose descent with landlord above; someone opens the hydrant valve -> hose bucks like a jet; Dev swings into floor 7, landlord flung away (not gone).
- Ep4 Floor 7 "The Gym": treadmill zombies, walkie-talkie found: Mira in the lobby, "I can hold the van 5 minutes." 
- Ep5 Floor 4 "Daycare": silent floor, tiny zombies, music-box gag; landlord returns via laundry chute.
- Ep6 Lobby "Sunrise": van leaving, final chase; Dev pays the landlord with the rent envelope (distraction), escapes. Last shot: the van driver turns around... red eyes. Season 2.
