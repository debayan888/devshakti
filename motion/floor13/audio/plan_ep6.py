# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo8/meta.json'))
START = {'q1': .90, 'd1': 4.60, 'q2': 7.00, 'd2': 14.00, 'd3': 15.80, 'q3': 17.50, 'd4': 21.10, 'm1': 24.30, 'd5': 28.00, 'm2': 31.50, 'q4': 33.10,
         'q5': 35.50, 'd6': 38.00, 'm3': 41.30, 'd7': 48.00, 'end': 52.80}
SPEAKER = {'m1': 'radio', 'm2': 'radio', 'm3': 'radio', 'q1': 'ray', 'q2': 'ray', 'q3': 'ray', 'q4': 'ray', 'q5': 'ray'}
SHOTS = {'dark': (0, 3.4), 'desc': (3.4, 12.6), 'lobby': (12.6, 24.0), 'radio': (24.0, 35.4), 'plan': (35.4, 46.0), 'cliff': (46.0, 52.5), 'end6': (52.5, 57.5)}
EVENTS = {'click': .50, 'segB': 6.4, 'segC': 9.4, 'win_in': 13.8, 'booth': 14.0, 'awning': 15.8, 'crackle': 24.0, 'music': 42.8, 'lobby2_in': 42.8, 'lobby2_out': 46.0, 'find': 47.6}
TOTAL = 57.5
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo8/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep6/timeline.json', 'w')); json.dump(env_out, open('../engine_ep6/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
