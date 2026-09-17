import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "cli/index.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node18",
  dts: {
    entry: {
      index: "src/index.ts",
    },
  },
  clean: true,
  outDir: "dist",
  external: ["solid-js", "@opentui/core", "@opentui/solid"],
})
