import { localeDirection, type Locale, type Translate } from '../../../../../i18n.ts'
import type { MailSurfaceProps } from '../../../../contract.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'
import { v2MailClientTemplatesForHooks } from '../client-templates.ts'
import { mailIcon, type MailIcon } from '../icons.ts'

/** Core supplies the current sealed mailbox and its independent route/capability decisions. */
export interface MailWorkspaceInput extends Pick<MailSurfaceProps, 'quotaUsedMb' | 'quotaUsedBytes' | 'quotaLimitMb'> {
  readonly locale?: Locale
  readonly mailbox: string
  readonly route: string
  readonly canRead?: boolean
  /** Permission to display supplied mailbox facts, independent of native service reads. */
  readonly canReadFacts?: boolean
  /** Trusted core presentation mode; never inferred from mailbox text or a request parameter. */
  readonly readOnly?: boolean
  readonly canManage?: boolean
  readonly activeFolder?: string
  readonly attachmentsAvailable?: boolean
  readonly searchAvailable?: boolean
  readonly searchIndexAvailable?: boolean
  readonly quotaAvailable?: boolean
  readonly boxTrapperAvailable?: boolean
  readonly authorizedRoutes?: ReadonlySet<string>
  /** Trusted output from UiTheme.slots.accountSecurity; never request or stored-message HTML. */
  readonly securityHtml?: string
}

export const esc = escapeHtml
export const technical = (value: string | number): string => `<bdi dir="ltr" class="v2-mono">${esc(normalizeAsciiDigits(value))}</bdi>`
export function ctx(input: MailWorkspaceInput): { t: Translate; readable: boolean; factsReadable: boolean; editable: boolean } {
  const identityKnown = input.mailbox.length > 0
  const readable = input.readOnly !== true && input.canRead === true && identityKnown
  const factsReadable = (input.canReadFacts ?? input.canRead === true) && identityKnown
  return { t: v2Messages.translator(input.locale ?? 'en'), readable, factsReadable, editable: readable && input.canManage === true }
}

// Complete literal class lists. A long loaded name may wrap inside its button, so a button is never taller than its text needs.
const WRAP = 'max-w-full h-auto min-h-8.5 py-1.5 whitespace-normal text-start'
export const BUTTON = {
  primary: `v2-btn v2-btn--primary kt-btn kt-btn-primary ${WRAP}`,
  outline: `v2-btn kt-btn kt-btn-outline ${WRAP}`,
  ghost: `v2-btn v2-btn--ghost kt-btn kt-btn-ghost ${WRAP}`,
  danger: `v2-btn kt-btn kt-btn-outline kt-btn-destructive ${WRAP}`,
} as const
export type ButtonTone = keyof typeof BUTTON
export const HINT = 'text-xs font-normal leading-relaxed text-muted-foreground'
export const SUBHEAD = 'text-sm font-semibold text-mono'
export const COPY = 'text-sm font-normal leading-relaxed text-secondary-foreground'

/** One action of a card: the single primary one, outline for secondary, ghost for tertiary and soft red for removal. */
export const button = (label: string, hooks?: HookAttributes, disabled = true, primary = false, glyph?: MailIcon, tone?: ButtonTone): string =>
  `<button type="button" class="${BUTTON[tone ?? (primary ? 'primary' : 'outline')]}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${glyph ? mailIcon(glyph, 16) : ''}${esc(label)}</button>`
export const submit = (label: string, hooks?: HookAttributes, disabled = true, glyph?: MailIcon): string =>
  `<button type="submit" class="${BUTTON.primary}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${glyph ? mailIcon(glyph, 16) : ''}${esc(label)}</button>`
/** A small action of a card header toolbar, such as Refresh beside the title. */
export const toolButton = (label: string, hooks?: HookAttributes, disabled = true, glyph?: MailIcon, primary = false): string =>
  `<button type="button" class="${primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary kt-btn-sm' : 'v2-btn kt-btn kt-btn-outline kt-btn-sm'}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${glyph ? mailIcon(glyph, 14) : ''}${esc(label)}</button>`

