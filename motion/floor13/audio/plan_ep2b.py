# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo4/meta.json'))
START = {'recap': .20, 'land2': 4.60, 'tv': 8.00, 'goal': 14.45, 'oh': 20.60, 'zrent': 22.30, 'rent': 24.20, 'hall2': 26.90, 'rule': 32.80,
         'notnow': 36.30, 'momA': 37.50, 'fetch': 40.00, 'thx': 41.40, 'only': 42.90, 'end': 47.30}
SPEAKER = {'momA': 'mom', 'tv': 'tv', 'zrent': 'z'}
SHOTS = {'swing': (0, 3.95), 'crash': (3.95, 7.4), 'tv': (7.4, 18.3), 'landlord': (18.3, 26.7), 'pan': (26.7, 32.4), 'hall': (32.4, 47.0), 'end2': (47.0, 52.0)}
EVENTS = {'kick': 3.50, 'crash_in': 3.95, 'land': 4.35, 'remote': 7.75, 'tv_in': 7.95, 'tv_out': 14.30, 'clock': 15.2, 'll_hands': 18.6, 'll_in': 20.2, 'll_land': 20.5,
          'clip': 22.2, 'hide': 21.0, 'run_out': 25.7, 'door_slam': 26.45, 'cab_reach': 29.9, 'hose_coil': 30.7, 'tiptoe0': 32.5, 'ring_on': 35.0, 'answer': 36.3,
          'throw': 40.05, 'phone_land': 40.85, 'glass': 42.4, 'll_door': 42.65, 'win_open': 45.3, 'dive': 46.1, 'grab': 46.45, 'freeze': 46.5, 'phone_out': 35.45, 'fumble': 99.0}
TOTAL = 52.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo4/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep2b/timeline.json', 'w')); json.dump(env_out, open('../engine_ep2b/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
