// Document chrome the realtime runtime binds by id: the quick bar (#xp-cmdk-modal), the activity drawer
// (#xp-activity-drawer) and the reconcile banner (#xp-reconcile-banner). Data comes from core; v2 only renders it.

import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon, type IconName } from '../icons.ts'
import { statusPill } from '../components/status-pill.ts'
import { stepper } from '../components/stepper.ts'

export type V2Surface = 'xpanel' | 'xwhm' | 'xmail'

/** One quick bar result, as core's command palette entries describe it. */
export interface PaletteEntry {
  key: string
  kind: 'page' | 'action' | 'account' | 'domain'
  label: string
  section: string
  route: string
  href: string
  hint: string
  /** Normalized search text (ASCII digits). */
  search: string
  persistable: boolean
}

export interface CommandPaletteProps {
  surface: V2Surface
  entries: readonly PaletteEntry[]
}

const KIND_ICONS: Readonly<Record<PaletteEntry['kind'], IconName>> = { page: 'services', action: 'plus', account: 'user', domain: 'globe' }

export function commandPalette(t: Translate, props: CommandPaletteProps): string {
  const groups: readonly [PaletteEntry['kind'], string][] = [['page', t('Tools')], ['action', t('Actions')], ['account', t('Accounts')], ['domain', t('Domains')]]
  const scopes: readonly [string, string][] = [['all', t('All')], ['action', t('> Actions')], ['account', t('@ Accounts')], ['domain', t('# Domains')]]
  let index = 0
  const quickCommands: readonly { action: string; label: string; section: string; hint: string; iconName: IconName; keywords: string }[] = [
    { action: 'toggle-theme', label: t('Toggle dark or light theme'), section: t('Interface'), hint: t('Theme'), iconName: 'moon', keywords: 'theme dark light color mode appearance' },
    { action: 'toggle-locale', label: t('Switch interface language'), section: t('Interface'), hint: t('Language'), iconName: 'language', keywords: 'language locale arabic english rtl ltr' },
    { action: 'toggle-sidebar', label: t('Toggle sidebar'), section: t('Interface'), hint: 'Ctrl B', iconName: 'menu', keywords: 'sidebar collapse expand navigation menu' },
    { action: 'refresh-page', label: t('Refresh current page'), section: t('Interface'), hint: t('Reload'), iconName: 'refresh', keywords: 'reload refresh update page' },
  ]
  const rows = groups.map(([kind, name]) => {
    const matches = props.entries.filter(entry => entry.kind === kind)
    const commandItems = kind === 'action' ? quickCommands.map(cmd => {
      const searchText = `${cmd.label} ${cmd.section} ${cmd.keywords}`
      return `<li data-cmdk-row role="presentation" class="v2-cmdk__row flex items-center gap-1"><button type="button" id="xp-cmdk-option-${index++}" class="v2-cmdk__item" data-cmdk-item="action:${cmd.action}" data-cmdk-action="${cmd.action}" data-cmdk-kind="action" data-cmdk-key="cmd:${cmd.action}" data-cmdk-persistable="false" data-cmdk-search-text="${escapeHtml(searchText)}" role="option" aria-selected="false" tabindex="-1"><span class="v2-cmdk__tile flex items-center justify-center shrink-0 size-8 rounded-md border border-border bg-muted/60 text-muted-foreground" aria-hidden="true">${icon(cmd.iconName, 16)}</span><span class="v2-cmdk__copy flex flex-col min-w-0"><strong class="font-medium text-mono">${escapeHtml(cmd.label)}</strong><span class="text-xs text-muted-foreground">${escapeHtml(cmd.section)}</span></span><code class="kt-kbd kt-kbd-sm" dir="ltr"><bdi dir="ltr">${escapeHtml(cmd.hint)}</bdi></code></button></li>`
    }).join('') : ''
    if (!matches.length && !commandItems) return ''
    const items = matches.map(item => {
      const favorite = item.persistable
        ? `<button type="button" class="v2-cmdk__fav kt-btn kt-btn-sm kt-btn-icon kt-btn-dim" data-cmdk-favorite="${escapeHtml(item.route)}" aria-pressed="false" aria-label="${escapeHtml(`${t('Favorite page')}: ${item.label}`)}">${icon('star', 16)}</button>`
        : ''
      return `<li data-cmdk-row role="presentation" class="v2-cmdk__row flex items-center gap-1"><a id="xp-cmdk-option-${index++}" href="${escapeHtml(item.href)}" class="v2-cmdk__item" data-cmdk-item="${escapeHtml(item.route)}" data-cmdk-kind="${item.kind}" data-cmdk-key="${escapeHtml(item.key)}" data-cmdk-persistable="${item.persistable}" data-cmdk-search-text="${escapeHtml(item.search)}" role="option" aria-selected="false" tabindex="-1"><span class="v2-cmdk__tile flex items-center justify-center shrink-0 size-8 rounded-md border border-border bg-muted/60 text-muted-foreground" aria-hidden="true">${icon(KIND_ICONS[kind], 16)}</span><span class="v2-cmdk__copy flex flex-col min-w-0"><strong class="font-medium text-mono">${escapeHtml(item.label)}</strong><span class="text-xs text-muted-foreground">${escapeHtml(item.section)}</span></span><code dir="ltr"><bdi dir="ltr">${escapeHtml(item.hint)}</bdi></code></a>${favorite}</li>`
    }).join('') + commandItems
    return `<li data-cmdk-group="${kind}" role="presentation" class="v2-cmdk__group"><span class="v2-cmdk__group-label block px-2.5 pt-2 pb-1 text-xs font-medium text-muted-foreground">${escapeHtml(name)}</span><ul role="group" aria-label="${escapeHtml(name)}">${items}</ul></li>`
  }).join('')
  return `<div id="xp-cmdk-modal" class="v2-cmdk" data-xp-cmdk="true" data-cmdk-surface="${props.surface}" hidden role="dialog" aria-modal="true" aria-labelledby="xp-cmdk-title"><div class="v2-cmdk__panel kt-modal-content">
<div class="v2-cmdk__head kt-modal-header"><h2 id="xp-cmdk-title" class="v2-sr">${escapeHtml(t('Quick bar'))}</h2>${icon('search', 20)}<label class="v2-sr" for="xp-cmdk-input">${escapeHtml(t('Search tools, accounts and domains'))}</label><input id="xp-cmdk-input" type="search" data-xp-filter-input="true" data-cmdk-search="true" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="xp-cmdk-results" autocomplete="off" maxlength="160" placeholder="${escapeHtml(t('Search tools, @account, #domain or >action'))}" class="kt-input kt-input-ghost"><button type="button" class="v2-cmdk__close kt-btn kt-btn-sm kt-btn-dim" data-action="close-cmdk" aria-label="${escapeHtml(t('Close'))}"><kbd class="kt-kbd kt-kbd-sm">Esc</kbd></button></div>
<div class="v2-cmdk__scopes kt-tabs kt-tabs-line" role="group" aria-label="${escapeHtml(t('Search scope'))}">${scopes.map(([kind, name]) => `<button type="button" class="kt-tab-toggle" data-cmdk-scope="${kind}" aria-pressed="${kind === 'all'}">${escapeHtml(name)}</button>`).join('')}</div>
<div class="v2-cmdk__history flex flex-col gap-3 px-5 pt-3" data-cmdk-history hidden><div data-cmdk-favorites-section hidden><h3 class="mb-2 text-xs font-medium text-muted-foreground">${escapeHtml(t('Favorites'))}</h3><div class="v2-cmdk__links flex flex-wrap gap-2" data-cmdk-favorites></div></div><div data-cmdk-recents-section hidden><h3 class="mb-2 text-xs font-medium text-muted-foreground">${escapeHtml(t('Recent pages'))}</h3><div class="v2-cmdk__links flex flex-wrap gap-2" data-cmdk-recents></div></div></div>
<ul class="v2-cmdk__links flex flex-wrap gap-2 px-5 pt-3" data-cmdk-remote hidden aria-label="${escapeHtml(t('Accounts and domains'))}"></ul>
<ul id="xp-cmdk-results" class="v2-cmdk__results" data-cmdk-results role="listbox" aria-label="${escapeHtml(t('Results'))}">${rows}</ul>
<p class="v2-cmdk__empty p-5 text-center text-muted-foreground" data-cmdk-empty role="status"${props.entries.length ? ' hidden' : ''}>${escapeHtml(t('No matching pages.'))}</p>
<div class="v2-cmdk__foot kt-modal-footer"><p><kbd class="kt-kbd kt-kbd-sm">↑ ↓</kbd> ${escapeHtml(t('move'))} · <kbd class="kt-kbd kt-kbd-sm">Enter</kbd> ${escapeHtml(t('open'))} · <kbd class="kt-kbd kt-kbd-sm">Ctrl Enter</kbd> ${escapeHtml(t('new tab'))}</p><p class="v2-num" data-cmdk-status aria-live="polite" aria-atomic="true" data-count-label="${escapeHtml(t('Results'))}"></p></div>
</div></div>`
}

