import { Keys, useInput, useUpdate } from "@ahokinson/rune"

/** Calls `onAdvance` once whenever one of `keys` is pressed (defaults to SPACE/ENTER). */
export function useAdvanceOnKey(onAdvance: () => void, keys: string[] = [Keys.Space, Keys.Enter]): void {
  const input = useInput()
  useUpdate(() => {
    if (keys.some((key) => input.wasPressed(key))) onAdvance()
  })
}
