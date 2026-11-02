# plan_ep11.py - Episode 11 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo13/meta.json'))
START = {'d1': .5, 'v1': 2.6, 'm1': 5.2, 'v2': 7.3, 'q1': 11.6, 'm2': 18.9, 'd2': 23.9, 'm3': 26.0, 'v3': 36.4, 'q2': 40.0, 'd3': 48.0, 'end': 53.0}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'q1': 'ray', 'q2': 'ray', 'v1': 'drv', 'v2': 'drv', 'v3': 'drv'}
SHOTS = {'talk11': (0, 11.0), 'cam5b': (11.0, 18.6), 'dark11': (18.6, 30.0), 'faces': (30.0, 39.6), 'smash': (39.6, 47.6), 'black11': (47.6, 52.6), 'end11': (52.6, 57.6)}
EVENTS = {'turn0': 12.0, 'walk': 14.6, 'off1': 21.8, 'off2': 22.1, 'off3': 22.4, 'crackshot': 28.4, 'face0': 31.0, 'throw': 42.4, 'crash': 42.9, 'bang': 43.5, 'crack': 43.6, 'creak': 44.0, 'k1': 50.8, 'k2': 51.3, 'k3': 51.8}
TOTAL = 57.6
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo13/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
    rms = np.array([np.sqrt(np.mean(s[i*hop:(i+1)*hop] ** 2)) for i in range(n)]); e = np.convolve(rms, np.ones(3) / 3, 'same'); e = np.clip(e / (np.percentile(e, 92) + 1e-9), 0, 1)
    words = m['text'].split(); wts = [syl(w) + (0.9 if re.search(r'[.?!]$', w) else .45 if w.endswith(',') or '...' in w else 0) for w in words]
    b = list(np.cumsum([0] + wts) / sum(wts) * n)
    for j in range(1, len(words)):
        lo, hi = max(1, int(b[j]) - 4), min(n - 1, int(b[j]) + 5); b[j] = lo + int(np.argmin(e[lo:hi])) if hi > lo else b[j]
    t0 = int(round(START[lid] * FPS))
    lines.append({'id': lid, 'text': m['text'], 'speaker': SPEAKER.get(lid, 'dev'), 't0': t0, 'n': n, 'words': [{'w': w, 'a': t0 + int(b[j]), 'b': t0 + int(b[j + 1])} for j, w in enumerate(words)]})
    env_out[lid] = [round(float(x), 2) for x in e]
lines.sort(key=lambda l: l['t0'])
tl = {'fps': FPS, 'total': int(TOTAL * FPS), 'lines': lines, 'shots': {k: [int(a * FPS), int(b * FPS)] for k, (a, b) in SHOTS.items()}, 'events': {k: int(round(v * FPS)) for k, v in EVENTS.items()}}
json.dump(tl, open('../engine_ep11/timeline.json', 'w')); json.dump(env_out, open('../engine_ep11/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
