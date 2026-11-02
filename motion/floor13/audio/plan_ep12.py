# plan_ep12.py - Episode 12 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo14/meta.json'))
START = {'d1': 1.0, 'd2': 17.4, 'q1': 28.6, 'v1': 33.6, 'v2': 39.2, 'q2': 44.6, 'm1': 48.4, 'end': 53.4}
SPEAKER = {'m1': 'mira', 'q1': 'ray', 'q2': 'ray', 'v1': 'drv', 'v2': 'drv'}
SHOTS = {'dark12': (0, 8.0), 'mira12': (8.0, 17.0), 'answer12': (17.0, 25.0), 'guide12': (25.0, 36.0), 'crack12': (36.0, 48.0), 'choice12': (48.0, 53.0), 'end12': (53.0, 58.0)}
EVENTS = {'emerge': 2.0, 'bump1': 4.6, 'bump2': 5.1, 'face': 10.4, 'breath': 14.0, 'b1': 19.4, 'b2': 19.9, 'b3': 20.4, 'push': 27.4, 'gone': 32.4, 'shut': 32.6, 'tap1': 36.6, 'tap2': 37.7, 'tap3': 38.8, 'crk': 40.6, 'tap4': 41.6, 'crk2': 45.8}
TOTAL = 58.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo14/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep12/timeline.json', 'w')); json.dump(env_out, open('../engine_ep12/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
