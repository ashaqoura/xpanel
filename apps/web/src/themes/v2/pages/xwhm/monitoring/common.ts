import { localeDirection, type Translate } from '../../../../../i18n.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { v2Messages } from '../../../messages.ts'
import { IDENTITY_ROWS_CSS } from '../../identity.ts'
import type { WhmStoredFactAuthority } from '../stored-facts.ts'

/** Core supplies independent read and mutation decisions after catalog and principal admission. */
export interface ObservationAuthority extends WhmStoredFactAuthority { readonly canRead: boolean; readonly canManage: boolean }
export interface WhmObservationInput extends WhmSurfaceProps {
  readonly observationAuthority?: ObservationAuthority
  /** The reviewed unit list and bounds are supplied by the host contract, never inferred from user input. */
  readonly monitoringLogUnits?: readonly string[]
  readonly monitoringLogDefaultLines?: number
  readonly monitoringLogMaxLines?: number
}

export const esc = escapeHtml
export function context(input: WhmObservationInput) {
  const locale = input.locale ?? 'en'
  const canRead = input.observationAuthority?.canRead === true && input.capabilityUnavailable !== true
  return { locale, t: v2Messages.translator(locale), canRead, canManage: canRead && input.observationAuthority?.canManage === true }
}
/** A frame reader may run its saved-value read in a read-only document for root; its writes stay closed. */
export const frameRead = (input: WhmSurfaceProps & { readonly observationAuthority?: unknown }): boolean =>
  (input.observationAuthority as { presentation?: string } | undefined)?.presentation === 'read-only' && (input.visibility?.principal ?? input.principal)?.kind === 'root'
