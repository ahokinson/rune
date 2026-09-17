/**
 * Canonical logical key names used throughout the input layer. These strings
 * match the `event.key` values produced by terminal input libraries.
 *
 * @module
 */

/**
 * Map of friendly key aliases to their `event.key` string values. Use these
 * constants instead of raw strings so renames stay in one place.
 *
 * @example
 * ```ts
 * keyboard.wasPressed(Keys.Space)
 * ```
 */
export const Keys = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
  Space: "space",
  Enter: "return",
  Escape: "escape",
  Tab: "tab",
  Backspace: "backspace",
  Delete: "delete",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
  A: "a",
  B: "b",
  C: "c",
  D: "d",
  E: "e",
  F: "f",
  G: "g",
  H: "h",
  I: "i",
  J: "j",
  K: "k",
  L: "l",
  M: "m",
  N: "n",
  O: "o",
  P: "p",
  Q: "q",
  R: "r",
  S: "s",
  T: "t",
  U: "u",
  V: "v",
  W: "w",
  X: "x",
  Y: "y",
  Z: "z",
  Zero: "0",
  One: "1",
  Two: "2",
  Three: "3",
  Four: "4",
  Five: "5",
  Six: "6",
  Seven: "7",
  Eight: "8",
  Nine: "9",
  Backtick: "`",
} as const

/** Union of every {@link Keys} string value. */
export type KeyName = (typeof Keys)[keyof typeof Keys]
