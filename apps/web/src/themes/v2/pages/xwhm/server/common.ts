import { whmStoredFacts, type WhmStoredFactAuthority } from '../stored-facts.ts'
import { whmPolish } from '../monitoring/common.ts'
import { canOpenRegisteredRoute } from '@xpanel/catalog'
import { localeDirection, type Translate } from '../../../../../i18n.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'

/** Core supplies admission and optional observations; renderers never infer host qualification. */
export interface WhmAdminAuthority extends WhmStoredFactAuthority {
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canUseTerminal?: boolean
  readonly themePackages?: readonly { readonly label: string; readonly surfaces: readonly string[]; readonly available: boolean }[]
}
export const DENIED_ADMIN_AUTHORITY: WhmAdminAuthority = Object.freeze({ canRead: false, canManage: false })
export interface AdminControl {
  readonly name?: string
  readonly type?: string
  readonly value?: string | number
  readonly dir?: 'ltr' | 'auto'
  readonly disabled?: boolean
  readonly required?: boolean
  readonly readOnly?: boolean
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly maxLength?: number
  readonly rows?: number
  readonly autocomplete?: string
  readonly placeholder?: string
  readonly accept?: string
  readonly className?: string
  readonly describedBy?: string
  readonly hooks?: HookAttributes
}

// Keenicons (filled) the shared v2 icon set has no name for. Every entry is a complete class list.
const KEENICONS = {
  refresh: 'ki-filled ki-arrows-circle', save: 'ki-filled ki-check', add: 'ki-filled ki-plus', remove: 'ki-filled ki-trash',
  copy: 'ki-filled ki-copy', download: 'ki-filled ki-exit-down', upload: 'ki-filled ki-exit-up', edit: 'ki-filled ki-pencil',
  view: 'ki-filled ki-eye', search: 'ki-filled ki-magnifier', reset: 'ki-filled ki-arrows-loop', open: 'ki-filled ki-exit-right-corner',
  close: 'ki-filled ki-cross', code: 'ki-filled ki-code', key: 'ki-filled ki-key', shield: 'ki-filled ki-shield-tick',
  lock: 'ki-filled ki-lock', rocket: 'ki-filled ki-rocket', down: 'ki-filled ki-down', time: 'ki-filled ki-time',
  info: 'ki-filled ki-information-2', warn: 'ki-filled ki-information', ok: 'ki-filled ki-check-circle', bad: 'ki-filled ki-cross-circle',
  server: 'ki-filled ki-row-horizontal', globe: 'ki-filled ki-compass', network: 'ki-filled ki-router', share: 'ki-filled ki-share',
  folder: 'ki-filled ki-folder', file: 'ki-filled ki-document', disk: 'ki-filled ki-external-drive', data: 'ki-filled ki-data',
  package: 'ki-filled ki-cube-2', layers: 'ki-filled ki-abstract-26', calendar: 'ki-filled ki-calendar-tick', timer: 'ki-filled ki-timer',
  settings: 'ki-filled ki-setting-2', sliders: 'ki-filled ki-setting-4', tools: 'ki-filled ki-wrench', user: 'ki-filled ki-security-user',
  users: 'ki-filled ki-users', mail: 'ki-filled ki-sms', link: 'ki-filled ki-fasten', pulse: 'ki-filled ki-pulse',
  cloud: 'ki-filled ki-cloud', cloudDown: 'ki-filled ki-cloud-download', verify: 'ki-filled ki-verify', filter: 'ki-filled ki-filter',
  flow: 'ki-filled ki-arrow-mix', category: 'ki-filled ki-category', services: 'ki-filled ki-element-11', memory: 'ki-filled ki-simcard',
  cpu: 'ki-filled ki-technology-1', note: 'ki-filled ki-note', list: 'ki-filled ki-search-list', next: 'ki-filled ki-right v2-flip',
  previous: 'ki-filled ki-left v2-flip', certificate: 'ki-filled ki-badge', devices: 'ki-filled ki-devices', notify: 'ki-filled ki-notification-status',
} as const
export type Keenicon = keyof typeof KEENICONS
type KeeniconSize = 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'
/** A decorative literal Keenicon; the adjacent text or the control's `aria-label` carries the meaning. */
export const ki = (name: Keenicon, size: KeeniconSize = 'text-base'): string => `<i class="${KEENICONS[name]} ${size}" aria-hidden="true"></i>`
/** The Metronic icon tile of an item row or card: a soft square around one Keenicon. */
export const kiTile = (name: Keenicon): string => `<span class="flex items-center justify-center shrink-0 size-10 rounded-lg border border-border bg-muted/60 text-muted-foreground" aria-hidden="true">${ki(name, 'text-xl')}</span>`

