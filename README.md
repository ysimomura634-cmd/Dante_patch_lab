# DANTE PATCH LAB

Danteネットワークの学習ゲーム。パッチ・診断・症状推理(TROUBLE)・冗長系までを
ブラウザ1枚で学べる、現場発のトレーニングシミュレータ。

## 構成

```
src/
  head.html    … DOCTYPE〜フォント読込
  style.css    … 全スタイル (KHメニュー様式)
  body.html    … マークアップ (OP画面含む)
  opening.js   … オープニング + 効果音(WebAudio合成)
  app.js       … ゲーム本体 (モデル/診断/障害/描画/UI)
build.py       … src/ を結合して dist/ に単一HTMLを生成
dist/          … 配布物 (これ1ファイルで動く)
```

## ビルド

```
python3 build.py
→ dist/dante_patch_lab_v1_1.html
```

## Git管理のはじめ方 (Phase 0)

```
git init
git add .
git commit -m "v1.1 — MAJOR BUILD 初号機 (OP画面+効果音)"
# GitHubにリポジトリを作ったら:
git remote add origin <リポジトリURL>
git push -u origin main
```

以後の開発は src/ を編集 → build.py → dist/ を確認、の流れ。
大きな変更の前にブランチを切れば「後戻り」がいつでも効く。

## 今後のロードマップ

- [x] Phase 0: リポジトリ体制 (このREADMEとbuild.py)
- [x] Phase 1: オープニング画面 + 効果音
- [ ] Phase 2: localStorageセーブ + クリア報酬(解放システム)
- [ ] Phase 3: オンライン公開 (GitHub Pages / Cloudflare Pages)
- [ ] Phase 4: アカウント + クラウドセーブ (Supabase等)

## 注意事項

- **フォント**: 綜藝体(DynaFont)はローカルインストール時に自動採用。
  `sogei.woff2` を同梱すれば全環境で表示されるが、**Web公開時の埋め込みは
  DynaFontのライセンス(Webフォント/組み込み条項)を必ず確認すること**。
  未確認の間は local() + Reggae One フォールバック運用が安全。
- **商標**: 本作は非公式・教育目的のシミュレータ。YAMAHA、Dante (Audinate)、
  その他の商標は各社に帰属します。公開時はこの表記を残すこと。
- **効果音**: 全てWebAudioでコード合成(音源ファイル不使用)。
  ブラウザの自動再生制限のため、OP画面のPRESS STARTが音声解禁を兼ねる。
