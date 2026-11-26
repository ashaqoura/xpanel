import type { Locale, Translate } from '../../../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { icon, type IconName } from '../../../icons.ts'
import { whmPolish } from '../monitoring/common.ts'

/** Admission is supplied by core; a theme never derives permissions from a role name. */
export interface LifecycleAccess {
  readonly locale: Locale
  readonly canRead: boolean
  readonly canManage: boolean
}

export const text = (t: Translate, value: string): string => escapeHtml(t(value))

/** Keenicons the v2 icon set has no name for, at the size of a button icon. Complete literal class lists. */
const KEENICONS = {
  eye: 'ki-filled ki-eye text-base', key: 'ki-filled ki-key text-base', notes: 'ki-filled ki-notepad text-base',
  pencil: 'ki-filled ki-pencil text-base', rocket: 'ki-filled ki-rocket text-base', trash: 'ki-filled ki-trash text-base',
  undo: 'ki-filled ki-arrows-loop text-base', upload: 'ki-filled ki-exit-up text-base', verify: 'ki-filled ki-verify text-base',
} as const
export type LifecycleGlyph = IconName | keyof typeof KEENICONS
const extraGlyph = (glyph: LifecycleGlyph): glyph is keyof typeof KEENICONS => Object.hasOwn(KEENICONS, glyph)
/** A decorative Keenicon beside a label; the label carries the meaning. */
export const lifecycleIcon = (glyph: LifecycleGlyph): string => extraGlyph(glyph) ? `<i class="${KEENICONS[glyph]}" aria-hidden="true"></i>` : icon(glyph, 16)

export function lifecycleHeader(t: Translate, title: string, route: string, description: string, actionsHtml?: string): string {
  return pageHeader(t, {
    breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: t(msgid('Server administration')) }, { label: t(title) }],
    title: t(title), route, description: t(description), ...(actionsHtml ? { actionsHtml } : {}),
  })
}

/** A header or card link to a neighbouring page or to a card on this page. */
export const lifecycleLink = (t: Translate, label: string, href: string, glyph?: LifecycleGlyph): string => `<a class="v2-btn kt-btn kt-btn-outline" href="${escapeHtml(href)}">${glyph ? lifecycleIcon(glyph) : ''}${text(t, label)}</a>`

/** Standing rules of a workflow: each line carries a check mark, never a state. */
export const lifecycleRules = (t: Translate, labels: readonly string[]): string =>
  `<ul class="v2-lifecycle__rules text-base text-secondary-foreground">${labels.map(label => `<li>${icon('okCircle', 16)}<span>${text(t, label)}</span></li>`).join('')}</ul>`

/** A section label inside a card. */
export const lifecycleHeading = (t: Translate, label: string, id?: string): string => `<h3 class="text-base font-semibold text-mono"${id ? ` id="${escapeHtml(id)}"` : ''}>${text(t, label)}</h3>`

/** Body text of a card; a hint is the quieter line under a control or a group. */
export const lifecycleNote = (t: Translate, label: string, hooks?: HookAttributes, hint = false): string =>
  `<p class="${hint ? 'v2-muted text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground' : 'text-base text-secondary-foreground'}"${hookAttrs(hooks)}>${text(t, label)}</p>`

export interface LifecycleCardParts {
  /** Header toolbar: the read and add actions of the card, built with lifecycleButton. */
  readonly actionsHtml?: string
  readonly footerHtml?: string
}

export function lifecycleCard(t: Translate, key: string, title: string, bodyHtml: string, hooks?: HookAttributes, parts: LifecycleCardParts = {}): string {
  return card({ title: t(title), titleId: `v2-lifecycle-${key}`, bodyHtml, ...(hooks ? { hooks } : {}), ...(parts.actionsHtml ? { actionsHtml: parts.actionsHtml } : {}), ...(parts.footerHtml ? { footerHtml: parts.footerHtml } : {}) })
}

