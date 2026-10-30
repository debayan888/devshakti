// shots1.js - opening: wake, city, stuck, elevator, stairs, vertigo
'use strict';
const DEVH = (x, y, pose, o = {}) => ({ x, y, s: 1, dir: 1, kind: 'dev', seed: 3, pose, ...o });
const pf3 = f => Math.floor(f / 3) * 3;                     // Dev animates on threes (20 fps drawings), zombies on fives (12 fps)
const pf5 = f => Math.floor(f / 5) * 5;
function devFace(f, o = {}) { return { look: [.5, 0], brow: -.6, mouth: devTalk(f) * .95, wide: true, ...o }; }
const devTalk = f => Math.min(1, talk(f) * 1.05);

function zpose(pf, seed, o = {}) {
  const ph = pf * 0.0155 + seed * .37, sw = Math.sin(ph * TAU), lean = o.lean == null ? .24 : o.lean;
  return walkPose(ph, { stride: o.stride == null ? 20 : o.stride, lift: o.lift == null ? 7 : o.lift, bob: 3, lean, tilt: .35 + .25 * Math.sin(ph * TAU * .5 + seed),
    hands: o.hands || { L: [88 + sw * 6, -172 + sw * 12], R: [74 - sw * 6, -188 - sw * 12] }, face: o.face || { look: [.6, 0] } });
}
function zombieAt(ctx, x, y, f, seed, o = {}) {
  const pf = pf5(f + seed * 4), v = o.v == null ? seed % 5 : o.v;
  return person(ctx, { x, y, s: o.s || 1, dir: o.dir || 1, kind: 'z', seed, var: v, pose: o.pose || zpose(pf, seed, o) }, pf);
}
function adjacentFloors(ctx, f, cur = 13, dim = .5) {            // neighbouring apartments, dimmed, with shuffling zombies
  for (const n of [cur + 1, cur - 1, cur - 2]) {
    ctx.save(); roomShell(ctx, n, f, { la: .05 });
    if (n < cur) { for (let i = 0; i < 2; i++) { const zx = -300 + i * 380 + Math.sin(f * .012 + n + i * 2) * 110; zombieAt(ctx, zx, FLOORY(n), f, n * 3 + i, { dir: Math.cos(f * .012 + n + i * 2) > 0 ? 1 : -1 }); } }
    ctx.fillStyle = `rgba(6,8,16,${dim})`; ctx.fillRect(-RW, FLOORY(n) - FH, 2 * RW, FH + SLAB); ctx.restore();
  }
}

// ----------------------------------------------------------------------------------------------- WAKE
SHOT.wake = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf);
  ctx.save(); applyCam(ctx, { x: -230, y: -190, z: lerp(1.75, 1.9, lt / len), hand: 2 }, t, [[9, 22]]);
  adjacentFloors(ctx, f, 13, .55);
  roomShell(ctx, 13, f, { lx: -300, la: .07 });
  windowBack(ctx, 40, 0, f, { w: 300, h: 280, wind: 0 }); lamp(ctx, -80, 0, f); door(ctx, 400, 0, f); bed(ctx, -500, 0, f);
  const up = E.outBack(clamp((pf - 14) / 16), 1.7), pre = sstep(pf, 8, 14);
  const lean = lerp(-1.5, -1.62, pre) + (pf >= 14 ? (0.18 - -1.62) * up : 0);
  const hipY = lerp(-140, -127, up);
  const awake = pf >= 10;
  const face = awake ? devFace(f, { mouth: pf < 27 ? .95 : devTalk(f), brow: -1, sweat: pf > 30, look: [.8, -.2] }) : { eyes: .06, mouth: .25 + .25 * Math.sin(lf * .1), brow: 0, smile: .1, look: [0, 0] };
  const legsOut = pf > 18 ? 1 : 0;
  const pose = { hip: [0, -104], lean, tilt: awake ? .1 : 0, feet: { L: [lerp(100, 92, legsOut), -104 + (hipY + 140)], R: [lerp(108, 98, legsOut), -106 + (hipY + 140)] }, hands: pf < 14 ? { L: [30, -120], R: [20, -116] } : null, face };
  if (pose.hands === null) { const k = clamp((pf - 14) / 12); pose.hands = { L: [lerp(30, 76, k), lerp(-120, -150, k)], R: [lerp(20, 60, k), lerp(-116, -120, k)] }; }
  person(ctx, DEVH(-292, hipY + 104, pose, { hoodie: true }), pf);
  if (lf < 12) for (let i = 0; i < 3; i++) { const u = (lf * .02 + i * .33) % 1; marker(ctx, 'Z', -360 + u * 70 + i * 28, -250 - u * 150 - i * 20, 46 - i * 8, PAL.chalk, { a: 1 - u }); }
  burst(ctx, -380, -260, 90, lf, 14, PAL.chalk, 12);
  if (lf >= 14 && lf < 40) marker(ctx, '!', -330, -330 - Math.sin(clamp((lf - 14) / 8) * Math.PI) * 14, 110 * outB((lf - 14) / 8), PAL.amber, { rot: .12 });
  ctx.restore(); vig(ctx, .6);
  const fl = lf >= 8 && lf < 14 ? .5 * (1 - (lf - 8) / 6) : 0; if (fl) tint(ctx, '#ffffff', fl);                              // scream flash
};

