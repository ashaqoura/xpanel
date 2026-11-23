import { navigation, canonicalNavigationRoute, canOpenRegisteredRoute, isToolAuthorized } from '@xpanel/catalog'
import type { PanelSurfaceProps, ThemeViewProps } from '../../../../contract.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import { card, notice, pageHeader, type PageHeaderProps } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'
import { IDENTITY_ROWS_CSS } from '../../identity.ts'

/** Current core decisions, separate from theme choice and saved presentation preferences. */
export interface PanelSettingsAuthority {
  readonly presentation?: 'live' | 'read-only'
  readonly canReadFacts?: boolean
  readonly authorizedTools?: ReadonlySet<string>
  /** verified tools of the session; a page with several tools gates each control by its own tool */
  readonly qualifiedTools?: ReadonlySet<string>
  readonly canRead: boolean
  readonly canManage: boolean
  readonly relatedRoutes?: ReadonlySet<string>
}

export const NO_SETTINGS_AUTHORITY: PanelSettingsAuthority = Object.freeze({ canRead: false, canManage: false })

export function settingsContext(props: PanelSurfaceProps, authority: PanelSettingsAuthority) {
  const locale = props.locale ?? 'en'
  const readOnly = authority.presentation === 'read-only'
  const route = canonicalNavigationRoute(props.activeRoute ?? '/preferences')
  const pageTools = navigation.find(surface => surface.surface === 'xpanel')?.sections.flatMap(section => section.pages).find(page => page.route === route)?.tools ?? []
  const matched = props.visibility?.principal.kind === 'user' && props.visibility.principal.accountId === props.account?.id
  const factPermission = readOnly && authority.canReadFacts === true && matched && !!props.visibility && canOpenRegisteredRoute(route, props.visibility) && pageTools.some(id => authority.authorizedTools?.has(id) && props.catalog?.some(tool => tool.id === id && isToolAuthorized(tool, props.visibility!)))
  const readable = !readOnly && authority.canRead === true && !!props.account
  const factsReadable = readable || factPermission
  const account = factsReadable ? props.account : undefined
  const domains = account ? props.domains?.filter(domain => domain.accountId === account.id) : undefined
  const selected = domains?.find(domain => domain.name === props.activeDomain)
    ?? domains?.find(domain => domain.name === account?.primaryDomain) ?? domains?.[0]
  return { locale, t: v2Messages.translator(locale), readable, factsReadable, readOnly, account, domains, selected,
    editable: readable && account?.status === 'active' && authority.canManage === true }
}

export const esc = escapeHtml
export const technical = (value: string | number): string => `<bdi dir="ltr" class="v2-mono">${esc(normalizeAsciiDigits(value))}</bdi>`
export const actions = (body: string): string => `<div class="v2-panel-settings__actions">${body}</div>`
export const fields = (body: string): string => `<div class="v2-panel-settings__fields">${body}</div>`
export const groups = (body: string): string => `<div class="v2-panel-settings__groups">${body}</div>`
/** Equal columns that end near the same height; one column on narrow screens. */
export const pair = (...columns: string[]): string => `<div class="v2-panel-settings__pair">${columns.join('')}</div>`
export const split = (main: string, aside: string): string => `<div class="v2-panel-settings__split"><div class="v2-panel-settings__groups">${main}</div><aside class="v2-panel-settings__groups">${aside}</aside></div>`

/** Leading Keenicons of the usual actions, read from the controller hooks of a button; Metronic shows one on add,
 * refresh, download, upload, copy, search and delete buttons. An action this table does not name stays text only. */
