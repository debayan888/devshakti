#!/bin/bash
cd /home/user/devshakti/motion/floor13/engine_ep3
export CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
rm -rf ../render/prev4; node capture.js --list "$1" --scale ${3:-0.5} --jpg --workers 4 --out ../render/prev4 2>&1 | grep -iE "error|done" | head -6
python3 ~/.claude/skills/motion-director/scripts/tools/sheet.py ../render/prev4 ../reviews/$2.jpg --cols ${4:-4} --width 360 | tail -1
