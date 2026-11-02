// eps2b.js - Episode 2 (redo) "Floor 10": a reason to go down (sunrise rescue vans) and a recurring villain (the landlord).
// Reuses helpers from eps2.js (sets, hose, phone, sfxPop) and overrides the shots.
'use strict';
const LL_CLIP = (c, a) => { c.save(); c.translate(a[0] + 6, a[1] - 10); c.rotate(-.15); rr(c, -30, -40, 60, 78, 6, '#C9A06A', PAL.ink, 3); rr(c, -24, -32, 48, 64, 3, '#F4F1E6'); rr(c, -10, -46, 20, 12, 3, '#888', PAL.ink, 2);
  c.font = `800 13px ${FONTS.sansX}`; c.textAlign = 'center'; c.fillStyle = PAL.red; c.fillText('RENT', 0, -10); c.fillText('DUE', 0, 6); c.restore(); };
function landlord(ctx, x, y, f, pose, o = {}) {                                  // the recurring villain: tie zombie with a RENT DUE clipboard
  return person(ctx, { x, y, s: o.s || 1, dir: o.dir || 1, kind: 'z', var: 1, seed: 90, pose, holdHand: 1, holdProp: o.noClip ? null : LL_CLIP }, pf5(f));
}
function walkLL(x, f, o = {}) { return walkPose(x / (o.run ? 280 : 120), { stride: o.run ? 66 : 26, lift: o.run ? 36 : 10, bob: o.run ? 8 : 3, lean: o.run ? .45 : .22, tilt: .35, hands: { L: [86, -176], R: o.clipUp ? [60, -250] : [70, -150] }, face: { look: [.8, 0], mouth: o.mouth == null ? null : o.mouth } }); }
const SUNRISE0 = () => EVS('clock');
function extraUI(ctx, f) {                                                        // sunrise countdown under the floor chip
  const ts = f / 60; if (ts < EVS('clock') || f >= TL.shots.end2[0]) return;
  const d = f - EVF('clock'), u = clamp(d / 10), left = Math.max(0, 48 * 60 - Math.floor(ts - EVS('clock')));
  ctx.save(); ctx.translate(64, 318); const sc = d < 10 ? lerp(1.8, 1, E.outQ(u)) : 1; ctx.scale(sc, sc); ctx.globalAlpha = clamp(d / 4);
  rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
}
// ----------------------------------------------------------------------------------------------- room: apartment 1004
function wallTV(ctx, f, on) {
  const x = 30, y = -450, w = 240, h = 150; rr(ctx, x - 8, y - 8, w + 16, h + 16, 8, '#0A0B10', '#2A2D38', 3);
  if (on > 0) { ctx.save(); ctx.globalAlpha = on; ctx.fillStyle = '#1C4E9C'; ctx.fillRect(x, y, w, h); ctx.fillStyle = PAL.red; ctx.fillRect(x, y + h - 40, w, 22); ctx.fillStyle = '#fff'; ctx.font = `800 13px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillText('BREAKING: RESCUE VANS', x + 8, y + h - 24);
    blob(ctx, x + 70, y + 70, 22, 22, PAL.skin); rr(ctx, x + 46, y + 92, 50, 30, 8, '#2E3342'); ctx.restore(); glow(ctx, x + w / 2, y + h / 2, 380, 'rgba(110,160,255,A)', .2 * on); }
  else { ctx.fillStyle = '#05060A'; ctx.fillRect(x, y, w, h); }
}
function apt10b(ctx, f, o = {}) {
  roomShell(ctx, 13, f, { wall: '#2A2440', lx: 0, la: .08 }); brokenWindow(ctx, -420, 0, f); wallTV(ctx, f, o.tv || 0);
  door(ctx, 400, 0, f, { shake: o.doorShake || 0 }); rr(ctx, -300, -60, 150, 60, 6, '#E8E0C8', PAL.ink, 3); rr(ctx, -290, -50, 130, 12, 3, '#C9323A');
  if (o.couch !== false) couch(ctx, 0, 0, o.squash || 0);
}
// ----------------------------------------------------------------------------------------------- CRASH (lands on the couch)
SHOT.crash = (ctx, lt, lf, len, t, f) => {
  const pf = pf3(lf), land = EVF('land') - TL.shots.crash[0];
  ctx.save(); applyCam(ctx, { x: -60, y: -230, z: lerp(1.2, 1.32, lt / len), hand: 2 }, t, [[0, 26], [land, 22]]);
  const squash = lf >= land ? Math.exp(-(lf - land) / 12) * Math.sin((lf - land) * .6) : 0;
  adjacentFloors(ctx, f, 13, .55); apt10b(ctx, f, { squash });
  for (let i = 0; i < 26; i++) { const u = clamp(lf / 60), a = -.8 + hash(i * 3) * 1.6, sp = 160 + hash(i * 7) * 380; ctx.save(); ctx.translate(-270 + Math.cos(a) * sp * u * 1.2, -300 + Math.sin(a) * sp * u * .5 + u * u * 520); ctx.rotate(i + lf * .2); ctx.globalAlpha = 1 - u * .8; ctx.fillStyle = 'rgba(210,238,255,.9)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, 10); ctx.lineTo(-8, 7); ctx.fill(); ctx.restore(); }
  if (lf < land) { const u = clamp(lf / land), x = lerp(-300, 140, E.outQ(u)), y = lerp(-330, -126, u) - Math.sin(u * Math.PI) * 120, rot = lerp(-.9, 4.95, u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); person(ctx, DEVH(0, 104, basePose(pf, { lean: .1, hands: { L: [60, -150], R: [40, -190] }, feet: { L: [30, -30], R: [60, -60] }, face: devFace(f, { wide: true, eyes: 1.2, brow: -1, mouth: .9 }) }), { hoodie: false }), pf); ctx.restore(); }
  else {
    const d = lf - land, sit = sstep(d, 70, 100), thumbs = sstep(d, 96, 110) * (1 - sstep(d, 150, 170));
    const lean = lerp(-1.45, .1, sit), hipY = lerp(-132 + squash * 6, -126, sit), dazed = d < 70;
    const face = { look: [.6, 0], eyes: dazed ? .35 : 1, brow: dazed ? .2 : -.4, mouth: dazed ? .3 : devTalk(f) * .9, smile: .8 };
    const pose = { hip: [0, -104], lean, tilt: dazed ? .1 : 0, feet: { L: [lerp(100, 60, sit), -98 + (hipY + 132)], R: [lerp(108, 74, sit), -102 + (hipY + 132)] }, hands: { L: [lerp(30, 60, sit), lerp(-110, -90, sit)], R: [lerp(20, 62, sit) + thumbs * 40, lerp(-110, -100, sit) - thumbs * 120] }, face };
    person(ctx, DEVH(140, hipY + 104, pose, { hoodie: false }), pf);
    if (dazed) for (let i = 0; i < 3; i++) { const a = f * .12 + i * 2.1; ctx.save(); ctx.translate(16 + Math.cos(a) * 54, -178 + Math.sin(a) * 14); ctx.rotate(f * .1); ctx.fillStyle = PAL.amber; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 16, an = k / 10 * TAU; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.fill(); ctx.restore(); }
    dust(ctx, 140, -120, lf, land, 8, 1.6); burst(ctx, 140, -130, 120, lf, land, PAL.chalk, 12);
  }
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'CRASH!', W / 2 + 30, 560, lf, 0, PAL.amber, 150, 40); sfxPop(ctx, 'THUD', W / 2 + 130, 700, lf, land, PAL.chalk, 110, 34, .1);
  if (lf < 3) tint(ctx, '#fff', .5 * (1 - lf / 3));
};
// ----------------------------------------------------------------------------------------------- TV: the emergency broadcast (the goal)
function tvCloseup(ctx, f) {
  const l = LN('tv'), mouth = (f >= l.t0 && f < l.t0 + l.n) ? Math.min(1, (ENV.tv[f - l.t0] || 0) * 1.1) : 0, w = i => l.words[i].a;
  ctx.fillStyle = '#07080C'; ctx.fillRect(0, 0, W, H);
  const sx = 70, sy = 220, sw = W - 140, sh = 1000; rr(ctx, sx - 30, sy - 30, sw + 60, sh + 60, 40, '#111318', '#2A2D38', 6);
  ctx.save(); ctx.beginPath(); rrect(ctx, sx, sy, sw, sh, 18); ctx.clip();
  const g = ctx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#16367A'); g.addColorStop(1, '#0B1A3C'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(sx, sy + 80 + i * 120, sw, 40); }
  // inset map: city + rescue van
  rr(ctx, sx + 560, sy + 90, 340, 250, 14, '#0E1C38', 'rgba(255,255,255,.25)', 3); ctx.fillStyle = '#22355E'; for (let i = 0; i < 6; i++) ctx.fillRect(sx + 580 + i * 52, sy + 330 - 60 - hash(i) * 120, 40, 60 + hash(i) * 120);
  const vx = sx + 600 + ((f * 1.2) % 230); rr(ctx, vx, sy + 280, 90, 44, 8, '#F4F1E6', PAL.ink, 3); ctx.fillStyle = PAL.red; ctx.fillRect(vx + 38, sy + 288, 10, 28); ctx.fillRect(vx + 29, sy + 297, 28, 10); blob(ctx, vx + 20, sy + 326, 10, 10, '#111'); blob(ctx, vx + 70, sy + 326, 10, 10, '#111');
  // anchor at the desk
  const anchorPose = basePose(pf3(f), { lean: .02, hands: { L: [40, -120], R: [50, -116] }, face: { look: [.1, 0], mouth, eyes: 1, brow: .1, smile: 0 } });
  const hd = person(ctx, { x: sx + 300, y: sy + 760, s: 2.1, dir: 1, kind: 'dev', seed: 77, hoodie: false, pose: anchorPose }, pf3(f));
  blob(ctx, hd.head[0] - 6, hd.head[1] - 60, 92, 40, '#2B1D14', -.1);
  rr(ctx, sx + 40, sy + 640, sw - 80, 360, 20, '#3A2B20', PAL.ink, 4);
  // lower third (synced to the words)
  const L1 = f >= w(2) ? 'RESCUE VANS AT STREET LEVEL' : 'EMERGENCY BROADCAST', L2 = f >= w(11) ? 'LAST PICKUP: SUNRISE' : 'STAY INDOORS';
  ctx.fillStyle = PAL.red; ctx.fillRect(sx, sy + 690, 300, 70); marker(ctx, 'BREAKING', sx + 150, sy + 740, 44, '#fff', { stroke: .01 });
  ctx.fillStyle = '#F4F1E6'; ctx.fillRect(sx, sy + 760, sw, 100); marker(ctx, L1, sx + sw / 2, sy + 826, 44, PAL.ink, { stroke: .01 });
  ctx.fillStyle = PAL.amber; ctx.fillRect(sx, sy + 860, sw, 74); marker(ctx, L2, sx + sw / 2, sy + 912, 42, PAL.ink, { stroke: .01, s: f >= w(11) && f < w(11) + 10 ? 1 + .1 * Math.sin((f - w(11)) / 10 * Math.PI) : 1 });
  ctx.fillStyle = '#0A0C14'; ctx.fillRect(sx, sy + 934, sw, 66); ctx.font = `800 34px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; const tick = 'AVOID STAIRWELLS  •  DO NOT USE ELEVATORS  •  RESCUE VANS LEAVE AT SUNRISE  •  '; ctx.fillText(tick + tick, sx + 20 - (f * 4) % 1500, sy + 980);
  for (let y = sy; y < sy + sh; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(sx, y, sw, 2); }
  ctx.restore(); vig(ctx, .6);
}
SHOT.tv = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, pf = pf3(lf);
  if (ts >= EVS('tv_in') && ts < EVS('tv_out')) { tvCloseup(ctx, f); return; }
  const on = ts >= EVS('remote') ? sstep(ts, EVS('remote'), EVS('remote') + .15) : 0, after = ts >= EVS('tv_out');
  ctx.save(); applyCam(ctx, { x: after ? lerp(60, 120, sstep(ts, 14.3, 15.5)) : -20, y: -260, z: after ? lerp(1.25, 1.6, sstep(ts, 15.5, 18.2)) : 1.3, hand: 1.6 }, t, [[EVF('remote'), 6]]);
  adjacentFloors(ctx, f, 13, .55); apt10b(ctx, f, { tv: on });
  const stand = after ? sstep(ts, 14.4, 14.9) : 0, look = after && ts > 17.2 ? [.2, .9] : [.3, -.8];
  const face = devFace(f, { wide: after, eyes: after ? 1.15 : 1, brow: after ? -.9 : .1, mouth: devTalk(f), look, sweat: ts > 16.8, smile: .2 });
  let pose; if (!after) { pose = { hip: [0, -104], lean: -.05, tilt: -.25, feet: { L: [60, -98], R: [74, -102] }, hands: { L: [60, -90], R: [62, -100] }, face }; person(ctx, DEVH(140, -126 + 104 + (lf > 18 && lf < 24 ? -6 : 0), pose, { hoodie: false }), pf); }
  else { pose = basePose(pf, { lean: lerp(.1, .05, stand), tilt: -.2 + (ts > 17.2 ? .45 : 0), face, hands: { L: [24, -110], R: [30, -104] } }); person(ctx, DEVH(lerp(140, 200, stand), lerp(-22, 0, stand), pose, { hoodie: false }), pf); }
  if (lf >= EVF('remote') - TL.shots.tv[0] && !after) { const d = lf - (EVF('remote') - TL.shots.tv[0]); ctx.save(); ctx.translate(200, -150 - Math.min(40, d * 4)); ctx.rotate(-.4 + d * .05); rr(ctx, -12, -30, 24, 60, 6, '#222', '#555', 2); dot(ctx, 0, -18, 4, PAL.red); ctx.restore(); }
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'CLICK', W / 2 + 160, 620, f, EVF('remote'), PAL.chalk, 100, 26, .1);
  if (after && ts > 17.25) { const k = sstep(ts, 17.25, 17.5); ctx.save(); ctx.globalAlpha = k; marker(ctx, '10 FLOORS ↓', W / 2, 600, 96, PAL.red, { stroke: 18 }); ctx.restore(); }
};
// ----------------------------------------------------------------------------------------------- LANDLORD climbs in
SHOT.landlord = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, pf = pf3(lf), E_ = EVS;
  const cam = CAMKEYS(ts, [[18.3, 40, -260, 1.3, E.ioC], [18.7, -200, -280, 1.6, E.ioC], [20.6, -150, -260, 1.45, E.ioC], [21.2, -40, -250, 1.25, E.ioC], [26.7, -40, -250, 1.25]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.6 }, t, [[EVF('ll_land'), 16], [EVF('door_slam'), 18]]);
  adjacentFloors(ctx, f, 13, .55);
  const slam = ts >= E_('door_slam'), bang = slam && ((f - EVF('door_slam')) % 26 < 5);
  apt10b(ctx, f, { tv: 1, couch: false, doorShake: slam ? (bang ? 8 : 0) : 0 });
  // landlord: hands on the sill, head rises, climbs over, drops in
  const hx = -270, rise = sstep(ts, E_('ll_hands') + .2, E_('ll_in') - .4), over = sstep(ts, E_('ll_in') - .4, E_('ll_in')), drop = sstep(ts, E_('ll_in'), E_('ll_land'));
  let lx = hx, ly, lpose;
  const sniff = ts > E_('ll_land') + .3 ? Math.sin(f * .25) * .15 : 0, walkX = ts > E_('ll_land') + .3 ? Math.min(-40, -270 + (ts - E_('ll_land') - .3) * 70) : -270;
  if (ts < E_('ll_in')) {                                                                         // behind the sill: clip to the window opening
    ly = lerp(-120 + 300, -120 + 130, rise) - over * 40; lpose = basePose(pf5(f), { lean: .3 + over * .3, tilt: .3, hands: { L: [60, -150 - over * 10], R: [50, -160] }, face: { look: [.8, .3], mouth: .8 } });
    ctx.save(); ctx.beginPath(); ctx.rect(-420, -400, 300, 280); ctx.clip(); landlord(ctx, lx, ly, f, lpose, { noClip: true }); ctx.restore();
    if (ts >= E_('ll_hands')) for (const dx of [-50, 50]) { blob(ctx, hx + dx, -122, 16, 11, PAL.zskin); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx + dx, -122, 16, 11, 0, 0, TAU); ctx.stroke(); }
  } else {
    lx = ts < E_('ll_land') ? lerp(-270, -250, drop) : walkX; ly = ts < E_('ll_land') ? lerp(-120, 0, E.inQ(drop)) : 0;
    const clipUp = ts >= E_('clip') && ts < E_('clip') + 2.0;
    lpose = ts < E_('ll_land') + .3 ? basePose(pf5(f), { lean: .45, hip: [0, -84], hands: { L: [70, -110], R: [60, -120] }, face: { look: [.8, 0], mouth: .9 } }) : (walkX > -41 || clipUp ? basePose(pf5(f), { lean: .2, tilt: .35 + sniff, hands: { L: [86, -176], R: clipUp ? [58, -262] : [70, -150] }, face: { look: [.8, 0], mouth: clipUp ? devTalk(f) * 0 + .9 : null } }) : walkLL(lx, f));
    landlord(ctx, lx, ly, f, lpose, {});
  }
  // Dev: watching TV -> turns -> hides behind the couch -> runs out of the door
  const hide = sstep(ts, E_('hide'), E_('hide') + .3), run = ts >= E_('run_out'), rx = run ? lerp(150, 470, E.inQ(clamp((ts - E_('run_out')) / .7))) : 200;
  const face = devFace(f, { wide: ts > 20.0, eyes: 1.2, brow: -1, mouth: devTalk(f), look: ts > 19.8 ? [-.9, 0] : [.3, -.8], sweat: ts > 20.4 });
  if (!run || rx < 440) {
    let pose; if (ts < E_('hide')) pose = basePose(pf, { lean: .05, tilt: -.2, face, hands: { L: [24, -110], R: [30, -104] } });
    else if (!run) pose = basePose(pf, { lean: .55 * hide, hip: [0, -104 + 34 * hide], feet: { L: [-20, 0], R: [30, 0] }, tilt: -.1, face, hands: { L: [50, -150 + 60 * hide], R: [60, -140 + 60 * hide] } });
    else pose = walkPose((rx - 150) / 240, { stride: 70, lift: 40, bob: 8, lean: .4, arms: 1.6, face });
    const dir = ts < 19.8 ? 1 : (run ? 1 : -1);
    person(ctx, DEVH(ts < E_('hide') ? 200 : (run ? rx : lerp(200, 150, hide)), 0, pose, { dir, hoodie: false }), pf);
  }
  couch(ctx, 0, 0, 0);                                                                              // couch drawn after Dev: he hides behind it
  if (ts > E_('hide') && !run) { /* Dev's head peeks above the couch back via draw order */ }
  ctx.restore(); vig(ctx, .5);
  if (ts >= 20.65 && ts < 23.0) { const k = outB((ts - 20.65) / .25, 1.5); ctx.save(); ctx.translate(W / 2 - 220, 520); ctx.scale(k, k); marker(ctx, 'MY LANDLORD', 0, 0, 74, '#B8E986', { stroke: 16 }); ctx.restore(); line(ctx, W / 2 - 230, 560, W / 2 - 270, 700, 10, '#B8E986', clamp((ts - 20.7) * 4)); }
  sfxPop(ctx, 'CRUNCH', W / 2 - 200, 640, f, EVF('ll_hands'), PAL.chalk, 90, 30, -.06);
  sfxPop(ctx, 'SLAM!', W / 2 + 200, 640, f, EVF('door_slam'), PAL.amber, 140, 30, .08);
  if (slam) for (const b of [26, 52]) sfxPop(ctx, 'BANG', W / 2 + 180, 780, f, EVF('door_slam') + b, PAL.chalk, 90, 18, -.05);
};
// ----------------------------------------------------------------------------------------------- PAN: the hallway, the hose
const ZH2 = [[-700, 11, 1], [-250, 12, -1], [-60, 13, 1], [90, 14, -1], [210, 15, 1], [330, 16, -1], [430, 17, 1], [-1080, 18, 1]];
SHOT.pan = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, a = EVS('cab_reach'), b = EVS('hose_coil'), s0 = TL.shots.pan[0] / 60, s1 = TL.shots.pan[1] / 60;
  const cx = kf(ts, [[s0, -820], [s0 + .9, -820, E.ioC], [a, 520, E.ioQuint], [b, 540, E.ioC], [s1 - .9, 530, E.ioC], [s1 - .05, -800]]), cz = kf(ts, [[s0, 1.3], [s0 + .9, 1.1, E.ioC], [a - .5, 1.05, E.ioC], [b, 2.1, E.ioQuint], [s1 - 1.0, 2.1, E.ioC], [s1 - .2, 1.35, E.ioC]]);
  ctx.save(); applyCam(ctx, { x: cx, y: -250, z: cz, hand: 1.2 }, t, [[TL.shots.pan[0] + 26, 10], [TL.shots.pan[0] + 52, 10]]);
  hallSurround(ctx, f); longHall(ctx, f, {}); hoseCabinet(ctx, f, false);
  for (const [x0, sd, dir] of ZH2) { const x = x0 + Math.sin(f * .01 + sd) * 14; person(ctx, { x, y: -16, s: .92, dir, kind: 'z', seed: sd, var: sd % 5, pose: zPoseFor(0, x, f, sd, 0) }, pf5(f + sd * 3)); }
  const lf2 = lf; person(ctx, DEVH(-860, 6, basePose(pf3(f), { lean: -.18, tilt: .05, feet: { L: [30, 0], R: [56, 0] }, hands: { L: [-40, -170], R: [-44, -146] }, face: devFace(f, { wide: true, eyes: 1.2, brow: -1, mouth: devTalk(f), look: [.9, 0], sweat: true }) }), { s: 1.06, hoodie: false }), pf3(f));
  ctx.restore(); vig(ctx, .5);
  for (const bb of [26, 52]) sfxPop(ctx, 'BANG', W / 2 - 220, 720, lf, bb, PAL.chalk, 90, 18, -.05);
  if (ts > b - .1 && ts < s1 - 1.0) { const k = sstep(ts, b - .1, b + .3); ctx.save(); ctx.globalAlpha = k; rr(ctx, W / 2 - 330, 520, 660, 170, 26, 'rgba(8,10,18,.85)', 'rgba(255,255,255,.18)', 3); marker(ctx, 'FIRE HOSE', W / 2, 600, 64, PAL.chalk, { stroke: 10 }); marker(ctx, '100 FT  =  ABOUT 9 FLOORS', W / 2, 670, 46, PAL.amber, { stroke: 10 }); ctx.restore(); }
  const ding = EVF('cab_reach'); if (f >= ding && f < ding + 14) burst(ctx, W / 2 + 40, 900, 200, f, ding, '#fff', 12);
  sfxPop(ctx, 'DING!', W / 2 + 250, 820, f, ding, PAL.amber, 100, 36, .1);
};
// ----------------------------------------------------------------------------------------------- HALL: stealth, Mom, fetch, hose, the landlord, dive
function devX2(ts) {
  const E_ = EVS;
  if (ts < E_('tiptoe0')) return -860;
  if (ts < E_('ring_on')) return -860 + (ts - E_('tiptoe0')) / (E_('ring_on') - E_('tiptoe0')) * 400;
  if (ts < 40.4) return -460;
  if (ts < 42.3) return Math.min(520, -460 + (ts - 40.4) * 520);
  if (ts < 45.0) return 520;
  if (ts < 45.6) return lerp(520, 700, clamp((ts - 45.0) / .6));
  return 705;
}
let ZS2 = null, LLX = null;
function buildSim2() {
  if (ZS2) return; ZS2 = []; const N = TL.total, E_ = EVS, phoneX = -1000;
  const order = ZH2.map((z, i) => i).sort((a, b) => Math.abs(ZH2[a][0] - phoneX) - Math.abs(ZH2[b][0] - phoneX));
  ZH2.forEach((z, i) => { const rank = order.indexOf(i), arr = new Array(N + 1); let x = z[0], dir = z[2];
    for (let f = 0; f <= N; f++) { const ts = f / 60, dx = devX2(ts); let mode = 0, vx = 0;
      if (ts >= E_('ring_on') && ts < E_('phone_land')) { dir = x < dx ? 1 : -1; mode = 1; }
      if (ts >= E_('ring_on') + 1.0 && ts < E_('phone_land')) { const v = Math.min(1, (ts - E_('ring_on') - 1) / 2) * 70 + Math.min(1, Math.max(0, ts - 37.5) / 2) * 25, gap = 72 + rank * 4; if (Math.abs(x - dx) > gap) { vx = (x < dx ? 1 : -1) * v / 60; x += vx; mode = 2; dir = vx > 0 ? 1 : -1; } }
      if (ts >= E_('phone_land')) { const tg = phoneX + 40 + rank * 26 + (hash(i * 7) - .5) * 30; if (Math.abs(x - tg) > 6) { vx = (x < tg ? 1 : -1) * Math.min(520, 160 + (ts - E_('phone_land')) * 1200) / 60; x += vx; mode = 3; dir = vx > 0 ? 1 : -1; } else { mode = 4; dir = hash(Math.floor(f / 9) + i) > .5 ? 1 : -1; } }
      arr[f] = [x, dir, mode]; }
    ZS2[i] = arr; });
  LLX = new Array(N + 1); let x = -900;                                                              // the landlord ignores the phone and comes for Dev
  for (let f = 0; f <= N; f++) { const ts = f / 60; if (ts >= E_('ll_door') + .25 && ts < E_('grab')) x += Math.min(470, 120 + (ts - E_('ll_door') - .25) * 240) / 60; LLX[f] = x; }
}
SHOT.hall = (ctx, lt, lf, len, t0, f) => {
  buildSim2(); const E_ = EVS, frz = EVF('freeze'), fz = Math.min(f, frz), t = Math.min(t0, frz), ts = t / 60, pfD = pf3(fz), dx = devX2(ts);
  // phone insert (MOM calling) between the wide ring reaction and the accidental answer
  if (ts >= E_('phone_out') && ts < E_('answer')) { phoneCloseup(ctx, ts, f); marker(ctx, 'LOUD!', W / 2 + 280, 360, 130, PAL.red, { rot: .1 }); return; }
  const ck = [[32.4, -800, -250, 1.35, E.ioC], [E_('ring_on') - .3, dx + 100, -240, 1.4, E.ioC], [E_('ring_on'), dx + 120, -230, 1.0, E.outQuint], [36.4, dx + 60, -230, .92, E.ioC], [39.9, dx + 30, -230, .95, E.ioC], [E_('throw') + .25, -640, -240, .8, E.ioC], [E_('phone_land') + .2, -760, -230, .85, E.ioC],
    [41.6, -60, -240, .8, E.ioC], [42.3, 450, -240, 1.25, E.ioC], [E_('ll_door') + .1, 420, -240, 1.2, E.ioC], [43.2, -100, -230, .66, E.ioC], [45.0, 80, -230, .7, E.ioC], [45.6, 520, -230, .95, E.ioC], [E_('dive'), 640, -230, 1.1, E.ioC], [E_('freeze'), 640, -230, 1.2]];
  const cx = kf(ts, ck.map(k => [k[0], k[1], k[4]])), cy = kf(ts, ck.map(k => [k[0], k[2], k[4]])), cz = kf(ts, ck.map(k => [k[0], k[3], k[4]]));
  ctx.save(); applyCam(ctx, { x: cx, y: cy, z: cz + (f > frz ? (f - frz) * .004 : 0), hand: f > frz ? 0 : 1.5 }, t, [[EVF('ring_on'), 14], [EVF('answer'), 8], [EVF('phone_land'), 12], [EVF('glass'), 26], [EVF('ll_door'), 30], [EVF('grab'), 40]]);
  hallSurround(ctx, fz); longHall(ctx, fz, {});
  const brk = ts >= E_('glass'); hoseCabinet(ctx, fz, brk, brk ? 0 : 1);
  // door 1004 bursts open: the landlord
  const dd = clamp((ts - E_('ll_door')) / .15); if (ts >= E_('ll_door')) { ctx.fillStyle = '#05080A'; ctx.fillRect(-965, -280, 130, 280); ctx.save(); ctx.translate(-835, 0); ctx.transform(Math.cos(dd * 1.35), 0, 0, 1, 0, 0); ctx.fillStyle = '#4A3326'; ctx.fillRect(-130, -280, 130, 280); ctx.restore(); }
  for (let i = 0; i < ZH2.length; i++) { const [x, dir, mode] = ZS2[i][fz], sd = ZH2[i][1]; person(ctx, { x, y: -16, s: .92, dir, kind: 'z', seed: sd, var: sd % 5, pose: zPoseFor(mode, x, fz, sd, 0) }, pf5(fz + sd * 3));
    if (mode === 1 && (fz % 40) < 12) marker(ctx, '!', x + 6, -330 - (fz % 40), 70, PAL.red, { stroke: 12 }); }
  // hose
  const hoseOn = ts >= E_('glass') + .25, hEnd = ts < 45.6 ? [dx - 20, -20] : [Math.min(830, lerp(700, 860, clamp((ts - 45.6) / .8))), lerp(-20, -190, clamp((ts - 45.6) / .8))];
  const llx = LLX[fz], grabbed = ts >= E_('grab');
  if (hoseOn) hoseLine(ctx, grabbed ? [[524, -110], [524, 6], [llx + 40, -130], [hEnd[0], hEnd[1]]] : [[524, -110], [524, 6], [lerp(524, hEnd[0], .5), 14 + Math.sin(fz * .1) * 3], [hEnd[0], hEnd[1]]]);
  // phone
  const th = E_('throw'), pl = E_('phone_land');
  if (ts >= th && ts < pl) { const u = (ts - th) / (pl - th); phoneProp(ctx, lerp(-440, -1000, u), lerp(-190, -14, u) - Math.sin(u * Math.PI) * 220, u * 14, fz, 1, 1.5); }
  else if (ts >= pl) { phoneProp(ctx, -1000, -14, 1.3, fz, 1, 1.5); ringWaves(ctx, -1000, -40, fz, EVF('phone_land')); }
  // landlord
  if (ts >= E_('ll_door')) { const run = ts > E_('ll_door') + .6, gr = grabbed; landlord(ctx, llx, -10, fz, gr ? basePose(pf5(fz), { lean: .6, hands: { L: [70, -120], R: [60, -110] }, face: { look: [.9, 0], mouth: 1 } }) : walkLL(llx, fz, { run, clipUp: !run, mouth: 1 }), { s: 1.0, noClip: gr }); }
  // Dev
  const tip = ts >= E_('tiptoe0') && ts < E_('ring_on');
  let pose, dir = 1, y = 6; let face = devFace(f, { wide: true, eyes: 1.2, brow: -.8, mouth: devTalk(f), look: [.9, 0], sweat: true });
  if (tip) pose = walkPose((dx + 860) / 120, { stride: 22, lift: 30, bob: 2, lean: -.04, arms: .15, hands: { L: [-48, -150], R: [lerp(76, 40, sstep(ts, 32.8, 33.0) * (1 - sstep(ts, 34.4, 34.6))), lerp(-150, -226, sstep(ts, 32.8, 33.0) * (1 - sstep(ts, 34.4, 34.6)))] }, face: { ...face, mouth: devTalk(f) * .6 } });
  else if (ts < E_('tiptoe0')) pose = basePose(pfD, { lean: .05, face, hands: { L: [20, -100], R: [24, -100] } });
  else if (ts < th) { const fzz = ts > E_('answer'); pose = basePose(pfD, { lean: .06, hands: { L: [20, -100], R: fzz ? [54, -214] : [30, -100] }, face: { ...face, brow: -1, look: [ts > 37.5 ? .9 : 0, 0] } }); if (fzz) phoneProp(ctx, dx + 36, -176, .2, fz, 0, 1.6); }
  else if (ts < 40.4) { dir = -1; const sw = sstep(ts, th, th + .25); pose = basePose(pfD, { lean: lerp(-.1, .25, sw), hands: { L: [20, -100], R: [lerp(-30, 80, sw), lerp(-230, -80, sw)] }, face }); }
  else if (ts < 42.3) pose = walkPose((dx + 460) / 260, { stride: 78, lift: 42, bob: 9, lean: .38, arms: 1.7, face });
  else if (ts < 45.0) { const smash = sstep(ts, E_('glass') - .25, E_('glass')) * (1 - sstep(ts, E_('glass'), E_('glass') + .2)); dir = ts > E_('ll_door') + .2 ? -1 : 1; pose = basePose(pfD, { lean: .1 + smash * .25, hands: { L: [lerp(30, 60, smash), -110 - smash * 40], R: [lerp(54, 90, smash), lerp(-150, -190, smash)] }, feet: { L: [-14, 0], R: [20, 0] }, face: { ...face, look: [.9, 0], brow: ts > E_('ll_door') ? .8 : -.5, eyes: ts > E_('ll_door') ? .7 : 1.2, wide: ts < E_('ll_door') } }); }
  else if (ts < E_('dive')) pose = ts < 45.6 ? walkPose((dx - 520) / 180, { stride: 70, lift: 38, bob: 8, lean: .4, arms: 1.6, face }) : basePose(pfD, { lean: .5, hands: { L: [70, -100], R: [80, -150] }, face: { ...face, mouth: 1 } });
  else { const d = clamp((ts - E_('dive')) / .35); y = 6 - Math.sin(d * Math.PI) * 60 - d * 40; pose = basePose(pfD, { lean: 1.2, tilt: .2, hip: [0, -HIP_H + 20], feet: { L: [-40, -50], R: [-70, -30] }, hands: { L: [110, -150], R: [120, -190] }, face: { ...face, mouth: 1 } }); }
  const dxx = ts < E_('dive') ? dx : lerp(705, 880, clamp((ts - E_('dive')) / .35));
  const props = hoseOn && ts < 45.6 ? { holdHand: 1, holdProp: (c, a) => { c.save(); c.translate(a[0] + 4, a[1]); for (let r = 26; r > 8; r -= 7) { c.strokeStyle = r % 14 ? '#F2EFE4' : '#D9D5C4'; c.lineWidth = 7; c.beginPath(); c.arc(8, 6, r, 0, TAU); c.stroke(); } c.restore(); } } : {};
  person(ctx, { ...DEVH(dxx, y, pose, { dir, hoodie: false }), s: 1.06, ...props }, pfD);
  if (ts >= E_('glass') && ts < E_('glass') + .6) { const d = (ts - E_('glass')) / .6; for (let i = 0; i < 18; i++) { const a = -Math.PI * hash(i) - .1, r = 280 * d * (.4 + hash(i * 3)); ctx.save(); ctx.translate(560 + Math.cos(a) * r - 80 * d, -200 + Math.sin(a) * r * .6 + d * d * 200); ctx.rotate(i + d * 6); ctx.globalAlpha = 1 - d; ctx.fillStyle = 'rgba(210,238,255,.95)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, 10); ctx.lineTo(-8, 7); ctx.fill(); ctx.restore(); } }
  if (ts >= E_('ll_door') && ts < E_('ll_door') + .5) { burst(ctx, -900, -150, 160, fz, EVF('ll_door'), '#cfcfd8', 12); dust(ctx, -900, -10, fz, EVF('ll_door'), 8, 1.6); }
  ctx.restore(); vig(ctx, .5);
  // clarity layer
  if (ts >= 32.8) { const fail = ts >= E_('ring_on'); ctx.save(); ctx.translate(W - 60, 300); rr(ctx, -470, -60, 470, 100, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3); ctx.font = `800 36px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = fail ? 'rgba(255,255,255,.4)' : PAL.chalk; ctx.fillText('RULE: NO SOUND', -440, 4); ctx.textAlign = 'right'; ctx.fillStyle = fail ? PAL.red : '#6CFF9A'; ctx.fillText(fail ? '✕' : '✔', -24, 4); if (fail) { ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-446, -8); ctx.lineTo(-70, -8); ctx.stroke(); } ctx.restore(); }
  sfxPop(ctx, 'RING RING!', W / 2, 560, f, EVF('ring_on'), PAL.amber, 130, 30);
  sfxPop(ctx, 'CLICK', W / 2 + 120, 660, f, EVF('answer'), PAL.chalk, 90, 24, .1);
  sfxPop(ctx, 'WHOOSH', W / 2 - 120, 640, f, EVF('throw'), PAL.chalk, 100, 34, -.12);
  sfxPop(ctx, 'CLATTER', W / 2 - 170, 760, f, EVF('phone_land'), PAL.amber, 100, 34, -.08);
  sfxPop(ctx, 'CRASH!', W / 2 + 120, 660, f, EVF('glass'), PAL.amber, 150, 40, .08);
  sfxPop(ctx, 'BOOM!', W / 2 - 200, 820, f, EVF('ll_door'), PAL.red, 150, 40, -.08);
  if (ts >= E_('ll_door') + .3 && ts < 44.0) { const k = outB((ts - E_('ll_door') - .3) / .25, 1.5); ctx.save(); ctx.translate(W / 2 - 250, 520); ctx.scale(k, k); marker(ctx, 'THE LANDLORD', 0, 0, 70, '#B8E986', { stroke: 16 }); ctx.restore(); }
  if (ts >= pl + .1 && ts < 41.6) { const k = sstep(ts, pl + .1, pl + .35); ctx.save(); ctx.globalAlpha = k; rr(ctx, 60, 800, 600, 110, 26, 'rgba(255,159,196,.95)', PAL.ink, 5); marker(ctx, '“Honey? Honey?”', 360, 872, 44, PAL.ink, { stroke: .01 }); ctx.restore(); }
  if (f >= frz) { const d = f - frz; tint(ctx, '#ff2a1e', Math.min(.22, d * .03)); sfxPop(ctx, 'GOTCHA!', W / 2, 600, f, frz, '#B8E986', 150, 60, -.06); }
};
// ----------------------------------------------------------------------------------------------- END CARD
SHOT.end2 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.28)'); g.addColorStop(1, 'rgba(255,59,48,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 600); ctx.scale(u, u); marker(ctx, 'PART 3', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 840); ctx.scale(k, k); marker(ctx, 'THE HOSE', 0, 0, 150, PAL.red, { stroke: 28 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'LAST VAN AT SUNRISE  •  47 MIN LEFT', W / 2, 1010, 44, PAL.amber, { stroke: 12 }); marker(ctx, 'FOLLOW BEFORE THE LANDLORD CATCHES HIM', W / 2, 1090, 40, '#B8E986', { stroke: 12 }); ctx.restore();
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * W, y = ((hash(i * 7.1) * H + f * (1 + hash(i) * 2)) % H); dot(ctx, x, y, 2 + hash(i * 2) * 3, 'rgba(255,255,255,.18)'); }
  vig(ctx, .6);
};
