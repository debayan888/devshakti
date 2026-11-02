// eps9.js - Episode 9 "The Driver": no engine = no beacon. Mira rewinds CAM 3: the driver was alive, playing dead, and only moved
// while the dead groaned (his noise hidden under theirs). He crawled under the van and in through the automatic doors. The van is a
// hospital transfer van, not a rescue. Two minutes later: a hand on the booth glass. "It's glass. I swear it's glass." Dev's call.
'use strict';
const T0_9 = 42 * 60 + 20, DRV9 = ['v1', 'v2'];
const CLUES9 = [[3.2, 'NO ENGINE = NO BEACON'], [14.8, 'HE MOVES UNDER THEIR NOISE'], [21.6, 'HOSPITAL TRANSFER VAN'], [28.0, 'SOMEONE IS IN THE LOBBY'], [41.4, 'BITE... OR GLASS?']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end9[0]) return; const left = Math.max(0, T0_9 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES9.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- the groan windows: the driver moves only inside these
const GROAN9 = [[10.0, 11.0], [12.0, 13.0], [13.0, 14.6], [15.6, 17.4], [18.2, 20.6], [21.0, 23.2]];
const groaning = ts => GROAN9.some(([a, b]) => ts >= a && ts < b);
function crawlU(ts) { let acc = 0, tot = 0; for (const [a, b] of GROAN9) if (a >= 13) { tot += b - a; acc += clamp(ts - a, 0, b - a); } return acc / tot; }
// ----------------------------------------------------------------------------------------------- CCTV playback (Mira's monitor, full screen)
function cctvFrame(ctx, f, label, stamp, o = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(110, 410, W - 220, 700); ctx.restore();
  for (let y = 410; y < 1110; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(110, y, W - 220, 2); }
  if (o.rew) for (let i = 0; i < 4; i++) { const y = 420 + hash(Math.floor(f / 2) * 7 + i) * 660; ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(110 + hash(f + i) * 60, y, W - 280, 6 + hash(i + f) * 10); }
  marker(ctx, label, 320, 470, 32, '#6CFF9A', { stroke: 8 }); marker(ctx, o.rew ? '◀◀ REWIND' : 'PLAYBACK ▶', W - 250, 470, 30, o.rew ? '#FFD27A' : PAL.chalk, { stroke: 8 });
  marker(ctx, stamp, W - 250, 1070, 30, '#E8E8E8', { stroke: 8 });
}
const stamp9 = ts => { const s = 8 * 60 + 10 + Math.floor(ts < 9.2 ? 9.2 - (ts - 8) * 9 : ts - 9.2); return `04:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} AM`; };
function tapeCab(ctx, f, ts) {                                                       // the cab, seen from CAM 3: he slides down out of his seat while they groan
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10);
  const rew = ts < EVS('play'), down = rew ? 1 - sstep(ts, 8.5, 9.0) : sstep(ts, 12.2, 12.9), buckle = !rew && ts > 10.2;
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 760); ctx.scale(1.15, 1.15);
  ctx.fillStyle = '#1A1D24'; ctx.fillRect(-500, -400, 1000, 800); rainField(ctx, f, -500, 500, -400, 400, 90);
  rr(ctx, -380, -260, 760, 520, 40, '#D8D6CC', PAL.ink, 6); rr(ctx, -320, -220, 640, 260, 24, '#46546C', PAL.ink, 5);
  ctx.save(); ctx.beginPath(); rrect(ctx, -320, -220, 640, 260, 24); ctx.clip(); glow(ctx, 60, 60, 260, 'rgba(120,200,255,A)', .35);
  rr(ctx, 10, -90, 100, 150, 20, '#3A4252', '#1A1E28', 4); rr(ctx, 30, -150, 60, 50, 14, '#3A4252', '#1A1E28', 4);
  const dy = down * 190, lean = buckle ? .12 : 0;
  ctx.save(); ctx.translate(60, dy); ctx.rotate(lean); blob(ctx, 0, -60, 52, 52, '#05060A'); ctx.fillStyle = '#05060A'; ctx.beginPath(); ctx.moveTo(-100, 40); ctx.quadraticCurveTo(0, -30, 100, 40); ctx.fill();
  if (!buckle || down > .5) { line(ctx, -70, 30, -120, 10, 14, '#05060A'); line(ctx, 70, 30, 120, 10, 14, '#05060A'); } else { line(ctx, 40, 20, 10, 70, 14, '#05060A'); line(ctx, -70, 30, -120, 10, 14, '#05060A'); } ctx.restore();
  if (down > .3) { line(ctx, 100, -120, 30, 30, 8, '#14171E'); line(ctx, 30, 30, 20, 60, 8, '#14171E'); } else line(ctx, 100, -120, -20 + down * 40, 40, 8, '#14171E');   // the belt
  ctx.strokeStyle = '#1A1E28'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(60, 20, 90, 30, 0, Math.PI, TAU); ctx.stroke();
  ctx.restore(); rr(ctx, -340, 90, 680, 70, 12, '#B9B7AE'); ctx.fillStyle = PAL.red; ctx.fillRect(-20, 100, 40, 50);
  ctx.restore();
  cctvFrame(ctx, f, 'CAM 3 · ENTRANCE', stamp9(ts), { rew });
  if (!rew) marker(ctx, groaning(ts) ? '[ GROANING ]' : '[ SILENCE ]', W / 2, 560, 40, groaning(ts) ? '#B8E986' : '#9AA0B0', { stroke: 10 });
  vig(ctx, .6);
}
function crawler(ctx, x, f, moving) {                                                // a man flat on the wet ground, elbow-crawling
  const ph = moving ? Math.sin(f * .35) : 0;
  ctx.save(); ctx.translate(x, -14); blob(ctx, 0, 0, 46, 13, '#0A0B0F'); blob(ctx, -54, -6, 14, 14, '#0A0B0F');
  line(ctx, -30, 0, -66 + ph * 10, 10, 9, '#0A0B0F'); line(ctx, -20, 2, -56 - ph * 10, 12, 9, '#0A0B0F'); line(ctx, 40, 2, 76 - ph * 8, 10, 9, '#0A0B0F'); line(ctx, 34, 4, 70 + ph * 8, 14, 9, '#0A0B0F'); ctx.restore();
}
function tapeSide(ctx, f, ts) {                                                      // CAM 2: under the awning - he crawls under the van, past the dead, to the doors
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10);
  const u = crawlU(ts), cx = ts < 23.2 ? lerp(330, -330, u) : lerp(-330, -400, clamp((ts - 23.2) / 1.0)), slide = sstep(ts, EVS('slide'), EVS('slide') + .6), z = lerp(1.0, 1.08, clamp((ts - 13) / 11));
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2 + 10, 900); ctx.scale(z, z);
  ctx.fillStyle = '#20232B'; ctx.fillRect(-600, -520, 1200, 520); ctx.fillStyle = '#15171D'; ctx.fillRect(-600, 0, 1200, 300); rainField(ctx, f, -600, 600, -520, 0, 80);
  ctx.fillStyle = '#2E323C'; ctx.fillRect(-600, -520, 260, 520);                                                                                    // building wall
  ctx.fillStyle = '#0B0D12'; ctx.fillRect(-470, -300, 160, 300); for (const d of [-1, 1]) { const x0 = -390 + d * 40 * slide - (d < 0 ? 80 : 0); ctx.fillStyle = 'rgba(170,200,230,.35)'; ctx.fillRect(x0, -300, 80, 300); ctx.strokeStyle = '#9AA0B0'; ctx.lineWidth = 5; ctx.strokeRect(x0, -300, 80, 300); }
  dot(ctx, -390, -320, 7, ts > EVS('sensor') ? '#CFFFE0' : '#555');
  ctx.fillStyle = '#0A0B10'; ctx.fillRect(-600, -420, 960, 60);                                                                                     // awning
  rr(ctx, -90, -230, 480, 180, 18, '#E2E0D8', PAL.ink, 5); rr(ctx, -120, -200, 80, 120, 14, '#E2E0D8', PAL.ink, 5); rr(ctx, -112, -190, 60, 50, 8, '#46546C', PAL.ink, 3);   // van side
  marker(ctx, "ST. ANNE'S", 150, -170, 46, '#B03030', { stroke: .01 }); marker(ctx, 'PATIENT TRANSFER', 150, -122, 28, '#333', { stroke: .01 }); ctx.fillStyle = '#B03030'; ctx.fillRect(320, -200, 14, 44); ctx.fillRect(305, -185, 44, 14);
  blob(ctx, -20, -40, 34, 34, '#0A0A0A'); blob(ctx, 300, -40, 34, 34, '#0A0A0A');
  if (ts < 23.6) crawler(ctx, cx, f, groaning(ts)); else if (ts < 24.2) { ctx.save(); ctx.globalAlpha = 1 - clamp((ts - 23.6) / .6); crawler(ctx, cx, f, true); ctx.restore(); }
  if (ts < 23.6 && groaning(ts)) { ctx.save(); ctx.strokeStyle = '#FFD27A'; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.strokeRect(cx - 90, -52, 180, 58); ctx.setLineDash([]); ctx.restore(); marker(ctx, 'MOTION', cx + 45, -66, 22, '#FFD27A', { stroke: 6 }); }
  ctx.fillStyle = '#E2E0D8'; ctx.fillRect(-60, -70, 340, 22); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.strokeRect(-60, -70, 340, 22);       // van skirt: he is under it
  [[-260, 41], [-190, 42], [10, 43], [430, 44]].forEach(([x, sd], i) => { const g = groaning(ts); ctx.save(); ctx.globalAlpha = .9; person(ctx, { x, y: 0, s: .62, dir: i % 2 ? 1 : -1, kind: 'z', seed: sd, var: sd % 5 === 1 ? 2 : sd % 5, pose: zpose(pf5(f + sd * 4), sd, { stride: 0, lift: 0 }) }, pf5(f + sd * 4)); ctx.restore();
    if (g) marker(ctx, '~', x + 10, -230, 40, '#CCCCCC', { stroke: .01, a: .6 }); });
  ctx.restore();
  cctvFrame(ctx, f, 'CAM 2 · AWNING', stamp9(ts), {});
  marker(ctx, groaning(ts) ? '[ GROANING ]' : '[ SILENCE ]', W / 2, 560, 40, groaning(ts) ? '#B8E986' : '#9AA0B0', { stroke: 10 });
  if (ts > 23.9) marker(ctx, '● LIVE IN 2 MIN', W / 2, 1180, 40, PAL.red, { stroke: 10, a: sstep(ts, 23.9, 24.1) });
  vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- the driver at the booth glass