// ----------------------------------------------------------------------------------------------- CITY (looking out the window)
const _crowd = []; (() => { for (let i = 0; i < 260; i++) _crowd.push([hash(i * 1.7), hash(i * 3.1 + 5), hash(i * 5.3 + 2)]); })();
SHOT.city = (ctx, lt, lf, len, t, f) => {
  const k = lt / len, z = lerp(1.0, 1.16, E.ioQ(k));
  ctx.save(); ctx.translate(W / 2 + sn(t * .04, 8) * 3, 930 + sn(t * .05, 9) * 3); ctx.scale(z, z); ctx.translate(-W / 2, -930);
  skyGrad(ctx, 0, 0, W, 1250);
  ctx.fillStyle = 'rgba(255,230,170,.9)'; ctx.beginPath(); ctx.arc(840, 330, 54, 0, TAU); ctx.fill(); glow(ctx, 840, 330, 300, 'rgba(255,230,170,A)', .25);
  for (let L = 0; L < 3; L++) {                                                                  // skyline layers
    const base = 1160 - L * 40, col = ['#0F1222', '#161A30', '#1F1F3A'][L];
    for (let i = 0; i < 14; i++) { const bw = 90 + hash(i * 3.3 + L) * 70, bx = i * 86 - 40 + L * 31, bh = 230 + hash(i * 1.9 + L * 7) * (420 - L * 80);
      ctx.fillStyle = col; ctx.fillRect(bx, base - bh, bw, bh);
      if (L === 2) { ctx.fillStyle = 'rgba(255,200,110,.5)'; for (let wy = 0; wy < bh - 30; wy += 46) for (let wx = 10; wx < bw - 14; wx += 26) if (hash(i * 31 + wx + wy * .7) > .78) ctx.fillRect(bx + wx, base - bh + 18 + wy, 12, 18); } }
  }
  for (const [fx, fb] of [[210, 1], [660, 1.3], [930, .8]]) { const fl = .6 + .3 * Math.sin(f * .23 + fx) + .1 * hash(Math.floor(f / 3) + fx); glow(ctx, fx, 860, 260 * fb, 'rgba(255,110,30,A)', fl); ctx.fillStyle = 'rgba(25,20,30,.7)'; for (let s = 0; s < 6; s++) { const u = ((f * .01 + s * .17) % 1); ctx.beginPath(); ctx.ellipse(fx + Math.sin(u * 5 + s) * 30, 840 - u * 520, 26 + u * 70, 18 + u * 50, 0, 0, TAU); ctx.globalAlpha = .35 * (1 - u); ctx.fill(); ctx.globalAlpha = 1; } }
  ctx.fillStyle = '#0B0D18'; ctx.fillRect(0, 1160, W, 700);                                      // street seen from above
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 6; ctx.setLineDash([46, 40]); ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(W, 1500); ctx.stroke(); ctx.setLineDash([]);
  const b6 = Math.floor(f / 6);
  for (const [a, b, c] of _crowd) {                                                                // swarm of tiny zombies
    const x = ((a * 1300 + lf * (.6 + c * .8) * (b > .5 ? 1 : -1) * .5) % 1200 + 1200) % 1200 - 60, y = 1190 + b * 520, s = .22 + b * .3, jx = jit(a * 99, b6, 1.5);
    miniZombieTop(ctx, x + jx, y, s, c);
  }
  ctx.restore();
  // window frame + Dev's hands on the sill
  ctx.fillStyle = '#05060C'; ctx.fillRect(0, 0, W, 120); ctx.fillRect(0, 0, 54, H); ctx.fillRect(W - 54, 0, 54, H); ctx.fillRect(0, 1560, W, 400);
  ctx.fillStyle = '#12162A'; ctx.fillRect(0, 1544, W, 22);
  const tr = Math.sin(f * 1.3) * 1.5;
  for (const hx of [420, 660]) { blob(ctx, hx + tr, 1546, 46, 30, PAL.chalk); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(hx + tr, 1546, 46, 30, 0, 0, TAU); ctx.stroke(); for (let i = -2; i <= 2; i++) line(ctx, hx + tr + i * 14, 1530, hx + tr + i * 14, 1556, 3, PAL.ink, .5); }
  vig(ctx, .65);
};
function miniZombieTop(ctx, x, y, s, c) { ctx.save(); ctx.translate(x, y); ctx.scale(s * 2.2, s * 2.2); blob(ctx, 0, 0, 13, 9, '#3A4B3A'); blob(ctx, 0, -3, 8, 8, '#9DB89A'); if (c > .55) dot(ctx, 4, -3, 1.8, PAL.red); ctx.restore(); }

