# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo7/meta.json'))
START = {'r1': .90, 'd1': 5.20, 'r2': 6.30, 'd2': 9.40, 'r3': 11.40, 'r4': 17.50, 'r5': 20.60, 'r6': 25.80, 'd3': 28.60, 'r7': 29.40, 'm1': 33.90, 'd4': 35.80, 'r8': 39.20, 'end': 43.50}
SPEAKER = {'m1': 'radio', 'r1': 'ray', 'r2': 'ray', 'r3': 'ray', 'r4': 'ray', 'r5': 'ray', 'r6': 'ray', 'r7': 'ray', 'r8': 'ray'}
SHOTS = {'open': (0, 5.0), 'stairs': (5.0, 17.2), 'gen': (17.2, 25.6), 'van': (25.6, 33.6), 'cam': (33.6, 43.2), 'end5': (43.2, 48.2)}
EVENTS = {'door': .30, 'light': .50, 'pull': 3.0, 'shut': 4.2, 'walk0': 12.0, 'gen_on': 17.2, 'van_in': 26.4, 'van_out': 32.8, 'crackle': 33.7, 'cam_in': 36.8, 'cam_out': 39.0, 'yank': 41.8, 'dark': 42.0, 'freeze': 42.6}
TOTAL = 48.2
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo7/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep5/timeline.json', 'w')); json.dump(env_out, open('../engine_ep5/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