/** A Metronic settings row: the label beside its control from the large breakpoint, the hint under the control. */
export function field(id: string, label: string, controlHtml: string, help?: string, layout: 'row' | 'stack' = 'row'): string {
  const described = help && !controlHtml.includes('aria-describedby=')
    ? controlHtml.replace(/<(input|select|textarea)\b/, `<$1 aria-describedby="${esc(id)}-help"`) : controlHtml
  const hint = help ? `<p id="${esc(id)}-help" class="v2-field__help mt-0 ${HINT}">${esc(help)}</p>` : ''
  if (layout === 'stack') return `<div class="v2-field flex flex-col gap-2 min-w-0"><label class="kt-form-label" for="${esc(id)}">${esc(label)}</label>${described}${hint}</div>`
  return `<div class="v2-mail-workspace__row flex flex-wrap lg:flex-nowrap items-baseline gap-2.5"><label class="kt-form-label max-w-56" for="${esc(id)}">${esc(label)}</label><div class="v2-field flex flex-col gap-1.5 w-full min-w-0">${described}${hint}</div></div>`
}
/** A settings row whose control is not a single labelled input, such as a group of facts or a switch. */
export const row = (label: string, bodyHtml: string): string =>
  `<div class="v2-mail-workspace__row flex flex-wrap lg:flex-nowrap items-baseline gap-2.5"><span class="v2-field__label kt-form-label max-w-56">${esc(label)}</span><div class="flex flex-col gap-1.5 w-full min-w-0">${bodyHtml}</div></div>`
/** A confirmation: a checkbox with its sentence. */
export const check = (name: string, label: string, checked = false, disabled = true, hooks?: HookAttributes): string =>
  `<label class="v2-mail-workspace__check kt-label items-start font-normal leading-snug"><input class="kt-checkbox kt-checkbox-sm" type="checkbox"${name ? ` name="${esc(name)}"` : ''}${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${hookAttrs(hooks)}><span>${esc(label)}</span></label>`
/** An on/off setting: the label at the start and a Metronic switch at the end. Group several in `toggles`. */
export const toggle = (name: string, label: string, checked = false, disabled = true, hooks?: HookAttributes, extra = ''): string =>
  `<label class="v2-mail-workspace__check v2-mail-workspace__switch flex items-center justify-between gap-5 px-4 py-3 cursor-pointer"><span class="text-sm font-medium leading-snug text-mono">${esc(label)}</span><input class="kt-switch kt-switch-sm" type="checkbox"${name ? ` name="${esc(name)}"` : ''}${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${extra}${hookAttrs(hooks)}></label>`
export const toggles = (body: string): string => `<div class="v2-mail-workspace__toggles flex flex-col rounded-lg border border-border divide-y divide-border">${body}</div>`
export const input = (id: string, name: string, type = 'text', extra = '', disabled = true): string =>
  `<input class="kt-input" id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''} type="${esc(type)}"${extra}${disabled ? ' disabled' : ''}>`
export const area = (id: string, name: string, extra = '', disabled = true): string =>
  `<textarea class="kt-textarea" id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''}${extra}${disabled ? ' disabled' : ''}></textarea>`
