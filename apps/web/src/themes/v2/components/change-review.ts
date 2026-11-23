import type { Translate } from '../../../i18n.ts'
import { attr, escapeHtml, hookAttrs, xpTemplate, type HookAttributes } from '../html.ts'
import { icon, type IconName } from '../icons.ts'
import { statusPill, type StatusPillProps } from './status-pill.ts'

export interface ReviewRow {
  label: string
  current: string
  proposed: string
  /** Technical values (paths, limits as written to config) in the monospace face. */
  mono?: boolean
  /** Per-field review: the form field the row's Undo restores (`data-xp-field`). */
  field?: string
  /** Per-field review: the list edits in words, such as "+ spam@example.com  - old.example". */
  detail?: string
  /** The proposed value does not validate; it shows in the problem tone. */
  invalid?: boolean
}

/** One check that runs before the switch: the command and what it proves, such as "parses the whole rspamd configuration". */
export interface ReviewTest {
  command: string
  purpose?: string
}

export interface ReviewStep {
  icon: IconName
  text: string
}

export interface ChangeReviewProps {
  title: string
  titleId: string
  /** Id of the section, for the save bar control that opens the review (`aria-controls`). */
  id?: string
  description?: string
  status?: StatusPillProps
  /** Text beside the title, such as "2 pending changes". */
  meta?: string
  /** `fields` (TplSettings): one row per changed field, current beside proposed, each with Undo. `sides` (TplMatrix,
   *  TplWizard): all current values beside all proposed values. */
  layout?: 'sides' | 'fields'
  /** Heading of the current values, such as "Current · gen 142" or "Current · saved 2026-10-22 14:05 UTC". */
  currentLabel?: string
  rows: readonly ReviewRow[]
  /** Per-field review: shown while no row is pending, such as "No pending changes. The form matches generation 142." */
  emptyText?: string
  /** Hooks on the per-field row list, which core repaints from the `review-row` template. */
  rowsHooks?: HookAttributes
  /** Checks that run before the switch, such as "nginx -t" or "apachectl configtest". Settings saved with a
   *  revision check instead of a generation pass none, and the gate is left out. */
  tests: readonly ReviewTest[]
  /** The active generation, kept on disk as the rollback target. */
  rollbackGeneration?: number
  /** Exactly what the change affects and what it keeps. */
  impact?: { lead: string; text: string }
  /** What saving does, step by step: the file it writes, what it does not reload, where it is recorded. */
  steps?: { label: string; items: readonly ReviewStep[] }
  /** The in-review actions: back to the form, and the save itself. */
  actions?: { back: { label?: string; hooks: HookAttributes }; save: { label?: string; hooks: HookAttributes } }
  /** The apply bar of this change, built with {@link applyBar}. */
  applyBarHtml?: string
  hooks?: HookAttributes
}

// The Metronic "light" panels of the review: a muted box for the current values, a primary-tinted one for the
// proposed values. Complete literal class lists, so the stylesheet build keeps every utility.
const SIDE = 'v2-review__side flex flex-col gap-2.5 grow basis-64 min-w-0 rounded-lg border border-border bg-muted/40 p-4'
const SIDE_PROPOSED = 'v2-review__side v2-review__side--proposed flex flex-col gap-2.5 grow basis-64 min-w-0 rounded-lg border border-primary/10 bg-primary/5 p-4'
const BOX = 'v2-review__box flex flex-col gap-1.5 grow basis-0 min-w-0 rounded-md border border-border bg-muted/40 p-3'
const BOX_PROPOSED = 'v2-review__box v2-review__box--proposed flex flex-col gap-1.5 grow basis-0 min-w-0 rounded-md border border-primary/10 bg-primary/5 p-3'
const KICKER = 'text-xs font-medium text-secondary-foreground'

const facts = (rows: readonly ReviewRow[], side: 'current' | 'proposed'): string =>
  `<dl class="flex flex-col gap-4">${rows.map(row => {
    const changed = side === 'proposed' && row.current !== row.proposed
    return `<div class="flex flex-col gap-1 min-w-0"><dt class="text-xs text-secondary-foreground">${escapeHtml(row.label)}</dt><dd class="${changed ? 'v2-review__changed text-sm font-semibold text-mono text-start break-words' : 'text-sm font-normal text-foreground text-start break-words'}"><bdi class="v2-num${row.mono ? ' v2-mono' : ''}" dir="${row.mono ? 'ltr' : 'auto'}">${escapeHtml(row[side])}</bdi></dd></div>`
  }).join('')}</dl>`

