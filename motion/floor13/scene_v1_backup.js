// scene.js — FLOOR 13, episode 1. Stickman cutaway tower, 1080x1920 @60. Every frame is a pure function of its number.
'use strict';
const SHUTTER = 0.5;
const Q = new URLSearchParams(location.search);
const SUB_DEFAULT = +(Q.get('sub') || 1);
function subsamples(f) { return SUB_DEFAULT; }
const has = n => !!IMG[n];
const CLIPS = [];
function clip(a, b, draw, z = 0) { CLIPS.push({ a, b, draw, z }); CLIPS.sort((p, q) => p.z - q.z); }
let FR = 0;
function drawScene(ctx, t, f) {
  FR = f;
  for (const c of CLIPS) if (f >= c.a && f < c.b) { ctx.save(); c.draw(ctx, t, f); ctx.restore(); }
}

// ------------------------------------------------------------ palette + world
const P = { ink: '#0E0F12', wall: '#171A20', room: '#1E222A', chalk: '#F2F0E8', red: '#FF3B30', grey: '#7C8A7A', dim: '#8F8F86', sheet: '#E8E4D4' };
const FH = 230, TX0 = 90, TX1 = 990, STAIR = 790;           // floor height, tower x-range, stair column x
const fy = n => (14 - n) * FH;                               // world y of the FLOOR LINE (bottom) of floor n
const FONT = FONTS.sansX;
const SEC = s => Math.round(s * 60);
const VO = [0.3, 2.8, 8.2, 14.5, 22.5, 33.0, 41.6];          // voice line start times (s); durations come from audio/vo/lines.json
const VOD = [3.29, 4.35, 4.16, 2.67, 2.82, 3.07, 2.24];
const VOT = ["I'm on the thirteenth floor... and I can't climb down.", "Last night, everything was normal. This morning, my building has guests.", "One of them is my neighbor. He still has the pizza coupon in his hand.", "Plan A: bedsheets. Plan B: more bedsheets.", "Twelve floors to go. How hard can it be?", "Nobody told me the rope was only three floors long.", "Episode two. Floor eleven."];

// ------------------------------------------------------------ camera
function cam(ctx, cx, cy, z) { ctx.translate(W / 2, H * 0.42); ctx.scale(z, z); ctx.translate(-cx, -cy); }

// ------------------------------------------------------------ stickmen
function limb(ctx, x, y, a, len, w, col) { line(ctx, x, y, x + Math.sin(a) * len, y + Math.cos(a) * len, w, col); return [x + Math.sin(a) * len, y + Math.cos(a) * len]; }
// feet at (x,y); s = scale; o: arms [a1,a2] legs [l1,l2] (radians from straight down), lean, tilt, zombie, hood, face
function stick(ctx, x, y, s, o = {}) {
  const col = o.col || (o.zombie ? P.grey : P.chalk), w = (o.w || 9) * s, lean = o.lean || 0;
  const hipY = y - 62 * s, hipX = x, shY = hipY - 52 * s, shX = hipX + Math.sin(lean) * 52 * s;
  const [l1, l2] = o.legs || [0.12, -0.12], [a1, a2] = o.arms || [0.3, -0.3];
  limb(ctx, hipX, hipY, l1, 62 * s, w, col); limb(ctx, hipX, hipY, l2, 62 * s, w, col);
  line(ctx, hipX, hipY, shX, shY, w, col);
  const e1 = limb(ctx, shX, shY, a1, 26 * s, w, col); limb(ctx, e1[0], e1[1], a1 + (o.bend || 0.3), 26 * s, w, col);
  const e2 = limb(ctx, shX, shY, a2, 26 * s, w, col); limb(ctx, e2[0], e2[1], a2 - (o.bend || 0.3), 26 * s, w, col);
  const hx = shX + Math.sin(o.tilt || 0) * 22 * s, hy = shY - 24 * s;
  ctx.fillStyle = P.ink; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(hx, hy, 19 * s, 0, TAU); ctx.fill(); ctx.stroke();
  if (o.hood) { ctx.beginPath(); ctx.arc(hx, hy, 19 * s + w * 0.5, Math.PI * 1.02, Math.PI * 2.0); ctx.lineWidth = w * 1.5; ctx.stroke(); }
  const d = o.dir || 1;
  if (o.zombie) { dot(ctx, hx + 6 * s * d, hy - 3 * s, 4.2 * s, P.red); line(ctx, hx - 8 * s, hy + 8 * s, hx + 10 * s, hy + 6 * s, 3 * s, col); }
  else {
    const open = o.scared ? 1 : 0;
    dot(ctx, hx + 6 * s * d, hy - 4 * s, 2.6 * s, col); dot(ctx, hx + 14 * s * d, hy - 4 * s, 2.6 * s, col);
    if (open) { ctx.strokeStyle = col; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.ellipse(hx + 10 * s * d, hy + 9 * s, 4 * s, 6 * s, 0, 0, TAU); ctx.stroke(); }
    else line(ctx, hx + 4 * s * d, hy + 8 * s, hx + 16 * s * d, hy + 8 * s, 3 * s, col);
  }
  return { hx, hy, shX, shY, hipX, hipY };
}
function zombie(ctx, x, y, s, f, seed, dir = 1) {
  const tf = Math.floor(f / 5) * 5, ph = tf * 0.19 + seed * 7;                       // twelve-fps stepping on a 60 fps camera
  const sw = Math.sin(ph);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.translate(-x, -y);
  stick(ctx, x, y - Math.abs(Math.cos(ph)) * 3 * s, s, { zombie: 1, arms: [1.45 + sw * 0.1, 1.2 - sw * 0.1], legs: [sw * 0.5, -sw * 0.5], bend: 0.08, lean: 0.22, tilt: 0.5 + hash(seed) * 0.3 + Math.sin(ph * 0.5) * 0.15 });
  ctx.restore();
}

