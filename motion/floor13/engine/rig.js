// rig.js - jointed stickman rig (2-bone IK limbs, hoodie, face with lip-sync) + zombie variants. Local space: origin = ground under feet,
// y up is negative, +x = the direction the character faces. All poses are pure functions of the frame number.
'use strict';
const R = { th: 56, sh: 56, torso: 84, headR: 40, up: 46, fo: 46, w: 15 };
const HIP_H = 104;

function ik2(rx, ry, tx, ty, l1, l2, pref) {
  let dx = tx - rx, dy = ty - ry, d = Math.hypot(dx, dy); const mx = (l1 + l2) * 0.999;
  if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; } d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  const a = Math.atan2(dy, dx), A = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const c1 = [rx + Math.cos(a + A) * l1, ry + Math.sin(a + A) * l1], c2 = [rx + Math.cos(a - A) * l1, ry + Math.sin(a - A) * l1];
  const k = (c1[0] - rx) * pref[0] + (c1[1] - ry) * pref[1] > (c2[0] - rx) * pref[0] + (c2[1] - ry) * pref[1] ? c1 : c2;
  return [k, [rx + dx, ry + dy]];
}
function seg(ctx, a, b, w, col, f, seed, outline) {
  const bb = Math.floor(f / 5), j = (i, k) => jit(seed + i, bb, 1.1 + k);
  const x0 = a[0] + j(1, 0), y0 = a[1] + j(2, 0), x1 = b[0] + j(3, 0), y1 = b[1] + j(4, 0);
  ctx.lineCap = 'round';
  if (outline) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = w + 7; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}

// ----------------------------------------------------------------------------------------------- poses
// pose fields: hip[x,y] lean tilt hands{L,R} feet{L,R} face{look,brow,mouth,smile,eyes} + style: kind('dev'|'z'), hoodie(bool), var
function basePose(f, o = {}) {
  const br = Math.sin(f * .07 + (o.seed || 0)) * 1.6;
  return { hip: [0, -HIP_H + br], lean: .05, tilt: 0, feet: { L: [-16, 0], R: [16, 0] }, hands: null, face: {}, ...o };
}
function walkPose(ph, o = {}) {                                   // ph in cycles; o.stride, o.lift, o.arms
  const stride = o.stride == null ? 46 : o.stride, lift = o.lift == null ? 26 : o.lift, foot = p => {
    const u = ((p % 1) + 1) % 1; if (u < .5) return [lerp(stride, -stride, u / .5), 0];
    const k = (u - .5) / .5; return [lerp(-stride, stride, E.ioC(k)), -Math.sin(k * Math.PI) * lift];
  };
  const fl = foot(ph), fr = foot(ph + .5), bob = Math.abs(Math.sin(ph * TAU)) * (o.bob == null ? 7 : o.bob);
  const sw = (o.arms == null ? 1 : o.arms) * Math.sin(ph * TAU);
  return { hip: [0, -HIP_H + 6 - bob + (o.hipY || 0)], lean: o.lean == null ? .1 : o.lean, tilt: o.tilt || 0, feet: { L: fl, R: fr }, hands: o.hands === undefined ? 'swing' : o.hands, swing: sw, face: o.face || {} };
}

