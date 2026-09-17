/**
 * YAML loaders backed by Bun's built-in parser.
 *
 * `loadYaml` is async (reads via `Bun.file`); `loadYamlSync` reads
 * synchronously with `node:fs` for use during pack mounting where the call
 * graph must stay synchronous.
 *
 * @module
 */

import { readFileSync } from "node:fs"

/**
 * Read and parse a YAML file asynchronously.
 *
 * @param path - Filesystem path to the YAML file.
 * @returns The parsed contents, typed as `T`.
 */
export async function loadYaml<T>(path: string): Promise<T> {
  const file = Bun.file(path)
  const text = await file.text()
  return Bun.YAML.parse(text) as T
}

/**
 * Read and parse a YAML file synchronously.
 *
 * @param path - Filesystem path to the YAML file.
 * @returns The parsed contents, typed as `T`.
 */
export function loadYamlSync<T>(path: string): T {
  const content = readFileSync(path, "utf-8")
  return Bun.YAML.parse(content) as T
}
