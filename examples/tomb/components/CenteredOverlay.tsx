import type { JSX } from "solid-js"

export interface CenteredOverlayProps {
  children: JSX.Element
}

/** Full-screen absolute overlay that centers its children in a column. */
export function CenteredOverlay(props: CenteredOverlayProps): JSX.Element {
  return (
    <box position="absolute" left={0} top={0} width="100%" height="100%" alignItems="center" justifyContent="center">
      <box flexDirection="column" alignItems="center">
        {props.children}
      </box>
    </box>
  )
}
