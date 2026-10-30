# mix2.py - FLOOR 13 ep.1 v2 sound design: processed Kokoro voice + code-made foley/SFX/music, locked to ../engine/timeline.json.
# Run from audio/:  python3 -I mix2.py   -> mix2.wav (then loudness-normalised with ffmpeg in build.sh)
import json, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; FPS = 60; TOT = 45.0; N = int(TOT * SR)
rng = np.random.default_rng(13)
TL = json.load(open('../engine_ep3/timeline.json')); SH = TL['shots']; LINES = {l['id']: l for l in TL['lines']}
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


# ------------------------------------------------------------------ voice
def radio_process(x): x = bp(x, 450, 3000, 3); x = np.tanh(x * 3.5); return x / (np.max(np.abs(x)) + 1e-9) * .85
for l in TL['lines']:
    lid = l['id']; d, sr = sf.read(f'vo5/{lid}.wav'); x = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d); t0 = l['t0'] / FPS
    if lid == 'mira': y = radio_process(x); y = y + bp(noise(len(y) / SR), 2000, 6000) * .04; put('vo', y, t0, .85, -.2, 'room', .15); continue
    x = vo_process(x); where = 'out' if t0 < 26.6 and not (17.6 <= t0 < 19.6) else 'room'
    put('vo', x, t0, 1.0, 0.0, where, .2 if where == 'out' else .12)
VOENV = np.sqrt(np.maximum(1e-9, signal.fftconvolve(BUS['vo'][0] ** 2, np.ones(int(.06 * SR)) / int(.06 * SR))[:N]))
SH = TL['shots']; ST = {k: v[0] / FPS for k, v in SH.items()}
def steps_between(t0, t1, per, kind, g, pan=0, rev=None, jitter=.01):
    t = t0
    while t < t1: put('sfx', footstep(kind, 1), t, g * rng.uniform(.85, 1.1), pan, rev, .12); t += per + rng.uniform(-jitter, jitter)