// ------------------------------------------------------------ tower
function tower(ctx, f, top, bot, o = {}) {
  ctx.fillStyle = P.wall; ctx.fillRect(TX0 - 28, fy(top) - FH - 40, TX1 - TX0 + 56, (top - bot + 1) * FH + 80);
  for (let n = top; n >= bot; n--) {
    const y0 = fy(n) - FH, y1 = fy(n);
    ctx.fillStyle = n === 13 && !o.noHero ? '#252A34' : P.room; ctx.fillRect(TX0, y0 + 6, STAIR - TX0 - 6, FH - 12);
    ctx.fillStyle = '#12151A'; ctx.fillRect(STAIR, y0 + 6, TX1 - STAIR, FH - 12);               // stair column
    for (let k = 0; k < 4; k++) line(ctx, STAIR + 10 + k * 46, y1 - 8 - k * 28, STAIR + 56 + k * 46, y1 - 36 - k * 28, 4, '#2A2F3A');
    line(ctx, TX0, y1, STAIR - 6, y1, 6, '#2F3541');
    // window on the left wall + chained stair door
    ctx.fillStyle = '#0B0D10'; ctx.fillRect(TX0 - 6, y1 - 150, 16, 90);
    if (!o.noChain) { line(ctx, STAIR - 4, y1 - 120, STAIR + 30, y1 - 100, 5, '#6a6f78'); line(ctx, STAIR - 4, y1 - 100, STAIR + 30, y1 - 120, 5, '#6a6f78'); }
    ctx.font = `800 40px ${FONT}`; ctx.fillStyle = '#3A404C'; ctx.textAlign = 'left'; ctx.fillText(n, TX0 + 14, y0 + 52);
  }
}

