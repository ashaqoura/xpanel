import { createHash } from 'node:crypto'
import type { ThemeAsset } from '../contract.ts'

export interface V2Stylesheet extends ThemeAsset {
  readonly version: string
}

/** Each immutable stylesheet is independently cached and invalidated by its actual bytes. */
export function createV2Stylesheet(name: string, sources: readonly string[]): Readonly<V2Stylesheet> {
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)) throw new Error('Invalid v2 stylesheet name')
  // Every v2 rule lives in the `v2` cascade layer, which the Metronic stylesheet orders above Tailwind's reset and
  // below its components and utilities: a `kt-*` or utility class on an element wins over the older v2 rule.
  const body = '@layer v2{\n' + sources.map(source => source.trim()).join('\n') + '\n}\n'
  const version = createHash('sha256').update(body).digest('hex').slice(0, 16)
  const path = `/assets/themes/v2/${name}.css` as const
  return Object.freeze({ path, href: `${path}?v=${version}`, contentType: 'text/css; charset=utf-8', version, body })
}
