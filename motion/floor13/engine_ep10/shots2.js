// shots2.js - tie, math, exterior descent, end card
'use strict';
const WALLX = -540, WALLT = 30, ROPEX = -600, HANGX = -632, FEETX = -572;
const wordAt = (id, i) => LN(id).words[i].a;
const LN = id => TL.lines.find(l => l.id === id);

// ----------------------------------------------------------------------------------------------- rope helpers
function ropeStroke(ctx, pts, w, cols) {
  for (let i = 0; i < pts.length - 1; i++) { ctx.lineCap = 'round'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = w + 6; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
    ctx.strokeStyle = cols[i % cols.length]; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); }
  for (let i = 1; i < pts.length - 1; i++) { ctx.fillStyle = '#B9B196'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], w * .72, 0, TAU); ctx.fill(); ctx.stroke(); }
}
const ROPE_COLS = [PAL.sheetB, '#5A78B0', '#7A2D4A', PAL.hood, PAL.amber];
function ropeVertical(ctx, x, y0, y1, f, wave = null) {                 // vertical rope hanging outside the wall, optional travelling wave
  const n = Math.max(2, Math.round((y1 - y0) / 80)), pts = [];
  for (let i = 0; i <= n; i++) { const y = lerp(y0, y1, i / n); let dx = 0; if (wave) { const d = y - wave.y; dx = Math.exp(-d * d / (2 * 160 * 160)) * wave.amp * Math.sin((y - wave.y) * .03 - wave.t * .5); } pts.push([x + dx + Math.sin(f * .03 + i * .7) * 1.5, y]); }
  ropeStroke(ctx, pts, 18, ROPE_COLS);
}
// hand-over-hand grip geometry: hands keep a world position while the body descends, then reach up to the next hold
const GRIP = 74, UPMAX = 188, UPMIN = 114;
function gripRel(u) { return u < .78 ? lerp(UPMAX, UPMIN, u / .78) : lerp(UPMIN, UPMAX, E.ioC((u - .78) / .22)); }
function hangPose(hipY, o = {}) {                                         // person origin = (HANGX, hipY + HIP_H); dir = +1 (facing the wall)
  const g = hipY / GRIP, uL = ((g % 1) + 1) % 1, uR = (((g + .5) % 1) + 1) % 1, lx = ROPEX - HANGX, hy = -HIP_H;
  const sway = o.sway || 0, kick = Math.sin(hipY * .09) * 6;
  return { hip: [0, hy], lean: o.lean == null ? -.1 : o.lean, tilt: o.tilt || 0, hands: { L: [lx - 3, hy - gripRel(uL)], R: [lx + 3, hy - gripRel(uR)] },
    feet: { L: [FEETX - HANGX - 8 + kick * .4, -HIP_H + 74 + kick], R: [FEETX - HANGX + 2, -HIP_H + 96 - kick] }, face: o.face || {} };
}