// ------------------------------------------------------------ floor counter + captions
function counter(ctx, n, f, shake = 0, red = P.red) {
  ctx.save(); const sx = (hash(f * 3.1) - .5) * shake, sy = (hash(f * 5.7) - .5) * shake;
  ctx.translate(86 + sx, 150 + sy); ctx.fillStyle = 'rgba(14,15,18,.75)'; rrect(ctx, -30, -92, 250, 150, 26); ctx.fill();
  ctx.font = `800 40px ${FONT}`; ctx.fillStyle = P.chalk; ctx.textAlign = 'left'; ctx.fillText('FLOOR', -8, -44);
  ctx.font = `800 108px ${FONT}`; ctx.fillStyle = red; ctx.fillText(String(n), -6, 44); ctx.restore();
}
function captions(ctx, f) {
  let i = -1; for (let k = 0; k < VO.length; k++) if (f >= SEC(VO[k] - .05) && f <= SEC(VO[k] + VOD[k] + .45)) i = k;
  if (i < 0) return;
  const words = VOT[i].split(' '), t0 = SEC(VO[i]), dur = SEC(VOD[i]);
  const wts = words.map(w => w.length + 2), tot = wts.reduce((a, b) => a + b, 0);
  let acc = 0; const spans = words.map((w, j) => { const a = acc / tot; acc += wts[j]; return [t0 + a * dur, t0 + acc / tot * dur]; });
  const size = 74; ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const lines = [[]]; let wd = 0;
  words.forEach((w, j) => { const m = ctx.measureText(w + ' ').width; if (wd + m > 900 && lines[lines.length - 1].length) { lines.push([]); wd = 0; } lines[lines.length - 1].push(j); wd += m; });
  const y0 = 1330 - (lines.length - 1) * 44;
  lines.forEach((ln, r) => {
    const tw = ln.reduce((a, j) => a + ctx.measureText(words[j] + ' ').width, 0); let x = W / 2 - tw / 2;
    ln.forEach(j => {
      const on = f >= spans[j][0] && f < spans[j][1], past = f >= spans[j][1];
      const m = ctx.measureText(words[j] + ' ').width, pop = on ? 1 + 0.08 * Math.sin(Math.min(1, (f - spans[j][0]) / 8) * Math.PI) : 1;
      ctx.save(); ctx.translate(x + (m - ctx.measureText(' ').width) / 2, y0 + r * 92); ctx.scale(pop, pop);
      ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = P.ink; ctx.textAlign = 'center'; ctx.strokeText(words[j], 0, 0);
      ctx.fillStyle = on ? P.red : (past ? P.chalk : '#B9B7AE'); ctx.fillText(words[j], 0, 0); ctx.restore(); x += m;
    });
  });
}

// ------------------------------------------------------------ props
function door(ctx, x, yFloor, shake) {
  ctx.save(); ctx.translate(x + (hash(FR * 9.3) - .5) * shake, yFloor); ctx.fillStyle = '#3B2F28'; ctx.fillRect(-34, -150, 68, 150);
  ctx.strokeStyle = '#6b564a'; ctx.lineWidth = 5; ctx.strokeRect(-34, -150, 68, 150); dot(ctx, -20, -70, 6, '#d6b36a'); dot(ctx, 0, -118, 5, '#0a0a0a'); ctx.restore();
}
function sheetRope(ctx, x0, y0, x1, y1, n, f) {                 // knotted bedsheet rope, n segments revealed
  const L = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, n);
  for (let i = 0; i < k; i++) {
    const a = i / k, b = (i + 1) / k, sag = Math.sin(f * 0.05 + i) * 3;
    line(ctx, x0 + (x1 - x0) * a + sag, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b + sag, y0 + (y1 - y0) * b, 15, i % 2 ? P.sheet : '#d9d3be');
    dot(ctx, x0 + (x1 - x0) * b + sag, y0 + (y1 - y0) * b, 10, '#bdb69b');
  }
}
function label(ctx, txt, x, y, size, col, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = P.ink; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }
function vignette(ctx, a = .6) { const g = ctx.createRadialGradient(W / 2, H * 0.45, 400, W / 2, H * 0.45, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

const RX = 450, RY = fy(13);                                     // Dev's room anchor (feet)

// ------------------------------------------------------------ BEAT 1 (0–120): door thuds, Dev frozen
clip(0, 120, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const z = lerp(2.7, 2.35, prog(t, 0, 120));
  ctx.save(); cam(ctx, 590, RY - 80, z);
  tower(ctx, f, 13, 13, { noChain: 1 });
  const thud = [14, 56, 96].some(a => f >= a && f < a + 6) ? 10 : 1.5;
  door(ctx, 700, RY, thud);
  const bob = Math.sin(t * .25) * 1.5;
  stick(ctx, RX, RY + bob, 1.1, { hood: 1, scared: 1, arms: [0.25, -0.25], legs: [.07, -.07], dir: 1, tilt: .1 });
  ctx.restore(); vignette(ctx, .7);
  counter(ctx, 13, f);
}, 5);

// ------------------------------------------------------------ BEAT 2 (120–420): pull-out, the building has guests
const ZPOS = [[12, 380, .31], [12, 640, .52], [11, 300, .77], [11, 560, .13], [10, 450, .91], [10, 680, .44], [9, 340, .66]];
clip(120, 420, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const u = E.ioE(prog(t, 120, 260)), z = lerp(2.35, 0.82, u), cy = lerp(RY - 80, fy(11) - 40, u), cx = lerp(590, 540, u);
  ctx.save(); cam(ctx, cx, cy, z);
  tower(ctx, f, 13, 8);
  door(ctx, 700, RY, 3);
  stick(ctx, RX, RY, 1.1, { hood: 1, scared: 1, arms: [0.25, -0.25], legs: [.07, -.07], tilt: .1 });
  ZPOS.forEach(([n, x0, sd], i) => { const shown = prog(t, 150 + i * 14, 175 + i * 14); if (shown > 0) { ctx.globalAlpha = shown; zombie(ctx, x0 + Math.sin(t * .02 + sd * 9) * 60, fy(n) - 6, 1, f + i * 7, sd, Math.sin(t * .02 + sd * 9) > 0 ? 1 : -1); ctx.globalAlpha = 1; } });
  ctx.restore(); vignette(ctx, .55);
  counter(ctx, 13, f);
}, 5);