export const select = (id: string, name: string, options: readonly (readonly [string, string])[], extra = '', disabled = true, selectedValue?: string): string =>
  `<span class="v2-select"><select class="${extra.includes(' multiple') ? 'kt-select h-auto py-1' : 'kt-select'}" id="${esc(id)}"${name ? ` name="${esc(name)}"` : ''}${extra}${disabled ? ' disabled' : ''}>${options.map(([value, label]) => `<option value="${esc(value)}"${value === selectedValue ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select>${icon('chevDown', 16)}</span>`
/** The actions of a card or form: at its end, the primary one last. */
export const actions = (body: string, align: 'end' | 'start' = 'end'): string => `<div class="${align === 'end' ? 'v2-mail-workspace__actions justify-end' : 'v2-mail-workspace__actions'}">${body}</div>`
export const fields = (body: string): string => `<div class="v2-mail-workspace__fields grid gap-5 min-w-0">${body}</div>`
/** Label and value pairs laid out as the rows of a Metronic general-info table. */
export const facts = (rows: readonly { label: string; valueHtml: string }[], hooks?: HookAttributes): string =>
  `<dl class="v2-mail-workspace__facts"${hookAttrs(hooks)}>${rows.map(item => `<div><dt>${esc(item.label)}</dt><dd>${item.valueHtml}</dd></div>`).join('')}</dl>`
/** Explanatory copy of a card. */
export const copy = (text: string, hooks?: HookAttributes): string => `<p class="${COPY}"${hookAttrs(hooks)}>${esc(text)}</p>`
/** A fixed remark the reader should not miss: a light Metronic alert. Its text may be written by a controller. */
export const note = (text: string, hooks?: HookAttributes, hidden = false): string =>
  `<p class="v2-mail-workspace__note kt-alert kt-alert-light kt-alert-primary"${hookAttrs(hooks)} role="note"${hidden ? ' hidden' : ''}>${esc(text)}</p>`
export const section = (id: string, title: string, bodyHtml: string, actionsHtml?: string, hooks?: HookAttributes): string =>
  card({ id, title, titleId: `${id}-heading`, bodyHtml: v2MailClientTemplatesForHooks(hooks) + bodyHtml, actionsHtml, hooks })
// phone rows print each value's column name from these custom properties; the header cells stay in the document
const columnNames = (columns: readonly string[]): string => columns.map((label, index) => `--h${index + 1}:'${label.replace(/[\\']/g, '\\$&')}'`).join(';')
export const table = (id: string, title: string, columns: readonly string[], bodyHtml: string, hooks?: HookAttributes): string =>
  `<div class="v2-mail-workspace__table kt-scrollable-x-auto overflow-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${esc(title)}" style="${esc(columnNames(columns))}"><table class="kt-table text-start" id="${esc(id)}"><caption class="v2-sr">${esc(title)}</caption><thead><tr>${columns.map(label => `<th class="text-start font-medium" scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}>${bodyHtml}</tbody></table></div>`
export const unreadRow = (text: string, columns: number): string => `<tr><td colspan="${columns}">${esc(text)}</td></tr>`
export function page(input: MailWorkspaceInput, title: string, description: string, bodyHtml: string, hooks?: HookAttributes): string {
  const { t, readable } = ctx(input)
  const blockNative = input.readOnly === true && !(input.route === '/mail/settings/security' && input.securityHtml)
  return `<div class="v2-mail-workspace flex flex-col gap-5 lg:gap-7.5 min-w-0" lang="${esc(input.locale ?? 'en')}" dir="${localeDirection(input.locale ?? 'en')}" data-mail-workspace-route="${esc(input.route)}"${blockNative ? ' data-readonly="true"' : ''}${hookAttrs(hooks)}>${v2MailClientTemplatesForHooks(hooks)}${pageHeader(t, { route: input.route, title, description, breadcrumb: [{ label: t(msgid('Inbox')), href: '/mail/inbox' }, { label: title }] })}${!readable ? `<p class="v2-mail-workspace__access kt-alert kt-alert-light kt-alert-warning" role="status"><span class="kt-alert-icon text-yellow-500">${icon('info', 18)}</span><span class="kt-alert-title">${esc(t(msgctxt('theme:v2', 'This mailbox workspace is unavailable for the current session. No mailbox data has been read.')))}</span></p>` : ''}${bodyHtml}</div>`
}

// Metronic gives the look through the kt-* classes and utilities in the markup. These rules keep the structure of
// elements the controllers write (facts, lists, status lines, phone table rows) and the states they set.
const STATUS = '.v2-mail-workspace .v2-card :is([role=status],[role=alert]):not(.kt-alert)'
const LIVE = `${STATUS}:not(:empty,[data-state=failed],[data-state=error])`
export const MAIL_WORKSPACES_CSS = `.v2-mail-workspace{max-inline-size:75rem}
.v2-mail-workspace .v2-card__body{gap:1.25rem}
.v2-mail-workspace__groups,.v2-mail-workspace form{display:grid;gap:1.25rem;min-inline-size:0}
.v2-mail-workspace__facts{display:grid;gap:.875rem;min-inline-size:0}
.v2-mail-workspace__facts>div{display:grid;grid-template-columns:minmax(9rem,14rem) minmax(0,1fr);align-items:baseline;gap:.625rem;min-inline-size:0;text-align:start}
.v2-mail-workspace__facts dt{margin:0;font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2);overflow-wrap:anywhere;text-align:start}
.v2-mail-workspace__facts dd{margin:0;font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--mono,var(--text));font-variant-numeric:tabular-nums;overflow-wrap:anywhere;text-align:start}
.v2-mail-workspace__facts dd :is(bdi,span){min-inline-size:0;max-inline-size:100%;overflow-wrap:anywhere;white-space:normal}
.v2-mail-workspace__facts.v2-dav-guide{gap:1.25rem}
.v2-mail-workspace__facts.v2-dav-guide>div{display:flex;flex-direction:column;gap:.5rem;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-mail-workspace__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-mail-workspace__actions:not(:has(>:not([hidden]))){display:none}
.v2-mail-workspace .v2-card p:empty{display:none}
.v2-mail-workspace .v2-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-mail-workspace .v2-mail-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13.75rem),1fr));gap:1.25rem;max-inline-size:45rem;min-inline-size:0}
.v2-mail-workspace #v2-mail-lists-admin .v2-card__body>div{display:grid;gap:1.25rem;min-inline-size:0}
.v2-mail-workspace .v2-security__form{max-inline-size:35rem}
.v2-mail-workspace .v2-table-wrap{border:1px solid var(--line);border-radius:var(--radius-notice);overflow-x:auto}
.v2-mail-workspace__table{max-inline-size:100%;min-inline-size:0;font-variant-numeric:tabular-nums}
.v2-mail-workspace[data-mail-mailing-lists] .v2-mail-workspace__table td:nth-child(-n+2){overflow-wrap:anywhere}
@media(min-width:601px){.v2-mail-workspace__table .v2-mail-folders__row-actions{flex-wrap:nowrap}.v2-mail-workspace [data-contact-table] bdi{white-space:nowrap}}
.v2-mail-workspace__list{display:grid;gap:.625rem;padding:0;list-style:none;min-inline-size:0;font-size:.875rem;color:var(--text)}
.v2-mail-workspace__list:empty{display:none}
.v2-mail-workspace__list>li:has(>.v2-btn){display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem;min-inline-size:0}
.v2-mail-workspace__list>li>span{min-inline-size:0;overflow-wrap:anywhere}
.v2-mail-workspace :is([data-filter-list],[data-filter-trace],[data-mail-track-detail-events])>li{padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:color-mix(in oklab,var(--kt-muted) 40%,transparent)}
.v2-mail-workspace [data-calview-legend]:not(:empty){display:flex;flex-wrap:wrap;gap:.5rem 1.25rem}
.v2-mail-workspace [data-calview-legend]>li{display:inline-flex;align-items:center;gap:.375rem;font-size:.8125rem;font-weight:500;color:var(--text-2)}
.v2-mail-workspace__preview{display:grid;gap:1.25rem;min-inline-size:0;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:color-mix(in oklab,var(--kt-muted) 40%,transparent)}
.v2-mail-workspace :is(input,select,textarea){min-inline-size:0;max-inline-size:100%}
.v2-mail-workspace input[type=number]{font-variant-numeric:tabular-nums}
.v2-mail-workspace :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-mail-workspace textarea{inline-size:100%;min-block-size:6.25rem}
.v2-mail-workspace__message{display:grid;gap:1.25rem;min-inline-size:0}
.v2-mail-workspace__message [data-mail-search-body]{font-size:.875rem;line-height:1.6;color:var(--text);white-space:pre-wrap;overflow-wrap:anywhere}
.v2-mail-workspace [hidden]{display:none}
.v2-mail-workspace .v2-card :is(p,ol,[data-forwarders-count]):not(.kt-alert,.kt-badge,[data-state=failed],[data-state=error]){font-size:.875rem;line-height:1.5;color:var(--text-2);overflow-wrap:anywhere}
.v2-mail-workspace :is([data-forwarders-count],[data-contact-count],[data-contact-capacity],[data-calendar-capacity],[data-filter-count],[data-mail-track-page-label]){font-variant-numeric:tabular-nums}
.v2-mail-workspace .v2-card p:not([role],[data-state],.kt-alert){max-inline-size:88ch}
${LIVE}{position:relative;padding-inline-start:1rem;font-size:.8125rem;color:var(--text-2)}
${LIVE}::before{content:"";position:absolute;inset-inline-start:0;inset-block-start:.5em;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:var(--line-strong)}
${STATUS}:is([data-state=read],[data-state=saved],[data-state=ready],[data-state=sent])::before{background:var(--ok)}
${STATUS}:is([data-state=reading],[data-state=saving],[data-state=busy])::before{background:var(--accent)}
${STATUS}:is([data-state=uncertain],[data-state=stale],[data-state=conflict])::before{background:var(--warn)}
${STATUS}:empty{display:none}
.v2-mail-workspace .v2-card .v2-mail-workspace__note{color:var(--text)}
.v2-mail-workspace__note::before{content:"\\eb5e";flex:none;font:normal 1.125rem/1.25rem 'keenicons-filled';color:var(--accent)}
.v2-mail-workspace__note:empty{display:none}
.v2-mail-workspace .v2-card__body>:is(form,article,section,[role=group],.v2-mail-workspace__groups):not(:first-child,[hidden],.v2-mail-workspace__preview,.v2-mail-workspace__actions){padding-block-start:1.25rem;border-block-start:1px solid var(--line)}
.v2-mail-workspace__table td[colspan]{padding:1.25rem!important;text-align:center;font-size:.875rem;color:var(--muted)}
.v2-mail-workspace__table tbody tr:has(>td[colspan]):hover>td{background:transparent}
.v2-mail-workspace .v2-card ol:not(.v2-mail-workspace__list){display:grid;gap:.5rem;padding-inline-start:1.25rem;list-style:decimal}
.v2-mail-workspace .v2-card__body>:is(div[role=group],[data-preferences-form],[data-identities-form],[data-filter-test-section],[data-account-password]):not(.v2-mail-workspace__actions,.v2-mail-workspace__groups),.v2-mail-workspace :is([data-filter-group],[data-filter-test]):not(.v2-mail-workspace__actions){display:grid;gap:1.25rem;min-inline-size:0}
.v2-mail-workspace__row>.v2-field>:is(input,select,textarea,.v2-select){inline-size:100%}
.v2-mail-workspace meter{appearance:none;-webkit-appearance:none;display:block;inline-size:100%;max-inline-size:30rem;block-size:.25rem;border:0;border-radius:var(--radius-pill);background:var(--secondary);overflow:hidden}
.v2-mail-workspace meter::-webkit-meter-inner-element{display:block;block-size:.25rem}
.v2-mail-workspace meter::-webkit-meter-bar{block-size:.25rem;border:0;border-radius:var(--radius-pill);background:var(--secondary)}
.v2-mail-workspace meter::-webkit-meter-optimum-value{border-radius:var(--radius-pill);background:var(--accent-fill)}
.v2-mail-workspace meter::-webkit-meter-suboptimum-value{border-radius:var(--radius-pill);background:var(--warn)}
.v2-mail-workspace meter::-webkit-meter-even-less-good-value{border-radius:var(--radius-pill);background:var(--bad)}
.v2-mail-workspace meter::-moz-meter-bar{border-radius:var(--radius-pill);background:var(--accent-fill)}
.v2-mail-workspace[data-mail-vacation] [data-vacation-form]{max-inline-size:none}
.v2-mail-workspace [data-vacation-requested]{font-variant-numeric:tabular-nums}
.v2-mail-workspace pre{white-space:pre-wrap;overflow-wrap:anywhere;max-inline-size:100%;min-inline-size:0;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--code);color:var(--code-text);font:.75rem/1.7 var(--font-mono);direction:ltr;text-align:start}
.v2-mail-workspace pre:empty{display:none}
@media(max-width:600px){.v2-mail-workspace__facts>div{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}
.v2-mail-workspace table.v2-table:not(:has(td))>thead>tr{display:flex;flex-wrap:wrap;gap:.25rem 1rem;padding:.5rem 1rem}
.v2-mail-workspace table.v2-table:not(:has(td))>thead>tr>th{padding:0;inline-size:auto}
.v2-mail-workspace__table thead{position:absolute;inline-size:1px;block-size:1px;margin:-1px;overflow:hidden;clip-path:inset(50%)}
.v2-mail-workspace__table :is(table,tbody){display:block}
.v2-mail-workspace__table tr{display:grid;grid-template-columns:minmax(0,1fr) fit-content(50%);column-gap:1rem;padding:.75rem 1rem;border-block-start:1px solid var(--line)}
.v2-mail-workspace__table tbody tr:first-child{border-block-start:0}
.v2-mail-workspace__table td,.v2-mail-workspace__table :is(th,td):is(:first-child,:last-child){display:block;grid-column:1;min-inline-size:0;block-size:auto;padding:0!important;border:0;background:transparent;font-size:.8125rem;color:var(--text-2);overflow-wrap:anywhere}
.v2-mail-workspace__table td:not(:first-child){padding-block-start:.125rem!important}
.v2-mail-workspace__table td:first-child{font-size:.875rem;font-weight:500;color:var(--mono,var(--text))}
.v2-mail-workspace__table td:last-child:not(:first-child):has(button,a,input){grid-column:2;grid-row:1/span 8;align-self:center;text-align:end}
.v2-mail-workspace__table td:not(:first-child,[colspan]):not(:last-child:has(button,a,input))::before{color:var(--muted)}
.v2-mail-workspace__table td:nth-child(2)::before{content:var(--h2) ": "}.v2-mail-workspace__table td:nth-child(3)::before{content:var(--h3) ": "}.v2-mail-workspace__table td:nth-child(4)::before{content:var(--h4) ": "}.v2-mail-workspace__table td:nth-child(5)::before{content:var(--h5) ": "}.v2-mail-workspace__table td:nth-child(6)::before{content:var(--h6) ": "}.v2-mail-workspace__table td:nth-child(7)::before{content:var(--h7) ": "}
.v2-mail-workspace__table td:last-child:not(:first-child):has(button,a,input)::before{content:none}
.v2-mail-workspace:is([data-mail-mailing-lists],[data-mail-connect-devices]) .v2-mail-workspace__table td:nth-child(2),.v2-mail-workspace__table [data-contact-table] td:nth-child(2){grid-column:1;grid-row:auto;justify-self:stretch;text-align:start}
.v2-mail-workspace__table td[colspan]{grid-column:1/-1;padding:1rem 0!important;font-weight:400;color:var(--muted);text-align:center}
.v2-mail-workspace__table [data-mail-folders-rows] td:last-child:has(button){grid-column:1/-1;grid-row:auto;display:flex;flex-wrap:wrap;gap:.5rem;padding-block-start:.5rem!important}}
`
