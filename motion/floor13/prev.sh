#!/bin/bash
# usage: prev.sh "f1,f2,..." name [scale]   -> reviews/<name>.jpg
cd /home/user/devshakti/motion/floor13/engine
export CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
rm -rf ../render/prev; node capture.js --list "$1" --scale ${3:-0.5} --jpg --workers 4 --out ../render/prev 2>&1 | grep -iE "error|done" | head -5
python3 ~/.claude/skills/motion-director/scripts/tools/sheet.py ../render/prev ../reviews/$2.jpg --cols ${4:-4} --width 360 | tail -1
