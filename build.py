#!/usr/bin/env python3
"""DANTE PATCH LAB — build script (v1.2構成)
src/ 配下のソースを結合して dist/ に単一HTMLを生成する。
使い方:  python3 build.py            → dist/dante_patch_lab_v1_3.html
        python3 build.py 出力名.html

構成メモ:
  fonts.css … 内包フォント(Dela Gothic One WOFF2 Base64)。重いので編集対象外
  bgm.js    … 隠しBGM(YAMAHA.wav)。許諾NGならこのファイルを削除するだけでビルドから消える
"""
import sys, pathlib, datetime

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
OUT = sys.argv[1] if len(sys.argv) > 1 else "dante_patch_lab_v1_3.html"

def read(name):
    p = SRC / name
    return p.read_text(encoding="utf-8") if p.exists() else ""

html = (
    read("head.html")
    + "<style>\n" + read("fonts.css") + "\n" + read("style.css") + "</style>"
    + read("body.html")
    + "<script>\n/* build: " + datetime.date.today().isoformat() + " */\n"
    + read("opening.js") + "\n"
    + read("bgm.js")          # 任意: 無ければ空文字(BGM機能ごと消える)
    + read("app.js")
    + "</script>"
    + read("tail.html")
)

DIST.mkdir(exist_ok=True)
out = DIST / OUT
out.write_text(html, encoding="utf-8")
print(f"built → {out}  ({len(html):,} bytes)")
