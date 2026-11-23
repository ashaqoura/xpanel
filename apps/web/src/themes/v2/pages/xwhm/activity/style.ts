import type { Translate } from '../../../../../i18n.ts'
import { card } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon, type IconName } from '../../../icons.ts'
import { phoneRows, type PhoneRow } from '../lifecycle/shared.ts'

/** Presentation parts of the activity pages (jobs, audit log, support): Metronic cards with a header toolbar and a
 *  footer, buttons with a leading Keenicon, fact tables and the audit timeline. Every hook stays on its element. */

/** Keenicons the v2 icon set has no name for, at the size of a button icon. Complete literal class lists. */
const KEENICONS = { notes: 'ki-filled ki-notepad text-base', trash: 'ki-filled ki-trash text-base' } as const
export type ActivityGlyph = IconName | keyof typeof KEENICONS
const extraGlyph = (glyph: ActivityGlyph): glyph is keyof typeof KEENICONS => Object.hasOwn(KEENICONS, glyph)
const glyphHtml = (glyph: ActivityGlyph): string => extraGlyph(glyph) ? `<i class="${KEENICONS[glyph]}" aria-hidden="true"></i>` : icon(glyph, 16)

const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary', outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost', danger: 'v2-btn kt-btn kt-btn-outline kt-btn-destructive',
} as const
const BUTTON_SMALL = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-sm kt-btn-primary', outline: 'v2-btn kt-btn kt-btn-sm kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-sm kt-btn-ghost', danger: 'v2-btn kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive',
} as const
export interface ActivityControlLook {
  readonly kind?: keyof typeof BUTTON
  readonly icon?: ActivityGlyph
  /** Card header size. */
  readonly small?: boolean
}
const controlClass = (look: ActivityControlLook): string => (look.small ? BUTTON_SMALL : BUTTON)[look.kind ?? 'outline']

/** A button a controller enables after its own admission; `enabled` opens it in the document. */
export const activityButton = (t: Translate, label: string, hooks: HookAttributes, look: ActivityControlLook & { readonly enabled?: boolean; readonly type?: 'button' | 'submit' } = {}): string =>
  `<button type="${look.type ?? 'button'}" class="${controlClass(look)}"${hookAttrs(hooks)}${look.enabled ? '' : ' disabled'}>${look.icon ? glyphHtml(look.icon) : ''}${escapeHtml(t(label))}</button>`

export const activityLink = (t: Translate, label: string, href: string, hooks: HookAttributes = {}, look: ActivityControlLook = {}): string =>
  `<a class="${controlClass(look)}" href="${escapeHtml(href)}"${hookAttrs(hooks)}>${look.icon ? glyphHtml(look.icon) : ''}${escapeHtml(t(label))}</a>`

/** A group of actions; `end` puts the closing actions of a form or a card at its end. */
export const activityActions = (body: string, end = false): string => `<div class="${end ? 'v2-observation__actions flex flex-wrap items-center justify-end gap-2.5' : 'v2-observation__actions flex flex-wrap items-center gap-2.5'}">${body}</div>`

export interface ActivityPanel {
  readonly id: string
  readonly title: string
  readonly bodyHtml: string
  /** The line under the title: what the card lists. */
  readonly description?: string
  /** Header toolbar: the read action or the state of the card. */
  readonly actionsHtml?: string
  readonly footerHtml?: string
  /** The body is a table that runs edge to edge. */
  readonly flush?: boolean
  readonly hooks?: HookAttributes
  readonly elementId?: string
}

/** A card of an activity page, labelled like the cards of the shared observation kit. */
export const activityPanel = (t: Translate, panel: ActivityPanel): string => card({
  title: t(panel.title), titleId: `v2-observation-${panel.id}`, bodyHtml: panel.bodyHtml,
  ...(panel.description ? { description: t(panel.description) } : {}), ...(panel.actionsHtml ? { actionsHtml: panel.actionsHtml } : {}),
  ...(panel.footerHtml ? { footerHtml: panel.footerHtml } : {}), ...(panel.flush ? { flush: true } : {}),
  ...(panel.hooks ? { hooks: panel.hooks } : {}), ...(panel.elementId ? { id: panel.elementId } : {}),
})

/** Label and value rows of a fact table; `valueHtml` is a value this page already knows, else the controller fills the hook. */
export const activityFacts = (rows: readonly (readonly [label: string, valueHtml: string])[]): string =>
  `<dl class="v2-activity__facts">${rows.map(([label, valueHtml]) => `<div><dt class="text-sm text-secondary-foreground">${escapeHtml(label)}</dt><dd class="text-sm text-mono">${valueHtml}</dd></div>`).join('')}</dl>`

