# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo3/meta.json'))
START = {'recap': .20, 'land': 4.45, 'bad': 7.20, 'hose': 10.55, 'r1': 15.95, 'r2': 18.85, 'r3': 23.20, 'oops': 26.10, 'notnow': 28.30, 'momA': 29.55,
         'fetch': 32.10, 'momB': 33.10, 'thx': 33.75, 'stop': 35.25, 'end': 39.30}
SPEAKER = {'momA': 'mom', 'momB': 'mom'}
SHOTS = {'swing': (0, 3.95), 'crash': (3.95, 6.95), 'peek': (6.95, 10.5), 'pan': (10.5, 15.6), 'hall': (15.6, 38.55), 'end2': (38.55, 44.5)}
EVENTS = {'kick': 3.50, 'crash_in': 3.95, 'land': 4.35, 'peep_open': 8.05, 'cab_reach': 12.4, 'hose_coil': 13.3, 'door_open': 16.0, 'door_clear': 17.2,
          'hz1': 19.65, 'hz2': 20.25, 'crunch': 20.95, 'turn_back': 22.60, 'phone_out': 23.50, 'ring_on': 25.50, 'fumble': 27.20, 'answer': 28.30,
          'alert': 29.60, 'throw': 32.15, 'phone_land': 32.95, 'glass': 34.50, 'crush': 35.05, 'turn_heads': 36.00, 'charge': 37.00, 'dive': 38.20}
TOTAL = 44.5
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo3/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep2/timeline.json', 'w')); json.dump(env_out, open('../engine_ep2/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
