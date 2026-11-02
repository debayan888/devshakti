// eps12.js - Episode 12 "Lights Out": no light (the quiet ones), no noise (Patel). Patel shuffles out of the office and stops behind Mira
// (close-up, uncensored: torn cheek, neck bite, bloody collar). Dev answers his knock - Patel waits (Ep8 habit). Ray walks him back into the
// office by the tie ("Rent's paid"); Cole holds the cracked door with his back. Then the six lean on the glass - silent - and it cracks.
// The only other way out: through the office.
'use strict';
const T0_12 = 39 * 60 + 28;
const CLUES12 = [[5.0, 'PATEL IS INSIDE THE BOOTH'], [21.0, 'KNOCK BACK STILL WORKS'], [34.4, 'COLE HOLDS THE OFFICE DOOR'], [43.0, 'THE GLASS IS CRACKING'], [50.0, 'ONLY OTHER EXIT: THE OFFICE']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end12[0]) return; const left = Math.max(0, T0_12 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES12.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- Patel, loose in the dark (uncensored face)
const patelPath = ts => pw(ts, [[2.0, 6.0, -470, -400], [8.0, 12.0, -400, -320], [27.4, 32.2, -320, -540]], 1);
function patel12(ctx, f, ts, o = {}) {
  const P = patelPath(ts), back = ts > 27.4, a = 1 - clamp((P.x + 500) / -40), still = ts > EVS('b1') && !back;
  if (ts < EVS('emerge') || a <= 0) return;
  const tilt = ts > EVS('breath') && ts < EVS('b1') ? .35 : still ? .25 : .1;
  const pose = P.moving ? walkPose(P.x / 120, { stride: 22, lift: 8, bob: 3, lean: .26, tilt: .35, hands: { L: [86, -176], R: [70, -150] }, face: { look: [.9, .1], mouth: .6 } })
    : basePose(still ? 0 : pf5(f), { lean: .22, tilt, hands: back ? { L: [40, -140], R: [30, -150] } : { L: [86, -176], R: [70, -150] }, face: { look: [.9, .1], mouth: still ? .2 : .6 } });
  ctx.save(); ctx.globalAlpha *= a * (ts < EVS('emerge') + .6 ? clamp((ts - EVS('emerge')) / .6) : 1);
  const r = landlord(ctx, P.x, 0, f, pose, { dir: 1, noClip: true }), [hx, hy] = r.head;
  blob(ctx, hx - 8, hy + 46, 14, 9, BLOOD, .3, .95); line(ctx, hx - 6, hy + 52, hx - 4, hy + 120, 6, 'rgba(142,16,24,.85)');            // neck bite, bloody collar
  ctx.fillStyle = BLOOD; ctx.beginPath(); ctx.moveTo(hx + 12, hy + 4); ctx.lineTo(hx + 34, hy + 10); ctx.lineTo(hx + 30, hy + 26); ctx.lineTo(hx + 10, hy + 22); ctx.closePath(); ctx.fill();   // torn cheek
  ctx.fillStyle = '#EDE6D2'; for (let i = 0; i < 4; i++) ctx.fillRect(hx + 14 + i * 5, hy + 12, 3, 7);                                                                // teeth through it
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the glass: six leaning, cracks spreading from where their heads press
function glass12(ctx, f, ts) {
  const lean = sstep(ts, 36.0, 38.0);
  QX.forEach((x, i) => quietOne(ctx, x - 22 * lean * (1 - i * .12), f, i, { press: i === 0 || lean > .5, s: 1 - i * .04, a: .85 - i * .08, glint: '#DDE8FF', store: GL11 }));
}
function crackDraw(ctx, ts) {
  const k1 = clamp((ts - EVS('crk')) / 6), k2 = clamp((ts - EVS('crk2')) / 3);
  ctx.strokeStyle = 'rgba(230,240,255,.85)'; ctx.lineWidth = 2.5;
  for (const [cy, k, sd] of [[-232, k1, 1], [-128, k2, 7]]) { if (k <= 0) continue; ctx.beginPath();
    for (let j = 0; j < 9; j++) { const ang = j / 9 * TAU + hash(j + sd) * .5, L = (30 + hash(j * 3 + sd) * 170) * k; ctx.moveTo(346, cy); ctx.lineTo(346 + Math.cos(ang) * L * .6 + 4, cy + Math.sin(ang) * L); } ctx.stroke(); }
}
function lightPass12(ctx, ts, dark = .7) {                                             // no lights inside; a cold glow from the far entrance through the glass
  darkness(ctx, dark);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(900, -300, 20, 900, -300, 1100); g.addColorStop(0, 'rgba(90,130,200,.35)'); g.addColorStop(1, 'rgba(90,130,200,0)'); ctx.fillStyle = g; ctx.fillRect(-1600, -1600, 3200, 3200); ctx.restore();
  for (const [hx, hy, hr, dir, s, col] of GL11) for (const ex of [.26, .66]) { dot(ctx, hx + ex * hr * dir, hy - .12 * hr, 4.2 * s, col); glow(ctx, hx + ex * hr * dir, hy - .12 * hr, 20 * s, 'rgba(180,210,255,A)', .45); }
}
function brokenSign(ctx) { rr(ctx, -540, -440, 100, 40, 6, '#141010', PAL.ink, 3); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { ctx.moveTo(-490, -420); ctx.lineTo(-490 + Math.cos(i) * 40, -420 + Math.sin(i) * 18); } ctx.stroke(); }
// ----------------------------------------------------------------------------------------------- positions
const ray12 = ts => { const w = pw(ts, [[25.0, 27.2, 260, -230], [27.4, 32.2, -230, -420], [33.0, 34.6, -420, 0]], -1); if (ts >= 27.2 && ts < 33.0) w.dir = -1; if (ts >= 34) w.dir = 1; return w; };
const cole12 = ts => { if (ts < 30.0) return { x: -80, sit: 1, dir: 1 }; if (ts < 30.8) return { x: -80, sit: 1 - sstep(ts, 30.0, 30.8), dir: -1 };
  if (ts < 32.8) { const u = clamp((ts - 30.8) / 2.0); return { x: lerp(-80, -455, u), walk: u < 1, dir: -1 }; } return { x: -455, sit: sstep(ts, 33.0, 33.6), dir: 1 }; };
function cast12(ctx, f, ts, o = {}) {
  const tD = devTalk(f), tR = lineTalk(f, RAY8), tM = lineTalk(f, MIRA8), jolt = Math.min(1, ['bump1', 'bump2', 'tap1', 'tap2', 'tap3', 'crk', 'tap4', 'crk2'].reduce((v, k) => v + (ts >= EVS(k) ? Math.exp(-(ts - EVS(k)) * 8) * .6 : 0), 0));
  const tremble = ts > 9 && ts < EVS('b1') ? Math.sin(f * 1.7) * .5 + .5 : 0;
  mira(ctx, -220, -4, f, { s: 1, look: o.mlook || [.9, 0], dir: 1, mouth: tM, gesture: tM > .05 ? .6 : 0, brow: o.mbrow == null ? .7 : o.mbrow, wide: true, flinch: Math.max(jolt, tremble * .25) });
  const C = cole12(ts); cole10(ctx, C.x, f, ts, { ...C, gauze: true, unwrap: 1, look: o.clook || [.9, -.2], brow: .8, wide: true });
  const face = devFace(f, { wide: true, eyes: 1.3, brow: o.dbrow == null ? -.9 : o.dbrow, look: o.dlook || [.9, 0], mouth: tD, sweat: true });
  const knock = ['b1', 'b2', 'b3'].some(k => ts >= EVS(k) && ts < EVS(k) + .12), knocking = ts > 18.9 && ts < 21.0;
  const dp = basePose(o.freeze ? 0 : pf3(f), { lean: knocking ? .3 : .06 - .1 * jolt, face, hands: { L: [20, -100], R: knocking ? (knock ? [70, -168] : [64, -200]) : [40 + Math.sin(f * .17) * 10 * tD, -150 - 30 * tD] } });
  person(ctx, DEVH(130, 0, dp, { dir: -1, hoodie: false }), o.freeze ? 0 : pf3(f));
  const R = ray12(ts), pushing = ts >= 27.4 && ts < 32.2;
  const rp = R.moving && !pushing ? walkPose(R.x / 110, { stride: 20, lift: 7, bob: 2, lean: .1, face: rayFace8(f, o.rface || {}), hands: { L: [20, -100], R: [60, -150] } })
    : pushing ? walkPose(-R.x / 140, { stride: 16, lift: 5, bob: 2, lean: .18, face: rayFace8(f, { look: [.9, 0], brow: .6 }), hands: { L: [70, -190], R: [76, -160] } })
    : basePose(o.freeze ? 0 : pf3(f + 40), { lean: .08 - .1 * jolt, face: rayFace8(f, o.rface || {}), hands: { L: [20 + 30 * tR, -100 - 60 * tR], R: [60, -150] } });
  ray(ctx, R.x, 0, f, rp, { dir: R.dir, aim: .25, light: false });
}
function booth12(ctx, f, ts, o = {}) {
  GL11.length = 0;
  const doorOp = ts < EVS('shut') ? 1 : 1 - sstep(ts, EVS('shut'), EVS('shut') + .5);
  boothSet(ctx, f, ts, { shape: 0, gap: true, still: true, shake: ['bump1', 'bump2'].reduce((v, k) => v + (ts >= EVS(k) ? Math.sin((ts - EVS(k)) * 60) * 4 * Math.exp(-(ts - EVS(k)) * 10) : 0), 0), behind: c => glass12(c, f, ts) });
  crackLines(ctx); brokenSign(ctx); officeOpen(ctx, doorOp);
  patel12(ctx, f, ts);
  cast12(ctx, f, ts, o);
  lightPass12(ctx, ts, o.dark == null ? .7 : o.dark);
  crackDraw(ctx, ts);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.dark12 = (ctx, lt, lf, len, t, f) => {                                             // black-blue. Something steps out of the office.
  const ts = t / 60, cam = { x: lerp(-230, -280, ts / 8), y: -250, z: lerp(1.5, 1.65, ts / 8) };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, [[EVF('bump1'), 5], [EVF('bump2'), 5]]); booth12(ctx, f, ts, { freeze: true, mlook: [-.9, -.1] }); ctx.restore(); vig(ctx, .65);
  ['bump1', 'bump2'].forEach((k, i) => sfxPop(ctx, 'thk', W / 2 - 160 + i * 200, 600, f, EVF(k), '#9AA0B0', 54, 22, -.05));
};
SHOT.mira12 = (ctx, lt, lf, len, t, f) => {                                             // he stops behind Mira. His face. Her breath.
  const ts = t / 60, FR = f / 60;
  const cam = FR < EVS('face') ? { x: -280, y: -210, z: 2.0 } : FR < 13.6 ? { x: -290, y: -255, z: lerp(3.0, 3.25, (ts - 10.4) / 3.2) } : { x: -260, y: -200, z: lerp(2.3, 2.45, (ts - 13.6) / 3.4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, []); booth12(ctx, f, ts, { freeze: true, dark: FR >= EVS('face') && FR < 13.6 ? .5 : .66, mlook: [.9, -.05], mbrow: .9 }); ctx.restore(); vig(ctx, .7);
  if (FR >= 14.0 && FR < 17) marker(ctx, '…HE HEARD HER BREATHE', W / 2, 1600, 46, '#9FD8FF', { stroke: 12, a: sstep(ts, 14.1, 14.4) });
};
SHOT.answer12 = (ctx, lt, lf, len, t, f) => {                                           // Dev answers the knock on the desk. Patel waits.
  const ts = t / 60, FR = f / 60;
  const cam = FR < 19.2 ? { x: 135, y: -260, z: 2.2 } : FR < 21.0 ? { x: 110, y: -190, z: 2.9 } : { x: -60, y: -255, z: lerp(1.42, 1.5, (ts - 21) / 4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, []); booth12(ctx, f, ts, { freeze: true, mlook: [.9, -.05] }); ctx.restore(); vig(ctx, .65);
  ['b1', 'b2', 'b3'].forEach((k, i) => sfxPop(ctx, 'knock', W / 2 - 260 + i * 260, 600, f, EVF(k), '#9FD8FF', 64, 26, -.05 + i * .05));
  if (FR >= 21.6) marker(ctx, '…HE WAITS', W / 2, 1600, 56, PAL.amber, { stroke: 12, s: outB((ts - 21.6) / .25, 1.5) });
};
SHOT.guide12 = (ctx, lt, lf, len, t, f) => {                                            // Ray walks him back by the tie; Cole holds the door
  const ts = t / 60, FR = f / 60;
  const cam = FR < 28.4 ? { x: -60, y: -255, z: 1.45 } : FR < 31.6 ? { x: -360, y: -260, z: 1.8 } : FR < 33.2 ? { x: -260, y: -260, z: 1.25 } : { x: -400, y: -175, z: lerp(2.1, 2.25, (ts - 33.2) / 2.8) };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, [[EVF('shut'), 4]]); booth12(ctx, f, ts, { mlook: [-.9, -.05], rface: { look: [.9, 0] } }); ctx.restore(); vig(ctx, .6);
  sfxPop(ctx, 'click', W / 2, 600, f, EVF('shut'), '#9AA0B0', 56, 22, .04);
};
SHOT.crack12 = (ctx, lt, lf, len, t, f) => {                                            // tap... tap... the six lean; the glass starts to crack
  const ts = t / 60, FR = f / 60;
  const cam = FR < 41.0 ? { x: 430, y: -240, z: lerp(1.8, 2.0, (ts - 36) / 5) } : FR < 44.4 ? { x: 20, y: -265, z: 1.0 } : { x: 10, y: -265, z: 2.0 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, [[EVF('crk'), 4], [EVF('crk2'), 5]]); booth12(ctx, f, ts, { freeze: true, mlook: [.9, 0], clook: [.9, 0], rface: { look: [.9, 0], brow: 1 } }); ctx.restore(); vig(ctx, .6);
  ['tap1', 'tap2', 'tap3', 'tap4'].forEach((k, i) => sfxPop(ctx, 'tap', W / 2 - 240 + i * 160, 600 + (i % 2) * 60, f, EVF(k), '#DDE8FF', 50, 22, .04));
  sfxPop(ctx, 'krk…', W / 2 + 80, 760, f, EVF('crk'), '#DDE8FF', 70, 40, -.04); sfxPop(ctx, 'KRRK', W / 2 - 60, 760, f, EVF('crk2'), '#DDE8FF', 80, 40, .04);
};
SHOT.choice12 = (ctx, lt, lf, len, t, f) => {                                           // "There's one more way out. Through his office." -> Cole, sitting against it
  const ts = t / 60, FR = f / 60, cam = FR < 50.8 ? { x: -240, y: -175, z: 2.1 } : { x: -430, y: -175, z: lerp(2.3, 2.6, (ts - 50.8) / 2.2) };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, []); booth12(ctx, f, ts, { mlook: FR < 50.8 ? [.9, 0] : [-.9, 0], clook: FR >= 51.2 ? [-.9, -.3] : [.9, 0] }); ctx.restore(); vig(ctx, .65);
};
SHOT.end12 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 13', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THROUGH THE', 0, -50, 96, PAL.red, { stroke: 20 }); marker(ctx, 'OFFICE', 0, 60, 120, PAL.red, { stroke: 22 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'THE GLASS OR THE OFFICE?', W / 2, 1000, 50, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR PICK', W / 2, 1080, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