const ACTION_GLYPHS: readonly (readonly [RegExp, string])[] = [
  [/(^|-)(refresh|reload)(-|$)/, '<i class="ki-filled ki-arrows-circle" aria-hidden="true"></i>'],
  [/(^|-)(delete|remove|revoke|purge)(-|$)/, '<i class="ki-filled ki-trash" aria-hidden="true"></i>'],
  [/(^|-)(add|create|new)(-|$)/, '<i class="ki-filled ki-plus" aria-hidden="true"></i>'],
  [/(^|-)(download|export)(-|$)/, '<i class="ki-filled ki-exit-down" aria-hidden="true"></i>'],
  [/(^|-)(upload|import)(-|$)/, '<i class="ki-filled ki-exit-up" aria-hidden="true"></i>'],
  [/(^|-)copy(-|$)/, '<i class="ki-filled ki-copy" aria-hidden="true"></i>'],
  [/(^|-)search(-|$)/, '<i class="ki-filled ki-magnifier" aria-hidden="true"></i>'],
]
const DANGER_ACTION = /(^|-)(delete|remove|revoke|purge)(-|$)/
const hookWords = (hooks?: HookAttributes): string => !hooks ? ''
  : Object.entries(hooks).map(([name, value]) => `${name} ${typeof value === 'string' ? value : ''}`).join(' ').toLowerCase()
/** The leading icon of an action button, or nothing for an action without a usual icon. */
export const actionGlyph = (hooks?: HookAttributes): string => {
  const words = hookWords(hooks).split(/\s+/)
  return ACTION_GLYPHS.find(([pattern]) => words.some(word => pattern.test(word)))?.[1] ?? ''
}
/** The Metronic variant of an action button: one primary per view, soft danger for removal, outline otherwise. */
export const actionVariant = (hooks: HookAttributes | undefined, primary: boolean): string =>
  primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary'
    : hookWords(hooks).split(/\s+/).some(word => DANGER_ACTION.test(word)) ? 'v2-btn kt-btn kt-btn-outline kt-btn-destructive' : 'v2-btn kt-btn kt-btn-outline'

export const button = (label: string, hooks?: HookAttributes, disabled = true, primary = false, hidden = false): string =>
  `<button type="button" class="${actionVariant(hooks, primary)}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}${hidden ? ' hidden' : ''}>${actionGlyph(hooks)}${esc(label)}</button>`
export const link = (label: string, href: string, hooks?: HookAttributes): string =>
  `<a class="v2-btn kt-btn kt-btn-outline" href="${esc(href)}"${hookAttrs(hooks)}>${actionGlyph(hooks)}${esc(label)}</a>`
