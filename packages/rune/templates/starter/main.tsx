import { render } from "@opentui/solid"
import { App } from "./App"

// Entry point: hand the App component to OpenTUI's renderer, which sets up the
// terminal (raw mode, input polling, resize, cleanup on exit) for us.
render(() => <App />)
