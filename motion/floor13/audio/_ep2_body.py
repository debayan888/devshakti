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

# ------------------------------------------------------------------ voice
for l in TL['lines']:
    lid = l['id']; d, sr = sf.read(f'vo3/{lid}.wav'); x = np.interp(np.arange(0, len(d), sr / SR), np.arange(len(d)), d); t0 = l['t0'] / FPS
    if lid in ('momA', 'momB'):
        x = phone_process(x); far = lid == 'momB'
        if far: x = lp(x, 2600) * .75
        put('vo', x, t0, .8 if not far else .6, -.55 if far else .1, 'hall', .4 if far else .2); continue
    x = vo_process(x)
    where = 'out' if t0 < 4.0 else ('room' if t0 < 10.5 or t0 > 38.5 else 'hall')
    put('vo', x, t0, 1.0, 0.0, where, .22 if where == 'out' else .12)
VOENV = np.sqrt(np.maximum(1e-9, signal.fftconvolve(BUS['vo'][0] ** 2, np.ones(int(.06 * SR)) / int(.06 * SR))[:N]))
SH = TL['shots']; ST = {k: v[0] / FPS for k, v in SH.items()}
def steps_between(t0, t1, per, kind, g, pan=0, rev=None, jitter=.01):
    t = t0
    while t < t1: put('sfx', footstep(kind, 1), t, g * rng.uniform(.85, 1.1), pan, rev, .12); t += per + rng.uniform(-jitter, jitter)

