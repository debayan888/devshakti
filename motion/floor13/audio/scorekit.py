# scorekit.py - FLOOR 13 mood score + expressive voice + extra foley, all code-made (numpy/scipy), reusable by every mix_epN.py.
# Usage inside a mix script (after its header defined SR, N, put, BUS):   from scorekit import *   then call the builders with put().
import numpy as np
from scipy import signal
SR = 48000
_rng = np.random.default_rng(77)
def _t(d): return np.arange(int(d * SR)) / SR
def _n(d): return _rng.standard_normal(int(d * SR))
def _sos(kind, fc, o=2): return signal.butter(o, fc, kind, fs=SR, output='sos')
def _lp(x, fc, o=2): return signal.sosfilt(_sos('lowpass', min(fc, SR / 2 - 100), o), x)
def _hp(x, fc, o=2): return signal.sosfilt(_sos('highpass', fc, o), x)
def _bp(x, lo, hi, o=2): return signal.sosfilt(_sos('bandpass', [lo, min(hi, SR / 2 - 100)], o), x)
def _env(n, a, r): t = np.arange(n) / SR; d = n / SR; return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, (d - t) / max(r, 1e-4))
def _ad(n, a=.005, d=.2): t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def _saw(f, d, det=.006, v=3):
    t = _t(d); return sum(signal.sawtooth(2 * np.pi * f * (1 + det * (k - (v - 1) / 2)) * t + k) for k in range(v)) / v
# ------------------------------------------------------------------ music
def pad(notes, d, cut=900, trem=0.0, a=1.5, r=2.0, g=.2):                    # detuned saw pad, slow filter, optional tremolo
    x = sum(_saw(mtof(m), d) for m in notes) / len(notes); x = _lp(x, cut, 2)
    if trem: x *= 1 - trem * (.5 + .5 * np.sin(2 * np.pi * 6.5 * _t(d)))
    return x * _env(len(x), a, r) * g
def drone(m, d, g=.25):                                                     # low sine + sub growl
    t = _t(d); x = np.sin(2 * np.pi * mtof(m) * t) + .4 * _lp(signal.sawtooth(2 * np.pi * mtof(m) * t * 1.003), 400); return x * _env(len(x), 1.5, 2.0) * g
def pulse(m, bpm, d, g=.3, dec=.12):                                        # low synth pulse on every beat (tension heartbeat)
    out = np.zeros(int(d * SR)); step = 60 / bpm; t = 0
    while t < d - .05:
        n = int(.4 * SR); s = _lp(signal.sawtooth(2 * np.pi * mtof(m) * _t(.4)), 300) * _ad(n, .004, dec); i = int(t * SR); m_ = min(n, len(out) - i); out[i:i + m_] += s[:m_]; t += step
    return out * g
def plucks(seq, bpm, d, g=.22, octave=0):                                   # stealth pizzicato: seq of midi notes (None = rest), 8th notes
    out = np.zeros(int(d * SR)); step = 30 / bpm; t = 0; k = 0
    while t < d - .1:
        m = seq[k % len(seq)]; k += 1
        if m is not None:
            f = mtof(m + 12 * octave); n = int(.35 * SR); tt = _t(.35); s = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * _ad(n, .002, .07)
            i = int(t * SR); m_ = min(n, len(out) - i); out[i:i + m_] += s[:m_]
        t += step
    return out * g
def tick(d, bpm=120, g=.25):                                                # clock tick (countdown pressure)
    out = np.zeros(int(d * SR)); t = 0; k = 0
    while t < d:
        n = int(.03 * SR); s = _hp(_n(.03), 3000) * _ad(n, .0003, .006) * (1 if k % 2 == 0 else .6); i = int(t * SR); m_ = min(n, len(out) - i); out[i:i + m_] += s[:m_]; t += 60 / bpm; k += 1
    return out * g
def braam(m=33, d=2.6, g=.6):                                               # huge low brass hit
    t = _t(d); x = sum(_lp(signal.sawtooth(2 * np.pi * mtof(m + o) * t * (1 + .004 * k)), 700 + 900 * np.exp(-t[0] / .3)) for k, o in enumerate((0, 12, 7, 0)))
    x = _lp(x, 900) * _ad(len(t), .02, .9) + np.sin(2 * np.pi * mtof(m - 12) * t) * _ad(len(t), .01, 1.2) * .8; return np.tanh(x * 1.4) * g
def taiko(g=.8):
    t = _t(.9); x = np.sin(2 * np.pi * (55 + 80 * np.exp(-t / .03)) * t) * _ad(len(t), .001, .25) + _lp(_n(.9), 900) * _ad(len(t), .001, .05) * .5; return x * g
