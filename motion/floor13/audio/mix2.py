# mix2.py - FLOOR 13 ep.1 v2 sound design: processed Kokoro voice + code-made foley/SFX/music, locked to ../engine/timeline.json.
# Run from audio/:  python3 -I mix2.py   -> mix2.wav (then loudness-normalised with ffmpeg in build.sh)
import json, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; FPS = 60; TOT = 47.0; N = int(TOT * SR)
rng = np.random.default_rng(13)
TL = json.load(open('../engine/timeline.json')); SH = TL['shots']; LINES = {l['id']: l for l in TL['lines']}
T = lambda f: f / FPS
BUS = {k: np.zeros((2, N)) for k in ('vo', 'sfx', 'amb', 'mus', 'rev')}

# ------------------------------------------------------------------ dsp helpers
def sos(kind, fc, order=2): return signal.butter(order, fc, kind, fs=SR, output='sos')
def lp(x, fc, o=2): return signal.sosfilt(sos('lowpass', min(fc, SR / 2 - 100), o), x)
def hp(x, fc, o=2): return signal.sosfilt(sos('highpass', fc, o), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(sos('bandpass', [lo, min(hi, SR / 2 - 100)], o), x)
def peak(x, f0, q, gdb):                                                    # RBJ peaking EQ
    A = 10 ** (gdb / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]; return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x)
