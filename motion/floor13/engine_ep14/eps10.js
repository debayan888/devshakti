// eps10.js - Episode 10 "Let Him In": Dev makes the driver show the arm first - a straight glass cut, glass still in it, no teeth marks.
// They let him in. Cole drives for St. Anne's: six bitten-but-not-turned patients in the van. CAM 4 (van rear, colour): empty stretchers,
// restraint straps CUT not torn, blood smears and handprints, rear window smashed (Cole looks away). CAM 5 (garage, IR): the six patients
// stand facing the wall, silent. One turns its head to the camera.
'use strict';
const T0_10 = 41 * 60 + 23, COLE10 = ['v1', 'v2', 'v3', 'v4'];
const CLUES10 = [[7.0, 'CLEAN CUT - NO TEETH MARKS'], [22.6, 'VAN CARRIED 6 BITTEN PATIENTS'], [33.2, 'STRAPS WERE CUT, NOT TORN'], [36.0, 'REAR WINDOW SMASHED'], [47.6, 'THE 6 ARE IN THE GARAGE']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end10[0]) return; const left = Math.max(0, T0_10 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES10.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
const BLOOD = '#8E1018', BLOOD2 = '#C0262E';
// ----------------------------------------------------------------------------------------------- Cole (the driver): stand / walk / sit on the floor, cap, badge, the cut forearm
function cole10(ctx, x, f, ts, o = {}) {
  const talk = lineTalk(f, COLE10), sit = o.sit || 0, dir = o.dir || -1;
  const face = devFace(f, { wide: o.wide !== false, eyes: 1.2, brow: o.brow == null ? -.9 : o.brow, look: o.look || [.9, .05], mouth: talk, sweat: true });
  let pose;
  if (o.walk) pose = walkPose(Math.abs(x) / 110, { stride: 26, lift: 10, bob: 3, lean: .2, face, hands: { L: [30, -130], R: [36, -150] } });
  else { pose = basePose(pf3(f + 20), { lean: lerp(.16, -.06, sit) + Math.sin(f * .2) * .02, face, hands: { L: o.armUp ? [96, -210] : lerp(0, 1, sit) > .5 ? [62, -70] : [44, -132], R: o.pull ? [78 + Math.sin(f * .3) * 10, -200] : [40 + Math.sin(f * .17) * 12 * talk, -150 - 30 * talk + sit * 60] } });
    pose.hip = [pose.hip[0], lerp(pose.hip[1] + Math.sin(f * .32) * 2, -38, sit)]; pose.feet = { L: [lerp(-16, 70, sit), lerp(0, -6, sit)], R: [lerp(16, 92, sit), lerp(0, -4, sit)] }; }
  if (o.pose) { const fc = pose.face; pose = { ...o.pose, face: fc }; }
  const r = person(ctx, { x, y: o.y || 0, s: o.s || 1, dir, kind: 'dev', seed: 81, hoodie: false, shirt: '#3E5068', pants: '#22262E', pose }, pf3(f));
  const [hx, hy] = r.head, hr = 40; ctx.save(); ctx.translate(hx, hy); ctx.scale(dir, 1); ctx.rotate(pose.lean);
  ctx.fillStyle = '#2B3A55'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -4, hr + 3, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill(); ctx.stroke();
  rr(ctx, hr * .3, -hr * .3, hr * .95, 10, 5, '#22304A', PAL.ink, 3); ctx.restore();
  rr(ctx, hx - 15 - 15 * dir, hy + 84, 30, 22, 3, '#E8E8E0', PAL.ink, 2);
  const lx = x + r.hands[0][0] * dir, ly = r.hands[0][1], un = o.unwrap || 0;                                           // rig hands are body-local
  if (un < .6) { rr(ctx, lx - 17, ly + 4, 34, 16, 5, '#EDEBE3', PAL.ink, 2); blob(ctx, lx + 2, ly + 12, 7, 5, BLOOD2, 0, .9); }
  else { line(ctx, lx - 16, ly + 8, lx + 14, ly + 16, 5, BLOOD); dot(ctx, lx + 2, ly + 22 + (f % 40) * .4, 3, BLOOD2); }
  if (o.gauze) { rr(ctx, lx - 20, ly + 2, 40, 20, 6, '#F4F2EC', PAL.ink, 2); blob(ctx, lx, ly + 12, 11, 6, BLOOD2, 0, .85); }
}
// ----------------------------------------------------------------------------------------------- the glass side: the dead closing in on Cole, then pounding, then drifting off
const D10 = [[700, 51], [790, 52], [880, 53]];
function dead10(ctx, f, ts) {
  D10.forEach(([x0, sd], i) => {
    const press = [430 + i * 80][0]; let x, moving, dir = -1;
    if (ts < 20 + i * .6) { x = Math.max(press, x0 - (x0 - press) * ts / (11 + i * .5)); moving = x > press; }
    else { const u = clamp((ts - 20 - i * .6) / 6); x = lerp(press, 1250, u); moving = u < 1; dir = 1; }
    const hit = ts >= 12.3 ? Math.exp(-(ts - (ts >= 12.7 ? 12.7 : 12.3)) * 6) * Math.sin((ts - 12.3) * 30) * 6 : 0;
    const pressing = !moving && ts < 20 + i * .6;
    const pose = moving ? walkPose(x / 90, { stride: 18, lift: 6, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176], R: [78, -190] }, face: { look: [.7, .1], mouth: .7 } })
      : pressing ? basePose(pf5(f + sd * 3), { lean: .3, tilt: .2 * Math.sin(f * .05 + i), hands: { L: [96 + hit, -205], R: [90 + hit, -172] }, face: { look: [.9, 0], mouth: .9 } }) : zpose(pf5(f + sd * 4), sd, { stride: 0, lift: 0 });
    ctx.save(); ctx.globalAlpha = .85; person(ctx, { x, y: 0, s: .95, dir, kind: 'z', seed: sd, var: sd % 5 === 1 ? 2 : sd % 5, pose }, pf5(f + sd * 4)); ctx.restore();
  });
}
function glassSide10(ctx, f, ts, o = {}) {
  dead10(ctx, f, ts);
  if (ts < 10.75) cole10(ctx, 440, f, ts, { dir: -1, armUp: o.armUp, pull: o.pull, unwrap: o.unwrap, look: o.clook });
  blob(ctx, 340, -206, 14, 20, 'rgba(220,235,255,.9)', 0, .3); line(ctx, 336, -190, 334, -140, 4, 'rgba(220,235,255,.25)');                        // his wet handprint (Ep9)
  if (ts > 10.7) { blob(ctx, 362, -150, 9, 22, BLOOD2, .2, .7); line(ctx, 360, -136, 356, -80, 4, 'rgba(192,38,46,.6)'); }                     // bloody smear on the door frame
  const op = sstep(ts, EVS('buzz'), EVS('buzz') + .2) * (1 - sstep(ts, EVS('shut'), EVS('shut') + .25)), w = 120 * (1 - .8 * op);
  ctx.strokeStyle = '#C8D2E0'; ctx.lineWidth = 6; ctx.strokeRect(350, -330, 120, 330); if (op > .02) { ctx.fillStyle = '#05070D'; ctx.fillRect(353, -327, 114, 324); }
  ctx.fillStyle = 'rgba(200,225,255,.1)'; ctx.fillRect(350, -330, w, 330); ctx.strokeRect(350, -330, w, 330); dot(ctx, 350 + w - 14, -160, 6, '#C8D2E0');
}
// ----------------------------------------------------------------------------------------------- the cast inside (Ep8 acting pattern)
function cast10(ctx, f, ts, o = {}) {
  const tD = devTalk(f), tR = lineTalk(f, RAY8), tM = lineTalk(f, MIRA8), jolt = ['th1', 'th2', 'shut'].reduce((v, k) => v + (ts >= EVS(k) ? Math.exp(-(ts - EVS(k)) * 7) : 0), 0);
  mira(ctx, -220, -4, f, { s: 1, typing: !!o.mtype, look: o.mlook || [.9, 0], dir: o.mdir || 1, mouth: tM, gesture: tM > .05 ? .8 : 0, brow: o.mbrow == null ? -.3 : o.mbrow, wide: !!o.mwide || jolt > .3, flinch: Math.min(1, jolt) });
  if (o.cole) cole10(ctx, o.cole.x, f, ts, o.cole);
  const D = o.D || { x: 130, dir: -1 };
  const face = devFace(f, { wide: !!o.wide || jolt > .3, eyes: o.wide || jolt > .3 ? 1.3 : 1.05, brow: o.dbrow == null ? -.7 : o.dbrow, look: o.dlook || [.9, 0], mouth: tD, sweat: !!o.sweat });
  const dp = D.moving ? walkPose(D.x / 110, { stride: 22, lift: 8, bob: 2, lean: .06, face, hands: { L: [20, -100], R: [36, -150] } }) : basePose(pf3(f), { lean: .06 - .12 * Math.min(1, jolt) + Math.sin(f * .025) * .02, face, hands: { L: [20, -100], R: [40 + Math.sin(f * .17) * 14 * tD, -150 - 40 * tD] } });
  person(ctx, DEVH(D.x, 0, dp, { dir: D.dir, hoodie: false }), pf3(f));
  const R = o.R || { x: 260, dir: -1 };
  const rp = R.moving ? walkPose(R.x / 110, { stride: 22, lift: 8, bob: 2, lean: .08, face: rayFace8(f, o.rface || {}), hands: { L: [20, -100], R: [60, -150] } }) : basePose(pf3(f + 40), { lean: .08 - .12 * Math.min(1, jolt) + Math.sin(f * .021 + 1) * .02, face: rayFace8(f, o.rface || {}), hands: { L: [20 + 30 * tR + Math.sin(f * .15) * 10 * tR, -100 - 60 * tR], R: [60, -150] } });
  ray(ctx, R.x, 0, f, rp, { dir: R.dir, aim: .25, light: false });
}
const COLE_SEAT = { x: -80, sit: 1, dir: 1, gauze: true, unwrap: 1 };
// ----------------------------------------------------------------------------------------------- inserts
function armInsert(ctx, f, ts) {                                                    // the forearm against the glass: the bandage comes off
  ctx.fillStyle = '#0D1424'; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, 900, 700, 'rgba(110,200,255,A)', .18);
  const un = sstep(ts, 4.7, 5.6), y = 930;
  ctx.save(); ctx.translate(Math.sin(f * .7) * 2, Math.sin(f * .9) * 2);
  rr(ctx, 60, y - 95, 260, 190, 40, '#3E5068', PAL.ink, 6);                                                                        // sleeve
  rr(ctx, 280, y - 80, 600, 160, 70, '#F2EFE6', PAL.ink, 6); dot(ctx, 900, y - 10, 95, '#F2EFE6'); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(900, y - 10, 95, -1.2, 1.9); ctx.stroke();
  ctx.save(); ctx.beginPath(); rrect(ctx, 286, y - 74, 588, 148, 64); ctx.clip();
  line(ctx, 400, y - 40, 760, y + 30, 18, BLOOD); line(ctx, 404, y - 38, 756, y + 28, 7, BLOOD2);                                     // the cut: one straight line
  for (let i = 0; i < 9; i++) { const u = i / 8, bx = lerp(410, 750, u), by = lerp(y - 36, y + 28, u), len = (10 + hash(i) * 40) * clamp((ts - 5.0 - hash(i * 3) * 1.2) / 2.5); dot(ctx, bx, by + 8, 6, BLOOD2); if (len > 0) line(ctx, bx, by + 10, bx + 2, by + 10 + len, 6, BLOOD2); }
  ctx.fillStyle = 'rgba(200,230,255,.9)'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(590, y - 2); ctx.lineTo(612, y - 70); ctx.lineTo(626, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();   // glass shard still in it
  ctx.restore();
  if (un < 1) { ctx.save(); ctx.globalAlpha = 1 - un; for (let i = 0; i < 4; i++) { const bx = 380 + i * 110; rr(ctx, bx, y - 82 + un * 160 * (1 + i * .3), 100, 164, 14, '#EDEBE3', PAL.ink, 3); blob(ctx, bx + 50, y - 10 + un * 160, 26, 18, BLOOD2, 0, .8); } ctx.restore(); }
  ctx.restore();
  ctx.fillStyle = 'rgba(160,210,255,.08)'; ctx.fillRect(0, 0, W, H); blob(ctx, 220, 600, 60, 90, 'rgba(220,235,255,.9)', .3, .12);                // the glass between them
  if (ts > 6.6) { marker(ctx, 'NO TEETH MARKS', W / 2, 700, 54, '#6CFF9A', { stroke: 12, s: outB((ts - 6.6) / .25, 1.5) }); marker(ctx, 'ONE STRAIGHT CUT', W / 2, 1170, 44, PAL.chalk, { stroke: 10, a: sstep(ts, 6.9, 7.1) }); }
  vig(ctx, .55);
}
function camScreen(ctx, f, label, color) { ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10); }
function camChrome(ctx, f, label, stamp, mono) {
  if (mono) { ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = mono; ctx.fillRect(110, 410, W - 220, 700); ctx.restore(); }
  for (let y = 410; y < 1110; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(110, y, W - 220, 2); }
  marker(ctx, label, 330, 470, 32, '#6CFF9A', { stroke: 8 }); marker(ctx, 'LIVE ●', W - 220, 470, 32, PAL.red, { stroke: 8, a: (f % 40) < 26 ? 1 : .3 }); marker(ctx, stamp, W - 250, 1070, 28, '#E8E8E8', { stroke: 8 });
}
const clock10 = ts => { const s = 10 * 60 + 40 + Math.floor(ts); return `04:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} AM`; };
function vanRear(ctx, f, ts) {                                                      // CAM 4, colour: the back of the van is a crime scene
  camScreen(ctx, f);
  const k1 = sstep(ts, 31.4, 32.6), k2 = sstep(ts, 34.4, 35.4), z = 1 + .9 * k1 * (1 - k2) + 1.0 * k2, fx = lerp(0, -250, k1) * (1 - k2) + 330 * k2, fy = lerp(0, 120, k1) * (1 - k2) + 140 * k2;
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 760); ctx.scale(z, z); ctx.translate(fx, fy);
  ctx.fillStyle = '#1C1F26'; ctx.fillRect(-700, -500, 1400, 1000);
  ctx.fillStyle = '#D7D5CC'; ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(300, -300); ctx.lineTo(180, -170); ctx.lineTo(-180, -170); ctx.closePath(); ctx.fill();          // ceiling
  ctx.fillStyle = '#8A8880'; ctx.fillRect(-180, -170, 360, 220);                                                                            // front bulkhead
  ctx.fillStyle = '#BDBAB0'; ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(-180, -170); ctx.lineTo(-180, 50); ctx.lineTo(-300, 220); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(300, -300); ctx.lineTo(180, -170); ctx.lineTo(180, 50); ctx.lineTo(300, 220); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6A6862'; ctx.beginPath(); ctx.moveTo(-300, 220); ctx.lineTo(-180, 50); ctx.lineTo(180, 50); ctx.lineTo(300, 220); ctx.closePath(); ctx.fill();                  // floor
  blob(ctx, -40, 150, 90, 26, BLOOD, .1, .9); blob(ctx, 60, 110, 50, 14, BLOOD2, -.2, .8); line(ctx, -90, 170, -220, 210, 22, BLOOD);                     // blood smears, dragged
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {                                                                                  // stretchers + cut straps
    const t0 = i / 3, x0 = sd * lerp(250, 170, t0), x1 = sd * lerp(205, 150, t0), y0 = lerp(170, 60, t0);
    ctx.fillStyle = '#E8E8E4'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0 - 26); ctx.lineTo(x1, y0 - 50); ctx.lineTo(x0, y0 - 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    const sx = (x0 + x1) / 2; line(ctx, sx, y0 - 30, sx - sd * 8, y0 + 6, 6, '#2A2A2A'); line(ctx, sx - sd * 8, y0 + 6, sx - sd * 4, y0 + 10, 2, '#E0E0E0');   // strap hanging, clean-cut end
  }
  ctx.save(); ctx.translate(40 + Math.sin(f * .05) * 6, -150); line(ctx, 0, 0, 0, 30, 3, '#888'); rr(ctx, -18, 30, 36, 50, 8, 'rgba(220,235,255,.7)', '#666', 2); ctx.restore();   // IV bag swinging
  ctx.fillStyle = '#C9C7BE'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(-470, -260); ctx.lineTo(-470, 260); ctx.lineTo(-300, 220); ctx.closePath(); ctx.fill(); ctx.stroke();   // open doors
  ctx.beginPath(); ctx.moveTo(300, -300); ctx.lineTo(470, -260); ctx.lineTo(470, 260); ctx.lineTo(300, 220); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#20242C'; ctx.fillRect(345, -250, 90, 120); ctx.strokeStyle = '#EEE'; ctx.lineWidth = 2; ctx.beginPath();                     // the rear window: smashed
  for (let i = 0; i < 9; i++) { const a = i * .7 + .3; ctx.moveTo(390, -190); ctx.lineTo(390 + Math.cos(a) * 60, -190 + Math.sin(a) * 70); } ctx.stroke(); ctx.fillStyle = '#05060A'; ctx.beginPath(); ctx.ellipse(392, -192, 22, 28, .3, 0, TAU); ctx.fill();
  dot(ctx, 375, -120, 6, BLOOD2);
  for (const [hx, hy, r] of [[-400, -60, .2], [-380, 40, -.3], [420, 60, .1]]) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(r); blob(ctx, 0, 0, 18, 22, BLOOD, 0, .85); for (let j = 0; j < 4; j++) line(ctx, -12 + j * 8, -14, -14 + j * 9, -36, 6, BLOOD); ctx.restore(); }   // bloody handprints
  ctx.restore();
  camChrome(ctx, f, 'CAM 4 · VAN REAR', clock10(ts), null);
  if (ts > 32.6 && ts < 34.4) marker(ctx, 'CUT', W / 2 - 40, 640, 54, PAL.amber, { stroke: 12, s: outB((ts - 32.6) / .25, 1.5) });
  if (ts > 35.4) marker(ctx, 'SMASHED FROM OUTSIDE?', W / 2, 640, 46, PAL.amber, { stroke: 12, s: outB((ts - 35.4) / .25, 1.5) });
  vig(ctx, .6);
}
function garageIR(ctx, f, ts) {                                                     // CAM 5, infrared: six patients facing the wall - silent
  camScreen(ctx, f); const z = lerp(.84, 1.08, sstep(ts, 40, 48.6)), turn = ts >= EVS('turn');
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 980); ctx.scale(z, z); ctx.translate(290, 0);
  ctx.fillStyle = '#2A2A2A'; ctx.fillRect(-900, -700, 1800, 700); ctx.fillStyle = '#1C1C1C'; ctx.fillRect(-900, 0, 1800, 400);
  ctx.fillStyle = '#3A3A3A'; ctx.fillRect(-900, -700, 220, 700); for (let y = -680; y < 0; y += 60) { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(-900, y, 220, 3); }   // the wall they face
  for (const px of [-160, 420]) { ctx.fillStyle = '#333'; ctx.fillRect(px, -700, 70, 700); } marker(ctx, 'P2', 455, -420, 40, '#777', { stroke: .01 });
  for (let i = 0; i < 6; i++) {
    const x = -600 + i * 120 + (i % 2) * 20, sd = 90 + i, me = i === 5 && turn, pose = basePose(0, { lean: .02, tilt: .12 * (i % 3 - 1), face: { look: me ? [.9, 0] : [.9, .1], eyes: me ? 1.1 : 1, mouth: 0, brow: 0, smile: 0 }, hands: { L: [8, -96], R: [14, -98] } });
    person(ctx, { x, y: 0, s: .95, dir: me ? 1 : -1, kind: 'dev', seed: sd, hoodie: false, shirt: '#B8C4CC', pants: '#B8C4CC', pose }, 0);
    rr(ctx, x - 6, -100, 12, 8, 2, '#E8E8E8');                                                                                                // wristband
    if (me) { const r = sstep(ts, EVS('turn'), EVS('turn') + .3); dot(ctx, x + 24, -256, 6 * r, '#FFFFFF'); dot(ctx, x + 40, -256, 6 * r, '#FFFFFF'); glow(ctx, x + 32, -256, 40, 'rgba(255,255,255,A)', .6 * r); }
  }
  ctx.restore();
  camChrome(ctx, f, 'CAM 5 · GARAGE (IR)', clock10(ts), '#7FBF7F');
  marker(ctx, '[ NO SOUND ]', W / 2, 560, 36, '#B8E986', { stroke: 10 });
  if (turn) marker(ctx, 'IT SEES THE CAMERA', W / 2, 1180, 44, PAL.red, { stroke: 12, s: outB((ts - EVS('turn') - .2) / .25, 1.5) });
  vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.arm10 = (ctx, lt, lf, len, t, f) => {                                           // "Show me the arm first." -> he unwraps it -> the cut
  const ts = t / 60, FR = f / 60;
  if (FR >= EVS('arm_in')) { armInsert(ctx, f, ts); return; }
  const cam = FR < EVS('unwrap') ? { x: 230, y: -255, z: 1.55 } : { x: 505, y: -250, z: lerp(2.0, 2.15, (ts - 2.2) / 2.4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => glassSide10(c, f, ts, { armUp: ts > 2.4, pull: ts > 2.6, unwrap: sstep(ts, 2.8, 4.4), clook: ts > 2.4 ? [.6, .6] : [.9, 0] }) });
  cast10(ctx, f, ts, { D: { x: 40, dir: 1 }, R: { x: 170, dir: 1 }, wide: true, sweat: true, mlook: [.9, 0], mbrow: .6, dlook: [.9, 0], rface: { look: [.9, 0], brow: .9 } });
  ctx.restore(); vig(ctx, .5);
};
SHOT.open10 = (ctx, lt, lf, len, t, f) => {                                          // "Mira. Open it." -> BZZT -> he's in -> they pound the glass
  const ts = t / 60, FR = f / 60, cam = FR < 10.4 ? { x: 0, y: -240, z: 1.9 } : { x: 120, y: -265, z: 1.0 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.2 }, t, [[EVF('shut'), 8], [EVF('th1'), 6], [EVF('th2'), 6]]);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => glassSide10(c, f, ts, { unwrap: 1 }) });
  const cx = ts < 10.75 ? null : ts < 11.9 ? { x: lerp(410, -80, (ts - 10.75) / 1.15), walk: true, dir: -1, unwrap: 1 } : { x: -80, sit: sstep(ts, 11.9, 12.6), dir: sstep(ts, 11.9, 12.2) > .5 ? 1 : -1, unwrap: 1, gauze: ts > 13.6 };
  const D = ts < 11.0 ? { x: 40, dir: ts < 9.6 ? -1 : 1 } : { x: lerp(40, 130, clamp((ts - 11) / .9)), dir: ts < 11.9 ? 1 : -1, moving: ts < 11.9 };
  const R = ts < 11.0 ? { x: 170, dir: 1 } : { x: lerp(170, 260, clamp((ts - 11) / .9)), dir: ts < 11.9 ? 1 : -1, moving: ts < 11.9 };
  cast10(ctx, f, ts, { cole: cx, D, R, wide: ts > 10.4, mdir: 1, mlook: ts < 10.4 ? [.9, 0] : [.9, .2], mbrow: .6, dlook: ts < 9.6 ? [.9, 0] : [.9, .1], rface: { look: [.9, 0], brow: 1 } });
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'BZZT', W / 2 + 120, 560, f, EVF('buzz'), '#6CFF9A', 100, 30, -.06); sfxPop(ctx, 'SLAM', W / 2 + 160, 640, f, EVF('shut'), PAL.chalk, 90, 26, .06);
  ['th1', 'th2'].forEach((k, i) => sfxPop(ctx, 'THUD', W / 2 + 200, 720 + i * 60, f, EVF(k), '#B8E986', 70, 24, .06));
};
SHOT.talk10 = (ctx, lt, lf, len, t, f) => {                                          // who is he: Cole, St. Anne's, six bitten patients
  const ts = t / 60, FR = f / 60;
  const cam = FR < 17.4 ? { x: 110, y: -250, z: 1.9 } : FR < 23.6 ? { x: -60, y: -150, z: lerp(2.0, 2.2, (ts - 17.4) / 6.2) } : FR < 26.2 ? { x: 290, y: -260, z: 2.0 } : { x: -60, y: -150, z: lerp(2.1, 2.25, (ts - 26.2) / 4.4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => glassSide10(c, f, ts, { unwrap: 1 }) });
  cast10(ctx, f, ts, { cole: { ...COLE_SEAT, look: ts > 25.6 && ts < 26.2 ? [.9, -.2] : [.9, -.3], brow: ts > 26.2 ? -1 : -.8 }, mlook: [.9, .1], mbrow: .4, mtype: ts > 29.4, dlook: [.9, .25], dbrow: -.4, rface: { look: [.9, .2], brow: .8 } });
  ctx.restore(); vig(ctx, .45);
};
SHOT.cam4 = (ctx, lt, lf, len, t, f) => {                                            // the van rear on CAM 4 -> Cole looks away
  const ts = t / 60, FR = f / 60;
  if (FR < EVS('react_in')) { vanRear(ctx, f, ts); return; }
  const cam = { x: -60, y: -150, z: lerp(2.2, 2.4, (ts - 37.6) / 2.2) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true });
  cast10(ctx, f, ts, { cole: { ...COLE_SEAT, look: [-.9, .5], brow: .4, wide: false }, mlook: [.9, .1], mbrow: .7, rface: { look: [.9, .2], brow: 1 } });
  ctx.restore(); vig(ctx, .55);
  if (ts > 38.2) marker(ctx, 'HE LOOKED AWAY', W / 2, 1600, 50, PAL.amber, { stroke: 12, s: outB((ts - 38.2) / .25, 1.5) });
};
SHOT.cam5 = (ctx, lt, lf, len, t, f) => garageIR(ctx, f, t / 60);
SHOT.react10 = (ctx, lt, lf, len, t, f) => {                                         // Dev: "It's... looking at us."
  const ts = t / 60, cam = { x: 200, y: -300, z: lerp(2.7, 3.0, (ts - 48.8) / 3.6) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true });
  cast10(ctx, f, ts, { cole: COLE_SEAT, wide: true, sweat: true, dlook: [-.9, -.5], dbrow: -1, rface: { look: [.9, -.4], brow: 1 } });
  ctx.restore(); vig(ctx, .65);
};
SHOT.end10 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 11', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THE QUIET ONES', 0, 0, 110, PAL.red, { stroke: 22 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'WHO CUT THE STRAPS?', W / 2, 960, 52, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR THEORY', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