def hat(g=.2): n = int(.05 * SR); return _hp(_n(.05), 7000) * _ad(n, .0003, .015) * g
def stinger(g=.6):                                                          # dissonant cluster hit + high scrape
    t = _t(2.2); x = sum(np.sin(2 * np.pi * mtof(m) * t) for m in (61, 62, 68, 73, 74)) / 5 * _ad(len(t), .005, .7)
    x += _bp(_n(2.2), 2500, 7000) * _ad(len(t), .01, .4) * .4; tk = taiko(.8); x[:len(tk)] += tk
    return x * g
def rev_swell(d=1.2, g=.35):                                                # reverse-cymbal swell INTO a hit (place so it ends on the hit)
    n = int(d * SR); x = _hp(_n(d), 3000) * (np.arange(n) / n) ** 3; return x * g
def chase(d, bpm=168, root=45, g=.5):                                       # chase cue: 16th staccato strings + toms + hats
    out = np.zeros(int(d * SR)); s16 = 15 / bpm; scale = [0, 3, 5, 7, 8, 7, 5, 3]; t = 0; k = 0
    while t < d - .05:
        f = mtof(root + 12 + scale[(k // 2) % 8]); n = int(s16 * SR * .9); tt = _t(n / SR); s = _lp(signal.sawtooth(2 * np.pi * f * tt), 2500) * _ad(n, .002, .05) * .35
        i = int(t * SR); m_ = min(n, len(out) - i); out[i:i + m_] += s[:m_]
        if k % 4 == 0: tk = taiko(.55); m2 = min(len(tk), len(out) - i); out[i:i + m2] += tk[:m2]
        if k % 2 == 1: h = hat(.18); m2 = min(len(h), len(out) - i); out[i:i + m2] += h[:m2]
        t += s16; k += 1
    return out * g
def musicbox(notes, start_gap=.42, g=.18):
    out = np.zeros(int((len(notes) * start_gap + 1.5) * SR))
    for i, m in enumerate(notes):
        t = _t(1.2); f = mtof(m); s = sum(np.sin(2 * np.pi * f * r * t) * a * np.exp(-t / (1.2 * dd)) for r, a, dd in ((1, 1, .5), (2.76, .3, .25), (5.4, .12, .15)))
        j = int(i * start_gap * SR); out[j:j + len(s)] += s[:len(out) - j]
    return out * g
def tinnitus(d=2.5, g=.08): t = _t(d); return np.sin(2 * np.pi * 4200 * t) * np.exp(-t / 1.2) * g
# ------------------------------------------------------------------ foley
def flies(d, g=.05):                                                        # buzzing flies (rot)
    t = _t(d); f = 220 + 30 * np.sin(2 * np.pi * .7 * t) + 20 * np.sin(2 * np.pi * 1.9 * t + 1)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (.6 + .4 * np.sin(2 * np.pi * .23 * t) ** 2); return _bp(x, 180, 2000) * g
def floor_creak(g=.3, f0=None):
    d = .45; t = _t(d); f0 = f0 or _rng.uniform(180, 320); f = f0 * (1 + .25 * np.sin(2 * np.pi * 3 * t)); x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (np.sin(2 * np.pi * 38 * t) > 0)
    return _bp(x, 200, 1600) * _env(len(t), .03, .2) * g
def wet_breath(d, g=.15):                                                   # gurgling, rattling breath
    t = _t(d); x = _lp(_n(d), 500) * (np.sin(2 * np.pi * .45 * t) > .2) + _bp(_n(d), 300, 900) * (.5 + .5 * np.sin(2 * np.pi * 23 * t)) * (np.sin(2 * np.pi * .45 * t) > .5) * .6
    return x * g
def growl(d=1.0, f0=70, g=.5):
    t = _t(d); f = f0 * (1 + .08 * np.sin(2 * np.pi * 7 * t)); x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) + _lp(_n(d), 600) * .8
    x = _bp(np.tanh(x * 2), 80, 1500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 9 * t))); return x * _env(len(t), .05, .3) * g
def snarl(g=.6): return growl(.7, 95, g) + _bp(_n(.7), 1500, 5000) * _ad(int(.7 * SR), .01, .2) * .3 * g
def keys_rattle(d=.5, g=.4):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 18)):
        f0 = _rng.uniform(2200, 4200); n = int(.12 * SR); s = np.sin(2 * np.pi * f0 * _t(.12)) * _ad(n, .0005, .03) + _hp(_n(.12), 4000) * _ad(n, .0003, .006) * .4
        i = int(_rng.uniform(0, d - .12) * SR); out[i:i + n] += s
    return out * g
