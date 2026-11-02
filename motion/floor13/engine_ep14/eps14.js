// eps14.js - Episode 14 "Bite or Scratch": the garage. Ray's arm: three gouges - scratches, not teeth - but Patel's nails were full of his
// own blood; Mira pours alcohol into them (Dev muffles the scream). On the floor: six patients... seven sets of bloody bare footprints - the
// seventh goes to the B1 stairs. Ray's truck: full tank, loud gate. Ray goes quiet for four seconds. Then the stairs door opens: patient
// seven, bitten, still talking - "I'm not one of them. Not yet."
'use strict';
const T0_14 = 37 * 60 + 32, SEV = ['s1'];
const CLUES14 = [[5.0, 'SCRATCH - NOT A BITE'], [21.0, 'SEVEN SETS OF PRINTS'], [30.8, 'TRUCK: FULL TANK, LOUD GATE'], [44.0, 'RAY WENT QUIET'], [50.0, 'PATIENT 7 CAN STILL TALK']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end14[0]) return; const left = Math.max(0, T0_14 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES14.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the garage (B1 stairs far left, roller gate + wicket door back, truck, door TO LOBBY right)
function bareprint(ctx, x, y, d, a) { ctx.save(); ctx.globalAlpha *= a; blob(ctx, x, y, 9, 4, 'rgba(120,20,24,.9)'); for (let i = 0; i < 4; i++) dot(ctx, x + d * (9 + i * 2.5), y - 3 + i * 1.6, 1.8, 'rgba(120,20,24,.9)'); ctx.restore(); }
const TRAILS = [0, 1, 2, 3, 4, 5].map(i => ({ y: 8 + i * 6, x1: -690 + i * 55 }));
function garageSet(ctx, f, ts, o = {}) {
  ctx.fillStyle = '#23252B'; ctx.fillRect(-1500, -820, 3000, 830); ctx.fillStyle = 'rgba(255,255,255,.035)'; for (let y = -800; y < 0; y += 64) ctx.fillRect(-1500, y, 3000, 3);
  for (let i = 0; i < 3; i++) line(ctx, -1500, -700 + i * 28, 1500, -700 + i * 28, 12, '#2E323C');
  rr(ctx, 360, -720, 160, 70, 6, '#3A4458', PAL.ink, 3); glow(ctx, 440, -690, 520, 'rgba(140,170,220,A)', .22);                                   // high window: moonlight
  ctx.fillStyle = '#2C2F37'; ctx.fillRect(-350, -420, 400, 420); for (let y = -410; y < 0; y += 26) line(ctx, -350, y, 50, y, 3, '#20232A');      // roller gate
  marker(ctx, 'EXIT RAMP ↑', -150, -450, 34, '#E8C547', { stroke: .01 });
  rr(ctx, -130, -200, 80, 200, 3, '#05060A', '#555', 3); ctx.save(); ctx.translate(-130, 0); ctx.transform(1, 0, .0, 1, 0, 0); rr(ctx, 0, -200, 36, 200, 3, '#3A3D45', PAL.ink, 2); ctx.restore();   // wicket door, ajar
  ctx.save(); ctx.translate(-70, -120); blob(ctx, 0, 0, 12, 15, BLOOD, 0, .8); for (let j = 0; j < 4; j++) line(ctx, -8 + j * 6, -10, -9 + j * 6, -26, 4, BLOOD); ctx.restore();
  for (const px of [-560, 180]) { ctx.fillStyle = '#30333B'; ctx.fillRect(px, -820, 70, 820); marker(ctx, 'P2', px + 35, -480, 30, '#888', { stroke: .01 }); }
  // Ray's maintenance truck (parked, back)
  ctx.save(); ctx.translate(430, -6); ctx.scale(.9, .9); rr(ctx, -220, -170, 440, 120, 16, '#C9C4B0', PAL.ink, 4); rr(ctx, 60, -250, 150, 100, 14, '#C9C4B0', PAL.ink, 4); rr(ctx, 80, -236, 110, 60, 8, '#2A3242', PAL.ink, 3);
  marker(ctx, 'MAINTENANCE', -70, -100, 26, '#2A3550', { stroke: .01 }); blob(ctx, -140, -40, 40, 40, '#111'); blob(ctx, 140, -40, 40, 40, '#111'); ctx.restore();
  // B1 stairs door (far left) and the door TO LOBBY (right)
  const op = o.b1 || 0; rr(ctx, -908, -328, 156, 328, 4, '#020203', '#59627A', 6); if (op < 1) rr(ctx, -900, -320, 140 * (1 - .78 * op), 320, 3, '#4A4F5C', PAL.ink, 3); marker(ctx, 'B1 STAIRS', -830, -360, 26, '#6CFF9A', { stroke: .01 });
  if (o.smear !== false) { blob(ctx, -790, -150, 10, 16, BLOOD, .3, .85); line(ctx, -790, -136, -788, -90, 4, 'rgba(142,16,24,.7)'); }                     // bloody smear on the handle
  rr(ctx, 760, -328, 156, 328, 4, '#05060A', '#59627A', 6); rr(ctx, 768, -320, 140, 320, 3, '#4A4F5C', PAL.ink, 3); marker(ctx, 'TO LOBBY', 838, -360, 24, '#9AA0B0', { stroke: .01 });
  ctx.fillStyle = '#18191E'; ctx.fillRect(-1500, 0, 3000, 1400); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(-1500, 0, 3000, 3);
  // the prints: six trails in through the wicket door to the wall where they stood, six back out; the seventh to the B1 stairs
  TRAILS.forEach((tr, i) => { for (let k = 0; k < 9; k++) { const u = k / 8, x = lerp(-110, tr.x1, u); bareprint(ctx, x + (k % 2) * 6, tr.y + (k % 2) * 4, -1, .75); } });
  for (let k = 0; k < 7; k++) { const u = k / 6, x = lerp(-700, -810, u); bareprint(ctx, x + (k % 2) * 6, 46 + (k % 2) * 4, -1, .85); }
  if (o.crate) { rr(ctx, 540, -64, 120, 64, 4, '#6A5440', PAL.ink, 3); line(ctx, 540, -32, 660, -32, 3, '#4A3A2A'); }
}
function dark14(ctx, a = .5) { darkness(ctx, a); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(440, -690, 20, 440, -500, 1300); g.addColorStop(0, 'rgba(120,150,210,.28)'); g.addColorStop(1, 'rgba(120,150,210,0)'); ctx.fillStyle = g; ctx.fillRect(-1800, -1800, 3600, 3600); ctx.restore(); }
// ----------------------------------------------------------------------------------------------- people
function rayArm(ctx, x, y, dir, hand, ts) {                                             // his left forearm (body-local hand -> world): torn sleeve, three gouges
  const ax = x + hand[0] * dir, ay = y + hand[1];
  rr(ctx, ax - 30, ay - 10, 60, 22, 8, '#F2EFE6', PAL.ink, 2); for (let i = 0; i < 3; i++) { line(ctx, ax - 20 + i * 14, ay - 6, ax - 12 + i * 14, ay + 10, 5, BLOOD); line(ctx, ax - 12 + i * 14, ay + 12, ax - 10 + i * 14, ay + 22, 4, BLOOD2); }
}
function raySit(ctx, f, ts, o = {}) {                                                    // on the crate, arm out for Mira
  const x = 600, pose = basePose(o.freezeF != null ? 0 : pf3(f + 40), { lean: o.lean == null ? .05 : o.lean, face: rayFace8(f, o.face || {}), hands: { L: [60, -110], R: o.fist ? [30, -150] : [30, -120] } });
  pose.hip = [0, -64]; pose.feet = { L: [50, -4], R: [70, -2] };
  ray(ctx, x, 0, o.freezeF != null ? o.freezeF : f, pose, { dir: -1, aim: .25, light: false }); rayArm(ctx, x, 0, -1, [60, -110], ts);
}
function rayStand(ctx, f, ts, x, o = {}) {
  const tR = lineTalk(f, RAY8), ff = o.freezeF != null ? o.freezeF : f;
  const pose = basePose(o.freezeF != null ? 0 : pf3(f + 40), { lean: .06 + (o.freezeF != null ? 0 : Math.sin(f * .021 + 1) * .02), face: rayFace8(f, o.face || {}), hands: { L: [60, -120], R: [20 + 30 * tR, -100 - 50 * tR] } });
  ray(ctx, x, 0, ff, pose, { dir: o.dir || -1, aim: .25, light: false }); rayArm(ctx, x, 0, o.dir || -1, [60, -120], ts);
}
function miraStand(ctx, f, x, o = {}) { const tM = lineTalk(f, MIRA8); mira(ctx, x, 0, f, { dir: o.dir || 1, look: o.look || [.9, 0], wide: !!o.wide, brow: o.brow == null ? .4 : o.brow, mouth: tM, pose: basePose(pf3(f), { lean: .06, hands: o.hands || { L: [30, -120], R: [40 + 10 * tM, -140 - 30 * tM] } }) }); }
function devStand(ctx, f, x, o = {}) { const tD = devTalk(f); person(ctx, DEVH(x, 0, basePose(pf3(f), { lean: o.lean || .06, face: devFace(f, { wide: !!o.wide, eyes: o.wide ? 1.3 : 1.05, brow: o.brow == null ? -.7 : o.brow, look: o.look || [.9, 0], mouth: tD, sweat: !!o.sweat }), hands: o.hands || { L: [20, -100], R: [40 + Math.sin(f * .17) * 12 * tD, -150 - 35 * tD] } }), { dir: o.dir || -1, hoodie: false }), pf3(f)); }
function coleStand(ctx, f, ts, x, o = {}) { cole10(ctx, x, f, ts, { dir: o.dir || 1, gauze: true, unwrap: 1, look: o.look || [.9, 0], wide: o.wide, pose: basePose(pf3(f + 20), { lean: .1, hands: { L: [30, -120], R: [40 + 12 * lineTalk(f, ['v1', 'v2']), -150 - 30 * lineTalk(f, ['v1', 'v2'])] } }) }); }
function seven(ctx, f, ts, x, a) {                                                        // patient seven: gown, long dark hair, bitten forearm, wristband 7, bloody bare feet
  const talk = lineTalk(f, SEV), raise = sstep(ts, 49.0, 49.6);
  const pose = basePose(pf3(f + 70), { lean: .1, tilt: .08, face: { look: [.9, .1], eyes: 1.25, wide: true, brow: -.7, mouth: talk, smile: -.3, sweat: true }, hands: { L: [lerp(30, 76, raise), lerp(-120, -236, raise)], R: [30, -120] } });
  ctx.save(); ctx.globalAlpha *= a;
  const r = person(ctx, { x, y: 0, s: .98, dir: 1, kind: 'dev', seed: 97, hoodie: false, shirt: '#9AA8B4', pants: '#9AA8B4', pose }, pf3(f)), [hx, hy] = r.head, hr = 39;
  ctx.fillStyle = '#1E1612'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - hr * .95, hy + hr * .2); ctx.arc(hx, hy, hr + 5, Math.PI * .9, Math.PI * 1.7); ctx.lineTo(hx + hr * .55, hy - hr * .82); ctx.quadraticCurveTo(hx - hr * .2, hy - hr * .7, hx - hr * .55, hy + hr * .1); ctx.lineTo(hx - hr * .7, hy + hr * 2.2); ctx.lineTo(hx - hr * 1.05, hy + hr * 2.0); ctx.closePath(); ctx.fill(); ctx.stroke();   // hair
  const lx = x + r.hands[0][0] * .98, ly = r.hands[0][1] * .98; rr(ctx, lx - 14, ly + 12, 28, 26, 6, '#EDEBE3', PAL.ink, 2); blob(ctx, lx, ly + 24, 10, 8, BLOOD2, 0, .9);   // bitten forearm, bandaged
  rr(ctx, lx - 13, ly + 2, 26, 12, 3, '#F4F4F4', PAL.ink, 2); ctx.font = `800 10px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = PAL.red; ctx.fillText('7', lx, ly + 12);
  for (const fx of [-16, 16]) blob(ctx, x + fx, -4, 12, 5, BLOOD, 0, .7);
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- inserts
function armIns14(ctx, f, ts, pour) {
  ctx.fillStyle = '#121318'; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, 900, 700, 'rgba(140,170,220,A)', .14); const sh = pour ? Math.sin(f * 1.9) * 6 : 0, y = 940;
  ctx.save(); ctx.translate(sh, 0);
  rr(ctx, 40, y - 110, 300, 220, 50, '#C8662E', PAL.ink, 6); for (let i = 0; i < 5; i++) line(ctx, 330, y - 100 + i * 45, 360 + (i % 2) * 20, y - 90 + i * 45, 6, '#C8662E');    // torn sleeve
  rr(ctx, 320, y - 90, 560, 180, 80, '#F2EFE6', PAL.ink, 6); dot(ctx, 910, y, 100, '#F2EFE6'); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(910, y, 100, -1.2, 1.9); ctx.stroke();
  if (pour) { ctx.lineCap = 'round'; for (let k = 0; k < 4; k++) line(ctx, 960 + k * 6, y + 40 + k * 18, 1010 + k * 10, y + 30 + k * 16, 30, '#F2EFE6'); }   // fist clenched
  ctx.save(); ctx.beginPath(); rrect(ctx, 326, y - 84, 548, 168, 74); ctx.clip();
  for (let i = 0; i < 3; i++) { const x0 = 430 + i * 110; line(ctx, x0, y - 70, x0 + 150, y + 60, 22, BLOOD); line(ctx, x0 + 3, y - 66, x0 + 148, y + 56, 8, BLOOD2); line(ctx, x0 + 20, y - 50, x0 + 40, y - 30, 5, '#4A3A2A'); }   // gouges, grime
  for (let i = 0; i < 7; i++) { const bx = 450 + i * 60, len = 20 + 60 * clamp((ts - (pour ? 9.6 : 3.0) - hash(i) * 1.5) / 2); line(ctx, bx, y + 60, bx + 2, y + 60 + len, 7, BLOOD2); }
  if (pour) { const u = clamp((ts - EVS('pour')) / .3); for (let i = 0; i < 18; i++) blob(ctx, 450 + hash(i) * 380, y - 40 + hash(i * 3) * 90, 10 + hash(i * 5) * 16, 8 + hash(i * 7) * 10, 'rgba(255,170,190,.85)', 0, u); }   // pink foam
  ctx.restore();
  if (pour) { line(ctx, 640, 0, 640, y - 90, 14, 'rgba(200,230,255,.7)'); rr(ctx, 560, 300, 160, 260, 20, 'rgba(210,235,255,.55)', PAL.ink, 4); marker(ctx, 'ALCOHOL 70%', 640, 450, 26, '#2A3550', { stroke: .01 }); }
  ctx.restore();
  if (!pour && ts > 4.4) marker(ctx, 'NO TEETH MARKS', W / 2, 640, 50, '#6CFF9A', { stroke: 12, s: outB((ts - 4.4) / .25, 1.5) });
  if (!pour && ts > 5.6) marker(ctx, 'BUT HIS NAILS WERE BLOODY', W / 2, 1580, 40, PAL.red, { stroke: 10, a: sstep(ts, 5.6, 5.9) });
  if (pour) sfxPop(ctx, 'FSSSHH', W / 2 - 120, 640, f, EVF('pour'), '#FFB0C0', 90, 50, -.06);
  vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.arm14 = (ctx, lt, lf, len, t, f) => {                                               // by the door TO LOBBY: Ray on a crate, Mira treats the arm
  const ts = t / 60, FR = f / 60;
  if (FR >= EVS('ins_in') && FR < EVS('ins_out')) { armIns14(ctx, f, ts, false); return; }
  if (FR >= EVS('pour') && FR < 11.2) { armIns14(ctx, f, ts, true); return; }
  const cam = FR < EVS('ins_in') ? { x: 525, y: -230, z: 1.8 } : FR < EVS('pour') ? { x: 430, y: -255, z: 2.2 } : { x: 630, y: -210, z: 2.4 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []);
  garageSet(ctx, f, ts, { crate: true });
  coleStand(ctx, f, ts, 140, { dir: 1, look: [.9, 0] });
  miraStand(ctx, f, 400, { dir: 1, look: [.9, .3], brow: .3, hands: FR >= 7.6 && FR < 9.6 ? { L: [60, -170], R: [40, -150] } : { L: [70, -110], R: [60, -100] } });
  if (FR >= 7.6 && FR < 9.6) rr(ctx, 400 + 52, -230, 30, 54, 6, 'rgba(210,235,255,.7)', PAL.ink, 3);                                    // the alcohol bottle in her hand
  const muffle = FR >= 11.2 && ts < 11.5;
  raySit(ctx, f, ts, { face: { look: muffle ? [.6, -.4] : [.9, .2], brow: 1, eyes: muffle ? .3 : .9 }, fist: muffle });
  devStand(ctx, f, 760, { dir: -1, wide: true, look: [.9, .4], hands: muffle ? { L: [20, -100], R: [140, -210] } : undefined });
  dark14(ctx, .45); ctx.restore(); vig(ctx, .55);
};
SHOT.prints14 = (ctx, lt, lf, len, t, f) => {                                            // the floor: seven trails; the seventh goes to the B1 stairs
  const ts = t / 60, FR = f / 60;
  const cam = FR < EVS('smear') ? { x: lerp(200, -480, sstep(ts, 14.8, 19.5)), y: -150, z: lerp(1.15, 1.45, sstep(ts, 14.8, 19.5)) } : { x: -800, y: -170, z: 2.2 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []); garageSet(ctx, f, ts); dark14(ctx, .42); ctx.restore(); vig(ctx, .55);
  if (FR >= EVS('count') && FR < EVS('smear')) { for (let i = 0; i < 7; i++) { const a = clamp((ts - EVS('count') - i * .28) / .2); if (a <= 0) continue;
      const wx = i < 6 ? TRAILS[i].x1 : -810, wy = i < 6 ? TRAILS[i].y : 46, sx = W / 2 + (wx - cam.x) * cam.z, sy = H / 2 + (wy - cam.y) * cam.z - 90;
      marker(ctx, String(i + 1), sx, sy, i === 6 ? 70 : 52, i === 6 ? PAL.red : PAL.chalk, { stroke: 12, s: outB(a, 1.5) }); } }
  if (FR >= EVS('smear')) marker(ctx, 'BLOOD ON THE HANDLE', W / 2, 1600, 48, PAL.red, { stroke: 12, s: outB((ts - EVS('smear')) / .25, 1.5) });
};
const POS14 = { cole: -260, mira: -110, dev: 40, ray: 190 };
function group14(ctx, f, ts, o = {}) {
  coleStand(ctx, f, ts, POS14.cole, { dir: o.cdir || 1, look: o.clook, wide: o.wide });
  miraStand(ctx, f, POS14.mira, { dir: o.mdir || 1, look: o.mlook, wide: o.wide, brow: o.wide ? .8 : .4 });
  devStand(ctx, f, POS14.dev, { dir: o.ddir || -1, look: o.dlook, wide: o.wide, sweat: o.wide, brow: o.dbrow });
  rayStand(ctx, f, ts, POS14.ray, { dir: o.rdir || -1, face: o.rface || {}, freezeF: o.rayFreeze });
}
SHOT.truck14 = (ctx, lt, lf, len, t, f) => {                                             // the truck, the gate, the rule; wait for sunrise
  const ts = t / 60, FR = f / 60;
  const cam = FR < 29.2 ? { x: 230, y: -250, z: 1.9 } : FR < 33.0 ? { x: -250, y: -250, z: 2.2 } : FR < 34.8 ? { x: -110, y: -230, z: 2.2 } : { x: 60, y: -250, z: lerp(1.15, 1.25, (ts - 34.8) / 2.8) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []); garageSet(ctx, f, ts);
  group14(ctx, f, ts, { rdir: FR < 29.2 ? 1 : -1, rface: { look: FR < 29.2 ? [.9, -.1] : [.9, 0] }, cdir: 1, mdir: 1, ddir: -1 });
  dark14(ctx, .45); ctx.restore(); vig(ctx, .55);
};
SHOT.quiet14 = (ctx, lt, lf, len, t, f) => {                                             // Ray stops. Doesn't blink. "Ray?" ... "Sorry. I'm here."
  const ts = t / 60, FR = f / 60, stare = FR >= EVS('stare') && FR < EVS('blink');
  const cam = FR < EVS('stare') ? { x: 80, y: -250, z: 2.1 } : FR < EVS('blink') ? { x: 190, y: -300, z: lerp(2.9, 3.3, (ts - 40.2) / 3.2) } : { x: 120, y: -250, z: 2.0 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .8 }, t, []); garageSet(ctx, f, ts);
  const blinking = ts >= EVS('blink') && ts < EVS('blink') + .12;
  group14(ctx, f, ts, { wide: ts > 39, dlook: [.9, 0], dbrow: -1, rdir: 1, rayFreeze: ts > 38.4 && ts < EVS('blink') ? 0 : null, rface: { look: [.9, 0], brow: 0, eyes: blinking ? .1 : 1.1, smile: 0 } });
  dark14(ctx, stare ? .55 : .45); ctx.restore(); vig(ctx, stare ? .75 : .55);
  if (stare && ts > 41.4) marker(ctx, "HE ISN'T BLINKING", W / 2, 1600, 46, PAL.red, { stroke: 12, a: sstep(ts, 41.4, 41.7) });
};
SHOT.seventh = (ctx, lt, lf, len, t, f) => {                                             // the B1 stairs door opens. Patient seven.
  const ts = t / 60, FR = f / 60, b1 = sstep(ts, EVS('creak'), EVS('creak') + 1.0), sx = lerp(-830, -720, sstep(ts, EVS('step'), EVS('step') + 1.0)), sa = clamp((ts - EVS('appear')) / .6);
  const cam = FR < 47.6 ? { x: -420, y: -260, z: 1.05 } : FR < 52.0 ? { x: -700, y: -250, z: lerp(2.1, 2.3, (ts - 47.6) / 4.4) } : { x: -280, y: -260, z: 1.05 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.0 }, t, []); garageSet(ctx, f, ts, { b1 });
  if (ts > EVS('appear')) seven(ctx, f, ts, sx, sa);
  group14(ctx, f, ts, { wide: true, cdir: -1, mdir: -1, ddir: -1, rdir: -1, clook: [.9, 0], mlook: [.9, 0], dlook: [.9, 0], rface: { look: [.9, 0], brow: 1 } });
  dark14(ctx, .45); ctx.restore(); vig(ctx, .55);
  sfxPop(ctx, 'creeeak', W / 2 - 100, 600, f, EVF('creak'), '#9AA0B0', 70, 60, -.04);
};
SHOT.end14 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 15', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'PATIENT 7', 0, 0, 130, PAL.red, { stroke: 24 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'TRUST HER OR NOT?', W / 2, 960, 52, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR CALL', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
