// eps8.js - Episode 8 "The Knock": Patel asked Mira to lock him in ("don't let me collect"); he tried to warn the tenants (the prints);
// his knocking pulls the dead to the booth glass; Dev - who dodged his rent for six months - knocks back, and Patel waits (habit).
// The idling engine finally dies... and the van driver's seat is empty.
'use strict';
const T0_8 = 43 * 60 + 20, RAY8 = ['q1', 'q2', 'q3'], MIRA8 = ['m1', 'm2', 'm3', 'm4'];
const rayFace8 = (f, o = {}) => ({ look: [.6, 0], brow: .5, mouth: lineTalk(f, RAY8), eyes: .8, smile: -.2, ...o });
const CLUES8 = [[9.0, 'PATEL ASKED TO BE LOCKED IN'], [15.6, 'HE TRIED TO WARN THE TENANTS'], [21.8, 'KNOCKS DRAW THEM IN'], [35.4, 'KNOCK BACK = HE WAITS'], [48.6, 'THE DRIVER IS OUT']];
function extraUI(ctx, f) {
  const ts = f / 60; if (f >= TL.shots.end8[0]) return; const left = Math.max(0, T0_8 - Math.floor(ts));
  ctx.save(); ctx.translate(64, 318); rr(ctx, 0, -44, 330, 96, 22, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('SUNRISE / LAST VAN IN', 22, -12);
  ctx.font = `800 44px ${FONTS.sansX}`; ctx.fillStyle = PAL.chalk; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 22, 36); ctx.restore();
  const got = CLUES8.filter(c => ts >= c[0]); if (!got.length) return;
  ctx.save(); ctx.translate(W - 60, 230); rr(ctx, -470, -50, 470, 60 + got.length * 50, 22, 'rgba(8,10,18,.86)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.amber; ctx.fillText('NEW CLUES', -446, -14);
  got.forEach(([a, txt], i) => { const k = clamp((ts - a) / .3); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - E.outQ(k)) * 40, 0); ctx.fillStyle = '#B8E986'; ctx.fillText('✓', -446, 30 + i * 50); ctx.fillStyle = PAL.chalk; ctx.fillText(txt, -414, 30 + i * 50); ctx.restore(); });
  ctx.restore();
}
const PK8 = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'], DK8 = ['b1', 'b2', 'b3'];
function doorShake(ts) {                                                            // Patel's knocks shake the office door; Dev's barely do
  let sh = 0; PK8.forEach((k, i) => { const a = EVS(k); if (ts >= a) sh += Math.sin((ts - a) * 70) * (i < 3 ? 5 : 8) * Math.exp(-(ts - a) * 9); });
  DK8.forEach(k => { const a = EVS(k); if (ts >= a) sh += Math.sin((ts - a) * 70) * 1.5 * Math.exp(-(ts - a) * 12); }); return sh;
}
// ----------------------------------------------------------------------------------------------- the dead at the booth glass (behind the glass layer)
const ZG8 = [{ sd: 31, in: [18.4, 22.8, 1050, 430], hit: 'th1' }, { sd: 33, in: [18.9, 23.4, 1150, 520], hit: 'th2' }, { sd: 35, in: [19.4, 23.9, 1250, 610], hit: 'th3' }];
function glassDead(ctx, f, ts) {
  ZG8.forEach((z, i) => {
    const [a, b, x0, x1] = z.in, la = EVS('leave') + i * .45, lb = la + 4.2;
    let x, moving, dir = -1;
    if (ts < la) { const u = clamp((ts - a) / (b - a)); x = lerp(x0, x1, u); moving = u > 0 && u < 1; }
    else { const u = clamp((ts - la) / (lb - la)); x = lerp(x1, 1350, u); moving = u > 0 && u < 1; dir = moving || u >= 1 ? 1 : -1; }
    const hit = EVS(z.hit), pound = ts >= hit ? Math.exp(-(ts - hit) * 6) * Math.sin((ts - hit) * 30) * 6 : 0;
    const pressing = !moving && ts > b && ts < la;
    const pose = moving ? walkPose(x / 90, { stride: 22, lift: 8, bob: 3, lean: .26, tilt: .4, hands: { L: [92, -176], R: [78, -190] }, face: { look: [.7, .1], mouth: .7 } })
      : pressing ? basePose(pf5(f + z.sd * 3), { lean: .3, tilt: .2 * Math.sin(f * .05 + i), hands: { L: [96 + pound, -205], R: [90 + pound, -172] }, face: { look: [.9, 0], mouth: .9 } }) : zpose(pf5(f + z.sd * 4), z.sd, { stride: 0, lift: 0 });
    ctx.save(); ctx.globalAlpha = .9; person(ctx, { x, y: 0, s: .95, dir, kind: 'z', seed: z.sd, var: z.sd % 5 === 1 ? 2 : z.sd % 5, pose }, pf5(f + z.sd * 4)); ctx.restore();
  });
  if (ts > EVS('th1')) for (const [y, a] of [[-210, .22], [-176, .18]]) blob(ctx, 338, y, 12, 18, 'rgba(220,235,255,.9)', 0, a * (1 - clamp((ts - EVS('leave') - 3) / 2)));   // hand smudges on the glass
}
// ----------------------------------------------------------------------------------------------- Mira v2: hair frames the face (eyes + brows always visible), lashes, acting
function mira(ctx, x, y, f, o = {}) {
  const s = o.s || 1, typing = o.typing ? Math.sin(f * .6) : 0, g = o.gesture || 0, fl = o.flinch || 0, dir = o.dir || 1;
  const pose = { hip: [0, -70 - fl * 6], lean: (o.lean == null ? .12 : o.lean) - fl * .14 + Math.sin(f * .03) * .015, tilt: (o.tilt || 0) + g * .05 * Math.sin(f * .11), feet: { L: [40, -8], R: [52, -4] },
    hands: o.typing ? { L: [74 + typing * 6, -122], R: [84 - typing * 6, -120] } : { L: [58, -96], R: [66 + Math.sin(f * .16) * 12 * g, -118 - g * 36] },
    face: { look: o.look || [.9, 0], mouth: o.mouth || 0, brow: o.brow == null ? -.2 : o.brow, browUp: o.browUp || 0, eyes: o.wide ? 1.25 : 1.05, wide: !!o.wide, smile: o.smile == null ? .15 : o.smile } };
  const r = person(ctx, { x, y, s, dir, kind: 'dev', seed: 71, hoodie: false, shirt: '#7A4FB0', pants: '#2B2B3A', pose }, pf3(f));
  const [hx, hy] = r.head, hr = 40 * s; ctx.save(); ctx.translate(hx, hy); ctx.scale(dir, 1); ctx.rotate(pose.lean);
  ctx.fillStyle = '#3A2418'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4 * s; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(-hr - 12 * s, 8 * s, 15 * s, 28 * s, .45 + Math.sin(f * .05) * .07, 0, TAU); ctx.fill(); ctx.stroke();            // ponytail (sways)
  ctx.beginPath(); ctx.moveTo(-hr * .62, hr * .32); ctx.arc(0, 0, hr + 7 * s, Math.PI * .86, Math.PI * 1.72);                                     // crown + back
  ctx.lineTo(hr * .58, -hr * .84); ctx.quadraticCurveTo(hr * .3, -hr * 1.08, -hr * .1, -hr * .9); ctx.quadraticCurveTo(-hr * .5, -hr * .55, -hr * .62, hr * .32); ctx.closePath(); ctx.fill(); ctx.stroke();
  const pf = pf3(f), bk = Math.floor(pf / 190) * 190 + 40 + hash(Math.floor(pf / 190) + 71) * 110, eo = (pf >= bk && pf < bk + 7) ? .12 : (o.wide ? 1.25 : 1.05), big = o.wide ? 1.22 : 1, ey = -hr * .12;
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
  for (const ex of [hr * .26, hr * .66]) { const top = ey - 13.5 * big * eo * s; ctx.beginPath(); ctx.moveTo(ex + 6 * s, top + 2 * s); ctx.lineTo(ex + 13 * s, top - 5 * s); ctx.moveTo(ex + 1 * s, top); ctx.lineTo(ex + 4 * s, top - 8 * s); ctx.stroke(); }   // lashes
  ctx.fillStyle = 'rgba(255,120,140,.35)'; ctx.beginPath(); ctx.ellipse(hr * .52, hr * .24, 9 * s, 5 * s, 0, 0, TAU); ctx.fill();                  // blush
  dot(ctx, -hr * .58, hr * .08, 10 * s, '#222'); ctx.strokeStyle = '#222'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-hr * .58, -hr * .1); ctx.quadraticCurveTo(-hr * .5, -hr * 1.25, hr * .1, -hr * 1.12); ctx.stroke();   // headset
  ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-hr * .5, hr * .22); ctx.quadraticCurveTo(-hr * .05, hr * .85, hr * .5, hr * .66); ctx.stroke(); dot(ctx, hr * .52, hr * .66, 5 * s, '#222');
  ctx.restore();
}
// ----------------------------------------------------------------------------------------------- acting: talk gestures, knock flinches, weight shifts
function flinch8(ts) { let v = 0; PK8.forEach((k, i) => { const a = EVS(k); if (ts >= a) v += (i < 3 ? .7 : 1) * Math.exp(-(ts - a) * 7); }); return Math.min(1, v); }
const rayX8 = ts => 220 - 40 * sstep(ts, 23.5, 23.9);
const devX8 = ts => { if (ts < 27.2) return { x: 60 - 40 * sstep(ts, 23.5, 23.9), dir: -1, moving: false }; const w = pw(ts, [[27.2, 29.6, 20, -385]]); if (ts > 38.8) w.dir = 1; return w; };
function cast8(ctx, f, ts, o = {}) {
  const fl = flinch8(ts), tD = devTalk(f), tR = lineTalk(f, RAY8);
  mira(ctx, -220, -4, f, { s: 1, look: o.mlook || [.9, 0], dir: o.mdir || 1, mouth: lineTalk(f, MIRA8), gesture: lineTalk(f, MIRA8) > .05 ? .8 : 0, brow: o.mbrow == null ? -.3 : o.mbrow, browUp: o.mbrowUp, smile: o.msmile, wide: o.mwide, flinch: fl });
  const D = o.D || devX8(ts);
  const face = devFace(f, { wide: !!o.wide || fl > .3, eyes: o.wide || fl > .3 ? 1.3 : 1.05, brow: o.dbrow == null ? -.7 : o.dbrow, look: o.dlook || [.9, 0], mouth: devTalk(f), sweat: !!o.sweat });
  const knock = DK8.some(k => ts >= EVS(k) && ts < EVS(k) + .12), talkHand = [40 + Math.sin(f * .17) * 14 * tD, -150 - 40 * tD];
  const R = o.fist ? (knock ? [74, -214] : [52, -208]) : talkHand;
  const dp = D.moving ? walkPose((Math.abs(D.x - 20)) / 110, { stride: 22, lift: 8, bob: 2, lean: .08, face, hands: { L: [20, -100], R: [36, -150] } })
    : basePose(pf3(f), { lean: (o.fist ? .12 : .06) - .12 * fl + Math.sin(f * .025) * .02, face, hands: { L: [20, -100], R } });
  if (!D.moving) dp.hip = [dp.hip[0], dp.hip[1] - 8 * fl];
  person(ctx, DEVH(D.x, 0, dp, { dir: D.dir, hoodie: false }), pf3(f));
  const rp = basePose(pf3(f + 40), { lean: .08 - .12 * fl + Math.sin(f * .021 + 1) * .02, face: rayFace8(f, { ...(o.rface || {}), ...(fl > .3 ? { brow: 1, eyes: 1.2 } : {}) }), hands: { L: [20 + 30 * tR + Math.sin(f * .15) * 10 * tR, -100 - 60 * tR], R: [60, -150] } });
  rp.hip = [rp.hip[0], rp.hip[1] - 6 * fl];
  ray(ctx, o.rx == null ? rayX8(ts) : o.rx, 0, f, rp, { dir: o.rdir || -1, aim: .25, light: false });
}
// ----------------------------------------------------------------------------------------------- shots (cuts are picked by frame number so motion blur never mixes two set-ups)
SHOT.talk8 = (ctx, lt, lf, len, t, f) => {                                          // knocks -> Mira explains (close) -> Ray (close) -> Dev -> Mira
  const ts = t / 60, FR = f / 60;
  const cam = FR < 2.0 ? { x: -545, y: -205, z: 1.9 } : FR < 6.0 ? { x: -240, y: -175, z: lerp(2.05, 2.15, (ts - 2) / 4) } : FR < 10.0 ? { x: 230, y: -250, z: 1.9 } : FR < 12.7 ? { x: 160, y: -250, z: 1.9 } : { x: -240, y: -175, z: lerp(2.1, 2.25, (ts - 12.7) / 4.3) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, ['k1', 'k2', 'k3'].map(k => [EVF(k), 7]));
  boothSet(ctx, f, ts, { shake: doorShake(ts), shape: .55, gap: true });
  const atDoor = ts < 2.0 || (ts > 6.6 && ts < 9.6);
  cast8(ctx, f, ts, { mlook: ts < 2 ? [-.9, -.1] : [.9, -.05], mbrow: ts < 2 ? .4 : -.4, mwide: ts < 2, dlook: atDoor ? [-.9, -.1] : [.9, 0], rdir: -1, rface: { look: atDoor ? [.9, -.15] : [.9, 0], brow: atDoor ? .8 : .4 } });
  ctx.restore(); vig(ctx, .45);
  ['k1', 'k2', 'k3'].forEach((k, i) => sfxPop(ctx, 'KNOCK', W / 2 - 220 + i * 220, 450, f, EVF(k), PAL.chalk, 70, 30, -.06 + i * .05));
};
SHOT.glass = (ctx, lt, lf, len, t, f) => {                                          // louder knocks; the dead come to the glass; everyone backs off
  const ts = t / 60, cam = CAMKEYS(ts, [[17, -120, -250, 1.15, E.ioC], [18.8, 200, -270, .95, E.ioC], [24.4, 200, -270, .95, E.ioC], [25.0, 60, -260, 1.0, E.ioC], [26.8, 60, -260, 1.02]]);
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.3 }, t, ['k4', 'k5', 'k6', 'th1', 'th2', 'th3', 'k7', 'k8', 'k9'].map(k => [EVF(k), k[0] === 't' ? 5 : 9]));
  boothSet(ctx, f, ts, { shake: doorShake(ts), shape: .6, gap: true, behind: c => glassDead(c, f, ts) });
  const D = devX8(ts); D.dir = ts > 18.6 ? 1 : -1;
  cast8(ctx, f, ts, { D, wide: true, sweat: true, mlook: [.9, 0], mbrow: .6, mwide: ts > 19, dlook: ts < 18.6 ? [-.9, 0] : [.9, 0], rface: { look: [.9, 0], brow: .9 }, rdir: ts > 18.6 ? 1 : -1 });
  ctx.restore(); vig(ctx, .5);
  ['k4', 'k5', 'k6', 'k7', 'k8', 'k9'].forEach((k, i) => sfxPop(ctx, 'KNOCK', W / 2 - 220 + (i % 3) * 220, 560 + (i % 3) * 40, f, EVF(k), PAL.chalk, 80, 30, -.06 + (i % 3) * .05));
  ['th1', 'th2', 'th3'].forEach((k, i) => sfxPop(ctx, 'THUD', W / 2 + 140, 620 + i * 60, f, EVF(k), '#B8E986', 70, 26, .06));
};
SHOT.knockback = (ctx, lt, lf, len, t, f) => {                                      // Dev answers the knock - and Patel waits
  const ts = t / 60, FR = f / 60, D = devX8(ts);
  let cam;
  if (FR < 29.8) cam = { x: clamp(D.x + 60, -300, -60), y: -245, z: 1.5 };
  else if (FR < EVS('wait')) cam = { x: -400, y: -230, z: lerp(1.75, 1.85, (ts - 29.8) / 4.4) };
  else if (FR < 36.4) cam = { x: -490, y: -235, z: lerp(2.5, 2.7, clamp((ts - 34.2) / 2.2)) };
  else cam = { x: 50, y: -270, z: .95 };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.2 }, t, []);
  boothSet(ctx, f, ts, { shake: doorShake(ts), shape: ts > EVS('wait') ? 1 : .6, gap: true, still: ts > EVS('b3') + .2, behind: c => glassDead(c, f, ts) });
  cast8(ctx, f, ts, { D, fist: ts > 29.6 && ts < 34.6, wide: ts < 34, mlook: ts > 27.4 ? [-.9, -.05] : [.9, 0], mbrow: .5, dlook: [.9, -.05], rface: { look: [.9, 0] } });
  ctx.restore(); vig(ctx, .5 + .1 * (FR >= EVS('wait') && FR < 36.4));
  DK8.forEach((k, i) => sfxPop(ctx, 'knock', W / 2 - 140 + i * 140, 600, f, EVF(k), '#9FD8FF', 54, 24, .05));
  if (FR >= EVS('wait') + .6 && FR < 36.4) marker(ctx, '…HE STOPPED', W / 2, 1600, 56, PAL.amber, { stroke: 12, s: outB((ts - EVS('wait') - .6) / .25, 1.5) });
};
SHOT.engine = (ctx, lt, lf, len, t, f) => {                                         // "Six months, Dev?" (Mira close) / "Not now." (Dev close) / the engine dies (Ray close)
  const ts = t / 60, FR = f / 60;
  const cam = FR < 40.4 ? { x: -270, y: -185, z: 2.0 } : FR < 41.6 ? { x: -360, y: -250, z: 2.0 } : { x: 170, y: -280, z: lerp(1.8, 1.9, (ts - 41.6) / 3) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.1 }, t, []);
  boothSet(ctx, f, ts, { shape: 1, gap: true, still: true });
  cast8(ctx, f, ts, { mdir: -1, mlook: [.9, -.05], mbrow: -.1, mbrowUp: ts < 40.4 ? 6 : 0, msmile: ts < 40.4 ? .6 : .2, dbrow: ts > 40.3 ? .6 : -.2, dlook: ts > 40.3 ? [.3, .6] : [.9, 0], rdir: -1, rface: { look: ts > 41.4 ? [.2, -.9] : [.9, 0], brow: ts > 41.4 ? 1 : .5, eyes: ts > 41.9 ? 1.2 : .8 } });
  ctx.restore(); vig(ctx, .45);
  sfxPop(ctx, '…putt… putt…', W / 2, 560, f, EVF('stall'), '#9AA0B0', 54, 50, -.04);
};
function vanCam8(ctx, f, ts) {                                                      // CAM 3 again: engine off, lights off - and the driver's seat is empty
  ctx.fillStyle = '#05070D'; ctx.fillRect(0, 0, W, H); rr(ctx, 80, 380, W - 160, 760, 30, '#0E1116', '#3A3F4E', 10);
  const z = lerp(1, 1.7, sstep(ts, 45.2, 47.4)), ty = lerp(0, 60, sstep(ts, 45.2, 47.4));
  ctx.save(); ctx.beginPath(); rrect(ctx, 110, 410, W - 220, 700, 16); ctx.clip(); ctx.translate(W / 2, 760 + ty); ctx.scale(z, z);
  ctx.fillStyle = '#1A1D24'; ctx.fillRect(-500, -400, 1000, 800); rainField(ctx, f, -500, 500, -400, 400, 90);
  rr(ctx, -380, -260, 760, 520, 40, '#B8B6AE', PAL.ink, 6); rr(ctx, -320, -220, 640, 260, 24, '#2A3242', PAL.ink, 5);
  ctx.save(); ctx.beginPath(); rrect(ctx, -320, -220, 640, 260, 24); ctx.clip();
  rr(ctx, 10, -90, 100, 150, 20, '#3A4252', '#1A1E28', 4); rr(ctx, 30, -150, 60, 50, 14, '#3A4252', '#1A1E28', 4);                       // empty seat + headrest
  line(ctx, 100, -120, 30, 30, 8, '#14171E'); line(ctx, 30, 30, 20, 60, 8, '#14171E');                                                 // the belt, hanging loose
  ctx.strokeStyle = '#1A1E28'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(60, 20, 90, 30, 0, Math.PI, TAU); ctx.stroke();
  for (let i = 0; i < 9; i++) { const u = (hash(i * 9.1) + f * .004 * (1 + hash(i))) % 1; blob(ctx, -300 + hash(i * 4.4) * 600, -200 + u * 240, 3, 7, 'rgba(200,220,255,.35)'); }
  ctx.restore(); rr(ctx, -340, 90, 680, 70, 12, '#9A988F'); ctx.fillStyle = '#7A2A2A'; ctx.fillRect(-20, 100, 40, 50);
  for (const hx of [-300, 300]) rr(ctx, hx - 40, 110, 80, 40, 12, '#2A2C30', PAL.ink, 3);                                             // headlights: dark
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(110, 410, W - 220, 700); ctx.restore();
  for (let y = 410; y < 1110; y += 6) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(110, y, W - 220, 2); }
  marker(ctx, 'CAM 3 · ENTRANCE', 330, 470, 36, '#6CFF9A', { stroke: 8 }); marker(ctx, 'REC ●', W - 220, 470, 36, PAL.red, { stroke: 8, a: (f % 40) < 26 ? 1 : .2 });
  marker(ctx, 'ENGINE: OFF', W / 2, 1060, 34, '#9AA0B0', { stroke: 8, a: sstep(ts, 44.8, 45.1) * (1 - sstep(ts, 46.0, 46.2)) });
  marker(ctx, 'DRIVER SEAT: EMPTY', W / 2, 1060, 38, '#FFD27A', { stroke: 8, a: sstep(ts, EVS('seat'), EVS('seat') + .3) });
  vig(ctx, .6);
}
SHOT.cctv8 = (ctx, lt, lf, len, t, f) => vanCam8(ctx, f, t / 60);
SHOT.react = (ctx, lt, lf, len, t, f) => {
  const ts = t / 60, cam = { x: -110, y: -255, z: lerp(1.2, 1.45, sstep(ts, 51, 53.5)) };
  ctx.save(); applyCam(ctx, { ...cam, hand: 1.2 }, t, []);
  boothSet(ctx, f, ts, { shape: 1, gap: true, still: true });
  cast8(ctx, f, ts, { wide: true, sweat: true, mdir: 1, mlook: [.9, -.3], mbrow: .8, mwide: true, dlook: [.9, -.2], rface: { look: [-.6, -.6], brow: 1 } });
  ctx.restore(); vig(ctx, .6);
  if (ts > 51.4) marker(ctx, 'WHERE DID HE GO?', W / 2, 1600, 58, PAL.red, { stroke: 12, s: outB((ts - 51.4) / .25, 1.5) });
};
SHOT.end8 = (ctx, lt, lf, len, t, f) => {
  ctx.fillStyle = '#080A12'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, 760, 50, W / 2, 760, 900); g.addColorStop(0, 'rgba(255,59,48,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = outB(lf / 12, 1.4); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(u, u); marker(ctx, 'PART 9', 0, 0, 190, PAL.chalk, { stroke: 30 }); ctx.restore();
  const k = lf >= 20 ? outB((lf - 20) / 12, 1.4) : 0; ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); marker(ctx, 'THE DRIVER', 0, 0, 140, PAL.red, { stroke: 26 }); ctx.restore();
  const p = clamp((lf - 40) / 10); ctx.save(); ctx.globalAlpha = p; marker(ctx, 'WHERE DID THE DRIVER GO?', W / 2, 960, 50, PAL.amber, { stroke: 12 }); marker(ctx, 'COMMENT YOUR THEORY', W / 2, 1040, 42, PAL.chalk, { stroke: 12 }); ctx.restore();
  vig(ctx, .6);
};
