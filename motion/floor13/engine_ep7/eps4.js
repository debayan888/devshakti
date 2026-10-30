// eps4.js - Episode 4 "Who Is Mira?": floor 7 gym. Clues: Mira knows Dev's name; the landlord's maintenance keycard; his note on the locked studio;
// two warnings that contradict each other; someone alive behind the STAFF door.
'use strict';
const T0 = 46 * 60 + 49;                                                            // countdown continues from Ep3 (46:49)
function curFloor(f) { return 7; }
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end4[0]) return; const left = Math.max(0, T0 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  clueBoard(ctx, f);
}
// clue tracker (top right): fills in as clues are found -> viewers keep score, and the clues pay off later
const CLUES = [['ev_m2', 'SHE KNOWS MY NAME'], ['ev_card', "LANDLORD'S KEYCARD"], ['ev_note', 'HE LOCKED THEM IN'], ['ev_warn', 'TWO WARNINGS']];
function clueBoard(ctx, f) {
  const ts = f / 60, got = [ts >= 9.0, ts >= 21.0, ts >= 25.0, ts >= 34.0]; if (!got[0]) return;
  ctx.save(); ctx.translate(W - 60, 230); const n = got.filter(Boolean).length;
  rr(ctx, -420, -50, 420, 60 + n * 52, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 26px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('CLUES', -396, -14);
  CLUES.forEach(([, txt], i) => { if (!got[i]) return; const a = [9.0, 21.0, 25.0, 34.0][i], k = clamp((ts - a) / .3);
    ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -396, 30 + i * 52); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -362, 30 + i * 52); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the gym set
function staffDoor(ctx, f, open = 0, beam = 0) {
  const x = -535, w = 130, h = 280;
  ctx.fillStyle = '#05070B'; ctx.fillRect(x - 10, -h - 10, w + 20, h + 10);
  if (open > 0) { ctx.fillStyle = '#E8D9A8'; ctx.fillRect(x, -h, w * open, h); }
  ctx.save(); ctx.translate(x, 0); ctx.transform(Math.cos(open * 1.2), 0, 0, 1, 0, 0); ctx.fillStyle = '#3B4048'; ctx.fillRect(0, -h, w, h); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 4; ctx.strokeRect(12, -h + 14, w - 24, h - 28);
  ctx.fillStyle = '#D8D8D0'; ctx.fillRect(18, -h + 40, w - 36, 34); ctx.font = `800 17px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = PAL.red; ctx.fillText('STAFF ONLY', w / 2, -h + 63); ctx.restore();
  if (beam > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x, 0, x + w + 260, 0); g.addColorStop(0, `rgba(255,240,190,${.55 * beam})`); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 6, -6); ctx.lineTo(x + w, -6); ctx.lineTo(x + w + 260 + Math.sin(f * .07) * 60, 30); ctx.lineTo(x - 40, 30); ctx.fill(); ctx.restore(); }
}
function gymBag(ctx, x, f, open) { rr(ctx, x - 70, -60, 140, 60, 24, '#2B3A5C', PAL.ink, 4); line(ctx, x - 40, -60, x - 20, -86, 6, '#1A2238'); line(ctx, x + 40, -60, x + 20, -86, 6, '#1A2238'); if (open) { ctx.fillStyle = '#10141F'; ctx.beginPath(); ctx.ellipse(x, -60, 56, 12, 0, 0, TAU); ctx.fill(); } else line(ctx, x - 50, -58, x + 50, -58, 3, '#C9A24A'); }
function noteOnGlass(ctx) { ctx.save(); ctx.translate(320, -250); ctx.rotate(.05); rr(ctx, -44, -34, 88, 70, 3, '#F2EAC8', PAL.ink, 2); for (let i = 0; i < 4; i++) line(ctx, -32, -18 + i * 14, 30 - i * 6, -18 + i * 14, 3, '#333'); ctx.fillStyle = 'rgba(255,230,120,.8)'; ctx.fillRect(-18, -40, 36, 12); ctx.restore(); }
function gymSet(ctx, f, o = {}) {
  adjacentFloors(ctx, f, 13, .55); roomShell(ctx, 13, f, { wall: '#26262E', la: .14 }); brokenWindow(ctx, -400, 0, f);
  staffDoor(ctx, f, o.doorOpen || 0, o.beam || 0); mirrorMsg(ctx, f, 1); treadmill(ctx, -40, f, 1);
  const bang = o.bang || 0, hit = bang ? Math.exp(-((f % 34)) / 6) : 0;
  ctx.fillStyle = 'rgba(10,14,20,.75)'; ctx.fillRect(250, -520, 290, 520);
  for (let i = 0; i < 3; i++) { const zx = 300 + i * 85; person(ctx, { x: zx + (bang ? -8 * hit : Math.sin(f * .02 + i) * 14), y: 0, s: .9, dir: -1, kind: 'z', seed: 50 + i, var: (i * 2 + 1) % 5,
      pose: basePose(pf5(f + i * 7), { lean: .15 + (bang ? .15 : 0), tilt: .3 + Math.sin(f * .05 + i) * .1, hands: bang ? { L: [90 + hit * 6, -200 - i * 6], R: [84 + hit * 6, -150] } : { L: [30, -100], R: [24, -96] }, face: { look: [.9, 0], mouth: bang ? 1 : null } }) }, pf5(f + i * 7)); }
  ctx.fillStyle = 'rgba(150,200,240,.16)'; ctx.fillRect(246, -520, 294, 520); ctx.strokeStyle = 'rgba(220,240,255,.5)'; ctx.lineWidth = 6; ctx.strokeRect(246, -520, 294, 520); line(ctx, 393, -520, 393, 0, 6, 'rgba(220,240,255,.4)');
  rr(ctx, 355, -90, 76, 70, 6, '#6A6F80', PAL.ink, 3); line(ctx, 355, -55, 431, -55, 8, '#9AA0B0'); ctx.strokeStyle = '#9AA0B0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(393, -96, 18, Math.PI, TAU); ctx.stroke();
  noteOnGlass(ctx); gymBag(ctx, 160, f, o.bagOpen);
}
// Dev's position / pose over the whole episode (continuous across shots)
function devX4(ts) { return kf(ts, [[0, -300], [15.9, -300], [16.9, -60, E.ioQ], [17.4, -60], [18.3, 120, E.ioQ], [34.9, 120], [35.6, 120], [37.0, -280, E.ioQ]]); }
function devState4(ts, f) {
  const x = devX4(ts), moving = (ts > 15.9 && ts < 16.9) || (ts > 17.4 && ts < 18.3) || (ts > 35.6 && ts < 37.0);
  const dir = (ts > 35.0) ? -1 : 1, crouch = sstep(ts, 18.4, 18.8) * (1 - sstep(ts, 22.8, 23.3));
  const talkR = (ts < 15.6) || (ts > 28.3 && ts < 31.9), lk = ts < 4 ? [.2, 0] : ts > 12.6 && ts < 14.2 ? [-.9, 0] : ts > 14.2 && ts < 15.6 ? [-.4, .6] : ts > 23.0 && ts < 28.2 ? [.9, -.3] : ts > 31.8 && ts < 35 ? [-.6, -.9] : ts > 35 ? [.9, 0] : [.9, 0];
  const face = devFace(f, { wide: ts > 1.6 && ts < 4 || ts > 35, eyes: ts > 1.6 && ts < 4 ? 1.35 : 1.1, brow: ts > 9.2 && ts < 10.6 ? .3 : -.7, smile: ts > 9.2 && ts < 10.6 ? .9 : .2, mouth: devTalk(f), look: lk, sweat: ts > 35 });
  let pose;
  if (moving) pose = walkPose(x / 184, { stride: ts > 35 ? 26 : 46, lift: ts > 35 ? 18 : 26, lean: .1, face, hands: talkR ? { L: [20, -100], R: [40, -226] } : undefined });
  else pose = basePose(pf3(f), { lean: .55 * crouch + .04, hip: [0, -104 + 40 * crouch], feet: { L: [-16, 0], R: [22 + 20 * crouch, 0] }, face, hands: { L: crouch > .1 ? [70, -40 + 30 * (1 - crouch)] : [20, -100], R: talkR ? [40, -226] : [36, -150] } });
  return { x, dir, pose };
}
function drawDev4(ctx, ts, f) { const s = devState4(ts, f); person(ctx, { ...DEVH(s.x, 0, s.pose, { dir: s.dir, hoodie: false }), holdHand: 1, holdProp: (c, a) => walkie(c, a[0] + 6, a[1] + 10, f, ts > 28.3 && ts < 31.7 || ts < 1.6, -.2) }, pf3(f)); }
function gymShot(ctx, t, f, cam, o = {}, imp) {
  const ts = t / 60; ctx.save(); applyCam(ctx, { ...cam, hand: 1.5 }, t, imp || []); gymSet(ctx, f, o); drawDev4(ctx, ts, f); ctx.restore(); vig(ctx, .5);
}
// ----------------------------------------------------------------------------------------------- inserts
function walkieInsert(ctx, f, lineId) {
  ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, 800, 700, 'rgba(255,210,120,A)', .12);
  const l = LN(lineId), e = (f >= l.t0 && f < l.t0 + l.n) ? (ENV[lineId][f - l.t0] || 0) : 0;
  ctx.save(); ctx.translate(W / 2 + Math.sin(f * 2) * e * 3, 830); ctx.rotate(-.06);
  rr(ctx, -200, -420, 400, 760, 50, '#1E2A1E', '#5A6A5A', 8); rr(ctx, 60, -620, 50, 220, 18, '#222', '#555', 5);
  rr(ctx, -150, -360, 300, 120, 16, '#0E1A10', '#4A5A4A', 4); ctx.font = `800 40px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = '#6CFF9A'; ctx.fillText('CH 7  LOBBY', 0, -285);
  for (let i = 0; i < 7; i++) { const w = 220 * (.4 + .6 * e * (.6 + .4 * hash(i + Math.floor(f / 3)))); rr(ctx, -w / 2, -170 + i * 44, w, 22, 10, e > .05 ? '#3A5A3A' : '#2A3A2A'); }
  blob(ctx, -120, -390, 14, 14, e > .05 && (f % 12) < 8 ? PAL.red : '#400');
  ctx.restore();
  rr(ctx, W / 2 - 380, 1150, 760, 600, 140, PAL.skin, PAL.ink, 7); for (let k = 0; k < 3; k++) rr(ctx, W / 2 + 170, 840 + k * 104, 130, 100, 50, PAL.skin, PAL.ink, 6);
  vig(ctx, .6);
}
function cardInsert(ctx, f, ts) {
  ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, W, H); const rise = E.outQ(clamp((ts - 19.4) / .5));
  ctx.save(); ctx.translate(W / 2, lerp(1300, 760, rise)); ctx.rotate(-.05 + Math.sin(f * .05) * .01);
  rr(ctx, -380, -240, 760, 480, 30, '#F4F1E6', PAL.ink, 6); ctx.fillStyle = '#1C4E9C'; ctx.fillRect(-374, -234, 748, 90); marker(ctx, 'BUILDING MAINTENANCE', 0, -172, 44, '#fff', { stroke: .01 });
  rr(ctx, -340, -120, 230, 280, 12, '#C9D6E0', PAL.ink, 4);                                                  // photo: the landlord, still human
  person(ctx, { x: -225, y: 260, s: 1.15, dir: 1, kind: 'dev', seed: 81, hoodie: false, pose: basePose(0, { lean: 0, hands: { L: [10, -100], R: [16, -100] }, face: { look: [.1, 0], smile: .3, mouth: 0, eyes: 1 } }) }, 0);
  ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.moveTo(-226, 30); ctx.lineTo(-214, 34); ctx.lineTo(-218, 110); ctx.lineTo(-232, 104); ctx.fill();
  ctx.font = `800 64px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.ink; ctx.fillText('B. PATEL', -80, -50);
  ctx.font = `800 34px ${FONTS.sansX}`; ctx.fillStyle = '#555'; ctx.fillText('ACCESS: ALL FLOORS', -80, 10); ctx.fillText('SERVICE STAIRS: YES', -80, 60);
  for (let i = 0; i < 30; i++) ctx.fillRect(-80 + i * 14, 110, i % 3 ? 6 : 10, 70);
  ctx.restore();
  rr(ctx, W / 2 + 200, 900, 300, 260, 100, PAL.skin, PAL.ink, 6);
  if (ts > 21.2) { const k = outB((ts - 21.2) / .25, 1.5); ctx.save(); ctx.translate(W / 2, 1180); ctx.scale(k, k); marker(ctx, 'MY LANDLORD = MAINTENANCE', 0, 0, 52, '#B8E986', { stroke: 12 }); ctx.restore(); }
  vig(ctx, .6);
}
function noteInsert(ctx, f, ts) {
  ctx.fillStyle = '#0A1016'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) { const x = 160 + i * 250, y = 520 + (i % 2) * 120, pr = Math.exp(-((f + i * 9) % 34) / 7); blob(ctx, x, y + pr * 6, 70, 90, 'rgba(120,150,110,.45)'); for (let k = 0; k < 4; k++) blob(ctx, x - 45 + k * 30, y - 90, 14, 30, 'rgba(120,150,110,.45)'); }
  ctx.fillStyle = 'rgba(150,200,240,.12)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(260, 0); ctx.lineTo(60, H); ctx.lineTo(0, H); ctx.fill();
  ctx.save(); ctx.translate(W / 2, 800); ctx.rotate(.04); rr(ctx, -340, -260, 680, 520, 8, '#F2EAC8', PAL.ink, 6); ctx.fillStyle = 'rgba(255,230,120,.85)'; ctx.fillRect(-90, -290, 180, 50);
  ctx.fillStyle = '#1A1A1A'; ctx.font = `800 70px ${FONTS.sansX}`; ctx.textAlign = 'center';
  const b = Math.floor(f / 5); [["DON'T OPEN.", -120], ['THEY WERE', 0], ['MY TENANTS.', 100]].forEach(([w, y], i) => { ctx.save(); ctx.translate(jit(i, b, 1.5), y); ctx.rotate(-.03 + i * .02); ctx.fillText(w, 0, 0); ctx.restore(); });
  ctx.font = `800 46px ${FONTS.sansX}`; ctx.fillText('— B.P.', 160, 200); ctx.restore(); vig(ctx, .6);
}
function doorInsert(ctx, f, ts) {                                                       // close on the STAFF door: footsteps, light, handle, a human hand
  ctx.fillStyle = '#07090D'; ctx.fillRect(0, 0, W, H);
  const crack = E.outQ(clamp((ts - EVS('crack')) / .5)) * 120, z = 1 + .015 * (ts - 36.8);
  ctx.save(); ctx.translate(W / 2, H * .46); ctx.scale(z, z); ctx.translate(-W / 2, -H * .46 + 120);
  ctx.fillStyle = '#E8D9A8'; ctx.fillRect(W / 2 - 300, 260, crack, 1120);
  ctx.fillStyle = '#3B4048'; ctx.fillRect(W / 2 - 300 + crack, 260, 600 - crack * .3, 1120); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 8; ctx.strokeRect(W / 2 - 250 + crack, 320, 500 - crack * .3, 1000);
  ctx.fillStyle = '#D8D8D0'; ctx.fillRect(W / 2 - 200 + crack, 400, 400, 120); marker(ctx, 'STAFF ONLY', W / 2 + crack, 482, 70, PAL.red, { stroke: .01 });
  const hr = ts >= EVS('handle') ? Math.sin(clamp((ts - EVS('handle')) / .5) * Math.PI) * .6 + (ts > EVS('handle') + .5 ? .2 : 0) : 0;
  ctx.save(); ctx.translate(W / 2 - 220 + crack, 880); ctx.rotate(hr); rr(ctx, -20, -20, 150, 40, 18, '#C9CCD6', PAL.ink, 5); ctx.restore(); blob(ctx, W / 2 - 220 + crack, 880, 34, 34, '#A9ACB6');
  const beam = ts >= EVS('beam') ? clamp((ts - EVS('beam')) / .4) : 0; if (beam) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x0 = W / 2 - 300 + (Math.sin(f * .06) * .5 + .5) * 600; const g = ctx.createRadialGradient(x0, 1380, 10, x0, 1380, 380); g.addColorStop(0, `rgba(255,240,190,${.7 * beam})`); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1300, W, 300); ctx.restore(); ctx.fillStyle = `rgba(255,240,190,${.9 * beam})`; ctx.fillRect(W / 2 - 300, 1374, 600, 8); }
  if (ts >= EVS('hand')) { const k = E.outQ(clamp((ts - EVS('hand')) / .3)); ctx.save(); ctx.translate(W / 2 - 300 + crack * .6, 800); line(ctx, -200 + k * 40, 30, 20, 0, 48, '#2E3A5C'); blob(ctx, 40, 0, 40, 34, PAL.skin); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(40, 0, 40, 34, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) rr(ctx, 60, -28 + i * 16, 48, 14, 7, PAL.skin, PAL.ink, 3); rr(ctx, 70, -54, 140, 40, 10, '#333', PAL.ink, 4); ctx.restore(); }
  ctx.restore();
  if (ts >= EVS('freeze')) { tint(ctx, '#ffffff', .08); marker(ctx, 'ALIVE?', W / 2, 1150, 120, '#FFD27A', { stroke: 22, s: outB((ts - EVS('freeze')) / .2, 1.5) }); }
  vig(ctx, .65);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.hook = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts < EVS('face_in')) { walkieInsert(ctx, f, 'm1'); return; }
  const z = lerp(3.8, 4.4, (ts - 1.6) / 2.4); ctx.save(); applyCam(ctx, { x: -260, y: -236, z, hand: 2.4 }, t, [[EVF('face_in'), 18]]); gymSet(ctx, f, {}); drawDev4(ctx, ts, f); ctx.restore(); fadeBottom(ctx); vig(ctx, .6);
  if (ts > 2.9) { const k = outB((ts - 2.9) / .25, 1.5); ctx.save(); ctx.translate(W / 2 + 200, 520); ctx.scale(k, k); marker(ctx, '?!', 0, 0, 160, PAL.red, { stroke: 24 }); ctx.restore(); }
};
SHOT.talk = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, cam = CAMKEYS(ts, [[4, -280, -240, 1.6, E.ioC], [5.4, -200, -240, 1.25, E.ioC], [12.4, -200, -240, 1.25, E.ioC], [13.2, -380, -240, 1.15, E.ioC], [15.6, -200, -230, 1.0]]);
  gymShot(ctx, t, f, cam, { beam: 0 });
  if (ts > 12.7 && ts < 15.4) { const k = outB((ts - 12.7) / .25, 1.5); ctx.save(); ctx.translate(W / 2 - 160, 560); ctx.scale(k, k); marker(ctx, 'SERVICE STAIRS →', 0, 0, 60, '#FFD27A', { stroke: 14 }); ctx.restore(); }
};
SHOT.search = (ctx, lt, lf, len, t, f) => { const ts = t / 60, cam = CAMKEYS(ts, [[15.6, -200, -230, 1.0, E.ioC], [17.2, 60, -220, 1.2, E.ioC], [19.4, 140, -150, 1.8]]); gymShot(ctx, t, f, cam, { bang: ts > EVS('z_bang'), bagOpen: ts > EVS('bag_open') }, [[EVF('z_bang'), 14]]);
  sfxPop(ctx, 'BANG!', W / 2 + 240, 560, f, EVF('z_bang'), PAL.red, 110, 30, .06); sfxPop(ctx, 'ZIP', W / 2 - 60, 900, f, EVF('bag_open'), PAL.chalk, 90, 26, -.06); };
SHOT.card = (ctx, lt, lf, len, t, f) => cardInsert(ctx, f, t / 60);
SHOT.note = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60; if (ts >= EVS('note_in') && ts < EVS('note_out')) { noteInsert(ctx, f, ts); return; }
  const cam = CAMKEYS(ts, [[23, 200, -260, 1.5, E.ioC], [23.6, 260, -260, 2.0, E.ioC], [26.0, 300, -200, 1.7, E.ioC], [28.2, 260, -220, 1.5]]); gymShot(ctx, t, f, cam, { bang: true, bagOpen: true });
  sfxPop(ctx, 'CLINK', W / 2 + 120, 760, f, EVF('lock_touch'), PAL.chalk, 90, 26, .06);
};
SHOT.warn = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, cam = CAMKEYS(ts, [[28.2, 150, -230, 1.3, E.ioC], [31.6, 150, -230, 1.3, E.ioC], [32.4, 90, -360, 1.9, E.ioC], [35.0, 60, -330, 1.6]]); gymShot(ctx, t, f, cam, { bang: ts < 30, bagOpen: true });
  sfxPop(ctx, 'KSSHH…', W / 2 - 160, 560, f, EVF('crackle'), '#FFD27A', 100, 34, -.06);
  if (ts > 32.6) { ctx.save(); ctx.globalAlpha = sstep(ts, 32.6, 33.0); rr(ctx, 70, 1560, 940, 150, 26, 'rgba(8,10,18,.88)', 'rgba(255,255,255,.2)', 3); marker(ctx, "MIRROR: DON'T TRUST THE LOBBY", W / 2, 1618, 42, '#E8524A', { stroke: 10 }); marker(ctx, "MIRA: DON'T TRUST ANYONE UP HERE", W / 2, 1680, 42, '#FFD27A', { stroke: 10 }); ctx.restore(); }
};
SHOT.door = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60;
  if (ts >= EVS('handle') - .2) { doorInsert(ctx, f, ts); return; }
  const cam = CAMKEYS(ts, [[35, 60, -250, 1.2, E.ioC], [35.7, -250, -230, 1.05, E.ioC], [37.0, -360, -230, 1.3]]);
  gymShot(ctx, t, f, cam, { bagOpen: true, beam: ts >= EVS('beam') ? clamp((ts - EVS('beam')) / .4) : 0 }, [[EVF('steps'), 8]]);
  sfxPop(ctx, 'STEP… STEP…', W / 2 - 150, 560, f, EVF('steps'), PAL.chalk, 80, 50, -.06);
};
SHOT.end4 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,210,120,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 560); ctx.scale(u, u); marker(ctx, 'PART 5', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 790); ctx.scale(k, k); marker(ctx, 'BEHIND THE DOOR', 0, 0, 104, '#FFD27A', { stroke: 24 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'CLUES SO FAR: 4  •  WHO WROTE THE MIRROR?', W / 2, 980, 40, PAL.amber, { stroke: 12 }); marker(ctx, 'LAST VAN AT SUNRISE  •  46 MIN LEFT', W / 2, 1050, 40, '#B8E986', { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