/** Facts a controller fills by key, unread until then. */
export const activityFactTable = (t: Translate, items: readonly (readonly [key: string, label: string])[], attribute: `data-${string}`): string =>
  activityFacts(items.map(([key, label]) => [t(label), `<bdi dir="auto"${hookAttrs({ [attribute]: key })}>${escapeHtml(t(msgid('Not read')))}</bdi>`]))

const page = '.v2-observation'
/** Each table with its row name and opposite value on a phone; the column headers arrive as --v2-col-N on the table. */
const JOBS = `${page} table:has(>[data-whm-jobs-rows])`, JOB = `${JOBS}>tbody>tr:nth-child(n)`
const TABLES: readonly (readonly [table: string, phone: PhoneRow])[] = [
  ['table:has(>[data-whm-jobs-steps])', { name: 2, value: 3 }],
  ['table:has(>[data-whm-generation-timeline])', { name: 1, value: 6 }],
  ['table.v2-audit__entries', { name: 5, value: 7 }],
  ['table:has(>[data-v2-audit-safe-changes])', {}],
  ['table.v2-audit__generations', { value: 8 }],
  ['table:has(>[data-whm-support-services])', { value: 3 }],
  ['table:has(>[data-whm-support-jobs])', { value: 3 }],
]
// The audit tables on a phone. The shared observation sheet lays every cell from the third on as a labelled line and
// would label the name and the value of a row as well, so the row name loses its place. Here every other cell is a
// labelled line, and the name and its value keep the first line without a label.
const AUDIT = `${page}[data-whm-detail-route="/whm/audit"] .v2-observation__scroll table`, AUDIT_CELL = `${AUDIT}>tbody>tr:nth-child(n)>td`
const auditLead = (table: string, name: number, value?: number): string => `${AUDIT}${table}>tbody>tr:nth-child(n)>td:nth-child(${name}):not([colspan]){grid-area:1/1;display:block;text-align:start}
${value ? `${AUDIT}${table}>tbody>tr:nth-child(n)>td:nth-child(${value}):not([colspan]){grid-area:1/2;display:block;justify-self:end;text-align:end}` : `${AUDIT}${table}>tbody>tr:nth-child(n)>td:nth-child(${name}):not([colspan]){grid-column:1/-1}`}
${AUDIT}${table}>tbody>tr:nth-child(n)>td:is(:nth-child(${name})${value ? `,:nth-child(${value})` : ''}):not([colspan])::before{content:none}`

