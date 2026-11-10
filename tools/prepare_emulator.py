"""Подготовка эмулятора в CI: дать системе догрузиться и закрыть системные
«Приложение не отвечает» (на медленном эмуляторе так бывает с лаунчером)."""
import re
import subprocess
import time


def adb(*args):
    return subprocess.run(["adb", *args], capture_output=True, text=True).stdout


time.sleep(20)
for _ in range(10):
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    xml = adb("shell", "cat", "/sdcard/ui.xml")
    m = re.search(r'resource-id="android:id/aerr_wait"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', xml)
    if not m:
        break
    x1, y1, x2, y2 = map(int, m.groups())
    adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
    print("closed system ANR dialog", flush=True)
    time.sleep(3)
print("emulator ready", flush=True)
