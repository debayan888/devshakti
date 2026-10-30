// eps3.js - Episode 3 "The Hose": hose hang at 9, landlord slides after Dev, the water comes on, "here's your rent", jet into floor 7 (gym), Mira on the walkie.
'use strict';
const HOSE_TOP = FLOORY(10) - 120;
function devHip3(ts) { return kf(ts, [[.3, 1480], [1.2, 1900, E.inQ], [1.6, 1820, E.outQ], [2.2, 1835, E.ioC], [11.4, 1835], [17.4, 2650, E.inQ], [24.4, 2660], [26.6, 3130, E.inQ]]); }
function devX3(ts) {
  let x = ts < .3 ? -500 : ts < 1.2 ? lerp(-500, HANGX, E.outQ((ts - .3) / .9)) : HANGX;
  if (ts > 1.2) x += 80 * Math.exp(-(ts - 1.2) / 1.4) * Math.sin((ts - 1.2) * 4.5);
  if (ts > 22.4 && ts < 24.4) x -= 70 * Math.sin(clamp((ts - 22.4) / 2) * Math.PI);
  if (ts >= 24.4) x += 120 * E.inQ(clamp((ts - 24.4) / 2.2));
  return x;
}
function llHip3(ts) { return kf(ts, [[0, 1500], [8.6, 1500], [9.4, 1640, E.ioQ], [11.4, 1655], [17.4, 2420, E.inQ], [22.4, 2470]]); }
function curFloor(f) { const ts = f / 60; if (ts >= TL.shots.gym[0] / 60) return 7; if (ts >= 17.6 && ts < 19.6) return 8; const h = devHip3(ts); return h < 1730 ? 10 : h < 2290 ? 9 : h < 2850 ? 8 : 7; }
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end3[0]) return; const left = Math.max(0, 47 * 60 + 28 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
}
function hoseV(ctx, pts, thick = 0) {                                               // vertical hose, optional water bulge
  hoseLine(ctx, pts);
  if (thick) { const [x, y] = thick; blob(ctx, x, y, 22, 40, '#E6E1D2'); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 22, 40, 0, 0, TAU); ctx.stroke(); }
}
function nozzle(ctx, x, y, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); rr(ctx, -10, 0, 20, 46, 6, '#C9A24A', PAL.ink, 3); rr(ctx, -6, 40, 12, 16, 3, '#8a6a2a', PAL.ink, 2); ctx.restore(); }
function jet(ctx, x0, y0, x1, y1, f) {                                             // water jet with droplets
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(160,215,255,.55)'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(230,248,255,.9)'; ctx.lineWidth = 12; ctx.stroke();
  for (let i = 0; i < 40; i++) { const u = ((i / 40) + f * .03) % 1, px = lerp(x0, x1, u) + (hash(i + Math.floor(f / 2)) - .5) * 60 * u, py = lerp(y0, y1, u) + (hash(i * 3 + Math.floor(f / 2)) - .5) * 60 * u; dot(ctx, px, py, 4 + 6 * hash(i), 'rgba(220,245,255,.85)'); }
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- exterior (shots ext + ext2)
function extScene3(ctx, t, f) {
  const ts = t / 60, pf = pf3(f), dh = devHip3(ts), dx = devX3(ts), lh = llHip3(ts);
  const cam = CAMKEYS(ts, [[0, -520, 1500, 1.15, E.ioC], [1.4, -520, 1780, 1.05, E.ioC], [7.6, -520, 1800, 1.05, E.ioC], [8.6, -520, 1650, .82, E.ioC], [11.4, -520, 1720, .82, E.ioC], [17.4, -520, 2460, .95, E.ioC], [19.6, -520, 2480, .95, E.ioC], [21.4, -520, 2470, .9, E.ioC], [22.6, -520, 2560, .8, E.ioC], [23.6, -520, 3300, .62, E.ioC], [24.6, -520, 2720, .95, E.ioC], [26.6, -480, 3050, 1.0]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.8 }, t, [[60 * 1.2, 26], [60 * 22.4, 22], [60 * 26.5, 34]]);
  outside(ctx, f, cam.y); facade(ctx, f, 11, 6, {});
  // the hose: from the floor-10 hallway window down to Dev, then on to the nozzle
  const handY = dh - HIP_H - 120, nozY = dh + 420, water = ts >= EVS('water_in'), spray = ts >= EVS('spray'), held = ts >= EVS('grab_noz');
  const bul = water && ts < EVS('spray') ? [ROPEX, lerp(HOSE_TOP, nozY, (ts - EVS('water_in')) / (EVS('spray') - EVS('water_in')))] : 0;
  const topX = ROPEX, midX = dx + 30;
  if (ts < .3) hoseV(ctx, [[topX, HOSE_TOP], [dx + 20, dh - 150]]);
  else if (!held) { const wh = spray ? Math.sin(f * .5) * 120 : Math.sin(f * .05) * 10; hoseV(ctx, [[topX, HOSE_TOP], [midX, handY], [midX + wh * .3, dh + 150], [midX + wh, nozY]], bul); nozzle(ctx, midX + wh, nozY, Math.sin(f * .5) * (spray ? .9 : .05));
    if (spray) jet(ctx, midX + wh, nozY + 40, midX + wh * 2.2 + Math.sin(f * .4) * 260, nozY + 600, f); }
  else { hoseV(ctx, [[topX, HOSE_TOP], [midX, handY], [midX + 40, dh + 120], [dx + 70, dh - 120]]); }
  // the landlord: leans out of the window, climbs on, slides down, gets blasted off
  const blasted = ts >= EVS('blast');
  if (!blasted) {
    if (ts < EVS('ll_out')) { const p = basePose(pf5(f), { lean: .7, tilt: .3, hands: { L: [60, -150], R: [70, -170] }, face: { look: [.8, .6], mouth: .9 } }); ctx.save(); ctx.beginPath(); ctx.rect(-700, FLOORY(10) - 560, 2000, 560); ctx.clip(); landlord(ctx, -500, FLOORY(10), f, p, { dir: -1 }); ctx.restore(); }
    else { const k = clamp((ts - EVS('ll_out')) / .8), lx = lerp(-500, HANGX - 4, k), hp = hangPose(lh, { face: { look: [0, .9], mouth: .9 }, tilt: .3 }); if (ts > 11.4) { const lxr = ROPEX - (HANGX - 4); hp.hands = { L: [lxr - 3, -HIP_H - 175], R: [lxr + 3, -HIP_H - 135] }; } landlord(ctx, lx, lh + HIP_H, f, hp, { noClip: true }); }
  } else {
    const u = (ts - EVS('blast')), fx = HANGX - 40 - u * 90, fy = lh + 980 * u * u;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-u * 1.6); landlord(ctx, 0, HIP_H, f, basePose(pf5(f), { lean: .2, hands: { L: [60, -230], R: [-40, -220] }, feet: { L: [-40, -20], R: [40, -30] }, face: { look: [0, 0], mouth: 1, eyes: 1.2 } }), { noClip: true }); ctx.restore();
  }
  // Dev
  let face = devFace(f, { wide: true, eyes: 1.2, brow: -1, mouth: devTalk(f), look: [.4, -.6], sweat: true });
  if (ts >= 8.4 && ts < 17.6) face.look = [0, -.95];
  if (held) face = { ...face, brow: .9, eyes: .8, wide: false, look: [0, -.9] };
  if (ts >= 24.4) face = { ...face, wide: true, brow: -1, eyes: 1.3, look: [.9, .3], mouth: Math.max(devTalk(f), .6) };
  let pose;
  if (ts < 1.2) { const u = clamp((ts - .3) / .9); pose = basePose(pf, { lean: lerp(.4, -.1, u), hands: { L: [40, -260], R: [50, -270] }, feet: { L: [30, -40 * u], R: [60, -20] }, face }); }
  else { pose = hangPose(dh, { face, tilt: -.3 }); const lx = midX - dx; if (ts >= 11.4 && ts < 17.4) pose.hands = { L: [lx - 3, -HIP_H - 170], R: [lx + 3, -HIP_H - 130] }; else pose.hands = { L: [lx - 3, -HIP_H - 150], R: [lx + 3, -HIP_H - 120] };
    if (held) { pose.hands.R = [70, -HIP_H - 120 + 20]; pose.lean = -.1; } }
  person(ctx, DEVH(dx, dh + HIP_H, pose, { hoodie: false }), pf);
  if (ts >= 11.4 && ts < 17.4) for (let i = 0; i < 4; i++) { const u = ((f * .04 + i * .25) % 1); blob(ctx, midX + (hash(i) - .5) * 30, handY - u * 90, 10 + u * 22, 10 + u * 22, '#d8d8d8', 0, (1 - u) * .5); }
  if (held && ts < 23.0 && ts > 21.6) { jet(ctx, dx + 70, dh - 160, HANGX + 10, lh - 140, f); }
  if (held && ts >= 23.0) { jet(ctx, dx + 70, dh - 120, dx - 520, dh + 460, f); }
  ctx.restore(); vig(ctx, .5);
  if (ts < 2.6) { ctx.save(); ctx.globalAlpha = 1 - sstep(ts, 2.2, 2.6); marker(ctx, 'PREVIOUSLY…', W / 2 + 110, 330 + 120, 62, PAL.chalk, { stroke: 14 }); ctx.restore(); }
  sfxPop(ctx, 'YANK!', W / 2 + 150, 620, f, Math.round(60 * 1.2), PAL.amber, 130, 34, .08);
  if (ts >= 11.6 && ts < 15.5) sfxPop(ctx, 'HOT! HOT!', W / 2 + 140, 700, f, Math.round(60 * 11.6) + Math.floor((f - 696) / 90) * 90, PAL.red, 90, 40, .06);
  sfxPop(ctx, 'FWOOSH!', W / 2 + 120, 640, f, EVF('spray'), '#9FD8FF', 130, 40, .06);
  sfxPop(ctx, 'SPLOOSH!', W / 2 - 60, 520, f, EVF('blast'), '#9FD8FF', 150, 46, -.08);
  if (false) { const k = (ts - EVS('twinkle')) / .6, s = Math.sin(k * Math.PI) * 60; ctx.save(); ctx.translate(200, 480); ctx.rotate(k * 2); ctx.fillStyle = '#fff'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .25 : s, a = i / 8 * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); marker(ctx, 'DING', 300, 470, 50, PAL.chalk, { a: 1 - k, stroke: 10 }); }
  
}
SHOT.ext = (ctx, lt, lf, len, t, f) => extScene3(ctx, t, f);
SHOT.ext2 = (ctx, lt, lf, len, t, f) => extScene3(ctx, t, f);
// ----------------------------------------------------------------------------------------------- valve insert: a zombie stumbles into the water valve
SHOT.valve = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, spin = EVS('valve_spin'), ang = ts < spin ? 0 : (1 - Math.exp(-(ts - spin) * 2.2)) * 9;
  ctx.save(); applyCam(ctx, { x: 0, y: 0, z: 1, hand: 1.5 }, t, [[EVF('valve_spin'), 14]]); ctx.translate(-W / 2, -H * .46);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16292C'); g.addColorStop(1, '#244A4E'); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
  ctx.fillStyle = '#7A1712'; ctx.fillRect(W / 2 - 40, -100, 80, 920); rr(ctx, W / 2 - 330, 1020, 660, 600, 20, '#B8261E', PAL.ink, 6);
  for (let r = 200; r > 60; r -= 26) { ctx.strokeStyle = r % 52 ? '#F2EFE4' : '#D9D5C4'; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(W / 2, 1320, r, 0, TAU); ctx.stroke(); }
  ctx.save(); ctx.translate(W / 2, 820); ctx.rotate(ang); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 40; ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#D8322A'; ctx.lineWidth = 30; ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(ctx, 0, 0, Math.cos(a) * 190, Math.sin(a) * 190, 22, '#D8322A'); } blob(ctx, 0, 0, 44, 44, '#C9A24A'); ctx.restore();
  rr(ctx, W / 2 - 150, 560, 300, 80, 14, '#F4F1E6', PAL.ink, 5); marker(ctx, ts >= spin + .3 ? 'WATER: ON' : 'WATER: OFF', W / 2, 618, 46, ts >= spin + .3 ? PAL.red : PAL.ink, { stroke: .01 });
  const zx = ts < spin ? lerp(W + 300, W / 2 + 330, E.outQ(clamp((ts - 17.6) / (spin - 17.6)))) : W / 2 + 330 + Math.exp(-(ts - spin) * 3) * 20;
  person(ctx, { x: zx, y: 1500, s: 2.4, dir: -1, kind: 'z', seed: 15, var: 4, pose: basePose(pf5(f), { lean: -.35, tilt: .6, hands: { L: [-60, -150], R: [80, -200] }, face: { look: [.9, 0], mouth: .9, eyes: .7 } }) }, pf5(f));
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'SQUEAK!', W / 2 - 220, 380, f, EVF('valve_spin'), PAL.chalk, 110, 40, -.08);
  sfxPop(ctx, 'GLUG GLUG', W / 2 + 180, 470, f, EVF('valve_spin') + 40, '#9FD8FF', 90, 40, .08);
};
// ----------------------------------------------------------------------------------------------- gym on floor 7: power on, nobody here, a message on the mirror
function treadmill(ctx, x, f, speed = 1) {
  rr(ctx, x - 120, -46, 240, 46, 10, '#1C1F28', PAL.ink, 4); ctx.fillStyle = '#2E323E'; ctx.fillRect(x - 112, -50, 224, 8);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 4; const off = (f * 9 * speed) % 40; for (let i = -6; i < 7; i++) { const lx = x + i * 40 - off; if (lx > x - 110 && lx < x + 110) { ctx.beginPath(); ctx.moveTo(lx, -48); ctx.lineTo(lx + 16, -48); ctx.stroke(); } }
  line(ctx, x + 108, -46, x + 128, -200, 12, '#3A3F4E'); rr(ctx, x + 96, -232, 70, 40, 8, '#14161D', '#5A5F70', 3); ctx.fillStyle = speed > .1 ? '#6CFF9A' : '#333'; ctx.font = `800 16px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillText(speed > .1 ? '6.0' : '0.0', x + 131, -206);
  if (speed > .1) glow(ctx, x + 131, -212, 90, 'rgba(108,255,154,A)', .25);
}
function walkie(ctx, x, y, f, on, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rr(ctx, -16, -40, 32, 60, 6, '#1E2A1E', '#5A6A5A', 3); line(ctx, 8, -40, 8, -78, 5, '#333'); dot(ctx, -6, -30, 4, on && (f % 20) < 10 ? PAL.red : '#400'); for (let i = 0; i < 3; i++) line(ctx, -9, -14 + i * 9, 9, -14 + i * 9, 2, '#556'); ctx.restore(); }
function mirrorMsg(ctx, f, a) {                                                      // scrawled warning on the gym mirror
  rr(ctx, -30, -470, 250, 210, 6, 'rgba(170,200,230,.10)', 'rgba(255,255,255,.3)', 4); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(0, -470); ctx.lineTo(60, -470); ctx.lineTo(-20, -260); ctx.lineTo(-30, -260); ctx.fill();
  if (a <= 0) return; const b = Math.floor(f / 5); ctx.save(); ctx.globalAlpha = a; ctx.font = `800 40px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#C8231C';
  [["DON'T", -410], ['TRUST THE', -360], ['LOBBY', -305]].forEach(([w, y], i) => { ctx.save(); ctx.translate(95 + jit(i, b, 1.2), y); ctx.rotate(-.06 + i * .03); ctx.fillText(w, 0, 0); ctx.restore(); });
  ctx.fillRect(60, -298, 4, 26); ctx.fillRect(120, -298, 4, 18); ctx.restore();
}
SHOT.gym = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, pf = pf3(f), E_ = EVS, lightsOn = ts >= E_('lights') ? (ts < E_('lights') + .5 ? (hash(Math.floor(f / 3)) > .45 ? 1 : 0) : 1) : 0;
  const cam = CAMKEYS(ts, [[26.6, -250, -230, 1.3, E.ioC], [29.4, -250, -230, 1.3, E.ioC], [30.4, 20, -240, .98, E.ioC], [32.6, 20, -240, .98, E.ioC], [33.3, 90, -340, 1.7, E.ioC], [34.9, 90, -340, 1.75, E.ioC], [35.6, -320, -230, 1.45, E.ioC], [38.6, -380, -240, 1.7, E.ioC], [39.9, -400, -240, 1.9]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, [[EVF('slam7'), 30], [EVF('land7'), 16], [EVF('bang'), 18]]);
  adjacentFloors(ctx, f, 13, .55); roomShell(ctx, 13, f, { wall: '#26262E', la: lightsOn ? .14 : 0 }); brokenWindow(ctx, -420, 0, f);
  mirrorMsg(ctx, f, lightsOn ? 1 : 0);
  treadmill(ctx, -40, f, 1);                                                                     // running by itself: nobody on it
  // glass studio on the right: the zombies are locked inside
  const bang = ts >= E_('bang'), hit = bang ? Math.exp(-((f - EVF('bang')) % 34) / 6) : 0;
  ctx.fillStyle = 'rgba(10,14,20,.75)'; ctx.fillRect(250, -520, 290, 520);
  for (let i = 0; i < 3; i++) { const zx = 300 + i * 85, press = bang ? .5 : 0; person(ctx, { x: zx + (bang ? -8 * hit : Math.sin(f * .02 + i) * 14), y: 0, s: .9, dir: -1, kind: 'z', seed: 50 + i, var: (i * 2 + 1) % 5,
      pose: basePose(pf5(f + i * 7), { lean: .15 + press * .3, tilt: .3 + Math.sin(f * .05 + i) * .1, hands: bang ? { L: [90 + hit * 6, -200 - i * 6], R: [84 + hit * 6, -150] } : { L: [30, -100], R: [24, -96] }, face: { look: [.9, 0], mouth: bang ? 1 : null } }) }, pf5(f + i * 7)); }
  ctx.fillStyle = 'rgba(150,200,240,.16)'; ctx.fillRect(246, -520, 294, 520); ctx.strokeStyle = 'rgba(220,240,255,.5)'; ctx.lineWidth = 6; ctx.strokeRect(246, -520, 294, 520); line(ctx, 393, -520, 393, 0, 6, 'rgba(220,240,255,.4)');
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(270, -520); ctx.lineTo(320, -520); ctx.lineTo(260, -300); ctx.lineTo(250, -300); ctx.fill();
  rr(ctx, 355, -90, 76, 70, 6, '#6A6F80', PAL.ink, 3); line(ctx, 355, -55, 431, -55, 8, '#9AA0B0');                               // chain + padlock on the glass door
  ctx.strokeStyle = '#9AA0B0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(393, -96, 18, Math.PI, TAU); ctx.stroke();
  // Dev: tumbles in through the window, gets up, checks the empty treadmill, reads the mirror, finds the walkie
  let x, y = 0, rot = 0, pose; const face = devFace(f, { wide: true, eyes: 1.15, brow: -.8, mouth: devTalk(f), look: [.9, 0], sweat: true });
  if (ts < E_('land7')) { const u = clamp((ts - 26.6) / .4); x = lerp(-270, -260, u); y = lerp(-320, 0, u) - Math.sin(u * Math.PI) * 60; rot = lerp(-1, -1.4, u); pose = basePose(pf, { lean: .3, hands: { L: [60, -170], R: [50, -200] }, feet: { L: [20, -20], R: [50, -40] }, face }); }
  else {
    const up = sstep(ts, 28.2, 29.0), walk = sstep(ts, 30.2, 31.0), back = sstep(ts, E_('bang'), E_('bang') + .3), toW = sstep(ts, 35.6, 36.2);
    x = lerp(-260, -120, walk) - 60 * back - 200 * toW; rot = lerp(-1.4, 0, up);
    const pick = sstep(ts, E_('pickup'), E_('pickup') + .4), ear = sstep(ts, E_('pickup') + .4, E_('pickup') + .8), moving = (ts > 30.2 && ts < 31.0) || (ts > 35.6 && ts < 36.2);
    const lk = ts > E_('look') ? [0, 0] : ts > E_('walkie') ? [-.9, .5] : ts > E_('mirror_t') - .3 ? [.3, -.9] : ts > E_('bang') ? [.9, 0] : [.9, .2];
    const fc = { ...face, look: lk, brow: ts > E_('look') ? -.3 : -.8, wide: ts <= E_('look') || true };
    pose = moving ? walkPose(x / 184, { face: fc }) : basePose(pf, { lean: .5 * pick * (1 - ear) - .12 * back, hands: { L: [20, -100], R: [lerp(30, 80, pick) - ear * 40, lerp(-100, -20, pick * (1 - ear)) - ear * 160] }, face: fc });
  }
  const dir = ts > 35.5 && ts < 36.3 ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const props = ts >= E_('pickup') + .3 ? { holdHand: 1, holdProp: (c, a) => walkie(c, a[0] + 6, a[1] + 10, f, true, -.2) } : {}; person(ctx, { ...DEVH(0, 0, pose, { dir, hoodie: false }), ...props }, pf); ctx.restore();
  if (ts < E_('pickup') + .3) walkie(ctx, -380, -4, f, ts >= E_('walkie'), 1.2);
  if (ts >= E_('walkie') && ts < E_('pickup') + .3) ringWaves(ctx, -380, -30, f, EVF('walkie'), '#FFD27A');
  dust(ctx, -260, -10, f, EVF('land7'), 6, 1.4);
  if (!lightsOn) { ctx.fillStyle = 'rgba(4,6,12,.55)'; ctx.fillRect(-RW, -FH, 2 * RW, FH + SLAB); }
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'CRASH!', W / 2 - 20, 560, f, EVF('slam7'), PAL.amber, 150, 36);
  sfxPop(ctx, 'FLICK', W / 2 + 200, 520, f, EVF('lights'), PAL.chalk, 90, 26, .06);
  sfxPop(ctx, 'BANG! BANG!', W / 2 + 180, 600, f, EVF('bang'), PAL.red, 110, 50, .06);
  sfxPop(ctx, 'KSSHH…', W / 2 - 180, 640, f, EVF('walkie'), '#FFD27A', 100, 40, -.06);
  if (ts > 31.4 && ts < 32.9) { const k = outB((ts - 31.4) / .25, 1.5); ctx.save(); ctx.translate(W / 2 + 230, 470); ctx.scale(k, k); marker(ctx, 'LOCKED IN', 0, 0, 64, '#B8E986', { stroke: 14 }); ctx.restore(); }
};
// ----------------------------------------------------------------------------------------------- end card
SHOT.end3 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.28)'); g.addColorStop(1, 'rgba(255,59,48,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 600); ctx.scale(u, u); marker(ctx, 'PART 4', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 840); ctx.scale(k, k); marker(ctx, 'WHO IS MIRA?', 0, 0, 130, PAL.red, { stroke: 26 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'LAST VAN AT SUNRISE  •  46 MIN LEFT', W / 2, 1010, 44, PAL.amber, { stroke: 12 }); marker(ctx, 'FOLLOW AND DECIDE WHO TO TRUST', W / 2, 1090, 40, '#B8E986', { stroke: 12 }); ctx.restore();
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * W, y = ((hash(i * 7.1) * H + f * (1 + hash(i) * 2)) % H); dot(ctx, x, y, 2 + hash(i * 2) * 3, 'rgba(255,255,255,.18)'); }
  vig(ctx, .6);
};