def S(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def noise(d): return rng.standard_normal(int(d * SR))
def tt(d): return np.arange(int(d * SR)) / SR
def env_ad(n, a=.005, d=.2): t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def sweep_lp(x, f0, f1, seg=24):                                            # low-pass with moving cutoff
    out = np.zeros_like(x); n = len(x); L = n // seg + 1
    for i in range(seg):
        a, b = i * L, min(n, (i + 1) * L)
        if a >= b: break
        out[a:b] = lp(x[a:b], f0 * (f1 / f0) ** (i / max(1, seg - 1)))
    return out
def revIR(rt, damp=4000, pre=.012):
    n = int(rt * 1.15 * SR); t = np.arange(n) / SR; ir = rng.standard_normal(n) * np.exp(-6.9 * t / rt); ir = lp(ir, damp); ir[:int(pre * SR)] = 0
    for k in range(7): ir[int((pre + .004 + k * .0097 + rng.uniform(0, .004)) * SR)] += rng.uniform(.4, 1) * (1 - k / 8)
    return ir / np.sqrt(np.sum(ir ** 2))
IR = {'room': revIR(.55), 'hall': revIR(1.1, 3500), 'well': revIR(2.0, 3000), 'out': revIR(1.6, 2500)}
def put(bus, sig, t, g=1.0, pan=0.0, rev=None, rg=.25):
    i = int(t * SR);
    if i >= N or len(sig) == 0: return
    sig = sig[:N - i] if i >= 0 else sig[-i:]; i = max(i, 0)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    BUS[bus][0, i:i + len(sig)] += sig * g * l * 1.414; BUS[bus][1, i:i + len(sig)] += sig * g * r * 1.414
    if rev:
        w = signal.fftconvolve(sig, IR[rev])[:len(sig) + len(IR[rev])]; w = w[:N - i]
        BUS['rev'][0, i:i + len(w)] += w * g * rg * l * 1.414; BUS['rev'][1, i:i + len(w)] += w * g * rg * r * 1.414

# ------------------------------------------------------------------ synthesis: foley + sfx
def thump(d=.35, f0=95, f1=38, dec=.09, g=1.0): t = tt(d); return np.sin(2 * np.pi * (f1 + (f0 - f1) * np.exp(-t / .03)) * t) * env_ad(len(t), .002, dec) * g
def impact(d=1.2, g=1.0):
    n = int(d * SR); s = thump(d, 120, 32, .35) * 1.0 + lp(noise(d), 1500) * env_ad(n, .001, .08) * .5 + hp(noise(d), 4000) * env_ad(n, .0005, .02) * .25
    return s * g
def wood_hit(g=1.0): n = int(.5 * SR); return (bp(noise(.5), 140, 900) * env_ad(n, .001, .05) * 1.4 + thump(.5, 150, 55, .12) * .9) * g
def door_slam(): return S(wood_hit(1.0) * 1.2, lp(noise(.6), 600) * env_ad(int(.6 * SR), .002, .22) * .5, impact(.9) * .35)
def whoosh(d=.6, f0=600, f1=5000, g=1.0, rise=True):
    n = int(d * SR); t = np.arange(n) / SR; sh = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    x = noise(d) * sh; x = sweep_lp(x, f0, f1) if rise else sweep_lp(x, f1, f0); return hp(x, 150) * g
def creak(d=.7, f=700, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; p = np.zeros(n); k = 0
    while k < n: p[k] = rng.uniform(.4, 1); k += int(SR / (rng.uniform(.6, 1.4) * (f / 6)))
    x = signal.lfilter([1], [1, -.995], p) ; x = bp(x + noise(d) * .03, f * .6, f * 1.8, 2) * (1 + 2.5 * np.sin(2 * np.pi * rng.uniform(5, 9) * t) ** 2)
    return x / (np.max(np.abs(x)) + 1e-9) * np.sin(np.pi * t / d) ** .8 * .5 * g
def cloth(d=.4, g=1.0):
    n = int(d * SR); a = lp(rng.standard_normal(n // 400 + 3), 40 * 1.0) if False else np.abs(np.interp(np.linspace(0, 1, n), np.linspace(0, 1, n // 800 + 3), rng.uniform(.1, 1, n // 800 + 3)))
    return bp(noise(d), 900, 7000) * a * np.sin(np.pi * np.arange(n) / n) ** .6 * .5 * g
def click(g=1.0): n = int(.06 * SR); return hp(noise(.06), 1500) * env_ad(n, .0003, .008) * g
def ding(f=1318, d=1.6, g=1.0): t = tt(d); return sum(np.sin(2 * np.pi * f * r * t) * a * np.exp(-t / (d * dd)) for r, a, dd in ((1, 1, .5), (2.76, .35, .3), (5.4, .18, .2), (8.9, .08, .12))) * .35 * g
def pop(g=1.0): t = tt(.12); return np.sin(2 * np.pi * (180 + 900 * np.exp(-t / .02)) * t) * env_ad(len(t), .001, .04) * g
def chime(g=1.0): t = tt(1.2); return (np.sin(2 * np.pi * 1046 * t) + np.sin(2 * np.pi * 1568 * np.maximum(t - .12, 0)) * (t > .12)) * np.exp(-t / .4) * .3 * g
def chalk(d=.3, g=1.0): n = int(d * SR); t = np.arange(n) / SR; return hp(noise(d), 2500) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 70 * t))) * np.sin(np.pi * t / d) * .25 * g
def crunch(d=.5, g=1.0):
    n = int(d * SR); x = np.zeros(n)
    for _ in range(int(d * 9)): i = rng.integers(0, n - 2400); x[i:i + 2400] += bp(noise(.05), 1500, 6000) * env_ad(2400, .0005, .012) * rng.uniform(.4, 1)
    return x * g
def wind(d=3.0, g=1.0, lo=250, hi=1400):
    t = tt(d); x = bp(noise(d), lo, hi) * (.55 + .45 * np.sin(2 * np.pi * .35 * t + rng.uniform(0, 6)) * np.sin(2 * np.pi * .13 * t + 1)); return x * np.minimum(t / .8, 1) * np.minimum((d - t) / .8, 1) * g
def glass(d=1.2, g=1.0):
    n = int(d * SR); s = (noise(d) - lp(noise(d), 2500)) * env_ad(n, .0008, .12)
    for k in range(24):
        j = int(rng.uniform(.02, .9) * SR); m = min(3000, n - j)
        if m > 0: s[j:j + m] += np.sin(2 * np.pi * rng.uniform(2500, 8000) * np.arange(m) / SR) * env_ad(m, .0002, .012) * rng.uniform(.2, .7)
    return s * g
def crack(g=1.0):
    n = int(.35 * SR); x = hp(noise(.35), 1800) * env_ad(n, .0003, .02)
    for _ in range(6):
        i = int(rng.uniform(.01, .3) * SR); m = min(1440, n - i); x[i:i + m] += hp(noise(.03), 3000)[:m] * env_ad(m, .0002, .006)
    return x * g
def heart(g=1.0): a = thump(.22, 70, 40, .07) ; b = np.pad(thump(.2, 62, 38, .06) * .7, (int(.17 * SR), 0))[:int(.4 * SR)]; x = np.zeros(int(.45 * SR)); x[:len(a)] += a; x[:len(b)] += b[:len(x)]; return x * g
def riser(d=2.0, f0=200, f1=4000, g=1.0):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / d)) / SR; x = signal.sawtooth(ph) * .3 + noise(d) * .4; x = sweep_lp(x, f0 * 2, f1 * 1.2); return x * (t / d) ** 2 * g
def gulp(g=1.0): t = tt(.25); return (np.sin(2 * np.pi * (260 - 140 * t / .25) * t) * env_ad(len(t), .01, .06) + np.sin(2 * np.pi * (180 + 40 * np.sin(t * 30)) * t) * np.exp(-t / .05) * .3) * g
def inhale(d=.45, g=1.0): t = tt(d); return bp(noise(d), 700, 3500) * np.sin(np.pi * (t / d) ** .8) * .5 * g
def footstep(kind='carpet', g=1.0):
    d = .14; n = int(d * SR); body = thump(d, 110 + rng.uniform(-15, 15), 60, .035) * .8
    if kind == 'wood': return (body + hp(noise(d), 1200) * env_ad(n, .0004, .01) * .25) * g
    return (body * .7 + lp(noise(d), 900) * env_ad(n, .001, .03) * .4) * g