export interface LifecycleButtonLook {
  readonly icon?: LifecycleGlyph
  /** A quiet tertiary action, or one that removes or stops something. A primary button ignores it. */
  readonly kind?: 'ghost' | 'danger'
  /** Card header and row size. */
  readonly small?: boolean
}
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary', outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost', danger: 'v2-btn kt-btn kt-btn-outline kt-btn-destructive',
} as const
const BUTTON_SMALL = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary', outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost', danger: 'v2-btn kt-btn kt-btn-outline kt-btn-destructive',
} as const

export function lifecycleButton(t: Translate, label: string, hooks: HookAttributes, primary = false, look: LifecycleButtonLook = {}): string {
  const kind = primary ? 'primary' : look.kind ?? 'outline'
  return `<button type="button" class="${look.small ? BUTTON_SMALL[kind] : BUTTON[kind]}"${hookAttrs(hooks)} disabled>${look.icon ? lifecycleIcon(look.icon) : ''}${text(t, label)}</button>`
}

export function lifecycleStatus(t: Translate, label: string, hooks: HookAttributes, hidden = false): string {
  return `<p class="v2-lifecycle__status text-base" role="status"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${text(t, label)}</p>`
}

/** Metronic control classes; a control that already carries a class keeps it. */
const CONTROL_CLASS = { input: 'kt-input', select: 'kt-select', textarea: 'kt-textarea' } as const

/** A stacked field: the label 8px above its control on the control's text edge, the hint under the control. */
export function lifecycleField(t: Translate, id: string, label: string, controlHtml: string, help?: string): string {
  const helpId = `${id}-help`
  const styled = controlHtml.replace(/^<(input|select|textarea)\b(?![^>]*\sclass=)/, (_, tag: keyof typeof CONTROL_CLASS) => `<${tag} class="${CONTROL_CLASS[tag]}"`)
  const control = help ? styled.replace(/^<(input|select|textarea)\b/, `<$1 aria-describedby="${escapeHtml(helpId)}"`) : styled
  return `<div class="v2-lifecycle__field v2-field kt-form-item"><label class="kt-form-label" for="${escapeHtml(id)}">${text(t, label)}</label>${control}${help ? `<p class="v2-field__help kt-form-description" id="${escapeHtml(helpId)}">${text(t, help)}</p>` : ''}</div>`
}

/** Which cell is the row name (default the first) and which value sits opposite it on a phone. */
export interface PhoneRow { readonly name?: number; readonly value?: number }

/** Phone rows name each stacked value: the translated column headers travel to CSS as custom properties on the table. */
export const phoneColumns = (labels: readonly string[], phone: PhoneRow = {}): string =>
  ` style="${escapeHtml(labels.map((label, index) => `--c${index + 1}:'${label.replace(/[\\']/g, '\\$&').replace(/\s+/g, ' ')}'`).join(';'))}"${phone.value ? ` data-phone-value="${phone.value}"` : ''}${phone.name ? ` data-phone-name="${phone.name}"` : ''}`

export type LifecycleColumn = string | { readonly label: string; readonly headerHtml: string }

export function lifecycleTable(t: Translate, title: string, columns: readonly LifecycleColumn[], hooks: HookAttributes, empty: string, phone: PhoneRow = {}): string {
  const labels = columns.map(column => t(typeof column === 'string' ? column : column.label))
  const headers = columns.map(column => typeof column === 'string' ? `<th scope="col">${text(t, column)}</th>` : `<th scope="col">${column.headerHtml}</th>`).join('')
  return `<div class="v2-lifecycle__scroll kt-scrollable-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${text(t, title)}"><table class="v2-lifecycle__table kt-table"${phoneColumns(labels, phone)}><caption class="v2-sr">${text(t, title)}</caption><thead><tr>${headers}</tr></thead><tbody${hookAttrs(hooks)}><tr><td colspan="${columns.length}">${text(t, empty)}</td></tr></tbody></table></div>`
}

