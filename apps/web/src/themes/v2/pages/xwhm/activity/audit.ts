import { auditActionLabel, auditActorLabel, auditOutcomeLabel, auditTargetLabel } from '../../../../../audit-labels.ts'
import { formatDisplayDateTime } from '../../../../../display-format.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { emptyState, pageHeader, statusPill } from '../../../components/index.ts'
import type { Tone } from '../../../html.ts'
import { icon, type IconName } from '../../../icons.ts'
import { columnLabels, context, esc, field, fields, inputControl, table, technical, type WhmObservationInput } from '../monitoring/common.ts'
import { activityActions, activityButton, activityFacts, activityLink, activityPanel } from './style.ts'

const OUTCOME_TONES: Readonly<Record<string, Tone>> = { ok: 'ok', denied: 'warn', failed: 'bad' }
/** The icon of a recorded outcome and its color, as in the Metronic security log and activity timeline. */
const OUTCOME_ICONS: Readonly<Record<Tone, IconName>> = { ok: 'okCircle', warn: 'shield', bad: 'xCircle', info: 'info', neutral: 'info' }
const OUTCOME_COLORS: Readonly<Record<Tone, string>> = { ok: 'text-green-500', warn: 'text-yellow-500', bad: 'text-destructive', info: 'text-primary', neutral: 'text-muted-foreground' }

