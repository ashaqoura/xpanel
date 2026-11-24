// Shared pieces of the v2 page layouts: the page top (header, notices, KPI strip), the state slots, the facts list,
// the revision-checked save bar and the <template> slots core controllers clone.

import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
export { xpTemplate } from '../html.ts'
import { APPLY_ACTIONS, APPLY_BAR, APPLY_DOT, APPLY_TEXT } from '../components/change-review.ts'
import { card, type CardProps } from '../components/card.ts'
import { kpiCard, type KpiCardProps } from '../components/kpi-card.ts'
import { notice, type NoticeProps } from '../components/notice.ts'
import { pageHeader, type PageHeaderProps } from '../components/page-header.ts'
import { emptyState, errorState, loadingState, type EmptyStateProps, type ErrorStateProps, type LoadingStateProps } from '../components/state-block.ts'

export interface KpiStripProps {
  /** Names the summary region, such as "Token summary". */
  label: string
  items: readonly KpiCardProps[]
  busy?: boolean
  hooks?: HookAttributes
}

/** What every page layout starts with. */
export interface PageBaseProps {
  header: PageHeaderProps
  /** Banners under the header: page messages, capability notes, errors of the last action. */
  notices?: readonly NoticeProps[]
  kpis?: KpiStripProps
  /** Hooks on the layout root, such as the workspace root a core controller binds to. */
  hooks?: HookAttributes
}

export type LayoutState = 'ready' | 'loading' | 'empty' | 'error'

/** The kit state blocks a layout shows instead of (or above) its content. */
export interface StateSlots {
  loading?: LoadingStateProps
  empty?: EmptyStateProps
  error?: ErrorStateProps
}

export interface Fact {
  label: string
  value: string
  /** Pre-escaped rich value HTML (e.g. mixed localized text and `<bdi dir="ltr">` numeric parts). */
  valueHtml?: string
  /** Technical values (paths, users, versions) in the monospace face. */
  mono?: boolean
  /** Keep an LTR reference or date isolated within the field's normal alignment edge. */
  ltr?: boolean
  /** Optional data hooks placed on the fact value node. */
  hooks?: HookAttributes
}

export const kpiStrip = (props: KpiStripProps): string =>
  `<section class="v2-kpi-row" aria-label="${escapeHtml(props.label)}"${props.busy ? ' aria-busy="true"' : ''}${hookAttrs(props.hooks)}>${props.items.map(item => kpiCard({ headingLevel: 2, ...item })).join('')}</section>`

/** The layout root: header, notices, lead content (a page-state banner, a query form) and the KPI strip, then the
 *  family body, 32px apart (the standard's section rhythm). */
export const layoutRoot = (t: Translate, base: PageBaseProps, bodyHtml: string, leadHtml = ''): string =>
  `<div class="v2-layout grid grid-cols-1 content-start gap-8"${hookAttrs(base.hooks)}>${pageHeader(t, base.header)}${(base.notices ?? []).map(item => notice(t, item)).join('')}${leadHtml}${base.kpis ? kpiStrip(base.kpis) : ''}${bodyHtml}</div>`

/** The state block for a state other than ready; '' when ready. */
export function stateBlock(t: Translate, state: LayoutState, slots: StateSlots = {}): string {
  if (state === 'loading') return loadingState(t, slots.loading ?? {})
  if (state === 'empty') return emptyState(slots.empty ?? { icon: 'inbox', title: t(msgctxt('theme:v2', 'Nothing to show yet.')) })
  if (state === 'error') return errorState(t, slots.error ?? { lead: t(msgctxt('theme:v2', 'This page could not be read.')) })
  return ''
}

/** Facts as label-over-value blocks in a responsive grid; `rows` stacks them in one column, lined off from each
 *  other. Either way the value sits 8px directly beneath its label on the same start edge (the project standard). */