/** The label and value classes of a fact: a row of a fact table, or a dashed tile that leads with its value. */
const FACT = { table: ['text-sm leading-(--lh-label) text-secondary-foreground', 'text-base leading-(--lh-text) text-mono'], tiles: ['text-sm leading-(--lh-label) text-secondary-foreground', 'text-base leading-(--lh-text) font-medium text-mono'] } as const
const FACT_LIST = { table: 'v2-lifecycle__fields', tiles: 'v2-lifecycle__fields v2-lifecycle__stats' } as const

/** Facts a controller fills by key: label and value rows of a fact table, or summary tiles (`tiles`). */
export function lifecycleFacts(t: Translate, facts: readonly { key: string; label: string; value?: string }[], hook: `data-${string}`, look: keyof typeof FACT = 'table'): string {
  return `<dl class="${FACT_LIST[look]}">${facts.map(fact => `<div class="v2-lifecycle__field"><dt class="${FACT[look][0]}">${text(t, fact.label)}</dt><dd class="${FACT[look][1]}"><bdi dir="ltr"${hookAttrs({ [hook]: fact.key })}>${fact.value === undefined ? text(t, msgid('Not read')) : escapeHtml(fact.value)}</bdi></dd></div>`).join('')}</dl>`
}

const PHONE_LABEL = 'display:block;margin-block-end:.5rem;color:var(--text-2);font-size:.875rem;font-weight:400;line-height:var(--lh-label)'
const PHONE_NAME = 'font-weight:500;color:var(--mono,var(--text))'

/** The same placement for a table whose markup this page cannot mark: the name and value cells are fixed in the rule. */
const fixedRow = (row: string, { name = 1, value }: PhoneRow): string => `${name === 1 ? '' : `
${row}>:first-child{grid-area:auto;font-weight:400}${row}>:first-child::before{content:var(--c1,none);${PHONE_LABEL}}
${row}>:nth-child(${name}){grid-area:1/1;${PHONE_NAME}}${row}>:nth-child(${name})::before{content:none}`}${value ? `
${name === 1 ? `${row}>:first-child{grid-area:1/1}` : ''}${row}>:nth-child(${value}){grid-area:1/2;justify-self:end;text-align:end;font-weight:400}${row}>:nth-child(${value})::before{content:none}` : ''}`

/** Two-column rows for a narrow table: the row name with the chosen value opposite it, the other values
 *  under them in pairs with their column header, actions and messages on a full line. Shared with the recovery tools. */
export const phoneRows = (table: string, fixed?: PhoneRow): string => {
  // The repeated :nth-child(n) lifts these rules over the theme-wide phone rows, which place the second cell and a leading checkbox.
  const row = `${table}>tbody>tr:nth-child(n)`, cells = [2, 3, 4, 5, 6, 7, 8, 9]
  // A leading checkbox sits beside the row name, which then takes the full line, as in the theme-wide phone rows.
  const checked = `${row}:has(>:first-child [type=checkbox])`
  return `${table}>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
${table},${table}>tbody{display:block}
${row}{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.5rem 1rem;padding:.75rem 1rem;border-block-end:1px solid var(--line)}
${row}:last-child{border-block-end:0}
${row}>:nth-child(n){position:static;grid-area:auto;background:none;justify-self:stretch;block-size:auto;padding:0!important;border:0;min-inline-size:0;text-align:start;overflow-wrap:anywhere}
${row}>:first-child{grid-column:1/-1;${PHONE_NAME}}
${row}>:not(:first-child)::before{${PHONE_LABEL}}
${cells.map(n => `${row}>:nth-child(${n})::before{content:var(--c${n},none)}`).join('')}
${row}>:is(td:has(.v2-btn,button,details),td[colspan]){grid-column:1/-1}
${row}>:is(td:has(.v2-btn,button,details),td[colspan])::before{content:none}
${table}[data-phone-value]:not([data-phone-name])>tbody>tr>:first-child:not([colspan]){grid-area:1/1}
${table}[data-phone-name]>tbody>tr>:first-child:not([colspan]){grid-column:auto;font-weight:400}${table}[data-phone-name]>tbody>tr>:first-child:not([colspan])::before{content:var(--c1,none);${PHONE_LABEL}}
${[1, ...cells].map(n => `${table}[data-phone-value="${n}"]>tbody>tr>:nth-child(${n}){grid-area:1/2;justify-self:end;text-align:end;font-weight:400}${table}[data-phone-value="${n}"]>tbody>tr>:nth-child(${n})::before{content:none}`).join('')}
${[2, 3].map(n => `${table}[data-phone-name="${n}"]>tbody>tr>:nth-child(${n}){grid-area:1/1;${PHONE_NAME}}${table}[data-phone-name="${n}"]>tbody>tr>:nth-child(${n})::before{content:none}`).join('')}
${fixed ? fixedRow(row, fixed) : ''}
${checked}{position:relative;padding-inline-start:3rem}
${checked}>:first-child{position:absolute;inset-block-start:.75rem;inset-inline-start:1rem;grid-area:auto}
${checked}>:first-child::before{content:none}
${checked}>:nth-child(2){grid-area:1/1/auto/-1}
${row}>td[colspan]{grid-area:auto/1/auto/-1;justify-self:stretch;padding:.75rem 0!important;font-weight:400;text-align:center;color:var(--muted)}${row}>td[colspan]::before{content:none}`
}

