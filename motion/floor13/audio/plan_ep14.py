# plan_ep14.py - Episode 14 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo16/meta.json'))
START = {'m1': .8, 'v1': 3.4, 'm2': 8.0, 'q1': 11.6, 'd1': 15.4, 'd2': 20.2, 'q2': 25.6, 'v2': 29.4, 'm3': 33.2, 'd3': 38.2, 'q3': 43.6, 's1': 48.4, 'end': 53.4}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'm3': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray', 'v1': 'drv', 'v2': 'drv', 's1': 'sev'}
SHOTS = {'arm14': (0, 14.8), 'prints14': (14.8, 25.0), 'truck14': (25.0, 37.6), 'quiet14': (37.6, 46.0), 'seventh': (46.0, 53.0), 'end14': (53.0, 58.0)}
EVENTS = {'ins_in': 2.6, 'ins_out': 7.6, 'pour': 9.6, 'muffle': 9.8, 'count': 17.8, 'smear': 22.2, 'stare': 40.2, 'blink': 43.4, 'creak': 46.3, 'appear': 46.8, 'step': 48.0}
TOTAL = 58.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo16/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep14/timeline.json', 'w')); json.dump(env_out, open('../engine_ep14/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
