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


def tap_any(root, word, exact=False):
    """Нажать на элемент, у которого текст или content-desc содержит слово (Compose-экраны без id)."""
    for n in root.iter("node"):
        for attr in ("text", "content-desc", "resource-id"):
            v = (n.get(attr) or "")
            if (v.lower() == word.lower()) if exact else (word.lower() in v.lower()):
                x1, y1, x2, y2 = map(int, re.findall(r"\d+", n.get("bounds")))
                adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
                print(f"--- tap [{attr}~{word}]", flush=True)
                time.sleep(3)
                return True
    print(f"--- NOT FOUND {word}", flush=True)
    return False


for i in range(4):
    if r is None or not tap_any(r, "Forward", exact=True):
        break
    r = dump(f"onboarding {i + 2}")
for word in ("Get started", "Continue", "Skip", "Done"):
    if r is not None and tap_any(r, word):
        break
time.sleep(5)
r = dump("main")
for word in ("Search Wikipedia", "Search"):
    if tap_any(r, word):
        break
r = dump("search open")
adb("shell", "input", "text", "Appium")
time.sleep(6)
r = dump("search results")
tap_any(r, "Appium", exact=True) or tap_any(r, "page_list_item_title")
time.sleep(10)
r = dump("article")
for word in ("Save", "Theme", "Find in article", "Contents", "Language"):
    print(f"article action {word}:", any(word.lower() in ((n.get('text') or '') + (n.get('content-desc') or '')).lower() for n in r.iter('node')) if r is not None else None)
tap_any(r, "Save")
r = dump("after save")
adb("shell", "input", "keyevent", "4")
time.sleep(3)
r = dump("after back 1")
adb("shell", "input", "keyevent", "4")
time.sleep(3)
r = dump("after back 2")
for name in ("Saved", "History", "Explore", "More"):
    if r is not None and tap_any(r, name, exact=True):
        r = dump(f"tab {name}")