// One per-field row. Without a row it is the `review-row` template: core fills its text slots, sets data-xp-field and
// the aria-label of Undo, and data-state (changed or invalid) on the clone root.
function fieldRow(t: Translate, currentLabel: string, row?: ReviewRow): string {
  const slot = (name: string, value: string | undefined, cls: string): string =>
    `<span class="${cls}" data-xp-slot="${name}"${row && !value ? ' data-empty' : ''}>${escapeHtml(value ?? '')}</span>`
  const undo = row && !row.field ? ''
    : `<button type="button" class="v2-btn v2-btn--ghost v2-review__undo kt-btn kt-btn-sm kt-btn-ghost" data-xp-action="undo"${row ? ` data-xp-field="${escapeHtml(row.field!)}" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Undo the change to {field}'), { field: row.label }))}"` : ''}>${escapeHtml(t('Undo'))}</button>`
  return `<li class="v2-review__row flex flex-col gap-2" data-state="${row?.invalid ? 'invalid' : 'changed'}"><div class="v2-review__row-head flex items-center justify-between gap-2.5">${slot('name', row?.label, 'v2-review__name text-sm font-medium text-mono')}${undo}</div><div class="v2-review__pair flex items-stretch gap-2"><div class="${BOX}"><span class="${KICKER}">${escapeHtml(currentLabel)}</span>${slot('current', row?.current, 'v2-num v2-mono text-sm break-words')}</div>${icon('arrow', 16)}<div class="${BOX_PROPOSED}"><span class="text-xs font-medium text-primary">${escapeHtml(t('Proposed'))}</span>${slot('proposed', row?.proposed, 'v2-num v2-mono text-sm font-semibold break-words')}</div></div>${slot('details', row?.detail, 'v2-review__detail v2-mono text-xs text-secondary-foreground break-words')}</li>`
}

export function changeReview(t: Translate, props: ChangeReviewProps): string {
  const currentLabel = props.currentLabel ?? t('Current')
  const rollback = props.rollbackGeneration === undefined ? ''
    : `<p class="v2-review__note text-xs text-secondary-foreground">${escapeHtml(t(msgctxt('theme:v2', 'Generation {generation} stays on disk as the rollback target. If a test fails, generation {generation} stays live and nothing is reloaded.'), { generation: props.rollbackGeneration }))}</p>`
  const impact = props.impact
    ? `<div class="v2-notice v2-notice--warn v2-review__impact kt-alert kt-alert-light kt-alert-warning grow basis-80 min-w-0" role="note">${icon('alert')}<p><strong>${escapeHtml(props.impact.lead)}</strong> ${escapeHtml(props.impact.text)}</p></div>` : ''
  const head = `${props.meta ? `<span class="v2-review__meta v2-num text-sm text-muted-foreground">${escapeHtml(props.meta)}</span>` : ''}${props.status ? statusPill({ ...props.status, live: true }) : ''}`
  const compare = props.layout === 'fields'
    ? `<ul class="v2-review__rows flex flex-col gap-5 empty:hidden"${hookAttrs(props.rowsHooks)}>${props.rows.map(row => fieldRow(t, currentLabel, row)).join('')}</ul>${props.emptyText ? `<p class="v2-review__empty v2-num text-sm text-secondary-foreground">${escapeHtml(props.emptyText)}</p>` : ''}${xpTemplate('review-row', fieldRow(t, currentLabel))}`
    : `<div class="v2-review__compare flex flex-wrap items-stretch gap-2.5"><div class="${SIDE}"><h3 class="${KICKER}">${escapeHtml(currentLabel)}</h3>${facts(props.rows, 'current')}</div>${icon('arrow', 20)}<div class="${SIDE_PROPOSED}"><h3 class="text-xs font-medium text-primary">${escapeHtml(t('Proposed'))}</h3>${facts(props.rows, 'proposed')}</div></div>`
  const gate = props.tests.length || rollback || impact
    ? `<div class="v2-review__gate flex flex-wrap items-start gap-5 rounded-lg border border-border bg-muted/40 p-4">${props.tests.length || rollback ? `<div class="v2-review__tests flex flex-col gap-2.5 grow basis-96 min-w-0">${props.tests.length ? `<h3 class="text-sm font-semibold text-mono">${escapeHtml(t(msgctxt('theme:v2', 'Before the switch')))}</h3><ol>${props.tests.map(test => `<li><code>${escapeHtml(test.command)}</code>${test.purpose ? ` ${escapeHtml(test.purpose)}` : ''}</li>`).join('')}</ol>` : ''}${rollback}</div>` : ''}${impact}</div>` : ''
  const steps = props.steps ? `<ul class="v2-review__steps grid gap-2.5 sm:grid-cols-2" aria-label="${escapeHtml(props.steps.label)}">${props.steps.items.map(step => `<li class="flex gap-2.5 rounded-lg border border-border p-3.5 text-sm">${icon(step.icon, 16)}<span class="min-w-0 break-words">${escapeHtml(step.text)}</span></li>`).join('')}</ul>` : ''
  const actions = props.actions
    ? `<div class="v2-review__actions flex flex-wrap justify-end gap-2.5"><button type="button" class="v2-btn kt-btn kt-btn-outline"${hookAttrs(props.actions.back.hooks)}>${escapeHtml(props.actions.back.label ?? t(msgctxt('theme:v2', 'Back to editing')))}</button><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${hookAttrs(props.actions.save.hooks)}>${escapeHtml(props.actions.save.label ?? t('Save settings'))}</button></div>` : ''
  return `<section class="v2-card v2-review kt-card"${attr('id', props.id)} aria-labelledby="${escapeHtml(props.titleId)}"${hookAttrs(props.hooks)}>
<div class="v2-card__head kt-card-header"><div class="v2-card__title"><h2 id="${escapeHtml(props.titleId)}">${escapeHtml(props.title)}</h2>${props.description ? `<p>${escapeHtml(props.description)}</p>` : ''}</div>${head ? `<div class="v2-card__actions kt-card-toolbar">${head}</div>` : ''}</div>
<div class="v2-card__body kt-card-content">${compare}
${gate}${steps}${actions}${props.applyBarHtml ?? ''}</div>
</section>`
}

