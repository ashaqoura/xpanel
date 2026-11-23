// Wizard family (TplWizard): a stepper with the choices so far, one body panel per step (core shows the current
// one), a review step built from the change review, and Back/Next navigation.

import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'
import { type CardProps } from '../components/card.ts'
import { changeReview, type ChangeReviewProps } from '../components/change-review.ts'
import { stepper, type StepItem } from '../components/stepper.ts'
import { cards, factList, layoutRoot, splitWithAside, stateBlock, type Fact, type LayoutState, type PageBaseProps, type StateSlots } from './common.ts'

export interface WizardStep extends StepItem {
  /** Prefix of the panel's ids: `<id>-title`. */
  id: string
  /** The step heading, such as "Choose the addon domain". */
  title: string
  bodyHtml?: string
  /** The review step: current vs proposed and the gate, from the kit change review. */
  review?: ChangeReviewProps
  /** Hooks on the step's panel, which core shows and hides as the step changes. */
  panelHooks?: HookAttributes
}

export interface WizardPageProps extends PageBaseProps {
  /** Names the steps region, such as "Conversion steps". */
  label: string
  steps: readonly WizardStep[]
  /** The choices made so far, such as the domain and the new username. */
  summary?: readonly Fact[]
  /** Error shows above the steps' panel and locks it; loading replaces the current step's body. */
  state?: Exclude<LayoutState, 'empty'>
  states?: StateSlots
  nav: {
    back?: { label?: string; hooks: HookAttributes }
    /** Without a reason the step can go on; with one, Next is aria-disabled and described by the reason. */
    next: { label: string; hooks: HookAttributes; blockedReason?: string }
    note?: string
    /** Links shown when the flow is done, built with the kit. */
    linksHtml?: string
  }
  aside?: readonly CardProps[]
  asideLabel?: string
  extra?: readonly CardProps[]
}

const NOW = new Set(['current', 'running', 'failed'])

export function wizardPage(t: Translate, props: WizardPageProps): string {
  const state = props.state ?? 'ready'
  const total = props.steps.length
  const current = Math.max(0, props.steps.findIndex(step => NOW.has(step.state)))
  // Each step is a Metronic card part: a header with the step kicker over its title, then the 20px padded body.
  const panels = props.steps.map((step, index) => {
    if (!step.bodyHtml && !step.review) return ''
    const titleId = `${step.id}-title`
    const body = index === current && state === 'loading' ? stateBlock(t, 'loading', props.states)
      : `${step.bodyHtml ?? ''}${step.review ? changeReview(t, step.review) : ''}`
    return `<section class="v2-wizard__panel" aria-labelledby="${escapeHtml(titleId)}"${index === current ? '' : ' hidden'}${hookAttrs(step.panelHooks)}><header class="v2-wizard__head kt-card-header flex-col items-start justify-center gap-1 py-3"><p class="v2-wizard__kicker v2-num text-xs font-medium text-primary">${escapeHtml(t(msgctxt('theme:v2', 'Step {current} of {total}'), { current: index + 1, total }))}</p><h2 id="${escapeHtml(titleId)}">${escapeHtml(step.title)}</h2></header><div class="v2-wizard__body kt-card-content flex flex-col gap-5">${body}</div></section>`
  }).join('')
  const { nav } = props
  const reasonId = 'v2-wizard-next-reason'
  // A blocked Next stays focusable (aria-disabled) so its reason can be read; it takes the Metronic disabled look.
  const next = `<button type="button" class="${nav.next.blockedReason ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-50' : 'v2-btn v2-btn--primary kt-btn kt-btn-primary'}"${nav.next.blockedReason ? ` aria-disabled="true" aria-describedby="${reasonId}"` : ''}${hookAttrs(nav.next.hooks)}>${escapeHtml(nav.next.label)}${icon('chevRight', 14)}</button>`
  const foot = `<footer class="v2-wizard__foot kt-card-footer flex-wrap justify-between gap-2.5"><div class="v2-wizard__note grow basis-72 text-sm text-secondary-foreground">${nav.note ? `<p>${escapeHtml(nav.note)}</p>` : ''}${nav.next.blockedReason ? `<p id="${reasonId}">${escapeHtml(nav.next.blockedReason)}</p>` : ''}</div><span class="v2-wizard__nav flex flex-wrap items-center gap-2.5 ms-auto">${nav.back ? `<button type="button" class="v2-btn kt-btn kt-btn-outline"${hookAttrs(nav.back.hooks)}>${icon('chevLeft', 14)}${escapeHtml(nav.back.label ?? t('Back'))}</button>` : ''}${nav.linksHtml ?? ''}${next}</span></footer>`
  const steps = `<section class="v2-card v2-wizard__steps kt-card" aria-label="${escapeHtml(props.label)}">${stepper({ label: t('Steps'), steps: props.steps, inline: true })}${props.summary?.length ? factList(props.summary, t('Your choices')) : ''}</section>`
  const flow = `<div class="v2-card v2-card--flush v2-wizard kt-card">${panels}${foot}</div>`
  const side = cards(props.aside)
  return layoutRoot(t, props, `${steps}${state === 'error' ? stateBlock(t, 'error', props.states) : ''}${splitWithAside(flow, side ? { label: props.asideLabel ?? props.label, html: side } : undefined)}${cards(props.extra)}`)
}

// The steps card is a bare padded card (20px, 20px between the stepper and the choices). The review step sits inside
// the step body without a second card frame.
export const WIZARD_LAYOUT_CSS = `.v2-wizard__steps>.v2-facts{padding-block-start:1.25rem;border-top:1px solid var(--line)}
.v2-wizard__body>.v2-review{border:0!important;background:transparent!important;box-shadow:none!important}
.v2-wizard__body>.v2-review>.v2-card__head{min-height:0!important;padding:0 0 .75rem!important}
.v2-wizard__body>.v2-review>.v2-card__body{padding:1.25rem 0 0!important}
`
