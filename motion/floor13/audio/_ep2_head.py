# mix2.py - FLOOR 13 ep.1 v2 sound design: processed Kokoro voice + code-made foley/SFX/music, locked to ../engine/timeline.json.
# Run from audio/:  python3 -I mix2.py   -> mix2.wav (then loudness-normalised with ffmpeg in build.sh)
import json, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; FPS = 60; TOT = 44.5; N = int(TOT * SR)
rng = np.random.default_rng(13)
TL = json.load(open('../engine_ep2/timeline.json')); SH = TL['shots']; LINES = {l['id']: l for l in TL['lines']}
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

