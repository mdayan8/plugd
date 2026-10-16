# Use Plugd with your coding agent

`npx getplugd mcp` runs a local MCP server with four tools: `audit_site`, `get_fix_plan`, `track_questions` and `get_history` ([reference](../reference/mcp-tools.md)). Connect it once, then ask in plain language:

> Audit our site for AI visibility and apply the fix plan in this repo.

The server reads `GEMINI_API_KEY` and/or `OPENROUTER_API_KEY` from its environment. Without a key, `audit_site` and `get_fix_plan` still work (crawler, content and fix plan), and the tracking tools explain which key is missing.

## Claude Code

**Option A: the plugin.** You get the MCP server and the six AEO/GEO skills:

```
/plugin marketplace add mdayan8/plugd
/plugin install plugd@plugd
```

The plugin passes `GEMINI_API_KEY` and `OPENROUTER_API_KEY` through from your shell, so export them before starting Claude Code.

**Option B: MCP only.**

```bash
claude mcp add plugd -e GEMINI_API_KEY=your-key -- npx -y getplugd mcp
```

## Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.plugd]
command = "npx"
args = ["-y", "getplugd", "mcp"]
env = { GEMINI_API_KEY = "your-key" }
```

## Cursor

Add to `.cursor/mcp.json` in your project:

```json
{ "mcpServers": { "plugd": { "command": "npx", "args": ["-y", "getplugd", "mcp"], "env": { "GEMINI_API_KEY": "your-key" } } } }
```

Don't commit this file if it contains a key. Add it to `.gitignore`, or use Cursor's global MCP settings.

## OpenCode

Add to `opencode.json`:

```json
{ "mcp": { "plugd": { "type": "local", "command": ["npx", "-y", "getplugd", "mcp"], "environment": { "GEMINI_API_KEY": "your-key" } } } }
```

## Using the skills without the plugin

Copy the folders in [`skills/`](../../skills/) into your agent's skills directory (for Claude Code, `~/.claude/skills/` or `.claude/skills/` in a project). Each skill tells the agent when to use it.

## Good prompts to try

- "Audit acme.com for AI visibility and explain the top three fixes."
- "Apply the robots.txt and structured data fixes from the Plugd plan in this repo."
- "Track our buyer questions with a $0.50 cap and tell me who's named instead of us."
- "Show the AI visibility history and whether anything clearly dropped."

`track_questions` spends your key's credits. Its description tells the agent to confirm with you first, and it's always capped (default $0.50, maximum $5 per call).