/** Adds the Metronic control class to the caller's attributes; a caller's own class attribute keeps its names. */
const withControlClass = (extra: string, name: string): string => !name ? extra
  : / class="/.test(extra) ? extra.replace(/ class="([^"]*)"/, (_match, names: string) => ` class="${names} ${name}"`) : ` class="${name}"${extra}`
const INPUT_CLASS: Readonly<Record<string, string>> = { checkbox: 'kt-checkbox', radio: 'kt-radio', hidden: '', range: '', color: '' }
export const input = (id: string, name: string, type = 'text', extra = '', disabled = true): string =>
  `<input id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''} type="${esc(type)}"${withControlClass(extra, INPUT_CLASS[type] ?? 'kt-input max-[959px]:text-base')}${disabled ? ' disabled' : ''}>`
export const area = (id: string, name: string, extra = '', disabled = true, value = ''): string =>
  `<textarea id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''}${withControlClass(extra, 'kt-textarea max-[959px]:text-base')}${disabled ? ' disabled' : ''}>${esc(value)}</textarea>`
export const select = (id: string, name: string, options: readonly (readonly [string, string])[], extra = '', disabled = true, selected?: string): string =>
  `<span class="v2-select"><select id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''}${withControlClass(extra, extra.includes('dir="ltr"') ? 'kt-select max-[959px]:text-base rtl:ps-6 rtl:pe-3' : 'kt-select max-[959px]:text-base')}${disabled ? ' disabled' : ''}>${options.map(([value, label]) => `<option value="${esc(value)}"${selected === value ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select>${icon('chevDown', 16)}</span>`
export const check = (id: string, label: string, hooks?: HookAttributes, disabled = true, checked = false, name?: string): string =>
  `<label class="v2-panel-settings__check text-sm font-normal text-foreground" for="${esc(id)}"><input class="kt-checkbox" id="${esc(id)}" type="checkbox"${name ? ` name="${esc(name)}"` : ''}${hookAttrs(hooks)}${disabled ? ' disabled' : ''}${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`

export function field(id: string, label: string, controlHtml: string, help?: string): string {
  const control = help && !controlHtml.includes('aria-describedby=')
    ? controlHtml.replace(/<(input|select|textarea)\b/, `<$1 aria-describedby="${esc(id)}-help"`) : controlHtml
  return `<div class="v2-field"><label class="kt-form-label leading-tight" for="${esc(id)}">${esc(label)}</label>${control}${help ? `<p class="v2-field__help" id="${esc(id)}-help">${esc(help)}</p>` : ''}</div>`
}

export const facts = (items: readonly { label: string; valueHtml: string; hooks?: HookAttributes }[], hooks?: HookAttributes): string =>
  `<dl class="v2-panel-settings__facts"${hookAttrs(hooks)}>${items.map(item => `<div><dt>${esc(item.label)}</dt><dd${hookAttrs(item.hooks)}>${item.valueHtml}</dd></div>`).join('')}</dl>`
export const section = (id: string, title: string, bodyHtml: string, actionsHtml?: string, hooks?: HookAttributes): string =>
  card({ id, title, titleId: `${id}-heading`, bodyHtml, ...(actionsHtml ? { actionsHtml } : {}), ...(hooks ? { hooks } : {}) })
/** Column names for phone rows: the stacked cells of a row name their value (read by PANEL_SETTINGS_CSS). */
export const phoneLabels = (heads: readonly string[]): string => ` style="${heads.slice(1, 8).map((head, index) => `--v2-pl${index + 2}:'${esc(head.replace(/[\\']/g, '\\$&'))}'`).join(';')}"`
export const phoneLabelCss = (scope: string): string => { const cell = `:not([colspan],:empty,:has(button,.v2-btn,[data-xp-slot=actions]))::before`; return `@media(max-width:600px){${scope} table[style*="--v2-pl"] td{overflow-wrap:anywhere;min-inline-size:0}${scope} table[style*="--v2-pl"] td${cell}{color:var(--muted);font-size:12px;margin-inline-end:var(--space-1)}${scope} table[style*="--v2-pl"] td:nth-child(2)${cell}{display:block;margin:0}${[2, 3, 4, 5, 6, 7, 8].map(n => `${scope} table[style*="--v2-pl"] td:nth-child(${n})${cell}{content:var(--v2-pl${n})}`).join('')}}` }
export const unreadRow = (columns: number, text: string): string => `<tr><td colspan="${columns}"><p role="status">${esc(text)}</p></td></tr>`
export const table = (id: string, title: string, heads: readonly string[], bodyHtml: string, bodyHooks?: HookAttributes, tableHooks?: HookAttributes): string =>
  `<div class="v2-panel-settings__table kt-scrollable-x-auto" role="region" tabindex="0" aria-labelledby="${esc(id)}-caption"><table class="kt-table" id="${esc(id)}"${phoneLabels(heads)}${hookAttrs(tableHooks)}><caption id="${esc(id)}-caption" class="v2-sr">${esc(title)}</caption><thead><tr>${heads.map(head => `<th scope="col">${esc(head)}</th>`).join('')}</tr></thead><tbody${hookAttrs(bodyHooks)}>${bodyHtml}</tbody></table></div>`
export const status = (text: string, hooks?: HookAttributes): string => `<p role="status" data-state="unread"${hookAttrs(hooks)}>${esc(text)}</p>`
export const note = (text: string): string => `<p class="v2-muted text-sm font-normal text-secondary-foreground">${esc(text)}</p>`

export function page(props: PanelSurfaceProps & ThemeViewProps, authority: PanelSettingsAuthority, route: string, title: string, description: string, bodyHtml: string, hooks?: HookAttributes, head?: Pick<PageHeaderProps, 'actionsHtml' | 'status' | 'stamp'>): string {
  const { locale, t, account, readable, readOnly } = settingsContext(props, authority)
  const keepSecurityHostOpen = route === '/security/account' && (readOnly || props.authPersonal?.state === 'ready')
  return `<section class="v2-panel-settings" data-v2-settings-route="${esc(route)}"${!readable && !keepSecurityHostOpen ? ' data-readonly="true"' : ''}${account ? ` data-account="${esc(account.id)}" data-uid="${account.uid}"` : ''} lang="${locale}" dir="${localeDirection(locale)}"${hookAttrs(hooks)}>${pageHeader(t, { route, title, description, breadcrumb: [{ label: t(msgid('Home')), href: '/home' }, { label: title }], ...head })}${bodyHtml}</section>`
}

export function deniedPage(props: PanelSurfaceProps, authority: PanelSettingsAuthority, route: string, title: string, description: string): string {
  const { t } = settingsContext(props, authority)
  return page(props, authority, route, title, description, section('v2-settings-unavailable', title, notice(t, { tone: 'warn', lead: t(msgid('Unavailable')), text: t(msgctxt('theme:v2', 'An authorized account has not been read. Nothing was read or changed.')) })))
}

/** Blocks whose direct fields are settings rows: each stretches its children, so a field can measure itself.
 * :where() keeps the list out of the specificity, so a page rule on its own fields still wins. */
const ROWS = ':where(.v2-card__body,form,fieldset,[role=tabpanel],.v2-panel-settings__groups,.v2-panel-settings__fields,.v2-panel-settings__fields>div:not([class]),.v2-panel-operation-fields)'

export const PANEL_SETTINGS_CSS = `${IDENTITY_ROWS_CSS}
.v2-team-person{display:flex;flex-direction:column;gap:.25rem}
.v2-team-signin,.v2-team-signin__times{display:flex;flex-direction:column;gap:var(--space-1)}.v2-team-signin__time{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-1);font-variant-numeric:tabular-nums}
.v2-panel-settings{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0;text-align:start}
.v2-panel-settings dialog h2{font-size:1.125rem;line-height:1.75rem;font-weight:600}
.v2-panel-settings h3{font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}
.v2-panel-settings .v2-card__body,.v2-panel-settings__groups,.v2-panel-settings form{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-panel-settings .v2-card>.v2-card__body{flex:1 1 auto}
.v2-panel-settings .v2-card>.v2-card__foot,.v2-panel-settings__foot{margin-block-start:auto}
.v2-panel-settings .v2-field>p:not([role]),.v2-panel-settings .v2-field__help{font-size:.75rem;line-height:1.125rem;font-weight:400;color:var(--muted)}
.v2-panel-settings .v2-field>[role=alert]{font-size:.75rem;line-height:1.125rem;color:var(--destructive,var(--bad))}
.v2-panel-settings ${ROWS}>.v2-field{container-type:inline-size;display:grid;grid-template-columns:minmax(0,14rem) minmax(0,1fr);align-items:baseline;gap:.5rem .625rem}
.v2-panel-settings ${ROWS}>.v2-field>*{grid-column:1/-1;min-inline-size:0;margin-block-start:0}
@container (min-width:36rem){.v2-panel-settings .v2-field>:is(label,.v2-field__label):first-child{grid-column:1}.v2-panel-settings .v2-field>:is(label,.v2-field__label):first-child~*{grid-column:2}}
.v2-panel-settings__fields,.v2-panel-settings__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:var(--space-3);min-inline-size:0}
.v2-panel-settings__fields{container-type:inline-size;align-items:start}
@container (min-width:40rem){.v2-panel-settings__fields:not(.v2-panel-settings__fields--tight)>:is(.v2-field,fieldset,div:not([class]),.v2-panel-settings__check){grid-column:1/-1}}
.v2-panel-settings__facts{grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:.875rem var(--space-4)}
.v2-panel-settings__facts>div{display:grid;grid-template-columns:minmax(6.5rem,min(40%,14rem)) minmax(0,1fr);align-items:baseline;gap:.625rem;min-inline-size:0;text-align:start}
.v2-panel-settings__facts dt{font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
.v2-panel-settings__facts dd,.v2-panel-settings .v2-tool-card__facts dd{font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere;text-align:start;font-variant-numeric:tabular-nums}
.v2-panel-settings__facts[data-rows]{grid-template-columns:minmax(0,1fr)}
.v2-panel-settings__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-panel-settings :is(.v2-card__body,form,[role=tabpanel],.v2-panel-settings__groups)>.v2-panel-settings__actions:has(>.kt-btn-primary){justify-content:flex-end}
.v2-panel-settings :is(.v2-card__body,form,[role=tabpanel],.v2-panel-settings__groups)>.v2-panel-settings__actions:has(>.kt-btn-primary:first-child){flex-direction:row-reverse;justify-content:flex-start}
.v2-panel-settings__check{display:flex;align-items:center;gap:.625rem;min-block-size:var(--target)}
.v2-panel-settings__check>input{flex:none;margin-block:0}
.v2-panel-settings__split{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px);align-items:stretch;gap:var(--space-3);min-inline-size:0}
.v2-panel-settings__split>.v2-panel-settings__groups,.v2-panel-settings__split>.v2-panel-settings__groups>form{gap:var(--space-3)}
.v2-panel-settings__split>.v2-panel-settings__groups>.v2-card:last-child,.v2-panel-settings__pair>.v2-panel-settings__groups>.v2-card:last-child{flex:1 1 auto}
.v2-panel-settings__table{overflow:auto;max-inline-size:100%;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}.v2-panel-settings__table table{inline-size:100%;border-collapse:collapse}
.v2-panel-settings__table :is(th,td){text-align:start;overflow-wrap:anywhere}.v2-panel-settings__table tbody td{font-variant-numeric:tabular-nums}
.v2-panel-settings__table td:first-child:not([colspan]) :is(strong,b){font-weight:500;color:var(--mono,var(--text))}
.v2-panel-settings :is(input,select,textarea,.v2-select){max-inline-size:100%;min-inline-size:0}.v2-panel-settings :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-panel-settings .v2-field>:is(input,select,textarea,.v2-select){inline-size:100%}
.v2-panel-settings textarea{inline-size:100%;resize:vertical;min-block-size:7rem}.v2-panel-settings pre{max-inline-size:100%;min-inline-size:0;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
.v2-panel-settings :is(ul,ol){padding-inline-start:var(--space-3);display:grid;gap:.625rem}
.v2-panel-settings .v2-panel-settings__list{list-style:none;padding:0;display:grid;gap:.625rem}
.v2-panel-settings fieldset{display:grid;gap:var(--space-3);min-inline-size:0}
.v2-panel-settings legend{padding:0;margin-block-end:.625rem;font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}.v2-panel-settings [hidden]{display:none}
.v2-panel-settings__preview{border:1px solid var(--line);border-radius:var(--radius-card);padding:var(--space-2);background:var(--sunken)}
.v2-panel-settings__steps>li{display:flex;gap:.625rem;align-items:center}.v2-panel-settings__steps b{display:inline-flex;align-items:center;justify-content:center;inline-size:1.875rem;block-size:1.875rem;border-radius:50%;flex:none;font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums;background:var(--accent-soft);color:var(--accent)}
.v2-panel-settings__steps>li[aria-current=step]{color:var(--mono,var(--text));font-weight:600}.v2-panel-settings__steps>li[aria-current=step]>b{background:var(--accent-fill);color:var(--on-accent)}
.v2-panel-settings__tabs{display:flex;flex-wrap:wrap;gap:var(--space-3);border-block-end:1px solid var(--line)}
.v2-panel-settings__role{display:flex;flex-direction:column;gap:.25rem;padding:var(--space-2);border:1px solid var(--line-strong);border-radius:var(--radius-card)}.v2-panel-settings__role:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}.v2-panel-settings__role label{font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}.v2-panel-settings__role p{padding-inline-start:1.75rem;font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-panel-settings__loading{display:grid;gap:var(--space-1)}
.v2-panel-settings [data-state-chip]{align-self:flex-start;display:inline-flex;align-items:center;gap:.375rem;block-size:1.5rem;padding:0 .5rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--sunken);color:var(--text-2);font-size:.75rem;font-weight:500;white-space:nowrap}
.v2-panel-settings [data-state-chip=ok],.v2-panel-settings [data-state-chip=enabled],.v2-panel-settings [data-state-chip=on]{color:var(--ok);background:var(--ok-soft);border-color:var(--ok-line)}
.v2-panel-settings [data-state-chip=unavailable],.v2-panel-settings [data-state-chip=disabled]{color:var(--warn);background:var(--warn-soft);border-color:var(--warn-line)}
.v2-panel-settings [data-state-chip=problem]{color:var(--bad);background:var(--bad-soft);border-color:var(--bad-line)}
.v2-panel-settings .v2-settings-security-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.v2-panel-settings .v2-settings-security-check{display:flex;align-items:center;gap:.875rem;padding:var(--space-2);border:1px solid var(--line);border-radius:var(--radius-card);text-decoration:none;color:var(--text);min-inline-size:0;min-block-size:var(--target);transition-property:background-color,border-color,color,box-shadow;transition-duration:140ms;transition-timing-function:ease-out}
.v2-panel-settings .v2-settings-security-check:hover{border-color:var(--accent-line,var(--accent));box-shadow:var(--shadow)}
.v2-panel-settings .v2-settings-security-check>.v2-field{flex:1;gap:.25rem;min-inline-size:0}.v2-panel-settings .v2-settings-security-check>.v2-icon:last-child{flex:none;color:var(--muted)}
.v2-panel-settings .v2-crumbs ol{display:flex;padding:0;gap:var(--space-1)}
.v2-panel-settings .v2-panel-settings__steps{list-style:none;display:flex;flex-wrap:wrap;padding:0;gap:.625rem var(--space-3);font-size:.8125rem;font-weight:500;color:var(--text-2)}
.v2-panel-settings__tabs>a.v2-btn{min-inline-size:0;margin-block-end:-1px}
.v2-panel-settings[dir=rtl] .v2-settings-security-check>.v2-icon:last-child{transform:scaleX(-1)}
.v2-panel-settings fieldset:has(>label>input[type=radio]){grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:0 var(--space-2)}
.v2-panel-settings__checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:0 var(--space-3);min-inline-size:0}
.v2-panel-settings__checks--pairs{grid-template-columns:repeat(2,minmax(0,1fr))}
.v2-panel-settings__checks bdi{color:var(--muted);font-size:.75rem}
.v2-panel-settings #v2-account-password-rules>li{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-1);font-size:.8125rem;line-height:1.25rem}
.v2-panel-settings__table td:not(:first-child){overflow-wrap:break-word}
.v2-panel-settings__split>aside .v2-panel-settings__table th{white-space:normal}
.v2-panel-settings__table td>p{color:var(--muted)}
.v2-panel-settings .v2-panel-operation-fields{container-type:inline-size;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));align-items:start;gap:var(--space-3);min-inline-size:0}
@container (min-width:40rem){.v2-panel-settings .v2-panel-operation-fields:not(:has(>.v2-panel-operation-inline))>.v2-field{grid-column:1/-1}}
.v2-panel-settings .v2-panel-operation-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:.875rem var(--space-4);min-inline-size:0}
.v2-panel-settings .v2-panel-operation-facts>div{display:grid;grid-template-columns:minmax(6.5rem,min(40%,14rem)) minmax(0,1fr);align-items:baseline;gap:.625rem;min-inline-size:0;text-align:start}
.v2-panel-settings .v2-panel-operation-facts dt{font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
.v2-panel-settings .v2-panel-operation-facts dd{font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.v2-panel-settings .v2-panel-operation-table{max-inline-size:100%;overflow:auto;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-panel-settings .v2-panel-operation-table:has(tbody:empty){display:none}
.v2-panel-settings .v2-panel-operation-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-panel-settings .v2-card__body>.v2-panel-operation-actions:has(>.kt-btn-primary){justify-content:flex-end}
.v2-panel-settings__pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));align-items:stretch;gap:var(--space-3);min-inline-size:0}
.v2-panel-settings__pair>*{min-inline-size:0}
.v2-panel-settings .v2-tool-card__facts>div{display:flex;flex-direction:column;gap:.25rem;min-inline-size:0}.v2-panel-settings .v2-tool-card__facts dt{font-size:.75rem;line-height:1rem;font-weight:400;color:var(--text-2)}
.v2-panel-settings ul:empty,.v2-panel-settings ul:not(:empty)+.v2-panel-settings__blank,.v2-panel-settings__table:has(tbody:empty){display:none}
.v2-panel-settings__fields--tight{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))}
.v2-panel-settings__columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));align-items:stretch;gap:var(--space-3);min-inline-size:0}.v2-panel-settings__columns>*,.v2-panel-settings__lead>*{min-inline-size:0}
.v2-panel-settings fieldset:has(>.v2-panel-settings__role){grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:var(--space-2) var(--space-3)}
.v2-panel-settings__lead{display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,3fr);align-items:start;gap:var(--space-3);min-inline-size:0}
.v2-panel-settings .v2-card__body>[role=status]:not([hidden]),.v2-panel-settings form>[role=status]:not(:empty):not([hidden]){font-size:.875rem;line-height:1.25rem;color:var(--text);padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice,var(--radius-control));background:var(--sunken)}
.v2-panel-settings :is(.v2-card__body,form)>[role=status]:is([data-state=unavailable],[data-state=uncertain],[data-state=invalid]):not(:empty){border-color:var(--warn-line);background:var(--warn-soft)}
.v2-panel-settings :is(.v2-card__body,form)>[role=status]:is([data-state=failed],[data-state=error]):not(:empty){border-color:var(--bad-line);background:var(--bad-soft)}
.v2-panel-settings__table td>[role=status]{color:var(--muted)}
.v2-panel-settings__table thead th{white-space:nowrap}
.v2-panel-settings .v2-card__body>:is(ul,ol):not(.v2-panel-settings__list,.v2-panel-settings__steps){font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-panel-settings [data-presentation-tabs=sections]>.v2-tabpanel{flex-direction:row;flex-wrap:wrap;align-items:stretch;gap:var(--space-4) var(--space-3)}
.v2-panel-settings [data-presentation-tabs=sections]>.v2-tabpanel>*{flex:1 1 100%;min-inline-size:0}
.v2-panel-settings [data-presentation-tabs=sections]>.v2-tabpanel>[data-v2-row=wide]{flex:1.6 1 520px}
.v2-panel-settings [data-presentation-tabs=sections]>.v2-tabpanel>[data-v2-row=narrow]{flex:1 1 340px}
.v2-panel-settings .v2-panel-settings__chips{list-style:none;padding:0;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-1)}
.v2-panel-settings__choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:var(--space-3);min-inline-size:0}
.v2-panel-settings__choice{display:flex;align-items:flex-start;gap:.625rem;padding:var(--space-2);border:1px solid var(--line-strong);border-radius:var(--radius-card);min-inline-size:0;cursor:pointer;transition-property:background-color,border-color,color,box-shadow;transition-duration:140ms;transition-timing-function:ease-out}
.v2-panel-settings__choice:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.v2-panel-settings__choice:has(input:disabled){cursor:not-allowed}
.v2-panel-settings__choice>input{flex:none;margin-block-start:.125rem}
.v2-panel-settings__choice>span{display:flex;flex-direction:column;gap:.25rem;min-inline-size:0}.v2-panel-settings__choice strong{font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}.v2-panel-settings__choice small{font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-panel-settings__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.625rem;margin:auto calc(-1*var(--v2-panel-padding)) calc(-1*var(--v2-panel-padding));padding:var(--space-2) var(--v2-panel-padding);border-block-start:1px solid var(--line);border-end-start-radius:var(--radius-card);border-end-end-radius:var(--radius-card)}
.v2-panel-settings__foot>.v2-muted{flex:1 1 200px;font-size:.8125rem}
.v2-panel-settings .v2-kpi-row{align-items:stretch}
.v2-panel-settings .v2-kpi__value{font-variant-numeric:tabular-nums}
.v2-panel-settings:dir(rtl) :is(h1,h2,h3,th,.v2-pill,.v2-kpi__value),[data-ui-theme="v2"] [dir=rtl] .v2-panel-settings :is(h1,h2,h3,th,.v2-pill,.v2-kpi__value){letter-spacing:0}
@media(min-width:601px){.v2-panel-settings__table td :is([data-xp-slot=actions],.v2-panel-settings__actions),.v2-panel-settings__table td[data-xp-slot=actions]{flex-wrap:nowrap;white-space:nowrap}.v2-panel-settings__table td :is([data-xp-slot=actions],.v2-panel-settings__actions):has(>:nth-child(4)){display:grid;grid-template-columns:repeat(2,max-content);justify-content:start}.v2-panel-settings__table td :is([data-xp-slot=actions],.v2-panel-settings__actions){gap:var(--space-1)}.v2-panel-settings__table td:first-child:not([colspan]){min-inline-size:128px}}
@media(max-width:1023px){.v2-panel-settings{gap:var(--space-3)}.v2-panel-settings [data-presentation-tabs=sections]>.v2-tabpanel{gap:var(--space-3)}}
@media(max-width:640px){.v2-panel-settings{--v2-panel-padding:var(--space-2)}}
@media(max-width:600px){.v2-panel-settings .v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
${phoneLabelCss('.v2-panel-settings')}
@media(min-width:1200px){.v2-panel-settings__checks--pairs{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:700px){.v2-panel-settings .v2-tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin;border-block-end:0;box-shadow:inset 0 -1px 0 var(--line)}.v2-panel-settings .v2-tabs>[role=tab]{flex:none;white-space:nowrap;margin-block-end:0}}
@media(min-width:1001px){.v2-panel-settings #v2-issue-source .v2-panel-settings__choices{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:1000px){.v2-panel-settings__split,.v2-panel-settings__lead{grid-template-columns:minmax(0,1fr)}}
@media(max-width:900px){.v2-panel-settings .v2-settings-security-checks{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.v2-panel-settings__fields,.v2-panel-settings__facts,.v2-panel-settings__checks--pairs,.v2-panel-settings .v2-settings-security-checks{grid-template-columns:minmax(0,1fr)}}
@media(min-width:901px){.v2-panel-settings #v2-team-members{table-layout:fixed;inline-size:100%;min-inline-size:0}.v2-panel-settings #v2-team-members th:nth-child(1){inline-size:26%}.v2-panel-settings #v2-team-members th:nth-child(2){inline-size:13%}.v2-panel-settings #v2-team-members th:nth-child(3){inline-size:14%}.v2-panel-settings #v2-team-members th:nth-child(4){inline-size:15%}.v2-panel-settings #v2-team-members th:nth-child(5){inline-size:14%}.v2-panel-settings #v2-team-members th:nth-child(6){inline-size:18%}}
@media(min-width:901px){.v2-panel-settings #v2-team-members td :is(.v2-btn,.v2-pill){white-space:normal;text-align:start}.v2-panel-settings #v2-team-members td .v2-panel-settings__actions{grid-template-columns:minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){.v2-panel-settings :is(.v2-btn,button,[role=tab],.v2-settings-security-check,.v2-panel-settings__choice){transition-duration:0ms}}`
