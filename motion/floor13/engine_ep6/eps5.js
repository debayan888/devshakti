// eps5.js - Episode 5 "Behind the Door": Ray (night maintenance) is the survivor; he wrote the mirror; generator explains the power;
// Patel was bitten saving Ray; the van never left; Mira watches through the building's cameras.
'use strict';
const T0_5 = 46 * 60 + 8;
function curFloor(f) { const ts = f / 60; return ts < 17.2 ? 7 : ts < 25.6 ? 6 : 5; }
const CLUES5 = [[7.6, 'RAY WROTE THE MIRROR'], [19.0, 'GENERATOR = THE POWER'], [24.0, 'PATEL BITTEN SAVING RAY'], [31.0, 'THE VAN NEVER LEFT'], [41.0, 'MIRA SEES THROUGH CAMERAS']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end5[0]) return; const left = Math.max(0, T0_5 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES5.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -440, -50, 440, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 25px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -416, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -416, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -384, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- Ray: older human, orange work jumpsuit, grey hair + moustache, flashlight
function lineTalk(f, ids) { for (const l of TL.lines) if (ids.includes(l.id) && f >= l.t0 && f < l.t0 + l.n) return Math.min(1, (ENV[l.id][f - l.t0] || 0) * 1.1); return 0; }
const RAY_IDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];
function flashlight(c, a, f, aim = 0, on = 1) {
  c.save(); c.translate(a[0] + 8, a[1]); c.rotate(aim); rr(c, -8, -10, 46, 20, 6, '#2A2A2A', PAL.ink, 3); rr(c, 34, -13, 12, 26, 3, '#555', PAL.ink, 2);
  if (on) { c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(46, 0, 640, 0); g.addColorStop(0, 'rgba(255,240,190,.45)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(46, -10); c.lineTo(640, -150); c.lineTo(640, 150); c.lineTo(46, 10); c.fill(); }
  c.restore();
}
function ray(ctx, x, y, f, pose, o = {}) {
  const dir = o.dir || 1, s = o.s || 1;
  const P = { x, y, s, dir, kind: 'dev', seed: 61, hoodie: false, shirt: '#C8662E', pants: '#7A3E1C', pose, holdHand: 1, holdProp: o.light === false ? null : (c, a) => flashlight(c, a, f, o.aim || 0, 1) };
  const r = person(ctx, P, pf3(f));
  const [hx, hy] = r.head, hr = 40 * s, lean = pose.lean || 0;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(dir, 1); ctx.rotate(lean);
  ctx.fillStyle = '#B9B9B4'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, hr + 4, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill(); ctx.stroke();       // grey hair
  ctx.fillStyle = '#9A9A94'; ctx.beginPath(); ctx.ellipse(hr * .46, hr * .36, 15 * s, 6 * s, 0, 0, TAU); ctx.fill();                                                                    // moustache
  ctx.restore();
  return r;
}
const rayFace = (f, o = {}) => ({ look: [.6, 0], brow: .5, mouth: lineTalk(f, RAY_IDS), eyes: .8, smile: -.2, ...o });
// ----------------------------------------------------------------------------------------------- service stairwell (dark, lit by the flashlight)
function serviceStairs(ctx, f, floorLabel) {
  stairwell(ctx, f);
  ctx.fillStyle = '#E8C547'; ctx.fillRect(-540, -330, 1080, 14);                                                                    // yellow safety stripe
  rr(ctx, 160, -250, 150, 80, 8, '#1C2A1C', 'rgba(255,255,255,.3)', 3); marker(ctx, floorLabel, 235, -195, 56, PAL.chalk, { stroke: .01 });
  rr(ctx, -500, 220, 160, 70, 8, '#1C2A1C', 'rgba(255,255,255,.3)', 3); marker(ctx, 'SERVICE', -420, 268, 34, '#E8C547', { stroke: .01 });
}
function darkness(ctx, a = .62) { ctx.fillStyle = `rgba(2,3,8,${a})`; ctx.fillRect(-3000, -3000, 6000, 6000); }
function generator(ctx, x, y, f) {
  const sh = Math.sin(f * 1.7) * 1.5; ctx.save(); ctx.translate(x + sh, y);
  rr(ctx, -150, -150, 300, 150, 14, '#3C5A3C', PAL.ink, 5); rr(ctx, -130, -130, 120, 70, 8, '#2A3A2A'); for (let i = 0; i < 5; i++) line(ctx, 20 + i * 22, -130, 20 + i * 22, -40, 6, '#2A3A2A');
  rr(ctx, 60, -190, 40, 44, 6, '#333', PAL.ink, 3); dot(ctx, -100, -100, 8, (f % 30) < 15 ? '#6CFF9A' : '#1A4A2A'); ctx.restore();
  for (let i = 0; i < 4; i++) { const u = ((f * .02 + i * .25) % 1); blob(ctx, x + 80 + u * 30, y - 200 - u * 160, 14 + u * 40, 12 + u * 30, 'rgba(160,160,160,.35)', 0, 1 - u); }
  line(ctx, x - 150, y - 40, x - 420, y - 40, 8, '#111'); line(ctx, x - 420, y - 40, x - 420, y - 500, 8, '#111');
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.open = (ctx, lt, lf, len, t, f) => {                                                // the door opens: a flashlight, an old man, "Shh. Inside. Now."
  const ts = t / 60, open = E.outQ(clamp((ts - EVS('door')) / .5)) * (1 - E.inQ(clamp((ts - EVS('shut')) / .25)));
  const cam = CAMKEYS(ts, [[0, -420, -240, 1.6, E.ioC], [1.0, -470, -240, 1.9, E.ioC], [3.0, -470, -240, 1.9, E.ioC], [4.2, -420, -240, 1.5]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, [[EVF('pull'), 16], [EVF('shut'), 24]]);
  gymSet(ctx, f, { doorOpen: 0, bagOpen: true });
  const pulled = ts >= EVS('pull'), dx = pulled ? lerp(-300, -470, E.inQ(clamp((ts - EVS('pull')) / .5))) : -300;
  if (open > 0) { ctx.fillStyle = '#0A0A0A'; ctx.fillRect(-535, -280, 130 * open, 280); }
  if (ts < EVS('shut') + .05) { const face = devFace(f, { wide: true, eyes: ts < 1 ? 1.4 : .5, brow: -1, look: [-.9, 0], mouth: ts > .5 && ts < 1 ? .9 : 0, sweat: true });
    person(ctx, { ...DEVH(dx, 0, basePose(pf3(f), { lean: pulled ? -.35 : .05, hands: { L: pulled ? [-60, -150] : [20, -100], R: [-30, -226] }, face }), { dir: -1, hoodie: false }) }, pf3(f)); }
  staffDoor(ctx, f, open, 0);
  if (open > .3) { if (ts < EVS('shut')) ray(ctx, -440, 0, f, basePose(pf3(f), { lean: .1, hands: { L: [40, -110], R: pulled ? [100, -150] : [60, -160] }, face: rayFace(f) }), { dir: 1, aim: -.1 }); }
  ctx.restore(); vig(ctx, .55);
  if (ts > .5 && ts < 1.2) tint(ctx, '#FFF4D0', .35 * (1 - (ts - .5) / .7));
  sfxPop(ctx, 'SLAM', W / 2 - 160, 620, f, EVF('shut'), PAL.chalk, 110, 30, -.06);
};
// ---- stair surface: every foot stands on the step under it (no floating)
const DY = 300 / 11;
function stairSurf(x) { if (x >= 100) return 0; if (x < -340) return 300; return DY * Math.min(10, Math.floor((100 - x) / 40)); }
function onStairs(pose, x, dir) {                                             // re-seat the feet on the steps; returns the person's ground y
  const fl = x + pose.feet.L[0] * dir, fr = x + pose.feet.R[0] * dir, sl = stairSurf(fl), sr = stairSurf(fr), base = (sl + sr) / 2;
  pose.feet = { L: [pose.feet.L[0], pose.feet.L[1] + sl - base], R: [pose.feet.R[0], pose.feet.R[1] + sr - base] }; return base;
}
function walkPath(ts, a, b, x0, x1) { const u = clamp((ts - a) / (b - a)); return [lerp(x0, x1, u), u > 0 && u < 1]; }
SHOT.stairs = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, cam = CAMKEYS(ts, [[5, 300, -200, 1.35, E.ioC], [11.8, 260, -200, 1.3, E.ioC], [14.4, -40, 60, 1.15, E.ioC], [17.2, -300, 150, 1.2]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, []);
  serviceStairs(ctx, f, '7'); darkness(ctx, .5);
  const [rx, rm] = walkPath(ts, 12.0, 16.8, 330, -470), [dx, dm] = walkPath(ts, 12.4, 17.2, 480, -380);
  const rp = rm ? walkPose(rx / 120, { stride: 26, lift: 16, bob: 3, lean: .12, face: rayFace(f), hands: { L: [20, -100], R: [70, -160] } }) : basePose(pf3(f), { lean: .08, face: rayFace(f, { look: [ts < 12 ? .9 : -.9, 0] }), hands: { L: [20, -100], R: [60, -160] } });
  const rdir = ts >= 12.0 ? -1 : 1, ry = onStairs(rp, rx, rdir);
  ray(ctx, rx, ry, f, rp, { dir: rdir, aim: rm ? .35 : -.1 });
  const face = devFace(f, { wide: true, eyes: 1.1, brow: ts > 11.4 ? -1 : -.4, look: [-.9, ts > 12.4 ? .4 : 0], mouth: devTalk(f), sweat: true });
  const dp = dm ? walkPose(dx / 120, { stride: 26, lift: 16, bob: 3, lean: .06, face, hands: { L: [20, -100], R: [36, -150] } }) : basePose(pf3(f), { lean: .05, face, hands: { L: [20, -100], R: [36, -150] } });
  const dy = onStairs(dp, dx, -1);
  person(ctx, DEVH(dx, dy, dp, { dir: -1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .55);
  if (ts > 7.6 && ts < 10.5) { const k = outB((ts - 7.6) / .25, 1.5); ctx.save(); ctx.translate(W / 2, 600); ctx.scale(k, k); marker(ctx, "HE WROTE \"DON'T TRUST THE LOBBY\"", 0, 0, 40, '#FF9A5C', { stroke: 10 }); ctx.restore(); }
};
// ---- a flat stair landing (solid floor under everyone) with the next flight going down on the left
function landingSet(ctx, f, label, o = {}) {
  const g = ctx.createLinearGradient(0, -560, 0, 300); g.addColorStop(0, '#232836'); g.addColorStop(1, '#10131C'); ctx.fillStyle = g; ctx.fillRect(-RW - 40, -620, 2 * RW + 80, 1100);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let y = -560; y < 300; y += 90) ctx.fillRect(-RW, y, 2 * RW, 3);
  ctx.fillStyle = '#E8C547'; ctx.fillRect(-540, -560, 1080, 14);
  if (o.window) windowBack(ctx, 60, 0, f, { w: 260, h: 260, curtains: false });
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#4A5163' : '#424959'; ctx.fillRect(-300 - 40 * (i + 1), DY * (i + 1) - 6, 42, 16); }       // steps going down, left
  ctx.fillStyle = '#161A24'; ctx.beginPath(); ctx.moveTo(-300, 10); ctx.lineTo(-620, 10 + DY * 8); ctx.lineTo(-620, 400); ctx.lineTo(-300, 400); ctx.fill();
  line(ctx, -300, -120, -620, -120 + DY * 8, 8, '#6A7288');
  ctx.fillStyle = '#4A5163'; ctx.fillRect(-300, 0, 840, 22); ctx.fillStyle = '#2A2F3C'; ctx.fillRect(-300, 22, 840, 300); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-300, 0, 840, 3);
  line(ctx, -300, -120, -300, 0, 6, '#59627A'); line(ctx, -300, -120, -220, -120, 8, '#6A7288');
  const sx = o.signX ?? 170; rr(ctx, sx, -330, 150, 80, 8, '#1C2A1C', 'rgba(255,255,255,.3)', 3); marker(ctx, label, sx + 75, -275, 56, PAL.chalk, { stroke: .01 });
}
SHOT.gen = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, cam = CAMKEYS(ts, [[17.2, 60, -220, 1.15, E.ioC], [19.6, 0, -230, 1.3, E.ioC], [25.6, 40, -230, 1.25]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, []);
  landingSet(ctx, f, '6'); generator(ctx, 360, 0, f);
  const lightOn = .35 + .05 * Math.sin(f * .3); darkness(ctx, lightOn); ctx.fillStyle = `rgba(255,220,140,${.1 + .03 * Math.sin(f * 1.3)})`; ctx.beginPath(); ctx.arc(60, -470, 22, 0, TAU); ctx.fill(); glow(ctx, 60, -470, 420, 'rgba(255,220,140,A)', .25);
  const remember = ts > 20.6; ray(ctx, -120, 0, f, basePose(pf3(f), { lean: remember ? .2 : .08, tilt: remember ? .15 : 0, face: rayFace(f, { look: [remember ? .3 : .9, remember ? .5 : 0], eyes: remember ? .6 : .8 }), hands: { L: [20, -100], R: [60, -160] } }), { dir: 1, aim: .2 });
  person(ctx, DEVH(110, 0, basePose(pf3(f), { lean: .05, face: devFace(f, { wide: ts > 22.6, eyes: 1.1, brow: -.6, look: [-.9, 0], mouth: devTalk(f) }), hands: { L: [20, -100], R: [36, -150] } }), { dir: -1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .5);
  if (ts > 22.4 && ts < 25.4) { ctx.save(); ctx.globalAlpha = sstep(ts, 22.4, 22.8); rr(ctx, 120, 520, 840, 300, 26, 'rgba(8,10,18,.9)', 'rgba(255,255,255,.2)', 3);              // memory card: Patel, still human, locking the gym
    person(ctx, { x: 330, y: 790, s: .9, dir: 1, kind: 'dev', seed: 81, hoodie: false, shirt: '#2E3342', pose: basePose(pf3(f), { lean: .25, hands: { L: [80, -120], R: [86, -140] }, face: { look: [.9, 0], brow: -.8, mouth: .3 } }) }, pf3(f));
    ctx.fillStyle = 'rgba(150,200,240,.2)'; ctx.fillRect(470, 560, 200, 240); line(ctx, 470, 700, 670, 700, 6, '#9AA0B0'); marker(ctx, 'B. PATEL', 820, 640, 46, '#B8E986', { stroke: 10 }); marker(ctx, 'LOCKED THEM IN.', 820, 700, 34, PAL.chalk, { stroke: 8 }); marker(ctx, 'THEN GOT BITTEN.', 820, 750, 34, PAL.red, { stroke: 8 }); ctx.restore(); }
  sfxPop(ctx, 'CHUGGA CHUGGA', W / 2 + 120, 560, f, EVF('gen_on'), PAL.chalk, 80, 60, .05);
};
function vanInsert(ctx, f, ts) {                                                          // through the stairwell window: the van, doors open, engine running, nobody
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H);
  const z = 1 + (ts - EVS('van_in')) * .06; ctx.save(); ctx.translate(W / 2, 980); ctx.scale(z, z); ctx.translate(-W / 2, -980);
  skyGrad(ctx, 0, 0, W, 900); ctx.fillStyle = '#0D101A'; for (let i = 0; i < 9; i++) ctx.fillRect(i * 130 - 20, 600 - hash(i) * 260, 120, 600);
  ctx.fillStyle = '#16181F'; ctx.fillRect(0, 900, W, 900); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 8; ctx.setLineDash([60, 50]); ctx.beginPath(); ctx.moveTo(0, 1240); ctx.lineTo(W, 1240); ctx.stroke(); ctx.setLineDash([]);
  const vx = W / 2 - 220, vy = 1080; rr(ctx, vx, vy - 200, 440, 200, 26, '#E8E6DC', PAL.ink, 6); rr(ctx, vx + 330, vy - 180, 100, 80, 10, '#30364A', PAL.ink, 4);
  ctx.fillStyle = '#05060A'; ctx.fillRect(vx + 30, vy - 180, 150, 170); ctx.fillStyle = PAL.red; ctx.fillRect(vx + 220, vy - 160, 18, 70); ctx.fillRect(vx + 194, vy - 134, 70, 18);
  blob(ctx, vx + 90, vy, 36, 36, '#111'); blob(ctx, vx + 350, vy, 36, 36, '#111'); dot(ctx, vx + 6, vy - 60, 12, PAL.red); glow(ctx, vx, vy - 60, 160, 'rgba(255,40,30,A)', .4);
  for (let i = 0; i < 5; i++) { const u = ((f * .015 + i * .2) % 1); blob(ctx, vx - 20 - u * 160, vy - 30 - u * 60, 14 + u * 40, 10 + u * 26, 'rgba(180,180,190,.4)', 0, 1 - u); }
  ctx.restore();
  ctx.strokeStyle = '#0B0E1A'; ctx.lineWidth = 40; ctx.strokeRect(20, 160, W - 40, H - 360); line(ctx, W / 2, 160, W / 2, H - 200, 24, '#0B0E1A');
  for (let i = 0; i < 14; i++) dot(ctx, 140 + hash(i) * 800, 300 + hash(i * 5) * 900, 3, 'rgba(255,255,255,.3)');
  if (ts > 30.2) { const k = outB((ts - 30.2) / .25, 1.5); ctx.save(); ctx.translate(W / 2, 1560); ctx.scale(k, k); marker(ctx, 'ENGINE RUNNING · NOBODY INSIDE', 0, 0, 44, PAL.red, { stroke: 12 }); ctx.restore(); }
  vig(ctx, .6);
}
SHOT.van = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60; if (ts >= EVS('van_in') && ts < EVS('van_out')) { vanInsert(ctx, f, ts); return; }
  const cam = CAMKEYS(ts, [[25.6, -100, -230, 1.3, E.ioC], [26.4, 0, -280, 1.6, E.ioC], [32.8, -60, -240, 1.4, E.ioC], [33.6, -60, -240, 1.35]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.4 }, t, []);
  landingSet(ctx, f, '5', { window: true }); darkness(ctx, .42);
  ray(ctx, -100, 0, f, basePose(pf3(f), { lean: .1, face: rayFace(f, { look: [.9, -.2] }), hands: { L: [20, -100], R: [60, -160] } }), { dir: 1, aim: -.4 });
  person(ctx, DEVH(220, 0, basePose(pf3(f), { lean: .1, face: devFace(f, { wide: true, eyes: 1.1, brow: -.8, look: [-.6, .5], mouth: devTalk(f) }), hands: { L: [20, -100], R: [36, -150] } }), { dir: -1, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .5);
};
function camInsert(ctx, f, ts) {                                                         // the security camera turns to follow them
  ctx.fillStyle = '#0A0C12'; ctx.fillRect(0, 0, W, H); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#20242E'); g.addColorStop(1, '#0A0C12'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pan = lerp(-.5, .35, E.ioC(clamp((ts - EVS('cam_in') - .3) / 1.2)));
  ctx.save(); ctx.translate(W / 2 + 160, 520); rr(ctx, -40, -260, 80, 200, 10, '#3A3F4E', PAL.ink, 5); ctx.translate(0, -60); ctx.rotate(pan);
  rr(ctx, -260, -60, 320, 140, 30, '#E4E4DE', PAL.ink, 6); blob(ctx, -250, 10, 60, 60, '#14161D'); blob(ctx, -250, 10, 30, 30, '#2A3550'); blob(ctx, -258, 0, 10, 10, 'rgba(255,255,255,.6)');
  dot(ctx, 20, -20, 12, (f % 30) < 18 ? PAL.red : '#500'); glow(ctx, 20, -20, 90, 'rgba(255,40,30,A)', (f % 30) < 18 ? .4 : .1); ctx.restore();
  marker(ctx, 'REC ●', 180, 300, 50, PAL.red, { stroke: 10, a: (f % 40) < 26 ? 1 : .2 });
  if (ts > EVS('cam_in') + .5) { const k = outB((ts - EVS('cam_in') - .5) / .25, 1.5); ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(k, k); marker(ctx, 'IT TURNED TO FOLLOW US', 0, 0, 56, '#FFD27A', { stroke: 12 }); ctx.restore(); }
  vig(ctx, .6);
}
SHOT.cam = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts >= EVS('cam_in') && ts < EVS('cam_out')) { camInsert(ctx, f, ts); return; }
  if (ts >= EVS('dark')) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 300; i++) dot(ctx, hash(i + f * 7) * W, hash(i * 3 + f * 11) * H, 2, `rgba(255,255,255,${.12 + hash(i + f) * .2})`);
    if (ts >= EVS('freeze')) marker(ctx, 'SIGNAL LOST', W / 2, 800, 100, PAL.red, { stroke: 20, s: outB((ts - EVS('freeze')) / .2, 1.5) }); return; }
  const yank = ts >= EVS('yank') - .4;
  const cam = CAMKEYS(ts, [[33.6, -60, -240, 1.35, E.ioC], [35.8, 120, -250, 1.7, E.ioC], [36.8, 120, -250, 1.7, E.ioC], [39.0, -20, -300, 1.3, E.ioC], [41.8, 60, -330, 1.5]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, [[EVF('yank'), 30]]);
  landingSet(ctx, f, '5', { window: true });
  ctx.save(); ctx.translate(380, -470); rr(ctx, -20, 0, 40, 60, 6, '#3A3F4E'); ctx.rotate(.35); rr(ctx, -110, 50, 140, 60, 20, '#E4E4DE', PAL.ink, 4); dot(ctx, 10, 70, 7, (f % 30) < 18 && !yank ? PAL.red : '#500'); ctx.restore();
  line(ctx, 380, -410, yank ? lerp(380, 250, clamp((ts - EVS('yank') + .4) / .4)) : 400, yank ? -250 : -300, 6, '#111');
  darkness(ctx, .42);
  ray(ctx, -100, 0, f, basePose(pf3(f), { lean: yank ? -.2 : .1, face: rayFace(f, { look: [.9, -.6] }), hands: { L: [20, -100], R: yank ? [80, -280] : (ts > 39.2 ? [90, -230] : [60, -160]) } }), { dir: 1, aim: ts > 39.2 ? -.9 : -.2 });
  person(ctx, DEVH(220, 0, basePose(pf3(f), { lean: .05, face: devFace(f, { wide: true, eyes: 1.3, brow: -1, look: ts > 39.2 ? [.4, -.9] : [-.9, 0], mouth: devTalk(f), sweat: true }), hands: { L: [20, -100], R: [40, -226] } }), { dir: -1, hoodie: false, holdHand: 1, holdProp: (c, a) => walkie(c, a[0] + 6, a[1] + 10, f, ts < 35.6, -.2) }), pf3(f));
  ctx.restore(); vig(ctx, .55);
  sfxPop(ctx, 'KSSHH…', W / 2 - 160, 560, f, EVF('crackle'), '#FFD27A', 100, 34, -.06);
  sfxPop(ctx, 'RIP!', W / 2 + 150, 560, f, EVF('yank'), PAL.red, 130, 20, .06);
};
SHOT.end5 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 6', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THE VAN', 0, 0, 140, PAL.red, { stroke: 26 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p;
  rr(ctx, 120, 900, 380, 150, 26, 'rgba(255,154,92,.18)', '#FF9A5C', 4); marker(ctx, 'TRUST RAY', 310, 995, 54, '#FF9A5C', { stroke: 12 });
  rr(ctx, 580, 900, 380, 150, 26, 'rgba(255,210,122,.18)', '#FFD27A', 4); marker(ctx, 'TRUST MIRA', 770, 995, 54, '#FFD27A', { stroke: 12 });
  marker(ctx, 'COMMENT YOUR PICK', W / 2, 1130, 44, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