def carAlarm(d=3.0, g=1.0):
    t = tt(d); f = 750 + 450 * (np.sin(2 * np.pi * 1.5 * t) > 0) * ((t * 1.5 % 2) < 1); ph = 2 * np.pi * np.cumsum(f) / SR; return lp(signal.square(ph) * .25, 2800) * g
def tvMurmur(d=2.0, g=1.0):
    t = tt(d); x = noise(d); x = bp(x, 300, 700) + .7 * bp(x, 900, 1800); return x * (.4 + .6 * np.abs(np.sin(2 * np.pi * 3.7 * t + np.sin(t * 2)))) * .35 * g
def groan(d=1.6, f0=95, seed=0, g=1.0):
    r = np.random.default_rng(seed + 5); t = tt(d); vib = 1 + .06 * np.sin(2 * np.pi * (4.5 + r.uniform(0, 2)) * t) + .12 * np.exp(-t * 2); fm = f0 * vib * (1 - .22 * t / d)
    ph = 2 * np.pi * np.cumsum(fm) / SR; s = sum(np.sin(h * ph + r.uniform(0, 6)) / h ** .8 for h in range(1, 13))
    s = s * (.6 + .4 * np.sin(2 * np.pi * 27 * t) ** 2) + noise(d) * .22 * (.5 + .5 * np.sin(2 * np.pi * 31 * t) ** 2)       # throat rattle
    s = bp(s, 120, 3000) ; s = peak(peak(s, 560, 3, 7), 1250, 3, 5); s = np.tanh(s * .9)
    return s / (np.max(np.abs(s)) + 1e-9) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.4 * .55 * g
ZV = {}
for i in range(6):
    try: d, sr = sf.read(f'vo2/z{i}.wav'); ZV[i] = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d)
    except Exception: pass
def zvoice(i, semis=-5, g=1.0, dist=2.0):
    x = ZV[i % len(ZV)]; x = np.interp(np.arange(0, len(x), 2 ** (semis / 12)), np.arange(len(x)), x); x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * dist); x = lp(x, 2600); x = peak(x, 700, 2, 5)
    return x / (np.max(np.abs(x)) + 1e-9) * .6 * g
def horde(d=2.5, n=5, g=1.0, base=88):
    out = np.zeros(int(d * SR));
    for k in range(n):
        gr = groan(rng.uniform(1.2, 2.2), base * rng.uniform(.8, 1.35), k + int(rng.integers(0, 99))); i = int(rng.uniform(0, max(.01, d - 1.0)) * SR); out[i:i + len(gr)] += gr[:len(out) - i] * rng.uniform(.5, 1)
    return out * g

# ------------------------------------------------------------------ port of the engine's easing / keyframes (to derive foley from the same motion)
ioQ = lambda u: 2 * u * u if u < .5 else 1 - (-2 * u + 2) ** 2 / 2
ioC = lambda u: 4 * u ** 3 if u < .5 else 1 - (-2 * u + 2) ** 3 / 2
lin = lambda u: u
def kf(t, keys):
    if t <= keys[0][0]: return keys[0][1]
    for i in range(1, len(keys)):
        if t <= keys[i][0]:
            f0, v0 = keys[i - 1][:2]; f1, v1 = keys[i][:2]; ez = keys[i][2] if len(keys[i]) > 2 else ioC; return v0 + (v1 - v0) * ez((t - f0) / (f1 - f0))
    return keys[-1][1]
def steps(xs, per=92.0):                                                     # frame indices where a footfall lands
    acc = 0; out = []; last = 0
    for i in range(1, len(xs)):
        acc += abs(xs[i] - xs[i - 1])
        if acc // per > last: out.append(i); last = acc // per
    return out
