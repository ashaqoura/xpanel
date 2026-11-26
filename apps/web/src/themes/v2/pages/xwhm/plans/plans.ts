import type { Plan } from '@xpanel/core'
import type { Translate } from '../../../../../i18n.ts'
import { formatAsciiRate, formatDisplayDateTime } from '../../../../../display-format.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { escapeHtml } from '../../../html.ts'
import { renderV2PlanEditor } from './editor.ts'
import { filterBar } from '../../../components/filter-bar.ts'
import { DENIED_PLAN_AUTHORITY, button, facts, group, page, phoneCell, planEditable, planFactsReadable, planAccountFactsReadable, planHref, planPrincipal, planReadable, table, technical, type WhmPlanAuthority } from './common.ts'
import { ki } from '../monitoring/common.ts'

/** The plan picker is a list of Metronic radio cards. Each card is a link, so the mark at its end is drawn from the
 *  state the server rendered (aria-current), not from an input. */
const PICK = 'flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-2.5 hover:border-input hover:bg-accent/50'
const PICKED = 'flex items-center justify-between gap-2 rounded-xl border border-primary bg-primary/5 px-3.5 py-2.5'
const RADIO_OFF = '<span class="shrink-0 size-4.5 rounded-full border border-input bg-background" aria-hidden="true"></span>'
const RADIO_ON = '<span class="flex items-center justify-center shrink-0 size-4.5 rounded-full border border-primary bg-primary" aria-hidden="true"><span class="size-1.5 rounded-full bg-primary-foreground"></span></span>'

