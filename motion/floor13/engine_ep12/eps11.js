// eps11.js - Episode 11 "The Quiet Ones": Cole cut the straps (glass from the window). The six went silent and now follow LIGHT, not sound.
// The booth is the brightest thing in the lobby: Mira kills the monitors, but the EXIT sign runs on battery. Six bitten faces appear at the
// glass in red light, without a sound. Ray throws his flashlight and smashes the sign; the crash sets Patel off - he slams the office door
// and the frame his knocking cracked (Ep8) gives way. In the dark: knock, knock, knock - from INSIDE the booth.
'use strict';
const T0_11 = 40 * 60 + 26;
const CLUES11 = [[4.0, 'COLE CUT THE STRAPS'], [13.6, 'THE QUIET ONES FOLLOW LIGHT'], [27.4, 'EXIT SIGN RUNS ON BATTERY'], [29.2, 'OFFICE DOOR FRAME CRACKED'], [50.4, "PATEL'S DOOR IS OPEN"]];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end11[0]) return; const left = Math.max(0, T0_11 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES11.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- lights: monitors (switchable) and the battery EXIT sign
const lightsOn = ts => 3 - ['off1', 'off2', 'off3'].filter(k => ts >= EVS(k)).length;                        // 3 = all monitors on
const exitOn = ts => !(ts >= EVS('crash'));
function exitSign(ctx, f, ts) {
  rr(ctx, -540, -440, 100, 40, 6, exitOn(ts) ? '#3A0A0A' : '#141010', PAL.ink, 3);
  if (exitOn(ts)) { marker(ctx, 'EXIT', -490, -411, 26, '#FF4A3A', { stroke: .01 }); }
  else { ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { ctx.moveTo(-490, -420); ctx.lineTo(-490 + Math.cos(i) * 40, -420 + Math.sin(i) * 18); } ctx.stroke(); }
}
function crackLines(ctx) {                                                            // the office door frame, split by Patel's knocking (Ep8)
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-411, -300); ctx.lineTo(-403, -262); ctx.lineTo(-415, -228); ctx.lineTo(-405, -190); ctx.lineTo(-413, -150); ctx.stroke();
  ctx.strokeStyle = '#05060A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-414, -300); ctx.lineTo(-406, -262); ctx.lineTo(-418, -228); ctx.lineTo(-408, -190); ctx.lineTo(-416, -150); ctx.moveTo(-406, -262); ctx.lineTo(-396, -250); ctx.stroke();
}
function officeOpen(ctx, op) {                                                        // the door swung inward a little: a black gap
  if (op <= 0) return; const w = 140 * (1 - .32 * op);
  ctx.fillStyle = '#020203'; ctx.fillRect(-560, -320, 140, 320); rr(ctx, -560, -320, w, 320, 3, '#3C414C', PAL.ink, 3); line(ctx, -548, -150, -560 + w - 20, -150, 8, '#7A808C');
}
function lightPass(ctx, f, ts, o = {}) {                                              // darkness + what light there is
  const on = lightsOn(ts), dark = o.dark != null ? o.dark : [.76, .68, .52, .12][on];
  darkness(ctx, dark);
  if (exitOn(ts)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(-490, -420, 10, -490, -420, 900); g.addColorStop(0, `rgba(255,40,30,${.55 * (on < 3 ? 1 : .25)})`); g.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = g; ctx.fillRect(-1500, -1500, 3000, 3000); ctx.restore(); exitSign(ctx, f, ts); }
}
// ----------------------------------------------------------------------------------------------- the quiet ones: gowns, wristbands, bite wounds, eyes that catch the light
function quietOne(ctx, x, f, i, o = {}) {
  const s = o.s || 1, dir = o.dir || -1, press = !!o.press;
  const pose = basePose(0, { lean: .03 + (press ? .12 : 0), tilt: .1 * (i % 3 - 1), face: { look: [.9, 0], eyes: 1, mouth: 0, brow: 0, smile: -.1 }, hands: press ? { L: [96, -205], R: [90, -172] } : { L: [8, -96], R: [14, -98] } });
  ctx.save(); ctx.globalAlpha *= o.a == null ? 1 : o.a;
  const r = person(ctx, { x, y: o.y || 0, s, dir, kind: 'dev', seed: 90 + i, hoodie: false, shirt: '#9AA8B4', pants: '#9AA8B4', pose }, 0);
  const [hx, hy] = r.head, hr = 40 * s;
  blob(ctx, hx - 6 * dir * s, hy + 50 * s, 13 * s, 9 * s, BLOOD, .3, .9); line(ctx, hx - 4 * dir * s, hy + 56 * s, hx - 2 * dir * s, hy + 110 * s, 6 * s, 'rgba(142,16,24,.8)');   // neck bite, bleeding into the gown
  const ax = x + r.hands[0][0] * dir * s, ay = (o.y || 0) + r.hands[0][1] * s; rr(ctx, ax - 10 * s, ay + 6 * s, 20 * s, 9 * s, 2, '#E8E8E8');                // wristband
  if (o.store) o.store.push([hx, hy, hr, dir, s, o.glint]);
  else if (o.glint) for (const ex of [.26, .66]) { dot(ctx, hx + ex * hr * dir, hy - .12 * hr, 4.5 * s, o.glint); glow(ctx, hx + ex * hr * dir, hy - .12 * hr, 22 * s, 'rgba(255,90,80,A)', .5); }
  ctx.restore();
}
const QX = [430, 515, 600, 690, 775, 860], GL11 = [];
function faceRow(ctx, f, ts) {                                                         // behind the glass: they step out of the dark one by one
  QX.forEach((x, i) => { const a = clamp((ts - EVS('face0') - i * .8) / .7); if (a <= 0) return; quietOne(ctx, x, f, i, { press: i === 0, s: 1 - i * .04, a: a * (1 - i * .08), glint: exitOn(ts) ? '#FFB0A8' : '#FFFFFF', store: GL11 }); });
}
// ----------------------------------------------------------------------------------------------- cast (Ep8 acting pattern; freezes when they hold their breath)
function cast11(ctx, f, ts, o = {}) {
  const fr = o.freeze ? 0 : 1, tD = devTalk(f), tR = lineTalk(f, RAY8), tM = lineTalk(f, MIRA8), jolt = Math.min(1, ['crash', 'bang', 'k1', 'k2', 'k3'].reduce((v, k) => v + (ts >= EVS(k) ? Math.exp(-(ts - EVS(k)) * 7) : 0), 0));
  const pf = o.freeze ? 0 : pf3(f);
  mira(ctx, -220, -4, f, { s: 1, look: o.mlook || [.9, 0], dir: 1, mouth: tM, gesture: tM > .05 ? .8 : 0, brow: o.mbrow == null ? -.3 : o.mbrow, wide: !!o.mwide || jolt > .3, flinch: jolt });
  cole10(ctx, -80, f, ts, { sit: 1, dir: 1, gauze: true, unwrap: 1, look: o.clook || [.9, -.3], brow: o.cbrow == null ? -.8 : o.cbrow, wide: o.cwide });
  const face = devFace(f, { wide: !!o.wide || jolt > .3, eyes: o.wide || jolt > .3 ? 1.3 : 1.05, brow: o.dbrow == null ? -.7 : o.dbrow, look: o.dlook || [.9, 0], mouth: tD, sweat: !!o.sweat });
  const dp = basePose(pf, { lean: .06 - .12 * jolt + fr * Math.sin(f * .025) * .02, face, hands: { L: [20, -100], R: [40 + Math.sin(f * .17) * 14 * tD, -150 - 40 * tD] } });
  person(ctx, DEVH(130, 0, dp, { dir: o.ddir || -1, hoodie: false }), pf);
  const th = o.throwU == null ? -1 : o.throwU, rhand = th < 0 ? [60, -150] : th < .5 ? [lerp(60, -40, th * 2), lerp(-150, -250, th * 2)] : [lerp(-40, 110, (th - .5) * 2), lerp(-250, -200, (th - .5) * 2)];
  const rp = basePose(o.freeze ? 0 : pf3(f + 40), { lean: .08 - .12 * jolt + (th >= 0 ? .2 * Math.sin(th * Math.PI) : 0) + fr * Math.sin(f * .021 + 1) * .02, face: rayFace8(f, o.rface || {}), hands: { L: [20 + 30 * tR + Math.sin(f * .15) * 10 * tR, -100 - 60 * tR], R: rhand } });
  ray(ctx, 260, 0, f, rp, { dir: o.rdir || -1, aim: .25, light: false });
  if (o.torch) { const hx = 260 - rhand[0] * (o.rdir || -1) * -1; }
}
function booth11(ctx, f, ts, o = {}) {                                                 // set + door state + faces + cast + light pass
  GL11.length = 0;
  boothSet(ctx, f, ts, { shape: lightsOn(ts) === 3 ? .8 : .5, gap: true, still: !(ts > EVS('bang') && ts < EVS('bang') + .5), shake: ts > EVS('bang') ? Math.sin((ts - EVS('bang')) * 70) * 10 * Math.exp(-(ts - EVS('bang')) * 8) : 0, behind: c => faceRow(c, f, ts) });
  crackLines(ctx); officeOpen(ctx, sstep(ts, EVS('crack'), EVS('crack') + 2.6));
  cast11(ctx, f, ts, o);
  lightPass(ctx, f, ts, o);
  const gl = exitOn(ts) ? 1 : .35;                                                     // their eyes catch whatever light is left
  for (const [hx, hy, hr, dir, s, col] of GL11) for (const ex of [.26, .66]) { dot(ctx, hx + ex * hr * dir, hy - .12 * hr, 4.5 * s, col); glow(ctx, hx + ex * hr * dir, hy - .12 * hr, 22 * s, 'rgba(255,90,80,A)', .5 * gl); }
  if (o.relight) o.relight(ctx);
}
// ----------------------------------------------------------------------------------------------- IR: they turn to the camera light, then walk toward it
function irTurn(ctx, f, ts) {
  camScreen(ctx, f); const walk = clamp((ts - EVS('walk')) / 3.0), z = 1 + walk * .9;
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 980 + walk * 260); ctx.scale(.84 * z, .84 * z); ctx.translate(290, 0);
  ctx.fillStyle = '#2A2A2A'; ctx.fillRect(-1200, -900, 2400, 900); ctx.fillStyle = '#1C1C1C'; ctx.fillRect(-1200, 0, 2400, 600); ctx.fillStyle = '#3A3A3A'; ctx.fillRect(-1200, -900, 520, 900);
  for (const px of [-160, 420]) { ctx.fillStyle = '#333'; ctx.fillRect(px, -900, 70, 900); }
  for (let i = 0; i < 6; i++) { const x = -600 + i * 120 + (i % 2) * 20, turned = ts >= EVS('turn0') + i * .25; quietOne(ctx, x, f, i, { dir: turned ? 1 : -1, s: .95, a: 1 - clamp((ts - 17.0 - i * .1) / .8), glint: turned ? '#FFFFFF' : null }); }
  ctx.restore();
  camChrome(ctx, f, 'CAM 5 · GARAGE (IR)', clock10(ts + 41), '#7FBF7F');
  dot(ctx, W - 160, 1010, 10, (f % 20) < 10 ? '#FF6A6A' : '#AA3030'); marker(ctx, 'IR LIGHT ON', W - 300, 1012, 24, '#FF9A9A', { stroke: 6 });
  marker(ctx, '[ NO SOUND ]', W / 2, 560, 36, '#B8E986', { stroke: 10 });
  if (ts > 14.2 && ts < 17.6) marker(ctx, "THEY'RE COMING TO THE LIGHT", W / 2, 1180, 40, PAL.red, { stroke: 12, s: outB((ts - 14.2) / .25, 1.5) });
  vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.talk11 = (ctx, lt, lf, len, t, f) => {                                            // Dev presses; Cole confesses
  const ts = t / 60, FR = f / 60;
  const cam = FR < 2.3 ? { x: 20, y: -240, z: 1.6 } : FR < 5.0 ? { x: -60, y: -150, z: 2.1 } : FR < 7.0 ? { x: -240, y: -175, z: 2.1 } : { x: -60, y: -150, z: lerp(2.1, 2.35, (ts - 7) / 4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []); booth11(ctx, f, ts, { clook: FR >= 7 ? [.9, -.5] : [.9, -.2], cbrow: FR >= 7 ? .3 : -.8, mbrow: .5, dbrow: -.2, dlook: [.9, .2], rface: { look: [.9, .2], brow: .8 } }); ctx.restore(); vig(ctx, .45);
};
SHOT.cam5b = (ctx, lt, lf, len, t, f) => irTurn(ctx, f, t / 60);
SHOT.dark11 = (ctx, lt, lf, len, t, f) => {                                            // the booth glows -> Mira kills the monitors -> only the EXIT sign
  const ts = t / 60, FR = f / 60;
  const cam = FR < 21.6 ? { x: -240, y: -175, z: 2.1 } : FR < 23.6 ? { x: -60, y: -270, z: 1.05 } : FR < 25.8 ? { x: 20, y: -240, z: 1.6 } : FR < EVS('crackshot') ? { x: -240, y: -175, z: 2.1 } : { x: -440, y: -240, z: lerp(2.4, 2.6, (ts - 28.4) / 1.6) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  booth11(ctx, f, ts, { mlook: ts > 21.6 && ts < 23.6 ? [.9, -.6] : [.9, 0], mbrow: .6, mwide: ts > 22, wide: ts > 22, sweat: ts > 23, dlook: [.9, -.1], rface: { look: [.9, -.2], brow: 1 } });
  ctx.restore(); vig(ctx, .5);
  ['off1', 'off2', 'off3'].forEach((k, i) => sfxPop(ctx, 'CLICK', W / 2 - 200 + i * 200, 560, f, EVF(k), PAL.chalk, 60, 20, -.05));
  if (FR >= EVS('crackshot') + .3) marker(ctx, 'CRACKED BY HIS KNOCKING', W / 2, 1600, 44, PAL.amber, { stroke: 10, s: outB((ts - EVS('crackshot') - .3) / .25, 1.5) });
};
SHOT.faces = (ctx, lt, lf, len, t, f) => {                                             // six faces at the glass, red light, no sound
  const ts = t / 60, FR = f / 60, cam = FR < 36.2 ? { x: lerp(220, 300, (ts - 30) / 6.2), y: -260, z: lerp(1.2, 1.4, (ts - 30) / 6.2) } : { x: -40, y: -170, z: 2.2 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, []);
  booth11(ctx, f, ts, { freeze: true, wide: true, sweat: true, mwide: true, mbrow: .8, cwide: true, cbrow: 1, clook: [.9, -.1], dlook: [.9, -.05], rdir: 1, rface: { look: [.9, 0], brow: 1 } });
  ctx.restore(); vig(ctx, .6);
  if (FR >= 33.0 && FR < 36.2) marker(ctx, '…NOT A SOUND', W / 2, 1600, 48, '#FFB0A8', { stroke: 12, a: sstep(ts, 33, 33.4) });
};
SHOT.smash = (ctx, lt, lf, len, t, f) => {                                             // "I'll kill the light." -> throw -> CRASH -> Patel slams -> CRACK -> the door swings
  const ts = t / 60, FR = f / 60, thr = clamp((ts - EVS('throw')) / .45);
  const cam = FR < 42.4 ? { x: 250, y: -275, z: 1.9 } : FR < 44.6 ? { x: -120, y: -300, z: .95 } : { x: lerp(-200, -420, sstep(ts, 44.6, 47.6)), y: -230, z: lerp(1.2, 1.9, sstep(ts, 44.6, 47.6)) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, [[EVF('crash'), 10], [EVF('bang'), 14]]);
  booth11(ctx, f, ts, { freeze: ts < 41.6, throwU: ts >= 41.6 ? (ts < EVS('throw') ? 0 : thr) : -1, rdir: ts >= 41.4 ? -1 : 1, wide: true, sweat: true, mwide: true, cwide: true, rface: { look: [.9, -.4], brow: 1 }, dark: exitOn(ts) ? null : .86,
    relight: c => { if (ts >= EVS('throw') && ts < EVS('crash')) { const u = (ts - EVS('throw')) / (EVS('crash') - EVS('throw')), x = lerp(220, -490, u), y = lerp(-240, -420, u) - Math.sin(u * Math.PI) * 120; ctx.save(); ctx.translate(x, y); ctx.rotate(u * 12); rr(c, -24, -9, 48, 18, 5, '#2A2A2A', PAL.ink, 3); ctx.restore(); }
      if (ts >= EVS('crash') && ts < EVS('crash') + 1.2) for (let i = 0; i < 12; i++) { const u = (ts - EVS('crash')) / 1.2, sx = -490 + (hash(i) - .5) * 160 * u, sy = -420 + u * u * 420 * (.6 + hash(i * 3)); dot(c, sx, sy, 4, `rgba(255,${120 + 100 * hash(i)},80,${1 - u})`); } } });
  ctx.restore(); vig(ctx, .55);
  sfxPop(ctx, 'CRASH!', W / 2 - 120, 560, f, EVF('crash'), '#FF7A6A', 110, 30, -.06);
  sfxPop(ctx, 'BANG', W / 2 + 160, 640, f, EVF('bang'), PAL.chalk, 100, 26, .06);
  sfxPop(ctx, 'CRACK', W / 2 - 60, 740, f, EVF('crack'), PAL.amber, 90, 30, -.04);
  sfxPop(ctx, 'creeeak…', W / 2, 1600, f, EVF('creak'), '#9AA0B0', 56, 140, 0);
};
SHOT.black11 = (ctx, lt, lf, len, t, f) => {                                           // nothing to see. Then: knock knock knock - inside.
  const ts = t / 60; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .18; ctx.translate(W / 2, 1000); ctx.scale(1.6, 1.6); ctx.translate(420, 0); officeOpen(ctx, 1); ctx.restore();          // the faint shape of the open door
  ['k1', 'k2', 'k3'].forEach((k, i) => sfxPop(ctx, 'knock', W / 2 - 300 + i * 300, 860 + i * 100, f, EVF(k), PAL.chalk, 90, 40, -.06 + i * .05));
  vig(ctx, .7);
};
SHOT.end11 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 12', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'LIGHTS OUT', 0, 0, 130, PAL.red, { stroke: 24 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'WHO MOVES FIRST IN THE DARK?', W / 2, 960, 48, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR THEORY', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