def foot_events(f0, xs, kind, g=.5, pan=0, rev=None):
    for k in steps(xs): put('sfx', footstep(kind, 1), T(f0 + k), g * rng.uniform(.8, 1.1), pan, rev, .12)

# ------------------------------------------------------------------ voice
def vo_process(x):
    x = hp(x, 85); x = peak(x, 3200, .9, 3.0); x = peak(x, 220, 1, 1.5); x = lp(x, 14000)
    env = lp(np.abs(x), 12, 1); thr = .08; gain = np.where(env > thr, (np.maximum(env, 1e-6) / thr) ** (1 / 3 - 1), 1.0); gain = lp(gain, 30, 1); x = x * gain * 1.35
    return x / np.max(np.abs(x)) * .9
for lid, l in LINES.items():
    d, sr = sf.read(f'vo2/{lid}.wav'); x = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d); x = vo_process(x)
    where = 'well' if SH['stairs'][0] + 44 <= l['t0'] < SH['stairs'][0] + 96 else ('out' if SH['ext'][0] <= l['t0'] < SH['endcard'][0] else 'room')
    put('vo', x, T(l['t0']) , 1.0, 0.0, where, .22 if where != 'room' else .12)
VOENV = np.sqrt(np.maximum(1e-9, signal.fftconvolve(BUS['vo'][0] ** 2, np.ones(int(.06 * SR)) / int(.06 * SR))[:N]))

# ------------------------------------------------------------------ events: WAKE / CITY / STUCK (frames 0-270)
put('sfx', zvoice(5, -4, 1) * .7, T(8), .5, -.4, 'out', .5)                              # distant scream-roar through the wall
put('sfx', inhale(.3, 1.1), T(13), .8); put('sfx', cloth(.5, .9), T(14), .7, -.2)
put('sfx', impact(1.0, .9), T(9), .45); put('sfx', whoosh(.35, 800, 6000, .5), T(10), .5)
put('amb', wind(3.2, .35, 200, 900), T(0), 1)                                                # night ambience
for k, f in enumerate((30, 52, 66)): put('sfx', zvoice(k, -6, .5), T(f), .25 + .1 * k, rng.uniform(-.7, .7), 'out', .6)
put('amb', carAlarm(2.6, .22), T(74), 1, .6, 'out', .5); put('amb', wind(2.0, .5, 150, 700), T(72), 1)
put('amb', hp(noise(3.0), 1000) * (.4 + .6 * np.abs(np.sin(tt(3.0) * 40))) * .06, T(72), 1, -.3)  # fire crackle
for f in (84, 108, 140): put('sfx', zvoice(f % 6, -7, .6), T(f), .22, rng.uniform(-.8, .8), 'out', .7)
put('sfx', impact(1.4, 1.2), T(SH['stuck'][0]), .9); put('sfx', whoosh(.4, 300, 3000, .8), T(SH['stuck'][0] - 7), .7)
put('sfx', riser(1.1, 150, 1500, .5), T(SH['stuck'][0] - 66), .5)
for k in range(5): put('sfx', heart(1.0), T(SH['stuck'][0] + 10) + k * .72, .5)

