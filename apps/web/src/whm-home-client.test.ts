/// <reference lib="dom" />
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { scriptMessageKeys, translator } from './i18n.ts'
import { WHM_HOME_CLIENT_BINDING } from './whm-home-client.ts'

const tick = () => new Promise(resolve => setTimeout(resolve, 0))
const el = (selector: string) => document.querySelector<HTMLElement>(selector)!
const change = (detail: string[]) => document.dispatchEvent(new CustomEvent('xpanel:favorites-changed', { detail }))
function boot(read: (path: string) => unknown) {
  document.body.innerHTML = `<a data-cmdk-item="/whm/plans" data-cmdk-persistable="true" href="/whm/plans"><strong>Plans</strong></a>
    <section data-whm-favorites><p data-whm-favorites-empty></p><ul data-whm-favorites-list></ul><p data-whm-favorites-status hidden></p></section>
    <section data-whm-inbox><ul data-whm-inbox-list></ul><p data-whm-inbox-status></p></section>`
  const request = vi.fn(async (method: string, path: string, body?: unknown) => method === 'GET' ? read(path) : body)
  ;(window as Window & { xpanelSessionRequest?: unknown }).xpanelSessionRequest = request
  new Function(`return ${WHM_HOME_CLIENT_BINDING}`)()()
  return request
}

describe('WHM home client reads', () => {
  it.each<[string, () => unknown]>([
    ['an unrelated body', () => ({ status: 'created' })],
    ['an old shape', () => ({ routes: 'x', descriptions: true, items: 'x', unread: 0 })],
    ['a non-object body', () => []],
    ['an API error', () => { throw Object.assign(new Error('unavailable'), { status: 503 }) }],
  ])('shows the unavailable state, not an empty list, after %s', async (_label, read) => {
    const request = boot(read)
    await tick()
    change(['/whm/plans'])
    await tick()
    expect(el('[data-whm-favorites-status]').hidden).toBe(false)
    expect(el('[data-whm-favorites-status]').dataset.state).toBe('unavailable')
    expect(el('[data-whm-favorites-empty]').hidden).toBe(true)
    expect(el('[data-whm-inbox-status]').dataset.state).toBe('unavailable')
    expect(request.mock.calls.filter(call => call[0] !== 'GET')).toEqual([])
  })

  it('paints a readable list and saves over it', async () => {
    const request = boot(path => path === '/api/admin/favorites' ? { routes: ['/whm/plans'], descriptions: false } : { items: [], unread: 0 })
    await tick()
    expect(el('[data-whm-favorites-list]').children).toHaveLength(1)
    expect(el('[data-whm-favorites-empty]').hidden).toBe(true)
    expect(el('[data-whm-inbox-status]').dataset.state).toBe('read')
    change([])
    await tick()
    expect(request).toHaveBeenCalledWith('PUT', '/api/admin/favorites', { routes: [], descriptions: false })
    expect(el('[data-whm-favorites-list]').children).toHaveLength(0)
    expect(el('[data-whm-favorites-empty]').hidden).toBe(false)
  })

  // "Up" / "Down" are service states; the reorder buttons carry their own action text so Arabic does not read "running" / "stopped".
  it('labels the reorder buttons as move actions and ships those messages to the page', async () => {
    boot(path => path === '/api/admin/favorites' ? { routes: ['/whm/plans'], descriptions: false } : { items: [], unread: 0 })
    await tick()
    const labels = [...el('[data-whm-favorites-list]').querySelectorAll('button')].map(button => button.textContent)
    expect(labels).toEqual(['Move up', 'Move down', 'Remove'])
    const keys = scriptMessageKeys(`<script>${WHM_HOME_CLIENT_BINDING}</script>`)
    expect(keys).toEqual(expect.arrayContaining(['Move up', 'Move down']))
    expect(keys).not.toContain('Up')
    expect(keys).not.toContain('Down')
    const ar = translator('ar')
    expect([ar('Move up'), ar('Move down')]).toEqual(['نقل للأعلى', 'نقل للأسفل'])
    expect([ar('Up'), ar('Down')]).toEqual(['يعمل', 'متوقف'])
  })
})
