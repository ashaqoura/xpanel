import { createRequire } from 'node:module'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

interface PicomatchModule {
  (glob: string, options?: Record<string, unknown>): (input: string) => boolean
  isMatch(input: string, glob: string, options?: Record<string, unknown>): boolean
  makeRe(glob: string, options?: Record<string, unknown>): RegExp
  parse(input: string, options?: Record<string, unknown>): Record<string, unknown>
  compileRe(state: Record<string, unknown>, options?: Record<string, unknown>): RegExp
}

const requireFromVitest = createRequire(fileURLToPath(import.meta.resolve('vitest/package.json')))
const picomatch = requireFromVitest('picomatch') as PicomatchModule

describe('picomatch GHSA-fc5q-39xc-vjpf mitigation', { tags: ['unit'] }, () => {
  it('completes long near-miss inputs on single-branch repeated wildcard extglobs in bounded linear time', () => {
    const patterns = [
      '+(*)',
      '+(*a)',
      '*(*a)',
      '+(*)b',
      '+(a*)b',
      '+(a*b)',
      '*(a*b)c',
      '+(*.js)x',
      '+(?*)',
      '+([a-z]*)',
      '+(@(*a))',
      '+(a*a)',
    ]
    const optionsList: Array<Record<string, unknown>> = [
      {},
      { dot: true },
      { windows: true },
      { bash: true },
      { nocase: true },
      { capture: true },
      { contains: true },
      { maxExtglobRecursion: false },
    ]
    const nearMiss = `${'a'.repeat(5000)}!`
    const started = performance.now()
    for (const options of optionsList) {
      for (const pattern of patterns) {
        const matcher = picomatch(pattern, options)
        expect(typeof matcher(nearMiss)).toBe('boolean')
      }
    }
    expect(performance.now() - started).toBeLessThan(80)
  })

  it('preserves ordinary matching semantics and blocks unsafe compileRe option switching', () => {
    const cases: Array<[string, RegExp]> = [
      ['+(*a)', /^(?:(?=.)(?:[^/]*?a)+)$/],
      ['*(*a)', /^(?:(?=.)(?:[^/]*?a)*)$/],
      ['+(a*b)', /^(?:(?=.)(?:a[^/]*?b)+)$/],
      ['+(*)', /^(?:(?=.)(?:[^/]*?)+)$/],
      ['x*(*a)y', /^(?:x(?:[^/]*?a)*y)$/],
    ]
    const alphabet = ['a', 'b', '/']
    const inputs = ['']
    for (let length = 0; length < 4; length++) {
      for (const value of inputs.filter((item) => item.length === length)) {
        for (const ch of alphabet) inputs.push(value + ch)
      }
    }
    for (const [pattern, reference] of cases) {
      const compiled = picomatch.makeRe(pattern)
      for (const input of inputs) {
        expect(compiled.test(input), `${pattern} on ${JSON.stringify(input)}`).toBe(reference.test(input))
      }
    }
    const parsed = picomatch.parse('+(*a)')
    expect(() => picomatch.compileRe(parsed, { contains: true })).toThrow(/Reparse repeated wildcard/)
    expect(() => picomatch.compileRe(parsed, { capture: true })).toThrow(/Reparse repeated wildcard/)
    expect(picomatch.compileRe(parsed).test('aaaa')).toBe(true)
  })
})
