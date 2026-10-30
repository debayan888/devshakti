// eps6.js - Episode 6 "The Van": blackout descent to floor 2; the lobby reveal (Mira is real, in the security booth; the camera has a blind spot
// under the awning where the zombies wait; the idling engine draws them); the speakers distract them; cliffhanger: Patel's clipboard inside.
'use strict';
const T0_6 = 45 * 60 + 25;
const RAY6 = ['q1', 'q2', 'q3', 'q4', 'q5'];
const rayFace6 = (f, o = {}) => ({ look: [.6, 0], brow: .5, mouth: lineTalk(f, RAY6), eyes: .8, smile: -.2, ...o });
function curFloor(f) { const ts = f / 60; return ts < 3.4 ? 5 : ts < 6.4 ? 4 : ts < 9.4 ? 3 : ts < 47.0 ? 2 : 1; }
const CLUES6 = [[14.6, 'MIRA IS REAL (SECURITY BOOTH)'], [17.2, 'CAMERA BLIND SPOT: AWNING'], [23.0, 'ENGINE NOISE DRAWS THEM'], [44.6, 'LOUD SOUND PULLS THEM AWAY'], [49.6, 'CLIPBOARD INSIDE?!']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end6[0]) return; const left = Math.max(0, T0_6 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES6.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- Mira: real, human, in the security booth
function mira(ctx, x, y, f, o = {}) {
  const typing = o.typing ? Math.sin(f * .6) : 0, s = o.s || 1;
  const pose = { hip: [0, -70], lean: o.lean == null ? .12 : o.lean, tilt: o.tilt || 0, feet: { L: [40, -8], R: [52, -4] }, hands: { L: [74 + typing * 6, -122], R: [84 - typing * 6, -120] }, face: { look: o.look || [.9, 0], mouth: o.mouth || 0, brow: o.brow || -.2, eyes: 1, smile: .1 } };
  const r = person(ctx, { x, y, s, dir: o.dir || 1, kind: 'dev', seed: 71, hoodie: false, shirt: '#7A4FB0', pants: '#2B2B3A', pose }, pf3(f));
  const [hx, hy] = r.head, hr = 40 * s; ctx.save(); ctx.translate(hx, hy); ctx.scale(o.dir || 1, 1);
  ctx.fillStyle = '#3A2418'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(0, 0, hr + 3, Math.PI * .95, Math.PI * 2.02); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-hr - 14 * s, 4 * s, 16 * s, 26 * s, .4, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(0, 0, hr + 6 * s, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); line(ctx, hr * .9, 4 * s, hr * .6, 30 * s, 4 * s, '#222'); ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the lobby (seen from the mezzanine window)
const LZ = [[170, 31], [215, 32], [255, 33], [200, 34], [290, 35]];
function lobbyWorld(ctx, f, ts, o = {}) {
  const leaving = o.leaving || 0;
  ctx.fillStyle = '#121725'; ctx.fillRect(-800, -620, 1600, 640);
  for (let x = -800; x < 800; x += 80) for (let r = 0; r < 4; r++) { ctx.fillStyle = (x / 80 + r) % 2 ? '#2A2F3C' : '#232836'; ctx.fillRect(x, r * 30, 80, 30); }   // marble floor
  // outside, seen through the glass doors: night, awning, the van idling
  ctx.save(); ctx.beginPath(); ctx.rect(150, -440, 520, 440); ctx.clip();
  skyGrad(ctx, 150, -440, 520, 440); ctx.fillStyle = '#16181F'; ctx.fillRect(150, -60, 520, 60);
  const vx = 420, vy = -10; rr(ctx, vx, vy - 140, 280, 140, 18, '#E8E6DC', PAL.ink, 4); rr(ctx, vx + 200, vy - 128, 70, 56, 8, '#30364A', PAL.ink, 3); ctx.fillStyle = '#05060A'; ctx.fillRect(vx + 20, vy - 126, 96, 116);
  ctx.fillStyle = PAL.red; ctx.fillRect(vx + 140, vy - 112, 12, 50); ctx.fillRect(vx + 122, vy - 94, 48, 12); blob(ctx, vx + 60, vy, 24, 24, '#111'); blob(ctx, vx + 230, vy, 24, 24, '#111');
  for (let i = 0; i < 4; i++) { const u = ((f * .015 + i * .25) % 1); blob(ctx, vx - 10 - u * 90, vy - 20 - u * 40, 8 + u * 26, 6 + u * 16, 'rgba(180,180,190,.4)', 0, 1 - u); }
  ctx.fillStyle = '#0A0B10'; ctx.fillRect(150, -440, 520, 90); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(150, -350, 170, 350);                  // awning + its deep shadow (left)
  LZ.forEach(([x0, sd], i) => { const go = clamp(leaving * 1.4 - i * .12), x = x0 + go * 520, walking = go > 0 && go < 1;
    const pose = walking ? walkPose(x / 90, { stride: 22, lift: 9, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176], R: [78, -190] }, face: { look: [.7, 0], mouth: .8 } }) : zpose(pf5(f + sd * 4), sd, { stride: 0, lift: 0 });
    ctx.save(); ctx.globalAlpha = .85; person(ctx, { x, y: -6, s: .62, dir: walking ? 1 : (i % 2 ? 1 : -1), kind: 'z', seed: sd, var: sd % 5, pose }, pf5(f + sd * 4)); ctx.restore(); });
  if (!leaving) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(150, -350, 170, 350); for (const [x0] of LZ) { dot(ctx, x0 + 8, -130, 3.5, PAL.red); dot(ctx, x0 + 16, -130, 3, PAL.red); } }
  ctx.restore();
  ctx.strokeStyle = '#9AA0B0'; ctx.lineWidth = 10; ctx.strokeRect(150, -440, 520, 440); line(ctx, 410, -440, 410, 0, 8, '#9AA0B0'); ctx.fillStyle = 'rgba(160,210,255,.08)'; ctx.fillRect(150, -440, 520, 440);
  marker(ctx, 'GARAGE →', 570, -470, 34, '#E8C547', { stroke: 8 });
  // front desk + glass security booth with Mira
  rr(ctx, -650, -300, 330, 300, 10, 'rgba(160,210,255,.10)', 'rgba(220,240,255,.5)', 6);
  for (let i = 0; i < 3; i++) { rr(ctx, -630 + i * 100, -270, 90, 64, 6, '#0A1A2A', '#3A4A5A', 3); ctx.fillStyle = `rgba(110,200,255,${.35 + .1 * hash(Math.floor(f / 6) + i)})`; ctx.fillRect(-624 + i * 100, -264, 78, 52); }
  glow(ctx, -500, -230, 260, 'rgba(110,200,255,A)', .2); rr(ctx, -650, -110, 330, 30, 4, '#3A2B20');
  mira(ctx, -500, -4, f, { s: .72, typing: true, look: [.9, .1], dir: 1 });
  marker(ctx, 'SECURITY', -485, -320, 30, '#9FD8FF', { stroke: 8 });
  // the camera and what it can see
  ctx.save(); ctx.translate(40, -560); rr(ctx, -16, 0, 32, 40, 4, '#3A3F4E'); ctx.rotate(.55); rr(ctx, -10, 30, 90, 38, 12, '#E4E4DE', PAL.ink, 3); dot(ctx, 70, 40, 5, (f % 30) < 18 ? PAL.red : '#500'); ctx.restore();
  if (o.fov) { ctx.save(); ctx.globalAlpha = o.fov; ctx.fillStyle = 'rgba(255,230,120,.16)'; ctx.strokeStyle = 'rgba(255,230,120,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(90, -520); ctx.lineTo(330, 0); ctx.lineTo(680, 0); ctx.lineTo(680, -300); ctx.closePath(); ctx.fill(); ctx.stroke();
    marker(ctx, 'CAMERA SEES THIS', 495, -250, 28, '#FFE58A', { stroke: 8 }); ctx.restore(); }
  if (o.blind) { ctx.save(); ctx.globalAlpha = o.blind; ctx.strokeStyle = PAL.red; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.strokeRect(156, -345, 165, 340); ctx.setLineDash([]); marker(ctx, 'BLIND SPOT', 238, -380, 32, PAL.red, { stroke: 8 }); ctx.restore(); }
  if (leaving > 0) for (let i = 0; i < 4; i++) { const u = ((f * .02 + i * .25) % 1); marker(ctx, '♪', 640 - u * 60, -300 - u * 160 + i * 30, 44, '#FFE58A', { a: 1 - u, stroke: 8 }); }
}
function lobbyInsert(ctx, f, t, keys, o) {
  const ts = t / 60; ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H);
  ctx.save(); applyCam(ctx, { ...CAMKEYS(ts, keys), hand: 1.0 }, t, []); lobbyWorld(ctx, f, ts, o); ctx.restore();
  ctx.strokeStyle = '#0B0E1A'; ctx.lineWidth = 46; ctx.strokeRect(10, 140, W - 20, H - 320);
  ctx.fillStyle = 'rgba(160,200,240,.05)'; ctx.fillRect(0, 0, W, H); vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- staging helpers