// ------------------------------------------------------------ BEAT 3 (420–840): peephole, the neighbor, the pizza coupon
function peephole(ctx, t, f) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.42, R = 470; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  const g = ctx.createLinearGradient(0, cy - R, 0, cy + R); g.addColorStop(0, '#2c3a2c'); g.addColorStop(1, '#10160f'); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const k = E.ioQ(prog(t, 520, 590)), s = lerp(1.1, 3.4, k), jit = (hash(f) - .5) * 4;
  ctx.translate(cx + jit, cy + 140); ctx.scale(s, s);
  stick(ctx, 0, 160, 1.3, { zombie: 1, arms: [1.4, 1.0], legs: [.1, -.1], lean: .1, tilt: .35, w: 9 });
  ctx.fillStyle = '#f2d98b'; ctx.fillRect(40, -20, 52, 34); label(ctx, 'PIZZA', 66, 4, 11, '#222');          // the coupon
  ctx.restore();
  ctx.lineWidth = 36; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R + 18, 0, TAU); ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = '#8a7a50'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  const eye = prog(t, 560, 600); if (eye > 0) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); dot(ctx, cx + 8, cy - 30, 18 + eye * 230, P.red, .96); dot(ctx, cx + 8, cy - 30, 5 + eye * 80, '#150000'); ctx.restore(); }
}
clip(420, 840, (ctx, t, f) => {
  if (f >= 520 && f < 603) { peephole(ctx, t, f); counter(ctx, 13, f, 6); return; }        // smash cut at 603
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const zz = f < 520 ? lerp(2.2, 2.6, prog(t, 420, 520)) : 2.3;
  ctx.save(); cam(ctx, 600, RY - 80, zz);
  tower(ctx, f, 13, 13, { noChain: 1 });
  const bang = f >= 603 ? ([603, 640, 680, 730, 780].some(a => f >= a && f < a + 7) ? 14 : 2) : 2;
  door(ctx, 700, RY, bang);
  const recoil = f >= 603 ? E.outE(prog(t, 603, 625)) : 0;
  stick(ctx, lerp(600, 470, recoil), RY, 1.1, { hood: 1, scared: 1, arms: [lerp(1.3, .8, recoil), lerp(1.0, -.9, recoil)], legs: [lerp(.2, .35, recoil), -.1], lean: lerp(.1, -.2, recoil), tilt: .1 });
  ctx.restore(); vignette(ctx, .65);
  if (f >= 603) { const sh = prog(t, 603, 612); if (sh < 1) { ctx.fillStyle = `rgba(255,255,255,${(1 - sh) * .5})`; ctx.fillRect(0, 0, W, H); } }
  counter(ctx, 13, f, f >= 603 ? 6 : 0);
}, 5);

