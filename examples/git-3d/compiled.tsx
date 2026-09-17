// Entry point for the standalone `git-3d` binary (`bun build --compile`). It
// differs from main.tsx only by first installing OpenTUI's runtime plugin
// support, which re-registers the Solid/OpenTUI runtime modules inside the
// compiled executable (the dev preload's source transform has already run at
// build time, so only the runtime side is needed here).
import "@opentui/solid/runtime-plugin-support"
import { render } from "@opentui/solid"
import { App } from "./App"

render(() => <App />, {
  useMouse: true,
  enableMouseMovement: true,
})