// ----------------------------------------------------------------------------------------------- bedroom for the rope-making montage
SHOT.tie = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf);
  const xKeys = [[0, 60], [4, 60], [26, -122, E.ioQ], [50, -122], [84, 70, E.ioQ], [136, 70], [150, 10, E.ioQ], [176, 10], [196, 70, E.ioQ], [210, 70], [226, 330, E.ioQ], [260, 330], [286, 150, E.ioQ]];
  const x = kf(lf, xKeys), dxv = kf(lf + 1, xKeys) - x, moving = Math.abs(dxv) > .6;
  const dir = lf < 50 ? -1 : lf < 136 ? 1 : lf < 150 ? -1 : lf < 196 ? 1 : lf < 226 ? 1 : lf < 286 ? 1 : -1;
  const hoodie = lf < 192;
  const pulse = (a, b) => Math.exp(-Math.max(0, lf - a) / 7) * (lf >= a && lf < a + 40 ? 1 : 0);
  const zoom = 1.45 + .1 * pulse(60, 0) + .12 * pulse(165, 0) + .1 * pulse(205, 0) + .1 * pulse(272, 0);
  ctx.save(); applyCam(ctx, { x: 40, y: -215, z: zoom, hand: 1.8 }, t, [[142, 10], [286, 8]]);
  adjacentFloors(ctx, f, 13, .55); roomShell(ctx, 13, f, { lx: -80, la: .07 });
  const drop = lf < 148 ? 0 : E.inQ(clamp((lf - 148) / 16));
  windowBack(ctx, 40, 0, f, { w: 300, h: 280, wind: 0, curtainDrop: drop, curtains: drop < .98 });
  lamp(ctx, -110, 0, f); door(ctx, 400, 0, f); bed(ctx, -520, 0, f, { stripped: lf >= 46 });
  // rope on the floor: segments appear after each "ingredient"
  const segs = [[56, 0, 90], [92, 1, 80], [168, 2, 100], [208, 3, 80], [274, 4, 220]];
  const pts = [[-130, -22]]; let ex = -130;
  for (const [a, ci, ln] of segs) { if (lf < a) break; const g = outB((lf - a) / 12, 1.6); ex += ln * g; pts.push([ex, -20]); }
  const taut = sstep(lf, 290, 300);
  if (pts.length > 1) { if (taut > 0) { pts[pts.length - 1][1] = lerp(pts[pts.length - 1][1], -150, taut); pts[pts.length - 1][0] = lerp(pts[pts.length - 1][0], 170, taut); } ropeStroke(ctx, pts, 20, ROPE_COLS); }
  for (const [a] of segs) burst(ctx, pts[Math.min(pts.length - 1, segs.findIndex(s => s[0] === a) + 1)][0], -26, 40, lf, a + 2, PAL.amber, 8);
  // flying cloth
  if (lf >= 30 && lf < 56) { const u = E.ioQ(clamp((lf - 30) / 22)); ctx.save(); ctx.translate(lerp(-300, 20, u), lerp(-110, -160, Math.sin(u * Math.PI) * 1) - 40 * Math.sin(u * Math.PI)); ctx.rotate(u * 5); rr(ctx, -50, -22, 100, 44, 12, '#5A78B0', PAL.ink, 4); ctx.restore(); }
  if (lf >= 188 && lf < 212) { const u = E.ioQ(clamp((lf - 188) / 20)); ctx.save(); ctx.translate(lerp(70, 160, u), lerp(-180, -40, u) - 80 * Math.sin(u * Math.PI)); ctx.rotate(u * 6); rr(ctx, -42, -34, 84, 68, 22, PAL.hood, PAL.ink, 4); ctx.restore(); }
  if (lf >= 150 && lf < 176) { const u = E.ioQ(clamp((lf - 150) / 20)); ctx.save(); ctx.translate(lerp(110, 190, u), lerp(-200, -50, u)); ctx.rotate(u * 3); rr(ctx, -50, -30, 100, 60, 14, '#7A2D4A', PAL.ink, 4); ctx.restore(); }
  // scarf from the door hook: stretches a long way
  if (lf >= 226 && lf < 280) { const s = clamp((lf - 226) / 44); const hx = 410, hy = -190, tx = lerp(330, 190, s), ty = -150; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2, Math.max(hy, ty) + 90 * (1 - s), tx, ty); ctx.stroke();
    ctx.strokeStyle = PAL.amber; ctx.lineWidth = 20; ctx.stroke(); ctx.strokeStyle = '#B57E00'; ctx.lineWidth = 4; ctx.setLineDash([10, 18]); ctx.stroke(); ctx.setLineDash([]); }
  // Dev
  let pose; const face = devFace(f, { brow: .55, wide: false, eyes: 1, mouth: devTalk(f) * .9, look: [dir * .6, .1], sweat: lf > 200 });
  const shiver = !hoodie ? Math.sin(lf * 2.3) * 1.4 : 0;
  if (moving) pose = walkPose(Math.abs(x - 60) / 184, { lean: .12, face });
  else if (lf >= 26 && lf < 50) { const pull = Math.sin(clamp((lf - 26) / 24) * Math.PI); pose = basePose(pf, { lean: .22, face, hands: { L: [lerp(60, 20, pull), -96], R: [lerp(70, 28, pull), -100] } }); }
  else if (lf >= 56 && lf < 136) { const tie = Math.sin(lf * .55) * 8; pose = basePose(pf, { lean: .3, face, hands: { L: [44 + tie, -92 + tie], R: [52 - tie, -90 - tie] } }); }
  else if (lf >= 150 && lf < 176) { const up = E.outBack(clamp((lf - 150) / 12), 1.3); pose = basePose(pf, { lean: -.08 - up * .08, tilt: -.2, face: devFace(f, { brow: .7, wide: true, mouth: devTalk(f), look: [.8, -.8] }), hands: { L: [30 + up * 50, -170 - up * 130], R: [40 + up * 56, -190 - up * 110] } }); }
  else if (lf >= 176 && lf < 196) { const k = sstep(lf, 178, 190); pose = basePose(pf, { lean: .1, face: devFace(f, { brow: .4, eyes: 1, look: [.5, 0], mouth: devTalk(f) }), hands: { L: [lerp(30, 10, k), lerp(-130, -260, k)], R: [lerp(40, 30, k), lerp(-130, -250, k)] } }); }
  else if (lf >= 226 && lf < 286) { const pull = Math.sin(lf * .45); pose = basePose(pf, { lean: .2, face, hands: { L: [50 + pull * 20, -140], R: [60 - pull * 20, -130] } }); }
  else if (lf >= 286) { const lean = -.28 * taut; pose = basePose(pf, { lean, feet: { L: [24, 0], R: [-30, 0] }, face: devFace(f, { brow: .6, wide: false, mouth: devTalk(f) * .8, look: [-.8, 0] }), hands: { L: [lerp(50, -50, taut), lerp(-130, -150, taut)], R: [lerp(60, -44, taut), lerp(-120, -142, taut)] } }); }
  else pose = basePose(pf, { lean: .08, face, hands: { L: [20, -104], R: [26, -100] } });
  pose.hip[0] += shiver;
  person(ctx, DEVH(x, 0, pose, { dir, hoodie }), pf);
  ctx.restore();
  vig(ctx, .5);
  if (lf >= 300) { const u = outB((lf - 300) / 10, 1.5); ctx.save(); ctx.translate(W / 2 + 40, 560); ctx.scale(u, u); marker(ctx, '✔', 0, 0, 220, '#6CFF9A', { stroke: 26 }); ctx.restore(); }
};

