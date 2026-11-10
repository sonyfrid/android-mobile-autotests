"""Разведка экранов: проходит по приложению через adb и печатает элементы каждого экрана
(resource-id, текст, content-desc, класс). Нужна, чтобы писать точные локаторы."""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

PKG = sys.argv[1] if len(sys.argv) > 1 else "org.wikipedia"


def adb(*args):
    return subprocess.run(["adb", *args], capture_output=True, text=True).stdout


def dismiss_system_dialogs():
    """Закрыть системные «Приложение не отвечает» (на медленном эмуляторе в CI так бывает с лаунчером)."""
    for _ in range(5):
        adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        xml = adb("shell", "cat", "/sdcard/ui.xml")
        m = re.search(r'resource-id="android:id/aerr_wait"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', xml)
        if not m:
            return
        x1, y1, x2, y2 = map(int, m.groups())
        adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
        print("--- dismissed system ANR dialog", flush=True)
        time.sleep(2)


def dump(title):
    dismiss_system_dialogs()
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    xml = adb("shell", "cat", "/sdcard/ui.xml")
    print(f"\n===== SCREEN: {title} =====", flush=True)
    try:
        root = ET.fromstring(xml[xml.find("<"):])
    except ET.ParseError:
        print("dump failed:", xml[:200])
        return None
    for n in root.iter("node"):
        rid, text, desc = n.get("resource-id", ""), n.get("text", ""), n.get("content-desc", "")
        rid = rid.replace(PKG + ":id/", "")
        if rid.startswith("android:id/") and not text and not desc:
            continue
        if rid or text or desc:
            cls = n.get("class", "").split(".")[-1]
            flags = "".join(f for f, k in (("C", "clickable"), ("S", "scrollable")) if n.get(k) == "true")
            print(f"{cls}|{flags}|{rid}|{text[:50]}|{desc[:50]}")
    return root


def tap(root, **kw):
    for n in root.iter("node"):
        if all((v.lower() in (n.get(k, "") or "").lower()) for k, v in kw.items()):
            x1, y1, x2, y2 = map(int, re.findall(r"\d+", n.get("bounds")))
            adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
            print(f"--- tap {kw}", flush=True)
            time.sleep(3)
            return True
    print(f"--- NOT FOUND {kw}", flush=True)
    return False


time.sleep(20)
dismiss_system_dialogs()
adb("shell", "monkey", "-p", PKG, "-c", "android.intent.category.LAUNCHER", "1")
time.sleep(10)
r = dump("launch")
for _ in range(4):
    if r is not None and tap(r, **{"resource-id": "fragment_onboarding_forward_button"}):
        r = dump("onboarding next")
if r is not None and not tap(r, **{"resource-id": "fragment_onboarding_done_button"}):
    tap(r, **{"resource-id": "fragment_onboarding_skip_button"})
time.sleep(4)
r = dump("main")
tap(r, text="Search Wikipedia") or tap(r, **{"content-desc": "Search"})
r = dump("search open")
adb("shell", "input", "text", "Appium")
time.sleep(5)
r = dump("search results")
tap(r, **{"resource-id": "page_list_item_title"})
time.sleep(8)
r = dump("article")
adb("shell", "input", "swipe", "500", "1500", "500", "500")
time.sleep(2)
r = dump("article scrolled")
adb("shell", "input", "keyevent", "4")
time.sleep(2)
adb("shell", "input", "keyevent", "4")
time.sleep(2)
r = dump("back to main")
for name in ("Saved", "Search", "Edits", "More", "Explore"):
    if tap(r, **{"content-desc": name}) or tap(r, text=name):
        r = dump(f"tab {name}")
