// fx.js - camera, noise, hand-drawn line helpers, comic effects. All pure functions of the frame number.
'use strict';
const PAL = {
  ink: '#0B0C10', night: '#0F1424', night2: '#1A2036', wall: '#232B45', wall2: '#2B3556', floor: '#161B2E', floorLine: '#0E1220',
  chalk: '#F4F1E6', skin: '#F4F1E6', hood: '#2FC4B2', hoodD: '#1E8F82', red: '#FF3B30', amber: '#FFC247', zskin: '#9DB89A', zdark: '#5E7A5C',
  glow: '#FFB45C', sheet: '#EDE8D6', sheetB: '#C9C2A6', blue: '#5AA9FF',
};
const sn = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i * 1.7 + seed * 31.1) - .5, hash((i + 1) * 1.7 + seed * 31.1) - .5, u) * 2; };
const jit = (seed, b, amp) => (hash(seed * 13.37 + b * 7.1) - .5) * 2 * amp;     // boil jitter
const hold = (f, k) => Math.floor(f / k) * k;                                       // pose-on-Ns frame hold
const sstep = (t, a, b) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const outB = (u, s = 1.3) => { u = clamp(u); return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };

// --------------------------------------------------------------------------- camera
// c: {x,y,z,rot,hand,shake,sx,sy}. world point (x,y) lands at screen (W/2+sx, H*0.46+sy). `imp`: impact list [[frame, amp]...]
function shakeAt(t, imp) { let a = 0; if (imp) for (const [f0, amp] of imp) { const d = t - f0; if (d >= 0 && d < 45) a += amp * Math.exp(-d / 9); } return a; }
function applyCam(ctx, c, t, imp) {
  const sh = shakeAt(t, imp), hand = c.hand == null ? 1.2 : c.hand;
  const ox = sn(t * .035, 1) * hand + sn(t * .9, 2) * sh, oy = sn(t * .031, 3) * hand + sn(t * .83, 4) * sh, ro = (sn(t * .02, 5) * hand * .0012) + sn(t * .7, 6) * sh * .0009;
  ctx.translate(W / 2 + (c.sx || 0) + ox, H * 0.46 + (c.sy || 0) + oy); ctx.rotate((c.rot || 0) + ro); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
}

// --------------------------------------------------------------------------- hand-drawn line helpers
function inkPath(ctx, pts, w, col, f, seed = 0, amp = 1.6, k = 5) {
  const b = Math.floor(f / k); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
  const P = pts.map((p, i) => [p[0] + jit(seed + i, b, amp), p[1] + jit(seed + i + 50, b, amp)]);
  ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
  const L = P[P.length - 1]; ctx.lineTo(L[0], L[1]); ctx.stroke(); ctx.restore();
}
function blob(ctx, x, y, rx, ry, col, rot = 0, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, TAU); ctx.fill(); ctx.restore(); }
function rr(ctx, x, y, w, h, r, fill, stroke, lw = 0) { ctx.beginPath(); rrect(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
function softShadow(ctx, x, y, rx, a = .35) { const g = ctx.createRadialGradient(x, y, 1, x, y, rx); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.translate(0, 0); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * .28, 0, 0, TAU); ctx.fill(); ctx.restore(); }
function glow(ctx, x, y, r, col, a = .5) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }

// --------------------------------------------------------------------------- text
function marker(ctx, txt, x, y, size, col, o = {}) {              // chunky outlined caption/label
  ctx.save(); ctx.font = `800 ${size}px ${FONTS.sansX}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.s && o.s !== 1) ctx.scale(o.s, o.s);
  ctx.globalAlpha *= o.a == null ? 1 : o.a;
  ctx.lineWidth = o.stroke || size * .2; ctx.strokeStyle = o.sc || PAL.ink; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
}

// --------------------------------------------------------------------------- comic effects
function sweat(ctx, x, y, f, s = 1) { const u = (f % 40) / 40; ctx.save(); ctx.fillStyle = '#9FD8FF'; ctx.translate(x, y + u * 36 * s); ctx.scale(s, s); ctx.globalAlpha = 1 - u * .8;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(10, 4, 0, 10); ctx.quadraticCurveTo(-10, 4, 0, -12); ctx.fill(); ctx.restore(); }
function burst(ctx, x, y, r, f, f0, col = PAL.chalk, n = 10) {      // impact starburst, lives ~14 frames
  const d = f - f0; if (d < 0 || d > 14) return; const u = d / 14; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 1 - u;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(i) * .3, r0 = r * (.4 + u * .9), r1 = r * (.9 + u * 1.3); line(ctx, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1, 7 * (1 - u) + 2, col); }
  ctx.restore();
}
function speedLines(ctx, cx, cy, f, a = .5, col = '#fff', n = 26, vertical = false) {
  const b = Math.floor(f / 2); ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const ang = hash(i * 3.3 + b * .7) * TAU, r0 = 420 + hash(i + b) * 420, r1 = r0 + 260 + hash(i * 9 + b) * 480;
    if (vertical) { const x = hash(i * 5.1 + b) * W; line(ctx, x, 0, x, H, 3, col, a * .5); } else line(ctx, cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, 4 + hash(i) * 4, col); }
  ctx.restore();
}
function dust(ctx, x, y, f, f0, n = 6, sp = 1) { const d = f - f0; if (d < 0 || d > 26) return; const u = d / 26; for (let i = 0; i < n; i++) { const dir = (i % 2 ? 1 : -1) * (.4 + hash(i) * .9); blob(ctx, x + dir * u * 60 * sp, y - u * 18 * (1 + hash(i + 4)), 8 + u * 16, 6 + u * 10, '#c8c5b8', 0, (1 - u) * .45); } }
function stamp(ctx, f, f0, x, y, col = PAL.red, txt = '✕', size = 190) {          // slam-in stamp with squash settle
  const d = f - f0; if (d < 0) return; const u = clamp(d / 9), s = d < 9 ? lerp(2.4, 1, E.outQ(u)) : 1 + .05 * Math.exp(-(d - 9) / 6) * Math.sin((d - 9) * .9);
  marker(ctx, txt, x, y, size, col, { s, rot: -.12, a: clamp(d / 3), stroke: size * .12 });
}

// --------------------------------------------------------------------------- film overlay (grain + vignette + flicker)
let _grain = null;
function grain(ctx, f, a = .09) {
  if (!_grain) { _grain = document.createElement('canvas'); _grain.width = _grain.height = 256; const g = _grain.getContext('2d'), id = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = hash(i * .37) * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }
  const b = Math.floor(f / 2), ox = Math.floor(hash(b * 1.3) * 256), oy = Math.floor(hash(b * 2.9) * 256);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a; ctx.translate(-ox, -oy);
  for (let x = 0; x < W + 256; x += 256) for (let y = 0; y < H + 256; y += 256) ctx.drawImage(_grain, x, y);
  ctx.restore();
}
function vig(ctx, a = .55, cy = H * .46) { const g = ctx.createRadialGradient(W / 2, cy, 380, W / 2, cy, 1280); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function tint(ctx, col, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }

function fadeBottom(ctx, y0 = 1130, y1 = 1470, a = .96) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(8,10,18,0)'); g.addColorStop(1, `rgba(8,10,18,${a})`); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