export interface ActivityDrawerProps {
  /** The active generation, when the reconciler has been observed. */
  generation?: { id: number; applied: boolean }
  /** Live activity rendered by core (jobs, audit entries), built with the kit. */
  bodyHtml?: string
}

export function activityDrawer(t: Translate, props: ActivityDrawerProps): string {
  const generation = props.generation
    ? statusPill({ tone: props.generation.applied ? 'ok' : 'warn', label: t('Generation {generation}', { generation: props.generation.id }) })
    : ''
  const body = props.bodyHtml ?? `<p class="v2-muted">${escapeHtml(t(msgctxt('theme:v2', 'Jobs, configuration generations and audit entries appear here as they happen.')))}</p>`
  return `<div id="xp-activity-drawer" class="v2-sheet" data-xp-drawer="activity" hidden role="dialog" aria-modal="true" aria-labelledby="xp-activity-drawer-title"><aside class="v2-sheet__panel" tabindex="-1">
<header class="v2-drawer__head kt-drawer-header bg-transparent"><h2 id="xp-activity-drawer-title" class="kt-drawer-title">${escapeHtml(t('Activity & Jobs'))}</h2><button type="button" class="kt-btn kt-btn-sm kt-btn-icon kt-btn-dim" data-action="close-activity-drawer" aria-label="${escapeHtml(t('Close'))}">${icon('x', 16)}</button></header>
<div class="v2-drawer__body kt-drawer-content">${generation}${body}</div>
</aside></div>`
}