const limit = (t: Translate, value: number | 'unlimited', unit = ''): string => value === 'unlimited' ? escapeHtml(t('Unlimited')) : technical(`${value}${unit ? ' ' + unit : ''}`)
const rate = (t: Translate, value: number | 'unlimited'): string => value === 'unlimited' ? escapeHtml(t('Unlimited')) : technical(formatAsciiRate(value))
/** Plan data is desired configuration. Measured use, host apply and browser draft comparison remain separate. */
export function renderV2WhmPlans(t: Translate, props: WhmSurfaceProps, authority: WhmPlanAuthority = DENIED_PLAN_AUTHORITY): string {
  const route = '/whm/plans', readable = planFactsReadable(props, authority, route), principal = planPrincipal(props)
  const plans = readable ? props.plans?.filter(plan => principal?.kind === 'root' || plan.ownerId === null || plan.ownerId === principal?.id) : undefined
  const lists = readable ? props.featureLists?.filter(list => principal?.kind === 'root' || list.ownerId === null || list.ownerId === principal?.id) : undefined
  const observedAccounts = readable && planAccountFactsReadable(authority) ? props.accounts?.filter(account => principal?.kind === 'root' || account.ownerId === principal?.id) : undefined
  const selectedId = props.planEditorState?.kind === 'edit' ? props.planEditorState.plan.id : undefined
  const selected = selectedId ? plans?.find(plan => plan.id === selectedId) : undefined
  const requestedUnavailable = props.planEditorState?.kind === 'unavailable' || selectedId !== undefined && selected === undefined
  const accountCount = (plan: Plan): string => observedAccounts === undefined ? escapeHtml(t('Not read')) : technical(observedAccounts.filter(account => account.planId === plan.id).length)
  const savedBy = (plan: Plan | undefined): string => {
    if (!plan) return escapeHtml(t('Not read'))
    if (!plan.updatedBy) return escapeHtml(t(msgid('Not recorded')))
    const when = plan.updatedAt ? formatDisplayDateTime(plan.updatedAt) : '—'
    return when !== '—' ? `${technical(plan.updatedBy)} · ${technical(when)}` : technical(plan.updatedBy)
  }
  const allLabels = [t('Plan'), t('Disk'), t('Bandwidth / month'), t(msgctxt('theme:v2', 'Disk IO read / write')), t('Memory'), t('Processes'), t('Feature list'), t('Accounts'), t('Actions')]
  const rows = (plans ?? []).map(plan => ({ hooks: { 'data-plan-row': plan.name, 'data-list-row': true }, cellsHtml: [
    // The owner sits under the plan name so the table fits its card without sideways scroll.
    `<div class="v2-plan-stack"><strong class="text-base font-medium text-mono" data-plan-name>${escapeHtml(plan.name)}</strong><small class="v2-muted text-2sm text-secondary-foreground">${escapeHtml(t('Owner'))} ${escapeHtml(plan.ownerId === null ? t('Root') : props.resellers?.find(owner => owner.id === plan.ownerId)?.username ?? t('Not read'))}</small><small class="v2-muted text-2sm text-secondary-foreground" data-plan-saved-by>${escapeHtml(t(msgid('Last saved by')))} ${savedBy(plan)}</small></div>`,
    limit(t, plan.resources.diskMb, 'MiB'), limit(t, plan.resources.bandwidthMbMonth, 'MiB'),
    `<div class="v2-plan-stack">${rate(t, plan.resources.ioReadBps)}${rate(t, plan.resources.ioWriteBps)}</div>`,
    limit(t, plan.resources.memoryMb, 'MiB'), limit(t, plan.resources.maxProcesses),
    escapeHtml(lists?.find(list => list.id === plan.featureListId)?.name ?? t('Not read')), accountCount(plan),
    planEditable(props, authority, plan) ? `<div class="v2-plan-actions flex items-center gap-1.5">${selected?.id === plan.id ? `<span class="v2-plan-editing kt-badge kt-badge-outline kt-badge-primary" aria-current="true">${escapeHtml(t(msgctxt('theme:v2', 'Editing above')))}</span>` : `<a class="v2-btn kt-btn kt-btn-outline" href="${escapeHtml(planHref(props, plan.id))}">${ki('ki-pencil')}${escapeHtml(t('Edit'))}</a>`}${button(t('Delete'), { 'data-plan-delete': plan.id }, { danger: true, small: true, glyph: 'ki-trash' })}</div>` : escapeHtml(t('Read only')),
  ].map((html, index) => index >= 2 && index <= 7 ? phoneCell(allLabels[index]!, html) : html) }))
  const picker = `<ul class="v2-plan-picker">${(plans ?? []).map(plan => `<li><a class="${selected?.id === plan.id ? PICKED : PICK}" href="${escapeHtml(planHref(props, plan.id))}"${selected?.id === plan.id ? ' aria-current="page"' : ''}><span class="flex items-center gap-2 min-w-0"><span class="flex items-center justify-center shrink-0 size-9 rounded-full border border-input bg-accent/60 text-secondary-foreground" aria-hidden="true">${ki('ki-cube-2', 'text-base')}</span><span class="flex flex-col gap-0.5 min-w-0"><strong class="text-base font-medium text-mono break-words">${escapeHtml(plan.name)}</strong><span class="text-2sm text-secondary-foreground">${accountCount(plan)} ${escapeHtml(t('Accounts'))}</span></span></span>${selected?.id === plan.id ? RADIO_ON : RADIO_OFF}</a></li>`).join('') || `<li class="text-base text-secondary-foreground" role="status">${escapeHtml(t(plans === undefined ? msgid('Plans have not been read.') : msgctxt('theme:v2', 'No plans are available in this authorized snapshot.')))}</li>`}</ul>`
  const add = `<a class="v2-btn kt-btn kt-btn-outline" href="/whm/plans/features">${ki('ki-setting-4')}${escapeHtml(t('Feature lists'))}</a>` + (readable && planEditable(props, authority) ? `<a class="v2-btn v2-btn--primary kt-btn kt-btn-primary" href="${escapeHtml(planHref(props))}">${ki('ki-plus')}${escapeHtml(t('Create plan'))}</a>` : button(t('Create plan'), undefined, { disabled: true, primary: true, small: true, glyph: 'ki-plus' }))
  const editorProps = { ...props, featureLists: lists ?? [] }
  const editor = requestedUnavailable ? `<p role="alert">${escapeHtml(t('The requested plan is unavailable.'))}</p>` : renderV2PlanEditor(t, editorProps, authority, selected, planReadable(props, authority, route) && planEditable(props, authority, selected))
  const impactRows = (plans ?? []).map(plan => ({ cellsHtml: [escapeHtml(plan.name), accountCount(plan), escapeHtml(t('Not read'))] }))
  // With a plan open, the rail lists that plan's accounts only: the ones a save would reach.
  const assignedRows = observedAccounts?.filter(account => selected ? account.planId === selected.id : plans?.some(plan => plan.id === account.planId)).map(account => ({ cellsHtml: [escapeHtml(plans!.find(plan => plan.id === account.planId)!.name), `<div class="v2-plan-stack">${technical(account.username)}<small class="v2-muted text-2sm text-secondary-foreground">${technical(account.primaryDomain)}</small></div>`] })) ?? []
  const impact = group('impact', t(msgctxt('theme:v2', 'Impact of changes')), table(t, 'impact', t('Plan impact'), [t('Plan'), t('Assigned accounts in the authorized snapshot'), t('Observed cap compliance')], impactRows, t(msgctxt('theme:v2', 'Plan assignments have not been read.')))
    + `<p>${escapeHtml(t(msgctxt('theme:v2', 'Assignments are desired state. Current usage and over-cap accounts have not been observed.')))}</p>`
    + table(t, 'assigned', t('Assigned accounts'), [t('Plan'), t('Account')], assignedRows, t(observedAccounts === undefined ? msgid('Account assignments have not been read.') : msgid('No assigned accounts were returned in this snapshot.'))))
  const unsaved = group('unsaved', t('Unsaved changes'), `<p class="text-base text-secondary-foreground" role="status">${escapeHtml(t(msgctxt('theme:v2', 'Review current values in the plan editor. A saved plan is not a comparison with its browser draft.')))}</p>${facts([{ label: t('Saved'), valueHtml: escapeHtml(selected?.name ?? t('Not read')) }, { label: t(msgid('Last saved by')), valueHtml: savedBy(selected) }, { label: t('Draft'), valueHtml: escapeHtml(t('Not read')) }])}`)
  const applying = group('applying', t('How saving applies'),
    `<p>${escapeHtml(t('Saving records desired plan state and an audit event. Changes to host resource limits require the reconciler and host evidence; a stored plan alone does not establish that slices were updated.'))}</p>`
    + `<p>${escapeHtml(t('Caps govern later create requests. Lowering a cap must not remove existing files, sites, mailboxes or databases. A saved limit is separate from measured consumption.'))}</p>`)
  // A Metronic modal inside the native dialog: the form is the modal content, with its header, body and footer.
  const dialog = `<dialog class="v2-plan-dialog" data-plan-delete-dialog aria-labelledby="plan-delete-title"><form method="dialog" class="kt-modal-content"><div class="kt-modal-header"><h2 class="kt-modal-title" id="plan-delete-title">${escapeHtml(t('Delete plan'))}</h2></div><div class="kt-modal-body flex flex-col gap-2"><div class="flex items-center gap-3.5"><span class="flex items-center justify-center shrink-0 size-11 rounded-full bg-destructive/10 text-destructive" aria-hidden="true">${ki('ki-trash', 'text-xl')}</span><p class="text-base text-foreground">${escapeHtml(t('Deleting a plan cannot be undone.'))}</p></div><p class="text-base" data-dialog-status role="status" hidden></p></div><div class="v2-plan-actions kt-modal-footer justify-end">${button(t('Cancel'), { 'data-dialog-cancel': true })}<button type="submit" class="v2-btn v2-btn--danger kt-btn kt-btn-destructive">${ki('ki-trash')}${escapeHtml(t('Delete'))}</button></div></form></dialog>`
  const allPlans = group('all', t(msgctxt('theme:v2', 'All plans')), `<div class="v2-plan-filter" data-list-filter>${plans?.length ? filterBar({ search: { id: 'v2-plan-search', label: t('Search'), hooks: { 'data-list-filter-search': true } } }) : ''}${table(t, 'all', t(msgctxt('theme:v2', 'All plans')), allLabels, rows, t(plans === undefined ? msgid('Plans have not been read.') : msgid('No plans are available in this authorized snapshot.')))}<p class="v2-muted text-base text-secondary-foreground" data-list-filter-empty hidden>${escapeHtml(t('No loaded rows match these filters.'))}</p></div>`)
  const title = page(t, route, t('Plans'), t('A plan sets each account’s resource limits. Choose Unlimited to remove a limit.'), `<div id="whm-plans" data-section="plans-feature-lists" class="v2-plan-stack">${group('picker', t('Plans'), picker, add)}<div class="v2-plan-columns v2-plan-columns--editor"><div class="v2-plan-main">${group('editor', selected ? t(msgctxt('theme:v2', 'Edit plan: {name}'), { name: selected.name }) : t('Create plan'), (selected ? `<p class="v2-muted v2-plan-owner text-base text-secondary-foreground">${escapeHtml(t('Owner'))} ${escapeHtml(selected.ownerId === null ? t('Root') : props.resellers?.find(owner => owner.id === selected.ownerId)?.username ?? t('Not read'))} · ${accountCount(selected)} ${escapeHtml(t('Accounts'))} · ${escapeHtml(t(msgid('Last saved by')))} ${savedBy(selected)}</p>` : '') + editor)}</div><aside class="v2-plan-aside">${unsaved}${impact}${applying}</aside></div>${allPlans}${dialog}</div>`, planReadable(props, authority, route))
  return title
}
