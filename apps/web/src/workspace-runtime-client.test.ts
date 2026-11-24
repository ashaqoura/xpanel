/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { WORKSPACE_RUNTIME_SCRIPT } from './workspace-runtime-client.ts'
import { V2_SIDEBAR_STATE_SCRIPT } from './themes/v2/shell/sidebar-state.ts'

function bootRuntime(): void {
  const win = window as unknown as Record<string, unknown>
  if (!win.__xpanelWorkspaceRuntime) {
    new Function(WORKSPACE_RUNTIME_SCRIPT)()
  } else if (typeof win.__xpanelMountWorkspace === 'function') {
    (win.__xpanelMountWorkspace as (root: Document) => void)(document)
  }
}

afterEach(() => {
  document.body.replaceChildren()
  window.sessionStorage.clear()
})

describe('workspace runtime client', () => {
  it('updates #xp-ops-dock from nested job.updated event.data payloads and updates generation chips', () => {
    document.body.innerHTML = `
      <div id="xp-ops-dock" hidden></div>
      <span data-generation-chip="4"><span class="v2-muted">gen 4</span></span>
    `
    bootRuntime()

    document.dispatchEvent(new CustomEvent('xpanel:ws-event', {
      detail: {
        id: 'evt-1',
        at: '2026-11-20T12:00:00.000Z',
        kind: 'job.updated',
        scope: { kind: 'global' },
        data: {
          jobId: 'job-42',
          kind: 'account.backup',
          status: 'running',
          progress: 60,
          logChunk: 'Packing archive',
        },
      },
    }))

    const dock = document.getElementById('xp-ops-dock')!
    expect(dock.hidden).toBe(false)
    const item = dock.querySelector('[data-ops-id="job-42"]')!
    expect(item.getAttribute('data-ops-state')).toBe('running')
    expect(item.textContent).toContain('account.backup')
    expect(item.textContent).toContain('60%')
    expect(item.textContent).toContain('Packing archive')

    document.dispatchEvent(new CustomEvent('xpanel:ws-event', {
      detail: {
        id: 'evt-2',
        at: '2026-11-20T12:00:05.000Z',
        kind: 'job.updated',
        scope: { kind: 'global' },
        data: {
          jobId: 'job-42',
          kind: 'account.backup',
          status: 'failed',
          progress: 60,
          error: 'Quota exceeded',
        },
      },
    }))
    const updated = dock.querySelector('[data-ops-id="job-42"]')!
    expect(updated.getAttribute('data-ops-state')).toBe('failed')
    expect(updated.textContent).toContain('Quota exceeded')

    document.dispatchEvent(new CustomEvent('xpanel:ws-event', {
      detail: {
        id: 'evt-3',
        at: '2026-11-20T12:00:10.000Z',
        kind: 'reconcile.applied',
        scope: { kind: 'global' },
        data: { generationId: 9 },
      },
    }))
    const chip = document.querySelector('[data-generation-chip]')!
    expect(chip.getAttribute('data-generation-chip')).toBe('9')
    expect(chip.querySelector('.v2-muted')?.textContent).toBe('gen 9')
  })

  it('keeps the dirty-state baseline until xpanel:workspace-stored confirms a save', async () => {
    document.body.innerHTML = `
      <form data-server-settings-form>
        <input name="hostname" value="srv1.example.test" />
        <button type="submit">Save</button>
      </form>
    `
    bootRuntime()

    const form = document.querySelector('form')!
    const input = form.querySelector<HTMLInputElement>('input[name="hostname"]')!
    const bar = form.querySelector<HTMLElement>('.v2-save-bar')!
    const discard = bar.querySelector<HTMLButtonElement>('[data-dirty-discard]')!
    expect(bar.hidden).toBe(true)

    input.value = 'srv2.example.test'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(bar.hidden).toBe(false)

    form.addEventListener('submit', event => event.preventDefault())
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 200))

    // Failed or pending submit must NOT clear the dirty indicator or overwrite the Discard baseline.
    expect(bar.hidden).toBe(false)
    discard.click()
    expect(input.value).toBe('srv1.example.test')
    expect(bar.hidden).toBe(true)

    // After a new edit, only a matching xpanel:workspace-stored event commits the new baseline.
    input.value = 'srv3.example.test'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(bar.hidden).toBe(false)

    window.dispatchEvent(new CustomEvent('xpanel:workspace-stored', { detail: { form: 'firewall-port-rule' } }))
    expect(bar.hidden).toBe(false)

    window.dispatchEvent(new CustomEvent('xpanel:workspace-stored', { detail: { form: 'server-settings' } }))
    expect(bar.hidden).toBe(true)
  })

  it('paginates only tables explicitly opting in via data-table-paginate and skips managed tables', () => {
    const manyRows = (attrs = '') =>
      Array.from({ length: 35 }, (_, idx) => `<tr${attrs}><td>Row ${idx + 1}</td></tr>`).join('')

    document.body.innerHTML = `
      <section data-accounts-workspace>
        <div data-account-list-controls></div>
        <table id="accounts-table" data-table-paginate><tbody>${manyRows(' data-account-row')}</tbody></table>
      </section>
      <section data-list-filter>
        <table id="filtered-table" data-table-paginate><tbody>${manyRows(' data-list-row')}</tbody></table>
      </section>
      <section>
        <table id="database-table"><tbody>${manyRows()}</tbody></table>
      </section>
      <section>
        <table id="optin-table" data-table-paginate><tbody>${manyRows()}</tbody></table>
      </section>
    `
    bootRuntime()

    const pagers = document.querySelectorAll('.v2-pagination-bar')
    expect(pagers).toHaveLength(1)
    expect(document.getElementById('optin-table')!.nextElementSibling?.classList.contains('v2-pagination-bar')).toBe(true)
    expect(document.getElementById('accounts-table')!.querySelectorAll('tbody tr[hidden]')).toHaveLength(0)
    expect(document.getElementById('filtered-table')!.querySelectorAll('tbody tr[hidden]')).toHaveLength(0)
    expect(document.getElementById('database-table')!.querySelectorAll('tbody tr[hidden]')).toHaveLength(0)
    expect(document.getElementById('optin-table')!.querySelectorAll('tbody tr[hidden]')).toHaveLength(10)
  })

  it('switches guided wizards to step-by-step mode, formats timezones in ASCII digits, and toggles sidebar collapse', () => {
    document.body.innerHTML = `
      <div class="v2-shell">
        <aside class="v2-side"><button type="button" data-action="toggle-sidebar-collapse" aria-expanded="true"></button></aside>
        <div data-wizard="guided">
          <button type="button" data-wizard-toggle aria-pressed="false">Step-by-step mode</button>
          <a href="#s1" data-wizard-go="1">1</a>
          <a href="#s2" data-wizard-go="2">2</a>
          <section id="s1" data-wizard-step="1"><input name="a" value="ok" /></section>
          <section id="s2" data-wizard-step="2"><input name="b" value="ok" /></section>
        </div>
        <time id="ts" datetime="2026-11-20T12:00:00Z">2026-11-20 12:00 UTC</time>
      </div>
    `
    bootRuntime()

    const toggle = document.querySelector<HTMLButtonElement>('[data-wizard-toggle]')!
    toggle.click()
    expect(document.getElementById('s1')!.getAttribute('data-wizard-hidden')).toBe('false')
    expect(document.getElementById('s2')!.getAttribute('data-wizard-hidden')).toBe('true')
    document.querySelector<HTMLAnchorElement>('[data-wizard-go="2"]')!.click()
    expect(document.getElementById('s1')!.getAttribute('data-wizard-hidden')).toBe('true')
    expect(document.getElementById('s2')!.getAttribute('data-wizard-hidden')).toBe('false')

    const win = window as unknown as { __xpanelApplyTimeZone: (tz: string) => void; __xpanelToggleSidebar: () => void }
    win.__xpanelApplyTimeZone('Asia/Dubai')
    expect(document.getElementById('ts')!.textContent).toBe('2026-11-20 16:00 Asia/Dubai')
    expect(document.getElementById('ts')!.title).toBe('UTC: 2026-11-20T12:00:00.000Z')
    win.__xpanelApplyTimeZone('UTC')
    expect(document.getElementById('ts')!.textContent).toBe('2026-11-20 12:00 UTC')

    const collapseButton = document.querySelector('[data-action="toggle-sidebar-collapse"]')!
    win.__xpanelToggleSidebar()
    expect(document.querySelector('.v2-shell')!.getAttribute('data-sidebar-collapsed')).toBe('true')
    // The root attribute the v2 head script restores before the first paint follows the toggle.
    expect(document.documentElement.getAttribute('data-sidebar-collapsed')).toBe('true')
    expect(collapseButton.getAttribute('aria-expanded')).toBe('false')
    expect(window.localStorage.getItem('xpanel.sidebar.collapsed')).toBe('1')
    win.__xpanelToggleSidebar()
    expect(document.querySelector('.v2-shell')!.hasAttribute('data-sidebar-collapsed')).toBe(false)
    expect(document.documentElement.hasAttribute('data-sidebar-collapsed')).toBe(false)
    expect(collapseButton.getAttribute('aria-expanded')).toBe('true')
    expect(window.localStorage.getItem('xpanel.sidebar.collapsed')).toBe('0')
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-user-timezone')
  })

  it('restores a saved collapsed sidebar on the root before the shell exists, then marks the shell and its toggle', () => {
    window.localStorage.setItem('xpanel.sidebar.collapsed', '1')
    new Function(V2_SIDEBAR_STATE_SCRIPT.body)()
    expect(document.documentElement.getAttribute('data-sidebar-collapsed')).toBe('true')
    document.body.innerHTML = `<div class="v2-shell"><aside class="v2-side"><button type="button" data-action="toggle-sidebar-collapse" aria-expanded="true"></button></aside></div>`
    bootRuntime()
    expect(document.querySelector('.v2-shell')!.getAttribute('data-sidebar-collapsed')).toBe('true')
    expect(document.querySelector('[data-action="toggle-sidebar-collapse"]')!.getAttribute('aria-expanded')).toBe('false')
    document.querySelector<HTMLButtonElement>('[data-action="toggle-sidebar-collapse"]')!.click()
    expect(document.documentElement.hasAttribute('data-sidebar-collapsed')).toBe(false)
    expect(document.querySelector('.v2-shell')!.hasAttribute('data-sidebar-collapsed')).toBe(false)

    // An expanded or missing preference leaves the root alone, and blocked storage never throws.
    window.localStorage.setItem('xpanel.sidebar.collapsed', '0')
    new Function(V2_SIDEBAR_STATE_SCRIPT.body)()
    expect(document.documentElement.hasAttribute('data-sidebar-collapsed')).toBe(false)
    const storage = Object.getOwnPropertyDescriptor(window, 'localStorage')!
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked') } })
    try {
      expect(() => new Function(V2_SIDEBAR_STATE_SCRIPT.body)()).not.toThrow()
      expect(document.documentElement.hasAttribute('data-sidebar-collapsed')).toBe(false)
    } finally {
      Object.defineProperty(window, 'localStorage', storage)
    }
    window.localStorage.clear()
  })

  it('scopes operations dock storage per authenticated principal, scrubs foreign entries, and clears on logout', () => {
    document.body.innerHTML = `
      <div class="v2-shell" data-session-actor="xpanel:alice:20001">
        <button type="button" data-action="logout">Sign out</button>
        <div id="xp-ops-dock" hidden></div>
      </div>
    `
    bootRuntime()

    document.dispatchEvent(new CustomEvent('xpanel:ws-event', {
      detail: {
        id: 'evt-alice',
        at: '2026-11-20T12:00:00.000Z',
        kind: 'job.updated',
        scope: { kind: 'account' },
        data: { jobId: 'job-alice', kind: 'backup.create', status: 'running', progress: 40, logChunk: 'Alice private log' },
      },
    }))
    expect(window.sessionStorage.getItem('xpanel_operations_dock:xpanel:alice:20001')).toContain('Alice private log')
    expect(document.getElementById('xp-ops-dock')!.hidden).toBe(false)

    // A different principal signing in through the same tab must never see Alice's stored logs and must scrub them.
    document.body.innerHTML = `
      <div class="v2-shell" data-session-actor="xpanel:bob:20002">
        <button type="button" data-action="logout">Sign out</button>
        <div id="xp-ops-dock" hidden></div>
      </div>
    `
    bootRuntime()
    expect(document.getElementById('xp-ops-dock')!.hidden).toBe(true)
    expect(document.getElementById('xp-ops-dock')!.textContent).toBe('')
    expect(window.sessionStorage.getItem('xpanel_operations_dock:xpanel:alice:20001')).toBeNull()

    // Bob's operations are cleared immediately upon clicking logout.
    document.dispatchEvent(new CustomEvent('xpanel:ws-event', {
      detail: {
        id: 'evt-bob',
        at: '2026-11-20T12:01:00.000Z',
        kind: 'job.updated',
        scope: { kind: 'account' },
        data: { jobId: 'job-bob', kind: 'ssl.issue', status: 'running', progress: 50 },
      },
    }))
    expect(window.sessionStorage.getItem('xpanel_operations_dock:xpanel:bob:20002')).toContain('job-bob')
    document.querySelector<HTMLButtonElement>('[data-action="logout"]')!.click()
    expect(window.sessionStorage.getItem('xpanel_operations_dock:xpanel:bob:20002')).toBeNull()
    expect(document.getElementById('xp-ops-dock')!.hidden).toBe(true)
  })

  it('blocks keyboard sorting when a sortable list sets data-sort-locked="true"', () => {
    document.body.innerHTML = `
      <ul data-sortable-list data-sort-locked="true">
        <li data-sort-id="a" tabindex="0">A</li>
        <li data-sort-id="b" tabindex="0">B</li>
      </ul>
    `
    bootRuntime()
    const list = document.querySelector<HTMLElement>('[data-sortable-list]')!
    let reordered = false
    list.addEventListener('xpanel:reorder', () => { reordered = true })
    const second = list.querySelector<HTMLElement>('[data-sort-id="b"]')!
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true, cancelable: true }))
    expect(reordered).toBe(false)
    expect([...list.children].map(el => el.getAttribute('data-sort-id'))).toEqual(['a', 'b'])
  })

  it('tracks radio groups separately in dirty-form snapshots and restores the saved radio option on Discard', () => {
    document.body.innerHTML = `
      <form data-dirty-track="web-server">
        <input id="eng-apache" type="radio" name="engine" value="apache" checked />
        <input id="eng-nginx" type="radio" name="engine" value="nginx" />
        <input id="mpm-itk" type="radio" name="apacheMpm" value="itk" checked />
        <input id="mpm-event" type="radio" name="apacheMpm" value="event" />
        <input name="keepalive" value="65" />
      </form>
    `
    bootRuntime()

    const form = document.querySelector('form')!
    const bar = form.querySelector<HTMLElement>('.v2-save-bar')!
    const count = bar.querySelector<HTMLElement>('[data-dirty-count]')!
    const apache = document.getElementById('eng-apache') as HTMLInputElement
    const nginx = document.getElementById('eng-nginx') as HTMLInputElement
    const itk = document.getElementById('mpm-itk') as HTMLInputElement
    const keepalive = form.querySelector<HTMLInputElement>('input[name="keepalive"]')!

    expect(bar.hidden).toBe(true)

    // Editing another field must NOT falsely flag the initially checked radios as dirty.
    keepalive.value = '120'
    keepalive.dispatchEvent(new Event('input', { bubbles: true }))
    expect(bar.hidden).toBe(false)
    expect(count.textContent).toBe('1 unsaved change')

    // Switching a radio group counts as one additional change, and Discard restores both radios cleanly.
    nginx.checked = true
    nginx.dispatchEvent(new Event('change', { bubbles: true }))
    expect(count.textContent).toBe('2 unsaved changes')

    bar.querySelector<HTMLButtonElement>('[data-dirty-discard]')!.click()
    expect(apache.checked).toBe(true)
    expect(nginx.checked).toBe(false)
    expect(itk.checked).toBe(true)
    expect(keepalive.value).toBe('65')
    expect(bar.hidden).toBe(true)
  })

  it('routes file-manager dropzone clicks through [data-action="upload-file"] and delegates drops via xpanel:files-dropped', () => {
    document.body.innerHTML = `
      <div data-file-manager="browse">
        <button type="button" data-action="upload-file">Upload File</button>
        <input type="file" data-file-upload hidden />
        <div data-file-dropzone role="button" tabindex="0">Drop files</div>
      </div>
    `
    bootRuntime()

    const root = document.querySelector<HTMLElement>('[data-file-manager]')!
    const uploadBtn = root.querySelector<HTMLButtonElement>('[data-action="upload-file"]')!
    const dropzone = root.querySelector<HTMLElement>('[data-file-dropzone]')!
    let uploadBtnClicks = 0
    uploadBtn.addEventListener('click', () => { uploadBtnClicks++ })
    dropzone.click()
    expect(uploadBtnClicks).toBe(1)

    const droppedNames: string[] = []
    root.addEventListener('xpanel:files-dropped', event => {
      event.preventDefault()
      const detail = (event as CustomEvent<{ files: File[] }>).detail
      droppedNames.push(...detail.files.map(file => file.name))
    })
    const fakeFile = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: { files: File[] } }
    dropEvent.dataTransfer = { files: [fakeFile] }
    dropzone.dispatchEvent(dropEvent)
    expect(droppedNames).toEqual(['notes.txt'])
    expect(dropzone.querySelector('[data-dropzone-queue]')!.textContent).toBe('')
  })
})