# ------------------------------------------------------------------ ELEVATOR (270-522)
e0 = SH['elev'][0]; pos = [320 if lf < 8 else 320 + (-22 - 320) * ioQ(min(1, max(0, (lf - 8) / 66))) for lf in range(0, 90)]
foot_events(e0, pos, 'carpet', .55, 0.2, 'hall'); put('amb', hp(noise(5), 100) * 0 + lp(noise(5), 180) * .05, T(e0), 1)   # hall room tone / light hum
put('amb', np.sin(2 * np.pi * 120 * tt(5)) * .012 * (1 + .3 * np.sin(tt(5) * 7)), T(e0), 1)
put('sfx', click(.7), T(e0 + 84), .6); put('sfx', chime(.5), T(e0 + 85), .35)
put('sfx', S(ding(1318, 1.8, 1.0), click(1.0) * .8), T(e0 + 96), 1.5, -.3, 'hall', .3)
put('sfx', whoosh(.5, 300, 1800, .5, True) * .5 + lp(noise(.5), 400) * np.sin(np.pi * tt(.5) / .5) * .6, T(e0 + 100), .6, -.3)            # doors slide
put('sfx', horde(2.8, 6, 1.1), T(e0 + 104), .75, -.3, 'hall', .35)
put('sfx', zvoice(2, -4, 1), T(e0 + 150), .5, -.3, 'hall', .3); put('sfx', cloth(.4, .6), T(e0 + 102), .5)
put('sfx', whoosh(.5, 300, 1800, .5, False) * .5 + lp(noise(.5), 400) * np.sin(np.pi * tt(.5) / .5) * .6, T(e0 + 198), .6, -.3); put('sfx', wood_hit(.6) * .5, T(e0 + 226), .6, -.3, 'hall', .2)
xs = [-22 + max(0, lf - 226) * 6 for lf in range(226, 252)]; foot_events(e0 + 226, xs, 'carpet', .5, .2, 'hall')
put('sfx', impact(.8, .6), T(e0 + 175), .5); put('sfx', pop(.7), T(e0 + 175), .4)                                    # stamp x
# ------------------------------------------------------------------ STAIRS (522-720)
s0 = SH['stairs'][0]; sp = [-90 + (250 + 90) * ioQ(min(1, lf / 36)) for lf in range(0, 40)]; foot_events(s0, sp, 'carpet', .55, .2, 'hall')
put('sfx', creak(.45, 520, .8), T(s0 + 34), .6, .3, 'hall', .2); put('sfx', zvoice(0, -8, 1), T(s0 + 40), .5, .3, 'well', .5); put('sfx', riser(.3, 400, 2500, .6), T(s0 + 38), .5)
put('sfx', horde(2.2, 8, 1.2, 80), T(s0 + 44), .8, 0, 'well', .6); put('sfx', impact(1.0, .6), T(s0 + 44), .5)
for k in range(6): put('sfx', creak(.3, 900 + 80 * k, .5), T(s0 + 52 + 7 * k), .4, rng.uniform(-.6, .6), 'well', .4)           # railings / steps
put('sfx', whoosh(.2, 600, 4000, .6), T(s0 + 94), .6); put('sfx', door_slam(), T(s0 + 96), 1.0, .2, 'hall', .3)
for a in (112, 134, 158, 178): put('sfx', S(wood_hit(1.0) * 1.1, impact(.6, .35)), T(s0 + a), .9, .2, 'hall', .25); put('sfx', zvoice(a % 6, -6, .7), T(s0 + a + 2), .35, .3, 'room', .2)
put('sfx', pop(.7), T(s0 + 122), .35); put('sfx', impact(.8, .6), T(s0 + 122), .45)
# ------------------------------------------------------------------ VERTIGO (720-1020)
v0 = SH['vertigo'][0]; vp = [-170 + 190 * ioQ(min(1, lf / 44)) for lf in range(0, 46)]; foot_events(v0, vp, 'wood', .5, -.1, 'room')
put('sfx', creak(.55, 480, .9), T(v0 + 44), .7, .4, 'room', .15); put('sfx', whoosh(.5, 400, 2500, .6), T(v0 + 44), .5, .4)
put('amb', wind(4.5, .7, 220, 1500), T(v0 + 48), 1)
bn = v0 + 110; put('sfx', whoosh(1.9, 300, 7000, 1.2, False), T(bn), .9); put('sfx', riser(2.0, 120, 800, .9), T(bn), .6)
put('sfx', horde(1.5, 10, 1.2, 80), T(bn + 80), .9, 0, 'out', .5); put('sfx', impact(.6, .6), T(bn + 105), .6)
for k in range(5): put('sfx', heart(.9), T(bn + 8 + 18 * k), .55)
put('sfx', gulp(1.0), T(v0 + 236), .8); put('sfx', impact(.7, .7), T(v0 + 262), .6); put('sfx', pop(.7), T(v0 + 262), .4)
# ------------------------------------------------------------------ TIE (1020-1338)
t0 = SH['tie'][0]
xk = [[0, 60], [4, 60], [26, -122, ioQ], [50, -122], [84, 70, ioQ], [136, 70], [150, 10, ioQ], [176, 10], [196, 70, ioQ], [210, 70], [226, 330, ioQ], [260, 330], [286, 150, ioQ]]
foot_events(t0, [kf(lf, xk) for lf in range(0, 300)], 'wood', .45, 0, 'room')
for a, b in ((30, .6), (150, .55), (188, .6)): put('sfx', cloth(.5, 1.0), T(t0 + a), b, rng.uniform(-.3, .3))
for a in (56, 92, 168, 208, 274): put('sfx', creak(.18, 1400, .8), T(t0 + a - 3), .5); put('sfx', pop(.9), T(t0 + a + 2), .5); put('sfx', cloth(.25, .8), T(t0 + a - 8), .4)
put('sfx', cloth(.6, 1) * .9 + lp(noise(.6), 2000) * .15, T(t0 + 148), .7); put('sfx', S(wood_hit(.7) * .45, thump(.4, 80, 40) * .5), T(t0 + 160), .7, 0, 'room', .2)     # curtain rip and fall
for k in range(6): put('sfx', creak(.28, 600 + 90 * k, .5), T(t0 + 232 + 9 * k), .35)                          # scarf stretching
put('sfx', creak(.9, 500, .8), T(t0 + 288), .7); put('sfx', chime(1.0), T(t0 + 300), .6)
# ------------------------------------------------------------------ MATH (1338-1620)
m0 = SH['math'][0]; put('sfx', whoosh(.9, 1500, 600, 1.0, False), T(m0 + 8), .8, -.3); put('sfx', S(thump(.4, 70, 40) * .9, creak(.5, 400, .5)), T(m0 + 66), .6, -.3, 'out', .2)
for a in (30, 44, 60): put('sfx', click(.7), T(m0 + a), .5, -.2); put('sfx', ding(1568 if a < 60 else 1760, .8, .9), T(m0 + a + 1), .35, -.3)
put('sfx', pop(.8), T(m0 + 70), .4); put('sfx', chalk(.35, 1.0), T(m0 + 124 + 70), .6); put('sfx', chalk(.4, 1.0), T(m0 + 124 + 118), .6)
put('sfx', gulp(.9), T(m0 + 124 + 26), .5); put('sfx', pop(.8), T(m0 + 124 + 70), .35); put('sfx', thump(.5, 60, 35) * .8, T(m0 + 124 + 118), .6)
# ------------------------------------------------------------------ EXTERIOR (1620-2604)
x0 = SH['ext'][0]
def extHip(lf): return kf(lf, [[22, -40], [36, 30, ioQ], [160, 440, lin], [200, 520, ioC], [232, 615, ioC], [300, 860, lin], [317, 890, lin], [360, 892, lin], [400, 1170, ioC], [470, 1500, ioC], [490, 1500]])
hips = [extHip(lf) for lf in range(0, 500)]
put('sfx', cloth(.35, .9), T(x0 + 20), .7, -.5); put('sfx', creak(.5, 450, .9), T(x0 + 30), .8, -.5, 'out', .2); put('sfx', thump(.3, 90, 45), T(x0 + 36), .5)
put('amb', wind(14, .55, 180, 1100), T(x0 + 10), 1); put('amb', wind(12, .5, 400, 2500), T(x0 + 300), 1)
last = 0
for lf in range(36, 470):
    g = int(hips[lf] // 37)
    if g > last: put('sfx', creak(.2, 700 + 40 * (g % 5), .45), T(x0 + lf), .38, -.3, 'out', .08); put('sfx', cloth(.15, .5), T(x0 + lf), .3, -.3); last = g
put('sfx', tvMurmur(3.0, .8), T(x0 + 60), .55, .5);
for k in range(5): put('sfx', crunch(.45, .9), T(x0 + 70 + 24 * k), .4, .5)
slam = x0 + LINES['f11']['words'][5]['a'] - x0 + 3; slam = LINES['f11']['words'][5]['a'] + 3
put('sfx', impact(1.5, 1.2), T(slam), 1.0, -.2); put('sfx', glass(1.0, .6), T(slam + 2), .8, -.4); put('sfx', zvoice(5, -3, 1.3), T(slam), .7, -.4, 'out', .3); put('sfx', crack(1), T(slam + 3), .8)
put('sfx', creak(1.0, 520, .9), T(slam + 8), .6, -.3)
put('sfx', whoosh(1.0, 300, 6000, 1.0, False), T(x0 + 438), .7); put('amb', wind(5.5, 1.0, 150, 2000), T(x0 + 436), 1); put('sfx', riser(2.6, 100, 700, .8), T(x0 + 438), .5)
for k in range(3): put('sfx', heart(.9), T(x0 + 475) + k * .6, .55)
put('sfx', gulp(1.0), T(x0 + 508), .7)
mv = LINES['move']['words'][0]['a'] - 4
put('sfx', S(thump(.6, 70, 35) * 1.2, creak(.7, 380, .8), whoosh(.4, 500, 3000, .5)), T(mv + 6), .85, -.3, 'out', .3)                  # rope jerk
put('sfx', (np.sin(2 * np.pi * 180 * tt(.9)) * np.exp(-tt(.9) / .25) + .3 * np.sin(2 * np.pi * 360 * tt(.9)) * np.exp(-tt(.9) / .15)) * .4, T(mv + 7), .5, -.3)  # rope twang
for k in range(10): put('sfx', creak(.25, 600 + 60 * (k % 4), .5), T(mv + 20 + 11 * k), .22 + .03 * k, .3, 'out', .15)
put('sfx', horde(3.0, 5, .9), T(mv + 40), .5, .3, 'out', .4); put('sfx', riser(2.6, 150, 3500, 1.0), T(mv + 50), .6)
cl = LINES['climb']['t0']
put('sfx', impact(2.0, 1.4), T(cl), 1.0); put('sfx', whoosh(.5, 400, 6000, .9), T(cl - 6), .8); put('sfx', zvoice(5, -6, 1.2), T(cl + 6), .6, .2, 'out', .3)
for k in range(12): put('sfx', creak(.3, 500 + 50 * (k % 5), .6), T(x0 + 830 + 10 * k), .35, .3, 'out', .1)
for k in range(8): put('sfx', whoosh(.5, 500, 2500, .6), T(x0 + 880 + 9.5 * k), .3 + .03 * k, -.3 if k % 2 else .3)         # swinging
put('sfx', riser(.98, 200, 5000, 1.0), T(x0 + 900) + .0, .6)
kick = x0 + 958
put('sfx', impact(1.6, 1.3), T(kick - 2), 1.0); put('sfx', glass(1.6, 1.0), T(kick - 2), 1.0, -.2, 'out', .3); put('sfx', whoosh(.3, 600, 5000, .8), T(kick - 8), .7)
# ------------------------------------------------------------------ END CARD
e1 = SH['endcard'][0]; put('sfx', impact(1.4, 1.0), T(e1 + 2), .7); put('sfx', ding(880, 2.2, .8), T(e1 + 22), .5, 0, 'hall', .3); put('amb', wind(2.5, .35, 150, 500), T(e1 + 10), 1)

# ------------------------------------------------------------------ MUSIC (tension bed, playful interlude, driving finale)
def note(f, d, wave='saw', a=.01, r=.2, det=.004):
    t = tt(d); ph = 2 * np.pi * f * t
    s = (signal.sawtooth(ph) + signal.sawtooth(ph * (1 + det)) + signal.sawtooth(ph * (1 - det))) / 3 if wave == 'saw' else np.sin(ph)
    return s * np.minimum(t / a, 1) * np.minimum((d - t) / r, 1) * (np.exp(-t / .12) * .85 + .15 if wave == 'pluck' else 1)
def pluck(f, d=.3): t = tt(d); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t) + .2 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t / .11) * np.minimum(t / .003, 1)
A1, C2, D2, E2, F2, G2, A2 = 55.0, 65.41, 73.42, 82.41, 87.31, 98.0, 110.0
mus = np.zeros(N)
def madd(x, t, g=1.0):
    i = int(t * SR);
    if i < N: x = x[:N - i]; mus[i:i + len(x)] += x * g
