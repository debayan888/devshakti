// eps2.js - Episode 2 "Floor 10": swing, crash, peek, pan, hall (stealth + chase + dive), end card
'use strict';
const EVF = n => TL.events[n];                                  // event frame
const EVS = n => TL.events[n] / 60;                             // event second
function sfxPop(ctx, txt, x, y, f, f0, col = PAL.amber, size = 120, dur = 46, rot = -.08) {   // comic sound-effect word, appears exactly when the sound plays
  const d = f - f0; if (d < 0 || d > dur) return; const u = clamp(d / 8), fade = 1 - clamp((d - dur + 12) / 12);
  marker(ctx, txt, x, y - Math.sin(clamp(d / 14) * Math.PI) * 10, size * (u < 1 ? outB(u, 1.8) : 1 + .04 * Math.sin(d * .8)), col, { rot, a: fade, stroke: size * .2 });
}
const ZCOL = { dev: '#FFFFFF', mom: '#FF9FC4' };

// ----------------------------------------------------------------------------------------------- sets
function couch(ctx, x, fy, squash = 0) {
  rr(ctx, x - 20, fy - 190 + squash * 6, 300, 150, 22, '#4A3560'); rr(ctx, x - 10, fy - 120 + squash * 10, 280, 78 - squash * 8, 16, '#5C4377'); rr(ctx, x - 40, fy - 120, 52, 100, 14, '#4A3560'); rr(ctx, x + 262, fy - 120, 52, 100, 14, '#4A3560');
  ctx.fillStyle = '#2B1F36'; ctx.fillRect(x - 20, fy - 40, 22, 40); ctx.fillRect(x + 262, fy - 40, 22, 40);
}
function brokenWindow(ctx, x, fy, f, o = {}) {
  const w = 300, h = 280, y = fy - 120 - h;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); skyGrad(ctx, x, y, w, h); ctx.fillStyle = '#10121C'; for (let i = 0; i < 7; i++) { const bx = x + i * 48 - 10, bh = 60 + hash(i * 3.1) * 90; ctx.fillRect(bx, y + h - bh, 42, bh); }
  glow(ctx, x + w * .7, y + h - 20, 120, 'rgba(255,120,40,A)', .5 + .2 * Math.sin(f * .2)); ctx.restore();
  ctx.fillStyle = 'rgba(235,245,255,.9)'; for (const side of [0, 1]) for (let i = 0; i < 9; i++) { const px = x + (side ? w - 14 : 0) + 7, py = y + 8 + i * 30 + hash(i + side * 9) * 10, sz = 12 + hash(i * 2 + side) * 22, dir = side ? -1 : 1; ctx.beginPath(); ctx.moveTo(px - dir * 4, py); ctx.lineTo(px + dir * sz, py + 14); ctx.lineTo(px - dir * 4, py + 28); ctx.fill(); }
  ctx.strokeStyle = '#0B0E1A'; ctx.lineWidth = 14; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#10142A'; ctx.fillRect(x - 10, y + h, w + 20, 14);
  const sway = Math.sin(f * .06) * 6 + 8; ctx.fillStyle = '#7A2D4A'; ctx.beginPath(); ctx.moveTo(x + w - 6, y - 34); ctx.lineTo(x + w + 56, y - 34); ctx.quadraticCurveTo(x + w + 56 + sway, y + h * .5, x + w + 50 + sway * 1.6, y + h + 60); ctx.lineTo(x + w - 10 + sway * 1.6, y + h + 60); ctx.quadraticCurveTo(x + w + sway, y + h * .5, x + w - 6, y - 34); ctx.fill();
}
function apt10(ctx, f, o = {}) {
  roomShell(ctx, 13, f, { wall: '#2A2440', lx: 0, la: .08 }); brokenWindow(ctx, -420, 0, f); door(ctx, 400, 0, f, { shake: o.doorShake || 0 });
  couch(ctx, 80, 0, o.squash || 0);
  ctx.fillStyle = '#10121C'; ctx.fillRect(-540, -250, 20, 120);                                                // TV edge glow on left
  rr(ctx, -300, -60, 150, 60, 6, '#E8E0C8', PAL.ink, 3); rr(ctx, -290, -50, 130, 12, 3, '#C9323A'); rr(ctx, 330, -34, 70, 34, 4, '#E8E0C8', PAL.ink, 3);       // pizza boxes
  ctx.fillStyle = '#3A2B20'; ctx.fillRect(-160, -150, 14, 150); rr(ctx, -200, -165, 100, 24, 6, '#3A2B20');                                          // side table
  ctx.fillStyle = '#1E2A3A'; ctx.fillRect(480, -300, 56, 300);
}
function hallSurround(ctx, f) {                                   // the building above and below the hallway, dimmed, full of zombies (fills the 9:16 frame)
  for (const ty of [-FH, FH]) for (const tx of [-1080, 0, 1080]) { ctx.save(); ctx.translate(tx, ty); roomShell(ctx, 13, f, { wall: WALLS[(tx / 1080 + (ty > 0 ? 1 : 3) + 4) % 4], la: .04 });
    if (ty > 0) for (let i = 0; i < 2; i++) zombieAt(ctx, -240 + i * 340 + Math.sin(f * .012 + i + tx) * 90, 0, f, 30 + i + (tx > 0 ? 3 : tx < 0 ? 6 : 0), { dir: Math.cos(f * .012 + i + tx) > 0 ? 1 : -1 });
    ctx.fillStyle = 'rgba(6,8,16,.6)'; ctx.fillRect(-RW, -FH, 2 * RW, FH + SLAB); ctx.restore(); }
}
function longHall(ctx, f, o = {}) {
  const x0 = -1250, x1 = 780, top = -526;
  const g = ctx.createLinearGradient(0, top, 0, 0); g.addColorStop(0, '#16292C'); g.addColorStop(1, '#1E3A3C'); ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, -top);
  ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = x0; x < x1; x += 90) ctx.fillRect(x, top, 36, -top);
  ctx.fillStyle = '#0E1A1C'; ctx.fillRect(x0, -24, x1 - x0, 24); ctx.fillStyle = '#3B1F2A'; ctx.fillRect(x0, 0, x1 - x0, 44); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x0, 0, x1 - x0, 3);
  for (let x = x0; x < x1; x += 120) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x + 20, 14, 70, 6); }          // carpet pattern
  ctx.fillStyle = '#0B1618'; ctx.fillRect(x0, top - 30, x1 - x0, 30 + 44 * 0);
  for (const lx of [-1000, -620, -240, 140, 520]) { const on = hash(Math.floor(f / 4) + lx * .01) > .1 ? 1 : .3; ctx.fillStyle = `rgba(230,245,255,${.85 * on})`; ctx.fillRect(lx - 70, top + 4, 140, 10); glow(ctx, lx, top + 30, 280, 'rgba(200,230,255,A)', .12 * on); }
  const nums = ['1004', '1005', '1006', '1007']; [-900, -450, 0, 450].forEach((dx, i) => { if (i === 0) door(ctx, dx - 65, 0, f, { col: '#4A3326' }); else door(ctx, dx - 65, 0, f, { col: ['#3A4A5A', '#4A3A44', '#3F4A3A'][i % 3] }); ctx.fillStyle = '#C9B26A'; ctx.fillRect(dx - 24, -330, 48, 24); ctx.font = `800 18px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#222'; ctx.fillText(nums[i], dx, -312); });
  // right end wall with window to the night
  ctx.fillStyle = '#0A1214'; ctx.fillRect(x1 - 20, top, 60, -top + 44);
  if (!o.noEndWin) { skyGrad(ctx, x1 - 8, -350, 80, 230); glow(ctx, x1 + 20, -190, 160, 'rgba(255,110,40,A)', .4); ctx.strokeStyle = '#0A0E16'; ctx.lineWidth = 8; ctx.strokeRect(x1 - 8, -350, 80, 230); }
  ctx.fillStyle = '#20E070'; ctx.fillRect(x1 - 150, -430, 90, 36); ctx.font = `800 22px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#052'; ctx.fillText('EXIT', x1 - 105, -405);
}
function hoseCabinet(ctx, f, broken, glowOn = 1) {
  const x = 520, y = -330, w = 170, h = 280;
  ctx.fillStyle = '#0B0F10'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20); ctx.fillStyle = '#B8261E'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7A1712'; ctx.fillRect(x + 12, y + 12, w - 24, h - 24);
  const cx = x + w / 2, cy = y + 150; for (let r = 62; r > 14; r -= 9) { ctx.strokeStyle = r % 18 === 8 ? '#F2EFE4' : '#D9D5C4'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = '#C9A24A'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, TAU); ctx.fill();
  marker(ctx, 'FIRE HOSE', cx, y + 56, 30, '#fff', { stroke: 6 });
  if (!broken) { ctx.fillStyle = 'rgba(170,220,255,.22)'; ctx.fillRect(x + 12, y + 12, w - 24, h - 24); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 3; ctx.strokeRect(x + 12, y + 12, w - 24, h - 24); }
  else { ctx.fillStyle = 'rgba(235,245,255,.9)'; for (let i = 0; i < 6; i++) { const px = x + 14 + i * 28, sz = 10 + hash(i) * 14; ctx.beginPath(); ctx.moveTo(px, y + 14); ctx.lineTo(px + 14, y + 14 + sz); ctx.lineTo(px + 28, y + 14); ctx.fill(); } }
  glow(ctx, cx, y + 150, 330, 'rgba(255,70,50,A)', .2 * glowOn + .06 * Math.sin(f * .2));
}
function hoseLine(ctx, pts, taut = 0) {                          // fire hose: thick white/red banded line along the floor
  for (let pass = 0; pass < 2; pass++) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = pass ? '#E6E1D2' : PAL.ink; ctx.lineWidth = pass ? 20 : 27; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  ctx.strokeStyle = '#B8261E'; ctx.lineWidth = 20; ctx.setLineDash([16, 44]); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.setLineDash([]);
}
function phoneProp(ctx, x, y, rot, f, ring = 0, s = 1) {            // small phone in the world
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const sh = ring ? Math.sin(f * 2.4) * 2.5 : 0; ctx.translate(sh, 0);
  rr(ctx, -20, -34, 40, 68, 8, '#16181F', '#5A5F70', 3); rr(ctx, -16, -29, 32, 56, 5, ring ? '#1E8A4E' : '#223', null); if (ring) { ctx.fillStyle = '#fff'; ctx.font = `800 11px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillText('MOM', 0, -4); ctx.fillStyle = '#FF9FC4'; ctx.beginPath(); ctx.arc(0, 12, 6, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function ringWaves(ctx, x, y, f, f0, col = PAL.amber) { const d = f - f0; for (let k = 0; k < 3; k++) { const u = ((d * .035 + k / 3) % 1); ctx.save(); ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = col; ctx.lineWidth = 6 * (1 - u) + 2; ctx.beginPath(); ctx.arc(x, y, 30 + u * 170, 0, TAU); ctx.stroke(); ctx.restore(); } }
function floorHazard(ctx, kind, x, f, hot = 0) {                  // things on the hallway floor (foreground lane)
  ctx.save(); ctx.translate(x, 22);
  if (kind === 'pizza') { rr(ctx, -52, -14, 104, 22, 4, '#E8E0C8', PAL.ink, 3); rr(ctx, -44, -11, 88, 7, 2, '#C9323A'); }
  if (kind === 'can') { rr(ctx, -12, -34, 24, 38, 5, '#D8D8E0', PAL.ink, 3); rr(ctx, -12, -22, 24, 12, 0, '#2A7AD8'); blob(ctx, 0, -34, 12, 4, '#9aa'); }
  if (kind === 'bag') { ctx.fillStyle = '#F2C230'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, 4); ctx.lineTo(-28, -30); ctx.lineTo(28, -30); ctx.lineTo(34, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); marker(ctx, 'CHIPS', 0, -8, 15, '#C9323A', { stroke: 4 }); }
  if (hot) { ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.globalAlpha = .5 + .5 * Math.sin(f * .4); ctx.beginPath(); ctx.arc(0, -16, 52, 0, TAU); ctx.stroke(); }
  ctx.restore();
}

// ----------------------------------------------------------------------------------------------- zombie crowd simulation (precomputed per frame: deterministic)
const ZH = [[-720, 11, 1], [-590, 12, 1], [-40, 13, 1], [110, 14, -1], [230, 15, 1], [340, 16, -1], [430, 17, 1], [-1040, 18, 1]];
let ZSIM = null;
function devXAt(ts) {
  const eP = n => EVS(n);
  if (ts < eP('door_clear')) return -880 + (ts < eP('door_open') ? 0 : 0);
  if (ts < eP('crunch')) return -880 + (ts - eP('door_clear')) / (eP('crunch') - eP('door_clear')) * 570;
  if (ts < eP('throw') + .35) return -310;
  if (ts < 34.4) return Math.min(520, -310 + 440 * Math.max(0, ts - 32.5) * 1.0);
  if (ts < 37.0) return 520;
  if (ts < 37.5) return lerp(520, 700, clamp((ts - 37.0) / .5));
  return 705;
}
function buildZSim() {
  if (ZSIM) return; ZSIM = []; const N = TL.total, E_ = EVS;
  const phoneX = -900;
  const order = ZH.map((z, i) => i).sort((a, b) => Math.abs(ZH[a][0] - phoneX) - Math.abs(ZH[b][0] - phoneX));          // rank by closeness to the phone
  ZH.forEach((z, i) => {
    const rank = order.indexOf(i), arr = new Array(N + 1); let x = z[0], dir = z[2], mode = 0, turned = -1; const tgtPile = phoneX + 30 + rank * 24 - 100;
    let stopped = false;
    for (let f = 0; f <= N; f++) {
      const ts = f / 60, dx = devXAt(ts); mode = 0; let vx = 0;
      const base = z[0];
      if (ts >= E_('crunch') && ts < E_('turn_back') && Math.abs(base - -310) < 460) { dir = base < -310 ? 1 : -1; mode = 1; }
      else if (ts >= E_('turn_back') && ts < E_('ring_on')) { dir = z[2]; }
      if (ts >= E_('ring_on') && ts < E_('phone_land')) { dir = x < dx ? 1 : -1; mode = 1; }
      if (ts >= 27.5 && ts < E_('phone_land')) {                                                    // approach Dev
        const v = Math.min(1, (ts - 27.5) / 2.1) * 70 + Math.min(1, Math.max(0, ts - 29.6) / 1.9) * 24, gap = 70 + (order.indexOf(i)) * 4;
        if (Math.abs(x - dx) > gap + (x < dx ? 0 : 0)) { vx = (x < dx ? 1 : -1) * v / 60; x += vx; mode = 2; dir = vx > 0 ? 1 : -1; }
      }
      if (ts >= E_('phone_land') && ts < E_('turn_heads')) {                                         // sprint to the phone and pile on it
        const tg = tgtPile + (hash(i * 7) - .5) * 40; if (Math.abs(x - tg) > 6) { vx = (x < tg ? 1 : -1) * Math.min(520, 160 + (ts - E_('phone_land')) * 1200) / 60; x += vx; mode = 3; dir = vx > 0 ? 1 : -1; } else { mode = 4; dir = (hash(Math.floor(f / 9) + i) > .5) ? 1 : -1; }
        if (ts >= E_('crush')) { mode = 4; }
      }
      if (ts >= E_('turn_heads') && ts < E_('charge')) { const st = E_('turn_heads') + rank * .08; mode = ts >= st ? 5 : 4; dir = ts >= st ? 1 : dir; }
      if (ts >= E_('charge')) {
        const st = E_('charge') + (rank < 3 ? 0 : rank * .02), lead = rank === 0 ? 1180 : 760 + (7 - rank) * 28;
        if (ts >= st) { vx = Math.min(lead, 100 + (ts - st) * 2600) / 60; x += vx; mode = 6; dir = 1; } else { mode = 5; dir = 1; }
      }
      arr[f] = [x, dir, mode, vx * 60];
    }
    ZSIM[i] = arr;
  });
}
function zPoseFor(mode, x, f, seed, speed) {
  const pf = pf5(f + seed * 3);
  if (mode === 3 || mode === 6) { const ph = x / 300; return walkPose(ph, { stride: 70, lift: 40, bob: 9, lean: .5, tilt: .5, hands: { L: [70, -120], R: [60, -190] }, face: { look: [.8, 0], mouth: 1 } }); }
  if (mode === 2) { const ph = x / 90; return walkPose(ph, { stride: 22, lift: 9, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176 + Math.sin(f * .2) * 8], R: [78, -190] }, face: { look: [.7, 0], mouth: .8 } }); }
  if (mode === 4) return basePose(pf, { lean: .2, tilt: .4 + Math.sin(f * .3 + seed) * .15, hands: { L: [80, -90 + Math.sin(f * .4 + seed) * 20], R: [70, -80] }, face: { look: [.5, .5], mouth: .9 } });
  if (mode === 5) return basePose(pf, { lean: .3, tilt: .5, hands: { L: [92, -176], R: [80, -190] }, face: { look: [.9, 0], mouth: 1 } });
  const sw = Math.sin(f * .02 + seed) * 0; return basePose(pf, { lean: .18 + (mode === 1 ? .08 : 0), tilt: .3 + Math.sin(f * .05 + seed) * .12, hands: { L: [30, -96 + Math.sin(f * .07 + seed) * 6], R: [24, -90] }, feet: { L: [-14, 0], R: [14, 0] }, face: { look: [.5, 0], mouth: null } });
}
function drawZ(ctx, f, i) {
  buildZSim(); const [x, dir, mode, sp] = ZSIM[i][Math.min(f, TL.total)], seed = ZH[i][1];
  const pose = zPoseFor(mode, x, f, seed, sp);
  person(ctx, { x, y: -16, s: .92, dir, kind: 'z', seed, var: seed % 5, pose }, pf5(f + seed * 3));
  if (mode === 1 && (f % 40) < 12) { const k = (f % 40) / 12; marker(ctx, '!', x + 6, -330 - k * 10, 70 * outB(k, 1.5), PAL.red, { stroke: 12 }); }
}

// ----------------------------------------------------------------------------------------------- SHOT: swing (recap + kick)
SHOT.swing = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), hy = 1500, k = EVF('kick'), pull = clamp((lf - 150) / 60);
  const zHip = lerp(1190, 1386, E.ioQ(clamp(lf / 205)));
  const swing = Math.sin(lf * .22) * 62 * sstep(lf, 40, 170);
  ctx.save(); applyCam(ctx, { x: -340 + 60 * sstep(lf, 120, k), y: hy + 20 - 120 * sstep(lf, 100, k), z: lerp(.62, .95, E.ioC(sstep(lf, 0, k))), hand: 2.2 }, t, [[k, 40]]);
  outside(ctx, f, hy); facade(ctx, f, 14, 8, {});
  ropeVertical(ctx, ROPEX + swing * .1, -120, ROPE_END + 8, f);
  const hang = hangPose(hy, { face: devFace(f, { wide: true, eyes: 1.2, brow: -1, look: [.9, -.6], mouth: devTalk(f), sweat: true }), tilt: -.2 });
  const kk = clamp((lf - 190) / 20);
  hang.feet = { L: [FEETX - HANGX + 36 * kk + swing * .3, -HIP_H + 74 - 90 * kk], R: [FEETX - HANGX + 52 * kk + swing * .3, -HIP_H + 96 - 100 * kk] }; if (lf > 194) hang.lean = -.1 + .35 * kk;
  person(ctx, DEVH(HANGX + swing, hy + HIP_H, hang, {}), pf);
  const zh = hangPose(zHip, { face: { look: [0, .9], mouth: .9 }, tilt: .3 }); zh.lean = -.2 + Math.sin(lf * .2) * .1; person(ctx, { x: HANGX - 4, y: zHip + HIP_H, s: 1, dir: 1, kind: 'z', var: 1, seed: 90, pose: zh }, pf5(lf));
  ctx.fillStyle = '#B9B196'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ROPEX, ROPE_END + 14, 16, 0, TAU); ctx.fill(); ctx.stroke();
  if (lf >= k - 2) { const d = lf - (k - 2); for (let i = 0; i < 20; i++) { const a = hash(i * 2.3) * TAU, r = (30 + hash(i * 5) * 260) * E.outQ(clamp(d / 18)); ctx.save(); ctx.translate(WALLX - WALLT / 2 + Math.cos(a) * r * 1.2, 1450 + Math.sin(a) * r); ctx.rotate(a * 3 + d * .2); ctx.fillStyle = 'rgba(200,235,255,.9)'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(12, 14); ctx.lineTo(-10, 8); ctx.fill(); ctx.restore(); } }
  ctx.restore(); vig(ctx, .5);
  if (lf < 130) { const a = 1 - sstep(lf, 100, 130); ctx.save(); ctx.globalAlpha = a; marker(ctx, 'PREVIOUSLY…', W / 2 + 110, 330, 62, PAL.chalk, { stroke: 14 }); ctx.restore(); }
  if (lf >= k - 2 && lf < k + 3) tint(ctx, '#fff', .55 * (1 - (lf - k + 2) / 5));
};

// ----------------------------------------------------------------------------------------------- SHOT: crash into apartment 10
SHOT.crash = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), land = EVF('land') - TL.shots.crash[0];
  ctx.save(); applyCam(ctx, { x: -40, y: -210, z: lerp(1.2, 1.35, lt / len), hand: 2 }, t, [[0, 26], [land, 22]]);
  const squash = lf >= land ? Math.exp(-(lf - land) / 12) * Math.sin((lf - land) * .6) : 0;
  adjacentFloors(ctx, f, 13, .55); apt10(ctx, f, { squash });
  // glass spray from the window
  for (let i = 0; i < 26; i++) { const u = clamp(lf / 60), a = -.8 + hash(i * 3) * 1.6, sp = 160 + hash(i * 7) * 380; ctx.save(); ctx.translate(-270 + Math.cos(a) * sp * u * 1.2, -300 + Math.sin(a) * sp * u * .5 + u * u * 520); ctx.rotate(i + lf * .2); ctx.globalAlpha = 1 - u * .8; ctx.fillStyle = 'rgba(210,238,255,.9)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, 10); ctx.lineTo(-8, 7); ctx.fill(); ctx.restore(); }
  const fl = clamp(lf / land), face0 = devFace(f, { wide: true, eyes: 1.2, brow: -1, mouth: .9, look: [.8, 0] });
  if (lf < land) {                                                                                  // flight: tumbling through the window and across the room
    const u = fl, x = lerp(-300, 170, E.outQ(u)), y = lerp(-330, -126, u) - Math.sin(u * Math.PI) * 120, rot = lerp(-.9, 1.55 + 3.4, u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); person(ctx, DEVH(0, 104, basePose(pf, { lean: .1, hands: { L: [60, -150], R: [40, -190] }, feet: { L: [30, -30], R: [60, -60] }, face: face0 }), { hoodie: false }), pf); ctx.restore();
  } else {
    const d = lf - land, sit = sstep(d, 78, 108), thumbs = sstep(d, 52, 66) * (1 - sstep(d, 100, 112));
    const lean = lerp(-1.45, .12, sit), hipY = lerp(-132 + squash * 6, -126, sit);
    const dazed = d < 80, face = { look: [.6, 0], eyes: dazed ? .35 : 1, brow: dazed ? .2 : -.8, mouth: dazed ? .3 : devTalk(f) * .9, wide: !dazed, smile: .8, sweat: d > 90 };
    const pose = { hip: [0, -104], lean, tilt: dazed ? .1 : 0, feet: { L: [lerp(100, 60, sit), -98 + (hipY + 132)], R: [lerp(108, 74, sit), -102 + (hipY + 132)] }, hands: { L: [lerp(30, 60, sit), lerp(-110, -90, sit)], R: [lerp(20 + thumbs * 70, 62, sit), lerp(-110 - thumbs * 150, -100, sit)] }, face };
    person(ctx, DEVH(170, hipY + 104, pose, { hoodie: false }), pf);
    if (dazed) for (let i = 0; i < 3; i++) { const a = f * .12 + i * 2.1; ctx.save(); ctx.translate(46 + Math.cos(a) * 54, -178 + Math.sin(a) * 14); ctx.rotate(f * .1); ctx.fillStyle = PAL.amber; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 16, an = k / 10 * TAU; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); ctx.restore(); }
    dust(ctx, 170, -120, lf, land, 8, 1.6); burst(ctx, 170, -130, 120, lf, land, PAL.chalk, 12);
  }
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'CRASH!', W / 2 + 30, 560, lf, 0, PAL.amber, 150, 40);
  sfxPop(ctx, 'THUD', W / 2 + 130, 700, lf, land, PAL.chalk, 110, 34, .1);
  if (lf < 3) tint(ctx, '#fff', .5 * (1 - lf / 3));
  if (lf > len - 40) { sfxPop(ctx, 'GRRRR…', W / 2 + 150, 520, lf, len - 40, PAL.red, 90, 40, .06); }
};

// ----------------------------------------------------------------------------------------------- SHOT: peephole
function horde3(ctx, f, cx, cy, R, near = 0) {                                                       // packed hallway seen through the peephole
  ctx.fillStyle = '#0B1618'; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const g = ctx.createLinearGradient(0, cy - R, 0, cy + R); g.addColorStop(0, '#16292C'); g.addColorStop(1, '#244A4E'); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  for (let row = 0; row < 4; row++) { const cnt = [8, 7, 6, 5][row], s = [.5, .68, .9, 1.2][row], y0 = [cy - 20, cy + 55, cy + 150, cy + 290][row];
    for (let i = 0; i < cnt; i++) { const sd = row * 9 + i, x = cx - R + 40 + (i + (row % 2 ? .5 : 0)) * (2 * R - 80) / cnt + jit(sd, Math.floor(f / 6), 3);
      person(ctx, { x, y: y0 + 120 * s, s: s * .72, dir: hash(sd) > .5 ? 1 : -1, kind: 'z', seed: sd, var: sd % 5, pose: basePose(pf5(f + sd * 4), { lean: .12, tilt: .3 + Math.sin(f * .04 + sd) * .2, hands: { L: [40, -130], R: [40, -120] }, face: { look: [0, 0], mouth: null } }) }, pf5(f + sd * 4)); } }
  if (near > 0) { dot(ctx, cx + 8, cy - 30, 18 + near * 250, PAL.red, .96); dot(ctx, cx + 8, cy - 30, 5 + near * 90, '#150000'); }
}
SHOT.peek = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), pe = EVF('peep_open') - TL.shots.peek[0];
  if (lf >= pe) {                                                                                        // peephole POV
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const cx = W / 2, cy = H * .42, R = 470;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); const z = 1 + .02 * Math.sin(f * .1) + .06 * sstep(lf, pe, len); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
    horde3(ctx, f, cx, cy, R, prog(lf, len - 40, len - 12)); ctx.restore();
    ctx.lineWidth = 36; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R + 18, 0, TAU); ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#8a7a50'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    marker(ctx, '20+ ZOMBIES', W / 2, 1030, 62, PAL.red, { rot: -.03, a: sstep(lf, pe + 40, pe + 52), stroke: 14 });
    sfxPop(ctx, 'GRRR…', W / 2 - 250, 280, lf, pe + 6, PAL.chalk, 90, 60); sfxPop(ctx, 'MMMRR…', W / 2 + 270, 330, lf, pe + 30, PAL.chalk, 80, 60, .08);
    vig(ctx, .5); return;
  }
  ctx.save(); applyCam(ctx, { x: 240, y: -215, z: 1.45, hand: 1.6 }, t, null);
  adjacentFloors(ctx, f, 13, .55); apt10(ctx, f, {});
  const x = lerp(170, 330, E.ioQ(clamp(lf / 44))), moving = lf < 46;
  const face = devFace(f, { wide: false, brow: .5, eyes: 1.1, mouth: devTalk(f) * .7, look: [.9, .1] });
  const pose = moving ? walkPose((x - 170) / 184, { lean: .1, face }) : basePose(pf, { lean: .22, tilt: .06, face: { ...face, look: [1, 0] }, hands: { L: [20, -100], R: [74, -176] }, feet: { L: [-12, 0], R: [20, 0] } });
  person(ctx, DEVH(x, 0, pose, { hoodie: false }), pf);
  ctx.restore(); vig(ctx, .5);
};

// ----------------------------------------------------------------------------------------------- SHOT: pan along the hallway to the fire hose
function hallCam(ctx, c, t, imp) { applyCam(ctx, c, t, imp); }
SHOT.pan = (ctx, lt, lf, len, t, f) => {
  const ts = f / 60, a = EVS('cab_reach'), b = EVS('hose_coil');
  const cx = kf(ts, [[10.5, -820, E.ioC], [a, 520, E.ioQuint], [b, 540, E.ioC], [14.6, 530, E.ioC], [15.45, -840]]), cz = kf(ts, [[10.5, 1.0], [a - .5, 1.05, E.ioC], [b, 2.1, E.ioQuint], [14.5, 2.1, E.ioC], [15.2, 1.1, E.ioC]]);
  const cy = kf(ts, [[10.5, -250], [b, -230], [14.6, -230], [15.45, -250]]);
  ctx.save(); hallCam(ctx, { x: cx, y: cy, z: cz, hand: 1.2 }, t, null);
  hallSurround(ctx, f); longHall(ctx, f, {}); hoseCabinet(ctx, f, false);
  for (let i = 0; i < ZH.length; i++) { buildZSim(); const [x, dir] = [ZH[i][0] + Math.sin(f * .01 + ZH[i][1]) * 14, ZH[i][2]]; person(ctx, { x, y: -16, s: .92, dir, kind: 'z', seed: ZH[i][1], var: ZH[i][1] % 5, pose: zPoseFor(0, x, f, ZH[i][1], 0) }, pf5(f + ZH[i][1] * 3)); }
  floorHazard(ctx, 'pizza', -505, f); floorHazard(ctx, 'can', -415, f); floorHazard(ctx, 'bag', -310, f);
  ctx.restore(); vig(ctx, .5);
  if (ts > b - .1 && ts < 15.0) { const k = sstep(ts, b - .1, b + .3); ctx.save(); ctx.globalAlpha = k; rr(ctx, W / 2 - 330, 520, 660, 170, 26, 'rgba(8,10,18,.85)', 'rgba(255,255,255,.18)', 3); marker(ctx, 'FIRE HOSE', W / 2, 600, 64, PAL.chalk, { stroke: 10 }); marker(ctx, '100 FT  =  ABOUT 9 FLOORS', W / 2, 670, 46, PAL.amber, { stroke: 10 }); ctx.restore(); }
  const ding = EVF('cab_reach'); if (f >= ding && f < ding + 14) burst(ctx, W / 2 + 40, 900, 200, f, ding, '#fff', 12);
  sfxPop(ctx, 'DING!', W / 2 + 250, 820, f, ding, PAL.amber, 100, 36, .1);
};

// ----------------------------------------------------------------------------------------------- SHOT: hall (stealth, phone, chase, dive)
function devHallState(ts) {                                                                           // [x, mode]
  const x = devXAt(ts); return x;
}
const RULES = [['1', 'NO SOUND'], ['2', "DON'T STEP ON ANYTHING"], ['3', 'SILENCE YOUR PHONE']];
function rulesPanel(ctx, ts, f) {
  const t0 = 15.9; if (ts < t0) return; const u = clamp((ts - t0) / .35);
  ctx.save(); ctx.translate(W - 60, 300); ctx.globalAlpha = u; ctx.scale(lerp(1.2, 1, E.outQ(u)), lerp(1.2, 1, E.outQ(u)));
  rr(ctx, -610, -80, 610, 250, 26, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  RULES.forEach(([n, txt], i) => {
    const shown = ts >= [15.95, 18.85, 23.2][i], y = -28 + i * 72; if (!shown) return;
    const fail = (i <= 1 && ts >= EVS('crunch')) || (i === 2 && ts >= EVS('ring_on')), ok = i === 0 && ts >= 17.5 && ts < EVS('crunch');
    ctx.font = `800 32px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = fail ? 'rgba(255,255,255,.4)' : PAL.chalk; ctx.fillText(n + '  ' + txt, -580, y + 12);
    if (fail) { ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-584, y - 6); ctx.lineTo(-46, y - 6); ctx.stroke(); ctx.fillStyle = PAL.red; ctx.textAlign = 'right'; ctx.fillText('✕', -14, y + 12); }
    else if (ok) { ctx.fillStyle = '#6CFF9A'; ctx.textAlign = 'right'; ctx.fillText('✔', -14, y + 12); }
  });
  ctx.restore();
}
function phoneCloseup(ctx, ts, f) {                                                                   // insert: Dev's phone, MOM calling
  const a = EVS('phone_out'), ring = ts >= EVS('ring_on'), fum = ts >= EVS('fumble');
  ctx.fillStyle = '#0B1618'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 800, 50, W / 2, 800, 900); g.addColorStop(0, 'rgba(60,120,110,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rise = E.outQ(clamp((ts - a) / .5)), vib = ring ? Math.sin(f * 2.6) * 7 : (ts > a + .5 ? Math.sin(f * .8) * .6 : 0), cy = lerp(1500, 780, rise);
  ctx.save(); ctx.translate(W / 2 + vib, cy); ctx.rotate(-.05 + (ring ? Math.sin(f * 2.2) * .015 : 0));
  rr(ctx, -270, -470, 540, 940, 62, '#14161D', '#6A7086', 8); rr(ctx, -248, -445, 496, 890, 46, ring ? '#0F5A38' : '#10131B');
  if (!ring) { ctx.font = `800 40px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#9aa'; ctx.fillText('LOCKED', 0, -300); ctx.fillText('3:47', 0, -240); }
  else { ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `800 40px ${FONTS.sansX}`; ctx.fillText('INCOMING CALL', 0, -330); ctx.font = `800 120px ${FONTS.sansX}`; ctx.fillText('MOM', 0, -170);
    ctx.fillStyle = '#FF9FC4'; const hs = 1 + .08 * Math.sin(f * .5); ctx.save(); ctx.translate(0, 10); ctx.scale(hs * 3.2, hs * 3.2); ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-24, -6, -14, -26, 0, -12); ctx.bezierCurveTo(14, -26, 24, -6, 0, 12); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#E8403A'; ctx.beginPath(); ctx.arc(-120, 330, 62, 0, TAU); ctx.fill(); ctx.fillStyle = '#3DDC84'; ctx.beginPath(); ctx.arc(120, 330, 62, 0, TAU); ctx.fill(); }
  // silent switch on the left edge + Dev's thumb
  ctx.fillStyle = '#E8A33A'; rr(ctx, -286, -250, 22, 70, 8, '#E8A33A'); const thumbY = ts < EVS('ring_on') ? lerp(-60, -220, clamp((ts - 24.3) / .9)) : (fum ? -215 + Math.sin(f * .9) * 18 + clamp((ts - EVS('fumble')) / .5) * 40 : -215);
  blob(ctx, -360, thumbY + 40, 62, 40, PAL.skin, .4); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(-360, thumbY + 40, 62, 40, .4, 0, TAU); ctx.stroke();
  ctx.restore();
  rr(ctx, W / 2 - 330, 1290, 660, 700, 120, PAL.skin, PAL.ink, 7); for (let k = 0; k < 3; k++) rr(ctx, W / 2 + 232 + vib * .3, 880 + k * 104, 130, 100, 50, PAL.skin, PAL.ink, 6); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 6; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(W / 2 - 200 + k * 130, 1400); ctx.lineTo(W / 2 - 200 + k * 130, 1530); ctx.stroke(); } ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(W / 2 - 330, 1600, 660, 340);
  if (ring) { ringWaves(ctx, W / 2, 780, f, EVF('ring_on'), '#FFC247'); }
  vig(ctx, .55);
}
function wideZombieReaction(ctx, ts, f) { }

SHOT.hall = (ctx, lt, lf, len, t, f) => {
  buildZSim(); const ts = t / 60, E_ = EVS, pfD = pf3(f);
  const dx = devXAt(ts);
  // ---------- phone inserts (clarity: the phone is shown whenever it matters)
  const wideRing = ts >= E_('ring_on') && ts < E_('ring_on') + .55, answerCut = ts >= E_('answer') && ts < E_('answer') + .5;
  if (ts >= E_('phone_out') && ts < E_('answer') && !wideRing) { phoneCloseup(ctx, ts, f); marker(ctx, 'LOUD!', W / 2 + 280, 360, 130 * outB((f - EVF('ring_on')) / 8, 1.8), PAL.red, { rot: .1, a: ts >= E_('ring_on') && ts < E_('ring_on') + 2.4 ? 1 : 0 }); return; }
  // ---------- camera
  const ck = [[15.6, -840, -260, 1.4, E.ioC], [16.6, -850, -260, 1.45, E.ioC], [17.3, -770, -250, 1.5, E.ioC], [E_('crunch') - .5, dx + 120, -235, 1.55, E.ioC], [E_('crunch'), dx + 60, -200, 2.0, E.outQuint], [E_('crunch') + .5, dx + 140, -230, 1.0, E.ioC], [E_('turn_back'), dx + 140, -230, 1.0, E.ioC], [23.2, dx + 100, -250, 1.5, E.ioC],
    [E_('ring_on'), dx + 120, -230, 1.0, E.ioC], [28.4, dx + 60, -230, .9, E.ioC], [31.8, dx + 30, -230, .95, E.ioC], [E_('throw') + .25, -420, -240, .78, E.ioC], [E_('phone_land') + .2, -620, -230, .85, E.ioC], [33.6, -80, -240, .8, E.ioC], [34.4, 450, -240, 1.25, E.ioC], [35.2, -60, -230, .66, E.ioC],
    [37.0, -60, -230, .66, E.ioC], [37.7, 330, -230, .85, E.ioC], [E_('dive'), 640, -230, 1.05, E.ioC], [38.55, 760, -230, 1.2]];
  const keys = ck.map(k => [k[0], k[1], k[4]]), cx = kf(ts, keys), cy = kf(ts, ck.map(k => [k[0], k[2], k[4]])), cz = kf(ts, ck.map(k => [k[0], k[3], k[4]]));
  const imp = [[EVF('crunch'), 20], [EVF('answer'), 8], [EVF('throw'), 8], [EVF('phone_land'), 12], [EVF('glass'), 26], [EVF('crush'), 14], [EVF('charge'), 22], [EVF('dive') - 4, 30]];
  ctx.save(); hallCam(ctx, { x: cx, y: cy, z: cz, hand: 1.5 }, t, imp);
  hallSurround(ctx, f); longHall(ctx, f, { noEndWin: false });
  const brk = ts >= E_('glass'); hoseCabinet(ctx, f, brk, brk ? 0 : 1);
  // hazards
  const hot = ts >= 18.9 && ts < E_('crunch'); floorHazard(ctx, 'pizza', -505, f, hot && ts < E_('hz1') + .4); floorHazard(ctx, 'can', -415, f, hot && ts > E_('hz1') + .3 && ts < E_('hz2') + .4); if (ts < E_('crunch')) floorHazard(ctx, 'bag', -310, f, hot && ts > E_('hz2') + .3);
  // Dev's door opening
  const doorA = clamp((ts - E_('door_open')) / 1.2);
  if (ts < 18) { ctx.fillStyle = '#05080A'; ctx.fillRect(-965, -280, 130, 280); ctx.fillStyle = '#4A3326'; ctx.save(); ctx.translate(-835, 0); ctx.transform(Math.cos(doorA * 1.2), 0, 0, 1, 0, 0); ctx.fillRect(-130, -280, 130, 280); ctx.restore(); }
  // zombies (back lane), then Dev (front lane)
  for (let i = 0; i < ZH.length; i++) drawZ(ctx, f, i);
  // hose from the cabinet
  let handsHold = null;
  const hoseOn = ts >= E_('glass') + .25; const hoseEnd = ts < 37.4 ? [dx - 20, -20] : [Math.min(820, lerp(700, 860, clamp((ts - 37.5) / .7))), lerp(-20, -190, clamp((ts - 37.5) / .7))];
  if (hoseOn) hoseLine(ctx, [[524, -110], [524, 6], [lerp(524, hoseEnd[0], .5), 14 + Math.sin(f * .1) * 3], [hoseEnd[0], hoseEnd[1]]]);
  // phone in flight / on floor
  const th = E_('throw'), pl = E_('phone_land');
  if (ts >= th && ts < pl) { const u = (ts - th) / (pl - th), px = lerp(-300, -900, u), py = lerp(-190, -14, u) - Math.sin(u * Math.PI) * 220; phoneProp(ctx, px, py, u * 14, f, 1, 1.5); }
  else if (ts >= pl && ts < E_('crush')) { phoneProp(ctx, -900, -14, 1.3, f, 1, 1.5); ringWaves(ctx, -900, -40, f, EVF('phone_land')); }
  // Dev
  const walkT = ts - 17.2, tipoe = ts >= E_('door_clear') && ts < E_('crunch');
  let pose, dir = 1, y = 6, s = 1.06, face = devFace(f, { wide: true, eyes: 1.2, brow: -.8, mouth: devTalk(f) * .6, look: [.9, 0], sweat: ts > 18 });
  if (ts < E_('door_clear')) { const k = clamp((ts - 17.0) / .2); pose = basePose(pfD, { lean: .08, face: { ...face, mouth: 0, smile: -.3 }, hands: { L: [20, -100], R: [lerp(44, 66, k), -216] }, feet: { L: [-12, 0], R: [16, 0] } }); y = 6; if (ts < E_('door_open')) face.look = [.9, 0]; }
  else if (tipoe) { const ph = (dx + 880) / 120, over = (ts > E_('hz1') - .35 && ts < E_('hz1') + .35) || (ts > E_('hz2') - .3 && ts < E_('hz2') + .3);
    pose = walkPose(ph, { stride: 22, lift: over ? 58 : 30, bob: 2, lean: -.04, arms: .15, hands: { L: [-48, -150], R: [76, -150] }, face: { ...face, brow: -.9, mouth: devTalk(f) * .5, look: [ts > 18.8 ? .2 : .9, ts > 18.8 ? .9 : 0] } }); }
  else if (ts < E_('turn_back')) { const bal = Math.sin((ts - E_('crunch')) * 7) * .04; pose = basePose(pfD, { lean: -.02 + bal, hip: [0, -HIP_H + 6], feet: { L: [-14, 0], R: [34, 18 + 0] }, hands: { L: [-52, -170], R: [70, -164] }, face: { ...face, wide: true, eyes: 1.3, brow: -1, mouth: .2, look: [.9, .4] } }); pose.feet.R = [34, -34]; }
  else if (ts < E_('throw')) {                                                                    // reach for the phone, answer, stand frozen
    const pull = sstep(ts, E_('answer') - .2, E_('answer') + .2), fz = ts > E_('answer');
    pose = basePose(pfD, { lean: .06, hands: { L: [20, -100], R: [lerp(30, 54, pull), lerp(-100, -214, pull)] }, feet: { L: [-14, 0], R: [14, 0] }, face: { ...face, mouth: ts >= E_('answer') && ts < 29.4 ? devTalk(f) : (ts > 31.5 ? .3 : devTalk(f) * .4), brow: -1, wide: true, look: [ts > 29.4 ? .9 : 0, 0] } });
    if (ts >= E_('answer') && ts < E_('throw') + .01) { phoneProp(ctx, dx + 32 + 4, -176, .2, f, 0, 1.6); }
  }
  else if (ts < 32.5) { dir = -1; const sw = sstep(ts, th, th + .25); pose = basePose(pfD, { lean: lerp(-.1, .25, sw), hands: { L: [20, -100], R: [lerp(-30, 80, sw), lerp(-230, -80, sw)] }, face: { ...face, mouth: devTalk(f), look: [.9, 0] } }); }
  else if (ts < 34.4) { const run = (dx + 310) / 260; pose = walkPose(run, { stride: 78, lift: 42, bob: 9, lean: .38, arms: 1.7, face: { ...face, mouth: devTalk(f) * .8, wide: true, look: [.9, 0] } }); }
  else if (ts < 37.0) { const smash = sstep(ts, E_('glass') - .25, E_('glass')) * (1 - sstep(ts, E_('glass'), E_('glass') + .2)), stop = ts >= E_('turn_heads') - .4; dir = ts >= 35.6 ? -1 : 1;
    pose = basePose(pfD, { lean: .1 + smash * .25, tilt: .05, hands: { L: [lerp(30, 60, smash), -110 - smash * 40], R: [lerp(54, 90, smash), lerp(-150, -190, smash)] }, feet: { L: [-14, 0], R: [20, 0] }, face: { ...face, mouth: devTalk(f), wide: ts >= 35.6, eyes: ts >= 35.6 ? 1.3 : 1, brow: ts >= 35.6 ? -1 : .4, look: [ts >= 35.6 ? 1 : .9, 0] } }); }
  else if (ts < E_('dive')) { const run = (dx - 520) / 180, mv = ts < 37.5; pose = mv ? walkPose(run + 5, { stride: 70, lift: 38, bob: 8, lean: .4, arms: 1.6, face: { ...face, wide: true, mouth: 1, look: [.9, 0] } }) : basePose(pfD, { lean: .5, hands: { L: [70, -100], R: [80, -150] }, face: { ...face, mouth: 1, wide: true, brow: -1 } }); }
  else { const d = clamp((ts - E_('dive')) / .35); s = 1.06; const arcY = -Math.sin(d * Math.PI) * 60 - d * 40; y = 6 + arcY; pose = basePose(pfD, { lean: 1.2, tilt: .2, hip: [0, -HIP_H + 20], feet: { L: [-40, -50], R: [-70, -30] }, hands: { L: [110, -150], R: [120, -190] }, face: { ...face, mouth: 1, wide: true } }); }
  const dxx = ts < E_('dive') ? dx : lerp(705, 880, clamp((ts - E_('dive')) / .35)) , hoodie = false;
  const props = hoseOn && ts < 37.4 ? { holdHand: 1, holdProp: (c, a) => { c.save(); c.translate(a[0] + 4, a[1]); for (let r = 26; r > 8; r -= 7) { c.strokeStyle = r % 14 ? '#F2EFE4' : '#D9D5C4'; c.lineWidth = 7; c.beginPath(); c.arc(8, 6, r, 0, TAU); c.stroke(); } c.restore(); } } : {};
  person(ctx, { ...DEVH(dxx, y, pose, { dir, hoodie }), s, ...props }, pfD);
  // glass burst at cabinet
  if (ts >= E_('glass') && ts < E_('glass') + .6) { const d = (ts - E_('glass')) / .6; for (let i = 0; i < 18; i++) { const a = -Math.PI * hash(i) - .1, r = 280 * d * (.4 + hash(i * 3)); ctx.save(); ctx.translate(560 + Math.cos(a) * r - 80 * d, -200 + Math.sin(a) * r * .6 + d * d * 200); ctx.rotate(i + d * 6); ctx.globalAlpha = 1 - d; ctx.fillStyle = 'rgba(210,238,255,.95)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, 10); ctx.lineTo(-8, 7); ctx.fill(); ctx.restore(); } }
  if (ts >= E_('crunch') && ts < E_('crunch') + .5) { dust(ctx, -310, 10, f, EVF('crunch'), 6, 1.3); burst(ctx, -310, -12, 70, f, EVF('crunch'), PAL.amber, 10); }
  // dive: lead zombie lunges and misses
  ctx.restore(); vig(ctx, .5);
  // ---------- screen-space clarity layer: rules, sound words, call-outs
  rulesPanel(ctx, ts, f);
  if (wideRing) { sfxPop(ctx, 'RING RING!', W / 2, 520, f, EVF('ring_on'), PAL.amber, 130, 34); }
  sfxPop(ctx, 'CRUNCH!', W / 2 + 40, 640, f, EVF('crunch'), PAL.amber, 150, 52);
  if (ts >= E_('hz1') - .3 && ts < E_('hz1') + .6) marker(ctx, 'STEP OVER…', W / 2, 560, 62, PAL.chalk, { stroke: 14, a: sstep(ts, E_('hz1') - .3, E_('hz1') - .1) });
  if (ts >= E_('hz2') - .2 && ts < E_('hz2') + .6) marker(ctx, 'ANOTHER ONE…', W / 2, 560, 62, PAL.chalk, { stroke: 14, a: sstep(ts, E_('hz2') - .2, E_('hz2')) });
  if (ts >= E_('crunch') + .4 && ts < E_('turn_back')) { const k = (ts - E_('crunch') - .4) / 1.5; marker(ctx, 'FREEZE…', W / 2, 760, 88, PAL.red, { stroke: 18, a: 1 - clamp((k - .8) / .2), s: 1 + .03 * Math.sin(f * .5) }); }
  sfxPop(ctx, 'CLICK', W / 2 + 120, 660, f, EVF('answer'), PAL.chalk, 90, 24, .1);
  sfxPop(ctx, 'WHOOSH', W / 2 - 120, 640, f, EVF('throw'), PAL.chalk, 100, 34, -.12);
  sfxPop(ctx, 'CLATTER', W / 2 - 170, 760, f, EVF('phone_land'), PAL.amber, 100, 34, -.08);
  sfxPop(ctx, 'CRASH!', W / 2 + 120, 660, f, EVF('glass'), PAL.amber, 150, 40, .08);
  sfxPop(ctx, 'CRUNCH', W / 2 - 160, 650, f, EVF('crush'), PAL.red, 120, 40, -.06);
  if (ts >= E_('turn_heads') && ts < E_('charge')) { const a = sstep(ts, E_('turn_heads'), E_('turn_heads') + .3); marker(ctx, 'SILENCE…', W / 2, 560, 88, PAL.red, { stroke: 18, a }); }
  if (ts >= E_('charge') && ts < E_('dive') + .1) { sfxPop(ctx, 'RAAAH!', W / 2 - 80, 560, f, EVF('charge'), PAL.red, 150, 50, -.06); }
  if (ts >= E_('phone_land') + .1 && ts < E_('crush')) { const k = sstep(ts, E_('phone_land') + .1, E_('phone_land') + .35); ctx.save(); ctx.globalAlpha = k; rr(ctx, W / 2 - 300, 800, 600, 120, 26, 'rgba(255,159,196,.95)', PAL.ink, 5); marker(ctx, '“Honey? Are you there?”', W / 2, 878, 38, PAL.ink, { stroke: 0 }); ctx.restore(); }
  if (ts >= E_('dive') && ts < E_('dive') + .4) { const k = (ts - E_('dive')) / .4; if (k > .5) tint(ctx, '#fff', .3 * (k - .5) * 2); }
};

// ----------------------------------------------------------------------------------------------- SHOT: end card
SHOT.end2 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.28)'); g.addColorStop(1, 'rgba(255,59,48,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 640); ctx.scale(u, u); marker(ctx, 'PART 3', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 880); ctx.scale(k, k); marker(ctx, 'THE HOSE', 0, 0, 150, PAL.red, { stroke: 28 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.translate(W / 2, 1100); ctx.globalAlpha = p; marker(ctx, 'FOLLOW — TELL MOM HE\'S FINE', 0, 0, 52, PAL.amber, { stroke: 14 }); ctx.restore();
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * W, y = ((hash(i * 7.1) * H + f * (1 + hash(i) * 2)) % H); dot(ctx, x, y, 2 + hash(i * 2) * 3, 'rgba(255,255,255,.18)'); }
  vig(ctx, .6);
};
