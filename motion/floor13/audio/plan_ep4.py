# plan_ep2.py - Episode 2 timing: lines, words, shots, events -> ../engine_ep2/timeline.json + env.json. Run from audio/.
import json, re, numpy as np, soundfile as sf
FPS = 60
meta = json.load(open('vo6/meta.json'))
START = {'m1': .25, 'd1': 1.75, 'd2': 4.10, 'm2': 5.50, 'm3': 10.70, 'd4': 19.60, 'd5': 23.30, 'd6': 26.00, 'm4': 28.60, 'd7': 32.00, 'd8': 37.20, 'end': 41.30}
SPEAKER = {'m1': 'radio', 'm2': 'radio', 'm3': 'radio', 'm4': 'radio'}
SHOTS = {'hook': (0, 4.0), 'talk': (4.0, 15.6), 'search': (15.6, 19.4), 'card': (19.4, 23.0), 'note': (23.0, 28.2), 'warn': (28.2, 35.0), 'door': (35.0, 41.0), 'end4': (41.0, 46.0)}
EVENTS = {'face_in': 1.6, 'rent_smile': 9.2, 'look_door': 12.6, 'look_around': 14.2, 'bag_see': 17.3, 'bag_open': 18.5, 'z_bang': 17.6, 'note_in': 23.6, 'note_out': 26.0, 'lock_touch': 26.6,
          'crackle': 28.3, 'mirror_turn': 31.8, 'steps': 35.2, 'beam': 35.6, 'handle': 37.0, 'crack': 39.9, 'hand': 40.3, 'freeze': 40.8}
TOTAL = 46.0
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    return max(1, n)
lines, env_out = [], {}
for lid, m in meta.items():
    if lid not in START: continue
    s, sr = sf.read(f'vo6/{lid}.wav'); hop = sr // FPS; n = int(len(s) / hop)
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
json.dump(tl, open('../engine_ep4/timeline.json', 'w')); json.dump(env_out, open('../engine_ep4/env.json', 'w'))
for l in lines: print(f"{l['id']:6s} {l['t0']/FPS:6.2f}s +{l['n']/FPS:4.2f}s end {l['t0']/FPS + l['n']/FPS:6.2f}")