// ------------------------------------------------------------ BEAT 4 (840–1320): bedsheets, plan A, plan B
clip(840, 1320, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  ctx.save(); cam(ctx, 520, RY - 90, 2.2);
  tower(ctx, f, 13, 13, { noChain: 1 });
  door(ctx, 700, RY, [880, 960, 1060, 1150, 1240].some(a => f >= a && f < a + 7) ? 12 : 1.5);
  const n = Math.min(6, Math.max(0, Math.floor((f - 860) / 70)));
  const kx = 330, sag = 20;
  for (let i = 0; i < n; i++) { const x0 = 180 + i * 30, y0 = RY - 14 - i * 3; line(ctx, x0, y0, x0 + 190, y0 - 6, 13, i % 2 ? P.sheet : '#d9d3be'); dot(ctx, x0 + 190, y0 - 6, 9, '#bdb69b'); }
  const tying = n < 6 ? Math.sin(t * .4) : 0;
  stick(ctx, 320, RY, 1.1, { hood: 1, arms: [0.9 + tying * .5, 0.7 - tying * .5], legs: [.12, -.12], lean: .25, tilt: .25, scared: f > 1200 });
  ctx.restore(); vignette(ctx, .55);
  const pa = prog(t, 880, 905), pb = prog(t, 990, 1015);
  if (pa > 0) label(ctx, 'PLAN A: BEDSHEETS', W / 2, 1010 + (1 - E.outE(pa)) * 40, 62, P.chalk, pa);
  if (pb > 0) label(ctx, 'PLAN B: MORE BEDSHEETS', W / 2, 1100 + (1 - E.outE(pb)) * 40, 62, P.red, pb);
  counter(ctx, 13, f);
}, 5);

// ------------------------------------------------------------ BEAT 5 (1320–1920): out the window, down the tower
const WX = TX0, WY = fy(13) - 100;                                 // window (left wall)
const ROPE_X = 62;
const devPath = f => {                                            // world position of Dev's hands along the descent
  if (f < 1380) return [WX + 120 - (f - 1320) * 1.2, fy(13)];
  if (f < 1450) return [lerp(WX + 48, ROPE_X, prog(f, 1380, 1450)), lerp(fy(13), fy(13) + 10, prog(f, 1380, 1450))];
  return [ROPE_X, kf(f, [[1450, fy(13) + 10], [1700, fy(12) + 14, E.ioQ], [1930, fy(11) + 14, E.ioQ]])];
};
clip(1320, 1920, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const [dx, dy] = devPath(t);
  const cy = Math.max(RY - 80, dy + 120), z = f < 1450 ? lerp(2.1, 1.5, prog(t, 1320, 1450)) : 1.35;
  ctx.save(); cam(ctx, 330, cy, z);
  tower(ctx, f, 13, 8);
  ZPOS.forEach(([n, x0, sd], i) => zombie(ctx, x0 + Math.sin(t * .02 + sd * 9) * 60, fy(n) - 6, 1, f + i * 7, sd, Math.sin(t * .02 + sd * 9) > 0 ? 1 : -1));
  // rope hangs from the window sill to floor 10 (three floors long)
  const ropeEnd = fy(10) + 20;
  if (f >= 1380) { line(ctx, ROPE_X, WY, ROPE_X, ropeEnd, 14, P.sheet); for (let y = WY; y < ropeEnd; y += 90) dot(ctx, ROPE_X, y, 9, '#bdb69b'); }
  if (f < 1450) {
    const k = prog(t, 1320, 1450); stick(ctx, dx, dy, 1.0, { hood: 1, arms: [1.6, 1.9], legs: [lerp(.1, 1.2, k), -.2], lean: .1, scared: k > .5 });
  } else {
    const k = Math.sin(t * .09) * .25; stick(ctx, dx, dy + 90, 1.0, { hood: 1, arms: [3.0 + k, 3.4 - k], bend: -.15, legs: [.15 + k * .4, -.15 - k * .4], tilt: .1, scared: 1, dir: 1 });
  }
  ctx.restore(); vignette(ctx, .5);
  const n = f < 1700 ? 13 : f < 1930 ? 12 : 11; counter(ctx, n, f, (f > 1700 && f < 1712) ? 10 : 0);
}, 5);

