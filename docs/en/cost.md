# Cost Estimates

Estimated AWS costs when deploying SDPM.

> Estimates based on publicly listed pricing as of April 2026. AWS pricing may change; always check the latest at [Amazon Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/), [AgentCore Pricing](https://aws.amazon.com/bedrock/agentcore/pricing/), [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/), and [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/).

## Overall estimate

Estimates for Layer 4 full stack (us-east-1). Assumes a team of ~10 users generating ~20 decks per month.

### Fixed costs (always running)

| Resource | Est. monthly |
|---|---|
| CloudFront | ~$1 |
| Cognito User Pool | $0 |
| API Gateway REST + Lambda (API) | ~$1 |
| S3 (3 buckets) | ~$1 |
| DynamoDB On-Demand | ~$1 |
| ECR (2 images) | ~$1 |
| CloudWatch Logs | ~$1 |

### Variable costs (usage-dependent)

| Resource | Est. for 20 decks/month |
|---|---|
| AgentCore Runtime (MCP Server + Agent) | ~$5-10 |
| Bedrock Claude Sonnet 4.6 (Agent LLM) | ~$80-130 |
| AgentCore Code Interpreter | ~$1-3 |
| AgentCore Memory | ~$1 |
| Slide search (Bedrock KB + Titan Embed V2 + S3 Vectors) | ~$0.01-0.05 |

### Total

**~$95–145/month** (varies with usage)

## Slide search cost detail

SDPM provides cross-deck semantic search out of the box. The following AWS resources are created:

- Amazon Bedrock Knowledge Bases
- Amazon Titan Text Embeddings V2 (1024 dimensions)
- Amazon S3 Vectors (GA November 2025)

S3 Vectors is up to 90% cheaper than traditional vector database services, so for typical SDPM deployments this feature runs for **under $0.05 / month**.

### Unit pricing (April 2026, us-east-1)

| Item | Rate |
|---|---|
| Titan Embed Text V2 | $0.00002 / 1,000 tokens |
| S3 Vectors storage | $0.06 / GB / month |
| S3 Vectors PUT | $0.20 / GB uploaded |
| S3 Vectors query (API call) | $0.0025 / 1,000 requests |
| S3 Vectors query (data processed) | $0.004 / TB (first 100K vectors) |
| Bedrock Knowledge Bases | No additional charge (only storage + model invocation apply) |

### Scale-based estimates

Each vector is roughly 5 KB (1024 dimensions × 4 bytes + metadata / keys).

| Scale | Slides | Monthly adds | Monthly queries | Monthly cost |
|---|---|---|---|---|
| Individual use | 300 | 50 | 50 | **$0.0005** |
| Medium team | 10,000 | 2,000 | 5,000 | **$0.04** |
| Company-wide (hundreds) | 125,000 | 10,000 | 50,000 | **$0.40** |
| Very large scale | 1,500,000 | 100,000 | 500,000 | **$10** |

### Individual-use breakdown

Assumptions: 300 slides, 300 tokens/slide on average, 50 new slides/month, 50 searches/month.

| Item | Calculation | Monthly |
|---|---|---|
| Storage | 300 × 5 KB = 1.5 MB × $0.06/GB | $0.0001 |
| Embedding | 50 × 300 tokens × $0.00002/1K | $0.0003 |
| PUT | 50 × 5 KB = 250 KB × $0.20/GB | $0.00005 |
| Query (API) | 50 × $0.0025/1K | $0.000125 |
| Query (data processed) | 75 MB × $0.004/TB | $0.0000003 |
| **Total** | | **$0.0005** |

### Scaling beyond typical use

- **More than ~5M vectors**: S3 Vectors per-index query cost starts to climb. Consider partitioning.
- **More than ~1M queries/month**: Query data processing cost becomes dominant. Consider a caching layer.

## Cost-reduction tips

| Method | Savings | Notes |
|---|---|---|
| Prompt caching | LLM cost up to 80% reduction | Enabled by default for supported models |
| Don't use `--enable-invocation-logging` (default) | No CloudWatch Logs cost | Skip if MIL logging isn't needed |
| Switch to a smaller model | Large LLM cost reduction | Set `modelId` to Claude Haiku 4.5, Nova Lite, etc. |
| CDK destroy after development | Nearly full cost elimination | See [Uninstall Guide](uninstall.md) |

## Related documents

- [Getting Started](getting-started.md) — Deployment architecture and options
- [CloudShell Deploy Guide](deploy-cloudshell.md) — CloudShell deployment steps
- [Uninstall Guide](uninstall.md) — Resource cleanup
