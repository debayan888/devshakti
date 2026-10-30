# mix2.py - FLOOR 13 ep.1 v2 sound design: processed Kokoro voice + code-made foley/SFX/music, locked to ../engine/timeline.json.
# Run from audio/:  python3 -I mix2.py   -> mix2.wav (then loudness-normalised with ffmpeg in build.sh)
import json, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; FPS = 60; TOT = 52.0; N = int(TOT * SR)
rng = np.random.default_rng(13)
TL = json.load(open('../engine_ep2b/timeline.json')); SH = TL['shots']; LINES = {l['id']: l for l in TL['lines']}
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

# ================================================================== EPISODE 2 BODY (events locked to timeline.json)
EV = {k: v / FPS for k, v in TL['events'].items()}
def ringtone(d=2.6, g=1.0):
    n = int(d * SR); out = np.zeros(n); notes = [1175, 1480, 1760, 1480]
    t0 = 0.0
    while t0 < d:
        for burst in range(2):
            for k, f in enumerate(notes):
                tt_ = tt(.34); w = (np.sin(2 * np.pi * f * tt_) + .35 * np.sin(2 * np.pi * 2 * f * tt_)) * np.exp(-tt_ / .09) * np.minimum(tt_ / .002, 1)
                i = int((t0 + burst * .56 + k * .115) * SR)
                if i < n: m = min(len(w), n - i); out[i:i + m] += w[:m]
        t0 += 2.0
    t = tt(d); buzz = lp(signal.sawtooth(2 * np.pi * 150 * t), 700) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 30 * t))) * .35
    return (out * .5 + buzz) * g
def buzzer(g=1.0): t = tt(.28); return lp(signal.square(2 * np.pi * 150 * t) * .4, 1200) * np.minimum(t / .005, 1) * np.minimum((.28 - t) / .03, 1) * g
def snap_bone(g=1.0): n = int(.07 * SR); return (hp(noise(.07), 1500) * env_ad(n, .0003, .008) * .9 + thump(.07, 190, 90, .01) * .5) * g
def hose_drag(d=1.0, g=1.0): n = int(d * SR); a = np.abs(np.interp(np.linspace(0, 1, n), np.linspace(0, 1, int(d * 14) + 3), rng.uniform(.2, 1, int(d * 14) + 3))); return bp(noise(d), 180, 1400) * a * .6 * g
def sash(d=.4, g=1.0): n = int(d * SR); t = np.arange(n) / SR; return bp(noise(d), 500, 3500) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 22 * t))) * np.sin(np.pi * t / d) * .5 * g
def boing(g=1.0): t = tt(.5); f = 200 + 140 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / .2); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16) * .5 * g
def oof(g=1.0): t = tt(.26); x = np.sin(2 * np.pi * (150 - 60 * t / .26) * t) + .5 * np.sin(2 * np.pi * 2 * (150 - 60 * t / .26) * t); x = bp(x + noise(.26) * .2, 200, 1500); return x * np.sin(np.pi * t / .26) ** .6 * .6 * g
def zap(g=1.0): n = int(.5 * SR); x = np.zeros(n)
def zap(g=1.0):
    n = int(.5 * SR); x = np.zeros(n)
    for _ in range(14): i = int(rng.uniform(0, .4) * SR); m = min(2200, n - i); x[i:i + m] += hp(noise(.05), 2500)[:m] * env_ad(m, .0003, .01) * rng.uniform(.3, 1)
    return x * g
def sparkle(g=1.0):
    x = np.zeros(int(.9 * SR))
    for k in range(4):
        d_ = ding(2093 * (1 + .12 * k), .3, 1); i = int(k * .09 * SR); m = min(len(d_), len(x) - i)
        if m > 0: x[i:i + m] += d_[:m]
    return x * g
def vo_process(x):
    x = hp(x, 85); x = peak(x, 3200, .9, 3.0); x = peak(x, 220, 1, 1.5); x = lp(x, 14000)
    env = lp(np.abs(x), 12, 1); thr = .08; gain = np.where(env > thr, (np.maximum(env, 1e-6) / thr) ** (1 / 3 - 1), 1.0); gain = lp(gain, 30, 1); x = x * gain * 1.35
    return x / np.max(np.abs(x)) * .9
def phone_process(x): x = bp(x, 380, 3400, 3); x = np.tanh(x * 3.2); x = peak(x, 1500, 1.2, 4); return x / (np.max(np.abs(x)) + 1e-9) * .85

