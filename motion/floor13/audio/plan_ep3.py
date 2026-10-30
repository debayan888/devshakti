# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo5/meta.json'))
START = {'recap': .20, 'held': 6.20, 'climb': 8.40, 'slide': 11.40, 'valve': 17.80, 'rent': 21.40, 'fall': 24.20, 'seven': 27.80, 'gym': 29.90, 'mirror': 33.30, 'mira': 35.60, 'end': 40.20}
SPEAKER = {'mira': 'radio'}
SHOTS = {'ext': (0, 17.6), 'valve': (17.6, 19.6), 'ext2': (19.6, 26.6), 'gym': (26.6, 39.9), 'end3': (39.9, 45.0)}
EVENTS = {'dive': .30, 'jerk': 1.20, 'll_out': 8.60, 'slide0': 11.40, 'slide1': 17.40, 'valve_spin': 18.30, 'water_in': 19.60, 'spray': 20.40, 'grab_noz': 21.00, 'blast': 22.40, 'twinkle': 99.0,
          'slam7': 26.60, 'land7': 27.00, 'lights': 29.50, 'bang': 31.20, 'mirror_t': 33.00, 'walkie': 35.20, 'pickup': 36.40, 'look': 38.90}
TOTAL = 45.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo5/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep3/timeline.json', 'w')); json.dump(env_out, open('../engine_ep3/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