# exterior
put('amb', wind(17.8, .75, 200, 1400), 0, 1); put('amb', wind(7.2, .8, 200, 1600), 19.5, 1)
put('sfx', whoosh(.9, 400, 5000, 1.0, False), EV['dive'], .7); put('sfx', S(impact(1.0, 1.0), creak(.6, 400, 1.0), (np.sin(2 * np.pi * 160 * tt(.8)) * np.exp(-tt(.8) / .25)) * .5), EV['jerk'], .9, -.2, 'out', .25)
for kk in range(6): put('sfx', creak(.3, 450 + 40 * kk, .8), 1.6 + kk * .7, .4 * (1 - kk / 7), -.2, 'out', .1)
put('sfx', zvoice(5, -5, 1.0), .5, .5, -.3, 'out', .4); put('sfx', zvoice(1, -6, 1.0), 8.7, .55, -.3, 'out', .4); put('sfx', S(creak(.8, 380, 1.0), cloth(.5, .8)), EV['ll_out'], .6, -.3, 'out', .2)
for kk in range(4): put('sfx', heart(.9), 9.0 + kk * .6, .5)
put('sfx', S(hp(noise(6.0), 1200) * .25 * (.5 + .5 * np.abs(np.sin(tt(6.0) * 30)))), EV['slide0'], .35, -.2)     # hands sliding on the hose (friction hiss)
for kk in range(3): put('sfx', S(hp(noise(.4), 2500) * env_ad(int(.4 * SR), .01, .15)), 11.6 + kk * 1.5, .35)       # sizzle
put('sfx', S(hp(noise(6.0), 900) * .3), EV['slide0'] + .3, .3, -.3)                                                 # landlord sliding
put('sfx', riser(3.5, 120, 1500, .9), 13.9, .5); for_ = 0
for kk in range(6): put('sfx', heart(1.0), 14.5 + kk * .45, .6 + .05 * kk)
# valve insert
put('amb', lp(noise(2.0), 300) * .05, ST['valve'], 1); steps_between(17.6, EV['valve_spin'] - .1, .25, 'carpet', .4, .3, 'hall')
put('sfx', S(creak(1.0, 900, 1.0), thump(.3, 120, 60)), EV['valve_spin'], .75, 0, 'hall', .2); put('sfx', zvoice(3, -6, 1.0), EV['valve_spin'] + .1, .4, .3, 'hall', .3)
put('sfx', S(lp(noise(1.3), 600) * np.minimum(tt(1.3) / .5, 1) * .7), EV['valve_spin'] + .5, .7, 0, 'hall', .3)   # glug
# water arrives
put('sfx', S(lp(noise(.9), 500) * np.sin(np.pi * tt(.9) / .9) * 1.0, thump(.6, 60, 35)), EV['water_in'], .8, -.2, 'out', .2)
put('sfx', S(hp(noise(1.6), 600) * env_ad(int(1.6 * SR), .01, .9) * 1.2, whoosh(.6, 300, 6000, 1.0)), EV['spray'], .9, 0, 'out', .25)
t = EV['spray']
while t < 26.6: put('sfx', hp(noise(.5), 700) * np.sin(np.pi * tt(.5) / .5) * .6, t, .45, rng.uniform(-.4, .4)); t += .4
put('sfx', S(cloth(.3, 1.0), click(.6)), EV['grab_noz'], .6)
put('sfx', S(impact(1.2, 1.1), hp(noise(1.0), 800) * env_ad(int(1.0 * SR), .002, .3) * 1.2), EV['blast'], 1.0, 0, 'out', .3); put('sfx', zvoice(5, -4, 1.2), EV['blast'] + .05, .75, -.4, 'out', .4)
put('sfx', whoosh(1.6, 2500, 300, 1.0, False), EV['blast'] + .2, .5, -.3); put('sfx', S(thump(.6, 60, 30) * .4), EV['blast'] + 2.6, .25, -.2, 'out', .6)
put('sfx', whoosh(1.4, 300, 4000, 1.0), 25.4, .55, .2); put('sfx', riser(1.4, 150, 2500, 1.0), 25.2, .5)
# gym
put('sfx', S(impact(1.2, 1.1), glass(1.2, 1.0)), EV['slam7'], 1.0, -.2, 'room', .3); put('sfx', S(thump(.5, 70, 35) * 1.2, cloth(.4, .8)), EV['land7'], .8, -.3, 'room', .2); put('sfx', oof(1.0), EV['land7'] + .1, .7, -.3)
put('sfx', S(lp(signal.sawtooth(2 * np.pi * 70 * tt(13.0)) * .25, 500) * .6 + bp(noise(13.0), 300, 1200) * .15), 26.7, .35, -.05, 'room', .15)      # the empty treadmill's motor
t = 26.8
while t < 39.8: put('sfx', S(thump(.08, 300, 200) * .3), t, .12, -.05); t += .32                                                               # belt slats ticking
for kk in range(4): put('sfx', S(click(.8), hp(noise(.1), 2000) * env_ad(int(.1 * SR), .001, .03) * .6), EV['lights'] + kk * .12, .5, .1)
put('sfx', np.sin(2 * np.pi * 120 * tt(10.0)) * .02, EV['lights'] + .5, .5)
steps_between(30.2, 31.0, .3, 'wood', .45, 0, 'room')
for kk in range(6): put('sfx', S(wood_hit(.6) * .4, glass(.4, .35)), EV['bang'] + kk * .567, .55, .5, 'room', .2)
put('sfx', S(horde(2.4, 3, 1.0, 88)), EV['bang'] + .1, .55, .5, 'room', .3); put('sfx', inhale(.4, 1.0), EV['bang'] + .05, .5)
put('sfx', S(riser(.9, 100, 700, .6)), EV['mirror_t'] - .4, .45); put('sfx', S(impact(.9, .8), (np.sin(2 * np.pi * 1975 * tt(1.6)) * np.exp(-tt(1.6) / .5)) * .3), EV['mirror_t'], .55)
for kk in range(3): put('sfx', heart(1.0), 33.6 + kk * .6, .55)
steps_between(35.6, 36.2, .28, 'wood', .45, -.2, 'room')
put('sfx', S(bp(noise(.5), 1500, 5000) * env_ad(int(.5 * SR), .005, .2) * .6, click(.6)), EV['walkie'], .7, -.3)
put('sfx', S(cloth(.3, .8), click(.5)), EV['pickup'], .5, -.3); put('sfx', S(bp(noise(.3), 1500, 5000) * env_ad(int(.3 * SR), .005, .1) * .5), 38.95, .5, -.2)
put('sfx', S(impact(.9, .8), riser(.4, 300, 2000, .5)), EV['look'], .5)
e3 = ST['end3']; put('sfx', impact(1.4, 1.0), e3 + .05, .7); put('sfx', ding(880, 2.2, .8), e3 + .35, .5, 0, 'room', .3)
# music
def note(f, d, a=.01, r=.2, det=.004):
    t = tt(d); ph = 2 * np.pi * f * t; s_ = (signal.sawtooth(ph) + signal.sawtooth(ph * (1 + det)) + signal.sawtooth(ph * (1 - det))) / 3; return s_ * np.minimum(t / a, 1) * np.minimum((d - t) / r, 1)