# ------------------------------------------------------------------ SWING (0 - 3.95): rope, wind, zombie above, the kick
put('amb', wind(4.2, .7, 200, 1300), 0, 1); put('sfx', horde(3.6, 3, .35, 90), .1, .4, .2, 'out', .4)
t = .7; k = 0
while t < 3.4: put('sfx', creak(.28, 480 + 30 * (k % 3), 1), t, .35 + .35 * min(1, t / 3), .1 * (-1) ** k, 'out', .1); t += .238; k += 1
for kk in range(4): put('sfx', heart(.9), 1.0 + kk * .8, .5 + .1 * kk)
put('sfx', cloth(.3, .9), 1.8, .4, .3)                                                 # zombie hand slaps the rope
put('sfx', riser(1.6, 150, 1800, .6), 1.9, .45)
put('sfx', whoosh(.3, 800, 5000, 1.0), EV['kick'] - .1, .8); put('sfx', S(impact(1.0, 1.0), glass(1.6, 1.0)), EV['kick'] + .02, 1.0, -.3, 'out', .3)
# ------------------------------------------------------------------ CRASH (3.95 - 6.95)
c0 = EV['crash_in']; put('sfx', whoosh(.5, 400, 6000, .9), c0 - .05, .8); put('sfx', S(impact(1.1, .9), glass(1.0, .6)), c0, .9, -.3, 'room', .3)
put('sfx', S(thump(.5, 70, 38) * 1.2, cloth(.5, .8)), EV['land'], .9, .3, 'room', .2); put('sfx', boing(.8), EV['land'] + .02, .6, .3); put('sfx', oof(1.0), EV['land'] + .12, .8, .3)
put('sfx', sparkle(.8), EV['land'] + .6, .5, .3); put('sfx', sparkle(.6), EV['land'] + 1.3, .35, .3)
put('sfx', glass(.9, .35), c0 + .5, .35, -.3, 'room', .3)                                    # shards still falling
put('sfx', cloth(.8, .8), 5.5, .5, .3); put('amb', lp(noise(3.5), 400) * .05, c0, 1)
put('sfx', horde(2.4, 5, .75, 80) * 0 + lp(horde(2.4, 5, .75, 80), 600) * 1.0, 6.4, .5, .6, 'room', .3)   # muffled groans beyond the door
# ------------------------------------------------------------------ PEEK (6.95 - 10.5)
steps_between(7.0, 7.75, .33, 'wood', .55, .2, 'room'); put('sfx', cloth(.4, .6), 7.7, .4, .3)
pe = EV['peep_open']; put('sfx', click(1.0), pe, .7, .3)
put('sfx', horde(3.0, 10, 1.0, 82) * .9 + lp(horde(3.0, 10, .8, 90), 1800) * 0, pe + .05, .7, 0, 'hall', .5)
put('sfx', zvoice(0, -7, 1.0), pe + .1, .45, -.3, 'hall', .4); put('sfx', zvoice(2, -8, 1.0), pe + .45, .4, .4, 'hall', .4)
js = ST['peek'] + (SH['peek'][1] - SH['peek'][0]) / FPS - .67
put('sfx', S(impact(.9, .8), riser(.3, 400, 2500, .6)), js, .8); put('sfx', zvoice(5, -4, 1.1), js, .6, 0, 'hall', .3); put('sfx', inhale(.35, 1.0), js + .15, .7); put('sfx', thump(.3, 90, 50) * .9, js + .35, .5, .3)
for kk in range(3): put('sfx', heart(.9), pe + .5 + kk * .7, .5)
# ------------------------------------------------------------------ PAN (10.5 - 15.6)
p0 = ST['pan']; put('amb', lp(noise(5.2), 300) * .05 + np.sin(2 * np.pi * 120 * tt(5.2)) * .01 * (1 + .3 * np.sin(tt(5.2) * 9)), p0, 1)
put('sfx', whoosh(1.7, 300, 3500, .9, True), p0, .45, -.2); put('sfx', S(ding(1318, 1.6, 1.0), click(.8)), EV['cab_reach'], 1.3, .1, 'hall', .3)
put('sfx', chime(.8), EV['cab_reach'] + .05, .45); put('sfx', S(ding(2400, .5, .9), ding(3100, .4, .5)), EV['hose_coil'] + .15, .6, .1)
put('sfx', cloth(.5, .6) * .6, EV['hose_coil'], .4); put('sfx', whoosh(.9, 300, 3000, .8, False), 14.6, .55, .2)
for tz in (11.0, 11.8, 12.1): put('sfx', zvoice(int(tz) % 6, -8, .8), tz, .22, rng.uniform(-.6, .6), 'hall', .5)
# ------------------------------------------------------------------ HALL: stealth
put('amb', lp(noise(23), 260) * .045 + np.sin(2 * np.pi * 120 * tt(23)) * .011, ST['hall'], 1)
for tr, tx in ((15.95, 1568), (18.85, 1568), (23.2, 1568)): put('sfx', S(click(.6), ding(tx, .35, .8)), tr, .35)
put('sfx', S(creak(1.2, 380, .8), click(.5)), EV['door_open'], .55, -.5, 'hall', .25)
steps_between(17.25, EV['crunch'] - .1, .395, 'carpet', .36, 0, 'hall'); 
for tz in (17.9, 18.7, 19.2): put('sfx', zvoice(int(tz * 3) % 6, -9, 1.0), tz, .16, rng.uniform(-.7, .7), 'hall', .5)
put('sfx', inhale(.3, .8), EV['hz1'] - .1, .35); put('sfx', S(cloth(.3, .7)), EV['hz1'], .3, 0); put('sfx', inhale(.3, .8), EV['hz2'] - .1, .35)
for kk in range(6): put('sfx', heart(.9), 18.6 + kk * .85, .35 + .05 * kk)
cr = EV['crunch']
put('sfx', S(crunch(.7, 1.7), impact(.5, .35), hp(noise(.5), 3000) * env_ad(int(.5 * SR), .001, .12) * .5), cr, .85, 0, 'hall', .3); put('sfx', buzzer(.5), cr + .05, .3)
for kk in range(5): put('sfx', snap_bone(1.0), cr + .1 + kk * .06, .35, rng.uniform(-.7, .7))
put('sfx', horde(1.8, 4, .9, 88), cr + .15, .5, 0, 'hall', .5); put('sfx', riser(1.7, 100, 600, .8), cr + .1, .4)
for kk in range(4): put('sfx', heart(.9), cr + .3 + kk * .45, .9)
put('sfx', inhale(.6, .9), EV['turn_back'], .5)
# ------------------------------------------------------------------ PHONE
po = EV['phone_out']; put('sfx', cloth(.7, 1.0), po - .1, .6); put('sfx', S(thump(.2, 120, 60), click(.4)), po + .5, .4); put('sfx', click(.5), 24.45, .4)
for tz in (24.0, 24.8): put('sfx', creak(.25, 1200, .5), tz, .25)
ro = EV['ring_on']; rt = ringtone(EV['answer'] - ro, 1.0); put('sfx', rt, ro, 1.15, 0, 'hall', .25)
put('sfx', S(horde(2.0, 8, 1.1, 90)), ro + .05, .85, 0, 'hall', .5)
for kk in range(7): put('sfx', snap_bone(1.0), ro + .05 + kk * .05, .4, rng.uniform(-.8, .8))
put('sfx', buzzer(.5), ro + .05, .3); put('sfx', gulp(1.0), 26.3, .5)
put('sfx', click(.6), 27.4, .4); put('sfx', click(.6), 27.68, .4)
put('sfx', S(click(1.0), pop(.8)), EV['answer'], .6)
# zombies close in while mom talks
t = 27.6
while t < 32.9: put('sfx', lp(noise(.35), 700) * env_ad(int(.35 * SR), .02, .12) * .5, t, .2 + .5 * min(1, (t - 27.6) / 4), rng.uniform(-.7, .7), 'hall', .1); t += max(.1, .42 - .07 * (t - 27.6))
put('sfx', horde(5.0, 7, .9, 86), 28.0, .35, 0, 'hall', .5); put('sfx', horde(3.5, 8, 1.0, 82), 30.0, .5, 0, 'hall', .5)
for kk in range(7): put('sfx', heart(.9), 28.6 + kk * .55, .35 + .05 * kk)
# ------------------------------------------------------------------ THROW, CHASE, HOSE
th = EV['throw']; put('sfx', whoosh(.5, 500, 4000, .9), th - .05, .55, -.2); put('sfx', cloth(.3, .7), th - .1, .4)
pl = EV['phone_land']; put('sfx', S(thump(.25, 150, 80), hp(noise(.35), 1200) * env_ad(int(.35 * SR), .001, .1) * .6, click(.8)), pl, .8, -.55, 'hall', .35)
put('sfx', zvoice(5, -3, 1.2), pl + .1, .65, -.2, 'hall', .35); put('sfx', horde(2.2, 8, 1.2, 84), pl + .1, .75, -.3, 'hall', .4)
t = pl + .05
while t < EV['crush']: put('sfx', S(thump(.2, 110, 55) * .8, lp(noise(.2), 800) * env_ad(int(.2 * SR), .002, .05) * .6), t, .5, rng.uniform(-.8, -.1), 'hall', .1); t += rng.uniform(.045, .09)
steps_between(32.5, 34.4, .175, 'carpet', .55, 0, 'hall', .005)
put('sfx', S(impact(1.0, 1.2), glass(1.3, 1.3)), EV['glass'], 1.3, .3, 'hall', .3); put('sfx', S(wood_hit(.5) * .5, buzzer(.2)), EV['glass'] - .03, .3, .3)
put('sfx', S(ding(900, .5, .7), creak(.3, 1500, .6)), EV['glass'] + .3, .5, .3); put('sfx', hose_drag(2.5, 1.0), EV['glass'] + .3, .6, .2, 'hall', .15)
cu = EV['crush']; put('sfx', S(crunch(.9, 1.3), zap(1.0), impact(.7, .7)), cu, .9, -.55, 'hall', .35)
# ------------------------------------------------------------------ SILENCE, HEADS TURN, CHARGE, DIVE
t = cu + .1
for kk in range(4): put('sfx', heart(1.0), 35.25 + kk * .7, .7)
put('sfx', cloth(.4, .5), 35.5, .3)
th2 = EV['turn_heads']
for kk in range(8): put('sfx', S(snap_bone(1.0), creak(.18, 900, .5)), th2 + kk * .08, .55, -.6 + .1 * kk, 'hall', .2)
put('sfx', horde(1.1, 6, .9, 80), th2 + .3, .45, -.4, 'hall', .5); put('sfx', riser(1.0, 100, 900, .9), th2 + .1, .5)
ch = EV['charge']; put('sfx', S(horde(2.0, 9, 1.3, 90)), ch, .95, -.2, 'hall', .4); put('sfx', S(impact(1.2, .9), whoosh(.5, 400, 3000, .8)), ch, .65)
t = ch
while t < EV['dive']: put('sfx', S(thump(.2, 120, 60) * 1.0, lp(noise(.2), 900) * env_ad(int(.2 * SR), .002, .04) * .6), t, .55 * min(1, .25 + (t - ch) * .9), -.6 + .8 * (t - ch) / (EV['dive'] - ch), 'hall', .1); t += rng.uniform(.05, .08)
steps_between(37.0, 37.5, .17, 'carpet', .55, .2, 'hall', .004); put('sfx', sash(.45, 1.0), 37.45, .6, .5); put('amb', wind(1.6, .9, 200, 1800), 37.6, 1)
put('sfx', S(hose_drag(.6, 1.0)), 37.5, .6, .3)
dv = EV['dive']; put('sfx', whoosh(.5, 600, 6000, 1.0), dv - .05, .9, .4); put('sfx', S((np.sin(2 * np.pi * 220 * tt(.7)) * np.exp(-tt(.7) / .25)) * .4, creak(.5, 900, .5)), dv, .5, .5)
put('sfx', whoosh(.25, 700, 5000, .9), dv + .12, .7, -.2); put('sfx', zvoice(5, -2, 1.3), dv + .1, .75, -.2, 'hall', .3)
# ------------------------------------------------------------------ END CARD
e2 = ST['end2']; put('sfx', S(impact(1.4, 1.0)), e2 + .05, .7); put('sfx', ding(880, 2.2, .8), e2 + .35, .5, 0, 'hall', .3); put('amb', wind(2.4, .4, 150, 500), e2 + .2, 1)

