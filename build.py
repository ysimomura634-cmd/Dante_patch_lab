#!/usr/bin/env python3
"""DANTE PATCH LAB — build script (v1.4 2枚出し運用)

  python3 build.py              → dist/beta.html + リポジトリ直下に beta.html を自動コピー
  python3 build.py index.html   → dist/index.html + 直下に index.html (安定版の昇格時のみ使う)

運用ルール:
  ・普段の開発は必ず引数なし(beta)。公開URLの本体 index.html には触れない
  ・betaが安定したら `python3 build.py index.html` で昇格 → Commit → Push
  ・fonts.css=内包フォント(触らない) / bgm.js=削除するだけでBGMがビルドから消える
"""
import sys, pathlib, datetime, shutil

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
OUT = sys.argv[1] if len(sys.argv) > 1 else "beta.html"

def read(name):
    p = SRC / name
    return p.read_text(encoding="utf-8") if p.exists() else ""

html = (
    read("head.html")
    + "<style>\n" + read("fonts.css") + "\n" + read("style.css") + "</style>"
    + read("body.html")
    + "<script>\n/* build: " + datetime.date.today().isoformat() + " (" + OUT + ") */\n"
    + read("opening.js") + "\n"
    + read("bgm.js")
    + read("app.js")
    + "</script>"
    + read("tail.html")
)

DIST.mkdir(exist_ok=True)
out = DIST / OUT
out.write_text(html, encoding="utf-8")
shutil.copyfile(out, ROOT / OUT)   # 直下にも自動コピー → Pagesにそのまま乗る
print(f"built → {out}  ({len(html):,} bytes)")
print(f"copied → {ROOT / OUT}  (Commit → Push で公開されます)")
