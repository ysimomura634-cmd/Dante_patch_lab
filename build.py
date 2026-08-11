#!/usr/bin/env python3
"""DANTE PATCH LAB — build script
src/ 配下のソースを結合して dist/ に単一HTMLを生成する。
使い方:  python3 build.py            → dist/dante_patch_lab_v1_1.html
        python3 build.py 出力名.html
"""
import sys, pathlib, datetime

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
OUT = sys.argv[1] if len(sys.argv) > 1 else "dante_patch_lab_v1_1.html"

def read(name): return (SRC / name).read_text(encoding="utf-8")

html = (
    read("head.html")
    + "<style>" + read("style.css") + "</style>"
    + read("body.html")
    + "<script>\n/* build: " + datetime.date.today().isoformat() + " */\n"
    + read("opening.js") + "\n"
    + read("app.js")
    + "</script>"
    + read("tail.html")
)

DIST.mkdir(exist_ok=True)
out = DIST / OUT
out.write_text(html, encoding="utf-8")
print(f"built → {out}  ({len(html):,} bytes)")