// ----------------------------------------------------------------------------------------------- STUCK (close-up on the problem)
SHOT.stuck = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), z = lerp(3.9, 4.4, E.outQ(lt / len));
  ctx.save(); applyCam(ctx, { x: 62, y: -236, z, hand: 2.6 }, t, [[0, 26]]);
  roomShell(ctx, 13, f, { lx: 0, la: .05 }); windowBack(ctx, -250, 0, f, { w: 300, h: 280, wind: 1 });
  const w = Math.sin(pf * .09);
  const pose = basePose(pf, { lean: .12 + w * .01, tilt: .06, hands: { L: [20, -168], R: [60, -190] }, face: devFace(f, { brow: -1, sweat: true, look: [.9, .3] }) });
  person(ctx, DEVH(0, 0, pose), pf);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = .16; marker(ctx, '13', W / 2 + 190, 1010, 560, PAL.red, { stroke: 0 }); ctx.restore();
  const d = lf; if (d < 5) tint(ctx, '#fff', .35 * (1 - d / 5));
  fadeBottom(ctx); vig(ctx, .6);
};

// ----------------------------------------------------------------------------------------------- shared hallway set
function hallway(ctx, f, o = {}) {
  roomShell(ctx, 13, f, { wall: '#1E3A3C', la: .12, lx: -150 });
  ctx.fillStyle = '#3B1F2A'; ctx.fillRect(-RW, -22, 2 * RW, 22);                                 // carpet
  for (const lx of [-300, 160]) { const on = hash(Math.floor(f / 4) + lx) > .12 ? 1 : .35; ctx.fillStyle = `rgba(230,245,255,${.85 * on})`; ctx.fillRect(lx - 70, -FH + SLAB + 4, 140, 10); glow(ctx, lx, -FH + SLAB + 20, 240, 'rgba(200,230,255,A)', .16 * on); }
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-RW, -FH + SLAB, 2 * RW, 60);
}
function stairDoor(ctx, x, f, open, shake) {
  const w = 130, h = 280;
  ctx.fillStyle = '#05070B'; ctx.fillRect(x - 12, -h - 12, w + 24, h + 12);
  if (open > 0) {                                                                                 // dark stairwell + red eyes in the gap
    ctx.fillStyle = '#10151C'; ctx.fillRect(x, -h, w, h);
    for (let i = 0; i < 5; i++) { const ex = x + 20 + i * 22, ey = -170 + hash(i * 3.1) * 90 + Math.sin(f * .1 + i) * 4; if (ex < x + w - 10) { dot(ctx, ex, ey, 5, PAL.red); dot(ctx, ex + 14, ey, 5, PAL.red); } }
    glow(ctx, x + 60, -140, 220, 'rgba(255,40,30,A)', .18 * open);
  }
  const swing = open * 1.1;
  ctx.save(); ctx.translate(x + w + (hash(f * 3.3) - .5) * (shake || 0), 0); ctx.transform(Math.cos(swing), 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2D4A3A'; ctx.fillRect(-w, -h, w, h); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 4; ctx.strokeRect(-w + 14, -h + 16, w - 28, 110); ctx.strokeRect(-w + 14, -h + 142, w - 28, 118);
  ctx.fillStyle = '#C9CCD6'; ctx.beginPath(); ctx.arc(-24, -130, 8, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#12301F'; ctx.fillRect(x + 20, -h - 56, 90, 34); ctx.font = `800 22px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#6CFF9A'; ctx.fillText('STAIRS', x + 65, -h - 31);
}
function optionLabel(ctx, n, lf, f0 = 3) {                       // checklist of the three options; the active one is highlighted
  const d = lf - f0; if (d < 0) return; const u = clamp(d / 8);
  const names = ['ELEVATOR', 'STAIRS', 'WINDOW'];
  ctx.save(); ctx.translate(W / 2 + 120, 300); ctx.globalAlpha = u; ctx.scale(lerp(1.25, 1, E.outQ(u)), lerp(1.25, 1, E.outQ(u)));
  rr(ctx, -260, -86, 520, 250, 28, 'rgba(8,10,18,.84)', 'rgba(255,255,255,.14)', 3);
  names.forEach((nm, i) => { const y = -30 + i * 72, act = i + 1 === n, done = i + 1 < n || (i + 1 === n && d > (n === 1 ? 175 : 0) + 999);
    ctx.font = `800 44px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = i + 1 < n ? 'rgba(255,255,255,.35)' : act ? PAL.amber : 'rgba(255,255,255,.4)';
    ctx.fillText((i + 1) + '  ' + nm, -220, y + 14); if (i + 1 < n) { ctx.strokeStyle = PAL.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-228, y - 6); ctx.lineTo(120, y - 6); ctx.stroke(); ctx.fillStyle = PAL.red; ctx.textAlign = 'right'; ctx.fillText('✕', 230, y + 14); } });
  ctx.restore();
}
const CAMKEYS = (t, keys) => ({ x: kf(t, keys.map(k => [k[0], k[1], k[4]])), y: kf(t, keys.map(k => [k[0], k[2], k[4]])), z: kf(t, keys.map(k => [k[0], k[3], k[4]])) });

// ----------------------------------------------------------------------------------------------- ELEVATOR
SHOT.elev = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), pos = lf < 8 ? 320 : lerp(320, -22, E.ioQ(clamp((lf - 8) / 66))), moving = lf >= 8 && lf < 74;
  const openA = E.ioC(clamp((lf - 100) / 28)) * (1 - E.ioC(clamp((lf - 198) / 28)));
  const cam = CAMKEYS(t, [[0, -100, -330, 1.0, E.ioC], [88, -100, -330, 1.0, E.ioC], [128, -250, -300, 1.45, E.outQuint], [180, -250, -300, 1.45, E.ioC], [226, -100, -330, 1.0, E.ioC], [252, 0, -330, 1.0]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.5 }, t, [[96, 9], [226, 7]]);
  adjacentFloors(ctx, f, 13, .55); hallway(ctx, f);
  door(ctx, 330, 0, f, { col: '#3A4A5A' });
  const inside = (c, x, y, w, h, open) => {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let i = 0; i < 6; i++) zombieAt(c, x + 60 + i * 38 + (i % 2) * 6, -4 + (i % 3) * -8, f, 20 + i, { s: .9, dir: -1, v: i === 5 ? 1 : (i + 2) % 5, lean: .12, stride: 0, lift: 0, hands: { L: [60, -150], R: [50, -160] } });
    const sw = Math.sin(lf * .22) * .5 + .5;                                                          // tie zombie waves
    zombieAt(c, x + 190, 6, f, 31, { s: 1.0, dir: -1, v: 1, lean: .1, stride: 0, lift: 0, hands: { L: [70, -170], R: [62 + sw * 18, -270 + Math.sin(lf * .5) * 20] }, face: { look: [-.6, 0], mouth: .9 } });
    c.restore();
  };
  elevator(ctx, -440, 0, f, openA, { inside, lbl: openA > .02 ? '☠' : '13', btn: lf >= 84 });
  if (lf >= 96 && lf < 108) { glow(ctx, -290, -170, 520, 'rgba(255,230,170,A)', .5 * (1 - (lf - 96) / 12)); }
  if (openA > .05) glow(ctx, -290, -150, 420, 'rgba(255,225,150,A)', .22 * openA);
  // Dev
  let pose, dir = -1, x = pos;
  const react = lf >= 100;
  const face = react ? devFace(f, { brow: lf < 150 ? -1 : .8, eyes: lf < 150 ? 1.15 : .55, wide: lf < 150, sweat: lf > 112 && lf < 190, look: [-.9, 0], mouth: lf < 150 ? .35 : devTalk(f) }) : devFace(f, { brow: .2, wide: false, mouth: 0, smile: .1, look: [-.8, 0] });
  if (lf >= 226) { dir = 1; x = -22 + (lf - 226) * 6; pose = walkPose((x + 22) / 184, { face: devFace(f, { brow: .5, wide: false, eyes: .6, look: [.8, 0], mouth: 0 }) }); }
  else if (moving || lf < 8) pose = walkPose((320 - x) / 184, { lean: .12, face });
  else {
    const press = sstep(lf, 74, 84) * (1 - sstep(lf, 92, 98)), shock = react ? E.outBack(clamp((lf - 100) / 10), 2) : 0;
    pose = basePose(pf, { lean: .06 - shock * .1, face, hands: { L: [20, -100], R: [lerp(22, 62, press), lerp(-100, -186, press)] }, feet: { L: [-14, 0], R: [18, 0] } });
    if (react) { pose.hands.L = [18 + shock * 36, -120 - shock * 40]; pose.hands.R = [24 + shock * 30, -150 - shock * 70]; pose.hip[1] -= shock * 6; }
  }
  person(ctx, DEVH(x, 0, pose, { dir }), pf);
  ctx.restore();
  optionLabel(ctx, 1, lf, 3); stamp(ctx, lf, 175, W / 2 + 6, 700, PAL.red, '✕', 330);
  vig(ctx, .5);
};

// ----------------------------------------------------------------------------------------------- STAIRS
function flight(ctx, x0, y0, x1, y1, n) {
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  ctx.fillStyle = '#161A24'; ctx.beginPath(); ctx.moveTo(x0, y0 + 14); ctx.lineTo(x1, y1 + 14); ctx.lineTo(x1, y1 + 74); ctx.lineTo(x0, y0 + 74); ctx.fill();
  for (let i = 0; i < n; i++) { const x = x0 + dx * i, y = y0 + dy * i; ctx.fillStyle = i % 2 ? '#4A5163' : '#424959'; ctx.fillRect(Math.min(x, x + dx), Math.min(y, y + dy) , Math.abs(dx) + 2, 16); }
  line(ctx, x0, y0 - 120, x1, y1 - 120, 8, '#6A7288'); for (let i = 0; i <= n; i += 2) line(ctx, x0 + dx * i, y0 + dy * i, x0 + dx * i, y0 + dy * i - 120, 5, '#59627A');
}
function stairwell(ctx, f) {
  const g = ctx.createLinearGradient(0, -300, 0, 900); g.addColorStop(0, '#232836'); g.addColorStop(1, '#10131C'); ctx.fillStyle = g; ctx.fillRect(-RW - 40, -330, 2 * RW + 80, 1500);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let y = -300; y < 900; y += 90) ctx.fillRect(-RW, y, 2 * RW, 3);
  ctx.fillStyle = '#4A5163'; ctx.fillRect(100, 0, 440, 22); ctx.fillRect(-540, 300, 200, 22); ctx.fillRect(100, 560, 440, 22);
  flight(ctx, 100, 0, -340, 300, 11); flight(ctx, -340, 300, 100, 560, 11);
  ctx.fillStyle = '#2D4A3A'; ctx.fillRect(470, -250, 70, 250);                                      // door we came from
  glow(ctx, 0, -60, 400, 'rgba(255,60,40,A)', .1 + .04 * Math.sin(f * .3));
}
SHOT.stairs = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf);
  if (lf < 44 || lf >= 96) {                                                                   // hallway side: approach, then slam & brace
    const pos = lf < 36 ? lerp(-90, 250, E.ioQ(clamp(lf / 36))) : 250, slam = lf >= 96;
    const open = lf >= 96 ? 0 : sstep(lf, 34, 44) * .55, bang = slam ? ([112, 134, 158, 178].some(a => lf >= a && lf < a + 6) ? 1 : 0) : 0;
    const imp = [[96, 14], [112, 12], [134, 12], [158, 14], [178, 16]];
    const cam = slam ? { x: lerp(120, 60, E.ioC(clamp((lf - 96) / 100))), y: -300, z: lerp(1.3, 1.5, clamp((lf - 96) / 100)) } : CAMKEYS(t, [[0, -20, -330, 1.0, E.ioC], [36, 90, -320, 1.25, E.ioC], [44, 90, -320, 1.25]]);
    ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, imp);
    adjacentFloors(ctx, f, 13, .55); hallway(ctx, f);
    elevator(ctx, -440, 0, f, 0, { lbl: '13' });
    stairDoor(ctx, 330, f, open, bang * 6);
    let pose, dir = 1, x = pos;
    if (!slam) pose = lf < 36 ? walkPose((pos + 90) / 184, { face: devFace(f, { brow: .3, wide: false, mouth: devTalk(f) * .8, look: [.8, 0] }) }) : basePose(pf, { lean: .1, hands: { L: [18, -100], R: [lerp(30, 66, sstep(lf, 30, 38)), lerp(-110, -128, sstep(lf, 30, 38))] }, face: devFace(f, { wide: lf > 40, eyes: 1.1, sweat: lf > 40, look: [.9, 0], mouth: lf > 40 ? .3 : devTalk(f) * .6 }) });
    else {
      dir = -1; x = 292; const hit = bang ? 1 : 0, hitA = [112, 134, 158, 178].map(a => lf - a).filter(d => d >= 0 && d < 14).reduce((m, d) => Math.max(m, Math.exp(-d / 4)), 0);
      pose = basePose(pf, { lean: -.2 - hitA * .08, tilt: .08, feet: { L: [-30, 0], R: [-60, 0] }, hands: { L: [-40 - hitA * 6, -176], R: [-44 - hitA * 6, -150] },
        face: devFace(f, { brow: lf < 150 ? -.5 : .8, eyes: lf < 150 ? 1 : .6, wide: lf < 150, sweat: lf > 100, look: [.2, 0], mouth: devTalk(f) }) });
      pose.hip[0] += hitA * 7; pose.hip[1] += hitA * 3;
      dust(ctx, 320, -20, lf, 112, 5); dust(ctx, 320, -20, lf, 134, 5); dust(ctx, 320, -20, lf, 158, 5); burst(ctx, 380, -180, 70, lf, 112, '#cfcfd8', 8); burst(ctx, 380, -150, 70, lf, 158, '#cfcfd8', 8);
    }
    person(ctx, DEVH(x, 0, pose, { dir }), pf);
    ctx.restore(); optionLabel(ctx, 2, lf, 3); if (slam) stamp(ctx, lf, 122, W / 2 - 4, 700, PAL.red, '✕', 330);
    if (slam && lf < 100) tint(ctx, '#fff', .25 * (1 - (lf - 96) / 4));
    vig(ctx, .5); return;
  }
  // inside the stairwell: the horde
  const k = (lf - 44) / 52;
  ctx.save(); applyCam(ctx, { x: 40, y: lerp(10, 330, E.ioC(k)), z: lerp(1.0, .95, k), hand: 2 }, t, [[60, 10]]);
  stairwell(ctx, f);
  const climb = (x, y, i, dir, s = .8) => zombieAt(ctx, x, y, f, 40 + i, { s, dir, v: i % 5, lean: .32, stride: 14, lift: 6, hands: { L: [76, -250 - Math.sin(f * .2 + i) * 10], R: [64, -228 + Math.sin(f * .2 + i) * 10] }, face: { look: [.7, -.4] } });
  for (let i = 0; i < 6; i++) climb(150 + i * 66, -2, i, 1, .86);                                      // pressed against the door
  for (let i = 0; i < 5; i++) { const u = (i + .5) / 5; climb(lerp(60, -300, u), lerp(10, 290, u) - 4, 10 + i, -1, .8); }
  for (let i = 0; i < 4; i++) climb(-500 + i * 50, 296, 20 + i, 1, .8);
  for (let i = 0; i < 5; i++) { const u = (i + .5) / 5; climb(lerp(-300, 60, u), lerp(310, 550, u) - 4, 30 + i, 1, .8); }
  ctx.restore(); optionLabel(ctx, 2, lf + 44, 3); vig(ctx, .55);
};

// ----------------------------------------------------------------------------------------------- VERTIGO
SHOT.vertigo = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf);
  if (lf < 110) {                                                                                 // A: Dev opens the window, leans out
    const pos = lerp(-170, 20, E.ioQ(clamp(lf / 44))), open = E.ioC(clamp((lf - 44) / 18)), lean = sstep(lf, 62, 100) * .75;
    ctx.save(); applyCam(ctx, { x: -60, y: -230, z: lerp(1.5, 1.85, sstep(lf, 40, 110)), hand: 1.8 }, t, [[60, 6]]);
    adjacentFloors(ctx, f, 13, .55); roomShell(ctx, 13, f, { lx: 150, la: .06 }); bed(ctx, -520, 0, f); lamp(ctx, -110, 0, f);
    windowBack(ctx, 40, 0, f, { w: 300, h: 280, wind: open * 1.4 }); if (open > 0) { ctx.fillStyle = 'rgba(8,10,22,.0)'; }
    const sashUp = open * 120;                                                                    // sash slides up
    ctx.fillStyle = 'rgba(180,220,255,.12)'; ctx.fillRect(40, -400 + 0, 300, 140 - sashUp * 0);
    const face = devFace(f, { brow: .2, wide: lf > 60, eyes: 1, mouth: devTalk(f) * .8, look: [.9, .2 + lean * .6], sweat: lf > 90 });
    const pose = lf < 44 ? walkPose((pos + 170) / 184, { face }) : basePose(pf, { lean: .1 + lean, tilt: lean * .2, face, hands: { L: [30 + lean * 30, -150 + open * 10], R: [58 + lean * 40, -168 + lean * 20 - open * 30] }, feet: { L: [-12, 0], R: [14, 0] } });
    person(ctx, DEVH(pos, 0, pose), pf);
    ctx.restore(); optionLabel(ctx, 3, lf, 4); vig(ctx, .5);
  } else if (lf < 215) {                                                                          // B: whip down the facade, then the street
    const k = (lf - 110) / 105;
    if (k < .82) {
      const kk = k / .82, camY = lerp(-300, FLOORY(1) - 120, E.ioQuint(kk) * .5 + E.ioC(kk) * .5);
      ctx.save(); applyCam(ctx, { x: 0, y: camY, z: .58, hand: 0 }, t, null);
      skyGrad(ctx, -1500, -3000, 3000, 12000);
      const top = Math.max(1, Math.floor(13 - (camY - 1500) / FH)), bot = Math.min(13, Math.ceil(13 - (camY - 1000) / FH) + 1);
      for (let n = 14; n >= 1; n--) { const fy = FLOORY(n); if (fy < camY - 1300 || fy - FH > camY + 1300) continue; roomShell(ctx, n, f, { la: .05 });
        if (n < 13 && n > 1) { const zx = -300 + hash(n * 7) * 600 + Math.sin(f * .012 + n) * 90; zombieAt(ctx, zx, fy, f, n * 5, { dir: Math.cos(f * .012 + n) > 0 ? 1 : -1 }); if (hash(n * 3) > .4) zombieAt(ctx, zx + 200, fy, f, n * 5 + 1, {}); }
        ctx.fillStyle = 'rgba(6,8,16,.45)'; ctx.fillRect(-RW, fy - FH, 2 * RW, FH + SLAB); }
      towerFrame(ctx, 14, 1, f);
      for (let n = 13; n >= 1; n--) marker(ctx, String(n), -RW + 90, FLOORY(n) - 40, 130, n === 13 ? PAL.red : 'rgba(255,255,255,.5)', { stroke: 14 });
      ctx.restore();
      speedLines(ctx, W / 2, H / 2, f, .35 * Math.sin(kk * Math.PI), '#9ab', 14, true);
    } else {                                                                                       // street top-down, crash zoom
      const kk = (k - .82) / .18, z = lerp(1.0, 2.1, E.inC(kk));
      ctx.save(); ctx.translate(W / 2, 960); ctx.scale(z, z); ctx.translate(-W / 2, -960);
      ctx.fillStyle = '#0B0D18'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 8; ctx.setLineDash([60, 50]); ctx.beginPath(); ctx.moveTo(0, 960); ctx.lineTo(W, 960); ctx.stroke(); ctx.setLineDash([]);
      const b6 = Math.floor(f / 6);
      for (let i = 0; i < _crowd.length; i++) { const [a, b, c] = _crowd[i]; miniZombieTop(ctx, a * W + jit(i, b6, 2), 420 + b * 1100, .85 + c * .5, c); }
      ctx.restore(); vig(ctx, .7);
      for (let i = 0; i < 40; i++) { const ex = hash(i * 2.1) * W, ey = 300 + hash(i * 4.7) * 1300; dot(ctx, ex, ey, 6 + kk * 6, PAL.red, .9 * clamp(kk * 2)); }
    }
  } else {                                                                                         // C: face, gulp, "also no"
    const lf2 = lf - 215, nodS = Math.sin(lf2 * .35) * (1 - clamp(lf2 / 60)) * .12, z = lerp(3.4, 3.7, lf2 / 85);
    ctx.save(); applyCam(ctx, { x: 70, y: -236, z, hand: 2.4 }, t, [[0, 18]]);
    roomShell(ctx, 13, f, { lx: 0, la: .05 }); windowBack(ctx, -250, 0, f, { w: 300, h: 280, wind: 1 });
    const pose = basePose(pf, { lean: .16, tilt: .1 + (lf2 > 30 ? Math.sin(lf2 * .5) * .05 : 0), hands: { L: [30, -150], R: [60, -180] }, face: devFace(f, { brow: lf2 > 40 ? .8 : -1, eyes: lf2 > 40 ? .6 : 1.15, wide: lf2 <= 40, sweat: true, look: [.9, .4], mouth: devTalk(f) }) });
    person(ctx, DEVH(0, 0, pose), pf);
    ctx.restore(); fadeBottom(ctx); stamp(ctx, lf, 262, W / 2 + 10, 640, PAL.red, '✕', 330); vig(ctx, .55);
  }
};

function miniZombie(ctx, x, y, s, f, seed) {
  const b = Math.floor((f + seed * 9) / 6), sw = Math.sin(b * 1.7 + seed), jx = jit(seed, b, 1.5);
  ctx.save(); ctx.translate(x + jx, y); ctx.scale(s, s); ctx.lineCap = 'round';
  ctx.strokeStyle = '#0A0C10'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-8 + sw * 6, -34); ctx.moveTo(5, 0); ctx.lineTo(8 - sw * 6, -34); ctx.moveTo(0, -34); ctx.lineTo(4, -70); ctx.moveTo(4, -64); ctx.lineTo(30, -58 + sw * 3); ctx.stroke();
  ctx.strokeStyle = '#7E9A7B'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#7E9A7B'; ctx.strokeStyle = '#0A0C10'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(8, -82, 13, 0, TAU); ctx.fill(); ctx.stroke(); dot(ctx, 13, -84, 3, PAL.red);
  ctx.restore();
}