# ------------------------------------------------------------------ MUSIC
def note(f, d, wave='saw', a=.01, r=.2, det=.004):
    t = tt(d); ph = 2 * np.pi * f * t; s = (signal.sawtooth(ph) + signal.sawtooth(ph * (1 + det)) + signal.sawtooth(ph * (1 - det))) / 3
    return s * np.minimum(t / a, 1) * np.minimum((d - t) / r, 1)
def pluck(f, d=.3): t = tt(d); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t) + .2 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t / .11) * np.minimum(t / .003, 1)
mus = np.zeros(N)
def madd(x, t, g=1.0):
    i = int(t * SR)
    if i < N: x = x[:N - i]; mus[i:i + len(x)] += x * g
A2 = 110.0; tN = np.arange(N) / SR
drone = (np.sin(2 * np.pi * 55 * tN) * .6 + lp(signal.sawtooth(2 * np.pi * 110 * tN * (1 + .002 * np.sin(tN * .3))) * .3, 500)) * .35
sect = np.interp(tN, [0, 3.5, 4.2, 10.5, 15.5, 21.0, 22.0, 23.2, 33.0, 35.1, 36.0, 38.4, 39.0, 44.5], [.7, .9, .35, .6, .5, .15, .6, .5, .9, .1, .1, 1, .35, .35])
mus += drone * sect * .6
def pulses(t0, t1, bpm, g, f0=55):
    b = 60 / bpm; k = 0
    while t0 + k * b < t1: madd(thump(.35, f0 * 1.9, f0 * .7, .1) * 1.2, t0 + k * b, g * (1 if k % 4 == 0 else .75)); k += 1
