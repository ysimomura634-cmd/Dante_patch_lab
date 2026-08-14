# DANTE PATCH LAB

Danteネットワークの学習ゲーム。パッチ・診断・症状推理(TROUBLE)・冗長系までを
ブラウザ1枚で学べる、現場発のトレーニングシミュレータ。

## 構成 (v1.3)

```
src/
  head.html    … DOCTYPE〜Google Fonts読込
  fonts.css    … 内包フォント (Dela Gothic One / WOFF2 Base64)。重いので基本触らない
  style.css    … 全スタイル (KHメニュー様式 + テーマ3種)
  body.html    … マークアップ (OP画面・Sバッジ含む)
  opening.js   … オープニング + 効果音(WebAudio合成)
  bgm.js       … 隠しBGM (YAMAHA.wav)。許諾NGならこのファイルを削除するだけでビルドから消える
  app.js       … ゲーム本体 (モデル/診断/障害20種/描画/UI/セーブ)
build.py       … src/ を結合して dist/ に単一HTMLを生成
dist/          … 配布物 (これ1ファイルで動く)
```

## ビルド

```
python3 build.py
→ dist/dante_patch_lab_v1_3.html
```

GitHub Pagesで公開する場合は、生成物を `index.html` にリネームして
リポジトリ直下(またはPages設定のフォルダ)に置いてPush。

## v1.3 の新要素 (Phase 2)

- **セーブ**: プリセット×モード別のクリア回数、TROUBLEの最高ランク・レベル別S達成をlocalStorageに記録
- **ランク評価はTROUBLEのみ**: CHALLENGEは診断が答えを教える練習モードのためランク無し(クリア解説は表示)
- **報酬解放**: TROUBLEの★1〜★4を小・中・大すべて**Sランク**で制覇(計12個)すると ★5 EX
  (TROUBLE障害5件 / CHALLENGE欠陥9件) が解放。🔒クリックで条件と進捗(n/12)を表示
- **Sご褒美演出**: TROUBLEのSクリアで金色「★ S RANK CLEAR」スタンプ、ヘッダーに S×n バッジ

## 2枚出し運用 (v1.4〜)

- `index.html` … 安定版。クルーに配っているURLの本体。**普段は触らない**
- `beta.html`  … 実験版。`python3 build.py` で自動生成&直下コピーされる。
  公開URLの末尾に `/beta.html` を付けるとアクセス可能。`?dev=1` を付けるとEX/BUILDが仮解放(検証用)
- betaが安定したら `python3 build.py index.html` で昇格

## v1.4β (開発中): BUILDモード

- SYSTEMタブに **BUILD**(🔒)が出現。解放条件は「小・中・大すべて★5 EXをSランクでクリア」
- 構想: 機材を自由配置・接続→patch設定→diagnosticsが検証。ALL GREENを一度出すとSAVE可能になり、
  謎解きモードの「カスタム」として登録できる
- 初期スコープ: 機材は既存プリセット登場分のみ / まずCHALLENGE対応、TROUBLEは障害カタログ監査後 / MADI・AESは見送り

## ロードマップ進捗

- [x] Phase 0: リポジトリ化 (src分割 + build.py)
- [x] Phase 1: OP画面 + 効果音
- [x] Phase 2: ローカルセーブ + クリア報酬 (★5 EX解放)  ← v1.3
- [x] Phase 3: GitHub Pages公開
- [ ] Phase 2b: セーブコード書き出し/読み込み (端末間の引き継ぎ)
- [ ] Phase 4: ユーザー登録 + サーバーセーブ (Firebase等)