// ----------------------------------------------------------------------------------------------- exterior set
const FAR = []; (() => { for (let i = 0; i < 9; i++) FAR.push([-1500 + i * 120 + hash(i * 3) * 40, 600 + hash(i * 7.3) * 1900, 80 + hash(i * 1.1) * 60]); })();
function outside(ctx, f, camY) {
  skyGrad(ctx, -2200, -1600, 4400, 9800);
  for (const [bx, by, bw] of FAR) { ctx.fillStyle = '#0C0F1C'; ctx.fillRect(bx, by, bw, 8000); ctx.fillStyle = 'rgba(255,200,110,.45)'; for (let y = by + 24; y < by + 2400; y += 52) for (let x = bx + 10; x < bx + bw - 14; x += 26) if (hash(bx * .13 + x + y * .7) > .8) ctx.fillRect(x, y, 12, 18); }
  glow(ctx, -900, 2600, 900, 'rgba(255,110,30,A)', .35 + .1 * Math.sin(f * .2));
}
function furnish(ctx, n, f, o = {}) {
  const fy = FLOORY(n);
  if (n === 13) { windowBack(ctx, 40, fy, f, { w: 300, h: 280, curtains: true }); lamp(ctx, -110, fy, f); door(ctx, 400, fy, f); bed(ctx, -520, fy, f, { stripped: true }); }
  if (n === 12) { sofaTV(ctx, -120, fy, f); const chew = Math.sin(f * .5) * .5 + .5;
    const look = o.look12 || 0;
    person(ctx, { x: -150, y: fy + 6, s: .98, dir: 1, kind: 'z', var: 2, seed: 61, holdHand: 1, holdProp: (c, a) => { c.save(); c.translate(a[0] + 8, a[1] - 4); c.rotate(-.3); rr(c, -16, -26, 38, 52, 6, '#E8503A', PAL.ink, 3); c.restore(); },
      pose: { hip: [0, -HIP_H], lean: .05, tilt: .05 + look * -.5, feet: { L: [40, -10], R: [52, -6] }, hands: { L: [30, -80], R: [64, -150 + Math.sin(f * .3) * 6] }, face: { look: [look ? -.9 : .8, 0], mouth: .2 + chew * .6, eyes: .85 } } }, pf5(f)); }
  if (n === 11) { ctx.fillStyle = '#2B2133'; rr(ctx, 90, fy - 130, 200, 100, 10, '#2B2133'); ctx.fillStyle = '#3B2E45'; ctx.fillRect(110, fy - 30, 14, 30); ctx.fillRect(256, fy - 30, 14, 30); }
  if (n === 10) { ctx.fillStyle = '#233040'; ctx.fillRect(-380, fy - 320, 150, 320); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#2E3F55'; ctx.fillRect(-372, fy - 300 + i * 76, 134, 8); } ctx.fillStyle = '#1E2A3A'; ctx.fillRect(160, fy - 190, 90, 190); }
}
function facade(ctx, f, top, bot, o = {}) {
  for (let n = top; n >= bot; n--) { const fy = FLOORY(n); roomShell(ctx, n, f, { la: n === 13 ? .08 : .06 }); furnish(ctx, n, f, o); }
  towerFrame(ctx, top, bot, f);
  const y0 = FLOORY(top) - FH - SLAB, y1 = FLOORY(bot) + SLAB;
  ctx.fillStyle = '#080A12'; ctx.fillRect(WALLX - WALLT, y0, WALLT, y1 - y0);                           // left outer wall strip with window panes
  for (let n = top; n >= bot; n--) { const fy = FLOORY(n); ctx.fillStyle = 'rgba(120,170,230,.16)'; ctx.fillRect(WALLX - WALLT, fy - 340, WALLT, 220); ctx.fillStyle = '#12182A'; ctx.fillRect(WALLX - WALLT - 22, fy - 120, WALLT + 30, 14);
    if (o.crack && o.crack[0] === n) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { const a = hash(i * 2.3) * TAU, r = 40 + hash(i * 5) * 130; ctx.beginPath(); ctx.moveTo(WALLX - WALLT / 2, fy - 230); ctx.lineTo(WALLX - WALLT / 2 + Math.cos(a) * r * .35, fy - 230 + Math.sin(a) * r); ctx.stroke(); } blob(ctx, WALLX - WALLT / 2, fy - 230, 14, 14, 'rgba(255,255,255,.7)'); } }
  for (let n = top; n >= bot; n--) marker(ctx, String(n), -RW - 135, FLOORY(n) - 60, 78, 'rgba(255,255,255,.32)', { stroke: 12 });
}

