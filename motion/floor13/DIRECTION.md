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
STAGING RULES (after Ep5 fix): characters must stand on a visible surface every frame. On stairs use onStairs() (feet re-seated per step via stairSurf); scenes on a landing use a full-width floor (landingSet). Never interpolate y linearly over stairs. Keep characters >= 120 px inside the frame edges; check every shot at full res before the final render.
- Ep6 DONE "The Van" (v2, 61.9s): floors 5->1 with Ray down a real switchback stairwell; at the GROUND-floor stairwell door they see the lobby through its wired glass; Mira confirmed real (security booth); camera blind spot under the awning hides zombies; idling engine = dinner bell; Mira's PA music in the garage pulls them away; cliffhanger: Patel's RENT DUE clipboard under the ground-floor stairs + wet footprints from the LOBBY door ("he fell 8 floors, who carried it in?").
- Ep7 PLAN "The Lobby": cross the lobby to Mira's booth; footprints lead to the booth's back door; Mira admits Patel came down after the fall (bitten, still half-aware, keeps "collecting" from tenants by habit = grounded zombie routine); seed: van driver never gets out of the cab. Poll: TRUST MIRA / TRUST RAY.
- QA added (Ep6): caption scale capped at 1000px incl. pop; wide shots keep labels >=60px inside frame; cliffhanger text below captions, never under the clue board; landing characters only on the floor slab (x >= -300).
- STAIRS RULE (Ep6 v2): stairwells are switchbacks: landing -> 10-step half-flight -> mid landing U-turn -> half-flight -> next landing. Characters follow one walking route (zLegs/zAt in eps6.js) with feet on the same surface functions the set is drawn from. Floor skips are cuts to a NEW landing beat, never a teleport back to the top of the same flight. Shot segments are picked by the frame number so motion blur never blends two takes.
- SIGHTLINE RULE: a character can only see what is physically in view from where they stand (no lobby from floor 2). Inserts must be motivated (door glass, monitor POV).
- Ep7 DONE "The Lobby" (59s): prints run both ways in the stairwell (in to the clipboard, back out); in the lobby they lead to Mira's booth; torn awning = Patel survived the 8-floor fall; the garage song ends -> Ray kills the flashlight, "don't run, walk"; zombies return to the engine noise and trip the automatic doors' sensor; Mira buzzes Dev + Ray into the booth. Inside: Mira knows every tenant (Dev = 1307, front-desk payoff); CAM 3 shows the van driver hasn't moved in ~58 min; three slow knocks from the OFFICE door (Patel's rent knock); Patel (tie zombie) seen behind the blinds. End: "PART 8 / THE KNOCK - would you open the door?"
- Ep8 PLAN "The Knock": Mira explains: Patel came in bitten but still talking, she locked him in the office for everyone's safety (mirrors Patel locking infected tenants away). Grounded rule: the bitten keep habits for a while (knocks, collecting). The van: the driver is belted in and dead/turned, foot off the brake in park; the engine idles until the fuel runs out = a clock. Choice: use the van (needs the driver out) vs wait for real rescue.
- Ep8 DONE "The Knock" (58.5s): Patel asked Mira to lock him in ("don't let me collect") - he did to himself what he did to the sick tenants; the stairwell prints = Patel trying to warn the tenants, he only made it to the first step (answers "who carried the clipboard in"). His knocking pulls the dead to the booth glass (sound rule). Dev, who dodged his rent for six months, knocks back three times -> Patel stops and waits (habit); the dead drift back. Beat of humour ("Six months, Dev?" / "Not now."). The van's engine dies (fuel) and CAM 3 shows the driver's seat EMPTY, belt hanging. End: "PART 9 / THE DRIVER".
- Ep9 PLAN "The Driver": no engine = no beacon; the dead under the awning start to spread. Where is the driver? Grounded answer to plant: he was not dead, he was hiding very still (a survivor who learned they track movement + sound) - he's the one who's been "taking people" to safety, or he's bitten. Ray recognises the van's company logo. Keep the sunrise clock.
- DISK: delete old render/framesN after encoding (each episode ~12 GB of PNGs).
- Ep8 v2 (animation pass): Mira redrawn - hair is a crown + fringe + ponytail framing the face (the old solid half-disc hid her eyes), lashes, blush, headset earpiece behind the face. Acting layer for every booth shot: talk-driven hand gestures (Dev R hand, Ray free L hand, Mira R hand), knock flinches (hop + lean back + wide eyes), idle weight shifts, Mira swivels toward whoever she talks to. Coverage: dialogue is cut as close singles/two-shots (z 1.8-2.2) chosen by frame number; wides only for geography (dead at the glass, leaving). Use this cast/acting pattern from now on.
- Ep9 DONE "The Driver" (57s): engine off = no beacon. Mira rewinds CAM 3/CAM 2: the driver was ALIVE, playing dead for an hour; he moved only inside the dead's groans (on-screen [GROANING]/[SILENCE] + CCTV MOTION box, groans in the mix sit exactly in those windows), crawled UNDER the van, past the dead, through the automatic doors. Van = ST. ANNE'S PATIENT TRANSFER (hospital transfer, not rescue). Two minutes later: SLAP on the booth glass - the driver (grey-blue uniform, cap, ID badge, bandaged forearm) begs to be let in; the dead close in behind him. "Is that a bite?" / "It's glass. I swear it's glass." Ray: don't. Mira: "Dev. It's your call." End: "PART 10 / LET HIM IN?" poll OPEN or DON'T.
- Ep10 PLAN: follow the comment majority if known; default: Dev lets him in but makes him show the arm first (it IS glass - a clean cut, but the bandage is hospital issue). The driver explains ST. ANNE'S was moving "quiet" patients out of the city - patients who were bitten and hadn't turned. Mystery: the van's back doors are open and the patients are gone - into the building?
- RIG NOTE: person() returns hands in BODY-LOCAL coords (pre-mirror); world hand = (P.x + hand[0] * dir, P.y + hand[1] * s). Ep9 driver bandage was drawn at the wrong place because of this - fixed + Ep9 re-rendered.
- TONE (user, Ep10): do not censor wounds, scars, blood or crime scenes - stylised stick gore is welcome when it serves the mystery (cuts, glass shards, smeared handprints, cut restraints).
- Ep10 DONE "Let Him In" (57.4s): Dev makes him unwrap the arm first: one straight bleeding cut, glass shard still in it, no teeth marks. BZZT, he's in; the dead pound the glass. COLE drives for St. Anne's: six bitten-but-not-turned patients. CAM 4 (colour) van rear = crime scene: six empty stretchers, restraint straps CUT not torn, blood drag-smear, bloody handprints, IV bag swinging, rear window smashed (Cole looks away). CAM 5 (IR): the six in hospital gowns + wristbands, standing perfectly still facing the garage wall, [NO SOUND]; one turns and its eyes catch the IR. End: "PART 11 / THE QUIET ONES - who cut the straps?"
- Ep11 PLAN "The Quiet Ones": who cut the straps (Cole with the glass? he smashed the window from OUTSIDE to free them?). The quiet ones don't groan = they don't follow sound like the others; they follow... light? (Ray's flashlight). Patel in the office reacts to them. Keep sunrise clock (~40:30).
- Ep11 DONE "The Quiet Ones" (57.6s): Cole confesses he cut the straps with glass from the smashed window; the six stopped screaming all at once and only stared at the light. CAM 5 (IR): they turn to the camera's IR LEDs and walk toward it. "Light, not sound." The booth is the brightest thing in the lobby: Mira kills the monitors (3 CLICKs) but the EXIT sign over the office door runs on battery. Plant: office door frame cracked by Patel's Ep8 knocking. Six silent faces at the glass in red light: gowns, wristbands, neck bites bleeding into the gowns, eyes catching the light. Ray throws his flashlight - CRASH, sign out; the crash sets Patel off (sound rule) - BANG - the cracked frame splits - the door creaks open. Black. knock knock knock, inside the booth. End: "PART 12 / LIGHTS OUT".
- MIX NOTE: very quiet episodes need compression before loudnorm (acompressor -> loudnorm -> +1.5 dB -> alimiter) to reach -14 LUFS.
- Ep12 PLAN "Lights Out": total dark; Patel (sound) inside the booth vs the quiet ones (light) outside. Rule-play: nobody can use light (quiet ones) or make noise (Patel). Dev uses what he knows: Patel waits when knocked back - knock-back to freeze him while Ray + Cole guide him back into the office by touch. Twist: Cole's ID badge has a reflective strip... it catches the light of the sunrise? Or the quiet ones started breaking the glass with their foreheads (silent, steady). Clock ~39:30.