// The verb that opens an English source label, or a controller hook, names the action a button performs.
const BUTTON_VERBS: readonly (readonly [RegExp, Keenicon])[] = [
  [/^(?:read|refresh|reload|detect|rebuild|re-?run)\b/i, 'refresh'], [/^(?:save|apply|activate|confirm)\b/i, 'save'],
  [/^(?:add|create|new|link|generate|issue|assign|request|invite)\b/i, 'add'], [/^(?:remove|delete|revoke|unlink|purge|uninstall)\b/i, 'remove'],
  [/^copy\b/i, 'copy'], [/^(?:download|export)\b/i, 'download'], [/^(?:upload|import)\b/i, 'upload'], [/^(?:edit|rename)\b/i, 'edit'],
  [/^(?:review|preview|view|show|details)\b/i, 'view'], [/^(?:search|find)\b/i, 'search'], [/^(?:reset|restore|roll back|discard)\b/i, 'reset'],
  [/^(?:close|cancel|clear)\b/i, 'close'], [/^stage\b/i, 'add'], [/^(?:deploy|publish)\b/i, 'rocket'], [/^load preview\b/i, 'view'],
]
const BUTTON_HOOKS: readonly (readonly [RegExp, Keenicon])[] = [
  [/refresh|reload|rebuild|[-=]read\b/, 'refresh'], [/[-=](?:save|apply)\b/, 'save'], [/[-=](?:add|create|import|upload|invite)\b/, 'add'],
  [/[-=](?:remove|delete|purge|prune)\b/, 'remove'], [/[-=]copy\b/, 'copy'], [/[-=](?:preview|review|details)\b/, 'view'],
  [/[-=](?:reset|rollback|discard|restore)\b/, 'reset'], [/[-=](?:search)\b/, 'search'], [/[-=](?:cancel|clear|close)\b/, 'close'],
]
/** The Keenicon a button gets when its caller names none: from the source label first, then from its hooks. */
export function buttonIcon(label: string | undefined, hooks?: HookAttributes): Keenicon | undefined {
  const source = label?.slice(label.indexOf('\u0004') + 1)
  const verb = source ? BUTTON_VERBS.find(([pattern]) => pattern.test(source)) : undefined
  if (verb) return verb[1]
  const names = hooks ? Object.entries(hooks).map(([name, value]) => typeof value === 'string' ? `${name}=${value}` : name).join(' ').toLowerCase() : ''
  return names ? BUTTON_HOOKS.find(([pattern]) => pattern.test(names))?.[1] : undefined
}

export interface AdminButtonOptions { disabled?: boolean; primary?: boolean; danger?: boolean; type?: 'button' | 'submit' | 'reset'; hidden?: boolean; ariaLabel?: string
  /** Row and toolbar size (`kt-btn-sm`); a small dangerous action is the soft destructive outline. */
  small?: boolean
  /** A Keenicon before the label; `false` shows none. Unset, the label verb or the hooks choose it. */
  icon?: Keenicon | false }
export interface AdminSectionOptions {
  /** Header toolbar built with the kit, such as a count badge or a small secondary button. */
  actionsHtml?: string
  description?: string
  /** Card footer actions, such as a wizard step's Previous and Next. */
  footerHtml?: string
  /** The body is one table that runs edge to edge (`kt-card-table`). */
  flush?: boolean }