// The bar's state dot follows data-state on the bar root ("pending" or "clean"), which core updates with the count.
export const APPLY_DOT = '<span class="v2-apply__dot" aria-hidden="true"></span>'
/** The save bar surface: a kt-card row with the state at the start and the actions at the end. */
export const APPLY_BAR = 'v2-apply kt-card flex-row flex-wrap items-center justify-between gap-2.5 px-5 py-3.5'
export const APPLY_TEXT = 'v2-apply__text flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondary-foreground'
export const APPLY_ACTIONS = 'v2-apply__actions flex flex-wrap items-center gap-2.5 ms-auto'

export interface ApplyBarProps {
  pendingCount: number
  /** Tests that run first; shown so the person knows nothing switches before they pass. */
  tests?: readonly string[]
  /** The generation this apply writes, and the active one kept as the rollback target. */
  nextGeneration?: number
  rollbackGeneration?: number
  discard: HookAttributes
  apply: HookAttributes
  hooks?: HookAttributes
}

export function applyBar(t: Translate, props: ApplyBarProps): string {
  const tests = props.tests?.length ? ` <span class="v2-apply__tests inline-flex flex-wrap gap-1">${props.tests.map(test => `<code class="kt-badge kt-badge-sm kt-badge-outline">${escapeHtml(test)}</code>`).join(' ')}</span>` : ''
  const generation = props.nextGeneration !== undefined && props.rollbackGeneration !== undefined
    ? `<span>${escapeHtml(t(msgctxt('theme:v2', 'Applies as generation {next}; generation {current} stays as the rollback target'), { next: props.nextGeneration, current: props.rollbackGeneration }))}</span>` : ''
  return `<div class="${APPLY_BAR}" data-state="${props.pendingCount ? 'pending' : 'clean'}"${hookAttrs(props.hooks)}><p class="${APPLY_TEXT} v2-num" role="status">${APPLY_DOT}<strong>${escapeHtml(t(msgctxt('theme:v2', '{count, plural, one {# pending change} other {# pending changes}}'), { count: props.pendingCount }))}</strong> <span>${escapeHtml(t(msgctxt('theme:v2', 'Tests run before the switch')))}${tests ? ':' : ''}</span>${tests}${generation}</p><span class="${APPLY_ACTIONS}"><button type="button" class="v2-btn kt-btn kt-btn-outline"${hookAttrs(props.discard)}>${escapeHtml(t('Discard'))}</button><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${hookAttrs(props.apply)}>${escapeHtml(t(msgctxt('theme:v2', 'Review and apply')))}</button></span></div>`
}

// The review and the bars are Metronic cards laid out with utilities. These rules hold only what follows the state
// core sets: the accent line while changes are pending, the pending dot, an invalid proposed value and the slots
// that hide while empty.
export const CHANGE_REVIEW_CSS = `.v2-review:has(.v2-review__rows>li,.v2-review__actions),.v2-apply[data-state="pending"]{border-color:var(--accent-line)!important}
.v2-review :is(.v2-review__compare,.v2-review__pair)>.v2-icon{align-self:center;color:var(--muted)}
.v2-review__rows:not(:empty)+.v2-review__empty,.v2-review__detail[data-empty]{display:none}
.v2-review__row[data-state=invalid] .v2-review__box--proposed>:last-child{color:var(--destructive)}
.v2-review__tests ol{padding-inline-start:1.25rem;list-style:decimal;display:flex;flex-direction:column;gap:.375rem;font-size:.8125rem;line-height:1.55;color:var(--text-2)}
.v2-review__tests code{font-size:.75rem;color:var(--text)}
.v2-review__steps .v2-icon{margin-block-start:.125rem;color:var(--accent)}
.v2-apply__text strong{color:var(--mono,var(--text));font-weight:600}
.v2-apply__dot{flex:none;width:.5rem;height:.5rem;border-radius:50%;background:var(--muted)}
.v2-apply[data-state="pending"] .v2-apply__dot{background:var(--color-yellow-500,var(--warn))}
`