pulses(0, 3.5, 96, .5); pulses(10.5, 15.5, 80, .4); pulses(22.0, 25.5, 100, .4); pulses(28.3, 32.9, 110, .5); pulses(32.95, 35.05, 168, .75); pulses(37.0, 38.2, 176, .85)
for tb in np.arange(32.95, 35.05, 60 / 168 / 2): madd(hp(noise(.05), 6500) * env_ad(int(.05 * SR), .0005, .012) * .6, tb, .45)
for tb in np.arange(37.0, 38.2, 60 / 176 / 2): madd(hp(noise(.05), 6500) * env_ad(int(.05 * SR), .0005, .012) * .6, tb, .5)
# stealth: sparse pizzicato "tiptoe" plucks on every step
tp = 17.25; kk = 0; walk = [A2 * .5, A2 * .5 * 1.2599, A2 * .5 * 1.1892, A2 * .5 * 1.4983]
while tp < EV['crunch'] - .1: madd(pluck(walk[kk % 4] * 2, .22), tp, .32); tp += .395; kk += 1
# tension strings
for t0_, notes, dt in ((4.2, [A2, A2 * 1.0595], 3.0), (28.3, [A2 * .5, A2 * .5 * 1.1892, A2 * .5 * 1.3348, A2 * .5 * 1.5], 1.2)):
    for k, f in enumerate(notes): madd(lp(note(f * 2, dt * .9, 'saw', .3, .6, .006), 2200), t0_ + k * dt, .2)