/** Page rules of the activity pages (jobs, audit log, support), loaded beside the observation stylesheet on those routes. */
export const WHM_ACTIVITY_CSS = `${page} :is(th,td){overflow-wrap:break-word}
${page} thead th{white-space:nowrap;overflow-wrap:normal}
${page} td,${page} .v2-activity__facts dd,${page} [data-audit-count],${page} .v2-observation__job-progress>bdi{font-variant-numeric:tabular-nums}
${page} td bdi{overflow-wrap:anywhere}
${page} .v2-observation__log:empty{display:none}
${page} .v2-observation__job-progress>bdi{flex:none;min-inline-size:4ch;text-align:end}
${page} .v2-card--flush>.v2-card__body{gap:0}
${page} .v2-card--flush .v2-observation__scroll{border:0;border-radius:0;background:none}
${page} .v2-activity__facts{display:grid;grid-template-columns:minmax(0,1fr);column-gap:1.875rem;min-inline-size:0}
${page} .v2-activity__facts>div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.625rem;align-items:baseline;min-inline-size:0;padding-block:.5rem}
${page} .v2-activity__facts dd{min-inline-size:0;overflow-wrap:anywhere;unicode-bidi:plaintext;text-align:var(--v2-control-align,match-parent)}
@media(min-width:640px){${page} .v2-activity__facts>div{grid-template-columns:minmax(0,14rem) minmax(0,1fr)}}
@media(min-width:1024px){${page} .v2-activity__facts:has(>:nth-child(5)){grid-template-columns:repeat(2,minmax(0,1fr))}${page} .v2-activity__facts:has(>:nth-child(5))>div{grid-template-columns:minmax(0,11rem) minmax(0,1fr)}}
${page} .v2-activity__timeline{display:flex;flex-direction:column;min-inline-size:0}
${page} details[data-audit-entry-detail]{position:relative;min-inline-size:0;padding-block-end:1.25rem}
${page} details[data-audit-entry-detail]:last-child{padding-block-end:0}
${page} details[data-audit-entry-detail]:not(:last-child)::before{content:"";position:absolute;inset-block:2.25rem 0;inset-inline-start:1.125rem;border-inline-start:1px solid var(--line-strong)}
${page} details[data-audit-entry-detail]>summary{display:flex;align-items:center;gap:.625rem;min-block-size:2.25rem;padding:0;border:0;list-style:none;font-weight:400;cursor:pointer}
${page} details[data-audit-entry-detail]>summary::-webkit-details-marker{display:none}
${page} details[data-audit-entry-detail]>summary>i{transition:transform .14s ease-out}
${page} details[data-audit-entry-detail][open]>summary>i{transform:rotate(180deg)}
${page} details[data-audit-entry-detail][open]>:not(summary){margin-block-start:.625rem;margin-inline-start:2.875rem}
${page} [data-generation-step]{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.375rem;font-variant-numeric:tabular-nums}
${page} [data-generation-step]::before{content:"";inline-size:.375rem;block-size:.375rem;flex:none;border-radius:50%;background:var(--muted)}
${page} [data-generation-step][data-step-status=done]::before{background:var(--color-green-500,var(--ok))}
${page} [data-generation-step][data-step-status=failed]::before{background:var(--destructive)}
${page} .v2-observation__charts{align-items:stretch}
${page} .v2-activity__manifest>li{display:flex;align-items:baseline;gap:.5rem}
${page} .v2-activity__manifest>li::before{content:"";flex:none;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:var(--muted);translate:0 -.125rem}
${page} .v2-activity__manifest[data-whm-support-included]>li::before{background:var(--color-green-500,var(--ok))}
${page} .v2-activity__manifest[data-whm-support-excluded]>li::before{background:var(--destructive)}
${page} .v2-activity__manifest[data-whm-support-redaction]>li::before{background:var(--accent-fill)}
${page} [data-whm-support-contact] p{font-size:.875rem;line-height:1.375rem;color:var(--text)}
${page} .v2-audit__generations td>span[title]::after{content:"…"}
${page} [data-whm-jobs-rows]>tr>:is(:first-child,:nth-child(n+6):nth-child(-n+8)){white-space:nowrap}
${page} [data-whm-jobs-rows]>tr>:nth-child(3){min-inline-size:11rem}
${page} [data-whm-jobs-rows] .v2-btn{justify-content:flex-start;padding-inline:0;text-align:start;white-space:nowrap;min-block-size:var(--target);font-weight:500;color:var(--mono,var(--text))}
${page} [data-whm-jobs-rows] .v2-btn:hover{background:transparent;color:var(--accent)}
@media(min-width:601px){${page} .v2-audit__generations td:not(:nth-child(3)){white-space:nowrap}}
${page} table{${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `--c${n}:var(--v2-col-${n})`).join(';')}}
@media(max-width:1599px){${phoneRows(JOBS, { name: 2, value: 4 })}
${JOB}{grid-template-columns:repeat(4,minmax(0,1fr))}
${JOB}>:nth-child(2){grid-area:1/1/auto/4}
${JOB}>:nth-child(4){grid-area:1/4}
${page} [data-whm-jobs-rows]>tr>*{min-inline-size:0;white-space:normal}
${page} [data-whm-jobs-rows] .v2-btn{min-block-size:var(--target);white-space:normal;overflow-wrap:anywhere}}
@media(max-width:600px){${JOB}{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
${JOB}>:nth-child(2){grid-area:1/1}
${JOB}>:nth-child(4){grid-area:1/2}
${TABLES.map(([table, phone]) => phoneRows(`${page} ${table}`, phone)).join('\n')}
${page} .v2-audit__generations>tbody>tr>*{min-inline-size:0;white-space:normal}
${page} table.kt-table>tbody>tr>td:not([colspan]){padding:0!important}
${AUDIT_CELL}:not([colspan]){grid-column:1/-1;display:flex;justify-content:space-between;gap:1rem;text-align:end}
${AUDIT_CELL}:not([colspan])::before{flex:none;margin:0;font-size:.75rem;color:var(--muted);text-align:start}
${[1, 2].map(n => `${AUDIT_CELL}:nth-child(${n}):not([colspan])::before{content:var(--v2-col-${n})}`).join('')}
${auditLead('.v2-audit__entries', 5, 7)}
${auditLead('.v2-audit__generations', 1, 8)}
${auditLead(':has(>[data-v2-audit-safe-changes])', 1)}
${page} .v2-card--flush .v2-observation__scroll>table>tbody>tr:nth-child(n){padding-inline:1.25rem}
${page} [data-whm-jobs-rows] .v2-btn{min-block-size:2.75rem}}`
