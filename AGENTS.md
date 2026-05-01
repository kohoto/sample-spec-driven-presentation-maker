# Spec-Driven Presentation Maker

AI-powered presentation generation toolkit with a 4-layer architecture.
Choose the layer that matches your environment.

## Which Layer to Use

| Your environment | Layer | AWS required |
|---|---|:---:|
| SKILL.md-compatible agent (Claude Code, Codex CLI, Cursor, Kiro, etc.) | **L1** — `skill/` | No |
| Local MCP client (Claude Desktop, Claude Cowork, VS Code, Kiro IDE, etc.) | **L2** — `mcp-local/` | No |
| Remote-only MCP client (Claude.ai web, etc. — no local process) | **L3** — `mcp-server/` + `infra/` | Yes |
| Web UI in browser | **L4** — Full stack | Yes |

---

## Layer 1: Agent Skill (Recommended)

Install the engine as a Python package and use via SKILL.md.

```bash
pip install git+https://github.com/aws-samples/sample-spec-driven-presentation-maker.git#subdirectory=skill
```

Or work directly from the repo:

```bash
cd skill && uv sync
```

The skill entry point is `skill/SKILL.md`. Read it to understand available workflows.

### Key commands

```bash
uv run python3 scripts/pptx_builder.py examples      # Show example patterns
uv run python3 scripts/pptx_builder.py workflows <step>  # Run a workflow step (e.g. create-new-1-outline)
uv run python3 scripts/pptx_builder.py guides        # List available guides
```

### Optional: Download icons

```bash
uv run python3 scripts/download_aws_icons.py
uv run python3 scripts/download_material_icons.py
```

---

## Layer 2: Local MCP Server

For MCP clients that connect via stdio.

```bash
cd mcp-local && uv sync
```

Add to your MCP client config:

```json
{
  "mcpServers": {
    "spec-driven-presentation-maker": {
      "command": "uv",
      "args": ["run", "--directory", "/absolute/path/to/mcp-local", "python", "server.py"]
    }
  }
}
```

---

## Layer 3: Remote MCP Server (AWS)

For remote MCP clients that cannot run local processes.

### macOS / Linux / WSL

```bash
bash scripts/deploy.sh --region us-east-1 --layer3
```

### Windows (no Bash)

Use [AWS CloudShell](https://console.aws.amazon.com/cloudshell/):

```bash
git clone https://github.com/aws-samples/sample-spec-driven-presentation-maker.git
cd sample-spec-driven-presentation-maker
bash scripts/deploy.sh --region us-east-1 --layer3
```

See [CloudShell Deploy Guide](docs/en/deploy-cloudshell.md) for details.

---

## Layer 4: Full Stack (Web UI)

### macOS / Linux / WSL

```bash
bash scripts/deploy.sh --region us-east-1
```

### Windows (no Bash)

Use [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) — same clone steps as Layer 3, then:

```bash
bash scripts/deploy.sh --region us-east-1
```

See [CloudShell Deploy Guide](docs/en/deploy-cloudshell.md) for post-deployment steps (Cognito user creation, endpoint URLs).

---

## Project Structure

```
skill/            L1 — Engine, references, templates, SKILL.md
mcp-local/        L2 — Local stdio MCP server
mcp-server/       L3 — Streamable HTTP MCP server (AWS)
infra/            L3-4 — CDK stacks
agent/            L4 — Strands Agent
api/              L4 — REST API Lambda
web-ui/           L4 — React Web UI
```

## Conventions

- Engine source of truth: `skill/sdpm/`
- Templates: `skill/templates/` (dark/light)
- Slide spec format: JSON (see `skill/references/` for schema and examples)
- Python: use `uv run` instead of direct `python`
- Linting: `make lint` (ruff)
- Tests: `make test` (pytest)

## Further Documentation

- [Custom Templates & Assets](docs/en/custom-template.md) — Adding .pptx templates and icons
- [Architecture](docs/en/architecture.md) — Data flow, auth model, MCP tool reference
- [Cost Estimates](docs/en/cost.md) — Monthly cost breakdown
- `infra/config.yaml` — Deployment configuration (stacks, model ID, WAF, features)

## Boundaries

- Do not modify `skill/templates/*.pptx` directly — these are base templates
- Do not modify `skill/references/` without understanding the workflow dependency chain
- `infra/config.yaml` contains deployment settings — review before changing
- `skill/assets/` contains downloaded icons — regenerate via download scripts, do not edit manually
