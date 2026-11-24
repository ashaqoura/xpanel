import { formatDisplayDateTime } from '../../../../../display-format.ts'
import { statusPill } from '../../../components/index.ts'
import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { icon } from '../../../icons.ts'
import { columnLabels, context, esc, field, help, inputControl, page, select, status, table, technical, type WhmObservationInput } from '../monitoring/common.ts'
import { activityActions, activityButton, activityFactTable, activityPanel } from './style.ts'

export function renderV2WhmJobs(input: WhmObservationInput): string {
  const { t, canRead, canManage } = context(input)
  const tag = canRead ? 'form' : 'div'
  // The filters are one toolbar row: both fields, then the filter actions; the hint of the kind field runs under it.
  const filters = `<${tag} class="v2-observation__groups gap-2" data-whm-jobs-filters aria-label="${esc(t(msgid('Filter jobs')))}" novalidate><div class="flex flex-wrap items-end gap-x-5 gap-y-2.5"><div class="w-full sm:w-56">${field(t, 'v2-jobs-status', msgid('Status'), select(t, 'v2-jobs-status', { 'data-whm-jobs-status-filter': true }, [['', msgid('Any status')], ['queued', msgctxt('whm-jobs-workspace', 'Queued')], ['running', msgid('Running')], ['succeeded', msgid('Succeeded')], ['failed', msgctxt('whm-jobs-workspace', 'Failed')], ['cancelled', msgctxt('whm-jobs-workspace', 'Cancelled')]], canRead))}</div><div class="w-full sm:w-72">${field(t, 'v2-jobs-kind', msgid('Kind starts with'), inputControl('v2-jobs-kind', { 'data-whm-jobs-kind-filter': true }, canRead, ' name="kindPrefix" dir="ltr" maxlength="128" autocomplete="off" spellcheck="false" placeholder="system.packages"'))}</div>${activityActions(activityButton(t, msgid('Apply filters'), { 'data-whm-jobs-apply': true }, { kind: 'primary', icon: 'filter', enabled: canRead, type: canRead ? 'submit' : 'button' }) + activityButton(t, msgid('Clear'), { 'data-whm-jobs-clear': true }, { kind: 'ghost', enabled: canRead }))}</div><p class="v2-muted text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${esc(t(msgid('Lowercase letters, digits and . _ : - only, for example {example}.'), { example: '⁦system.packages⁩' }))}</p></${tag}>`
  const duration = (ms: number): string => ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
  const generationsSupplied = canRead && input.generations !== undefined
  const generationRows = canRead ? input.generations ?? [] : []
  const timelineColumns = [msgid('Generation'), msgid('Built'), msgid('Tested'), msgid('Activated'), msgid('Duration'), msgid('Status')]
  const renderStepCell = (row: typeof generationRows[number], stepName: 'built' | 'tested' | 'activated'): string => {
    const step = row.steps?.find(item => item.step === stepName)
    const fallbackAt = stepName === 'built' ? row.at : stepName === 'tested' ? row.testedAt ?? null : row.activatedAt ?? null
    const at = step?.at ?? fallbackAt
    const st = step?.status ?? (at ? 'done' : row.status === 'failed' ? 'failed' : 'pending')
    const label = st === 'done' ? t(msgid('Succeeded')) : st === 'failed' ? t(msgctxt('whm-jobs-workspace', 'Failed')) : st === 'skipped' ? t(msgid('Did not run')) : t(msgid('Pending'))
    const dur = typeof step?.durationMs === 'number' ? ` (${duration(step.durationMs)})` : ''
    return at
      ? `<span data-generation-step="${stepName}" data-step-status="${esc(st)}">${esc(label)} · ${technical(formatDisplayDateTime(at))}${dur ? technical(dur) : ''}</span>`
      : `<span data-generation-step="${stepName}" data-step-status="${esc(st)}">${esc(label)}</span>`
  }
  const timelineHtml = generationRows.map(row => `<tr data-generation-timeline-row="${row.generationId}"><td class="text-base font-medium text-mono">${technical(`#${row.generationId}`)}</td><td>${renderStepCell(row, 'built')}</td><td>${renderStepCell(row, 'tested')}</td><td>${renderStepCell(row, 'activated')}</td><td>${technical(duration(row.durationMs))}</td><td>${statusPill({ tone: row.status === 'active' ? 'ok' : row.status === 'failed' ? 'bad' : row.status === 'rolled-back' ? 'warn' : 'neutral', hollow: row.status !== 'active' && row.status !== 'rolled-back' && row.status !== 'failed', label: t(row.status === 'active' ? msgid('Active') : row.status === 'failed' ? msgid('Failed') : row.status === 'rolled-back' ? msgid('Rolled back') : msgctxt('theme:v2', 'Superseded')) })}</td></tr>`).join('')
  const generationTimeline = `<div class="v2-observation__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(t(msgid('Generation step timeline')))}"><table class="kt-table"${columnLabels(t, timelineColumns)}><caption class="v2-sr">${esc(t(msgid('Generation step timeline')))}</caption><thead><tr>${timelineColumns.map(label => `<th scope="col">${esc(t(label))}</th>`).join('')}</tr></thead><tbody data-whm-generation-timeline>${timelineHtml || `<tr><td class="text-secondary-foreground" colspan="6">${esc(t(generationsSupplied ? msgid('No generations have been recorded yet.') : msgid('Not read')))}</td></tr>`}</tbody></table></div>`
  const log = (title: string, statusHtml: string, logHtml: string): string => `<div class="v2-observation__groups gap-2"><h3 class="text-base font-semibold text-mono">${esc(t(title))}</h3>${statusHtml}${logHtml}</div>`
  const body = activityPanel(t, {
    id: 'jobs-history', title: msgid('Job history'), hooks: { 'data-whm-detail-section': 'jobs-history' },
    actionsHtml: activityButton(t, msgid('Refresh'), { 'data-whm-jobs-refresh': true }, { icon: 'refresh', small: true, enabled: canRead }),
    bodyHtml: filters + status(t, msgid('Job history has not been read. No job status or completion is assumed.'), { 'data-whm-jobs-status': true })
    + `<div class="v2-observation__groups" data-whm-jobs-loading aria-busy="true" aria-label="${esc(t(msgid('Loading jobs')))}" hidden><span class="v2-skeleton kt-skeleton"></span><span class="v2-skeleton kt-skeleton"></span></div>`
    + table(t, msgid('Jobs, newest first'), [msgid('Reference'), msgid('Kind'), msgid('Summary'), msgid('Status'), msgid('Progress'), msgid('Created (UTC)'), msgid('Started (UTC)'), msgid('Finished (UTC)'), msgctxt('whm-jobs-workspace', 'Actor')], { 'data-whm-jobs-rows': true }, msgid('No jobs have been read.'))
    + `<div class="v2-state v2-state--empty" data-whm-jobs-empty hidden><span class="v2-state__icon" aria-hidden="true">${icon('search', 22)}</span><h3 class="text-base font-medium text-mono">${esc(t(msgid('No jobs match these filters')))}</h3>${help(t, msgid('No host job was recorded for this status and kind. Clear a filter to see more.'))}</div>`,
    footerHtml: `<p class="v2-muted me-auto text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${esc(t(msgid('Newest first, up to 50 jobs. While a job is queued or running, the list refreshes every 5 seconds while this page is visible.')))}</p>`,
  })
    + activityPanel(t, {
      id: 'jobs-detail', title: msgid('Selected job'), hooks: { 'data-whm-jobs-detail': true, 'data-whm-detail-section': 'jobs-detail' }, elementId: 'whm-jobs-detail',
      bodyHtml: status(t, msgid('Select a job to read its steps, verification and log.'), { 'data-whm-jobs-detail-status': true }, 'none')
      + activityFactTable(t, [['reference', msgid('Reference')], ['kind', msgid('Kind')], ['summary', msgid('Summary')], ['status', msgid('Status')], ['progress', msgid('Progress')], ['actor', msgctxt('whm-jobs-workspace', 'Actor')], ['created', msgid('Created (UTC)')], ['started', msgid('Started (UTC)')], ['finished', msgid('Finished (UTC)')], ['cancellation', msgid('Cancellation')]], 'data-whm-jobs-field')
      + `<div class="v2-notice v2-notice--bad kt-alert kt-alert-light kt-alert-destructive" data-whm-jobs-outcome hidden>${icon('xCircle')}<div class="v2-notice__body kt-alert-content"><h3 class="kt-alert-title">${esc(t(msgid('Why it did not succeed')))}</h3><p class="kt-alert-description" data-whm-jobs-failure></p><p class="kt-alert-description" data-whm-jobs-error></p></div></div>`
      + table(t, msgid('Job steps'), [msgid('Order'), msgid('Step'), msgid('State'), msgid('Exit code')], { 'data-whm-jobs-steps': true }, msgctxt('whm-jobs-workspace', 'No job is selected.'))
      + log(msgid('Host verification'), `<p class="text-base text-foreground" data-whm-jobs-verification>${esc(t(msgid('Not read')))}</p>`, `<pre class="v2-observation__log rounded-lg text-[13px] leading-(--lh-cap)" role="region" dir="ltr" tabindex="0" data-whm-jobs-verification-detail aria-label="${esc(t(msgid('Verification detail')))}" hidden></pre>`)
      + log(msgid('Log'), `<p class="text-base text-foreground" data-whm-jobs-log-status>${esc(t(msgid('No log has been read.')))}</p>`, `<pre class="v2-observation__log rounded-lg text-[13px] leading-(--lh-cap)" role="region" dir="ltr" tabindex="0" data-whm-jobs-log aria-label="${esc(t(msgid('Job log')))}"></pre>`)
      + activityActions(activityButton(t, msgid('Load more log'), { 'data-whm-jobs-log-more': true }, { icon: 'download' }) + activityButton(t, msgid('Cancel job'), { 'data-whm-jobs-cancel': true }, { kind: 'danger', icon: 'xCircle' }))
      + `<p class="v2-muted text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${esc(t(msgid('Cancellation takes effect between steps. A running step is never interrupted, so a step that changes the host finishes or is reported with an unknown outcome.')))}</p>`
      + status(t, '', { 'data-whm-jobs-cancel-status': true }, 'unread', true),
    })
    + activityPanel(t, {
      id: 'jobs-generations', title: msgid('Generation step timeline'), hooks: { 'data-whm-detail-section': 'jobs-generations' }, flush: true,
      description: msgid('Each configuration generation records when its candidate file set was built, syntax-tested and activated on the host.'),
      bodyHtml: generationTimeline,
    })
  return page(input, '/whm/jobs', msgid('Jobs'), msgid('Background host jobs such as package updates and repairs, with each step, its exit code, the host verification and the recorded log.'), v2WhmClientTemplates('jobs') + body, { 'data-whm-jobs-workspace': true, 'data-jobs-can-read': String(canRead), 'data-jobs-can-manage': String(canManage) })
}