export const technical = (value: string | number): string => `<bdi dir="ltr" class="v2-mono">${esc(value)}</bdi>`
/** A decorative Keenicon. A kt-btn sizes its own icon; elsewhere pass a text size. `glyph` and `size` are whole class names. */
export const ki = (glyph: string, size = ''): string => `<i class="ki-filled ${glyph}${size ? ` ${size}` : ''}" aria-hidden="true"></i>`
/** The leading icon Metronic shows on a common action, read from its English source message. */
const ACTION_GLYPHS: readonly (readonly [RegExp, string])[] = [
  [/^(?:Read|Refresh|Reload|Check again|Re-run|Update)\b/, 'ki-arrows-circle'], [/^Download\b/, 'ki-exit-down'], [/^Upload\b/, 'ki-exit-up'],
  [/^(?:Add|Create|Install)\b/, 'ki-plus'], [/^(?:Delete|Remove|Revoke|Unban)\b/, 'ki-trash'], [/^Copy\b/, 'ki-copy'], [/^Send\b/, 'ki-paper-plane'], [/^(?:Save|Apply)\b/, 'ki-check'],
  [/^(?:Run|Start)\b/, 'ki-to-right v2-flip'], [/^(?:Move|Switch|Migrate)\b/, 'ki-arrow-right-left'], [/^Trace\b/, 'ki-route'], [/^(?:Restore|Pull)\b/, 'ki-cloud-download'],
  [/^(?:Repair|Fix)\b/, 'ki-wrench'], [/^Turn on\b/, 'ki-toggle-on'], [/^Change\b.*\bpassword\b/, 'ki-key'], [/^Issue\b/, 'ki-key'],
]
export const actionGlyph = (text: string): string => ACTION_GLYPHS.find(([pattern]) => pattern.test(text))?.[1] ?? ''
/** A slot button is filled by core, so it carries no icon of its own. */
const lead = (text: string, hooks: HookAttributes | undefined, glyph: string | undefined): string => {
  const mark = hooks && 'data-xp-slot' in hooks ? '' : glyph ?? actionGlyph(text)
  return mark ? ki(mark) : ''
}
/** A button group; `end` puts a card's closing actions (save, apply) at the end of the row, as Metronic settings cards do. */
export const actions = (body: string, end = false): string => `<div class="${end ? 'v2-observation__actions flex flex-wrap items-center justify-end gap-2.5' : 'v2-observation__actions flex flex-wrap items-center gap-2.5'}">${body}</div>`
export const fields = (body: string): string => `<div class="v2-observation__fields grid gap-5">${body}</div>`
export const help = (t: Translate, text: string, hooks?: HookAttributes): string => `<p class="v2-muted text-sm text-secondary-foreground"${hookAttrs(hooks)}>${esc(t(text))}</p>`
/** `glyph` names the leading Keenicon; without it a common action takes its usual icon, and '' shows none. */
export const button = (t: Translate, text: string, hooks?: HookAttributes, enabled = false, primary = false, type: 'button' | 'submit' = 'button', glyph?: string): string => `<button type="${type}" class="${primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary' : 'v2-btn kt-btn kt-btn-outline'}"${hookAttrs(hooks)}${enabled ? '' : ' disabled'}>${lead(text, hooks, glyph)}${esc(t(text))}</button>`
/** A soft destructive action: stop, revoke, remove. */
export const dangerButton = (t: Translate, text: string, hooks?: HookAttributes, enabled = false, glyph?: string): string => `<button type="button" class="v2-btn v2-btn--danger kt-btn kt-btn-outline kt-btn-destructive"${hookAttrs(hooks)}${enabled ? '' : ' disabled'}>${lead(text, hooks, glyph)}${esc(t(text))}</button>`
/** The small outline action of a card header toolbar: read again, refresh. */
export const toolbarButton = (t: Translate, text: string, hooks?: HookAttributes, enabled = false, glyph?: string): string => `<button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm"${hookAttrs(hooks)}${enabled ? '' : ' disabled'}>${lead(text, hooks, glyph)}${esc(t(text))}</button>`
export const link = (t: Translate, text: string, href: string, hooks?: HookAttributes, glyph?: string): string => `<a class="v2-btn kt-btn kt-btn-outline" href="${esc(href)}"${hookAttrs(hooks)}>${glyph ? ki(glyph) : ''}${esc(t(text))}</a>`
/** A card header toolbar link to the page that owns a setting. */
export const toolbarLink = (t: Translate, text: string, href: string): string => `<a class="kt-link kt-link-underlined kt-link-dashed" href="${esc(href)}">${esc(t(text))}</a>`
export const field = (t: Translate, id: string, label: string, control: string, helpText?: string): string => `<div class="v2-field flex flex-col gap-1.5"><label class="kt-form-label" for="${esc(id)}">${esc(t(label))}</label>${control}${helpText ? `<p class="v2-muted kt-form-description text-xs text-muted-foreground">${esc(t(helpText))}</p>` : ''}</div>`
export const inputControl = (id: string, hooks: HookAttributes, enabled = false, extra = '', type = 'text'): string => `<input class="kt-input" id="${esc(id)}" type="${esc(type)}"${hookAttrs(hooks)}${extra}${enabled ? '' : ' disabled'}>`
export const area = (id: string, hooks: HookAttributes, extra = ''): string => `<textarea class="kt-textarea" id="${esc(id)}"${hookAttrs(hooks)}${extra} disabled></textarea>`
export const select = (t: Translate, id: string, hooks: HookAttributes, choices: readonly (readonly [string, string])[], enabled = false, selected?: string): string => `<span class="v2-select"><select class="kt-select" id="${esc(id)}"${hookAttrs(hooks)}${enabled ? '' : ' disabled'}>${choices.map(([value, label]) => `<option value="${esc(value)}"${selected === value ? ' selected' : ''}>${esc(t(label))}</option>`).join('')}</select></span>`
/** One of several choices: a checkbox with its name. */
export const check = (t: Translate, label: string, hooks: HookAttributes, enabled = false, ariaLabel?: string): string => `<label class="v2-observation__check kt-label font-normal"><input class="kt-checkbox kt-checkbox-sm" type="checkbox"${hookAttrs(hooks)}${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''}${enabled ? '' : ' disabled'}><span>${esc(t(label))}</span></label>`
/** One setting that is on or off: a Metronic switch. In a card it is a framed row, the name leading and the switch
 *  at the end; `inline` keeps the switch beside its name (a table cell). The markup order stays input, name. */
