// eps7.js - Episode 7 "The Lobby": out of the stairwell on the wet prints; the torn awning (Patel survived the fall); the music ends and the
// automatic doors let the dead back in; Mira buzzes them into the booth; she knows every tenant; the van driver never moves;
// three slow knocks on the back-office door - Patel's rent knock. Cliffhanger: what did Mira lock in there?
'use strict';
const T0_7 = 44 * 60 + 20, RAY7 = ['q1', 'q2', 'q3', 'q4'], MIRA7 = ['m1', 'm2', 'm3', 'm4'];
const rayFace7 = (f, o = {}) => ({ look: [.6, 0], brow: .5, mouth: lineTalk(f, RAY7), eyes: .8, smile: -.2, ...o });
function curFloor(f) { return 1; }
const CLUES7 = [[4.4, 'PRINTS GO BACK OUT'], [8.6, 'PRINTS LEAD TO THE BOOTH'], [14.4, 'TORN AWNING: PATEL SURVIVED'], [38.0, 'VAN DRIVER NEVER MOVES'], [52.8, 'SOMEONE IN THE BACK OFFICE']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end7[0]) return; const left = Math.max(0, T0_7 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES7.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- motion helpers
function pw(ts, segs, dir0 = -1) {                                                 // piecewise walk: [[a, b, x0, x1], ...] -> {x, moving, dir}
  let x = segs[0][2], dir = dir0, moving = false;
  for (const [a, b, x0, x1] of segs) { if (ts < a) break; const u = clamp((ts - a) / (b - a)); x = lerp(x0, x1, u); dir = Math.sign(x1 - x0) || dir; moving = u > 0 && u < 1; }
  return { x, moving, dir };
}
function shoe(ctx, x, y, d, a) {                                                   // a wet shoe print, toe pointing toward d
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(d, 1); blob(ctx, 4, 0, 13, 5, 'rgba(130,165,205,.85)'); blob(ctx, -12, 0, 6, 4, 'rgba(130,165,205,.85)'); ctx.restore();
}
function rainField(ctx, f, x0, x1, y0, y1, n = 70) {
  ctx.save(); ctx.strokeStyle = 'rgba(170,190,225,.35)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i < n; i++) { const x = x0 + hash(i * 7.13) * (x1 - x0), sp = 20 + hash(i * 3.31) * 10, h = y1 - y0, y = y0 + ((hash(i * 1.77) * h + f * sp) % h); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 24); }
  ctx.stroke(); ctx.restore();
}
function zWalker(ctx, x, y, f, sd, o = {}) {                                       // a lobby zombie: shuffling walk or idle sway
  const pose = o.moving ? walkPose((o.ph || x) / 90, { stride: 22, lift: 8, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176], R: [78, -190] }, face: { look: [.7, .1], mouth: .7 } }) : zpose(pf5(f + sd * 4), sd, { stride: 0, lift: 0 });
  ctx.save(); ctx.globalAlpha *= o.a == null ? 1 : o.a; person(ctx, { x, y, s: o.s || 1, dir: o.dir || -1, kind: 'z', seed: sd, var: sd % 5 === 1 ? 2 : sd % 5, pose }, pf5(f + sd * 4)); ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the lobby (side view; floor y = 0)
// left -> right: security booth (-1300..-850, door at its right end), STAIRS door (-150..-10), camera, bench + plant, automatic glass doors (500..1100)
const ZOMB7 = [                                                                    // outside on the street, back from the garage when the music ends
  { sd: 31, walk: [[18.0, 20.3, 1320, 820]], enter: 21.4, inn: [[22.0, 24.6, 820, 600], [25.0, 26.5, 600, 820]] },
  { sd: 33, walk: [[18.3, 20.8, 1380, 900]], enter: 21.9, inn: [[22.5, 24.8, 900, 720], [25.3, 26.8, 720, 900]] },
  { sd: 35, walk: [[18.6, 21.0, 1440, 1010]] },
  { sd: 34, walk: [[19.0, 21.4, 1500, 1060]] }];