export function adminContext(t: Translate, props: WhmSurfaceProps, authority: WhmAdminAuthority, route: string, family: 'server' | 'panel') {
  const locale = props.locale ?? 'en', principal = props.visibility?.principal ?? props.principal
  const personal = route === '/whm/preferences'
  const canRead = authority.presentation !== 'read-only' && authority.canRead && props.capabilityUnavailable !== true && !!principal
    && (principal.kind === 'root' || personal && principal.kind === 'reseller')
    && canOpenRegisteredRoute(route, { ...props.visibility, principal, reseller: props.visibility?.reseller ?? props.activeReseller ?? undefined })
  const canManage = canRead && authority.canManage
  const canReadFacts = (ids: readonly string[]): boolean => canRead || principal?.kind === 'root' && whmStoredFacts(props, authority, ids, route)
  const e = (value: string | number): string => escapeHtml(normalizeAsciiDigits(value))
  const text = (message: string): string => e(t(message))
  const attrs = (options: AdminControl, control: string): string => {
    const values = { name: options.name, class: options.className ? `${options.className} ${control}` : control, accept: options.accept, dir: options.dir, min: options.min, max: options.max, step: options.step, maxlength: options.maxLength, autocomplete: options.autocomplete ?? 'off', placeholder: options.placeholder, 'aria-describedby': options.describedBy }
    return Object.entries(values).filter(([, value]) => value !== undefined).map(([name, value]) => ` ${name}="${e(value!)}"`).join('')
      + (options.disabled !== false ? ' disabled' : '') + (options.required ? ' required' : '') + (options.readOnly ? ' readonly' : '') + hookAttrs(options.hooks)
  }
  const input = (id: string, options: AdminControl = {}): string => `<input id="${e(id)}" type="${e(options.type ?? 'text')}"${attrs(options, 'kt-input')}${options.value !== undefined ? ` value="${e(options.value)}"` : ''}${options.dir === 'ltr' ? ' spellcheck="false"' : ''}>`
  const area = (id: string, options: AdminControl = {}): string => `<textarea id="${e(id)}" rows="${options.rows ?? 4}"${attrs(options, 'kt-textarea')}${options.dir === 'ltr' ? ' spellcheck="false"' : ''}>${options.value === undefined ? '' : e(options.value)}</textarea>`
  const select = (id: string, choices: readonly (readonly [string, string])[], options: AdminControl = {}): string => `<select id="${e(id)}"${attrs(options, 'kt-select')}>${choices.map(([value, label]) => `<option value="${e(value)}"${options.value === value ? ' selected' : ''}>${text(label)}</option>`).join('')}</select>`
  // A Metronic settings row: the label on the start edge, the control and its hint growing beside it (see adminStyles).
  const field = (id: string, label: string, control: string, help?: string): string => `<div class="v2-admin-field"><label class="kt-form-label leading-5" for="${e(id)}">${text(label)}</label>${control}${help ? `<p class="v2-muted kt-form-description" id="${e(id)}-help">${text(help)}</p>` : ''}</div>`
  const button = (label: string, hooks?: HookAttributes, options: AdminButtonOptions = {}): string => {
    const glyph = options.icon === false ? undefined : options.icon ?? buttonIcon(label, hooks)
    const tone = options.danger ? options.small ? 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive' : 'v2-btn v2-btn--danger kt-btn kt-btn-destructive' : options.primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary' : 'v2-btn kt-btn kt-btn-outline'
    return `<button type="${options.type ?? 'button'}" class="${tone}${options.small ? ' kt-btn-sm' : ''}"${hookAttrs(hooks)}${options.ariaLabel ? ` aria-label="${e(options.ariaLabel)}"` : ''}${options.disabled !== false ? ' disabled' : ''}${options.hidden ? ' hidden' : ''}>${glyph ? ki(glyph, options.small ? 'text-sm' : 'text-base') : ''}${text(label)}</button>`
  }
  const check = (label: string, options: { name?: string; value?: string; checked?: boolean; hooks?: HookAttributes; disabled?: boolean } = {}): string => `<label class="v2-admin-choice text-sm font-normal text-foreground"><input type="checkbox" class="kt-checkbox kt-checkbox-sm"${options.name ? ` name="${e(options.name)}"` : ''}${options.value !== undefined ? ` value="${e(options.value)}"` : ''}${options.checked ? ' checked' : ''}${options.disabled !== false ? ' disabled' : ''}${hookAttrs(options.hooks)}><span>${text(label)}</span></label>`
  const technical = (value: string | number): string => `<bdi class="v2-mono v2-num" dir="ltr">${e(value)}</bdi>`
  const status = (message: string, hooks?: HookAttributes, hidden = false): string => `<p role="status" data-state="unread"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${text(message)}</p>`
  // Label and value rows, as the "General info" tables of the Metronic profile pages.
  const facts = (rows: readonly { label: string; value?: string | number | null; technical?: boolean; hooks?: HookAttributes }[]): string => `<dl class="v2-admin-fields">${rows.map(row => `<div class="v2-admin-field"><dt class="text-sm font-normal text-secondary-foreground">${text(row.label)}</dt><dd class="text-sm font-medium text-mono">${row.technical ? `<bdi dir="ltr"${hookAttrs(row.hooks)}>` : `<span${hookAttrs(row.hooks)}>`}${row.value === undefined || row.value === null ? text('Not read') : e(row.value)}${row.technical ? '</bdi>' : '</span>'}</dd></div>`).join('')}</dl>`
  // Column names travel as custom properties so phone rows can label each value.
  const columnLabels = (columns: readonly string[]): string => ` style="${e(columns.map((label, index) => `--v2-col-${index + 1}:'${t(label).replace(/[\\']/g, '\\$&')}'`).join(';'))}"`
  const table = (id: string, title: string, columns: readonly string[], hooks?: HookAttributes, body?: string, empty = 'Not read'): string => `<div class="v2-admin-table kt-scrollable-x-auto" role="region" tabindex="0" aria-labelledby="${e(id)}-caption"><table id="${e(id)}"${columnLabels(columns)} class="kt-table"><caption id="${e(id)}-caption" class="v2-sr">${text(title)}</caption><thead><tr>${columns.map(label => `<th scope="col">${text(label)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}>${body ?? `<tr><td colspan="${columns.length}">${text(empty)}</td></tr>`}</tbody></table></div>`
  const section = (id: string, title: string, bodyHtml: string, hooks?: HookAttributes, options: AdminSectionOptions = {}): string => card({ id, title: t(title), titleId: `${id}-heading`, bodyHtml, hooks, ...(options.description ? { description: t(options.description) } : {}), ...(options.actionsHtml ? { actionsHtml: options.actionsHtml } : {}), ...(options.footerHtml ? { footerHtml: options.footerHtml } : {}), ...(options.flush ? { flush: true } : {}) })
  const actions = (html: string): string => `<div class="v2-admin-actions">${html}</div>`
  const fields = (html: string): string => `<div class="v2-admin-fields">${html}</div>`
  const form = (hooks: HookAttributes, html: string, enabled = canManage): string => `<${enabled ? 'form' : 'div'} class="v2-admin-form"${hookAttrs(hooks)}${enabled ? ' novalidate' : ''}>${html}</${enabled ? 'form' : 'div'}>`
  const page = (title: string, description: string, bodyHtml: string, hooks?: HookAttributes): string => `<section class="v2-${family}-page" data-v2-${family}-route="${e(route)}" data-whm-detail-route="${e(route)}" data-capability-state="${canRead ? 'authorized' : 'unavailable'}" lang="${locale}" dir="${localeDirection(locale)}"${hookAttrs(hooks)}>${pageHeader(t, { route, title: t(title), description: t(description), breadcrumb: [{ label: t('Home'), href: '/whm' }, { label: t(title) }] })}${!canRead ? status(msgctxt('theme:v2', 'This session has no admitted read for this workspace. No private state or host outcome is assumed.')) : ''}${bodyHtml}</section>`
  return { t, e, text, input, area, select, field, button, check, technical, status, facts, table, section, actions, fields, form, page, locale, canRead, canReadFacts, canManage }
}
export type AdminView = ReturnType<typeof adminContext>

/** A fact list (`dl` of `div > dt + dd`) as label and value rows with a hairline between them; wide cards take two columns. */
export const factsCss = (s: string, facts: string): string => `${s} ${facts}{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,26rem),1fr));gap:0 1.875rem;min-inline-size:0;overflow:hidden}
${s} ${facts}>div{display:flex;flex-direction:row;align-items:baseline;gap:.625rem;min-inline-size:0;margin-block-start:-1px;padding-block:.75rem;border-block-start:1px solid var(--line);text-align:start}
${s} ${facts} dt{flex:0 0 40%;max-inline-size:14rem;min-inline-size:0;font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
${s} ${facts} dd{flex:1 1 0;min-inline-size:0;margin:0;font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere;unicode-bidi:plaintext;font-variant-numeric:tabular-nums;text-align:start;text-align:-webkit-match-parent;text-align:match-parent}
`
/** A boolean setting as a Metronic switch row: label and hint on the start edge, the switch on the end edge. */
export const toggleCss = (s: string, toggle: string): string => `${s} ${toggle}{display:flex;align-items:center;justify-content:space-between;gap:1.25rem;min-inline-size:0;min-block-size:var(--target)}
${s} ${toggle} label{cursor:pointer}
`
/** Action rows: buttons 10px apart; inside a card body they sit on the end edge, as a Metronic card's closing actions. */
export const actionsCss = (s: string, actions: string): string => `${s} ${actions}{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
${s} .v2-card__body ${actions}:not(nav,td *){justify-content:flex-end}
${s} td ${actions}{gap:.5rem}
`
/** A table scroller as a bordered panel inside a card (edge to edge in a flush card), with centred empty rows and small row buttons. */
export const scrollCss = (s: string, scroll: string): string => `${s} ${scroll} :is(th,td){text-align:start}
${s} ${scroll} thead th{white-space:normal;overflow-wrap:normal;word-break:normal}
${s} ${scroll} td{font-variant-numeric:tabular-nums}
${s} ${scroll} td[colspan]:only-child{padding-block:1.25rem;text-align:center;color:var(--muted)}
${s} ${scroll} td .v2-btn:not(.kt-btn){min-block-size:1.75rem;padding-inline:.625rem;font-size:.75rem}
@media(min-width:601px){${s} ${scroll}{border:1px solid var(--line);border-radius:var(--radius-card)}${s} .v2-card--flush ${scroll}{border:0;border-radius:0}}
`
/**
 * Field groups stack as Metronic settings rows. A kit field asks `formField` for the row (`layout: 'row'`); a family with
 * its own field markup (`cssRows`) takes it here: from 1024px the label keeps a 14rem column and the control grows
 * beside it, while rails, fieldsets, table cells and filter groups keep the label above. Text controls grow with the
 * row, as Metronic's `grow` control; short values (numbers, units) stop at SHORT_CONTROL.
 */
const SHORT_CONTROL = '16rem'
export function fieldsCss(s: string, fields: string, field: string, cssRows = false): string {
  const row = `${s} ${field}:not(:where(aside,fieldset,td,${fields}:has(input[type=search])) *)`
  return `${s} ${fields}{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem;min-inline-size:0}
${s} fieldset ${fields}{grid-template-columns:repeat(auto-fill,minmax(min(100%,11rem),1fr))}
${s} .v2-field--row{max-inline-size:none}
${s} :is(.v2-field--row,${field})>:is(input[type=number],.v2-field__unit){max-inline-size:${SHORT_CONTROL}}
${cssRows ? `${s} ${fields}:has(input[type=search]){grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),20rem));gap:.625rem 1.25rem;align-items:end}
${s} ${field}{display:flex;flex-direction:column;gap:.625rem;min-inline-size:0;max-inline-size:none;text-align:start}
${s} ${field} :is(input:not([type=checkbox],[type=radio]),select,textarea){inline-size:100%;min-inline-size:0;max-inline-size:100%;box-sizing:border-box}
@media(min-width:1024px){${row}{display:grid;grid-template-columns:minmax(0,14rem) minmax(0,1fr);align-items:baseline}
${row}>label{grid-column:1}
${row}>:not(label){grid-column:2}}
` : ''}`
}
/** The class names one page family gives its field groups, fields, fact lists, action rows and table scrollers. */
export interface SettingsParts { readonly fields: string; readonly field: string; readonly facts?: string; readonly actions: string; readonly scroll: string; readonly cssRows?: boolean }
/** The Metronic settings layout of one page family, on its existing elements. */
export const settingsCss = (s: string, p: SettingsParts): string => `${fieldsCss(s, p.fields, p.field, p.cssRows)}${p.facts ? factsCss(s, p.facts) : ''}${actionsCss(s, p.actions)}${s} ${p.scroll}{overflow:auto;min-inline-size:0;max-inline-size:100%}
${scrollCss(s, p.scroll)}`

export function adminStyles(scope: '.v2-server-page' | '.v2-panel-page'): string {
  return `${scope},${scope} .v2-admin-stack{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
${scope} .v2-card__body .v2-admin-stack{gap:.625rem}
${scope} :is(.v2-admin-list>li>a,details>summary){transition:background-color 140ms ease-out,border-color 140ms ease-out,color 140ms ease-out,box-shadow 140ms ease-out,opacity 140ms ease-out,transform 140ms ease-out}
@media(prefers-reduced-motion:reduce){${scope} :is(.v2-admin-list>li>a,details>summary){transition:none}}
${scope} .v2-admin-form{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
${scope} .v2-card__body{gap:1.25rem}
${scope} section.v2-card:not(:has(>.v2-card__body)){display:flex;flex-direction:column;gap:1.25rem;padding:var(--v2-panel-padding)}
${scope} section.v2-card>h2{margin:0;font-size:1rem;line-height:1.5rem;font-weight:600;color:var(--mono,var(--text))}
${scope} :is(section.v2-card>h3,.v2-card__body h3,.v2-admin-subgroup>h3){margin:0;font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}
${scope} .v2-card__body>h3:not(:first-child){padding-block-start:1.25rem;border-block-start:1px solid var(--line)}
${scope} :is(p,dl,dd,fieldset,ul,ol,pre){margin:0}
${scope} .v2-admin-columns{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(240px,1fr);gap:1.25rem;align-items:stretch}
@media(min-width:1024px){${scope},${scope}>.v2-admin-stack,${scope}>*>.v2-admin-stack:not(.v2-card *),${scope} .v2-admin-columns,${scope} .v2-admin-columns>.v2-admin-stack{gap:1.875rem}}
@media(min-width:901px){${scope} .v2-admin-columns>div:has(>.v2-admin-form){display:flex;flex-direction:column}${scope} .v2-admin-columns>div>.v2-admin-form{flex:1}${scope} .v2-admin-columns>.v2-card,${scope} .v2-admin-columns>.v2-admin-stack>:nth-last-child(1 of .v2-card:not([hidden])),${scope} .v2-admin-columns>div>.v2-admin-form>.v2-card:last-child{flex:1;display:flex;flex-direction:column}${scope} .v2-admin-columns>.v2-card>.v2-card__body,${scope} .v2-admin-columns>.v2-admin-stack>:nth-last-child(1 of .v2-card:not([hidden]))>.v2-card__body,${scope} .v2-admin-columns>div>.v2-admin-form>.v2-card:last-child>.v2-card__body{flex:1}}
${settingsCss(scope, { fields: 'div.v2-admin-fields', field: ':is(.v2-admin-field,.v2-field:not(.kt-form-item)):not(dl>*)', facts: 'dl.v2-admin-fields', actions: '.v2-admin-actions', scroll: '.v2-admin-table', cssRows: true })}${scope} :is(input,textarea)[dir=ltr]{text-align:var(--v2-control-align,start);unicode-bidi:isolate}
${scope} :is(bdi,time,code){unicode-bidi:isolate;overflow-wrap:break-word}
${scope} .v2-admin-choice{display:flex;align-items:center;gap:.625rem;min-block-size:var(--target);cursor:pointer}
${scope} fieldset{display:flex;flex-direction:column;gap:1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);padding:1.25rem;min-inline-size:0}
${scope} legend{float:inline-start;inline-size:100%;padding:0;font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}
${scope} details{border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface)}
${scope} details>summary{display:flex;align-items:center;justify-content:space-between;gap:.625rem;min-block-size:3rem;padding-inline:1.25rem;font-size:.875rem;font-weight:500;color:var(--mono,var(--text));cursor:pointer;border-radius:inherit;list-style:none}
${scope} details>summary::-webkit-details-marker{display:none}
${scope} details>summary>i{color:var(--muted);transition:transform 140ms ease-out}
${scope} details[open]>summary>i{transform:rotate(180deg)}
${scope} details>summary:hover{background:var(--subtle)}
${scope} details[open]>summary{border-block-end:1px solid var(--line);border-end-start-radius:0;border-end-end-radius:0}
${scope} details>:not(summary){padding:1.25rem}
${scope} .v2-admin-table table{min-inline-size:480px}
${scope} .v2-admin-table tbody th{font-weight:500;color:var(--mono,var(--text))}
${scope} .v2-admin-table :is(bdi,time,code){font-family:var(--font-mono);font-variant-numeric:tabular-nums}
${scope} [data-ip-pool-count]{font-variant-numeric:tabular-nums}
${scope} .v2-admin-list{display:flex;flex-direction:column;gap:.5rem;padding-inline-start:1.25rem;font-size:.875rem;line-height:1.25rem;color:var(--text-2)}
${scope} ul.v2-admin-list{list-style:disc}
${scope} ol.v2-admin-list{list-style:decimal}
${scope} .v2-admin-list>li::marker{color:var(--muted)}
${scope} .v2-admin-list>li>a{display:inline-flex;align-items:center;min-inline-size:var(--target);min-block-size:var(--target);font-weight:500;color:var(--accent)}
${scope} ul.v2-admin-links{list-style:none;gap:0;padding:0}
${scope} .v2-admin-links>li>a{display:flex;justify-content:space-between;gap:.625rem;min-block-size:2.75rem;border-block-end:1px solid var(--line);color:var(--mono,var(--text));text-decoration:none}
${scope} .v2-admin-links>li:last-child>a{border-block-end:0}
${scope} .v2-admin-links>li>a:hover{color:var(--accent)}
${scope} .v2-admin-links>li>a>i{color:var(--muted)}
${scope} .v2-admin-subgroup{display:flex;flex-direction:column;gap:1.25rem}
${scope} .v2-admin-secret{display:block;min-block-size:var(--target);padding:.75rem 1rem;border:1px solid var(--line-strong);border-radius:var(--radius-control);background:var(--sunken);font-family:var(--font-mono);font-size:.8125rem;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;user-select:all}
${scope} pre{padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font-size:.8125rem;line-height:1.25rem;font-variant-numeric:tabular-nums;white-space:pre-wrap;overflow-wrap:anywhere;max-block-size:360px;overflow:auto}
${scope} [hidden]{display:none!important}
${whmPolish(scope)}@media(max-width:900px){${scope} .v2-admin-columns{grid-template-columns:minmax(0,1fr);align-items:start}}
@media(max-width:600px){${scope} .v2-admin-table tr>td:nth-child(2):has(form,input,select,textarea){grid-column:1/-1;grid-row:auto;justify-self:stretch;text-align:start}
${scope} .v2-admin-table table:not(:has([data-setting-row]),#v2-panel-token-scopes) td:nth-child(n+3):not([colspan])::before{flex:0 0 auto;max-inline-size:50%;font-size:.8125rem;color:var(--muted);text-align:start;font-family:var(--font-sans);overflow-wrap:normal;word-break:normal}
${scope} .v2-admin-table table:not(:has([data-setting-row]),#v2-panel-token-scopes) td:nth-child(n+3):not([colspan],:empty){grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem;text-align:end}
${scope} .v2-admin-table table:not(:has([data-setting-row]),#v2-panel-token-scopes) td:nth-child(n+3):not([colspan],:empty)>*{min-inline-size:0}
${[3, 4, 5, 6, 7, 8, 9, 10].map(n => `${scope} .v2-admin-table table:not(:has([data-setting-row]),#v2-panel-token-scopes) td:nth-child(${n}):not([colspan],:empty)::before{content:var(--v2-col-${n})}`).join('\n')}}
`
}
