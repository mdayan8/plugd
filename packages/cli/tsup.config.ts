import { defineConfig } from 'tsup'

// Bundles @plugd/audit into one ESM file so `npx getplugd` has no workspace deps.
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  noExternal: ['@plugd/audit', '@getplugd/engines'],
})
