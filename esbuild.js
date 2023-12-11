#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.js",
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    external: ['sharp']
  })
  .catch(() => process.exit(1))
