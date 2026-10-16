# Track more than one site

Each history folder tracks exactly one site. Plugd stops you from mixing two sites in one folder, so give each site its own `--dir`:

```bash
npx getplugd track acme.com --dir .plugd/acme
npx getplugd track tallyhq.com --dir .plugd/tallyhq

npx getplugd report --dir .plugd/acme
npx getplugd report --dir .plugd/tallyhq
```

Tracking a competitor this way shows you which questions they win, and which sources the engines cite for them.

## In GitHub Actions

Use one step per site, each with its own `dir`:

```yaml
      - uses: mdayan8/plugd@v1
        with:
          site: acme.com
          dir: .plugd/acme
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
      - uses: mdayan8/plugd@v1
        with:
          site: tallyhq.com
          dir: .plugd/tallyhq
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          open-issue: 'false'
```