EV = {k: v / FPS for k, v in TL['events'].items()}

# ------------------------------------------------------------------ voice (Dev, news anchor on TV, Mom on the phone, the landlord)
def tv_process(x): x = bp(x, 250, 5000, 2); x = np.tanh(x * 1.8); x = peak(x, 2000, 1, 3); return x / (np.max(np.abs(x)) + 1e-9) * .85
for l in TL['lines']:
    lid = l['id']; d, sr = sf.read(f'vo4/{lid}.wav'); x = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d); t0 = l['t0'] / FPS
    if lid == 'momA': put('vo', phone_process(x), t0, .8, .1, 'hall', .2); continue
    if lid == 'tv': put('vo', tv_process(x), t0, .85, .15, 'room', .25); continue
    if lid == 'zrent':
        y = np.interp(np.arange(0, len(x), 2 ** (-3 / 12)), np.arange(len(x)), x); y = np.tanh(y / (np.max(np.abs(y)) + 1e-9) * 2.2); y = peak(lp(y, 2600), 600, 2, 5); put('vo', y / np.max(np.abs(y)) * .8, t0, .85, -.3, 'room', .25); continue
    x = vo_process(x); where = 'out' if t0 < 4.0 else ('room' if t0 < 26.7 or t0 > 46.9 else 'hall')
    put('vo', x, t0, 1.0, 0.0, where, .22 if where == 'out' else .12)
VOENV = np.sqrt(np.maximum(1e-9, signal.fftconvolve(BUS['vo'][0] ** 2, np.ones(int(.06 * SR)) / int(.06 * SR))[:N]))
SH = TL['shots']; ST = {k: v[0] / FPS for k, v in SH.items()}
def steps_between(t0, t1, per, kind, g, pan=0, rev=None, jitter=.01):
    t = t0
    while t < t1: put('sfx', footstep(kind, 1), t, g * rng.uniform(.85, 1.1), pan, rev, .12); t += per + rng.uniform(-jitter, jitter)