function driverMan(ctx, x, f, ts, o = {}) {
  const rise = o.rise == null ? 1 : o.rise, talk = lineTalk(f, DRV9), slap = o.slap || 0;
  const face = devFace(f, { wide: true, eyes: 1.25, brow: -.9, look: o.look || [.9, .05], mouth: talk, sweat: true });
  const pose = basePose(pf3(f + 20), { lean: .18 + (1 - rise) * .3 + Math.sin(f * .2) * .02, face, hands: { L: o.hide ? [-14, -112] : [44, -132], R: slap > 0 ? [100, -206] : [40 + Math.sin(f * .17) * 12 * talk, -150 - 30 * talk] } });
  pose.hip = [pose.hip[0], pose.hip[1] + (1 - rise) * 95 + Math.sin(f * .32) * 2];                                                       // panting
  const r = person(ctx, { x, y: 0, s: 1, dir: -1, kind: 'dev', seed: 81, hoodie: false, shirt: '#3E5068', pants: '#22262E', pose }, pf3(f));
  const [hx, hy] = r.head, hr = 40; ctx.save(); ctx.translate(hx, hy); ctx.scale(-1, 1); ctx.rotate(pose.lean);
  ctx.fillStyle = '#2B3A55'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -4, hr + 3, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill(); ctx.stroke();   // cap
  rr(ctx, hr * .3, -hr * .3, hr * .95, 10, 5, '#22304A', PAL.ink, 3); ctx.restore();
  rr(ctx, hx - 30, hy + 84, 30, 22, 3, '#E8E8E0', PAL.ink, 2);                                                                           // ID badge
  const [lx, ly] = r.hands[0]; if (!o.hide) { rr(ctx, lx - 6, ly + 4, 34, 16, 5, '#EDEBE3', PAL.ink, 2); dot(ctx, lx + 14, ly + 12, 5, '#9A2A2A'); }   // bandaged forearm
}
const DEAD9 = [[930, 51, 33.6], [1020, 52, 34.4], [1110, 53, 35.2]];
function lobbyBehind(ctx, f, ts, o = {}) {                                           // what's on the other side of the booth glass
  DEAD9.forEach(([x0, sd, a]) => { if (ts < a) return; const x = x0 - (ts - a) * 16, moving = true; ctx.save(); ctx.globalAlpha = .75;
    person(ctx, { x, y: 0, s: .9, dir: -1, kind: 'z', seed: sd, var: sd % 5 === 1 ? 2 : sd % 5, pose: walkPose(x / 90, { stride: 18, lift: 6, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176], R: [78, -190] }, face: { look: [.7, .1], mouth: .7 } }) }, pf5(f + sd * 4)); ctx.restore(); });
  if (o.driver) driverMan(ctx, 440, f, ts, o.driver);
  if (ts > EVS('slap')) { blob(ctx, 340, -206, 14, 20, 'rgba(220,235,255,.9)', 0, .3); line(ctx, 336, -190, 334, -140, 4, 'rgba(220,235,255,.25)'); }   // wet handprint
}
// ----------------------------------------------------------------------------------------------- cast (Ep8 acting pattern)
const devX9 = ts => ts < 24.6 ? { x: -385, dir: 1, moving: false } : { x: 40, dir: 1, moving: false };
function cast9(ctx, f, ts, o = {}) {
  const tD = devTalk(f), tR = lineTalk(f, RAY8), tM = lineTalk(f, MIRA8), jolt = ts >= EVS('slap') ? Math.exp(-(ts - EVS('slap')) * 6) : 0;
  mira(ctx, -220, -4, f, { s: 1, typing: !!o.mtype, look: o.mlook || [.9, 0], dir: o.mdir || 1, mouth: tM, gesture: tM > .05 ? .8 : 0, brow: o.mbrow == null ? -.3 : o.mbrow, wide: !!o.mwide || jolt > .2, flinch: jolt });
  const D = o.D || devX9(ts);
  const face = devFace(f, { wide: !!o.wide || jolt > .2, eyes: o.wide || jolt > .2 ? 1.3 : 1.05, brow: o.dbrow == null ? -.7 : o.dbrow, look: o.dlook || [.9, 0], mouth: tD, sweat: !!o.sweat });
  const dp = basePose(pf3(f), { lean: .06 - .14 * jolt + Math.sin(f * .025) * .02, face, hands: { L: [20, -100], R: [40 + Math.sin(f * .17) * 14 * tD, -150 - 40 * tD] } }); dp.hip = [dp.hip[0], dp.hip[1] - 8 * jolt];
  person(ctx, DEVH(D.x, 0, dp, { dir: D.dir, hoodie: false }), pf3(f));
  const rp = basePose(pf3(f + 40), { lean: .08 - .14 * jolt + Math.sin(f * .021 + 1) * .02, face: rayFace8(f, { ...(o.rface || {}), ...(jolt > .2 ? { brow: 1, eyes: 1.2 } : {}) }), hands: { L: [20 + 30 * tR + Math.sin(f * .15) * 10 * tR, -100 - 60 * tR], R: [60, -150] } });
  rp.hip = [rp.hip[0], rp.hip[1] - 6 * jolt];
  ray(ctx, 170, 0, f, rp, { dir: o.rdir || -1, aim: .25, light: false });
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.stall9 = (ctx, lt, lf, len, t, f) => {                                          // Ray at the monitors (close) -> Mira rewinds (close)
  const ts = t / 60, FR = f / 60, cam = FR < 4 ? { x: 130, y: -280, z: lerp(1.9, 2.0, ts / 4) } : { x: -240, y: -175, z: lerp(2.05, 2.15, (ts - 4) / 4) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true });
  cast9(ctx, f, ts, { mtype: ts > 6.0, mlook: ts < 6 ? [.9, -.4] : [.9, -.6], rface: { look: [.2, -.9], brow: .7 } });
  ctx.restore(); vig(ctx, .45);
};
SHOT.tape = (ctx, lt, lf, len, t, f) => { const ts = t / 60; if (f / 60 < EVS('side')) tapeCab(ctx, f, ts); else tapeSide(ctx, f, ts); };
SHOT.live = (ctx, lt, lf, len, t, f) => {                                            // "That was two minutes ago." Then: silence, everyone watching the dark lobby
  const ts = t / 60, FR = f / 60, cam = FR < 27 ? { x: -170, y: -190, z: 1.9 } : { x: 60, y: -265, z: lerp(.98, 1.06, (ts - 27) / 6) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => lobbyBehind(c, f, ts) });
  cast9(ctx, f, ts, { mlook: ts < 27 ? [.9, -.1] : [.9, 0], mbrow: .5, wide: ts > 27, dlook: [.9, 0], rdir: ts > 27.3 ? 1 : -1, rface: { look: [.9, 0], brow: .8 } });
  ctx.restore(); vig(ctx, .5 + .08 * clamp((ts - 27) / 6));
};
SHOT.hand = (ctx, lt, lf, len, t, f) => {                                            // SLAP: the driver at the glass; the bandage; "It's glass."
  const ts = t / 60, FR = f / 60, rise = sstep(ts, EVS('slap'), EVS('slap') + .8);
  const cam = FR < 34.4 ? { x: 80, y: -265, z: 1.05 } : FR < 37.6 ? { x: 505, y: -250, z: lerp(1.95, 2.05, (ts - 34.4) / 3.2) } : FR < 40.2 ? { x: 200, y: -255, z: 1.6 } : { x: 505, y: -255, z: lerp(2.0, 2.15, (ts - 40.2) / 3.8) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.2 }, t, [[EVF('slap'), 14]]);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => lobbyBehind(c, f, ts, { driver: { rise, slap: ts > EVS('slap') && ts < 34.5 ? 1 : 0, hide: ts > 40.3, look: ts > 38 && ts < 40.3 ? [.9, .5] : [.9, 0] } }) });
  cast9(ctx, f, ts, { wide: true, sweat: ts > 37.6, mwide: true, mbrow: .7, dlook: ts > 37.6 && ts < 40.2 ? [.9, .35] : [.9, 0], rdir: 1, rface: { look: [.9, 0], brow: 1 } });
  ctx.restore(); vig(ctx, .5);
  sfxPop(ctx, 'SLAP!', W / 2 + 100, 560, f, EVF('slap'), PAL.chalk, 110, 34, .06);
  if (FR >= 38.4 && FR < 40.2) marker(ctx, 'BANDAGE?', W / 2 + 230, 700, 44, PAL.red, { stroke: 10, s: outB((ts - 38.4) / .25, 1.5) });
};
function buzzerInsert(ctx, f, ts) {                                                  // Mira's finger over the door release
  ctx.fillStyle = '#14100C'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 980, 40, W / 2, 980, 700); g.addColorStop(0, 'rgba(110,200,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rr(ctx, 190, 760, 700, 420, 30, '#2A2F3C', PAL.ink, 6); marker(ctx, 'BOOTH DOOR', W / 2, 840, 40, '#9AA0B0', { stroke: .01 });
  dot(ctx, W / 2, 1010, 120, PAL.ink); dot(ctx, W / 2, 1000, 110, '#2FAE5A'); glow(ctx, W / 2, 1000, 200, 'rgba(108,255,154,A)', .25); marker(ctx, 'OPEN', W / 2, 1018, 46, '#0E3A1E', { stroke: .01 });
  const tr = Math.sin(f * 1.3) * 6 + Math.sin(f * .7) * 4, hy = 700 + 30 * Math.sin(clamp((ts - 45.6) / 1.6) * Math.PI) + tr;
  ctx.save(); ctx.translate(W / 2 + 90 + tr, hy); line(ctx, 260, -300, 40, -40, 70, '#7A4FB0'); line(ctx, 260, -300, 40, -40, 6, PAL.ink); dot(ctx, 20, -20, 46, '#F2EFE6'); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(20, -20, 46, 0, TAU); ctx.stroke();
  line(ctx, -10, 0, -60, 60, 26, '#F2EFE6'); ctx.restore();
  vig(ctx, .6);
}
SHOT.choice = (ctx, lt, lf, len, t, f) => {                                          // "Don't open it." / the button / "Dev. It's your call." / Dev
  const ts = t / 60, FR = f / 60;
  if (FR >= EVS('buzz_in') && FR < EVS('buzz_out')) { buzzerInsert(ctx, f, ts); return; }
  const cam = FR < 45.6 ? { x: 115, y: -275, z: 2.1 } : FR < 49.2 ? { x: -170, y: -190, z: 1.9 } : { x: 60, y: -285, z: lerp(2.6, 2.85, (ts - 49.2) / 2.8) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: .8, gap: true, still: true, behind: c => lobbyBehind(c, f, ts, { driver: { hide: true, look: [.9, 0] } }) });
  cast9(ctx, f, ts, { wide: FR >= 49.2, sweat: true, mwide: false, mbrow: .6, mlook: [.9, 0], dlook: FR >= 49.2 ? [.9, -.15] : [.9, 0], dbrow: FR >= 49.2 ? -.9 : -.6, rdir: 1, rface: { look: [.9, 0], brow: 1 } });
  ctx.restore(); vig(ctx, .5 + .15 * (FR >= 49.2));
  if (FR >= 49.6) { marker(ctx, 'OPEN', W / 2 - 200, 1600, 64, '#6CFF9A', { stroke: 14, s: outB((ts - 49.6) / .25, 1.5) }); marker(ctx, 'OR', W / 2, 1600, 40, PAL.chalk, { stroke: 10 }); marker(ctx, "DON'T", W / 2 + 200, 1600, 64, PAL.red, { stroke: 14, s: outB((ts - 49.8) / .25, 1.5) }); }
};
SHOT.end9 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 10', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'LET HIM IN?', 0, 0, 120, PAL.red, { stroke: 24 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'COMMENT: OPEN or DON\'T', W / 2, 960, 50, PAL.amber, { stroke: 12 }); marker(ctx, 'FOLLOW FOR PART 10', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