const L = '.v2-lifecycle'

/** The outline badge of Metronic on an element a controller creates without a class. */
const BADGE = 'display:inline-flex;align-items:center;gap:.375rem;min-block-size:1.5rem;padding:.125rem .45rem;border:1px solid var(--line);border-radius:.375rem;background:var(--sunken);color:var(--text-2);font-size:.75rem;font-weight:500;line-height:1rem;font-variant-numeric:tabular-nums'
/** A Metronic choice card: the selected card takes the primary border and tint. */
const CHOICE_CARD = 'padding:.75rem 1rem;border:1px solid var(--line-strong);border-radius:var(--radius-card);background:var(--surface);transition:background-color .14s ease-out,border-color .14s ease-out'
const CHOSEN = 'border-color:var(--accent-fill);background:var(--accent-soft)'
/** The chevron of a fold whose summary a controller fills: the Keenicon `ki-down` glyph. */
const CHEVRON = 'content:"\\eaa3";flex:none;font-family:keenicons-filled;font-size:.875rem;line-height:1;color:var(--muted);transition:transform .14s ease-out'

/** Scoped to lifecycle bodies: compact table cells do not inherit panel padding. */
export const LIFECYCLE_PAGES_CSS = `${L}{display:flex;flex-direction:column;gap:2rem;min-inline-size:0;text-align:start}
${L} :is(p,dl,dd,h2,h3,ol,ul){margin:0}
${L} [hidden]{display:none!important}
${L} [dir=ltr]{text-align:var(--v2-control-align,start);unicode-bidi:isolate}
${L}__column,${L}__group{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
${L}__group{gap:1rem}
${L}__grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:2rem;align-items:stretch}
${L}__grid--editor{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}
${L}__grid>${L}__column>.v2-card:last-child{flex:1 1 auto}
${L} .v2-card ${L}__column{gap:1.5rem}
${L} .v2-card__body{gap:1.5rem}
${L}__summary dd{font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;inline-size:fit-content;max-inline-size:100%;margin-inline-end:auto}
${L}__fields{display:flex;flex-direction:column;gap:1rem;min-inline-size:0}
${L}__field{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0;text-align:start}
${L}__field :is(input,select,textarea){inline-size:100%;min-inline-size:0;box-sizing:border-box}
${L}__field select{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${L}__field :is(dd,bdi){overflow-wrap:anywhere}
${L} ${L}__address{flex-direction:row;flex-wrap:wrap;gap:1rem}
${L} ${L}__address>div{flex:3 1 11.25rem;min-inline-size:0}
${L} ${L}__address>div:last-child{flex:1 1 4.5rem}
${L} dl${L}__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:1rem 1.5rem}
${L} dl${L}__fields dt{text-box:trim-end text}
${L} dl${L}__fields dd{min-inline-size:0;font-variant-numeric:tabular-nums}
${L} dl${L}__stats{grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));gap:.5rem}
${L} dl${L}__stats>${L}__field{min-inline-size:0;max-inline-size:100%;padding:.75rem 1rem;border:1px dashed var(--line-strong);border-radius:.375rem}
${L}__release{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:1.5rem}
.v2-lifecycle__actions,.v2-lifecycle__choices{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
${L}__actions{gap:.5rem}
${L}__choices{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,13.75rem),1fr));gap:.5rem;align-items:stretch}
${L}__choices>:not(${L}__choice){grid-column:1/-1}
${L} :is(${L}__choices,${L}__actions,[data-transfer-review-results],[data-transfer-archive-review]):empty{display:none}
${L}__choice{display:flex;align-items:flex-start;gap:.5rem;min-inline-size:0;min-block-size:var(--target);overflow-wrap:anywhere;cursor:pointer}
${L}__choice>input{flex:none}
${L}__choice>span{display:flex;flex-direction:column;gap:.25rem;min-inline-size:0}
${L}__choice:has(input:disabled){cursor:not-allowed}
${L}__choice${L}__switch{flex-direction:row-reverse;align-items:center;justify-content:space-between}
${L}__choices>${L}__choice{${CHOICE_CARD}}
${L}__choices>${L}__choice:has(input:checked){${CHOSEN}}
${L}__choices>${L}__choice:has(input:focus-visible){outline:2px solid var(--accent-fill);outline-offset:2px}
.v2-lifecycle [data-approved-whm-backups] [role=radiogroup]{display:flex;flex-direction:column;gap:16px;min-inline-size:0}
${L} ${L}__choice[role=radio]{inline-size:100%;align-items:center;${CHOICE_CARD};color:var(--text);font:inherit;text-align:start}
${L} ${L}__choice[role=radio]>span:last-child{flex:1;min-inline-size:0;text-align:start}
.v2-lifecycle__radio-ring{display:inline-flex;align-items:center;justify-content:center;flex:none;inline-size:18px;block-size:18px;border:2px solid var(--line-strong);border-radius:50%}
${L} ${L}__radio-ring{inline-size:1.25rem;block-size:1.25rem;border-width:1px;background:var(--bg)}
${L} [role=radio][aria-checked=true]{${CHOSEN}}
${L} [role=radio][aria-checked=true] .v2-lifecycle__radio-ring{border-color:var(--accent-fill);background:var(--accent-fill)}
${L} [role=radio][aria-checked=true] .v2-lifecycle__radio-ring::after{content:"";inline-size:.625rem;block-size:.625rem;border-radius:50%;background:var(--on-accent)}
.v2-lifecycle [data-approved-whm-backups] [role=radio]:disabled{color:var(--muted);background:var(--sunken);cursor:not-allowed}
${L}__scroll{max-inline-size:100%;overflow:auto}
${L} [data-transfer-revert-loss]:empty{display:none}
${L} [data-transfer-revert-loss] th{white-space:normal}
${L}__table{text-align:start}
${L}__table :is(th,td){text-align:start;overflow-wrap:break-word}
${L}__table thead th{overflow-wrap:normal}
${L}__table tbody th{padding:.75rem 1rem;font-weight:500;color:var(--mono,var(--text))}
${L}__table td{font-variant-numeric:tabular-nums}
${L}__table td[colspan]{padding-block:1.5rem;text-align:center;color:var(--muted)}
${L}__table bdi{overflow-wrap:anywhere}
@media(min-width:1280px){${L}__table bdi{overflow-wrap:break-word}}
${L}__table ${L}__actions{gap:.5rem}
${L} ${L}__table .v2-btn:where(:not(.kt-btn)){block-size:1.75rem;padding-inline:.625rem;gap:.3125rem;font-size:.75rem}
${L} ${L}__table .v2-btn:where(:not(.kt-btn)):is([data-xp-action=delete],[data-xp-action=revoke],[data-xp-action=remove]){border-color:color-mix(in oklab,var(--destructive) 10%,transparent);background:color-mix(in oklab,var(--destructive) 10%,transparent);color:var(--destructive)}
${L} ${L}__table .v2-btn:where(:not(.kt-btn)):is([data-xp-action=delete],[data-xp-action=revoke],[data-xp-action=remove])>i{color:inherit}
${L}__nowrap{white-space:nowrap}
${L} [data-account-backups] ${L}__table bdi.v2-num{white-space:nowrap}
${L} [data-account-backups] ${L}__table a.v2-btn{overflow-wrap:anywhere}
${L} :is(ul,ol):not([class],.v2-crumbs *){display:flex;flex-direction:column;gap:.25rem;padding-inline-start:1.25rem;list-style:disc;font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
${L}__status{overflow-wrap:anywhere}${L}__status:not([role=alert],[data-state=failed],[data-state=error]){color:var(--text-2)}
${L}__column>${L}__status:not([role=alert],[data-state=failed],[data-state=error]){padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken)}
${L}__key{padding:1rem;border-radius:var(--radius-control);background:var(--code);color:var(--code-text);font:.75rem/1.7 var(--font-mono);font-variant-numeric:tabular-nums;white-space:pre-wrap;overflow-wrap:anywhere}
${L}__steps{display:flex;flex-wrap:wrap;gap:.5rem 0;list-style:none;padding:0}
${L}__steps>li{display:flex;flex:1 1 8.25rem;align-items:center;gap:.5rem;min-inline-size:0;color:var(--text-2);font-size:1rem;line-height:var(--lh-text);font-weight:500}
${L}__steps>li>span:first-child{display:flex;align-items:center;justify-content:center;flex:none;inline-size:2rem;block-size:2rem;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums}
${L}__steps>li:not(:last-child)::after{content:"";flex:1 1 1rem;min-inline-size:.5rem;margin-inline-end:.5rem;block-size:2px;border-radius:1px;background:var(--line-strong)}
${L}__steps>li[aria-current=step]{color:var(--mono,var(--text))}
${L}__steps>li[aria-current=step]>span:first-child{background:var(--accent-fill);color:var(--on-accent)}
${L}__steps a{display:inline-flex;align-items:center;min-block-size:var(--target);color:inherit;text-decoration:none}
${L}__steps a:hover{color:var(--accent)}
${L} details{display:block;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}
${L} details>summary{display:flex;align-items:center;justify-content:space-between;gap:.5rem;min-block-size:var(--target);padding:.5rem 1rem;list-style:none;font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--mono,var(--text));cursor:pointer}
${L} details>summary::-webkit-details-marker{display:none}
${L} details>summary:not(:has(>i))::after{${CHEVRON}}
${L} details>summary>i{transition:transform .14s ease-out}
${L} details[open]>summary{border-block-end:1px solid var(--line)}
${L} details[open]>summary::after,${L} details[open]>summary>i{transform:rotate(180deg)}
${L} details>:not(summary){margin:1rem}
${L} .v2-card__body>details+details{margin-block-start:-1rem}
${L}__table details{border:0;border-radius:0}
${L}__table details>summary{justify-content:flex-start;padding:0;border:0}
${L}__table details>:not(summary){margin:.5rem 0 0}
${L} fieldset{border:0;padding:0;margin:0;min-inline-size:0}
${L} fieldset>legend{float:inline-start;inline-size:100%;margin-block-end:1rem;padding:0;font-size:1rem;line-height:var(--lh-text);font-weight:600;color:var(--mono,var(--text))}
${L} fieldset>legend+*{clear:both}
${L} .v2-card__body>fieldset+fieldset{padding-block-start:1.5rem;border-block-start:1px solid var(--line)}
${whmPolish(L)}${L}__rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:.5rem 2rem;padding:0;list-style:none}
${L}__rules>li{display:flex;align-items:flex-start;gap:.5rem}
${L}__rules>li>.v2-icon{flex:none;margin-block-start:.1875rem;color:var(--color-green-500,var(--ok))}
${phoneRows(`${L}__grid--editor ${L}__table:has(>[data-destination-rows])`)}
${L}__grid--editor ${L}__scroll:has(>table>[data-destination-rows]:empty){display:none}
${L}__archive-bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:1rem 1.5rem;min-inline-size:0}
${L}__archive-bar>${L}__field{flex:1 1 13.75rem}
.v2-backup-pending{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem 1.5rem;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--sunken)}
.v2-backup-pending[data-dirty="true"]{border-color:var(--accent-line);background:var(--accent-soft)}
.v2-backup-pending__meta{display:flex;flex-direction:column;gap:.5rem;flex:1 1 16.25rem;min-inline-size:0}
.v2-backup-pending__summary{font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--mono,var(--text))}
.v2-backup-pending__diff,.v2-transfer-discovery-pills{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0}
.v2-backup-pending__diff>li,.v2-transfer-discovery-pills>li{${BADGE}}
.v2-backup-pending[data-dirty="true"] .v2-backup-pending__diff>li{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.v2-upgrade-progress__head{font-variant-numeric:tabular-nums}
.v2-upgrade-meter__native{display:block;inline-size:100%;block-size:100%;border:0;appearance:none;background:transparent}
.v2-upgrade-meter__native::-webkit-progress-bar{background:transparent;border-radius:999px}
.v2-upgrade-meter__native::-webkit-progress-value{background:var(--accent-fill);border-radius:999px}
.v2-upgrade-meter__native::-moz-progress-bar{background:var(--accent-fill);border-radius:999px}
.v2-upgrade-log{display:flex;flex-direction:column;gap:.5rem;padding:.75rem 1rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--code);color:var(--code-text);font:.75rem/1.6 var(--font-mono);font-variant-numeric:tabular-nums;max-block-size:17.5rem;overflow:auto;list-style:none}
.v2-upgrade-log>li{display:flex;flex-wrap:wrap;gap:.5rem .75rem;padding-block:.25rem;border-block-end:1px solid var(--line)}
.v2-upgrade-log>li:last-child{border-block-end:0}
.v2-upgrade-log__time{color:var(--code-muted);flex:none}
.v2-upgrade-log__phase{font-weight:600;flex:none}
.v2-upgrade-log__msg{flex:1 1 12.5rem;min-inline-size:0;overflow-wrap:anywhere}
@media(prefers-reduced-motion:reduce){${L}__choice,${L} details>summary::after,${L} details>summary>i{transition:none}}
@media(max-width:600px){${phoneRows(`${L} ${L}__table`)}
${L} ${L}__table>thead:has(>tr>:first-child [type=checkbox]){position:static;display:block;inline-size:auto;block-size:auto;overflow:visible;clip-path:none}
${L} ${L}__table>thead>tr:has(>:first-child [type=checkbox]){display:flex;border-block-end:1px solid var(--line)}
${L} ${L}__table>thead>tr:has(>:first-child [type=checkbox])>th{display:flex;align-items:center;min-block-size:var(--target)}
${L} ${L}__table>thead>tr:has(>:first-child [type=checkbox])>th:nth-child(2){flex:1 1 auto}
${L} ${L}__table>thead>tr:has(>:first-child [type=checkbox])>th:nth-child(n+3){position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
${L} ${L}__table>thead ${L}__choice{align-items:center;min-inline-size:var(--target)}
${L}__steps>li:not(:last-child)::after{display:none}${L}__actions>:is(.v2-btn,button){flex:1 1 auto}${L}__summary .v2-tile{display:none}}
@media(max-width:1000px){${L}__grid{grid-template-columns:minmax(0,1fr)}}
`
