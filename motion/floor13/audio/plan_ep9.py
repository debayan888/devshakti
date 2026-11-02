# plan_ep9.py - Episode 9 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo11/meta.json'))
START = {'q1': .5, 'm1': 4.4, 'd1': 13.2, 'm2': 15.9, 'q2': 19.3, 'm3': 25.0, 'v1': 34.6, 'd2': 37.8, 'v2': 40.4, 'q3': 44.1, 'm4': 47.4, 'end': 52.4}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'm4': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray', 'v1': 'drv', 'v2': 'drv'}
SHOTS = {'stall9': (0, 8.0), 'tape': (8.0, 24.6), 'live': (24.6, 33.0), 'hand': (33.0, 44.0), 'choice': (44.0, 52.0), 'end9': (52.0, 57.0)}
EVENTS = {'rew': 8.0, 'play': 9.2, 'side': 13.0, 'sensor': 22.6, 'slide': 22.7, 'inside': 24.2, 'slap': 33.2, 'buzz_in': 45.6, 'buzz_out': 47.2}
TOTAL = 57.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo11/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep9/timeline.json', 'w')); json.dump(env_out, open('../engine_ep9/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