# ------------------------------------------------------------------ SWING + CRASH (same beats as before)
put('amb', wind(4.2, .7, 200, 1300), 0, 1); put('sfx', horde(3.6, 3, .35, 90), .1, .4, .2, 'out', .4)
t = .7; k = 0
while t < 3.4: put('sfx', creak(.28, 480 + 30 * (k % 3), 1), t, .35 + .35 * min(1, t / 3), .1 * (-1) ** k, 'out', .1); t += .238; k += 1
for kk in range(4): put('sfx', heart(.9), 1.0 + kk * .8, .5 + .1 * kk)
put('sfx', riser(1.6, 150, 1800, .6), 1.9, .45)
put('sfx', whoosh(.3, 800, 5000, 1.0), EV['kick'] - .1, .8); put('sfx', S(impact(1.0, 1.0), glass(1.6, 1.0)), EV['kick'] + .02, 1.0, -.3, 'out', .3)
c0 = EV['crash_in']; put('sfx', whoosh(.5, 400, 6000, .9), c0 - .05, .8); put('sfx', S(impact(1.1, .9), glass(1.0, .6)), c0, .9, -.3, 'room', .3)
put('sfx', S(thump(.5, 70, 38) * 1.2, cloth(.5, .8)), EV['land'], .9, .3, 'room', .2); put('sfx', boing(.8), EV['land'] + .02, .6, .3); put('sfx', oof(1.0), EV['land'] + .12, .8, .3)
put('sfx', sparkle(.8), EV['land'] + .6, .5, .3); put('sfx', glass(.9, .35), c0 + .5, .35, -.3, 'room', .3); put('amb', lp(noise(22.8), 400) * .05, c0, 1)
# ------------------------------------------------------------------ TV
put('sfx', S(click(1.0), boing(.3) * .3), EV['remote'], .7, .2); put('sfx', S(hp(noise(.25), 2000) * env_ad(int(.25 * SR), .001, .08) * .6, ding(1760, .3, .6)), EV['remote'] + .05, .5, .15)   # TV powers on
tv_s, tv_e = EV['tv_in'], EV['tv_out']; put('amb', bp(noise(tv_e - tv_s), 3000, 9000) * .025, tv_s, 1, .15)                                  # CRT hiss
for tb in np.arange(tv_s + .1, tv_e - .3, 60 / 120): put('sfx', thump(.25, 80, 50) * .5, tb, .25, .15)                                           # news-bed pulse
put('sfx', S(ding(988, 1.0, 1), ding(1318, 1.0, .8)), tv_s + .02, .45, .15)                                                                  # news sting
put('sfx', S(impact(.8, .7), riser(.4, 300, 2000, .5)), EV['clock'], .55); put('sfx', S(click(.6), click(.6)), EV['clock'] + .2, .4)
for kk in range(10): put('sfx', click(.35), EV['clock'] + .5 + kk, .18)                                                                       # clock ticking
put('sfx', gulp(1.0), 17.3, .55)
# ------------------------------------------------------------------ LANDLORD
put('sfx', S(glass(.7, .7), creak(.4, 700, .6)), EV['ll_hands'], .6, -.4, 'room', .2); put('sfx', zvoice(2, -7, 1.0), EV['ll_hands'] + .4, .45, -.4, 'room', .3)
put('sfx', S(cloth(.5, .8), glass(.5, .4)), EV['ll_in'] - .3, .5, -.4); put('sfx', S(thump(.4, 80, 40) * 1.2, glass(.6, .5)), EV['ll_land'], .8, -.3, 'room', .2)
put('sfx', S(impact(.9, .7), riser(.3, 300, 2500, .5)), 20.62, .6)
put('sfx', cloth(.5, 1.0), EV['hide'], .55, .3)
for kk in range(5): put('sfx', heart(1.0), 21.2 + kk * .6, .55)
for kk in range(4): put('sfx', S(lp(noise(.3), 700) * env_ad(int(.3 * SR), .02, .1) * .5), 21.5 + kk * .5, .35, -.2, 'room', .1)   # landlord shuffles
put('sfx', S(hp(noise(.2), 3000) * env_ad(int(.2 * SR), .005, .05) * .4), 21.9, .3, -.1)                                                   # sniff
put('sfx', S(cloth(.3, .7), click(.6)), EV['clip'], .5, -.2)
steps_between(EV['run_out'], EV['run_out'] + .7, .17, 'wood', .6, .3, 'room', .004)
put('sfx', door_slam(), EV['door_slam'], 1.0, .4, 'room', .25)
# ------------------------------------------------------------------ PAN
p0 = ST['pan']; put('amb', lp(noise(20.3), 260) * .045 + np.sin(2 * np.pi * 120 * tt(20.3)) * .011, p0, 1)
for bb in (26, 52): put('sfx', S(wood_hit(1.0), impact(.5, .3)), p0 + bb / 60, .75, -.3, 'hall', .25)
put('sfx', zvoice(5, -5, 1.0), p0 + .5, .4, -.3, 'room', .3)
put('sfx', whoosh(1.7, 300, 3500, .9, True), p0 + .9, .4, .2); put('sfx', S(ding(1318, 1.6, 1.0), click(.8)), EV['cab_reach'], 1.3, .1, 'hall', .3); put('sfx', chime(.8), EV['cab_reach'] + .05, .45)
put('sfx', S(ding(2400, .5, .9), ding(3100, .4, .5)), EV['hose_coil'] + .15, .6, .1); put('sfx', whoosh(.9, 300, 3000, .8, False), ST['hall'] - .9, .55, -.2)
for tz in (27.2, 28.0, 29.2): put('sfx', zvoice(int(tz) % 6, -8, .8), tz, .22, rng.uniform(-.6, .6), 'hall', .5)
# ------------------------------------------------------------------ HALL
steps_between(EV['tiptoe0'], EV['ring_on'] - .1, .375, 'carpet', .36, 0, 'hall')
tp = EV['tiptoe0']; kk = 0
for kk in range(4): put('sfx', heart(.9), 33.0 + kk * .5, .45)
ro = EV['ring_on']; rt = ringtone(EV['answer'] - ro, 1.0); put('sfx', rt, ro, 1.15, 0, 'hall', .25)
put('sfx', horde(2.0, 8, 1.1, 90), ro + .05, .85, 0, 'hall', .5); put('sfx', buzzer(.5), ro + .05, .3)
for kk in range(7): put('sfx', snap_bone(1.0), ro + .05 + kk * .05, .4, rng.uniform(-.8, .8))
put('sfx', S(click(1.0), pop(.8)), EV['answer'], .6)
t = 36.2
while t < EV['phone_land']: put('sfx', lp(noise(.35), 700) * env_ad(int(.35 * SR), .02, .12) * .5, t, .2 + .5 * min(1, (t - 36.2) / 3), rng.uniform(-.7, .7), 'hall', .1); t += max(.1, .42 - .08 * (t - 36.2))
put('sfx', horde(4.0, 7, .9, 86), 36.5, .45, 0, 'hall', .5)
for kk in range(6): put('sfx', heart(.9), 37.0 + kk * .5, .4 + .05 * kk)
th = EV['throw']; put('sfx', whoosh(.5, 500, 4000, .9), th - .05, .55, -.2)
pl = EV['phone_land']; put('sfx', S(thump(.25, 150, 80), hp(noise(.35), 1200) * env_ad(int(.35 * SR), .001, .1) * .6, click(.8)), pl, .8, -.55, 'hall', .35)
_mb, _sr = sf.read('vo3/momB.wav'); _mb = np.interp(np.arange(0, len(_mb), _sr / SR), np.arange(len(_mb)), _mb); put('sfx', phone_process(_mb), pl + .15, .45, -.6, 'hall', .45)
put('sfx', horde(2.2, 8, 1.2, 84), pl + .1, .75, -.3, 'hall', .4); put('sfx', zvoice(5, -3, 1.2), pl + .1, .6, -.2, 'hall', .35)
t = pl + .05
while t < pl + 1.6: put('sfx', S(thump(.2, 110, 55) * .8, lp(noise(.2), 800) * env_ad(int(.2 * SR), .002, .05) * .6), t, .5, rng.uniform(-.8, -.1), 'hall', .1); t += rng.uniform(.045, .09)
steps_between(40.4, 42.3, .175, 'carpet', .55, 0, 'hall', .005)
put('sfx', S(impact(1.0, 1.2), glass(1.3, 1.3)), EV['glass'], 1.3, .3, 'hall', .3); put('sfx', hose_drag(3.0, 1.0), EV['glass'] + .3, .55, .2, 'hall', .15)
put('sfx', S(door_slam(), impact(1.2, 1.0)), EV['ll_door'], 1.1, -.5, 'hall', .35); put('sfx', zvoice(5, -5, 1.3), EV['ll_door'] + .15, .7, -.5, 'hall', .3)
t = EV['ll_door'] + .3
while t < EV['grab']: put('sfx', S(thump(.22, 100, 50)), t, .35 + .4 * min(1, (t - 42.9) / 3), -.6 + .9 * (t - 42.9) / 3.6, 'hall', .1); t += max(.16, .4 - .06 * (t - 42.9))
put('sfx', riser(3.2, 120, 2500, 1.0), 42.9, .55)
steps_between(45.0, 45.6, .17, 'carpet', .55, .2, 'hall', .004); put('sfx', sash(.45, 1.0), EV['win_open'], .6, .5); put('amb', wind(1.8, .9, 200, 1800), 45.5, 1)
dv = EV['dive']; put('sfx', whoosh(.5, 600, 6000, 1.0), dv - .05, .9, .4)
gb = EV['grab']; put('sfx', S(impact(1.6, 1.4), (np.sin(2 * np.pi * 220 * tt(.7)) * np.exp(-tt(.7) / .25)) * .5), gb, 1.0, 0); put('sfx', zvoice(1, -4, 1.3), gb + .05, .7, -.1, 'hall', .3)
e2 = ST['end2']; put('sfx', impact(1.4, 1.0), e2 + .05, .7); put('sfx', ding(880, 2.2, .8), e2 + .35, .5, 0, 'hall', .3); put('amb', wind(2.4, .4, 150, 500), e2 + .2, 1)
# ------------------------------------------------------------------ MUSIC
def note(f, d, a=.01, r=.2, det=.004):
    t = tt(d); ph = 2 * np.pi * f * t; s = (signal.sawtooth(ph) + signal.sawtooth(ph * (1 + det)) + signal.sawtooth(ph * (1 - det))) / 3; return s * np.minimum(t / a, 1) * np.minimum((d - t) / r, 1)
