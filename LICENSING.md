# Licensing

Plugd's open-source repo uses two licenses.

| What | License | File |
|---|---|---|
| **Code:** `packages/` (audit, engines, CLI and MCP server), `action.yml`, examples | [AGPL-3.0](LICENSE) | [`LICENSE`](LICENSE) |
| **Content:** `skills/`, `prompts/`, `research/` | [MIT](skills/LICENSE) | `skills/LICENSE`, `prompts/LICENSE`, `research/LICENSE` |

## What this means for you

- **Using Plugd is free and unrestricted.** Running `npx getplugd`, the GitHub Action or the MCP server on your machine, in your CI, or for your company's own sites places no obligations on you.
- **Changing the code for yourself is fine,** too. AGPL obligations only start when you *distribute* a modified version, or **run a modified version as a service for others** over a network. In those cases you must make your modified source available under the AGPL.
- **Skills, prompts and research are MIT.** Copy them, adapt them, ship them in your own agent, commercial or not. Keep the copyright notice.

## Versions before the switch

Code released before 2026-10-16, including getplugd 0.1.0 on npm and the git history up to tag `v1` (commit `8ad03f2`), was published under MIT and stays MIT. From getplugd 0.3.0 and later commits onward, the code is AGPL-3.0.

## Contributing

Contributions are accepted under the license of the part they change: AGPL-3.0 for code, MIT for skills, prompts and research. By opening a pull request you agree to that.

Questions about commercial licensing: open an issue or reach us through [Plugd Cloud](https://plugd.getplugd.workers.dev).