export interface ReconcileStage {
  /** Stage id the runtime updates: render, test, switch, reload or verify. */
  stage: string
  label: string
  status: 'pending' | 'running' | 'passed' | 'failed'
}

export interface ReconcileBannerProps {
  generationId: number
  status: 'idle' | 'running' | 'applied' | 'failed'
  /** Whether the reconciler has been observed at all (it has an update time). */
  observed: boolean
  stages: readonly ReconcileStage[]
  failedTest?: string
  error?: string
  hooks?: HookAttributes
}

export function reconcileBanner(t: Translate, props: ReconcileBannerProps): string {
  const values = { generationId: props.generationId }
  const pill = !props.observed || props.generationId <= 0 ? statusPill({ tone: 'warn', label: t('Reconciliation has not been observed') })
    : props.status === 'running' ? statusPill({ tone: 'info', label: t('Reconciling generation #{generationId}...', values) })
    : props.status === 'failed' ? statusPill({ tone: 'bad', label: t('Rolled back from generation #{generationId}', values) })
    : statusPill({ tone: 'ok', label: t('Applied in generation #{generationId}', values) })
  const error = props.status === 'failed' && (props.error || props.failedTest)
    ? `<details class="v2-reconcile__error" open><summary>${escapeHtml(t('Failed validation test: {failedTest}', { failedTest: props.failedTest ?? 'configtest' }))}</summary><pre dir="ltr">${escapeHtml(props.error ?? '')}</pre></details>`
    : ''
  const steps = stepper({ label: t(msgctxt('theme:v2', 'Reconcile pipeline')), steps: props.stages.map(stage => ({ label: stage.label, state: stage.status, hooks: { 'data-stage': stage.stage } })) })
  return `<section id="xp-reconcile-banner" class="v2-card v2-reconcile kt-alert kt-alert-outline flex-col" data-reconcile-banner="true" data-generation-id="${props.generationId}" data-reconcile-status="${props.status}" aria-labelledby="xp-reconcile-title"${hookAttrs(props.hooks)}>
<div class="v2-card__head"><h2 id="xp-reconcile-title" class="kt-alert-title text-sm font-semibold text-mono">${escapeHtml(t(msgctxt('theme:v2', 'Reconcile pipeline')))}</h2>${pill}</div>
${steps}${error}
</section>`
}

