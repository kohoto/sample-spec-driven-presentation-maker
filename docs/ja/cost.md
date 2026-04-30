# コスト試算

SDPM を AWS にデプロイした際の推定コストです。CloudShell デプロイガイドに載っている全体概算に加えて、スライド検索（Bedrock Knowledge Bases + Amazon S3 Vectors）のコストを詳しく扱います。

> 2026 年 4 月時点の公開料金に基づく概算です。AWS の料金は変更される可能性があります。最新情報は [Amazon Bedrock 料金](https://aws.amazon.com/bedrock/pricing/)、[Amazon S3 料金](https://aws.amazon.com/s3/pricing/) を確認してください。

## 全体コスト概要

Layer 4 フルスタック（us-east-1、社内チーム 10 人程度、月 20 デッキ生成）:

- **固定費**: ~$6/月（CloudFront, API Gateway, S3, DynamoDB, ECR, CloudWatch Logs 等）
- **従量費**: ~$90-145/月（AgentCore Runtime, Claude Sonnet 4.6, Code Interpreter, Memory, スライド検索）
- **合計**: **~$95-145/月**

詳しくは [CloudShell デプロイガイド — 推定月額料金](deploy-cloudshell.md#推定月額料金) を参照してください。

## スライド検索（Bedrock KB + S3 Vectors）のコスト

SDPM はデッキ横断のセマンティック検索を標準機能として提供します。以下の AWS リソースが作成されます。

- Amazon Bedrock Knowledge Bases
- Amazon Titan Text Embeddings V2（1024 次元）
- Amazon S3 Vectors（2025 年 11 月 GA）

S3 Vectors は従来の Vector DB サービスと比較して最大 90% 安価で、SDPM の利用規模では **月額 $0.05 以下** で運用できます。

### 単価（2026 年 4 月時点、us-east-1）

| 項目 | 単価 |
|---|---|
| Titan Embed Text V2 | $0.00002 / 1,000 tokens |
| S3 Vectors ストレージ | $0.06 / GB / 月 |
| S3 Vectors PUT | $0.20 / GB アップロード |
| S3 Vectors Query (API call) | $0.0025 / 1,000 requests |
| S3 Vectors Query (data processed) | $0.004 / TB（最初の 100K ベクトル） |
| Bedrock Knowledge Bases | 追加課金なし（ストレージとモデル呼び出しのみ課金） |

### 規模別の試算

1 ベクトルあたり約 5 KB（1024 次元 × 4 bytes + metadata/keys）で計算しています。

| 規模 | スライド数 | 月追加 | 月検索回数 | 月額 |
|---|---|---|---|---|
| 個人利用 | 300 | 50 | 50 | **$0.0005** |
| 中規模チーム | 10,000 | 2,000 | 5,000 | **$0.04** |
| 社内数百人 | 125,000 | 10,000 | 50,000 | **$0.40** |
| 極端大規模 | 1,500,000 | 100,000 | 500,000 | **$10** |

### 個人利用（例）の内訳

想定: スライド 300 枚、平均 300 tokens/枚、月 50 枚追加、月 50 検索。

| 項目 | 計算 | 月額 |
|---|---|---|
| ストレージ | 300 × 5 KB = 1.5 MB × $0.06/GB | $0.0001 |
| Embedding | 50 × 300 tokens × $0.00002/1K | $0.0003 |
| PUT | 50 × 5 KB = 250 KB × $0.20/GB | $0.00005 |
| Query (API) | 50 × $0.0025/1K | $0.000125 |
| Query (data processed) | 75 MB × $0.004/TB | $0.0000003 |
| **合計** | | **$0.0005** |

### 想定を超える規模の場合

- **5M ベクトル以上**: S3 Vectors のインデックス単位コストが段階的に増加します。パーティション分割を検討してください
- **月 100 万クエリ以上**: Query data processed コストが支配的になります。キャッシュ層の導入が有効です

## 他のコスト削減手段

| 方法 | 削減額 | 備考 |
|---|---|---|
| プロンプトキャッシュ | LLM 費用最大 80% 削減 | 対応モデルではデフォルトで有効 |
| `--enable-invocation-logging` を付けない（デフォルト） | CloudWatch Logs 費用なし | MIL ログの保存・転送費用が不要 |
| 小型モデルへの切り替え | LLM 費用大幅削減 | Claude Haiku 4.5 や Nova Lite 等を `modelId` で指定 |
| CDK Destroy（開発完了後） | ほぼ全額削減 | [削除手順](uninstall.md) 参照 |

## 関連ドキュメント

- [CloudShell デプロイ](deploy-cloudshell.md) — 全体コスト試算
- [はじめに](getting-started.md) — デプロイ構成とオプション
- [削除手順](uninstall.md) — リソースのクリーンアップ
