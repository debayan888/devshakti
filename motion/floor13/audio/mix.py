# mix.py - FLOOR 13 ep1: free, code-made sound design + Kokoro voice. Run: python3 -I mix.py
import numpy as np, soundfile as sf, json
SR = 48000; N = int(45 * SR); rng = np.random.default_rng(13)
L = np.zeros(N); R = np.zeros(N)
def put(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); sig = sig[:max(0, N - i)]; 
    if i < 0 or len(sig) == 0: return
    L[i:i+len(sig)] += sig * g * (1 - max(0, pan)); R[i:i+len(sig)] += sig * g * (1 + min(0, pan))
def env(n, a=.005, d=.2): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def lp(x, fc):                       # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0
    for k in range(len(x)): s = a * s + (1 - a) * x[k]; y[k] = s
    return y
def noise(d): return rng.standard_normal(int(d * SR))
def thump(d=.35, f0=90, g=1): t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * (f0 * np.exp(-t * 9) + 28) * t) * env(len(t), .002, d / 4) * g
def bang(): n = int(.5 * SR); return (thump(.5, 110) * .9 + lp(noise(.5), 1800) * env(n, .001, .06) * .6)
def groan(d=1.6, f=95, seed=0):
    t = np.arange(int(d * SR)) / SR; fm = f * (1 + .25 * np.sin(2 * np.pi * (.7 + seed * .13) * t) + .35 * np.exp(-t) * 0 - .15 * t / d)
    ph = 2 * np.pi * np.cumsum(fm) / SR; s = np.sign(np.sin(ph)) * .4 + np.sin(ph) * .6
    s = lp(s * (1 + .3 * noise(d)), 700 + 500 * seed); return s * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
def whoosh(d=.5, g=1): n = int(d * SR); t = np.arange(n) / SR; return lp(noise(d), 3000) * np.sin(np.pi * t / d) ** 2 * g
def creak(d=.7, f=380): t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * (f + 90 * np.sin(2 * np.pi * 7 * t) + 160 * t) * t) * np.sin(np.pi * t / d) * (.5 + .5 * noise(d) * .1) * .25
def glass(): n = int(1.0 * SR); s = np.zeros(n)
def glass():
    n = int(1.1 * SR); s = noise(1.1) - lp(noise(1.1), 2500); s *= env(n, .001, .18)
    for k in range(18): j = int(rng.uniform(.03, .8) * SR); m = min(2400, n - j); s[j:j+m] += np.sin(2*np.pi*rng.uniform(2500, 7000)*np.arange(m)/SR) * np.exp(-np.arange(m)/(SR*.01)) * .5
    return s
def sting(f=466): t = np.arange(int(1.6 * SR)) / SR; return sum(np.sin(2*np.pi*f*r*t + np.sin(t*9)*.2) for r in (1, 1.0595, 1.5, 2.01)) * env(len(t), .01, .6) * .18
def heart(): return thump(.22, 70, 1) + np.pad(thump(.18, 62, .7), (int(.19 * SR), 0))[:int(.4 * SR)] * 0 

# ---- voice
vo_t = [0.3, 2.8, 8.2, 14.5, 22.5, 33.0, 41.6]
for i, t in enumerate(vo_t):
    d, sr = sf.read(f'vo/l{i}.wav'); d = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d)
    d = d / np.max(np.abs(d)) * .95; put(d, t, 1.0)
# ---- music bed: A-minor drone, slow pulse, tension riser into the end
t = np.arange(N) / SR; bed = (np.sin(2*np.pi*55*t) * .5 + np.sin(2*np.pi*82.4*t + np.sin(t*.4)) * .3 + np.sin(2*np.pi*110.2*t) * .15 * (1 + np.sin(t * .8))) * .13
pulse = np.zeros(N); 
for b in np.arange(0, 44.5, 60 / 84):
    th = thump(.3, 60, .22); i0 = int(b * SR); pulse[i0:i0+len(th)] += th[:N-i0]
rise = lp(noise(45), 1500 + 0 ) * np.clip((t - 24) / 14, 0, 1) ** 2 * .05 * (t < 41)
bed = (bed + pulse * .55 + rise) * np.clip(t / 1.5, 0, 1) * np.clip((45 - t) / 3, 0, 1)
duck = np.ones(N)
for i, s0 in enumerate(vo_t): a = int(s0 * SR); b = a + int((sf.info(f'vo/l{i}.wav').duration + .3) * SR); duck[a:b] = .5
duck = lp(duck, 6); L += bed * duck; R += bed * duck
# ---- events (seconds = frame / 60)
for f in (14, 56, 96): put(bang() * .7, f / 60, .9)
for f in range(0, 120, 36): put(thump(.25, 66), f / 60 + .2, .8)                      # heartbeat under the hook
for i, f in enumerate((150, 165, 180, 195, 215, 230, 245)): put(groan(1.8, 80 + 9 * (i % 4), i % 3), f / 60, .5, [-.6, .6, -.3, .4][i % 4])
put(whoosh(.7, .5), 125 / 60, .7)                                                      # pull-out
put(sting(), 9.3, .8); put(groan(1.2, 140, 2), 9.4, .9)
put(bang() * 1.3, 603 / 60, 1.0); put(sting(311), 603 / 60, .6)                         # smash cut
for f in (640, 680, 730, 780): put(bang(), f / 60, .85)
for i in range(6): put(lp(noise(.3), 2500) * env(int(.3 * SR), .01, .08) * .5, (860 + i * 70) / 60, .7); 
put(sting(233) * .6, 1010 / 60, .5)
put(whoosh(.5, 1), 1330 / 60, .6); put(creak(.9, 300), 1380 / 60, 1)                   # out the window
w = lp(noise(12), 900) * np.sin(np.linspace(0, np.pi, int(12 * SR))) ** .5 * .5; put(w, 23.0, .7)
for f in (1470, 1560, 1650, 1780, 1860): put(creak(.6, 340 + (f % 90)), f / 60, .7)
put(thump(.5, 60) * 1.2, 1700 / 60, .8); put(thump(.5, 60) * 1.2, 1930 / 60, .8)       # floor counter ticks
put(groan(2.2, 90, 1), 34.0, .6, .5); put(creak(1.2, 280), 2150 / 60, 1.0)
put(whoosh(.35, 1), 2150 / 60, .9); put(thump(.4, 80) * 1.3, 2170 / 60, .9)             # hand grabs
for f in range(2210, 2410, 22): put(creak(.3, 420 + (f % 5) * 40), f / 60, .5 + (f - 2210) / 400)
put(np.pad(lp(noise(.12), 5000), (0, 0)) * env(int(.12 * SR), .001, .03) * 1.4, 2412 / 60, 1.0)  # snap
put(glass(), 2475 / 60, 1.0); put(whoosh(1.0, .8), 2412 / 60, .8)
put(thump(1.2, 50) * 1.6, 2480 / 60, 1.0); put(sting(233) * 1.2, 2480 / 60, .9)
put(sting(220) * .9, 2560 / 60, .6)
m = float(np.sqrt((L**2 + R**2).mean() / 2)); g = .13 / m
out = np.tanh(np.stack([L, R], 1) * g * 1.1) * .75; sf.write('mix.wav', out, SR); print('mix ok peak', m, 'rms', float(np.sqrt((out**2).mean())))