// ----------------------------------------------------------------------------------------------- MATH
SHOT.math = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf);
  if (lf < 124) {                                                                                // A: rope unrolls to floor 10, floors tick off
    const fall = E.outQ(clamp((lf - 8) / 60)), end = lerp(-110, ROPE_END, fall), bounce = lf > 66 ? Math.exp(-(lf - 66) / 10) * Math.sin((lf - 66) * .8) * 40 : 0;
    const cy = lerp(220, 860, E.ioC(clamp((lf - 20) / 80)));
    ctx.save(); applyCam(ctx, { x: -190, y: cy, z: .62, hand: 1.4 }, t, [[66, 6]]);
    outside(ctx, f, cy); facade(ctx, f, 14, 9, {});
    ropeVertical(ctx, ROPEX, -120, end + bounce, f, lf > 66 ? { y: -120 + (lf - 66) * 60, amp: 14 * Math.exp(-(lf - 66) / 20), t: lf } : null);
    for (const n of [12, 11, 10]) { const passed = end > FLOORY(n) - 180; if (passed) { const age = Math.max(0, lf - (8 + 60 * ((FLOORY(n) - 180 + 110) / (ROPE_END + 110)) ));
        ctx.save(); ctx.translate(-RW - 135, FLOORY(n) - 60); const s = 1 + .25 * Math.exp(-age / 6); ctx.scale(s, s); marker(ctx, String(n), 0, 0, 78, n === 10 ? PAL.amber : '#6CFF9A', { stroke: 12 }); ctx.restore(); } }
    const dev = hash(1); const face = devFace(f, { brow: .2, wide: false, mouth: devTalk(f) * .9, look: [-.9, .6] });
    person(ctx, DEVH(-470, 0, basePose(pf, { lean: -.2, tilt: -.1, hands: { L: [-50, -110], R: [-34, -130] }, face }), { dir: -1 }), pf);
    if (lf > 70) { const k = outB((lf - 70) / 12); ctx.save(); ctx.translate(-800, ROPE_END - 30); ctx.scale(k, k); marker(ctx, '≈ 3', 0, 0, 100, PAL.amber, {}); marker(ctx, 'FLOORS', 0, 80, 70, PAL.amber, {}); ctx.restore(); }
    ctx.restore(); vig(ctx, .5);
  } else {                                                                                        // B: forced calm
    const lf2 = lf - 124, z = lerp(3.0, 3.4, lf2 / 160), twitch = (lf2 % 50) > 42 ? .3 : 1;
    ctx.save(); applyCam(ctx, { x: 60, y: -226, z, hand: 1.6 }, t, [[0, 16], [100, 8]]);
    roomShell(ctx, 13, f, { lx: 0, la: .05 }); windowBack(ctx, -250, 0, f, { w: 300, h: 280, wind: 1 });
    const thumb = sstep(lf2, 12, 24), face = devFace(f, { brow: -.5, wide: false, eyes: twitch, mouth: devTalk(f) * .9, smile: .9, mouthSkew: lf2 > 80 ? 4 : 0, look: [.9, .1], sweat: true });
    const pose = basePose(pf, { lean: .14, tilt: .05 + Math.sin(lf2 * .5) * .01 * (lf2 > 90 ? 1 : 0), hands: { L: [30, -150], R: [lerp(40, 70, thumb), lerp(-150, -178, thumb)] }, face });
    person(ctx, DEVH(0, 0, pose, { holdHand: 1, holdProp: (c, a) => { if (thumb > .3) { c.save(); c.translate(a[0] + 4, a[1] - 16); c.fillStyle = PAL.skin; c.strokeStyle = PAL.ink; c.lineWidth = 3; rr(c, -6, -22, 12, 24, 6, PAL.skin, PAL.ink, 3); c.restore(); } } }), pf);
    ctx.restore();
    if (lf2 > 70) { ctx.save(); ctx.translate(W / 2 + 230, 520); ctx.rotate(.06); const u = outB((lf2 - 70) / 10); ctx.scale(u, u); marker(ctx, '13 − 10 = 3 ✓', 0, 0, 62, '#6CFF9A', {}); ctx.restore(); }
    if (lf2 > 118) { ctx.save(); ctx.translate(W / 2 + 230, 640 + sn(f * .4, 2) * 2); ctx.rotate(-.04); const u = outB((lf2 - 118) / 10); ctx.scale(u, u); marker(ctx, '10 → 1 = ???', 0, 0, 62, PAL.red, {}); ctx.restore(); }
    fadeBottom(ctx); vig(ctx, .55);
  }
};

