import { defineConfig } from "tsup"

// JS output comes from scripts/build.ts (Bun.build, so it can use @opentui/solid's
// Bun-only JSX transform plugin). This config only runs `tsup --dts-only`, which
// doesn't touch JSX at all, so it needs no plugin and must not delete the JS files
// scripts/build.ts already wrote.
export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: {
    entry: {
      index: "src/index.ts",
    },
  },
  clean: false,
  outDir: "dist",
  external: ["solid-js", "@opentui/core", "@opentui/solid"],
})
