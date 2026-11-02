# plan_ep13.py - Episode 13 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo15/meta.json'))
START = {'m1': 1.4, 'q1': 5.2, 'd1': 9.6, 'm2': 34.8, 'q2': 39.4, 'd3': 48.2, 'q3': 50.2, 'end': 53.0}
SPEAKER = {'m1': 'mira', 'm2': 'mira', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray'}
SHOTS = {'booth13': (0, 9.0), 'plan13': (9.0, 17.0), 'office13': (17.0, 31.0), 'lock13': (31.0, 39.0), 'ray13': (39.0, 46.2), 'corr13': (46.2, 52.6), 'end13': (52.6, 57.6)}
EVENTS = {'krk': 1.0, 'stand': 12.0, 'k1': 14.6, 'k2': 15.1, 'k3': 15.6, 'open': 16.0, 'r1': 20.0, 'r2': 20.5, 'r3': 21.0, 'led_in': 22.6, 'grab_keys': 23.6, 'led_out': 24.4, 'jingle': 25.4, 'r4': 26.0, 'r5': 26.4, 'r6': 26.8, 'key1': 31.8, 'key2': 33.0, 'key3': 34.4, 'bdoor': 35.4, 'f1': 40.6, 'f2': 41.1, 'f3': 41.6, 'crash': 42.4, 'run': 43.6, 'grab': 44.6, 'free': 45.3, 'slam': 46.0, 'bang1': 46.6, 'bang2': 47.3}
TOTAL = 57.6
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo15/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep13/timeline.json', 'w')); json.dump(env_out, open('../engine_ep13/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
