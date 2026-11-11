#!/usr/bin/env bash
# Снимает экраны и кадры для анимации, пока Maestro проходит по приложению.
# Падение прохода не останавливает скрипт: что успели снять, то и сохраняем.
set -u
OUT="$PWD/media-out"
mkdir -p "$OUT/frames" "$OUT/shots"

adb install -r apps/wikipedia.apk
python3 tools/prepare_emulator.py

# чистая строка состояния и видимые касания
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
adb shell settings put system show_touches 1

(
  i=0
  while [ ! -f "$OUT/stop" ]; do
    adb exec-out screencap -p > "$OUT/frames/$(printf '%05d' "$i").png" 2>/dev/null
    i=$((i + 1))
    sleep 0.4
  done
) &
LOOP=$!

cd "$OUT/shots"
maestro test "$OLDPWD/tools/media/tour.yaml" --test-output-dir "$OUT/maestro" > "$OUT/maestro.log" 2>&1
echo "maestro exit: $?" >> "$OUT/maestro.log"
cd "$OLDPWD"

touch "$OUT/stop"
wait "$LOOP"

# снимки могли лечь в папку отчёта, собираем их в одно место
find "$OUT/maestro" -name '0[0-9]_*.png' -exec cp {} "$OUT/shots/" \; 2>/dev/null

python3 -m pip install --quiet pillow
python3 - "$OUT" <<'PY'
import pathlib, sys
from PIL import Image

out = pathlib.Path(sys.argv[1])
for png in sorted((out / "frames").glob("*.png")):
    try:
        Image.open(png).convert("RGB").resize((432, 960)).save(png.with_suffix(".jpg"), quality=78)
    except OSError:
        pass  # кадр мог записаться не до конца
    png.unlink()
PY
exit 0