export const toggle = (t: Translate, label: string, hooks: HookAttributes, enabled = false, ariaLabel?: string, inline = false): string => `<label class="${inline ? 'v2-observation__check kt-label font-normal' : 'v2-observation__check v2-observation__toggle kt-label flex flex-row-reverse justify-between gap-5 rounded-xl border border-border px-3.5 py-2.5 leading-5 text-mono'}"><input class="kt-switch kt-switch-sm" type="checkbox"${hookAttrs(hooks)}${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''}${enabled ? '' : ' disabled'}><span>${esc(t(label))}</span></label>`
export const status = (t: Translate, text: string, hooks: HookAttributes, state = 'unread', hidden = false): string => `<p class="v2-observation__status text-sm" role="status" data-state="${esc(state)}"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${esc(t(text))}</p>`
/** A fact is a Metronic stat tile: the page CSS frames it and leads with the value; the markup order stays name, value. */
export const FACTS = 'v2-observation__facts grid gap-2.5'
export const FACT = 'flex flex-col gap-1.5 min-w-0'
export const FACT_LABEL = 'text-xs text-secondary-foreground'
export const FACT_VALUE = 'text-sm font-medium text-mono'
export function facts(t: Translate, items: readonly (readonly [string, string])[], attribute: `data-${string}`, value = t(msgid('Not read'))): string {
  return `<dl class="${FACTS}">${items.map(([key, label]) => `<div class="${FACT}"><dt class="${FACT_LABEL}">${esc(t(label))}</dt><dd class="${FACT_VALUE}"><bdi dir="auto"${hookAttrs({ [attribute]: key })}>${esc(value)}</bdi></dd></div>`).join('')}</dl>`
}
export function markerFacts(t: Translate, items: readonly (readonly [string, string])[], prefix: string): string {
  return `<dl class="${FACTS}">${items.map(([key, label]) => `<div class="${FACT}"><dt class="${FACT_LABEL}">${esc(t(label))}</dt><dd class="${FACT_VALUE}"><bdi dir="auto"${hookAttrs({ [`data-${prefix}-${key}`]: true })}>${esc(t(msgid('Not read')))}</bdi></dd></div>`).join('')}</dl>`
}
/** `toolbarHtml` fills the card header toolbar (kt-card-toolbar), where Metronic puts a card's read or refresh action. */
export const section = (t: Translate, id: string, title: string, bodyHtml: string, hooks?: HookAttributes, hidden = false, elementId?: string, toolbarHtml?: string): string => hidden
  ? `<div${elementId ? ` id="${esc(elementId)}"` : ''}${hookAttrs(hooks)} hidden>${card({ title: t(title), titleId: `v2-observation-${id}`, bodyHtml, ...(toolbarHtml ? { actionsHtml: toolbarHtml } : {}) })}</div>`
  : card({ title: t(title), titleId: `v2-observation-${id}`, bodyHtml, hooks, ...(elementId ? { id: elementId } : {}), ...(toolbarHtml ? { actionsHtml: toolbarHtml } : {}) })
/** A Metronic accordion row on a native `<details>`: give the element DISCLOSURE and start it with `summary(...)`,
 *  whose chevron turns when the row opens. */
