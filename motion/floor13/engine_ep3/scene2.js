// scene.js - FLOOR 13 ep.1 v2: timeline dispatch, floor counter, captions, film overlay. Shots live in shots1.js / shots2.js.
'use strict';
const SHUTTER = 0.5;
const Q = new URLSearchParams(location.search);
const SUB_DEFAULT = +(Q.get('sub') || 1);
function subsamples(f) { return SUB_DEFAULT; }
const has = n => !!IMG[n];
const CLIPS = [];
function clip(a, b, draw, z = 0) { CLIPS.push({ a, b, draw, z }); CLIPS.sort((p, q) => p.z - q.z); }
let FR = 0, TL = null, ENV = null;
window.initScene = async () => { TL = await (await fetch('timeline.json')).json(); ENV = await (await fetch('env.json')).json(); };
function drawScene(ctx, t, f) { FR = f; for (const c of CLIPS) if (f >= c.a && f < c.b) { ctx.save(); c.draw(ctx, t, f); ctx.restore(); } }
function shotOf(f) { for (const k in TL.shots) { const [a, b] = TL.shots[k]; if (f >= a && f < b) return [k, a, b]; } return [null, 0, 0]; }

// ============================================================ UI: floor chip + EP2 tag
function counterUI(ctx, f) {
  if (f >= (TL.shots.end2 || TL.shots.end3)[0]) return;
  const d = f, u = clamp(d / 10);
  ctx.save(); ctx.translate(64, 188); ctx.globalAlpha = clamp(d / 6);
  rr(ctx, 0, -92, 232, 130, 26, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3);
  ctx.font = `800 28px ${FONTS.sansX}`; ctx.textAlign = 'left'; ctx.fillStyle = PAL.chalk; ctx.fillText('FLOOR', 26, -52);
  ctx.font = `800 92px ${FONTS.sansX}`; ctx.fillStyle = PAL.red; ctx.fillText(String(typeof curFloor === 'function' ? curFloor(f) : 10), 26, 26);
  ctx.restore();
  ctx.save(); ctx.translate(318, 120); ctx.globalAlpha = clamp(d / 6); rr(ctx, 0, 0, 120, 60, 16, 'rgba(8,10,18,.82)', 'rgba(255,255,255,.14)', 3); ctx.font = `800 34px ${FONTS.sansX}`; ctx.fillStyle = PAL.amber; ctx.textAlign = 'center'; ctx.fillText('EP 3', 60, 43); ctx.restore();
}
function captionChunks() {
  if (TL._chunks) return TL._chunks;
  const ch = [];
  for (const l of TL.lines) { let cur = []; l.words.forEach((w, i) => { cur.push(w); const end = /[.?!]$|\.\.\.$/.test(w.w), len = cur.reduce((s, x) => s + x.w.length, 0);
      if (end || cur.length >= 3 || (len > 17 && cur.length >= 2) || i === l.words.length - 1) { ch.push({ words: cur, a: cur[0].a, b: cur[cur.length - 1].b, id: l.id, speaker: l.speaker }); cur = []; } }); }
  ch.forEach((c, i) => { c.hold = i + 1 < ch.length ? Math.min(ch[i + 1].a - 1, c.b + 8) : c.b + 10; });
  return TL._chunks = ch;
}
function captions(ctx, f) {
  const ch = captionChunks().find(c => f >= c.a - 1 && f <= c.hold); if (!ch || ch.id === 'end') return;
  const TAGS = { mom: ['MOM (ON THE PHONE)', '#FF9FC4'], tv: ['NEWS ANCHOR (TV)', '#9FD8FF'], radio: ['MIRA (WALKIE-TALKIE)', '#FFD27A'], z: ['THE LANDLORD', '#B8E986'] };
  if (TAGS[ch.speaker]) { const [tg, tc] = TAGS[ch.speaker]; ctx.save(); ctx.font = `800 40px ${FONTS.sansX}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = PAL.ink; ctx.strokeText(tg, W / 2, 1290); ctx.fillStyle = tc; ctx.fillText(tg, W / 2, 1290); ctx.restore(); }
  const text = ch.words.map(w => w.w.replace(/\.\.\.$/, '…').replace(/[.,]$/, ''));
  const size = 100, d = f - ch.a, pop = d < 7 ? 1 + .2 * Math.sin(clamp((d + 1) / 8) * Math.PI) : 1;
  ctx.save(); ctx.font = `800 ${size}px ${FONTS.sansX}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  const sp = ctx.measureText(' ').width, ws = text.map(t => ctx.measureText(t.toUpperCase()).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const fit = Math.min(1, 930 / tot); let x = -tot / 2; ctx.translate(W / 2, 1400); ctx.scale(pop * fit, pop * fit);
  text.forEach((t, i) => { const w = ch.words[i], on = f >= w.a && f < w.b, up = t.toUpperCase();
    ctx.lineWidth = 26; ctx.strokeStyle = PAL.ink; ctx.strokeText(up, x, 0);
    ctx.fillStyle = on ? PAL.amber : ({ mom: '#FF9FC4', tv: '#9FD8FF', radio: '#FFD27A', z: '#B8E986' }[ch.speaker] || '#FFFFFF'); ctx.fillText(up, x, on ? -4 : 0); x += ws[i] + sp; });
  ctx.restore();
}

// ============================================================ the film
function drawFilm(ctx, t, f) {
  ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H);
  const [k, a, b] = shotOf(f);
  if (k && SHOT[k]) { ctx.save(); SHOT[k](ctx, t - a, f - a, b - a, t, f); ctx.restore(); }
  counterUI(ctx, f); if (typeof extraUI === 'function') extraUI(ctx, f); captions(ctx, f);
  grain(ctx, f, .10);
}
clip(0, 100000, (ctx, t, f) => drawFilm(ctx, t, f), 1);