function twoShot(ctx, t, f, floorLabel, cam, o = {}) {
  const ts = t / 60; ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, o.imp || []);
  landingSet(ctx, f, floorLabel, { window: o.window }); if (o.window) { glow(ctx, 190, -250, 260, 'rgba(110,200,255,A)', .18); }
  darkness(ctx, .4);
  ray(ctx, o.rx == null ? -60 : o.rx, 0, f, basePose(pf3(f), { lean: .08, face: rayFace6(f, o.rface || {}), hands: { L: [20, -100], R: o.rhand || [60, -160] } }), { dir: o.rdir || 1, aim: o.aim == null ? -.15 : o.aim });
  const face = devFace(f, { wide: !!o.wide, eyes: o.eyes || 1.1, brow: o.brow == null ? -.7 : o.brow, look: o.look || [-.9, 0], mouth: devTalk(f), sweat: !!o.sweat });
  person(ctx, { ...DEVH(o.dx == null ? 200 : o.dx, 0, basePose(pf3(f), { lean: .05, face, hands: { L: [20, -100], R: o.talkR ? [40, -226] : [36, -150] } }), { dir: o.ddir || -1, hoodie: false }), holdHand: 1, holdProp: (c, a) => walkie(c, a[0] + 6, a[1] + 10, f, !!o.walkieOn, -.2) }, pf3(f));
  ctx.restore(); vig(ctx, .5);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.dark = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); if (ts < EVS('click')) return;
  const k = clamp((ts - EVS('click')) / .15), cam = CAMKEYS(ts, [[.5, 0, -250, 2.3, E.ioC], [2.4, 10, -250, 2.1, E.ioC], [3.4, 20, -230, 1.5]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, []); landingSet(ctx, f, '5'); darkness(ctx, .82);
  ray(ctx, -60, 0, f, basePose(pf3(f), { lean: .05, face: rayFace6(f, { look: [.8, -.1] }), hands: { L: [20, -100], R: [52, -200] } }), { dir: 1, aim: -.35 });
  person(ctx, DEVH(110, 0, basePose(pf3(f), { lean: .05, face: devFace(f, { wide: true, eyes: 1.2, brow: -.8, look: [-.9, 0], mouth: 0 }), hands: { L: [20, -100], R: [36, -150] } }), { dir: -1, hoodie: false }), pf3(f));
  ctx.restore(); tint(ctx, '#000', .5 * (1 - k)); vig(ctx, .7);
  sfxPop(ctx, 'CLICK', W / 2 + 150, 560, f, EVF('click'), PAL.chalk, 90, 24, .06);
};
SHOT.desc = (ctx, lt, lf, len, t, f) => {                                          // three quick flights: 4, 3, 2 (feet on every step)
  const ts = t / 60, seg = ts < EVS('segB') ? 0 : ts < EVS('segC') ? 1 : 2, a = [3.4, EVS('segB'), EVS('segC')][seg], b = a + 3.0;
  const [rx, rm] = walkPath(ts, a + .1, b - .2, 330, -470), [dx, dm] = walkPath(ts, a + .35, b, 480, -380);
  const midX = (rx + dx) / 2, cam = { x: midX * .8, y: (stairSurf(rx) + stairSurf(dx)) / 2 - 220, z: 1.15 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, []); serviceStairs(ctx, f, String(4 - seg)); darkness(ctx, .5);
  const rp = rm ? walkPose(rx / 130, { stride: 30, lift: 18, bob: 3, lean: .12, face: rayFace6(f), hands: { L: [20, -100], R: [70, -160] } }) : basePose(pf3(f), { lean: .08, face: rayFace6(f), hands: { L: [20, -100], R: [60, -160] } });
  const ry = onStairs(rp, rx, -1); ray(ctx, rx, ry, f, rp, { dir: -1, aim: .35 });
  const face = devFace(f, { wide: false, eyes: 1, brow: -.5, look: [-.9, .3], mouth: devTalk(f) });
  const dp = dm ? walkPose(dx / 130, { stride: 30, lift: 18, bob: 3, lean: .06, face, hands: { L: [20, -100], R: [36, -150] } }) : basePose(pf3(f), { lean: .05, face, hands: { L: [20, -100], R: [36, -150] } });
  const dy = onStairs(dp, dx, -1); person(ctx, DEVH(dx, dy, dp, { dir: -1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .55);
};
SHOT.lobby = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts < EVS('win_in')) { twoShot(ctx, t, f, '2', { x: 120, y: -260, z: 1.45 }, { window: true, rx: 20, dx: 260, look: [-.6, -.4], rface: { look: [.9, -.3] } }); marker(ctx, 'LOBBY BELOW', W / 2, 560, 54, '#9FD8FF', { stroke: 12, a: sstep(ts, 12.8, 13.1) }); return; }
  const keys = [[13.8, -480, -170, 1.5, E.ioC], [15.6, -480, -170, 1.5, E.ioC], [16.6, 380, -200, 1.3, E.ioC], [20.8, 380, -200, 1.3, E.ioC], [21.8, 0, -230, .78, E.ioC], [24, 0, -230, .8]];
  lobbyInsert(ctx, f, t, keys, { fov: sstep(ts, 16.4, 16.8), blind: sstep(ts, 16.8, 17.2) });
  if (ts > 14.1 && ts < 15.6) marker(ctx, 'MIRA', W / 2 + 40, 520, 70, '#FFD27A', { stroke: 14, s: outB((ts - 14.1) / .25, 1.5) });
  if (ts > 21.2) marker(ctx, 'ENGINE NOISE = DINNER BELL', W / 2, 1560, 46, PAL.red, { stroke: 12, s: outB((ts - 21.2) / .25, 1.5) });
};
function monitorInsert(ctx, f, ts) {                                                 // Mira's CCTV screen: the awning's left side is out of frame
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10);
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 760); ctx.scale(1.6, 1.6); ctx.translate(-480, 230);
  lobbyWorld(ctx, f, ts, {}); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(110, 410, W - 220, 700); ctx.restore();
  for (let y = 410; y < 1110; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(110, y, W - 220, 2); }
  marker(ctx, 'CAM 3 · ENTRANCE', 330, 470, 36, '#6CFF9A', { stroke: 8 }); marker(ctx, 'REC ●', W - 220, 470, 36, PAL.red, { stroke: 8, a: (f % 40) < 26 ? 1 : .2 });
  if (ts > 32.0) marker(ctx, 'NO ZOMBIES IN VIEW', W / 2, 1250, 52, '#FFD27A', { stroke: 12, s: outB((ts - 32.0) / .25, 1.5) });
  vig(ctx, .6);
}
SHOT.radio = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts >= 31.4 && ts < 33.0) { monitorInsert(ctx, f, ts); return; }
  const cam = CAMKEYS(ts, [[24, 140, -260, 1.4, E.ioC], [24.4, 170, -255, 1.65, E.ioC], [27.8, 170, -255, 1.65, E.ioC], [28.4, 140, -260, 1.45, E.ioC], [33.0, 120, -260, 1.5, E.ioC], [35.4, 140, -260, 1.45]]);
  twoShot(ctx, t, f, '2', cam, { window: true, rx: 20, dx: 260, talkR: true, walkieOn: lineTalk(f, ['m1', 'm2']) > .02 || (ts > 24 && ts < 24.4), look: ts < 28 ? [-.3, -.2] : [-.9, 0], wide: ts < 28, rface: { look: [.9, 0] } });
  sfxPop(ctx, 'KSSHH…', W / 2 - 160, 560, f, EVF('crackle'), '#FFD27A', 100, 30, -.06);
};
SHOT.plan = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts >= EVS('lobby2_in')) { lobbyInsert(ctx, f, t, [[42.8, 380, -220, 1.2, E.ioC], [46, 400, -220, 1.15]], { leaving: clamp((ts - 43.0) / 2.6) });
    sfxPop(ctx, '♪ MUSIC ♪', W / 2 + 120, 560, f, EVF('music') + 6, '#FFE58A', 90, 60, .06); if (ts > 45.0) marker(ctx, 'PATH CLEARING', W / 2, 1560, 52, '#B8E986', { stroke: 12, s: outB((ts - 45) / .25, 1.5) }); return; }
  const cam = CAMKEYS(ts, [[35.4, 100, -260, 1.55, E.ioC], [37.8, 140, -260, 1.45, E.ioC], [38.2, 170, -255, 1.65, E.ioC], [42.8, 170, -255, 1.65]]);
  twoShot(ctx, t, f, '2', cam, { window: true, rx: 20, dx: 260, talkR: ts > 38, walkieOn: lineTalk(f, ['m3']) > .02, look: [-.9, 0], rface: { look: [.9, 0] }, rhand: ts < 38 ? [80, -230] : [60, -160], aim: ts < 38 ? -.8 : -.15 });
};
SHOT.cliff = (ctx, lt, lf, len, t, f) => {                                          // floor 1 landing: Patel's clipboard, wet footprints to the LOBBY door
  const ts = t / 60, [rx, rm] = walkPath(ts, 46.0, 47.3, 260, -470), [dx, dm] = walkPath(ts, 46.2, 47.5, 400, -380);
  if (ts < 47.5) {
    const cam = { x: clamp(((rx + dx) / 2) * .8, -60, 60), y: (stairSurf(rx) + stairSurf(dx)) / 2 - 220, z: 1.15 };
    ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, []); serviceStairs(ctx, f, '2'); darkness(ctx, .55);
    const rp = rm ? walkPose(rx / 130, { stride: 30, lift: 18, lean: .12, face: rayFace6(f), hands: { L: [20, -100], R: [70, -160] } }) : basePose(pf3(f), { face: rayFace6(f), hands: { L: [20, -100], R: [60, -160] } });
    const ry = onStairs(rp, rx, -1); ray(ctx, rx, ry, f, rp, { dir: -1, aim: .35 });
    const dp = dm ? walkPose(dx / 130, { stride: 30, lift: 18, face: devFace(f, { look: [-.9, .3] }), hands: { L: [20, -100], R: [36, -150] } }) : basePose(pf3(f), { face: devFace(f, {}), hands: { L: [20, -100], R: [36, -150] } });
    const dy = onStairs(dp, dx, -1); person(ctx, DEVH(dx, dy, dp, { dir: -1, hoodie: false }), pf3(f)); ctx.restore(); vig(ctx, .55); return;
  }
  const push = sstep(ts, EVS('find'), EVS('find') + 1.2), cam = { x: lerp(80, -40, push), y: lerp(-230, -120, push), z: lerp(1.25, 1.8, push) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, [[EVF('find'), 18]]);
  landingSet(ctx, f, '1', { signX: -10 }); ctx.fillStyle = '#3B4048'; ctx.fillRect(330, -280, 150, 280); rr(ctx, 350, -250, 110, 34, 4, '#D8D8D0'); marker(ctx, 'LOBBY', 405, -224, 24, PAL.red, { stroke: .01 });
  for (let i = 0; i < 6; i++) { const x = 215 + i * 24, y = 14 + (i % 2) * 8; blob(ctx, x, y, 16, 7, 'rgba(20,30,40,.8)'); }                                          // wet footprints to the door
  ctx.save(); ctx.translate(120, 4); ctx.rotate(-.2); ctx.scale(2.0, 2.0); rr(ctx, -40, -20, 80, 22, 4, '#C9A06A', PAL.ink, 3); rr(ctx, -32, -16, 64, 14, 2, '#F4F1E6'); ctx.font = `800 9px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = PAL.red; ctx.fillText('RENT DUE', 0, -6); ctx.restore();
  darkness(ctx, .5); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(120, 0, 10, 120, 0, 200); g.addColorStop(0, `rgba(255,240,190,${.5 * sstep(ts, 47.5, 47.7)})`); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(-100, -220, 440, 440); ctx.restore();
  ray(ctx, -200, 0, f, basePose(pf3(f), { lean: .25, face: rayFace6(f, { look: [.9, .6] }), hands: { L: [20, -100], R: [80, -120] } }), { dir: 1, aim: .45 });
  person(ctx, DEVH(-50, 0, basePose(pf3(f), { lean: .15, face: devFace(f, { wide: true, eyes: 1.3, brow: -1, look: [.6, .8], mouth: devTalk(f), sweat: true }), hands: { L: [20, -100], R: [36, -150] } }), { dir: 1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .6);
  if (ts > 48.2) marker(ctx, 'HE FELL 8 FLOORS…', W / 2, 1560, 56, PAL.chalk, { stroke: 12, s: outB((ts - 48.2) / .25, 1.5) });
  if (ts > 50.4) marker(ctx, 'WHO CARRIED IT IN?', W / 2, 1660, 70, PAL.red, { stroke: 14, s: outB((ts - 50.4) / .25, 1.5) });
};
SHOT.end6 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 7', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THE LOBBY', 0, 0, 140, PAL.red, { stroke: 26 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'WHO CARRIED THE CLIPBOARD IN?', W / 2, 960, 48, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR THEORY', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