mus = np.zeros(N)
def madd(x, t, g=1.0):
    i = int(t * SR)
    if i < N: x = x[:N - i]; mus[i:i + len(x)] += x * g
A2 = 110.0; tN = np.arange(N) / SR
drone = (np.sin(2 * np.pi * 55 * tN) * .6 + lp(signal.sawtooth(2 * np.pi * 110 * tN * (1 + .002 * np.sin(tN * .3))) * .3, 500)) * .35
sect = np.interp(tN, [0, 6, 11.4, 17.4, 17.6, 19.6, 22.4, 23.2, 24.6, 26.6, 29.6, 33.0, 35.2, 39.9, 45], [.8, .6, .8, 1, .4, .8, 1, .3, .8, .5, .4, .8, .7, .35, .35]); mus += drone * sect * .6
def pulses(t0, t1, bpm, g, f0=55):
    b = 60 / bpm; k = 0
    while t0 + k * b < t1: madd(thump(.35, f0 * 1.9, f0 * .7, .1) * 1.2, t0 + k * b, g * (1 if k % 4 == 0 else .75)); k += 1
pulses(0, 6, 100, .5); pulses(11.4, 17.4, 120, .55); pulses(19.6, 22.4, 140, .65); pulses(24.4, 26.6, 160, .75); pulses(31.2, 33.0, 100, .4)
for ft, gg in ((EV['jerk'], 1.0), (EV['valve_spin'], .5), (EV['blast'], 1.0), (EV['slam7'], 1.0), (EV['bang'], .6), (EV['mirror_t'], .8), (EV['look'], .6)): madd(thump(1.2, 90, 30, .3) * 1.3 + lp(noise(1.2), 600) * env_ad(int(1.2 * SR), .002, .3) * .3, ft, gg * .7)
madd(lp(sum(note(f, 4.0, .6, 1.4) for f in (A2, A2 * 1.2599, A2 * 1.4983)), 1500), e3 + .3, .25)
duck = 1 - .55 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 4, 1), 0, 1); mus *= duck; BUS['mus'][0] += mus * .5; BUS['mus'][1] += mus * .5
GS, GA, GR, GM = .2, .5, .18, .75
mix = BUS['vo'] + (BUS['sfx'] * GS + BUS['amb'] * GA + BUS['rev'] * GR) * (1 - .4 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 6, 1), 0, 1)) + BUS['mus'] * GM
dips = np.ones(N)
for te, dep in ((EV['blast'], .3), (EV['slam7'], .3), (EV['spray'], .45)): dips[int((te - .24) * SR):int((te - .06) * SR)] = dep
mix = mix * np.clip(lp(dips, 40, 1), 0, 1); mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
from scipy import ndimage
spk = VOENV > .02
for nm, b, gg in (('sfx', BUS['sfx'], GS), ('amb', BUS['amb'], GA), ('mus', BUS['mus'], GM)): print('  under speech', nm, round(float(20 * np.log10(np.sqrt(np.mean((b[:, spk] * gg) ** 2)) / np.sqrt(np.mean(BUS['vo'][:, spk] ** 2)) + 1e-9)), 1), 'dB re vo')
act = mix[:, np.abs(mix).max(0) > 1e-3]; mix = mix * (.13 / np.sqrt(np.mean(act ** 2)))
pk = np.abs(mix).max(0); need = np.minimum(1.0, .92 / np.maximum(pk, 1e-9)); g = ndimage.minimum_filter1d(need, int(.003 * SR), mode='nearest'); g = ndimage.uniform_filter1d(g, int(.004 * SR)); rel = g.copy()
for i in range(1, len(rel)): rel[i] = min(1.0, max(g[i], rel[i - 1] + (1 - rel[i - 1]) / (.12 * SR))) if g[i] >= rel[i - 1] else g[i]
mix = np.tanh(mix * rel / .95) * .95
sf.write('mix_ep3_raw.wav', mix.T.astype(np.float32), SR); print('written', float(np.max(np.abs(mix))))
