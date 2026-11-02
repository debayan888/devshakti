# plan_ep10.py - Episode 10 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo12/meta.json'))
START = {'d1': .6, 'q1': 5.4, 'd2': 9.0, 'm1': 12.6, 'd3': 15.0, 'v1': 17.6, 'v2': 20.2, 'q2': 23.8, 'v3': 26.4, 'm2': 31.6, 'q3': 34.6, 'm3': 40.2, 'v4': 43.2, 'd4': 49.4, 'end': 52.8}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray', 'v1': 'drv', 'v2': 'drv', 'v3': 'drv', 'v4': 'drv'}
SHOTS = {'arm10': (0, 9.0), 'open10': (9.0, 14.4), 'talk10': (14.4, 30.6), 'cam4': (30.6, 39.8), 'cam5': (39.8, 48.8), 'react10': (48.8, 52.4), 'end10': (52.4, 57.4)}
EVENTS = {'unwrap': 2.2, 'arm_in': 4.6, 'arm_out': 8.8, 'buzz': 10.5, 'enter': 10.6, 'shut': 12.0, 'th1': 12.3, 'th2': 12.7, 'react_in': 37.6, 'gar_in': 40.0, 'turn': 47.0}
TOTAL = 57.4
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo12/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep10/timeline.json', 'w')); json.dump(env_out, open('../engine_ep10/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
