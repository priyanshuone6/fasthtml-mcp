<p align="center">
  <img src="https://fastht.ml/docs/logo.svg" alt="FastHTML logo" width="400" />
  <img src="https://avatars.githubusercontent.com/u/182288589" alt="FastHTML avatar" width="110" />
</p>

# FastHTML Docs MCP

[![MCP](https://img.shields.io/badge/MCP-Remote_Server-7C3AED)](https://modelcontextprotocol.io/)
[![FastHTML](https://img.shields.io/badge/FastHTML-Docs-0EA5E9)](https://www.fastht.ml/docs/)
[![GitHub stars](https://img.shields.io/github/stars/priyanshuone6/fasthtml-mcp?style=social)](https://github.com/priyanshuone6/fasthtml-mcp)

FastHTML publishes AI-friendly documentation context, but it does not provide an MCP server. This project exists to bridge that gap with a public FastHTML docs MCP endpoint on Cloudflare Workers.

It lets MCP-compatible clients search FastHTML docs, read specific sections, and answer framework questions directly in the editor.

> Important
> This public endpoint runs on Cloudflare's free plan. Please be mindful of shared usage and best-effort availability. If you expect heavier or sustained usage, self-host your own worker.

## What It Does

| Tool | Description |
|---|---|
| `search_fasthtml_docs` | Search the FastHTML docs context and return the most relevant sections |
| `read_fasthtml_section` | Read a section by heading or close heading match |

Source documentation is fetched from:

```txt
https://www.fastht.ml/docs/llms-ctx.txt
```

## Getting Started

### Quick Install

[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=FastHTML%20Docs%20MCP&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Ffasthtml-mcp.chief-575.workers.dev%2Fmcp%22%7D)
[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=FastHTML%20Docs%20MCP&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vZmFzdGh0bWwtbWNwLmNoaWVmLTU3NS53b3JrZXJzLmRldi9tY3AifQ==)

### Manual Installation

Use this configuration in most MCP clients:

```json
{
  "servers": {
    "FastHTML Docs MCP": {
      "type": "http",
      "url": "https://fasthtml-mcp.chief-575.workers.dev/mcp"
    }
  }
}
```

<details>
<summary>VS Code</summary>

Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) or add it from the CLI:

```bash
code --add-mcp '{"name":"FastHTML Docs MCP","type":"http","url":"https://fasthtml-mcp.chief-575.workers.dev/mcp"}'
```
</details>

<details>
<summary>Cursor</summary>

Open Cursor Settings, go to MCP, then add a new server using the same HTTP URL from the standard configuration above.
</details>

<details>
<summary>Claude Code</summary>

```bash
claude mcp add FastHTML\ Docs\ MCP --url https://fasthtml-mcp.chief-575.workers.dev/mcp
```
</details>

<details>
<summary>Codex</summary>

Create or edit `~/.codex/config.toml` and add:

```toml
[mcp_servers."FastHTML Docs MCP"]
url = "https://fasthtml-mcp.chief-575.workers.dev/mcp"
```

More details: [Codex MCP documentation](https://github.com/openai/codex/blob/main/codex-rs/config.md#mcp_servers).
</details>

<details>
<summary>GitHub Copilot Coding Agent</summary>

```json
{
  "mcpServers": {
    "FastHTML Docs MCP": {
      "type": "remote",
      "url": "https://fasthtml-mcp.chief-575.workers.dev/mcp",
      "tools": [
        "*"
      ]
    }
  }
}
```

Add this under repository settings in Copilot > Coding agent.
</details>

## Example Prompts

- `Search the FastHTML docs for route handlers and path parameters`
- `Read the FastHTML section about forms`
- `What does FastHTML say about HTMX integration?`
- `Find examples related to table rendering in FastHTML`

## Local Development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run type-check
npm run deploy
```

Local MCP endpoint:

```txt
http://localhost:8788/mcp
```

## Deploy

This project deploys to Cloudflare Workers.

Manual deploy options:

- Run `npm run deploy`
- Or use the `Deploy Worker` GitHub Actions workflow

## Notes

- Public endpoint: `https://fasthtml-mcp.chief-575.workers.dev/mcp`
- No local install is required for end users
- Only connect MCP servers you trust

## Self-Hosting

If you want better reliability or control, fork this repository and deploy your own worker.

Then replace the public endpoint in the examples above with your own:

```txt
https://your-worker.your-subdomain.workers.dev/mcp
```