// ----------------------------------------------------------------------------------------------- face
function face(ctx, F, kind, f, seed, dir, headR, ext) {
  const look = F.look || [.4, 0], open = F.eyes == null ? 1 : F.eyes, brow = F.brow || 0, mouth = F.mouth || 0, smile = F.smile == null ? .3 : F.smile;
  const bk = Math.floor(f / 190) * 190 + 40 + hash(Math.floor(f / 190) + seed) * 110, blink = (f >= bk && f < bk + 7) ? .12 : 1;
  const eo = Math.max(.05, open * blink);
  if (kind === 'dev') {
    const ex = [headR * .26, headR * .66], ey = -headR * .12;
    for (let i = 0; i < 2; i++) {
      const x = ex[i], big = F.wide ? 1.22 : 1;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, ey, 10.5 * big, 13.5 * big * eo, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x + look[0] * 5, ey + look[1] * 6 * eo, F.wide ? 3.6 : 5, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';                      // brows: + angry (inner low) / - worried (inner high)
    const by = ey - 25 - (F.browUp || 0);
    ctx.beginPath(); ctx.moveTo(ex[0] - 11, by - brow * 4); ctx.lineTo(ex[0] + 12, by + brow * 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex[1] - 12, by + brow * 5); ctx.lineTo(ex[1] + 11, by - brow * 4); ctx.stroke();
    const mx = headR * .46, my = headR * .5;
    if (mouth > .06) { ctx.fillStyle = '#3A0F14'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(mx, my + mouth * 5, 7 + mouth * 6, 3 + mouth * 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
      if (mouth > .35) { ctx.fillStyle = '#E8647A'; ctx.beginPath(); ctx.ellipse(mx, my + mouth * 12, 5 + mouth * 3, 2 + mouth * 3, 0, 0, TAU); ctx.fill(); } }
    else { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(mx - 10, my); ctx.quadraticCurveTo(mx, my + smile * 12, mx + 10, my - (F.mouthSkew || 0)); ctx.stroke(); }
    if (F.sweat) sweat(ctx, -headR * .2, -headR * .8, f, 1);
  } else {                                                                                          // zombie face
    const ex = [headR * .24, headR * .64], ey = -headR * .1, v = ext.var || 0;
    ctx.fillStyle = '#EAF2D8'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(ex[0], ey, 11, 13.5 * eo, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex[1], ey + 2, 8, 9.5 * eo, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.arc(ex[0] + look[0] * 3, ey + look[1] * 3, 6.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(ex[1] + look[0] * 2, ey + 2, 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex[0] - 11, ey - 20); ctx.lineTo(ex[0] + 9, ey - 28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ex[1] - 8, ey - 24); ctx.lineTo(ex[1] + 10, ey - 18); ctx.stroke();
    const jaw = F.mouth == null ? .5 + .3 * Math.sin(f * .21 + seed) : mouth, mx = headR * .42, my = headR * .5;
    ctx.fillStyle = '#220A0C'; ctx.beginPath(); ctx.ellipse(mx, my + jaw * 6, 10, 4 + jaw * 11, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#EAF2D8'; ctx.fillRect(mx - 7, my - 2 + jaw * 0, 4, 6); ctx.fillRect(mx + 2, my - 2, 4, 5);
    if (v === 2) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4, -headR * .75); ctx.lineTo(10, -headR * .55); ctx.stroke(); for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-2 + k * 5, -headR * .78 + k * 3); ctx.lineTo(2 + k * 5, -headR * .5 + k * 3); ctx.stroke(); } }  // stitches
  }
}

// ----------------------------------------------------------------------------------------------- person
// P: {x, y, s, dir, seed, f, kind, hoodie, var, pose}. Draws in world space.
function person(ctx, P, f) {
  const pose = P.pose, kind = P.kind || 'dev', seed = P.seed || 0, dev = kind === 'dev';
  ctx.save(); ctx.translate(P.x, P.y); ctx.scale((P.s || 1) * (P.dir || 1), (P.s || 1) * (P.sy || 1));
  const v = P.var || 0, sk = dev ? PAL.skin : PAL.zskin, lc = dev ? PAL.chalk : PAL.zskin, shirt = dev ? (P.hoodie === false ? '#D9D6CC' : PAL.hood) : [ '#8B3A3A', '#2E3342', '#B8B09A', '#3C5A86', '#E8E6DC' ][v % 5];
  const hip = pose.hip, lean = pose.lean || 0, sl = Math.sin(lean), cl = Math.cos(lean);
  const neck = [hip[0] + sl * R.torso, hip[1] - cl * R.torso], sh = [neck[0] - sl * 8 + cl * 2, neck[1] + cl * 8];
  const tilt = pose.tilt || 0, hc = [neck[0] + Math.sin(lean + tilt) * (R.headR + 4), neck[1] - Math.cos(lean + tilt) * (R.headR + 4)];
  // hands default: swing
  let hands = pose.hands;
  if (hands === 'swing' || !hands) { const sw = pose.swing || 0; hands = { L: [sh[0] + 12 + sw * 34, sh[1] + 78 - Math.abs(sw) * 6], R: [sh[0] + 6 - sw * 34, sh[1] + 78 - Math.abs(sw) * 6] }; }
  const feet = pose.feet;
  const legs = ['L', 'R'].map(k => ik2(hip[0], hip[1], feet[k][0], feet[k][1], R.th, R.sh, [1, .1]));
  const arms = ['L', 'R'].map(k => ik2(sh[0], sh[1], hands[k][0], hands[k][1], R.up, R.fo, [-.3, 1]));
  const dark = (c) => c;                                                                // far limbs drawn first, slightly darkened by overlay below
  const drawLeg = (i) => {
    const [k, a] = legs[i]; const col = dev ? (P.pants || lc) : lc;
    seg(ctx, hip, k, R.w, col, f, seed + i * 5, true); seg(ctx, k, a, R.w - 1, col, f, seed + i * 5 + 2, true);
    const fx = a[0] + 9, fy = a[1] - 2; ctx.fillStyle = dev ? '#F4F1E6' : '#3A3F52'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(fx, fy - 3, 23, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
    if (dev) { ctx.fillStyle = PAL.red; ctx.fillRect(fx - 14, fy - 4, 22, 4); }
  };
  const drawArm = (i) => {
    const [k, a] = arms[i]; const col = (dev && P.hoodie !== false) ? shirt : (dev ? lc : lc), w = (dev && P.hoodie !== false) ? R.w + 3 : R.w - 2;
    seg(ctx, sh, k, w, col, f, seed + 20 + i * 5, true); seg(ctx, k, a, w - 1, col, f, seed + 22 + i * 5, true);
    if (P.holdProp && i === (P.holdHand == null ? 1 : P.holdHand)) P.holdProp(ctx, a, f);
    ctx.fillStyle = sk; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a[0], a[1], 10.5, 0, TAU); ctx.fill(); ctx.stroke();
  };
  ctx.globalAlpha *= 1;
  // far side (L) first
  drawLeg(0); drawArm(0);
  // torso
  ctx.lineCap = 'round';
  if (dev && P.hoodie !== false) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 64; ctx.beginPath(); ctx.moveTo(hip[0], hip[1] + 6); ctx.lineTo(neck[0], neck[1] + 4); ctx.stroke();
    ctx.strokeStyle = shirt; ctx.lineWidth = 56; ctx.beginPath(); ctx.moveTo(hip[0], hip[1] + 6); ctx.lineTo(neck[0], neck[1] + 4); ctx.stroke();
    ctx.strokeStyle = PAL.hoodD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hip[0] - 12, hip[1] - 14); ctx.lineTo(hip[0] + 16 + sl * 10, hip[1] - 14 - 8); ctx.stroke();                 // pocket
    ctx.beginPath(); ctx.moveTo(neck[0] + 10, neck[1] + 12); ctx.lineTo(neck[0] + 12 + sl * 6, neck[1] + 44); ctx.stroke();                                                     // string
  } else {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 60; ctx.beginPath(); ctx.moveTo(hip[0], hip[1] + 4); ctx.lineTo(neck[0], neck[1] + 4); ctx.stroke();
    ctx.strokeStyle = shirt; ctx.lineWidth = 52; ctx.beginPath(); ctx.moveTo(hip[0], hip[1] + 4); ctx.lineTo(neck[0], neck[1] + 4); ctx.stroke();
    if (!dev) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; for (let t = 0; t < 4; t++) { const u = t / 3, x = lerp(hip[0], neck[0], .1) + (u - .5) * 40 + 0; ctx.beginPath(); ctx.moveTo(x - 6, hip[1] + 8); ctx.lineTo(x, hip[1] - 4); ctx.lineTo(x + 6, hip[1] + 8); ctx.stroke(); }          // torn hem
      if (v === 1) { ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.moveTo(neck[0] + 4, neck[1] + 14); ctx.lineTo(neck[0] + 16, neck[1] + 20); ctx.lineTo(neck[0] + 12, neck[1] + 62); ctx.lineTo(neck[0] + 2, neck[1] + 58); ctx.fill(); } }   // tie
  }
  // head
  ctx.save(); ctx.translate(hc[0], hc[1]); ctx.rotate(lean + tilt);
  if (dev && P.hoodie !== false) { ctx.fillStyle = PAL.hoodD; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-6, 4, R.headR + 8, Math.PI * .45, Math.PI * 1.7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = sk; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, R.headR, 0, TAU); ctx.fill(); ctx.stroke();
  if (dev && P.hoodie !== false) { ctx.strokeStyle = PAL.hood; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(0, -2, R.headR + 3, Math.PI * 1.05, Math.PI * 1.88); ctx.stroke(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -2, R.headR + 9, Math.PI * 1.07, Math.PI * 1.86); ctx.stroke(); }
  if (!dev && v === 3) { ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; rr(ctx, -20, -R.headR - 40, 44, 34, 12, '#fff', PAL.ink, 4); rr(ctx, -26, -R.headR - 10, 56, 12, 6, '#fff', PAL.ink, 4); }   // chef hat
  face(ctx, pose.face || {}, kind, f, seed, 1, R.headR, { var: v });
  ctx.restore();
  // near side (R)
  drawLeg(1); drawArm(1);
  ctx.restore();
  return { head: [P.x + hc[0] * (P.s || 1) * (P.dir || 1), P.y + hc[1] * (P.s || 1)], hands: arms.map(a => a[1]) };
}

// mouth openness for the narrator at frame f (lip-sync from the VO envelope)
function talk(f) {
  for (const l of TL.lines) if (f >= l.t0 && f < l.t0 + l.n) { const e = ENV[l.id][f - l.t0] || 0; return Math.min(1, e * 1.1); }
  return 0;
}