# 1) dark drone throughout (fades with section)
tN = np.arange(N) / SR; drone = (np.sin(2 * np.pi * A1 * tN) * .6 + lp(signal.sawtooth(2 * np.pi * A1 * 2 * tN * (1 + .002 * np.sin(tN * .3))) * .3, 500)) * .35
sect = np.interp(tN, [0, 3, 17, 17.8, 27, 27.8, 40, 43, 44, 47], [.5, .9, .9, .15, .15, .8, 1, 1, .4, .4]); mus += drone * sect * .6
# 2) pulse (tension) 3 -> 17 at 84 bpm, 27.5 -> 39.9 faster, finale 40-43
def pulses(t0, t1, bpm, g, f0=55):
    b = 60 / bpm; k = 0
    while t0 + k * b < t1: madd(thump(.35, f0 * 1.9, f0 * .7, .1) * 1.2, t0 + k * b, g * (1 if k % 4 == 0 else .75)); k += 1
pulses(3.0, 17.0, 84, .5); pulses(27.5, 37.2, 96, .55); pulses(37.2, 39.9, 120, .6); pulses(39.9, 42.9, 150, .8)
# hats / ticks on the fast sections
for tb in np.arange(39.9, 42.9, 60 / 150 / 2): madd(hp(noise(.05), 6000) * env_ad(int(.05 * SR), .0005, .012) * .6, tb, .5)
for tb in np.arange(8.7, 17.0, 60 / 84 / 2): madd(hp(noise(.04), 7000) * env_ad(int(.04 * SR), .0005, .01) * .5, tb, .25)
# 3) tension strings (slow notes) in the tension sections
for (t0_, notes) in ((4.4, [A2, A2 * 1.0595, A2]), (27.5, [A2 * .5, A2 * .5 * 1.1892, A2 * .5 * 1.3348, A2 * .5 * 1.5, A2 * .5 * 1.7818]), ):
    for k, f in enumerate(notes): madd(lp(note(f * 2, 2.6, 'saw', .4, .8, .006), 2200), t0_ + k * (3.0 if t0_ < 5 else 2.2), .22)