for ft, gg in ((EV['crash_in'], .9), (EV['cab_reach'], .35), (cr, .5), (ro, .7), (pl, .5), (ch, 1.0), (dv, .8), (EV['kick'] + .05, 1.0)): madd(thump(1.2, 90, 30, .3) * 1.3 + lp(noise(1.2), 600) * env_ad(int(1.2 * SR), .002, .3) * .3, ft, gg * .7)
madd(lp(sum(note(f, 3.4, 'saw', .6, 1.4) for f in (A2, A2 * 1.2599, A2 * 1.4983)), 1500), ST['end2'] + .3, .25)
duck = 1 - .55 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 4, 1), 0, 1); mus *= duck; BUS['mus'][0] += mus * .5; BUS['mus'][1] += mus * .5

# ------------------------------------------------------------------ master
GS, GA, GR, GM = .2, .5, .18, .75
mix = BUS['vo'] + (BUS['sfx'] * GS + BUS['amb'] * GA + BUS['rev'] * GR) * (1 - .4 * np.clip(lp(VOENV / (np.percentile(VOENV, 98) + 1e-9), 6, 1), 0, 1)) + BUS['mus'] * GM
# the quiet beat before the horde charges (phone has gone silent): pull everything but the heartbeat down
quiet = np.ones(N); a_, b_ = int(EV['crush'] * SR + .15 * SR), int((EV['turn_heads'] - .05) * SR); quiet[a_:b_] = .4; quiet = lp(quiet, 30, 1); mix = mix * quiet
dips = np.ones(N)
for te, dep in ((EV['glass'], .2), (EV['dive'], .25), (EV['cab_reach'], .45), (EV['crash_in'], .5)):
    dips[int((te - .24) * SR):int((te - .06) * SR)] = dep
dips = np.clip(lp(dips, 40, 1), 0, 1); mix = mix * dips
mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
from scipy import ndimage
spk = VOENV > .02
for nm, b, gg in (('sfx', BUS['sfx'], GS), ('amb', BUS['amb'], GA), ('rev', BUS['rev'], GR), ('mus', BUS['mus'], GM)):
    print('  under speech', nm, round(float(20 * np.log10(np.sqrt(np.mean((b[:, spk] * gg) ** 2)) / np.sqrt(np.mean(BUS['vo'][:, spk] ** 2)) + 1e-9)), 1), 'dB re vo')
act = mix[:, np.abs(mix).max(0) > 1e-3]; mix = mix * (.13 / np.sqrt(np.mean(act ** 2)))
pk = np.abs(mix).max(0); need = np.minimum(1.0, .92 / np.maximum(pk, 1e-9)); g = ndimage.minimum_filter1d(need, int(.003 * SR), mode='nearest'); g = ndimage.uniform_filter1d(g, int(.004 * SR)); rel = g.copy()
for i in range(1, len(rel)): rel[i] = min(1.0, max(g[i], rel[i - 1] + (1 - rel[i - 1]) / (.12 * SR))) if g[i] >= rel[i - 1] else g[i]
mix = np.tanh(mix * rel / .95) * .95
sf.write('mix_ep2_raw.wav', mix.T.astype(np.float32), SR); print('mix_ep2_raw.wav written; peak', float(np.max(np.abs(mix))))
