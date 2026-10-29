# plan.py - single source of truth for timing. Writes ../engine/timeline.json (lines, words, shots) and ../engine/env.json (lip-sync).
# Run from audio/: python3 -I plan.py
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo2/meta.json'))
START = {'hook': .45, 'opt1': 4.55, 'no1': 7.25, 'opt2': 8.75, 'no2': 10.55, 'opt3': 12.2, 'no3': 14.15, 'tie': 17.0, 'more': 19.3, 'math': 22.4,
         'f12': 27.6, 'f11': 30.4, 'f10': 33.7, 'move': 37.3, 'climb': 39.9, 'end': 43.6}
SHOTS = {'wake': (0, 1.2), 'city': (1.2, 3.0), 'stuck': (3.0, 4.5), 'elev': (4.5, 8.7), 'stairs': (8.7, 12.0), 'vertigo': (12.0, 17.0),
         'tie': (17.0, 22.3), 'math': (22.3, 27.0), 'ext': (27.0, 43.4), 'endcard': (43.4, 47.0)}
TOTAL = 47.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    s, sr = sf.read(f'vo2/{lid}.wav'); dur = len(s) / sr
    hop = sr // FPS; n = int(len(s) / hop)
    rms = np.array([np.sqrt(np.mean(s[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    e = np.convolve(rms, np.ones(3) / 3, 'same'); e = np.clip(e / (np.percentile(e, 92) + 1e-9), 0, 1)
    words = m['text'].split(); wts = []
    for w in words:
        wts.append(syl(w) * 1.0 + (0.9 if re.search(r'[.?!]$', w) else 0.45 if w.endswith(',') or '...' in w else 0))
    cum = np.cumsum([0] + wts) / sum(wts) * n; b = list(cum)
    for j in range(1, len(words)):                       # snap internal boundaries to the quietest frame within +-4 frames
        lo, hi = max(1, int(b[j]) - 4), min(n - 1, int(b[j]) + 5); b[j] = lo + int(np.argmin(e[lo:hi])) if hi > lo else b[j]
    t0 = int(round(START[lid] * FPS))
    lines.append({'id': lid, 'text': m['text'], 't0': t0, 'n': n, 'words': [{'w': w, 'a': t0 + int(b[j]), 'b': t0 + int(b[j + 1])} for j, w in enumerate(words)]})
    env_out[lid] = [round(float(x), 2) for x in e]
tl = {'fps': FPS, 'total': int(TOTAL * FPS), 'lines': lines, 'shots': {k: [int(a * FPS), int(b * FPS)] for k, (a, b) in SHOTS.items()}}
json.dump(tl, open('../engine/timeline.json', 'w')); json.dump(env_out, open('../engine/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s")
