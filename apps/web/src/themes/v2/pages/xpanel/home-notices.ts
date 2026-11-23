import { accountWarningMessage, accountWarnings, ONBOARDING_TASKS } from '../../../../account-notices.ts'
import type { PanelSurfaceProps } from '../../../contract.ts'
import type { Translate } from '../../../../i18n.ts'
import { escapeHtml } from '../../html.ts'
import { icon } from '../../icons.ts'

/** Unread marker with measured warnings, then Getting Started until it is dismissed. Facts come from core. */
export function renderV2HomeNotices(props: PanelSurfaceProps, t: Translate, routes: ReadonlySet<string>): string {
  const warnings = accountWarnings({ diskBytes: props.usage?.diskBytes, bandwidthBytes: props.usage?.bandwidthMonth?.totalBytes, diskMb: props.plan?.resources.diskMb, bandwidthMb: props.plan?.resources.bandwidthMbMonth }, props.personal)
  const list = warnings.map(item => `<li data-account-warning="${item.id}" data-level="${item.level}">${escapeHtml(t(accountWarningMessage(item), { percent: item.percent }))}</li>`).join('')
  const notices = `<section class="v2-card v2-home-notices kt-card flex-row flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 has-[[data-account-warning]]:border-(color:--warn-line) has-[[data-account-warning]]:bg-(color:--warn-soft) has-[[data-account-warning]]:shadow-none" data-account-notices aria-labelledby="v2-home-notices-heading"><h2 class="text-base font-semibold text-mono" id="v2-home-notices-heading">${icon(warnings.length ? 'alert' : 'bell', 18)}${escapeHtml(t('Notifications'))} <span class="v2-home-notices__count kt-badge kt-badge-sm kt-badge-destructive" data-account-notices-count data-account-notices-base="${warnings.length}"${warnings.length ? '' : ' hidden'}>${warnings.length}</span></h2>${list ? `<ul>${list}</ul>` : `<p class="v2-muted text-sm text-secondary-foreground">${escapeHtml(t('No warning for this account. Unmeasured usage shows no warning.'))}</p>`}</section>`
  if (props.personal === undefined || props.personal.onboardingDismissed) return notices
  const tasks = ONBOARDING_TASKS.filter(task => routes.has(task.route)).map(task => `<li><a class="kt-link" href="${task.route}">${escapeHtml(t(task.label))}</a></li>`).join('')
  return `${notices}<section class="v2-card v2-home-notices kt-card flex-row flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5" data-onboarding aria-labelledby="v2-home-onboarding-heading"><h2 class="text-base font-semibold text-mono" id="v2-home-onboarding-heading">${escapeHtml(t('Getting started'))}</h2><ul>${tasks}</ul><div><button type="button" class="v2-btn kt-btn kt-btn-ghost kt-btn-sm" data-onboarding-dismiss disabled>${escapeHtml(t('Dismiss permanently'))}</button></div></section>`
}

export const V2_HOME_NOTICES_CSS = `.v2-panel-home .v2-home-notices{min-inline-size:0}
.v2-panel-home .v2-home-notices>h2{display:inline-flex;align-items:center;gap:var(--space-1)}
.v2-panel-home .v2-home-notices>:is(p,ul){flex:1 1 280px;min-inline-size:0;font-size:.875rem;line-height:1.25rem}
.v2-panel-home .v2-home-notices ul{display:flex;flex-direction:column;gap:var(--space-1);padding-inline-start:var(--space-2);list-style:disc}
.v2-panel-home .v2-home-notices[data-onboarding]>ul{flex-flow:row wrap;gap:var(--space-1) var(--space-3);padding:0;list-style:none}
.v2-panel-home .v2-home-notices[data-onboarding] a{display:inline-flex;align-items:center;min-block-size:var(--target)}
.v2-panel-home .v2-home-notices:has([data-account-warning])>h2>.v2-icon{color:var(--warn)}
.v2-panel-home .v2-home-notices>ul:has([data-account-warning]){flex-flow:row wrap;gap:var(--space-1) var(--space-3);padding:0;list-style:none}
.v2-panel-home .v2-home-notices li[data-account-warning]{font-weight:500;color:var(--warn);font-variant-numeric:tabular-nums}
.v2-panel-home .v2-home-notices li[data-level=critical]{color:var(--bad)}
.v2-panel-home .v2-home-notices__count{font-variant-numeric:tabular-nums}`
