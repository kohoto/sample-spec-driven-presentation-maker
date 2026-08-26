# custom/my-design ブランチの運用メモ

このリポジトリは [aws-samples/sample-spec-driven-presentation-maker](https://github.com/aws-samples/sample-spec-driven-presentation-maker)
のフォーク（`kohoto/sample-spec-driven-presentation-maker`）。upstream の更新に追従しつつ、
自分用のデザイン・挙動カスタマイズを維持するためのブランチ運用をまとめる。

## ブランチの役割

```
upstream/main (aws-samples 本家)
      ↓ 毎日 cron で自動 merge（.github/workflows/sync-upstream.yml）
origin/main (kohoto フォーク、自動追従・ノータッチ)
      ↓ 手動で merge（コンフリクト解消が必要な場合あり）
custom/my-design (日常使う・カスタム内容を保持するブランチ)
```

- **`main`**：upstream 追従専用。`sync-upstream.yml` が毎日 upstream を fetch → merge → push している。
  ここには自分のオリジナル修正を直接コミットしない（乗せると `custom/my-design` への取り込み時にズレる）。
- **`custom/my-design`**：日常の作業ブランチ。デザインルール変更・自動オープン処理などのカスタム内容はここに集約する。

## 同期の手順

`origin/main` が進んだら、任意のタイミングで `custom/my-design` に取り込む。

```bash
git fetch origin                  # origin/main の最新を取得（ローカル main が古くならないよう毎回実行）
git checkout main
git merge --ff-only origin/main   # origin/main に追従するだけなので ff-only で安全に
git checkout custom/my-design
git merge main --no-edit          # ここでコンフリクトが起きたら手動解消
# コンフリクトがあれば: 該当ファイルを編集 → git add → git commit
```

日常運用では `origin` だけ見ていればよい。`upstream/main` を直接 fetch するのは、
GitHub Actions の代わりに自分で確認したいときだけで良い（`sync-upstream.yml` が push している
`origin/main` を見れば十分）。

### 注意点

- ローカルの `main` は明示的に `git fetch` しないと古いままになる。`git log --graph` 等で見た
  `main` の位置が古く見えても、GitHub 上の `origin/main` 自体は自動追従で最新化されている可能性が
  高い（`gh run list --workflow=sync-upstream.yml` で実行履歴を確認できる）。判断する前に必ず
  `git fetch origin` すること。
- upstream 側で大規模なディレクトリリネーム（例: `skill/` → `sdpm/`、`mcp-local/` → `servers/local`
  → `sdpm/sdpm/tools/` への統合）が起きることがある。git のリネーム検出でほとんど自動マージされるが、
  同じファイルをカスタム側でも編集していた場合はコンフリクトになる。

## 現在維持しているカスタム内容

`custom/my-design` が upstream / `main` に対して独自に持っている変更（2026-08-26 時点）:

1. **デザインルールの強化**（`sdpm/references/guides/design-rules.md`, `arch-elements.md`, `table.md`）
   - グレー・薄い色のテキストで階層を表現するのを禁止（階層はサイズで表現、色は常にフルコントラスト）
   - 装飾エフェクト（シャドウ・グロー・3D回転・反射・ソフトエッジ・ベベル）を原則禁止
   - 半透明カードの opacity ルールを具体値で明文化
   - テーブルのグレー文字色を濃い色（`#1A1A1A`）に変更

2. **ヒアリングワークフローの安全策**（`sdpm/references/workflows/create-new-1-briefing.md`）
   - 出力先を必ずユーザーに確認してから `init` を実行（デフォルトパスへの推測禁止）
   - 数値・パーセンテージは会話・ソース資料・引用可能な URL に基づく場合のみ使用可

3. **テンプレート解析機能の拡張**（`sdpm/sdpm/engine/analyzer/__init__.py`）
   - レイアウト一覧をマスターレイアウト定義から構築（サンプルスライド0枚のテンプレートでも全レイアウト検出可能に）
   - `ppt/tableStyles.xml` からテーブルスタイルを抽出する `_extract_table_styles` を追加

4. **オートフィット挙動の変更**（`shape.py`, `textbox.py`）
   - シェイプ/テキストボックスのオートフィットを常に無効化（固定サイズに統一）

5. **新規スタイルサンプル**：`sdpm/references/examples/styles/aws-2026-dark.html`（AWS 2026 公式カラーテーマ）

6. **CI/CD**：`.github/workflows/sync-upstream.yml`（upstream 自動追従ワークフロー、`main` 用）

7. **MCP ツールの自動オープン**（`sdpm/sdpm/tools/__init__.py` の `generate_pptx`）
   - PPTX 生成後、macOS で自動的にファイルを開く処理を追加

upstream 側の構成が変わった場合は、このリストを見ながら「何を新しい場所に移植すべきか」を確認する。