// ----------------------------------------------------------------------------------------------- EXTERIOR: the descent
const EX0 = () => TL.shots.ext[0];
const ROPE_END = FLOORY(10) - 330;
const KICK = 958;                                            // local frame of the final kick (then the film freezes on the impact)
function extHip(lf) {                                        // world y of Dev's hip over the exterior shot
  return kf(lf, [[22, -40], [36, 30, E.ioQ], [160, 440, E.lin], [200, 520, E.ioC], [232, 615, E.ioC], [300, 860, E.lin], [317, 890, E.lin], [360, 892, E.lin], [400, 1170, E.ioC], [470, 1500, E.ioC], [490, 1500]]);
}
function extFloorAt(f) { const lf = f - EX0(), hy = extHip(lf); return hy < 50 ? 13 : hy < 610 ? 12 : hy < 1170 ? 11 : 10; }
function extFloorChange(f) { const lf = f - EX0(); for (const th of [1170, 610, 50]) { if (extHip(lf) >= th) { let lo = 0; for (let k = lf; k > 0; k--) if (extHip(k) < th) { lo = k; break; } return EX0() + lo; } } return -999; }

SHOT.ext = (ctx, lt, lf0, len, t0, f) => {
  const lf = Math.min(lf0, KICK), t = Math.min(lt, KICK + .0);                                  // everything freezes on the kick
  const pf = pf3(lf);
  const wHim = wordAt('f11', 5) - EX0(), slamAt = wHim + 3;
  const moveAt = wordAt('move', 0) - EX0() - 4, climbAt = wordAt('climb', 0) - EX0();
  const hy = extHip(lf), px0 = lf < 36 ? lerp(-500, HANGX, E.ioQ(clamp((lf - 22) / 14))) : HANGX;
  const swingA = sstep(lf, 876, 952), swing = Math.sin((lf - 876) * .22) * 70 * swingA;           // pendulum, growing
  // camera
  let cx = -190, cy = hy + 140, cz = .72;
  if (lf >= 400) { const down = sstep(lf, 438, 480) * (1 - sstep(lf, 540, 585)); cy = hy + 150 + down * 1300; cz = lerp(.72, .5, down); }
  if (lf >= moveAt + 6) { const up = E.ioC(clamp((lf - (moveAt + 60)) / 56)) * (1 - sstep(lf, climbAt - 6, climbAt)); cy = lerp(hy + 150, 420, up); cz = lerp(.72, .5, up); }
  if (lf >= climbAt + 56) { cy = hy + 150; cz = .72; }
  const zHip = kf(lf, [[moveAt + 16, 20], [climbAt, 330, E.lin], [climbAt + 56, 470, E.lin], [940, 1010, E.inQ], [KICK, 1190, E.lin]]);
  const imp = [[22, 5], [36, 10], [slamAt, 34], [moveAt + 6, 16], [climbAt, 24], [KICK, 60]];
  const crack = lf >= slamAt ? [11] : null;
  const faceNow = () => {
    let face = devFace(f, { brow: -.4, wide: true, eyes: 1, mouth: devTalk(f), look: [.6, .3], sweat: lf > 60 });
    if (lf >= wordAt('f12', 3) - EX0() && lf < wordAt('f12', 3) - EX0() + 40) face.look = [.9, 0];
    if (lf >= slamAt) face = { ...face, wide: true, eyes: 1.35, brow: -1, look: [.9, 0], mouth: lf < slamAt + 28 ? 1 : devTalk(f) };
    if (lf >= 400 && lf < moveAt) face = { ...face, look: [0, .95], wide: false, eyes: .9, brow: -.3, mouth: devTalk(f) * .9 };
    if (lf >= moveAt) face = { ...face, look: [0, -.95], wide: true, eyes: 1.2, brow: -1, mouth: devTalk(f) };
    if (lf >= 880) face = { ...face, look: [.9, .2], brow: .9, wide: false, eyes: .8, mouth: 1, sweat: true };
    return face;
  };
  ctx.save();
  if (lf >= climbAt && lf < climbAt + 56) {                                                       // punch-in on the face: "They can climb?!"
    applyCam(ctx, { x: HANGX + 60, y: hy - 150, z: lerp(3.4, 3.9, (lf - climbAt) / 56), hand: 3 }, t, [[climbAt, 26]]);
    outside(ctx, f, hy); facade(ctx, f, 12, 8, { crack });
    ropeVertical(ctx, ROPEX, hy - 700, ROPE_END + 8, f);
    person(ctx, DEVH(HANGX, hy + HIP_H, hangPose(hy, { face: faceNow(), tilt: -.4 }), {}), pf);
    ctx.restore(); fadeBottom(ctx, 1200, 1500, .9); speedLines(ctx, W / 2, H * .46, f, .45); marker(ctx, '?!', W / 2 + 290, 540, 210 * outB((lf - climbAt) / 8), PAL.red, { rot: .1 }); vig(ctx, .6); return;
  }
  applyCam(ctx, { x: cx, y: cy, z: cz, hand: 1.6 }, t, imp);
  outside(ctx, f, cy);
  facade(ctx, f, 14, lf >= 400 ? 1 : 8, { look12: (lf > 100 && lf < 150) ? 1 : 0, crack });
  // the zombie that slams the glass on floor 11
  const sx = lf < slamAt - 40 ? -380 : lf < slamAt ? lerp(-380, -508, E.inQuint(clamp((lf - (slamAt - 8)) / 8))) : -508;
  const hitZ = lf >= slamAt ? Math.exp(-(lf - slamAt) / 7) : 0;
  zombieAt(ctx, sx - hitZ * 4, FLOORY(11), f, 71, { dir: -1, v: 0, lean: lf >= slamAt - 8 ? .5 : .24, stride: lf < slamAt - 8 ? 16 : 0, lift: 6, hands: { L: [96, -230], R: [84, -250] }, face: { look: [-.9, 0], mouth: lf >= slamAt ? 1 : null } });
  if (lf >= slamAt && lf < slamAt + 14) burst(ctx, WALLX - WALLT / 2, FLOORY(11) - 230, 120, lf, slamAt, PAL.chalk, 12);
  // rope + Dev
  const waveY = lf >= moveAt ? { y: -100 + (lf - moveAt) * 70, amp: 18 * Math.exp(-(lf - moveAt) / 40), t: lf } : (lf >= slamAt ? { y: hy - 300, amp: 12 * Math.exp(-(lf - slamAt) / 14), t: lf } : null);
  ropeVertical(ctx, ROPEX + swing * .12, -120, lf < 36 ? Math.max(-120, hy + 40) : ROPE_END + 8, f, waveY);
  {
    const sway = lf >= slamAt ? Math.exp(-(lf - slamAt) / 24) * Math.sin((lf - slamAt) * .35) * 10 : 0;
    const hang = hangPose(hy, { face: faceNow(), sway, tilt: lf >= moveAt + 8 ? -.5 : (lf >= 400 && lf < moveAt ? .25 : 0) });
    let px = px0 + sway + swing;
    if (lf >= 880) {                                                                                // frantic swing, then the kick
      const k = clamp((lf - 940) / 18); hang.lean = -.1 - .3 * Math.sin(clamp((lf - 920) / 20) * Math.PI) * .0 + (lf > 944 ? .35 * k : 0);
      hang.feet = { L: [FEETX - HANGX + 36 * k + swing * .3, -HIP_H + 74 - 90 * k], R: [FEETX - HANGX + 52 * k + swing * .3, -HIP_H + 96 - 100 * k] };
    }
    if (lf < 36) { const u = clamp((lf - 22) / 14), jump = Math.sin(u * Math.PI) * 36; hang.hands = { L: [ROPEX - px0 - 4, -HIP_H - 150], R: [ROPEX - px0 + 4, -HIP_H - 160] }; hang.lean = lerp(.3, -.1, u); person(ctx, DEVH(px0, hy + HIP_H - jump, hang, {}), pf); }
    else person(ctx, DEVH(px, hy + HIP_H, hang, {}), pf);
  }
  ctx.fillStyle = '#B9B196'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ROPEX, ROPE_END + 14, 16, 0, TAU); ctx.fill(); ctx.stroke();
  // far below: "9 floors to go"
  if (lf >= 438 && lf < 590) { const k = sstep(lf, 438, 480) * (1 - sstep(lf, 540, 585)); ctx.save(); ctx.globalAlpha = k; marker(ctx, '9 FLOORS', -330, FLOORY(10) + 640, 140, PAL.red, { rot: -.05 }); marker(ctx, 'TO GO', -330, FLOORY(10) + 770, 140, PAL.red, { rot: -.05 }); ctx.restore(); }
  // the climber from above, and the queue at the window
  if (lf >= moveAt + 16) {
    const zh = hangPose(zHip, { face: { look: [0, .9], mouth: .9 }, tilt: .3 }); zh.lean = -.2 + Math.sin(lf * .2) * .1;
    person(ctx, { x: HANGX - 4, y: zHip + HIP_H, s: 1, dir: 1, kind: 'z', var: 1, seed: 90, pose: zh }, pf5(lf));
    for (let i = 0; i < 3; i++) zombieAt(ctx, WALLX + 10 - i * 56, 0, f, 80 + i, { dir: -1, v: i + 2, lean: .35, stride: 0, hands: { L: [90, -150], R: [80, -190] }, face: { look: [-.8, .3] } });
  }
  ctx.restore();
  if (lf0 >= KICK - 2) {                                                                          // the kick lands: glass bursts, freeze
    const d = lf0 - (KICK - 2), u = clamp(d / 26);
    ctx.save(); const px = W / 2 - 330, py = H * .46 + (1440 - cy) * cz; ctx.translate(0, 0);
    for (let i = 0; i < 26; i++) { const a = hash(i * 2.3) * TAU, r = (40 + hash(i * 5) * 360) * E.outQ(u); const x = px + Math.cos(a) * r, y = py + Math.sin(a) * r * .8 + u * u * 120 * hash(i); ctx.save(); ctx.translate(x, y); ctx.rotate(a * 3 + u * 4); ctx.globalAlpha = 1 - u * .7; ctx.fillStyle = 'rgba(200,235,255,.9)'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(14, 16); ctx.lineTo(-12, 10); ctx.fill(); ctx.restore(); }
    ctx.restore(); if (d < 4) tint(ctx, '#fff', .8 * (1 - d / 4));
  }
  vig(ctx, .5);
  if (lf >= slamAt && lf < slamAt + 4) tint(ctx, '#fff', .5 * (1 - (lf - slamAt) / 4));
};