export function renderV2WhmAudit(input: WhmObservationInput): string {
  const { t, locale, canRead } = context(input)
  const supplied = canRead && input.auditEntries !== undefined
  const entries = canRead ? input.auditEntries ?? [] : []
  const filter = canRead ? input.auditList : undefined
  const scheme = input.theme ?? 'light', density = input.density ?? 'comfortable'
  const href = (before?: string): string => {
    const values = new URLSearchParams({ lang: locale, theme: scheme, density })
    for (const key of ['actor', 'action', 'target', 'outcome', 'from', 'to'] as const) if (filter?.[key]) values.set(key, filter[key]!)
    if (before) values.set('before', before)
    return `/whm/audit?${values}`
  }
  const filterField = (key: 'actor' | 'action' | 'target' | 'from' | 'to', label: string): string => {
    const date = key === 'from' || key === 'to'
    const value = filter?.[key] ?? ''
    return field(t, `v2-audit-${key}`, label, inputControl(`v2-audit-${key}`, {}, canRead, ` name="${key}" dir="ltr"${date ? ' step="0.001"' : ' autocomplete="off" maxlength="256"'} value="${esc(date ? value.replace(/Z$/, '') : value)}"`, date ? 'datetime-local' : 'text'))
  }
  const outcomes = [['', msgid('All outcomes')], ['ok', msgid('Success')], ['denied', msgid('Denied')], ['failed', msgid('Failed')]] as const
  const outcomeField = field(t, 'v2-audit-outcome', msgid('Outcome'), `<span class="v2-select"><select class="kt-select" id="v2-audit-outcome" name="outcome"${canRead ? '' : ' disabled'}>${outcomes.map(([value, label]) => `<option value="${value}"${filter?.outcome === value ? ' selected' : ''}>${esc(t(label))}</option>`).join('')}</select></span>`)
  const tag = canRead ? 'form' : 'div'
  // The filters are the toolbar strip of the entries card, above its table.
  const filters = `<${tag} class="v2-observation__groups"${canRead ? ' method="get" action="/whm/audit"' : ''} data-audit-filters><input type="hidden" name="lang" value="${locale}"><input type="hidden" name="theme" value="${scheme}"><input type="hidden" name="density" value="${density}">${fields(filterField('actor', msgid('Actor')) + filterField('action', msgid('Action')) + filterField('target', msgid('Target')) + outcomeField + filterField('from', msgid('From (UTC)')) + filterField('to', msgid('To (UTC)')))}${activityActions(activityLink(t, msgctxt('xwhm', 'Clear filters'), `/whm/audit?${new URLSearchParams({ lang: locale, theme: scheme, density })}`, { 'data-audit-clear': true }, { kind: 'ghost' }) + activityButton(t, msgid('Apply filters'), {}, { kind: 'primary', icon: 'filter', enabled: canRead, type: canRead ? 'submit' : 'button' }), true)}</${tag}>`
  const tone = (index: number): Tone => OUTCOME_TONES[entries[index]!.outcome] ?? 'neutral'
  const pill = (index: number, label: string): string => statusPill({ tone: tone(index), label })
  const seqText = (entry: typeof entries[number]): string => {
    if (typeof entry.seq === 'number' && Number.isSafeInteger(entry.seq) && entry.seq > 0) return `#${entry.seq}`
    return /^[1-9]\d*$/.test(entry.id) ? `#${entry.id}` : '—'
  }
  const ipCell = (ip: string | null | undefined): string => ip ? technical(ip) : '—'
  const publicRows = entries.map(entry => ({ seq: seqText(entry), at: entry.at, actor: auditActorLabel(entry.actor), ip: entry.ip ?? '', action: auditActionLabel(entry.action, locale, entry), target: auditTargetLabel(entry.target, locale), outcome: auditOutcomeLabel(entry.action, entry.outcome, locale), entryHash: entry.entryHash ?? '' }))
  // The action leads its row with the icon of its outcome, as the event of the Metronic security log.
  const rowHtml = publicRows.map((row, index) => `<tr data-audit-id="${esc(entries[index]!.id)}"><td data-audit-seq>${row.seq === '—' ? '—' : technical(row.seq)}</td><td><time datetime="${esc(row.at)}">${technical(formatDisplayDateTime(row.at))}</time></td><td>${technical(row.actor)}</td><td data-audit-ip>${ipCell(entries[index]!.ip)}</td><td><span class="text-base font-medium text-mono">${esc(row.action)}</span></td><td>${technical(row.target)}</td><td>${pill(index, row.outcome)}</td></tr>`).join('')
  const columns = [msgid('Seq'), msgid('Time (UTC)'), msgid('Actor'), msgid('IP address'), msgid('Action'), msgid('Target'), msgid('Outcome')]
  const list = `<div class="v2-observation__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(t(msgid('Audit log')))}"><table class="v2-audit__entries kt-table"${columnLabels(t, columns)}><caption class="v2-sr">${esc(t(msgid('Entries')))}</caption><thead><tr>${columns.map(label => `<th scope="col">${esc(t(label))}</th>`).join('')}</tr></thead><tbody>${rowHtml || `<tr><td colspan="7">${emptyState({ icon: supplied ? 'search' : 'shield', title: t(supplied ? msgid('No audit entries yet') : msgid('Not read')), ...(supplied ? { text: t(msgid('No entries match the current page.')) } : {}) })}</td></tr>`}</tbody></table></div>`
  const csvCell = (value: string): string => `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`
  const csv = [['Seq', 'UTC', 'Actor', 'IP', 'Action', 'Target', 'Outcome'], ...publicRows.map(row => [row.seq, row.at, row.actor, row.ip || '—', row.action, row.target, row.outcome])].map(row => row.map(csvCell).join(',')).join('\r\n')
  const download = (label: string, type: string, body: string, extension: string) => `<a class="v2-btn kt-btn kt-btn-outline" download="xpanel-audit-page.${extension}" href="data:${type};charset=utf-8,${esc(encodeURIComponent(body))}">${icon('download', 16)}${esc(t(label))}</a>`
  const exports = supplied ? `<div class="v2-observation__actions flex flex-wrap items-center gap-4" data-audit-export>${download(msgid('Export page CSV'), 'text/csv', '﻿' + csv, 'csv')}${download(msgid('Export page JSON'), 'application/json', JSON.stringify(publicRows, null, 2), 'json')}</div>` : ''
  const pager = filter?.before || (filter?.hasMore && filter.oldestId) ? `<nav class="v2-observation__actions flex flex-wrap items-center gap-4" data-audit-pager="true" aria-label="${esc(t(msgctxt('theme:v2', 'Audit pages')))}">${filter.before ? activityLink(t, msgid('Newest'), href(), {}, { small: true }) : ''}${filter.hasMore && filter.oldestId ? activityLink(t, msgid('Older'), href(filter.oldestId), {}, { small: true }) : ''}</nav>` : ''
  // Each recorded entry is one event of a timeline: the outcome icon on the rail, the action and when it happened,
  // and the recorded facts under it once opened.
  const details = publicRows.map((row, index) => `<details data-audit-entry-detail><summary><span class="flex size-9 shrink-0 items-center justify-center rounded-full border border-input bg-accent/60 ${OUTCOME_COLORS[tone(index)]}">${icon(OUTCOME_ICONS[tone(index)], 16)}</span><span class="flex min-w-0 grow flex-col gap-0.5"><span class="text-base font-medium text-mono">${esc(row.action)}</span><span class="text-[13px] leading-(--lh-cap) text-secondary-foreground">${technical(row.seq)} · ${technical(formatDisplayDateTime(row.at))}</span></span><i class="ki-filled ki-down text-sm text-muted-foreground" aria-hidden="true"></i></summary>${activityFacts([[t(msgid('Seq')), technical(row.seq)], [t(msgid('Actor')), technical(row.actor)], [t(msgid('IP address')), ipCell(entries[index]!.ip)], [t(msgid('Target')), technical(row.target)], [t(msgid('Outcome')), pill(index, row.outcome)], ...(row.entryHash ? [[t(msgid('SHA-256 hash')), `<span title="${esc(row.entryHash)}">${technical(row.entryHash.slice(0, 16))}</span>`] as const] : [])])}</details>`).join('')
  const chain = canRead ? input.auditChain : undefined
  // The state of the hash chain sits in the header of the entries it covers.
  const chainBanner = chain
    ? `<span class="inline-flex" data-audit-chain data-chain-status="${esc(chain.status)}">${statusPill({
        tone: chain.status === 'verified' ? 'ok' : chain.status === 'broken' ? 'bad' : 'warn',
        label: chain.status === 'verified'
          ? t(msgid('SHA-256 hash chain verified ({count} entries)'), { count: chain.entriesVerified })
          : chain.status === 'broken'
            ? t(msgid('Hash chain broken at #{seq}'), { seq: chain.brokenAtSeq ?? 0 })
            : t(msgid('Hash chain partially verified ({verified} / {total})'), { verified: chain.entriesVerified, total: chain.totalEntries }),
      })}</span>`
    : ''
  const generationColumns = [msgid('Generation'), msgid('Created (UTC)'), msgid('Summary'), msgid('Files'), msgid('Actor'), msgid('Duration'), msgid('File-set checksum'), msgid('Status')]
  const count = supplied ? `<p class="text-[13px] leading-(--lh-cap) text-secondary-foreground" data-audit-count>${esc(t(msgctxt('theme:v2', '{count, plural, one {# entry on this page} other {# entries on this page}}'), { count: entries.length }))}</p>` : ''
  const generationRows = canRead ? input.generations ?? [] : []
  const duration = (ms: number): string => ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
  const generations = `<div class="v2-observation__scroll kt-scrollable-x-auto"><table class="v2-audit__generations kt-table"${columnLabels(t, generationColumns)}><caption class="v2-sr">${esc(t(msgid('Config generations')))}</caption><thead><tr>${generationColumns.map(label => `<th scope="col">${esc(t(label))}</th>`).join('')}</tr></thead><tbody>${generationRows.map(row => `<tr><td class="text-base font-medium text-mono">${technical(row.generationId)}</td><td>${technical(formatDisplayDateTime(row.at))}</td><td>${esc(row.summary)}</td><td>${technical(row.filesCount)}</td><td>${technical(row.actor)}</td><td>${technical(duration(row.durationMs))}</td><td><span title="${esc(row.stateChecksum)}">${technical(row.stateChecksum.slice(0, 12))}</span></td><td>${statusPill({ tone: row.status === 'active' ? 'ok' : row.status === 'failed' ? 'bad' : row.status === 'rolled-back' ? 'warn' : 'neutral', hollow: row.status !== 'active' && row.status !== 'rolled-back' && row.status !== 'failed', label: t(row.status === 'active' ? msgid('Active') : row.status === 'failed' ? msgid('Failed') : row.status === 'rolled-back' ? msgid('Rolled back') : msgctxt('theme:v2', 'Superseded')) })}</td></tr>`).join('') || `<tr><td colspan="8">${esc(t(msgid('Not read')))}</td></tr>`}</tbody></table></div>`
  // The page exports sit in the header, as on the approved board; the shared page() helper has no action slot.
  const header = pageHeader(t, { route: '/whm/audit', title: t(msgid('Audit log')), description: t(msgctxt('theme:v2', 'Authorized audit entries and configuration generations, with bounded page exports.')), breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: t(msgid('Audit log')) }], ...(exports ? { actionsHtml: exports } : {}) })
  // The entries card: the filters, the table and, last, the count and the pager, each group 24px apart inside the card padding.
  const footer = count || pager ? `<div class="flex flex-wrap items-center justify-between gap-4">${count}${pager}</div>` : ''
  return `<section class="v2-observation flex flex-col gap-8" data-whm-detail-route="/whm/audit" data-capability-state="${canRead ? 'authorized' : 'unavailable'}" lang="${esc(locale)}" dir="${localeDirection(locale)}">${header}${activityPanel(t, { id: 'audit-entries', title: msgid('Entries'), bodyHtml: filters + list + footer, ...(chainBanner ? { actionsHtml: chainBanner } : {}) })
    + activityPanel(t, { id: 'audit-record', title: msgid('Recorded entry'), bodyHtml: `<div class="v2-activity__timeline" data-audit-supplement>${details || `<p class="text-base text-secondary-foreground">${esc(t(msgid('No entries match the current page.')))}</p>`}</div>` })
    + activityPanel(t, { id: 'audit-changes', title: msgctxt('theme:v2', 'Changes (before / after)'), flush: true, bodyHtml: table(t, msgctxt('theme:v2', 'Changes (before / after)'), [msgid('Field'), msgid('Before'), msgid('After')], { 'data-v2-audit-safe-changes': true }, msgctxt('theme:v2', 'No reviewed before-and-after values were supplied. Raw audit details are not exposed.')) })
    + activityPanel(t, { id: 'audit-generations', title: msgid('Config generations'), flush: true, bodyHtml: generations, footerHtml: `<p class="v2-muted me-auto text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${esc(t(msgid('Exports and details contain this authorized page only. Older entries use the keyset page links.')))}</p>` })}</section>`
}
