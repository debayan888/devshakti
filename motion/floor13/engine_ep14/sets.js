// sets.js - backgrounds and props. World: floor n has its floor line at y = (13-n)*FH, rooms span x in [-540, 540].
'use strict';
const SHOT = {};
const FH = 560, SLAB = 34, RW = 540;
const FLOORY = n => (13 - n) * FH;
const WALLS = ['#232B45', '#2A2440', '#1F3040', '#2D2A3E'];

function skyGrad(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0A0F1E'); g.addColorStop(.55, '#2A1730'); g.addColorStop(1, '#7A2E2A');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}
function roomShell(ctx, n, f, o = {}) {
  const fy = FLOORY(n), top = fy - FH + SLAB;
  const g = ctx.createLinearGradient(0, top, 0, fy); const c = o.wall || WALLS[((n % 4) + 4) % 4];
  g.addColorStop(0, shade(c, -.25)); g.addColorStop(1, c); ctx.fillStyle = g; ctx.fillRect(-RW, top, 2 * RW, fy - top);
  ctx.fillStyle = 'rgba(255,255,255,.035)'; for (let x = -RW; x < RW; x += 72) ctx.fillRect(x, top, 30, fy - top);
  ctx.fillStyle = '#0E1220'; ctx.fillRect(-RW, fy - 20, 2 * RW, 20);                       // baseboard
  ctx.fillStyle = '#0B0E1A'; ctx.fillRect(-RW, fy, 2 * RW, SLAB); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(-RW, fy, 2 * RW, 3);
  ctx.fillStyle = '#0B0E1A'; ctx.fillRect(-RW, top - SLAB, 2 * RW, SLAB);                  // ceiling slab
  if (o.light !== false) { const lg = ctx.createRadialGradient(o.lx || 0, top + 30, 10, o.lx || 0, top + 30, 520); lg.addColorStop(0, `rgba(255,214,150,${o.la == null ? .10 : o.la})`); lg.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = lg; ctx.fillRect(-RW, top, 2 * RW, fy - top); }
}
function shade(hex, a) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = a < 0 ? 0 : 255, p = Math.abs(a); r = Math.round(lerp(r, f, p)); g = Math.round(lerp(g, f, p)); b = Math.round(lerp(b, f, p)); return `rgb(${r},${g},${b})`; }

// facade of the whole tower (exterior cutaway): side walls + ground glow; rooms are drawn between
function towerFrame(ctx, top, bot, f) {
  const y0 = FLOORY(top) - FH - SLAB, y1 = FLOORY(bot) + SLAB;
  ctx.fillStyle = '#0A0C14'; ctx.fillRect(-RW - 46, y0, 46, y1 - y0); ctx.fillRect(RW, y0, 46, y1 - y0);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(-RW - 46, y0, 5, y1 - y0);
}

