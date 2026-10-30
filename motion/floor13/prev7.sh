#!/bin/bash
cd /home/user/devshakti/motion/floor13/engine_ep6
export CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
rm -rf ../render/prev7; node capture.js --list "$1" --scale ${3:-0.5} --jpg --workers 4 --out ../render/prev7 2>&1 | grep -iE "error|done" | head -6
python3 ~/.claude/skills/motion-director/scripts/tools/sheet.py ../render/prev7 ../reviews/$2.jpg --cols ${4:-4} --width 360 | tail -1