export const factList = (facts: readonly Fact[], label?: string, layout: 'tiles' | 'rows' = 'tiles'): string =>
  `<dl class="${layout === 'rows' ? 'v2-facts v2-facts--rows' : 'v2-facts'}"${label ? ` aria-label="${escapeHtml(label)}"` : ''}>${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${fact.valueHtml ?? `<bdi class="v2-num${fact.mono ? ' v2-mono' : ''}" dir="${fact.ltr || fact.mono ? 'ltr' : 'auto'}"${hookAttrs(fact.hooks)}>${escapeHtml(fact.value)}</bdi>`}</dd></div>`).join('')}</dl>`

/** Main column beside an aside of cards; the aside stacks under the main column on narrow screens. */
export function splitWithAside(mainHtml: string, aside: { label: string; html: string } | undefined): string {
  if (!aside?.html) return `<div class="v2-stack">${mainHtml}</div>`
  return `<div class="v2-split"><div class="v2-stack">${mainHtml}</div><aside class="v2-aside" aria-label="${escapeHtml(aside.label)}">${aside.html}</aside></div>`
}

export const cards = (items: readonly CardProps[] | undefined): string => (items ?? []).map(card).join('')

export interface RevisionSaveProps {
  pendingCount: number
  /** The stored revision this form was read at; core refuses the save when the stored revision moved on. */
  revision: string
  /** What saving does, such as "nothing is sent and no service reloads". */
  note?: string
  saveLabel?: string
  /** Id of the change review the save button opens (`aria-controls`). */
  controls?: string
  discard: HookAttributes
  save: HookAttributes
  hooks?: HookAttributes
}

/** The save bar of settings that are not configuration generations: a revision-checked save, no tests. */
export const revisionSaveBar = (t: Translate, props: RevisionSaveProps): string =>
  `<div class="${APPLY_BAR}" data-state="${props.pendingCount ? 'pending' : 'clean'}"${hookAttrs(props.hooks)}><p class="${APPLY_TEXT} v2-num" role="status">${APPLY_DOT}<strong>${escapeHtml(t(msgctxt('theme:v2', '{count, plural, one {# pending change} other {# pending changes}}'), { count: props.pendingCount }))}</strong> <span>${escapeHtml(props.note ?? t(msgctxt('theme:v2', 'Saved with a revision check: if the stored settings changed after this page read them, nothing is overwritten.')))}</span></p><input type="hidden" name="revision" value="${escapeHtml(props.revision)}"><span class="${APPLY_ACTIONS}"><button type="button" class="v2-btn kt-btn kt-btn-outline"${hookAttrs(props.discard)}>${escapeHtml(t('Discard'))}</button><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${props.controls ? ` aria-controls="${escapeHtml(props.controls)}"` : ''}${hookAttrs(props.save)}>${escapeHtml(props.saveLabel ?? t(msgctxt('theme:v2', 'Review and save')))}</button></span></div>`

/** The labelled region at the end of an editing page that holds its apply or save bar. */
export const commitRegion = (label: string, barHtml: string): string =>
  `<section class="v2-commit" aria-label="${escapeHtml(label)}">${barHtml}</section>`

// The standard's rhythm: 32px between the sections of a page and between cards, 24px between the groups inside a
// card or a KPI strip, 16px between fields and facts, 8px from a label to its value. Facts are a secondary label
// (14/22) over a medium value on the same start edge.
export const COMMON_LAYOUT_CSS = `.v2-layout{display:grid;grid-template-columns:minmax(0,1fr);align-content:start;gap:var(--space-4);min-width:0}
.v2-stack,.v2-aside{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.v2-stack--tight{gap:var(--space-3)}
.v2-aside{flex:1 1 320px;max-width:420px}
.v2-grid{display:flex;flex-wrap:wrap;align-items:stretch;gap:var(--space-4)}
.v2-grid__cell{flex:1 1 420px;min-width:0;display:flex;flex-direction:column}
.v2-grid__cell>*{flex:1 1 auto}
.v2-grid__cell--full{flex-basis:100%}
.v2-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));align-items:start;gap:var(--space-2)}
.v2-fields>.v2-switch-row{grid-column:1/-1}
.v2-fields--row{display:flex;flex-wrap:wrap}
.v2-fields--row>.v2-field{flex:1 1 160px}
.v2-fields>.v2-switch-row+.v2-switch-row{padding-top:var(--space-2);border-top:1px solid var(--line)}
.v2-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:var(--space-2) var(--space-3)}
.v2-facts>div{display:flex;flex-direction:column;gap:var(--space-1);min-width:0}
.v2-facts dt{font-size:.875rem;line-height:var(--lh-label);color:var(--text-2);font-weight:400}
.v2-facts dd{color:var(--mono,var(--text));font-weight:500;text-align:start;overflow-wrap:anywhere}
.v2-facts--rows{grid-template-columns:minmax(0,1fr)}
.v2-facts--rows>div+div{padding-top:var(--space-2);border-top:1px solid var(--line)}
.v2-facts--rows dd{font-weight:400}
.v2-inset{padding:var(--v2-panel-padding)}
.v2-card--flush>.v2-card__body>.v2-tabs{padding-inline:var(--v2-panel-padding)}
.v2-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem 1rem;padding:.75rem var(--v2-panel-padding);border-top:1px solid var(--line);font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
@media(max-width:959px){.v2-aside{max-width:none}}
`
