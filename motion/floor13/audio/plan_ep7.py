# plan_ep7.py - Episode 7 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo9/meta.json'))
START = {'d1': .5, 'q1': 3.3, 'd2': 7.4, 'q2': 10.0, 'd3': 13.2, 'q3': 17.2, 'm1': 21.9, 'm2': 27.5, 'd4': 31.0, 'm3': 34.2, 'd5': 40.2, 'q4': 44.2, 'm4': 48.0, 'd6': 50.4, 'end': 54.4}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'm4': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray', 'q4': 'ray'}
SHOTS = {'door7': (0, 6.0), 'cross': (6.0, 16.8), 'zeds': (16.8, 27.0), 'booth': (27.0, 41.9), 'knock': (41.9, 54.0), 'end7': (54.0, 59.0)}
EVENTS = {'bar': 5.5, 'open': 6.0, 'close': 7.8, 'silence': 16.8, 'lightoff': 17.6, 'sensor': 20.4, 'slide': 20.5, 'buzz': 21.7, 'shut': 23.3, 'turn': 25.4, 'point': 34.4, 'cctv': 35.0, 'cctv_out': 39.6, 'k1': 42.2, 'k2': 42.75, 'k3': 43.3, 'push': 50.4, 'shape': 52.0}
TOTAL = 59.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo9/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep7/timeline.json', 'w')); json.dump(env_out, open('../engine_ep7/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