export const DISCLOSURE = 'group rounded-xl border border-border px-3.5 py-1'
export const summary = (t: Translate, text: string): string => `<summary class="flex items-center justify-between gap-2.5 list-none [&::-webkit-details-marker]:hidden text-sm font-medium text-mono cursor-pointer"><span class="min-w-0">${esc(t(text))}</span>${ki('ki-down', 'text-xs text-muted-foreground transition-transform group-open:rotate-180')}</summary>`
/** An unread list placeholder as a Metronic empty state: a muted Keenicon over the line. The page CSS frames it. */
export const emptyLine = (t: Translate, text: string, glyph: string): string => `<span class="flex flex-col items-center gap-2.5">${ki(glyph, 'text-2xl text-muted-foreground')}<span>${esc(t(text))}</span></span>`
/** Phone rows name each stacked value: the translated column headers travel to CSS as custom properties on the table. */
export const columnLabels = (t: Translate, columns: readonly string[]): string =>
  ` style="${esc(columns.map((label, index) => `--v2-col-${index + 1}:'${t(label).replace(/[\\']/g, '\\$&')}'`).join(';'))}"`
export function table(t: Translate, title: string, columns: readonly string[], hooks: HookAttributes, empty = msgid('Not read'), numeric: readonly number[] = []): string {
  return `<div class="v2-observation__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(t(title))}"><table class="kt-table text-start"${columnLabels(t, columns)}><caption class="v2-sr">${esc(t(title))}</caption><thead><tr>${columns.map((label, index) => `<th scope="col"${numeric.includes(index) ? ' data-numeric' : ''}>${esc(t(label))}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}><tr><td class="text-secondary-foreground" colspan="${columns.length}">${esc(t(empty))}</td></tr></tbody></table></div>`
}
export function page(input: WhmObservationInput, route: string, title: string, description: string, body: string, hooks?: HookAttributes): string {
  const { t, locale, canRead } = context(input)
  return `<section class="v2-observation flex flex-col gap-5 lg:gap-7.5" data-whm-detail-route="${esc(route)}" data-capability-state="${canRead ? 'authorized' : 'unavailable'}" lang="${esc(locale)}" dir="${localeDirection(locale)}"${hookAttrs(hooks)}>${pageHeader(t, { route, title: t(title), description: t(description), breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: t(title) }] })}${body}</section>`
}

/** Reading rules shared by the WHM page families: quiet help and status lines, facts with muted labels. Zero specificity, so a family rule wins. */
/** Plain paragraphs a controller fills with a result, a job line or a record keep the body emphasis. */
const RESULT_TEXT = ['xp-slot', 'sc-job', 'sm-job', 'sw-job', 'sw-addons-job', 'whm-updates-job', 'whm-jobs-error', 'whm-jobs-failure', 'whm-jobs-verification', 'whm-jobs-log-status', 'whm-php-binary-status', 'whm-repair-preview-summary', 'whm-repair-removals-text', 'whm-tokens-reveal-text', 'web-stats-summary', 'generations-current', 'branding-asset-state', 'np-count', 'ip-pool-count', 'whm-ssh-opaque', 'whm-domain-application', 'whm-domain-removal-reason', 'status-notice', 'ctr-field'].map(hook => `[data-${hook}]`).join(',')
export const whmPolish = (s: string): string => `${s} :where(.v2-card__body p:not([class],[role],.v2-notice p,${RESULT_TEXT})){font-size:.875rem;line-height:1.375rem;color:var(--text-2)}
${s} :where(p[role=status]:not([data-state=failed],[data-state=error])){font-size:.875rem;line-height:1.375rem;color:var(--text-2);overflow-wrap:anywhere}
${s} p[role=status]:empty{display:none}
${s} :where(p:is([role=status],[role=alert]):is([data-state=problem],[data-state=bad],[data-state=invalid])){color:var(--bad)}
${s} :where(p[role=status]:is([data-state=ok],[data-state=saved],[data-state=success],[data-state=verified])){color:var(--ok)}
${s} :where(.v2-card__body,.v2-card,.v2-observation__groups,.v2-host__groups,.v2-admin-form,.v2-lifecycle__column,.v2-services__panel)>:where(.v2-field,.v2-admin-field,.v2-host__field,.v2-lifecycle__field):not(:has(textarea),.v2-field--row,.v2-admin-field){max-inline-size:30rem}
${s} :where(dt){font-size:.75rem;font-weight:400;color:var(--text-2)}
${s} :where(dd){font-variant-numeric:tabular-nums}
${s} :where(.v2-card__body :is(h3,legend)){font-size:.875rem;font-weight:600;color:var(--mono,var(--text))}
`

const SCOPE = '.v2-observation:is([data-whm-detail-route^="/whm/security"],[data-whm-detail-route^="/whm/monitoring"],[data-whm-detail-route="/whm/audit"]) .v2-observation__scroll'
const EVIDENCE = '.v2-observation [data-whm-security-evidence]'
const STATES = ['observed-ok', 'attention', 'unavailable'] as const

/** Shared only by these diagnostic, security and activity bodies; no global component overrides. Structure, bidi and
 *  controller states: surfaces, type and spacing come from the Metronic classes in the markup. */
export const WHM_OBSERVATION_CSS = `${IDENTITY_ROWS_CSS}
.v2-observation{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-observation :is(h2,h3,p,dl,dd,pre,fieldset,ul,ol){margin:0}
.v2-observation .v2-card__body{gap:1.25rem}
.v2-observation__groups{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-observation__columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem;align-items:stretch;min-inline-size:0}
.v2-observation__columns--wide-end{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}
.v2-observation__jump{display:flex;flex-wrap:wrap;gap:.5rem}
.v2-observation h2[id]{scroll-margin-block-start:6rem}
.v2-observation__fields,.v2-observation__facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:1.25rem;min-inline-size:0}
.v2-observation__facts{gap:.625rem}
.v2-observation__fields>.v2-field:has(textarea){grid-column:1/-1}
.v2-observation__columns :is(.v2-observation__fields,.v2-observation__facts){grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr));align-items:end}
.v2-observation__columns .v2-observation__facts{align-items:stretch}
.v2-observation:is([data-whm-detail-route="/whm/security"],[data-whm-detail-route="/whm/security/ssh"])>.v2-kpi-row{grid-template-columns:repeat(4,minmax(0,1fr))}
.v2-observation .v2-field{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0;text-align:start}
.v2-observation__facts>div{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0;padding:.625rem .875rem;border:1px dashed var(--line-strong);border-radius:var(--radius-control);text-align:start}
.v2-observation__facts>div>dd{order:-1}
.v2-observation__facts dd{font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;text-align:var(--v2-control-align,match-parent)}
.v2-observation__facts>div:only-child{grid-column:1/-1}
.v2-observation [data-panel-access] .v2-observation__facts{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))}
.v2-observation__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-observation__check{display:flex;align-items:center;gap:.625rem;min-block-size:var(--target);cursor:pointer}
.v2-observation__check>input{flex:none;margin:0}
.v2-observation__check>span{min-inline-size:0;overflow-wrap:anywhere}
.v2-observation__check+.v2-observation__check{margin-block-start:-.625rem}
.v2-observation__fields>.v2-observation__check{margin-block-start:0}
.v2-observation__toggle:has(:disabled){cursor:not-allowed}
.v2-observation .v2-field :is(input,select,textarea){inline-size:100%;min-inline-size:0}
.v2-observation .v2-field [dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-observation__scroll{max-inline-size:100%;overflow:auto;min-inline-size:0}
.v2-observation :is(th,td){text-align:start;vertical-align:top;padding:.75rem 1rem;overflow-wrap:anywhere}
.v2-observation td{font-variant-numeric:tabular-nums}
.v2-observation tbody td[colspan]:only-child{padding-block:1.25rem;text-align:center;color:var(--muted)}
.v2-observation__scroll tbody td:first-child:not([colspan]){font-weight:500;color:var(--mono,var(--text))}
.v2-observation tr:has(button)>:is(th,td){vertical-align:middle}
@media(min-width:601px){.v2-observation__scroll{border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface)}.v2-observation__scroll table:not(.kt-table) thead th{background:var(--subtle)}.v2-observation__scroll tbody tr:last-child>:is(th,td){border-block-end:0}.v2-observation [data-whm-ssh-key-rows] td:nth-child(2){white-space:nowrap}.v2-observation [data-whm-ssh-key-rows] td:nth-child(3){overflow-wrap:break-word}}
.v2-panel-access__code{white-space:pre-wrap;overflow-wrap:anywhere}
.v2-observation__log{max-block-size:30rem;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.8125rem/1.6 var(--font-mono);font-variant-numeric:tabular-nums}
.v2-observation__list{display:flex;flex-direction:column;gap:1rem;list-style:none;padding:0;min-inline-size:0}
.v2-observation :is([data-whm-server-health-empty],[data-whm-repair-empty],[data-whm-alerts-results]>li:only-child:not([class])){padding:1.25rem;border:1px dashed var(--line-strong);border-radius:var(--radius-card);font-size:.875rem;color:var(--text-2);text-align:center}
.v2-observation__charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1.25rem}
.v2-observation [data-whm-alerts-form] .v2-observation__check{white-space:nowrap}
.v2-observation [data-whm-alerts-threshold]{max-inline-size:7.5rem;font-variant-numeric:tabular-nums}
@media(min-width:1101px){.v2-observation__charts:has(>:nth-child(5):last-child){grid-template-columns:repeat(6,minmax(0,1fr))}
.v2-observation__charts:has(>:nth-child(5):last-child)>*{grid-column:span 2}
.v2-observation__charts:has(>:nth-child(5):last-child)>:nth-child(n+4){grid-column:span 3}}
.v2-observation__job-progress{display:flex;gap:.5rem;align-items:center;min-inline-size:8rem}
.v2-observation__job-progress>.v2-bar{flex:1 1 auto;min-inline-size:4rem}
.v2-observation__chart{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0}
.v2-observation__chart>[data-whm-monitoring-chart-state]{font-variant-numeric:tabular-nums}
.v2-observation__chart>svg{display:block;inline-size:100%;block-size:6rem;color:var(--accent)}
.v2-observation details>summary{min-block-size:var(--target);align-content:center;cursor:pointer}
.v2-observation details[open]>:not(summary){margin-block:.375rem .625rem}
.v2-observation fieldset{display:flex;flex-direction:column;gap:1rem;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--subtle);min-inline-size:0}
.v2-observation fieldset>legend{float:inline-start;inline-size:100%;padding:0;font-weight:600}
.v2-observation[data-whm-detail-route="/whm/security"]:has(tr[data-check-state])>.v2-kpi-row .v2-kpi__note{display:none}
.v2-observation__filter{display:flex;align-self:flex-start;max-inline-size:100%}
${EVIDENCE}:not(:has(tr[data-check-state])) .v2-observation__filter,.v2-observation__filter-empty{display:none}
${STATES.map(state => `${EVIDENCE}:has(.v2-observation__filter [value=${state}]:checked) tr[data-check-state]:not([data-check-state=${state}]){visibility:collapse}
${EVIDENCE}:has(.v2-observation__filter [value=${state}]:checked):has(tr[data-check-state]):not(:has(tr[data-check-state=${state}])) .v2-observation__filter-empty{display:block}`).join('\n')}
.v2-observation tr[data-check-state=attention]>td:nth-child(2){color:var(--warn);font-weight:500}
.v2-observation tr[data-check-state=observed-ok]>td:nth-child(2){color:var(--ok);font-weight:500}
.v2-observation tr[data-check-state=unavailable]>td:nth-child(2){color:var(--muted)}
.v2-observation :is([data-host-info],[data-host-info-unread]){display:flex;flex-direction:column;gap:1.25rem}
.v2-observation__savebar{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}
.v2-observation__savebar>p{flex:1 1 15rem}
.v2-observation [hidden]{display:none}
@media(min-width:641px){.v2-observation [data-whm-alerts-form] tbody>tr>:is(th,td){vertical-align:middle}}
@media(min-width:1024px){.v2-observation__columns{gap:1.875rem}}
@media(min-width:1101px){.v2-observation__facts:not(.v2-observation__columns .v2-observation__facts):is(:has(>:nth-child(4):last-child),:has(>:nth-child(7):last-child),:has(>:nth-child(8):last-child)){grid-template-columns:repeat(4,minmax(0,1fr))}.v2-observation__facts:not(.v2-observation__columns .v2-observation__facts,[data-panel-access] .v2-observation__facts):is(:has(>:nth-child(5):last-child),:has(>:nth-child(10):last-child)){grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(min-width:601px){.v2-observation table:has(>thead>tr>:nth-child(9)) :is(th,td){padding-inline:.625rem}.v2-observation table:has(>thead>tr>:nth-child(9)) td{overflow-wrap:break-word}
.v2-observation[data-whm-detail-route="/whm/monitoring/processes"] table:has(>[data-whm-monitoring-rows]) td:not(:nth-child(3),:nth-child(9)){white-space:nowrap}.v2-observation[data-whm-detail-route="/whm/monitoring/processes"] table:has(>[data-whm-monitoring-rows]) td:nth-child(9){overflow-wrap:anywhere}}
${whmPolish('.v2-observation')}@media(max-width:1100px){.v2-observation__columns{grid-template-columns:minmax(0,1fr)}.v2-observation:is([data-whm-detail-route="/whm/security"],[data-whm-detail-route="/whm/security/ssh"])>.v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){${SCOPE} td:nth-child(n+3):not([colspan]){grid-column:1/-1;display:flex;justify-content:space-between;gap:1rem;text-align:end}
${SCOPE} td:nth-child(n+3):not([colspan])::before{flex:none;font-size:.75rem;color:var(--text-2);text-align:start}
${[3, 4, 5, 6, 7, 8, 9, 10].map(n => `${SCOPE} td:nth-child(${n}):not([colspan])::before{content:var(--v2-col-${n})}`).join('\n')}}
@media(max-width:600px){${STATES.map(state => `${EVIDENCE}:has(.v2-observation__filter [value=${state}]:checked) tr[data-check-state]:not([data-check-state=${state}])`).join(',')}{display:block;block-size:0;padding:0;border:0;overflow:hidden;visibility:hidden}}
@media(max-width:640px){.v2-observation:is([data-whm-detail-route^="/whm/security"],[data-whm-detail-route^="/whm/monitoring"]) .v2-observation__facts{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-observation__fields{grid-template-columns:minmax(0,1fr)}
.v2-observation:is([data-whm-detail-route="/whm/security"],[data-whm-detail-route="/whm/security/ssh"])>.v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}
.v2-observation [data-panel-access] .v2-observation__facts{grid-template-columns:minmax(0,1fr)}
.v2-observation [data-whm-alerts-form] :is(table,tbody){display:block}
.v2-observation [data-whm-alerts-form] thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
.v2-observation [data-whm-alerts-form] tbody>tr{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.5rem 1rem;align-items:center;padding-block:1rem;border-block-end:1px solid var(--line)}
.v2-observation [data-whm-alerts-form] tbody>tr>:is(th,td){padding:0!important;border:0}
.v2-observation [data-whm-alerts-form] tbody>tr>:is(th,td:last-child){grid-column:1/-1}
.v2-observation [data-whm-alerts-form] td>.v2-observation__actions{flex-wrap:nowrap;gap:.5rem}
.v2-observation [data-whm-alerts-form] td>.v2-observation__actions>input{flex:1 1 0;min-inline-size:0;max-inline-size:7.5rem}
.v2-observation [data-whm-alerts-form] tbody>tr>td:last-child{font-size:.75rem;color:var(--text-2)}}
`