def lock_ratchet(g=.4):
    out = np.zeros(int(.5 * SR))
    for k in range(5): n = int(.04 * SR); s = _hp(_n(.04), 2500) * _ad(n, .0003, .008); i = int(k * .07 * SR); out[i:i + n] += s * (1 - k * .12)
    return out * g
def shards(d=1.6, g=.4):                                                    # glass shards tinkling down after a smash
    out = np.zeros(int(d * SR))
    for k in range(26):
        f0 = _rng.uniform(2500, 7500); n = int(.25 * SR); s = np.sin(2 * np.pi * f0 * _t(.25)) * _ad(n, .0005, .05)
        i = int((_rng.uniform(0, 1) ** 1.6) * (d - .25) * SR); out[i:i + n] += s * _rng.uniform(.3, 1)
    return out * g
def glass_stress(d=2.0, g=.2):                                             # glass groaning under weight
    t = _t(d); f = 900 + 400 * np.sin(2 * np.pi * .5 * t); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (_lp(np.abs(_n(d)), 8) * 3); return _bp(x, 500, 3000) * _env(len(t), .3, .5) * g
def flesh(g=.5):                                                           # wet tear / squelch
    n = int(.35 * SR); x = _lp(_n(.35), 1800) * _ad(n, .002, .08) * (1 + np.sin(2 * np.pi * 40 * _t(.35))) + _bp(_n(.35), 300, 900) * _ad(n, .01, .12)
    return x * g
def rip(g=.5): n = int(.4 * SR); return _bp(_n(.4), 1500, 7000) * _ad(n, .002, .12) * (1 + .8 * np.sin(2 * np.pi * 60 * _t(.4))) * g
def scuffle(d=.6, g=.4): n = int(d * SR); return _bp(_n(d), 300, 2500) * np.abs(np.sin(2 * np.pi * 7 * _t(d))) * _env(n, .02, .1) * g
def gasp(g=.5): n = int(.35 * SR); t = _t(.35); return _bp(_n(.35), 900, 4500) * np.sin(np.pi * t / .35) ** .6 * (1 + .3 * np.sin(2 * np.pi * 30 * t)) * g
def pant(d, rate=1.8, g=.3): t = _t(d); return _bp(_n(d), 500, 3500) * (np.sin(2 * np.pi * rate * t) * .5 + .5) ** 2 * g
def drip(g=.25): n = int(.12 * SR); t = _t(.12); return np.sin(2 * np.pi * (900 + 1500 * np.exp(-t / .01)) * t) * _ad(n, .0005, .03) * g
# ------------------------------------------------------------------ expressive voice (applied to Kokoro lines)
def resample(x, ratio):                                                    # >1 = higher + faster
    idx = np.arange(0, len(x) - 1, ratio); return np.interp(idx, np.arange(len(x)), x)
def env_follow(x, ms=12): k = max(1, int(SR * ms / 1000)); return np.sqrt(np.convolve(x ** 2, np.ones(k) / k, 'same'))
def whisper(x, amt=.75):                                                    # breathy: noise shaped by the voice's own envelope + filtered voice
    e = env_follow(x); nz = _bp(_n(len(x) / SR), 1200, 7000) * e * 2.2
    v = _hp(x, 900) * (1 - amt) + _bp(x, 1500, 6000) * .3; y = v + nz * amt; return y / (np.max(np.abs(y)) + 1e-9) * .8
def fear(x, depth=.18, rate=7.0, pitch=1.03):                               # shaky: tremolo + slightly higher
    y = resample(x, pitch); t = np.arange(len(y)) / SR; y = y * (1 - depth * (.5 + .5 * np.sin(2 * np.pi * rate * t))); return y
def shout(x, drive=3.0, pitch=1.04):                                        # strained, louder, a bit higher
    y = resample(x, pitch); y = np.tanh(_hp(y, 200) * drive); y = y + _bp(y, 2000, 4000) * .4; return y / (np.max(np.abs(y)) + 1e-9) * .95
def pain(x, pitch=.9, drive=4.0):
    y = resample(x, pitch); y = np.tanh(y * drive) + _bp(_n(len(y) / SR), 800, 3000) * env_follow(y) * 1.2; return y / (np.max(np.abs(y)) + 1e-9) * .95
def tired(x, pitch=.97): return resample(x, pitch) * .9