// ---- props -----------------------------------------------------------------------------------------
function windowBack(ctx, x, fy, f, o = {}) {                    // back-wall window w/ night city + curtains
  const w = o.w || 270, h = o.h || 270, y = fy - 120 - h;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  skyGrad(ctx, x, y, w, h);
  ctx.fillStyle = '#10121C'; for (let i = 0; i < 7; i++) { const bx = x + i * 44 - 10, bh = 60 + hash(i * 3.1) * 90; ctx.fillRect(bx, y + h - bh, 40, bh); }
  const fl = .55 + .25 * Math.sin(f * .21) + .15 * hash(Math.floor(f / 3)); glow(ctx, x + w * .7, y + h - 20, 120, 'rgba(255,120,40,A)', fl);
  ctx.fillStyle = '#FFE9B0'; ctx.beginPath(); ctx.arc(x + w * .2, y + 56, 18, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#0B0E1A'; ctx.lineWidth = 14; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h * .5); ctx.lineTo(x + w, y + h * .5); ctx.stroke();
  ctx.fillStyle = '#10142A'; ctx.fillRect(x - 10, y + h, w + 20, 14);
  if (o.crack) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; for (let i = 0; i < o.crack; i++) { const a = hash(i) * TAU; ctx.beginPath(); ctx.moveTo(x + w * .5, y + h * .4); ctx.lineTo(x + w * .5 + Math.cos(a) * 160, y + h * .4 + Math.sin(a) * 160); ctx.stroke(); } }
  if (o.curtains !== false) {
    const sway = Math.sin(f * .04) * 5 + (o.wind || 0) * Math.sin(f * .17) * 10, drop = o.curtainDrop || 0;
    for (const side of [-1, 1]) {
      const cx0 = side < 0 ? x - 26 : x + w - 6, cw = 62, top = y - 34 + drop * (h + 90);
      ctx.fillStyle = '#7A2D4A'; ctx.beginPath(); ctx.moveTo(cx0, top); ctx.lineTo(cx0 + cw, top); ctx.quadraticCurveTo(cx0 + cw + sway * side, top + h * .5, cx0 + cw + sway * 1.6 * side, top + h + 70); ctx.lineTo(cx0 + sway * 1.6 * side, top + h + 70); ctx.quadraticCurveTo(cx0 + sway * side, top + h * .5, cx0, top); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 4; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(cx0 + i * 15, top); ctx.quadraticCurveTo(cx0 + i * 15 + sway * side * .6, top + h * .5, cx0 + i * 15 + sway * side, top + h + 70); ctx.stroke(); }
    }
    if (!drop) { ctx.fillStyle = '#3B2A1E'; ctx.fillRect(x - 50, y - 40, w + 100, 10); }
  }
}
function bed(ctx, x, fy, f, o = {}) {                            // x = left edge, bed spans ~360px
  ctx.fillStyle = '#2A1C14'; ctx.fillRect(x, fy - 190, 22, 190); ctx.fillRect(x + 340, fy - 70, 20, 70);   // headboard, foot
  ctx.fillStyle = '#3A281C'; ctx.fillRect(x + 22, fy - 62, 318, 22);                                           // frame
  ctx.fillStyle = '#E9E5D6'; rr(ctx, x + 22, fy - 108, 318, 50, 14, '#E9E5D6');                                // mattress
  if (!o.stripped) { rr(ctx, x + 70, fy - 128, 270, 44, 20, '#5A78B0'); ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 100 + i * 52, fy - 126, 16, 40); }
  rr(ctx, x + 30, fy - 134, 96, 36, 16, '#F6F3E8', PAL.ink, 3);                                                // pillow
}
function door(ctx, x, fy, f, o = {}) {
  const w = 130, h = 280, sh = o.shake ? (hash(f * 3.3) - .5) * o.shake : 0;
  ctx.save(); ctx.translate(sh, 0); ctx.fillStyle = '#1B1410'; ctx.fillRect(x - 12, fy - h - 12, w + 24, h + 12); ctx.fillStyle = o.col || '#4A3326'; ctx.fillRect(x, fy - h, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 4; ctx.strokeRect(x + 16, fy - h + 18, w - 32, 100); ctx.strokeRect(x + 16, fy - h + 140, w - 32, 120);
  ctx.fillStyle = '#E0B867'; ctx.beginPath(); ctx.arc(x + 20, fy - 130, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#C9CCD6'; ctx.beginPath(); ctx.arc(x + w / 2, fy - h + 56, 7, 0, TAU); ctx.fill();    // peephole
  ctx.restore();
}
function lamp(ctx, x, fy, f) {
  ctx.fillStyle = '#2B1F18'; ctx.fillRect(x - 40, fy - 100, 80, 100); ctx.fillStyle = '#3B2B20'; ctx.fillRect(x - 44, fy - 106, 88, 10);
  ctx.fillStyle = '#E8D9A8'; ctx.beginPath(); ctx.moveTo(x - 26, fy - 160); ctx.lineTo(x + 26, fy - 160); ctx.lineTo(x + 36, fy - 106); ctx.lineTo(x - 36, fy - 106); ctx.fill();
  glow(ctx, x, fy - 140, 260, 'rgba(255,200,120,A)', .28 + .03 * Math.sin(f * .3));
}
function sofaTV(ctx, x, fy, f) {
  const fl = .5 + .5 * hash(Math.floor(f / 4));
  ctx.fillStyle = '#10121C'; ctx.fillRect(x + 150, fy - 170, 170, 110); ctx.fillStyle = `rgba(110,170,255,${.5 + fl * .35})`; ctx.fillRect(x + 158, fy - 162, 154, 94);
  glow(ctx, x + 235, fy - 120, 340, 'rgba(110,170,255,A)', .22 + fl * .08);
  ctx.fillStyle = '#3A2B3F'; rr(ctx, x - 110, fy - 110, 230, 80, 16, '#3A2B3F'); rr(ctx, x - 120, fy - 190, 70, 150, 16, '#46334C'); rr(ctx, x - 90, fy - 70, 40, 40, 8, '#2A1E2E');
}
function elevator(ctx, x, fy, f, open, o = {}) {                   // open 0..1 ; zombies packed inside when open
  const w = 300, h = 340, y = fy - h;
  ctx.fillStyle = '#10131F'; ctx.fillRect(x - 24, y - 54, w + 48, h + 54);
  ctx.fillStyle = '#1C2030'; ctx.fillRect(x, y, w, h);
  if (open > 0) { const lg = ctx.createLinearGradient(0, y, 0, fy); lg.addColorStop(0, '#FFE9B0'); lg.addColorStop(1, '#C69A55'); ctx.fillStyle = lg; ctx.fillRect(x, y, w, h); if (o.inside) o.inside(ctx, x, y, w, h, open); }
  const dw = w / 2 * (1 - open);
  ctx.fillStyle = '#8A93A8'; ctx.fillRect(x, y, dw, h); ctx.fillRect(x + w - dw, y, dw, h); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + dw - 4, y, 4, h); ctx.fillRect(x + w - dw, y, 4, h);
  ctx.fillStyle = '#050608'; ctx.fillRect(x + 40, y - 40, w - 80, 30); ctx.font = `800 24px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.fillStyle = open > .1 ? PAL.red : PAL.amber; ctx.fillText(o.lbl || '13', x + w / 2, y - 16);
  ctx.fillStyle = '#10131F'; ctx.fillRect(x + w + 40, fy - 210, 36, 80); dot(ctx, x + w + 58, fy - 190, 8, o.btn ? PAL.amber : '#555'); dot(ctx, x + w + 58, fy - 160, 8, '#555');
}
