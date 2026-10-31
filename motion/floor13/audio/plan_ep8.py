# plan_ep8.py - Episode 8 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo10/meta.json'))
START = {'m1': 2.1, 'q1': 6.0, 'd1': 10.3, 'm2': 12.9, 'q2': 19.4, 'd2': 26.9, 'd3': 30.8, 'm3': 39.0, 'd4': 40.5, 'q3': 42.2, 'm4': 47.6, 'end': 53.9}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'm4': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray'}
SHOTS = {'talk8': (0, 17.0), 'glass': (17.0, 26.8), 'knockback': (26.8, 38.8), 'engine': (38.8, 44.6), 'cctv8': (44.6, 51.0), 'react': (51.0, 53.5), 'end8': (53.5, 58.5)}
EVENTS = {'k1': .4, 'k2': .95, 'k3': 1.5, 'k4': 17.0, 'k5': 17.55, 'k6': 18.1, 'th1': 23.5, 'th2': 23.9, 'th3': 24.3, 'k7': 24.9, 'k8': 25.45, 'k9': 26.0, 'b1': 33.1, 'b2': 33.5, 'b3': 33.9, 'wait': 34.2, 'leave': 36.2, 'stall': 41.8, 'seat': 46.2}
TOTAL = 58.5
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo10/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep8/timeline.json', 'w')); json.dump(env_out, open('../engine_ep8/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
