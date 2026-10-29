# gen_vo.py - v2 voiceover with Kokoro (free, offline). Run from audio/: python3 -I gen_vo.py
import soundfile as sf, numpy as np, json
from kokoro_onnx import Kokoro
k = Kokoro('/tmp/tts/k.onnx', '/tmp/tts/v.bin')
LINES = [  # id, text, speed
 ('hook',  "Zombies took over my building. And I'm stuck on the thirteenth floor.", 1.08),
 ('opt1',  "Option one. The elevator.", 1.1),
 ('no1',   "Yeah... no.", 0.95),
 ('opt2',  "Option two. The stairs.", 1.1),
 ('no2',   "Hard no.", 1.0),
 ('opt3',  "Option three. The window.", 1.1),
 ('no3',   "Thirteen floors. Straight down. Also no.", 1.02),
 ('tie',   "So I tied every bedsheet I own.", 1.1),
 ('more',  "Curtains. My hoodie. One very long scarf.", 1.1),
 ('math',  "My math says it reaches the tenth floor. That's fine. That's totally fine.", 1.05),
 ('f12',   "Floor twelve. He's busy. Good.", 1.05),
 ('f11',   "Floor eleven. Don't. Look. At him.", 0.98),
 ('f10',   "Floor ten. The rope ends here. Okay. Next problem.", 1.05),
 ('move',  "Wait. Why is my rope... moving?", 1.0),
 ('climb', "They can climb?!", 1.1),
 ('end',   "Part two. Follow, so I don't die alone.", 1.05),
]
meta = {}
for i, t, sp in LINES:
    s, sr = k.create(t, voice='am_michael', speed=sp, lang='en-us')
    s = np.asarray(s, dtype=np.float64)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 600]   # trim silence
    sf.write(f'vo2/{i}.wav', s, sr); meta[i] = {'text': t, 'dur': len(s) / sr, 'sr': sr}
    print(f'{i:6s} {len(s)/sr:5.2f}s  {t}')
# zombie vocal raw material (pitched down later in the mixer)
for j, t in enumerate(["Uhhhhh.", "Rrraaaah.", "Mmmmbrains.", "Hhhaaaah.", "Uhhh... uhhhh.", "Graaaah!"]):
    s, sr = k.create(t, voice='am_onyx', speed=0.62, lang='en-us'); sf.write(f'vo2/z{j}.wav', s, sr); print('z', j, len(s) / sr)
json.dump(meta, open('vo2/meta.json', 'w'), indent=1)