// ----------------------------------------------------------------------------------------------- END CARD
SHOT.endcard = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.28)'); g.addColorStop(1, 'rgba(255,59,48,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4);
  ctx.save(); ctx.translate(W / 2, 640); ctx.scale(u, u); marker(ctx, 'PART 2', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 890); ctx.scale(k, k); marker(ctx, 'FLOOR 10', 0, 0, 150, PAL.red, { stroke: 28 }); ctx.restore();
  const l = LN('end'), act = f >= l.t0 ? l.words.findIndex(w => f >= w.a && f < w.b) : -1;
  const txt = ['FOLLOW', 'SO HE', 'DOESN\'T DIE', 'ALONE'], ws = [0, 1, 2, 3];
  ctx.save(); ctx.translate(W / 2, 1150); const p = clamp((lf - 40) / 10); ctx.globalAlpha = p; marker(ctx, 'FOLLOW SO I DON\'T DIE ALONE', 0, 0, 56, PAL.amber, { stroke: 14 }); ctx.restore();
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * W, y = ((hash(i * 7.1) * H + f * (1 + hash(i) * 2)) % H); dot(ctx, x, y, 2 + hash(i * 2) * 3, 'rgba(255,255,255,.18)'); }
  const out = clamp((lf - (len - 8)) / 8); if (out > 0) tint(ctx, '#000', out);
  vig(ctx, .6);
};
