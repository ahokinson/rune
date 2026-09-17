import { render } from "@opentui/solid"
import { App } from "./App"

render(() => <App />, {
  useMouse: true,
  enableMouseMovement: true,
})
