// eps13.js - Episode 13 "Through the Office": the quiet ones all came to the booth, so the garage is empty. Ray keeps Patel waiting with
// knocks while Dev, Mira and Cole creep past him single file. Patel's office: blood-stained mattress, cut ties, scratches, his ledger
// ("1307 - 6 MO LATE", "1309 - BITTEN?"), the master keys. The keys jingle - Patel turns - Ray knocks him back. Third key opens the
// service door. Then the glass gives way, the crash sets Patel off, and he grabs Ray as he runs past. Blood. "Did he bite you?"
'use strict';
const T0_13 = 38 * 60 + 30;
const CLUES13 = [[6.5, 'THE GARAGE IS EMPTY NOW'], [24.6, 'MASTER KEYS: GARAGE + SERVICE'], [35.2, 'SERVICE DOOR OPEN'], [42.6, 'THE GLASS GAVE WAY'], [48.8, 'RAY IS BLEEDING']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end13[0]) return; const left = Math.max(0, T0_13 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES13.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
const RK13 = ['k1', 'k2', 'k3', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'f1', 'f2', 'f3'];            // Ray's knocks on the door frame
// ----------------------------------------------------------------------------------------------- the line: Dev leads (keys), Mira, Cole; hands on shoulders
const lineX = ts => { if (ts < 17) return 470; if (ts < 22.4) return lerp(470, 150, (ts - 17) / 5.4); if (ts < 24.6) return 150; if (ts < 25.4) return lerp(150, 110, (ts - 24.6) / .8); if (ts < 27.2) return 110; return lerp(110, -430, clamp((ts - 27.2) / 3.8)); };
const lineMoving = ts => (ts > 17 && ts < 22.4) || (ts > 24.6 && ts < 25.4) || (ts > 27.2 && ts < 31);
function sneak(ph, face, lead) { return walkPose(ph, { stride: 14, lift: 5, bob: 2, lean: .12, face, hands: lead ? { L: [80, -180], R: [30, -120] } : { L: [74, -236], R: [30, -120] } }); }
function line13(ctx, f, ts, o = {}) {                                                   // back row (depth): scale .92, a little higher
  const x0 = lineX(ts) + (o.shift || 0), mv = o.mv != null ? o.mv : lineMoving(ts), s = .92, y = -16, fade = o.fade || (() => 1);
  const df = devFace(f, { wide: true, eyes: 1.3, brow: -.9, look: o.dlook || [.9, .1], mouth: devTalk(f), sweat: true });
  const reach = ts > EVS('grab_keys') - .4 && ts < EVS('grab_keys') + .5, dp = mv ? sneak(x0 / 120, df, true) : basePose(0, { lean: reach ? .35 : .1, face: df, hands: { L: reach ? [96, -150] : [80, -180], R: [30, -120] } });
  ctx.save(); ctx.globalAlpha *= fade(x0); person(ctx, { ...DEVH(x0, y, dp, { dir: -1, hoodie: false }), s }, mv ? 0 : 0); ctx.restore();
  if (ts < EVS('grab_keys') + .4 || ts > 31) {} else { const hx = x0 - 80 * s, hy = y - 180 * s; ctx.save(); ctx.globalAlpha *= fade(x0); for (let i = 0; i < 3; i++) dot(ctx, hx + i * 5, hy + 10 + i * 3, 5, '#C9B37A'); ctx.restore(); }   // keys in his hand
  const xm = x0 + 110; ctx.save(); ctx.globalAlpha *= fade(xm);
  mira(ctx, xm, y, f, { s, dir: -1, look: [.9, .1], wide: true, brow: .7, mouth: lineTalk(f, MIRA8), pose: mv ? sneak(xm / 120, {}, false) : basePose(0, { lean: .1, hands: { L: [74, -236], R: [30, -120] } }) }); ctx.restore();
  const xc = x0 + 220; ctx.save(); ctx.globalAlpha *= fade(xc);
  cole10(ctx, xc, f, ts, { dir: -1, s, y, gauze: true, unwrap: 1, look: [.9, .1], pose: mv ? sneak(xc / 120, {}, false) : basePose(0, { lean: .1, hands: { L: [74, -236], R: [30, -120] } }) }); ctx.restore();
}
// ----------------------------------------------------------------------------------------------- Patel in his office: waits, turns at the jingle, lunges at the crash
function patel13(ctx, f, ts) {
  let x = 0, dir = 1, pose;
  const turned = ts > EVS('jingle') && ts < 27.0, lunge = ts > EVS('crash') + .2;
  if (lunge) { const u = clamp((ts - EVS('crash') - .2) / .8); x = lerp(0, 70, u); dir = ts > EVS('grab') - .15 ? -1 : 1; }
  if (turned) dir = -1;
  const grabbing = ts > EVS('grab') - .15 && ts < EVS('free') + .3;
  pose = lunge ? basePose(pf5(f), { lean: .4, tilt: .2, hands: grabbing ? { L: [110, -170], R: [100, -150] } : { L: [100, -200], R: [90, -180] }, face: { look: [.9, .1], mouth: 1 } })
    : basePose(0, { lean: .2, tilt: turned ? .4 : .25, hands: { L: [40, -140], R: [30, -150] }, face: { look: [.9, .1], mouth: .3 } });
  const r = landlord(ctx, x, 0, f, pose, { dir, noClip: true }), [hx, hy] = r.head;
  blob(ctx, hx - 8 * dir, hy + 46, 14, 9, BLOOD, .3, .95); line(ctx, hx - 6 * dir, hy + 52, hx - 4 * dir, hy + 120, 6, 'rgba(142,16,24,.85)');
  ctx.fillStyle = BLOOD; ctx.beginPath(); ctx.moveTo(hx + 12 * dir, hy + 4); ctx.lineTo(hx + 34 * dir, hy + 10); ctx.lineTo(hx + 30 * dir, hy + 26); ctx.lineTo(hx + 10 * dir, hy + 22); ctx.closePath(); ctx.fill();
}
// ----------------------------------------------------------------------------------------------- the office (side view; booth door right, service door left)
function officeSet(ctx, f, ts, o = {}) {
  ctx.fillStyle = '#1E1712'; ctx.fillRect(-1200, -820, 2400, 830); ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = -1200; x < 1200; x += 70) ctx.fillRect(x, -820, 3, 820);   // wood panelling
  ctx.fillStyle = '#16161A'; ctx.fillRect(-1200, 0, 2400, 1400); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(-1200, 0, 2400, 3);
  // service door (left)
  const bd = o.bdoor || 0; rr(ctx, -568, -328, 156, 328, 4, '#020203', '#59627A', 6);
  if (bd < 1) rr(ctx, -560, -320, 140 * (1 - .75 * bd), 320, 3, '#4A4F5C', PAL.ink, 3); marker(ctx, 'SERVICE', -490, -360, 26, '#E8C547', { stroke: .01 });
  // scratches + bloody handprint by the booth door; the mattress where he was kept; cut zip ties
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(300 + i * 10, -300); ctx.lineTo(310 + i * 10, -180); } ctx.stroke();
  ctx.save(); ctx.translate(250, -240); ctx.rotate(.3); blob(ctx, 0, 0, 18, 22, BLOOD, 0, .85); for (let j = 0; j < 4; j++) line(ctx, -12 + j * 8, -14, -14 + j * 9, -36, 6, BLOOD); line(ctx, 0, 20, 4, 90, 8, 'rgba(142,16,24,.7)'); ctx.restore();
  rr(ctx, -380, -40, 260, 40, 10, '#6E6A5E', PAL.ink, 3); blob(ctx, -270, -26, 50, 12, BLOOD, .1, .85); blob(ctx, -200, -20, 26, 8, BLOOD2, -.2, .7);
  line(ctx, -150, -6, -120, -2, 4, '#E8E8E0'); line(ctx, -112, -2, -96, -8, 4, '#E8E8E0');
  // filing cabinets + desk (ledger, lamp off, keys)
  rr(ctx, -700, -260, 110, 260, 6, '#3A3F48', PAL.ink, 3); for (let i = 0; i < 3; i++) line(ctx, -680, -220 + i * 80, -610, -220 + i * 80, 4, '#222');
  rr(ctx, 60, -160, 260, 24, 4, '#3A2B20', PAL.ink, 3); ctx.fillStyle = '#21180F'; ctx.fillRect(70, -136, 240, 136);
  rr(ctx, 120, -190, 90, 30, 3, '#E8E4D4', PAL.ink, 2); line(ctx, 165, -190, 165, -160, 2, PAL.ink); rr(ctx, 250, -230, 14, 70, 3, '#333'); blob(ctx, 257, -232, 26, 14, '#2A2A2A');
  if (!(ts > EVS('grab_keys') + .4)) for (let i = 0; i < 3; i++) dot(ctx, 228 + i * 6, -168, 5, '#C9B37A');
  // booth doorway (right): the booth's cold glow; after the crash the booth fills with them
  rr(ctx, 412, -328, 156, 328, 4, '#0A1426', '#59627A', 6); glow(ctx, 490, -170, 220, 'rgba(110,160,230,A)', .25);
  if (o.inBooth) o.inBooth(ctx);
}
function dark13(ctx, a = .66) { darkness(ctx, a); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(490, -170, 20, 490, -170, 900); g.addColorStop(0, 'rgba(90,130,200,.3)'); g.addColorStop(1, 'rgba(90,130,200,0)'); ctx.fillStyle = g; ctx.fillRect(-1600, -1600, 3200, 3200); ctx.restore(); }
function rayKnock(ts) { return RK13.some(k => ts >= EVS(k) && ts < EVS(k) + .12); }
function rayDoor(ctx, f, ts, x = 470, o = {}) {                                         // Ray at the booth doorway, knocking on the frame
  const knocking = RK13.some(k => ts >= EVS(k) - .3 && ts < EVS(k) + .3), hit = rayKnock(ts);
  const rp = basePose(pf3(f + 40), { lean: knocking ? .16 : .08, face: rayFace8(f, { look: o.look || [.9, 0], brow: .8 }), hands: { L: knocking ? (hit ? [64, -210] : [52, -236]) : [20, -100], R: [60, -150] } });
  ray(ctx, x, 0, f, rp, { dir: -1, aim: .25, light: false });
}
// ----------------------------------------------------------------------------------------------- inserts
function ledgerInsert(ctx, f, ts) {                                                     // Patel's ledger + the master keys; Dev's hand takes them
  ctx.fillStyle = '#120D09'; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, 960, 600, 'rgba(110,160,230,A)', .12);
  rr(ctx, 110, 520, 860, 640, 18, '#E8E2CC', PAL.ink, 6); line(ctx, W / 2, 520, W / 2, 1160, 5, '#B8B09A');
  ctx.font = `700 34px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = '#2A3550';
  [['1301  PAID', 620], ['1304  PAID', 680], ['1307  DEV  6 MO LATE', 740], ['1309  BITTEN?', 860], ['1311  LOCKED IN 7B', 920]].forEach(([t, y], i) => { ctx.fillText(t, 150, y); });
  ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(310, 730, 200, 34, 0, 0, TAU); ctx.stroke();                      // circled
  line(ctx, 150, 850, 420, 862, 5, '#2A3550');
  blob(ctx, 690, 700, 30, 36, BLOOD, .2, .8); for (let j = 0; j < 4; j++) line(ctx, 670 + j * 12, 680, 668 + j * 13, 650, 8, BLOOD);           // bloody thumbprint
  const take = sstep(ts, EVS('grab_keys'), EVS('grab_keys') + .7), kx = 760, ky = lerp(960, 640, take);
  if (ts > EVS('grab_keys') - .5) { line(ctx, kx + 330, ky - 260, kx + 40, ky - 40, 70, '#F2EFE6'); line(ctx, kx + 330, ky - 260, kx + 40, ky - 40, 5, PAL.ink); }
  ctx.save(); ctx.translate(kx, ky); ctx.strokeStyle = '#C9B37A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke();
  [['MASTER', -60], ['GARAGE', 0], ['SERVICE', 60]].forEach(([t, dx]) => { line(ctx, dx * .6, 30, dx, 110, 10, '#C9B37A'); rr(ctx, dx - 50, 110, 100, 34, 6, '#F4F0E0', PAL.ink, 2); marker(ctx, t, dx, 134, 20, '#2A3550', { stroke: .01 }); });
  ctx.restore();
  vig(ctx, .6);
}
function lockInsert(ctx, f, ts) {                                                       // the service door lock in the dark: key 1, key 2, key 3
  ctx.fillStyle = '#0B0C10'; ctx.fillRect(0, 0, W, H); rr(ctx, 120, 420, 840, 900, 10, '#3E434F', PAL.ink, 6);
  dot(ctx, W / 2, 900, 90, '#8A8F9A'); dot(ctx, W / 2, 900, 70, '#5A5F6A'); rr(ctx, W / 2 - 8, 860, 16, 70, 4, '#111');
  const n = ts < EVS('key2') ? 0 : ts < EVS('key3') ? 1 : 2, tries = [EVS('key1'), EVS('key2'), EVS('key3')][n], wig = ts > tries && n < 2 ? Math.sin((ts - tries) * 40) * .2 * Math.exp(-(ts - tries) * 2) : 0, turn = n === 2 ? sstep(ts, EVS('key3'), EVS('key3') + .3) * 1.4 : 0;
  ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(wig + turn); line(ctx, 0, 0, 0, 200, 14, '#C9B37A'); ctx.strokeStyle = '#C9B37A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 250, 50, 0, TAU); ctx.stroke(); ctx.restore();
  line(ctx, W / 2 + 60, 1300, W / 2 + 40, 1180, 90, '#F2EFE6'); line(ctx, W / 2 + 200, 1500, W / 2 + 60, 1200, 120, '#E8E6E0');
  ['key1', 'key2'].forEach((k, i) => { if (ts > EVS(k) + .2 && ts < EVS(k) + 1.0) marker(ctx, 'NO', W / 2 + (i ? 200 : -200), 640, 70, PAL.red, { stroke: 12 }); });
  sfxPop(ctx, 'CLICK', W / 2, 640, f, EVF('key3'), '#6CFF9A', 100, 40, -.05);
  marker(ctx, `KEY ${n + 1} / 3`, W / 2, 520, 40, PAL.chalk, { stroke: 10 });
  vig(ctx, .6);
}
function grabInsert(ctx, f, ts) {                                                       // Patel's hand on Ray's forearm - nails in, blood
  ctx.fillStyle = '#0A0A0E'; ctx.fillRect(0, 0, W, H); const sh = Math.sin(f * 2.1) * 8;
  ctx.save(); ctx.translate(sh, 0);
  rr(ctx, 40, 860, 640, 200, 60, '#C8662E', PAL.ink, 6); rr(ctx, 620, 880, 420, 160, 70, '#F2EFE6', PAL.ink, 6);                                // sleeve + forearm
  const sk = '#8FA88A', bl = clamp((ts - EVS('grab')) / .6);
  ctx.fillStyle = sk; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(800, 760, 190, 90, -.05, 0, TAU); ctx.fill(); ctx.stroke();       // his palm, over the arm
  for (let i = 0; i < 4; i++) { const x0 = 690 + i * 72, ctl = [x0 + 20, 900], end = [x0 + 6, 1010];                                                       // four fingers wrapping the forearm
    ctx.lineCap = 'round'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 58; ctx.beginPath(); ctx.moveTo(x0, 790); ctx.quadraticCurveTo(...ctl, ...end); ctx.stroke();
    ctx.strokeStyle = sk; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(x0, 790); ctx.quadraticCurveTo(...ctl, ...end); ctx.stroke();
    line(ctx, x0 - 14, 860, x0 + 22, 862, 3, 'rgba(0,0,0,.35)'); rr(ctx, end[0] - 14, end[1] - 6, 28, 18, 6, '#3A3020', PAL.ink, 2);                         // knuckle crease, nail
    dot(ctx, end[0], end[1] + 18, 10, BLOOD); line(ctx, end[0], end[1] + 26, end[0] + 3, end[1] + 30 + 70 * bl, 8, BLOOD2); }
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 58; ctx.beginPath(); ctx.moveTo(990, 760); ctx.quadraticCurveTo(1040, 830, 990, 900); ctx.stroke(); ctx.strokeStyle = sk; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(990, 760); ctx.quadraticCurveTo(1040, 830, 990, 900); ctx.stroke();   // thumb
  ctx.restore();
  sfxPop(ctx, 'GRAB!', W / 2, 560, f, EVF('grab'), PAL.red, 110, 40, -.06); vig(ctx, .6);
}
// ----------------------------------------------------------------------------------------------- shots
SHOT.booth13 = (ctx, lt, lf, len, t, f) => {                                            // the cracks grow; Mira: the office has a back door
  const ts = t / 60, FR = f / 60, cam = FR < 5.0 ? { x: -330, y: -180, z: 2.0 } : { x: 20, y: -265, z: 2.0 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, [[EVF('krk'), 4]]);
  booth12(ctx, f, 46 + ts * .2, { mlook: [.9, 0], clook: [-.9, -.2], rface: { look: [.9, 0], brow: .9 } });
  ctx.restore(); vig(ctx, .6);
  sfxPop(ctx, 'krrk', W / 2 + 200, 600, f, EVF('krk'), '#DDE8FF', 60, 30, .04);
};
SHOT.plan13 = (ctx, lt, lf, len, t, f) => {                                             // hands on shoulders; Ray at the office door, knocking
  const ts = t / 60, FR = f / 60;
  if (FR < 13.6) { ctx.save(); applyCam(ctx, { x: 135, y: -260, z: 2.1, hand: .9 }, t, []); booth12(ctx, f, 48, { mlook: [-.9, 0], clook: [.9, 0], rface: { look: [.9, 0] } }); ctx.restore(); vig(ctx, .6); return; }
  ctx.save(); applyCam(ctx, { x: -330, y: -240, z: 1.55, hand: .9 }, t, []);                                                                       // at the office door: Ray knocks, the line forms
  GL11.length = 0; boothSet(ctx, f, 48, { shape: 0, gap: true, still: true, behind: c => glass12(c, f, 48) }); crackLines(ctx); brokenSign(ctx); officeOpen(ctx, sstep(ts, EVS('open'), EVS('open') + .5));
  mira(ctx, -220, -4, f, { s: 1, look: [-.9, 0], dir: 1, wide: true, brow: .7, mouth: 0 });
  cole10(ctx, -100, f, ts, { dir: -1, gauze: true, unwrap: 1, look: [.9, 0], wide: true, pose: basePose(pf3(f), { lean: .08, hands: { L: [74, -236], R: [30, -120] } }) });
  person(ctx, DEVH(-330, 0, basePose(pf3(f), { lean: .1, face: devFace(f, { wide: true, eyes: 1.3, brow: -.9, look: [.9, 0], mouth: 0, sweat: true }), hands: { L: [74, -236], R: [30, -120] } }), { dir: -1, hoodie: false }), pf3(f));
  rayDoor(ctx, f, ts, -440);
  lightPass12(ctx, 48); crackDraw(ctx, 48); ctx.restore(); vig(ctx, .6);
  ['k1', 'k2', 'k3'].forEach((k, i) => sfxPop(ctx, 'knock', W / 2 - 220 + i * 220, 600, f, EVF(k), '#9FD8FF', 60, 22, -.05 + i * .05));
};
SHOT.office13 = (ctx, lt, lf, len, t, f) => {                                           // single file, right behind him
  const ts = t / 60, FR = f / 60;
  if (FR >= EVS('led_in') && FR < EVS('led_out')) { ledgerInsert(ctx, f, ts); return; }
  const x0 = lineX(ts), cam = FR < 25.2 ? { x: clamp(x0 + 60, -120, 300), y: -250, z: 1.35 } : FR < 27.2 ? { x: 40, y: -280, z: 2.0 } : { x: clamp(x0 + 80, -280, 120), y: -250, z: 1.3 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, [[EVF('jingle'), 3]]);
  officeSet(ctx, f, ts); line13(ctx, f, ts, { dlook: FR >= EVS('jingle') && FR < 27.2 ? [.9, -.1] : [.9, .1] }); patel13(ctx, f, ts); rayDoor(ctx, f, ts);
  dark13(ctx, .62); ctx.restore(); vig(ctx, .6);
  ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].forEach((k, i) => sfxPop(ctx, 'knock', W / 2 + 220 - (i % 3) * 120, 560 + (i % 3) * 40, f, EVF(k), '#9FD8FF', 50, 20, .05));
  sfxPop(ctx, '*jingle*', W / 2 - 120, 620, f, EVF('jingle'), '#C9B37A', 70, 40, -.06);
  if (FR >= 25.6 && FR < 27.2) marker(ctx, 'HE HEARD THE KEYS', W / 2, 1600, 48, PAL.red, { stroke: 12, s: outB((ts - 25.6) / .25, 1.5) });
};
SHOT.lock13 = (ctx, lt, lf, len, t, f) => {                                             // key 1, key 2, key 3 -> the service door opens; they slip through
  const ts = t / 60, FR = f / 60;
  if (FR < EVS('bdoor')) { lockInsert(ctx, f, ts); return; }
  const cam = { x: -300, y: -250, z: 1.3 };
  ctx.save(); applyCam(ctx, { ...cam, hand: .9 }, t, []);
  officeSet(ctx, f, ts, { bdoor: sstep(ts, EVS('bdoor'), EVS('bdoor') + .5) });
  const thru = clamp((ts - 35.6) / 3.0), sx = lerp(-430, -760, thru);
  line13(ctx, f, 31, { shift: -340 * thru, mv: thru > 0 && thru < 1, fade: x => clamp((x + 560) / 100) });                                   // they file out through the service door
  patel13(ctx, f, 30); rayDoor(ctx, f, ts);
  dark13(ctx, .62); ctx.restore(); vig(ctx, .6);
};
SHOT.ray13 = (ctx, lt, lf, len, t, f) => {                                              // "Your turn, old man." -> CRASH -> he runs -> Patel grabs him
  const ts = t / 60, FR = f / 60;
  if (FR >= EVS('grab') && FR < EVS('free')) { grabInsert(ctx, f, ts); return; }
  const run = clamp((ts - EVS('run')) / 2.0), rx = ts < EVS('run') ? 470 : lerp(470, -470, run), stall = FR >= EVS('free') ? 0 : 1;
  const cam = FR < EVS('crash') ? { x: 420, y: -250, z: 1.9 } : FR < EVS('run') ? { x: 520, y: -240, z: 1.6 } : { x: lerp(200, -250, run), y: -250, z: 1.35 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.2 }, t, [[EVF('crash'), 16], [EVF('grab'), 10], [EVF('slam'), 10]]);
  officeSet(ctx, f, ts, { bdoor: 1 - sstep(ts, EVS('slam') - .1, EVS('slam')), inBooth: c => { if (ts > EVS('crash')) for (let i = 0; i < 3; i++) { const a = clamp((ts - EVS('crash') - .3 - i * .4) / .6); if (a > 0) quietOne(c, 520 + i * 40, f, i, { s: .8, a, dir: -1 }); } } });
  patel13(ctx, f, ts);
  if (FR < EVS('run')) rayDoor(ctx, f, ts, 470, { look: FR >= EVS('crash') ? [-.9, 0] : [.9, 0] });
  else { const pose = walkPose(rx / 70, { stride: 46, lift: 22, bob: 6, lean: .35, face: rayFace8(f, { look: [.9, 0], brow: 1, eyes: 1.3 }), hands: { L: [60, -150], R: [70, -190] } });
    ray(ctx, rx, 0, f, pose, { dir: -1, aim: .25, light: false }); }
  if (FR >= EVS('free') && FR < EVS('slam')) { line(ctx, -470, -200, -420, -190, 22, '#F2EFE6'); dot(ctx, -415, -190, 16, '#F2EFE6'); }                 // Dev's arm from the doorway
  dark13(ctx, .58); ctx.restore(); vig(ctx, .6);
  sfxPop(ctx, 'CRASH!', W / 2 + 60, 560, f, EVF('crash'), '#DDE8FF', 110, 34, -.06);
  sfxPop(ctx, 'SLAM', W / 2 - 100, 640, f, EVF('slam'), PAL.chalk, 100, 26, .06);
  ['f1', 'f2', 'f3'].forEach((k, i) => sfxPop(ctx, 'knock', W / 2 - 220 + i * 220, 560, f, EVF(k), '#9FD8FF', 54, 20, -.05 + i * .05));
};
function corridorSet(ctx, f, ts) {
  ctx.fillStyle = '#20232A'; ctx.fillRect(-1200, -820, 2400, 830); ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let y = -800; y < 0; y += 60) ctx.fillRect(-1200, y, 2400, 3);
  for (let i = 0; i < 3; i++) line(ctx, -1200, -620 + i * 30, 1200, -620 + i * 30, 12, '#2E323C');                                        // pipes
  marker(ctx, 'GARAGE  →', -560, -420, 54, '#E8C547', { stroke: .01, rot: 0 }); ctx.save(); ctx.scale(-1, 1); ctx.restore();
  ctx.fillStyle = '#17181D'; ctx.fillRect(-1200, 0, 2400, 1400);
  const sh = ['bang1', 'bang2'].reduce((v, k) => v + (ts >= EVS(k) ? Math.sin((ts - EVS(k)) * 70) * 8 * Math.exp(-(ts - EVS(k)) * 8) : 0), 0);
  ctx.save(); ctx.translate(sh, 0); rr(ctx, 312, -328, 156, 328, 4, '#05060A', '#59627A', 6); rr(ctx, 320, -320, 140, 320, 3, '#4A4F5C', PAL.ink, 3); ctx.restore();
}
SHOT.corr13 = (ctx, lt, lf, len, t, f) => {                                              // the corridor: Patel pounding the door; Ray's arm is bleeding
  const ts = t / 60, FR = f / 60, cam = FR < 49.8 ? { x: -20, y: -250, z: 1.5 } : { x: 230, y: -230, z: 2.4 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, [[EVF('bang1'), 10], [EVF('bang2'), 10]]);
  corridorSet(ctx, f, ts);
  cole10(ctx, -300, f, ts, { dir: 1, gauze: true, unwrap: 1, look: [.9, 0], wide: true });
  mira(ctx, -150, 0, f, { dir: 1, look: [.9, 0], wide: true, brow: .8, mouth: 0, pose: basePose(pf3(f), { lean: .05, hands: { L: [30, -120], R: [40, -140] } }) });
  person(ctx, DEVH(20, 0, basePose(pf3(f), { lean: .1, face: devFace(f, { wide: true, eyes: 1.3, brow: -.9, look: [.9, .3], mouth: devTalk(f), sweat: true }), hands: { L: [20, -100], R: [60, -170] } }), { dir: 1, hoodie: false }), pf3(f));
  const rp = basePose(pf3(f + 40) + 0, { lean: -.12 + Math.sin(f * .3) * .03, face: rayFace8(f, { look: FR >= 49.8 ? [-.6, .7] : [.9, 0], brow: 1, eyes: 1.2 }), hands: { L: [60, -120], R: [40, -150] } });
  const r = ray(ctx, 220, 0, f, rp, { dir: -1, aim: .25, light: false });
  const ax = 220 - 60, ay = -120;                                                                                                                  // his left forearm: torn sleeve, three deep gouges
  rr(ctx, ax - 30, ay - 10, 60, 22, 8, '#F2EFE6', PAL.ink, 2); for (let i = 0; i < 3; i++) { line(ctx, ax - 20 + i * 14, ay - 6, ax - 12 + i * 14, ay + 10, 5, BLOOD); line(ctx, ax - 12 + i * 14, ay + 12, ax - 10 + i * 14, ay + 16 + 30 * clamp((ts - 46.4 - i * .3) / 3), 5, BLOOD2); }
  dark13(ctx, .45); ctx.restore(); vig(ctx, .6);
  ['bang1', 'bang2'].forEach((k, i) => sfxPop(ctx, 'BANG', W / 2 + 180, 560 + i * 70, f, EVF(k), PAL.chalk, 90, 24, .06));
};
SHOT.end13 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 14', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'DID HE BITE?', 0, 0, 120, PAL.red, { stroke: 24 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'COMMENT: BITE or SCRATCH', W / 2, 960, 50, PAL.amber, { stroke: 12 }); marker(ctx, 'FOLLOW FOR PART 14', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