# 4) playful interlude 17.0-27.0 : pizzicato walking bass + staccato plucks (breaks the dread, then it snaps back)
bpm = 124; b = 60 / bpm; walk = [A2 * .5, A2 * .5 * 1.2599, A2 * .5 * 1.4983, A2 * .5 * 1.2599]
k = 0; tcur = 17.0
while tcur < 26.8:
    madd(pluck(walk[k % 4], .28), tcur, .4);
    if k % 2: madd(pluck(walk[k % 4] * 4, .2), tcur + b / 2, .22)
    madd(hp(noise(.03), 7000) * env_ad(int(.03 * SR), .0004, .008) * .5, tcur + b / 2, .25); tcur += b; k += 1
# 5) hits on cuts
for ft, gg in ((SH['stuck'][0], 1.0), (SH['stairs'][0] + 44, .5), (SH['vertigo'][0] + 215, .6), (cl, 1.0)): madd(thump(1.2, 90, 30, .3) * 1.4 + lp(noise(1.2), 600) * env_ad(int(1.2 * SR), .002, .3) * .3, T(ft), gg * .8)
madd(sum(note(f, 2.5, 'saw', .02, 1.2) for f in (A2, A2 * 1.2, A2 * 1.5)), 43.6, .0)                      # end card pad is intentionally minimal
madd(lp(sum(note(f, 3.2, 'saw', .6, 1.4) for f in (A2, A2 * 1.2599, A2 * 1.4983)), 1500), 43.7, .25)
# duck the music under the voice
duck = 1 - .55 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 4, 1), 0, 1)
mus *= duck; BUS['mus'][0] += mus * .5; BUS['mus'][1] += mus * .5