def pluck(f, d=.3): t = tt(d); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / .11) * np.minimum(t / .003, 1)
mus = np.zeros(N)
def madd(x, t, g=1.0):
    i = int(t * SR)
    if i < N: x = x[:N - i]; mus[i:i + len(x)] += x * g
A2 = 110.0; tN = np.arange(N) / SR
drone = (np.sin(2 * np.pi * 55 * tN) * .6 + lp(signal.sawtooth(2 * np.pi * 110 * tN * (1 + .002 * np.sin(tN * .3))) * .3, 500)) * .35
sect = np.interp(tN, [0, 3.5, 4.2, 7.9, 14.3, 18.3, 26.5, 32.4, 35.0, 40.9, 42.6, 46.4, 47.0, 52], [.7, .9, .35, .2, .6, .8, .5, .3, .7, .9, 1, 1, .35, .35]); mus += drone * sect * .6
def pulses(t0, t1, bpm, g, f0=55):
    b = 60 / bpm; k = 0
    while t0 + k * b < t1: madd(thump(.35, f0 * 1.9, f0 * .7, .1) * 1.2, t0 + k * b, g * (1 if k % 4 == 0 else .75)); k += 1
pulses(0, 3.5, 96, .5); pulses(14.4, 18.2, 90, .45); pulses(18.6, 26.4, 100, .45); pulses(36.3, 40.85, 110, .5); pulses(40.85, 42.3, 168, .75); pulses(42.65, 46.4, 176, .85)
for tb in np.arange(42.65, 46.4, 60 / 176 / 2): madd(hp(noise(.05), 6500) * env_ad(int(.05 * SR), .0005, .012) * .6, tb, .5)
tp = EV['tiptoe0']; kk = 0; walk = [A2, A2 * 1.2599, A2 * 1.1892, A2 * 1.4983]
while tp < EV['ring_on'] - .1: madd(pluck(walk[kk % 4], .22), tp, .32); tp += .375; kk += 1
for ft, gg in ((EV['crash_in'], .9), (EV['clock'], .6), (20.62, .8), (EV['door_slam'], .5), (EV['cab_reach'], .35), (ro, .7), (EV['ll_door'], 1.0), (gb, 1.0), (EV['kick'] + .05, 1.0)): madd(thump(1.2, 90, 30, .3) * 1.3 + lp(noise(1.2), 600) * env_ad(int(1.2 * SR), .002, .3) * .3, ft, gg * .7)
madd(lp(sum(note(f, 4.0, .6, 1.4) for f in (A2, A2 * 1.2599, A2 * 1.4983)), 1500), ST['end2'] + .3, .25)
duck = 1 - .55 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 4, 1), 0, 1); mus *= duck; BUS['mus'][0] += mus * .5; BUS['mus'][1] += mus * .5
# ------------------------------------------------------------------ master
GS, GA, GR, GM = .2, .5, .18, .75
mix = BUS['vo'] + (BUS['sfx'] * GS + BUS['amb'] * GA + BUS['rev'] * GR) * (1 - .4 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 6, 1), 0, 1)) + BUS['mus'] * GM
dips = np.ones(N)
for te, dep in ((EV['glass'], .25), (EV['grab'], .2), (EV['cab_reach'], .45), (EV['crash_in'], .5), (EV['ll_door'], .3)): dips[int((te - .24) * SR):int((te - .06) * SR)] = dep
dips = np.clip(lp(dips, 40, 1), 0, 1); mix = mix * dips
fz = np.ones(N); fz[int((EV['grab'] + .4) * SR):int(ST['end2'] * SR)] = .35; mix = mix * np.clip(lp(fz, 20, 1), 0, 1)    # freeze-frame: world goes quiet
mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
from scipy import ndimage
spk = VOENV > .02
for nm, b, gg in (('sfx', BUS['sfx'], GS), ('amb', BUS['amb'], GA), ('mus', BUS['mus'], GM)):
    print('  under speech', nm, round(float(20 * np.log10(np.sqrt(np.mean((b[:, spk] * gg) ** 2)) / np.sqrt(np.mean(BUS['vo'][:, spk] ** 2)) + 1e-9)), 1), 'dB re vo')
act = mix[:, np.abs(mix).max(0) > 1e-3]; mix = mix * (.13 / np.sqrt(np.mean(act ** 2)))
pk = np.abs(mix).max(0); need = np.minimum(1.0, .92 / np.maximum(pk, 1e-9)); g = ndimage.minimum_filter1d(need, int(.003 * SR), mode='nearest'); g = ndimage.uniform_filter1d(g, int(.004 * SR)); rel = g.copy()
for i in range(1, len(rel)): rel[i] = min(1.0, max(g[i], rel[i - 1] + (1 - rel[i - 1]) / (.12 * SR))) if g[i] >= rel[i - 1] else g[i]
mix = np.tanh(mix * rel / .95) * .95
sf.write('mix_ep2b_raw.wav', mix.T.astype(np.float32), SR); print('written', float(np.max(np.abs(mix))))
