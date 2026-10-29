# gen_vo_ep2.py - Episode 2 voice (Kokoro, free/offline). Run from audio/: python3 -I gen_vo_ep2.py
import soundfile as sf, numpy as np, json
from kokoro_onnx import Kokoro
k = Kokoro('/tmp/tts/k.onnx', '/tmp/tts/v.bin')
LINES = [  # id, text, speed, voice
 ('recap', "Last time, a zombie climbed down my rope. So I kicked the window.", 1.08, 'am_michael'),
 ('land',  "Floor ten. I'm inside. I'm alive.", 1.0, 'am_michael'),
 ('bad',   "Bad news. The hallway is packed with zombies.", 1.04, 'am_michael'),
 ('hose',  "But at the end of that hallway... a fire hose. A very long fire hose.", 1.0, 'am_michael'),
 ('r1',    "Rule one. Don't make a sound.", 1.0, 'am_michael'),
 ('r2',    "Rule two. Don't step on anything.", 1.0, 'am_michael'),
 ('r3',    "Rule three. Silence your phone.", 1.0, 'am_michael'),
 ('oops',  "Did I silence my phone?", 0.95, 'am_michael'),
 ('mom1',  "Mom?! Not now!", 1.05, 'am_michael'),
 ('fetch', "Go fetch.", 0.95, 'am_michael'),
 ('thx',   "Thanks, mom.", 1.0, 'am_michael'),
 ('stop',  "Why did the ringing stop?", 0.95, 'am_michael'),
 ('end',   "Part three. Follow, and tell my mom I'm fine.", 1.05, 'am_michael'),
]
meta = {}
for i, t, sp, v in LINES:
    s, sr = k.create(t, voice=v, speed=sp, lang='en-us'); s = np.asarray(s, dtype=np.float64)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 600]
    sf.write(f'vo3/{i}.wav', s, sr); meta[i] = {'text': t, 'dur': len(s) / sr, 'sr': sr}; print(f'{i:6s} {len(s)/sr:5.2f}s  {t}')
# mom on the phone
for j, (t, sp) in enumerate([("Honey? It's your mother. Are you eating enough?", 1.0), ("Honey? Honey, are you there?", 1.0)]):
    s, sr = k.create(t, voice='af_heart', speed=sp, lang='en-us'); sf.write(f'vo3/mom{j}.wav', s, sr); print('mom', j, len(s) / sr)
json.dump(meta, open('vo3/meta.json', 'w'), indent=1)