# ------------------------------------------------------------------ master
mix = BUS['vo'] * 1.0 + BUS['sfx'] * .9 + BUS['amb'] * .7 + BUS['mus'] * 1.0 + BUS['rev'] * .8
# sidechain: SFX/amb duck slightly under voice so dialogue stays clear
GS, GA, GR, GM = .2, .5, .18, .75
mix = BUS['vo'] + (BUS['sfx'] * GS + BUS['amb'] * GA + BUS['rev'] * GR) * (1 - .4 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 6, 1), 0, 1)) + BUS['mus'] * GM
kt = T(SH['ext'][0] + 958)
vac = np.ones(N); vac[int((kt - .36) * SR):int((kt - .07) * SR)] = .08; vac = lp(vac, 60, 1); vac = np.clip(vac, 0, 1)
mix = mix * vac
mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
from scipy import ndimage
spk = VOENV > .02
for nm, b, gg in (('sfx', BUS['sfx'], GS), ('amb', BUS['amb'], GA), ('rev', BUS['rev'], GR), ('mus', BUS['mus'], GM)):
    print('  under speech', nm, round(float(20 * np.log10(np.sqrt(np.mean((b[:, spk] * gg) ** 2)) / np.sqrt(np.mean(BUS['vo'][:, spk] ** 2)) + 1e-9)), 1), 'dB re vo')
def rmsdb(x): a = x[:, np.abs(x).max(0) > 1e-3]; return 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-9)
print({k: round(float(rmsdb(v)), 1) for k, v in BUS.items()}, 'music', round(float(20 * np.log10(np.sqrt(np.mean(mus ** 2)) + 1e-9)), 1))
act = mix[:, np.abs(mix).max(0) > 1e-3]; mix = mix * (.13 / np.sqrt(np.mean(act ** 2)))
pk = np.abs(mix).max(0); need = np.minimum(1.0, .92 / np.maximum(pk, 1e-9)); g = ndimage.minimum_filter1d(need, int(.003 * SR), mode='nearest'); g = ndimage.uniform_filter1d(g, int(.004 * SR)); g = np.minimum(g, need) if False else g
rel = g.copy()
for i in range(1, len(rel)):                                                   # release 120 ms
    rel[i] = min(1.0, max(g[i], rel[i - 1] + (1 - rel[i - 1]) / (.12 * SR))) if g[i] >= rel[i - 1] else g[i]
mix = np.tanh(mix * rel * 1.0 / .95) * .95
sf.write('mix2_raw.wav', mix.T.astype(np.float32), SR)
print('mix2_raw.wav written; peak', float(np.max(np.abs(mix))))
