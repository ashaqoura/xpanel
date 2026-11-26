import { describe, expect, it } from 'vitest'
import { v2Theme } from './theme.ts'
import { V2_TOKENS_CSS } from './tokens.ts'

// WCAG 2.2 contrast ratio of two opaque #rrggbb colors.
const channel = (hex: string, at: number): number => { const value = parseInt(hex.slice(at, at + 2), 16) / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4 }
const luminance = (hex: string): number => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
const contrastRatio = (a: string, b: string): number => { const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (high! + 0.05) / (low! + 0.05) }

describe('v2 color tokens', () => {
  const light = /\[data-ui-theme="v2"\]\{color-scheme:light;([^}]*)\}/.exec(V2_TOKENS_CSS)![1]!
  const dark = /\[data-ui-theme="v2"\]\[data-theme="dark"\]\{color-scheme:dark;([^}]*)\}/.exec(V2_TOKENS_CSS)![1]!
  const value = (block: string, name: string): string | undefined => new RegExp(`(?:^|;)${name}:([^;]+)`).exec(block)?.[1]

  it('points every Metronic palette variable at a v2 token, so the v2 tokens stay the one source of color', () => {
    for (const [variable, token] of [
      ['--background', '--bg'], ['--card', '--surface'], ['--popover', '--surface'], ['--foreground', '--text'], ['--card-foreground', '--text'],
      ['--primary', '--accent-fill'], ['--primary-foreground', '--on-accent'], ['--secondary', '--sunken'], ['--secondary-foreground', '--text-2'],
      ['--kt-muted', '--sunken'], ['--kt-muted-foreground', '--muted'], ['--kt-accent', '--sunken'], ['--border', '--line'], ['--input', '--line-strong'],
    ] as const) expect(value(light, variable), variable).toBe(`var(${token})`)
    // The bridge is declared once; the dark scheme only changes token values, never the mapping.
    for (const variable of ['--background', '--foreground', '--primary', '--border']) expect(value(dark, variable), variable).toBeUndefined()
    expect(value(light, '--radius')).toBe('calc(var(--radius-control) + 2px)')
  })

  it('ships the Metronic palette as literal token values an installed theme package can replace', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const block = scheme === 'light' ? light : dark
      for (const name of v2Theme.packageTokens!.required) {
        expect(value(block, name)?.toLowerCase(), `${scheme} ${name}`).toBe(v2Theme.packageTokens!.defaults[scheme][name])
      }
      for (const [text, background] of v2Theme.packageTokens!.contrast) {
        expect(contrastRatio(value(block, text)!.toLowerCase(), value(block, background)!.toLowerCase()), `${scheme} ${text} on ${background}`).toBeGreaterThanOrEqual(4.5)
      }
    }
    expect(contrastRatio(value(light, '--muted')!.toLowerCase(), value(light, '--surface')!.toLowerCase())).toBeGreaterThanOrEqual(4.5)
    expect(value(light, '--radius-card')).toBe('12px')
    expect(value(light, '--radius-control')).toBe('6px')
    expect(value(light, '--target')).toBe('2.75rem')
    // Text-control boundaries keep 3:1 non-text contrast against the page and the card in both schemes.
    for (const block of [light, dark]) {
      expect(contrastRatio(value(block, '--line-strong')!.toLowerCase(), (value(block, '--bg') ?? value(light, '--bg')!).toLowerCase())).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(value(block, '--line-strong')!.toLowerCase(), (value(block, '--surface') ?? value(light, '--surface')!).toLowerCase())).toBeGreaterThanOrEqual(3)
    }
    for (const name of ['--ok', '--warn', '--bad', '--scrim']) expect(value(dark, name), name).toBeDefined()
  })
})

describe('v2 font tokens', () => {
  it('sets Latin text in Inter and includes self-hosted IBM Plex Sans Arabic in sans, mono fallback and Arabic locale rules', () => {
    const sans = /--font-sans:([^;]+);/.exec(V2_TOKENS_CSS)![1]!.split(',')
    expect(sans.slice(0, 2)).toEqual(["'Inter'", "'IBM Plex Sans Arabic'"])
    const mono = /--font-mono:([^;]+);/.exec(V2_TOKENS_CSS)![1]!.split(',')
    expect(mono[0]).toBe("'IBM Plex Mono'")
    expect(mono[1]).toBe("'IBM Plex Sans Arabic'")
    expect(mono.at(-1)).toBe('sans-serif')
    expect(mono).not.toContain('monospace')
    expect(V2_TOKENS_CSS).toContain("[data-ui-theme=\"v2\"]:lang(ar){--font-sans:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}")
    expect(V2_TOKENS_CSS).toContain("[data-ui-theme=\"v2\"] [lang=\"ar\"]{font-family:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}")
  })
})