// ------------------------------------------------------------ BEAT 6 (1920–2400): the rope ends at ten, a hand from 11
clip(1920, 2400, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const dy = fy(11) + 14, grab = prog(t, 2150, 2200), cy = dy + lerp(60, 140, prog(t, 1920, 2100));
  ctx.save(); cam(ctx, 330, cy, lerp(1.35, 1.7, prog(t, 1950, 2100)));
  tower(ctx, f, 12, 8);
  ZPOS.filter(z => z[0] <= 12).forEach(([n, x0, sd], i) => zombie(ctx, x0 + Math.sin(t * .02 + sd * 9) * 60, fy(n) - 6, 1, f + i * 7, sd, 1));
  const frayEnd = fy(10) + 20, shake = f >= 2200 ? Math.sin(t * 1.3) * 3 * Math.min(1, (f - 2200) / 60) : 0;
  line(ctx, ROPE_X + shake, fy(13) - 100, ROPE_X + shake, frayEnd, 14, P.sheet);
  for (let i = 0; i < 6; i++) line(ctx, ROPE_X + shake + (i - 2.5) * 3, frayEnd, ROPE_X + shake + (i - 2.5) * 5, frayEnd + 18 + i * 3, 3, '#bdb69b');   // frayed end
  const k = Math.sin(t * .11) * .22;
  const hang = { hood: 1, arms: [3.0 + k, 3.4 - k], bend: -.15, legs: [.1 + k, -.1 - k], tilt: .1, scared: 1 };
  stick(ctx, ROPE_X + shake, dy + 90, 1.0, hang);
  // zombie hand reaches out of window 11 and grabs the ankle
  if (grab > 0) { const hx = lerp(STAIR - 200, ROPE_X + 70, E.outE(grab)); ctx.save(); line(ctx, TX0 + 330, dy + 60, hx, dy + 150, 10, P.grey); dot(ctx, hx, dy + 150, 15, P.grey); ctx.restore(); }
  ctx.restore(); vignette(ctx, .55);
  if (f > 2150 && f < 2400) { const sh = (hash(f) - .5) * 4; ctx.save(); ctx.translate(sh, 0); ctx.restore(); }
  counter(ctx, 11, f, f >= 2200 ? 4 : 0);
}, 5);

// ------------------------------------------------------------ BEAT 7 (2400–2700): snap, fall, freeze, episode two
clip(2400, 2700, (ctx, t, f) => {
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
  const fall = prog(t, 2412, 2480), yy = fy(11) + 104 + (fall * fall) * 260, hold = f >= 2480;
  ctx.save(); cam(ctx, 330, fy(11) + 40 + (hold ? 200 : 0), 1.7);
  tower(ctx, f, 12, 8);
  const snapY = fy(11) - 90; line(ctx, ROPE_X, fy(13) - 100, ROPE_X, snapY, 14, P.sheet);
  if (f < 2412) { line(ctx, ROPE_X, snapY, ROPE_X, snapY + 150, 14, P.sheet); }
  else { const r = prog(t, 2412, 2440); line(ctx, ROPE_X, snapY + r * 80, ROPE_X - r * 30, snapY + 150 + r * 200, 14, P.sheet); }
  stick(ctx, ROPE_X + 20, f < 2412 ? fy(11) + 104 : yy, 1.0, { hood: 1, arms: [2.6, 3.7], legs: [.8, -.6], scared: 1, tilt: .3 });
  if (hold) for (let i = 0; i < 14; i++) { const a = hash(i) * TAU, r = 30 + hash(i * 3) * 160; line(ctx, 200 + Math.cos(a) * r, yy + Math.sin(a) * r, 200 + Math.cos(a) * (r + 40), yy + Math.sin(a) * (r + 40), 4, P.chalk, .8); }  // glass
  ctx.restore();
  if (f >= 2412 && f < 2418) { ctx.fillStyle = `rgba(255,255,255,${(2418 - f) / 6 * .85})`; ctx.fillRect(0, 0, W, H); }
  if (hold) { ctx.fillStyle = 'rgba(255,40,30,.18)'; ctx.fillRect(0, 0, W, H); vignette(ctx, .85); }
  const red = f >= 2480 ? P.red : '#fff';
  counter(ctx, 11, f, f >= 2480 && f < 2500 ? 16 : 0, red);
  if (f >= 2560) {
    const a = E.outE(prog(t, 2560, 2600)); ctx.fillStyle = `rgba(14,15,18,${a * .92})`; ctx.fillRect(0, 0, W, H);
    label(ctx, 'EPISODE 2', W / 2, 760, 120, P.chalk, a); label(ctx, 'FLOOR 11', W / 2, 920, 190, P.red, a);
    label(ctx, 'FOLLOW TO SEE IF HE MAKES IT DOWN', W / 2, 1090, 46, P.chalk, a);
  }
  if (f >= 2650) { ctx.fillStyle = `rgba(0,0,0,${prog(t, 2650, 2690)})`; ctx.fillRect(0, 0, W, H); }
}, 5);

// ------------------------------------------------------------ captions on top (not during peephole / end card)
clip(0, 2560, (ctx, t, f) => { if (!(f >= 520 && f < 603)) captions(ctx, f); }, 20);