function zState(z, ts) {                                                           // -> {x, layer: 'out'|'step'|'in', u, moving, dir}
  const w = pw(ts, z.walk);
  if (!z.enter || ts < z.enter) return { ...w, layer: 'out', u: 0 };
  if (ts < z.enter + .6) return { x: w.x, layer: 'step', u: (ts - z.enter) / .6, moving: true, dir: -1 };
  return { ...pw(ts, z.inn), layer: 'in', u: 1 };
}
function lobbyHall(ctx, f, ts, o = {}) {
  const slide = o.slide || 0;
  ctx.fillStyle = '#141A28'; ctx.fillRect(-1900, -820, 3800, 830);
  ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = -1900; x < 1900; x += 160) ctx.fillRect(x, -700, 4, 700);           // wall panels
  ctx.fillStyle = '#1C2333'; ctx.fillRect(-1900, -140, 3800, 140); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(-1900, -140, 3800, 4);  // wainscot
  // outside through the entrance: rain, the torn awning, the van idling, the dead
  ctx.save(); ctx.beginPath(); ctx.rect(500, -480, 600, 480); ctx.clip();
  skyGrad(ctx, 500, -480, 600, 480); ctx.fillStyle = '#16181F'; ctx.fillRect(500, -70, 600, 70); rainField(ctx, f, 500, 1100, -480, 0);
  const vx = 860; rr(ctx, vx, -150, 300, 140, 18, '#E8E6DC', PAL.ink, 4); rr(ctx, vx + 210, -138, 70, 56, 8, '#30364A', PAL.ink, 3); ctx.fillStyle = PAL.red; ctx.fillRect(vx + 120, -122, 12, 50); ctx.fillRect(vx + 102, -104, 48, 12);
  blob(ctx, vx + 70, -10, 24, 24, '#111'); blob(ctx, vx + 240, -10, 24, 24, '#111');
  for (let i = 0; i < 4; i++) { const u = ((f * .015 + i * .25) % 1); blob(ctx, vx - 10 - u * 80, -30 - u * 40, 8 + u * 24, 6 + u * 14, 'rgba(180,180,190,.35)', 0, 1 - u); }
  ctx.fillStyle = '#0A0B10'; ctx.beginPath(); ctx.moveTo(500, -480); ctx.lineTo(1100, -480); ctx.lineTo(1100, -415); ctx.lineTo(500, -415); ctx.closePath(); ctx.fill();   // awning
  ctx.fillStyle = '#3A1E22'; ctx.beginPath(); ctx.moveTo(640, -470); ctx.lineTo(820, -470); ctx.lineTo(800, -430); ctx.lineTo(770, -455); ctx.lineTo(745, -418); ctx.lineTo(712, -452); ctx.lineTo(684, -420); ctx.lineTo(660, -450); ctx.closePath(); ctx.fill();   // the rip: Patel came through here
  ctx.fillStyle = '#0A0B10'; ctx.beginPath(); ctx.moveTo(700, -420); ctx.lineTo(760, -420); ctx.lineTo(742, -350); ctx.lineTo(722, -372); ctx.closePath(); ctx.fill();   // torn flap hanging down
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(500, -415, 600, 415);
  if (o.outside) o.outside(ctx);
  ctx.restore();
  // sliding doors (panels clipped to the opening), sensor, frame
  ctx.save(); ctx.beginPath(); ctx.rect(500, -480, 600, 480); ctx.clip();
  for (const [x0, d] of [[500, -1], [800, 1]]) { const x = x0 + d * 290 * slide; ctx.fillStyle = 'rgba(160,210,255,.10)'; ctx.fillRect(x, -480, 300, 480); ctx.strokeStyle = '#9AA0B0'; ctx.lineWidth = 8; ctx.strokeRect(x + 4, -476, 292, 472); line(ctx, x + (d < 0 ? 280 : 20), -260, x + (d < 0 ? 280 : 20), -200, 6, '#9AA0B0'); }
  ctx.restore();
  ctx.strokeStyle = '#59627A'; ctx.lineWidth = 14; ctx.strokeRect(493, -487, 614, 487);
  rr(ctx, 770, -530, 60, 26, 6, '#2A2F3C', PAL.ink, 3); dot(ctx, 800, -517, 7, o.sensor ? '#6CFF9A' : '#7A1E1E'); if (o.sensor) glow(ctx, 800, -517, 40, 'rgba(108,255,154,A)', .5);
  marker(ctx, 'ENTRANCE', 800, -565, 30, '#9AA0B0', { stroke: 6 });
  // floor
  for (let x = -1900; x < 1900; x += 80) for (let r = 0; r < 4; r++) { ctx.fillStyle = (Math.round(x / 80) + r) % 2 ? '#2A2F3C' : '#232836'; ctx.fillRect(x, r * 30, 80, 30); }
  ctx.fillStyle = '#1C212D'; ctx.fillRect(-1900, 120, 3800, 1400); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(-1900, 0, 3800, 3);
  // STAIRS door (hinged at its left edge, opens toward us)
  const sd = o.stairs || 0; rr(ctx, -158, -308, 156, 308, 4, '#05060A', '#59627A', 6);
  if (sd < .98) { const w = 140 * (1 - .8 * sd); rr(ctx, -150, -300, w, 300, 3, '#3B4048', PAL.ink, 3); if (w > 60) { rr(ctx, -150 + w * .25, -272, w * .5, 96, 3, '#0A0D14', PAL.ink, 2); line(ctx, -146 + w * .1, -140, -150 + w * .9, -140, 7, '#8A90A0'); } }
  rr(ctx, -130, -360, 100, 34, 5, '#0E3A1E', '#2FAE5A', 3); marker(ctx, 'STAIRS', -80, -334, 22, '#6CFF9A', { stroke: .01 }); glow(ctx, -80, -343, 90, 'rgba(108,255,154,A)', .15);
  // camera (entrance cam), bench, plant
  ctx.save(); ctx.translate(250, -640); rr(ctx, -16, 0, 32, 40, 4, '#3A3F4E'); ctx.rotate(.55); rr(ctx, -10, 30, 90, 38, 12, '#E4E4DE', PAL.ink, 3); dot(ctx, 70, 40, 5, (f % 30) < 18 ? PAL.red : '#500'); ctx.restore();
  rr(ctx, 120, -70, 220, 26, 6, '#3A2B20', PAL.ink, 3); line(ctx, 140, -44, 140, 0, 8, '#222'); line(ctx, 320, -44, 320, 0, 8, '#222');
  rr(ctx, 380, -70, 60, 70, 8, '#3A2B20', PAL.ink, 3); for (let i = 0; i < 5; i++) blob(ctx, 410 + (i - 2) * 16, -100 - (i % 2) * 30, 18, 34, '#24402A', (i - 2) * .35);
  // wet prints: stairs door -> booth door
  for (let i = 0; i < 12; i++) shoe(ctx, -110 - i * 66, 12 + (i % 2) * 8, -1, .75);
  // security booth (glass), Mira at her desk
  rr(ctx, -1300, -340, 450, 340, 6, '#0B1220');
  for (let i = 0; i < 3; i++) { rr(ctx, -1280 + i * 110, -300, 96, 70, 6, '#0A1A2A', '#3A4A5A', 3); ctx.fillStyle = `rgba(110,200,255,${.35 + .1 * hash(Math.floor(f / 6) + i)})`; ctx.fillRect(-1274 + i * 110, -294, 84, 58); }
  glow(ctx, -1130, -260, 260, 'rgba(110,200,255,A)', .22); rr(ctx, -1300, -120, 300, 26, 4, '#3A2B20');
  rr(ctx, -1235, -100, 14, 100, 3, '#2A2A2A'); rr(ctx, -1270, -96, 70, 16, 4, '#333');                                                     // chair
  mira(ctx, -1230, -4, f, { s: .8, typing: !o.miraLook, look: o.miraLook || [.9, 0], dir: 1, mouth: lineTalk(f, MIRA7) });
  if (o.inBooth) o.inBooth(ctx);
  ctx.fillStyle = 'rgba(160,210,255,.12)'; ctx.fillRect(-1300, -340, 450, 340); ctx.strokeStyle = 'rgba(220,240,255,.55)'; ctx.lineWidth = 6; ctx.strokeRect(-1300, -340, 450, 340);
  const bd = o.boothDoor || 0, bw = 90 * (1 - .75 * bd); ctx.strokeStyle = '#C8D2E0'; ctx.lineWidth = 5; ctx.strokeRect(-850 - bw, -330, bw, 330); dot(ctx, -850 - bw + 12, -160, 6, '#C8D2E0');
  if (o.buzz) { dot(ctx, -830, -200, 8, '#6CFF9A'); glow(ctx, -830, -200, 40, 'rgba(108,255,154,A)', .6); }
  rr(ctx, -1170, -390, 190, 40, 6, '#D8D8D0'); marker(ctx, 'SECURITY', -1075, -360, 26, '#2A3550', { stroke: .01 });
}
// draws Dev and Ray in the lobby (or inside the booth glass when x < -870)
function duo(ctx, f, ts, R, D, o = {}) {
  const layer = (P, inside) => (inside ? P.x < -880 : P.x >= -880);
  const draw = inside => {
    if (layer(R, inside)) { const rp = R.moving ? walkPose((R.ph || R.x) / 110, { stride: 24, lift: 9, bob: 2, lean: .12, face: rayFace7(f, o.rface || {}), hands: { L: [20, -100], R: [70, -160] } }) : basePose(pf3(f), { lean: .08, face: rayFace7(f, o.rface || {}), hands: { L: [20, -100], R: [60, -160] } });
      ctx.save(); ctx.globalAlpha *= R.a == null ? 1 : R.a; ray(ctx, R.x, 0, f, rp, { dir: R.dir, aim: o.raim == null ? .3 : o.raim, light: o.rlight !== false }); ctx.restore(); }
    if (layer(D, inside)) { const face = devFace(f, { wide: !!o.wide, eyes: o.wide ? 1.25 : 1, brow: -.6, look: o.dlook || [.9, .1], mouth: devTalk(f), sweat: !!o.wide });
      const dp = D.moving ? walkPose((D.ph || D.x) / 110, { stride: 24, lift: 9, bob: 2, lean: .1, face, hands: { L: [20, -100], R: [36, -150] } }) : basePose(pf3(f), { lean: .06, face, hands: { L: [20, -100], R: [36, -150] } });
      ctx.save(); ctx.globalAlpha *= D.a == null ? 1 : D.a; person(ctx, DEVH(D.x, 0, dp, { dir: D.dir, hoodie: false }), pf3(f)); ctx.restore(); }
  };
  return draw;
}
// the pair's route (global seconds): out of the stairs door, left along the prints, stop to look back at the awning, on to the booth, inside
const RAYP7 = [[6.5, 9.4, -80, -300], [15.2, 16.8, -300, -440], [16.8, 21.6, -440, -895], [21.8, 22.8, -895, -1060]];
const DEVP7 = [[7.6, 9.4, -80, -180], [15.2, 16.8, -180, -320], [16.8, 22.3, -320, -895], [22.3, 23.1, -895, -980]];
function pairAt(ts) {
  const R = pw(ts, RAYP7), D = pw(ts, DEVP7);
  if (ts > 9.5 && ts < 15.2) { R.dir = 1; D.dir = 1; }                             // both turn to look back at the entrance
  if (ts >= 23.1) { R.dir = 1; D.dir = 1; }                                         // inside: watching the lobby
  R.a = clamp((ts - 6.25) / .3); D.a = clamp((ts - 7.3) / .3);                    // stepping out of the dark doorway
  return { R, D };
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.door7 = (ctx, lt, lf, len, t, f) => {                                          // ground-floor stairwell, at the LOBBY door: the prints run both ways
  const ts = t / 60, look = sstep(ts, 3.0, 3.5), cam = CAMKEYS(ts, [[0, 120, -250, 1.5, E.ioC], [3.0, 120, -250, 1.5, E.ioC], [4.2, 20, -200, 1.6, E.ioC], [6, 40, -220, 1.55]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.5 }, t, []); zigWell(ctx, f);
  ctx.save(); ctx.translate(-380, -4); ctx.rotate(-.08); ctx.scale(2.0, 2.0); rr(ctx, -40, -20, 80, 22, 4, '#C9A06A', PAL.ink, 3); rr(ctx, -32, -16, 64, 14, 2, '#F4F1E6'); ctx.font = `800 9px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = PAL.red; ctx.fillText('RENT DUE', 0, -6); ctx.restore();
  darkness(ctx, .5); glow(ctx, 320, -224, 200, 'rgba(160,200,255,A)', .2);
  for (let i = 0; i < 8; i++) shoe(ctx, 230 - i * 72, 7, -1, .35 + .5 * look);                                   // in: door -> under the stairs
  for (let i = 0; i < 8; i++) shoe(ctx, -300 + i * 72, 19, 1, .2 + .7 * look);                                   // out: back to the door
  ray(ctx, 40, 0, f, basePose(pf3(f), { lean: .14, face: rayFace7(f, { look: ts < 3 ? [.9, 0] : [.8, .8] }), hands: { L: [20, -100], R: ts < 3 ? [70, -170] : [80, -110] } }), { dir: 1, aim: ts < 3 ? .1 : .6 });
  const bar = sstep(ts, 5.3, 5.6), face = devFace(f, { eyes: 1.05, brow: -.7, look: ts > 3.4 && ts < 5 ? [-.9, .6] : [.9, -.1], mouth: devTalk(f) });
  person(ctx, DEVH(262, 0, basePose(pf3(f), { lean: .1 + .08 * bar, face, hands: { L: [20, -100], R: [58 + 8 * bar, -140] } }), { dir: 1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .55);
  if (ts > 4.1) marker(ctx, 'IN  ←', W / 2 - 170, 1560, 44, '#9FD8FF', { stroke: 10, a: sstep(ts, 4.1, 4.3) });
  if (ts > 4.3) marker(ctx, 'OUT  →', W / 2 + 170, 1560, 44, '#FFD27A', { stroke: 10, a: sstep(ts, 4.3, 4.5) });
};
SHOT.cross = (ctx, lt, lf, len, t, f) => {                                          // into the lobby: follow the prints, look back at the torn awning
  const ts = t / 60, { R, D } = pairAt(ts);
  const cam = CAMKEYS(ts, [[6.0, -60, -250, 1.35, E.ioC], [9.6, -230, -250, 1.35, E.ioC], [11.0, 760, -300, 1.05, E.ioC], [14.8, 780, -300, 1.08, E.ioC], [15.8, -330, -250, 1.35, E.ioC], [16.8, -380, -250, 1.35]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.3 }, t, []);
  lobbyHall(ctx, f, ts, { stairs: sstep(ts, 6.0, 6.35) * (1 - sstep(ts, 7.6, 8.1)) });
  duo(ctx, f, ts, R, D, { dlook: ts > 9.5 && ts < 15.2 ? [.9, -.4] : [.9, .2], rface: { look: ts > 9.5 && ts < 15.2 ? [.9, -.5] : [.6, .4] } })(false);
  ctx.restore(); vig(ctx, .45);
  if (ts > 12.6 && ts < 15.6) marker(ctx, 'TORN AWNING ↓', W / 2 - 40, 560, 50, PAL.red, { stroke: 12, s: outB((ts - 12.6) / .25, 1.5) });
};
SHOT.zeds = (ctx, lt, lf, len, t, f) => {                                           // the music ends; the automatic doors open for the dead; into the booth
  const ts = t / 60, FR = f / 60, { R, D } = pairAt(ts), sensor = ts >= EVS('sensor'), slide = sstep(ts, EVS('slide'), EVS('slide') + .8);
  const outside = c => ZOMB7.forEach(z => { const s = zState(z, ts); if (s.layer === 'out') zWalker(c, s.x, -8, f, z.sd, { s: .8, moving: s.moving, dir: -1 }); });
  const inside = () => ZOMB7.forEach(z => { const s = zState(z, ts); if (s.layer === 'step') zWalker(ctx, s.x - 20 * s.u, lerp(-8, 0, s.u), f, z.sd, { s: lerp(.8, 1, s.u), moving: true, dir: -1 });
    else if (s.layer === 'in') zWalker(ctx, s.x, 0, f, z.sd, { moving: s.moving, dir: s.dir }); });
  let cam;
  if (FR < 19.6) cam = { x: (R.x + D.x) / 2, y: -250, z: 1.35 };
  else if (FR < 21.6) cam = { x: 800, y: -270, z: 1.3 + .1 * clamp((ts - 19.6) / 2) };
  else if (FR < 24.0) cam = { x: -900, y: -250, z: 1.45 };
  else if (FR < 25.9) cam = { x: 720, y: -270, z: 1.05 };
  else cam = { x: -1080, y: -250, z: 1.35 + .05 * clamp((ts - 25.9) / 1.1) };
  const inner = duo(ctx, f, ts, R, D, { rlight: ts < EVS('lightoff'), wide: ts > 19, dlook: FR >= 24 ? [.9, 0] : [.9, .2], rface: { look: [.9, 0] }, raim: FR >= 22 ? -.1 : .3 });
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.3 }, t, []);
  lobbyHall(ctx, f, ts, { slide, sensor, outside, buzz: ts > EVS('buzz') && ts < EVS('buzz') + .5, boothDoor: sstep(ts, EVS('buzz'), EVS('buzz') + .3) * (1 - sstep(ts, EVS('shut'), EVS('shut') + .4)), inBooth: () => inner(true), miraLook: ts > 21 ? [.9, 0] : null });
  inner(false); inside();
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'WHRRR', W / 2 + 60, 560, f, EVF('slide'), '#9FD8FF', 90, 50, .06);
  sfxPop(ctx, 'BZZT', W / 2 + 120, 560, f, EVF('buzz'), '#6CFF9A', 100, 34, -.06);
  if (ts > 16.8 && ts < 18.6) marker(ctx, '♪ …SILENCE', W / 2, 560, 54, '#FFE58A', { stroke: 12, a: 1 - sstep(ts, 18.2, 18.6) });
};
// ----------------------------------------------------------------------------------------------- inside the booth
function boothSet(ctx, f, ts, o = {}) {
  ctx.fillStyle = '#0D1424'; ctx.fillRect(-1200, -820, 2400, 830); ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let y = -800; y < 0; y += 80) ctx.fillRect(-1200, y, 2400, 3);
  for (let i = 0; i < 4; i++) { const x = -250 + i * 130; rr(ctx, x, -480, 116, 86, 6, '#0A1A2A', '#3A4A5A', 4); ctx.fillStyle = `rgba(110,200,255,${.3 + .12 * hash(Math.floor(f / 6) + i * 3)})`; ctx.fillRect(x + 6, -474, 104, 74);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = -474; y < -400; y += 5) ctx.fillRect(x + 6, y, 104, 2); }
  glow(ctx, 0, -430, 380, 'rgba(110,200,255,A)', .25);
  rr(ctx, -290, -170, 620, 30, 4, '#3A2B20', PAL.ink, 3); ctx.fillStyle = '#21180F'; ctx.fillRect(-280, -140, 600, 140);                 // desk
  for (let k = 0; k < 6; k++) rr(ctx, -200 + k * 26, -186, 20, 14, 3, '#222');                                                         // keyboard
  // the back-office door: steel, small window with blinds, OFFICE plate
  const sh = o.shake || 0; ctx.save(); ctx.translate(sh, 0);
  rr(ctx, -568, -328, 156, 328, 4, '#05060A', '#59627A', 6); rr(ctx, -560, -320, 140, 320, 3, '#4A4F5C', PAL.ink, 3); line(ctx, -548, -150, -470, -150, 8, '#8A90A0');
  ctx.save(); ctx.beginPath(); ctx.rect(-525, -280, 70, 90); ctx.clip(); ctx.fillStyle = '#2A0C0E'; ctx.fillRect(-525, -280, 70, 90);
  glow(ctx, -470, -230, 90, 'rgba(255,60,50,A)', .45);
  if (o.shape) { ctx.save(); ctx.globalAlpha = o.shape; ctx.translate(-536, -6); landlord(ctx, 0, 0, f, zpose(pf5(f), 7, { stride: 0, lift: 0 }), { dir: 1, noClip: true }); ctx.restore(); ctx.fillStyle = 'rgba(40,6,8,.25)'; ctx.fillRect(-525, -280, 70, 90); }
  ctx.fillStyle = '#8A8F9C'; for (let y = -280; y < -190; y += 9) ctx.fillRect(-525, y, 70, o.gap ? 2 : 5);
  ctx.restore(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.strokeRect(-525, -280, 70, 90);
  rr(ctx, -536, -372, 92, 30, 5, '#D8D8D0'); marker(ctx, 'OFFICE', -490, -349, 20, '#2A3550', { stroke: .01 });
  ctx.restore();
  ctx.fillStyle = '#1A2030'; ctx.fillRect(-1200, 0, 2400, 1400); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(-1200, 0, 2400, 3);
  ctx.fillStyle = 'rgba(160,210,255,.07)'; ctx.fillRect(330, -820, 900, 820); line(ctx, 330, -820, 330, 0, 6, 'rgba(220,240,255,.4)');                   // booth glass (right)
  rr(ctx, -228, -100, 14, 100, 3, '#2A2A2A'); rr(ctx, -262, -96, 70, 16, 4, '#333');                                                    // Mira's chair
}
function boothCast(ctx, f, ts, o = {}) {
  mira(ctx, -220, -4, f, { s: 1, typing: false, look: o.mlook || [.9, 0], dir: 1, mouth: lineTalk(f, MIRA7), brow: o.mbrow == null ? -.3 : o.mbrow, lean: o.mlean });
  if (o.point) { const [hx, hy] = [-130, -260]; line(ctx, -150, -190, hx, hy, 10, '#7A4FB0'); dot(ctx, hx, hy, 9, '#F2EFE6'); }
  const face = devFace(f, { wide: !!o.wide, eyes: o.wide ? 1.3 : 1.05, brow: o.dbrow == null ? -.7 : o.dbrow, look: o.dlook || [.9, 0], mouth: devTalk(f), sweat: !!o.wide });
  person(ctx, DEVH(60, 0, basePose(pf3(f), { lean: .06, face, hands: { L: [20, -100], R: [36, -150] } }), { dir: o.ddir || -1, hoodie: false }), pf3(f));
  ray(ctx, 220, 0, f, basePose(pf3(f), { lean: .08, face: rayFace7(f, o.rface || {}), hands: { L: [20, -100], R: [60, -150] } }), { dir: o.rdir || -1, aim: .25, light: false });
}
function vanCam(ctx, f, ts) {                                                       // CAM 3: the van's cab - the driver never moves
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10);
  const z = 1 + .25 * clamp((ts - 35) / 4.6);
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 760); ctx.scale(z, z);
  ctx.fillStyle = '#1A1D24'; ctx.fillRect(-500, -400, 1000, 800); rainField(ctx, f, -500, 500, -400, 400, 90);
  rr(ctx, -380, -260, 760, 520, 40, '#D8D6CC', PAL.ink, 6); rr(ctx, -320, -220, 640, 260, 24, '#46546C', PAL.ink, 5);              // cab + windshield
  ctx.save(); ctx.beginPath(); rrect(ctx, -320, -220, 640, 260, 24); ctx.clip(); glow(ctx, 60, 60, 260, 'rgba(120,200,255,A)', .35);
  blob(ctx, 60, -60, 52, 52, '#05060A'); ctx.fillStyle = '#05060A'; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.quadraticCurveTo(60, -30, 160, 40); ctx.fill();                       // the driver: still
  line(ctx, -10, 30, -60, 10, 14, '#05060A'); line(ctx, 130, 30, 180, 10, 14, '#05060A'); ctx.strokeStyle = '#2A2F3C'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(60, 20, 90, 30, 0, Math.PI, TAU); ctx.stroke();   // hands on the wheel
  for (let i = 0; i < 9; i++) { const u = (hash(i * 9.1) + f * .004 * (1 + hash(i))) % 1; blob(ctx, -300 + hash(i * 4.4) * 600, -200 + u * 240, 3, 7, 'rgba(200,220,255,.35)'); }
  ctx.restore(); rr(ctx, -340, 90, 680, 70, 12, '#B9B7AE'); ctx.fillStyle = PAL.red; ctx.fillRect(-20, 100, 40, 50);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(110, 410, W - 220, 700); ctx.restore();
  for (let y = 410; y < 1110; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(110, y, W - 220, 2); }
  marker(ctx, 'CAM 3 · ENTRANCE', 330, 470, 36, '#6CFF9A', { stroke: 8 }); marker(ctx, 'REC ●', W - 220, 470, 36, PAL.red, { stroke: 8, a: (f % 40) < 26 ? 1 : .2 });
  const mins = 58 + Math.floor(ts / 60); marker(ctx, `DRIVER: NO MOVEMENT · ${mins} MIN`, W / 2, 1070, 34, '#FFD27A', { stroke: 8, a: sstep(ts, 36.4, 36.8) });
  vig(ctx, .6);
}
SHOT.booth = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (f / 60 >= EVS('cctv') && f / 60 < EVS('cctv_out')) { vanCam(ctx, f, ts); return; }
  const cam = CAMKEYS(ts, [[27, 100, -250, 1.15, E.ioC], [29.6, -60, -250, 1.2, E.ioC], [33.0, -120, -250, 1.25, E.ioC], [35.0, -60, -260, 1.2, E.ioC], [39.6, -60, -250, 1.2, E.ioC], [41.9, -100, -250, 1.22]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.3 }, t, []); boothSet(ctx, f, ts);
  const glance = ts > 32.4 && ts < 34.0;
  boothCast(ctx, f, ts, { mlook: glance ? [-.9, -.1] : [.9, 0], mbrow: glance ? .4 : -.3, point: ts > EVS('point') && ts < 37.9, dlook: ts > 35 && ts < 40 ? [-.9, -.6] : [.9, 0], dbrow: ts > 40 ? -1 : -.7, rface: { look: glance ? [.9, -.2] : [.9, 0] } });
  ctx.restore(); vig(ctx, .45);
};
SHOT.knock = (ctx, lt, lf, len, t, f) => {                                          // three slow knocks from the back office
  const ts = t / 60, ks = ['k1', 'k2', 'k3'].map(EVS);
  let sh = 0; for (const k of ks) if (ts >= k) sh += Math.sin((ts - k) * 70) * 5 * Math.exp(-(ts - k) * 9);
  const cam = CAMKEYS(ts, [[41.9, -100, -250, 1.22, E.ioC], [42.3, -160, -250, 1.06, E.ioC], [EVS('push'), -150, -250, 1.06, E.ioC], [EVS('push') + 2.0, -490, -235, 2.6, E.ioC], [54, -490, -235, 2.75]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.3 }, t, ks.map(k => [Math.round(k * 60), 8]));
  boothSet(ctx, f, ts, { shake: sh, shape: sstep(ts, EVS('shape'), EVS('shape') + .8), gap: ts > EVS('shape') });
  for (const k of ks) if (ts >= k && ts < k + .6) { const u = (ts - k) / .6; blob(ctx, -420 + u * 30, -300 + u * 40, 10 + u * 20, 8 + u * 14, 'rgba(200,200,200,.25)', 0, 1 - u); }
  const turned = ts > ks[0] + .15;
  boothCast(ctx, f, ts, { mlook: turned ? [-.9, -.1] : [.9, 0], mbrow: .6, wide: turned, ddir: -1, dlook: turned ? [.9, -.1] : [.9, 0], rdir: -1, rface: { look: [.9, -.1], brow: .9 } });
  ctx.restore(); vig(ctx, .55 + .1 * sstep(ts, EVS('push'), EVS('push') + 2));
  ks.forEach((k, i) => sfxPop(ctx, 'KNOCK', W / 2 - 220 + i * 220, 560 + i * 40, f, Math.round(k * 60), PAL.chalk, 76, 30, -.06 + i * .05));
};
SHOT.end7 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 8', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THE KNOCK', 0, 0, 140, PAL.red, { stroke: 26 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'WOULD YOU OPEN THE DOOR?', W / 2, 960, 52, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YES OR NO', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