// Structure and controller states only; the panel, header, tab and key looks come from the Metronic classes.
export const OVERLAYS_CSS = `.v2-cmdk,.v2-sheet{position:fixed;inset:0;z-index:90;display:flex;background:var(--scrim);backdrop-filter:blur(4px)}
.v2-cmdk{justify-content:center;align-items:flex-start;padding:15vh var(--space-2) var(--space-2)}
.v2-cmdk__panel{inline-size:min(600px,100%);max-block-size:100%;margin:0;overflow:hidden}
.v2-cmdk__head{gap:10px}
.v2-cmdk__head>.v2-icon{color:var(--muted)}
.v2-cmdk__head>input{flex:1 1 auto;min-inline-size:0}
.v2-cmdk__head>input:focus-visible{outline:none;box-shadow:none}
.v2-cmdk__head>input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none;display:none}
.v2-cmdk__scopes{flex:none;gap:var(--space-3);padding-inline:var(--space-3);overflow-x:auto}
.v2-cmdk__scopes>button{flex:none;padding-block:12px;border-inline:0;border-block-start:0;background:transparent;white-space:nowrap}
.v2-cmdk__scopes>button[aria-pressed="true"]{color:var(--accent)!important;border-block-end-color:var(--accent)!important}
.v2-cmdk__links{margin:0;list-style:none}
.v2-cmdk__links a{display:inline-flex;align-items:center;min-block-size:28px;padding-inline:10px;border-radius:var(--radius-control);border:1px solid var(--line-strong);background:var(--bg);color:var(--text-2);font-size:12px;font-weight:500;text-decoration:none}
.v2-cmdk__links a:hover{border-color:var(--accent-line);color:var(--accent)}
.v2-cmdk__results,.v2-cmdk__group>ul{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.v2-cmdk__results{padding:var(--space-1) 10px;gap:var(--space-1);max-block-size:min(420px,50dvh);overflow-y:auto;overscroll-behavior:contain}
.v2-cmdk__item{flex:1 1 auto;min-inline-size:0;display:flex;align-items:center;gap:12px;min-block-size:var(--target);padding:6px 10px;border:0;background:transparent;border-radius:var(--radius-control);color:var(--text);font:inherit;text-align:start;text-decoration:none;cursor:pointer}
.v2-cmdk__item:hover,.v2-cmdk__item[aria-selected="true"]{background:var(--sunken);color:var(--text)}
.v2-cmdk__item>code{margin-inline-start:auto;font-size:12px;color:var(--muted);text-align:start;overflow-wrap:anywhere}
@media(max-width:959px){.v2-cmdk{padding-block-start:var(--space-2)}.v2-cmdk__item{display:grid;grid-template-columns:32px minmax(0,1fr)}.v2-cmdk__item>code{grid-column:2;justify-self:start;margin-inline-start:0;direction:inherit}}
.v2-cmdk__fav[aria-pressed="true"] i{color:var(--warn)}
.v2-cmdk__foot{flex-wrap:wrap;font-size:12px;color:var(--text-2)}
.v2-sheet{z-index:80;justify-content:flex-end;padding:var(--space-3)}
.v2-sheet__panel{inline-size:min(450px,100%);block-size:100%;display:flex;flex-direction:column;border-radius:var(--radius-card);background:var(--surface);border:1px solid var(--line);box-shadow:var(--v2-elev);overflow:hidden}
.v2-sheet__panel>.v2-drawer__body{flex:1 1 auto;min-block-size:0;overflow-y:auto}
@media(max-width:600px){.v2-sheet{padding:var(--space-1)}}
.v2-reconcile{box-shadow:none}
.v2-reconcile[data-reconcile-status=failed]{border-color:var(--bad-line)!important}
.v2-reconcile__error summary{min-block-size:var(--target);display:flex;align-items:center;font-weight:600;color:var(--bad);cursor:pointer}
.v2-reconcile__error pre{padding:var(--space-2);border-radius:var(--radius-control);background:var(--code);color:var(--code-text);font-size:12px;overflow-x:auto}
`
