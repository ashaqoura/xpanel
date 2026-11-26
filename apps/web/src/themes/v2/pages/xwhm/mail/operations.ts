import { renderV2ServerOps } from '../server/server-ops.ts'
import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { formField } from '../../../components/form-field.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { button, caution, columnLabels, facts, glyph, group, mailContext, note, page, SCROLL_CLASS, status, table, tiles, TILE_VALUE, type WhmMailPageInput } from './common.ts'
import { v2ListResetSection } from '../../xpanel/email-tools/list-admin.ts'

const listToolReady = (input: WhmMailPageInput, id: string): boolean => (input.catalog ?? []).some(tool => tool.id === id && tool.status === 'verified')

/** Card toolbar filters as in Metronic's table cards: controls without visible labels (each keeps its label for
 *  assistive technology), the search with a leading magnifier. */
const TOOLBAR = 'flex flex-wrap items-center gap-2 [&_.kt-form-label]:sr-only [&>.kt-form-item]:w-full sm:[&>.kt-form-item]:w-40'
const searchBox = (fieldHtml: string): string =>
  `<div class="relative w-full sm:w-60 [&_.kt-form-label]:sr-only [&_input]:px-8">${fieldHtml}<span class="absolute start-2.5 top-1/2 -translate-y-1/2 inline-flex text-muted-foreground pointer-events-none">${icon('search', 16)}</span></div>`
const heading = (label: string): string => `<h3 class="text-base font-semibold text-mono">${escapeHtml(label)}</h3>`
/** Explanatory points, each led by an information icon. */
const points = (items: readonly string[]): string =>
  `<ul class="flex flex-col gap-2 text-base text-secondary-foreground">${items.map(item => `<li class="flex items-start gap-2"><span class="inline-flex pt-0.5 text-muted-foreground">${icon('info', 16)}</span><span class="min-w-0">${item}</span></li>`).join('')}</ul>`

export function renderV2WhmMailQueue(input: WhmMailPageInput): string {
  const { t, locale, dir, canRead, canManage } = mailContext(input)
  const queues = [['incoming', msgid('Incoming'), icon('inbox', 18)], ['active', msgctxt('whm-mail-queue-workspace', 'Active'), icon('activity', 18)],
    ['deferred', msgctxt('whm-mail-queue-workspace', 'Deferred'), icon('clock', 18)], ['hold', msgid('Hold'), glyph('lock', 'lg')], ['maildrop', msgid('Maildrop'), icon('mail', 18)]] as const
  const count = (hook: string): string => `<dd class="${TILE_VALUE}"><bdi dir="ltr" ${hook}>${escapeHtml(t(msgid('Not read')))}</bdi></dd>`
  const summary = group('queue-summary', t(msgctxt('theme:v2', 'Queue summary')),
    `${status(t(msgid('The mail queue has not been read.')), { 'data-whm-mail-queue-status': true })}
${tiles([...queues.map(([key, label, iconHtml]) => ({ label: t(label), iconHtml, valueHtml: count(`data-whm-mail-queue-count="${key}"`) })),
      { label: t(msgid('Total size')), iconHtml: icon('disk', 18), valueHtml: count('data-whm-mail-queue-total-size') }])}
<p class="flex flex-wrap items-center gap-1.5 text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${icon('clock', 14)}<span>${escapeHtml(t(msgid('Observed at (UTC)')))}</span><bdi class="font-medium text-secondary-foreground tabular-nums" dir="ltr" data-whm-mail-queue-observed-at>${escapeHtml(t(msgid('Not read')))}</bdi></p>
${caution(t(msgid('Only the first messages of a larger queue were read. Counts and totals cover the shown messages only.')), { 'data-whm-mail-queue-truncated': true })}${note(t(msgid('Only envelope details are shown. Message content and headers are never read here.')))}`,
    button(t(msgid('Refresh')), { 'data-whm-mail-queue-refresh': true }, !canRead, 'default', icon('refresh', 16)))
  const filters = `<div class="${TOOLBAR}">${searchBox(formField({ id: 'v2-mail-queue-filter-text', label: t(msgid('Sender or recipient')), control: { kind: 'input', type: 'search', dir: 'ltr', mono: true, maxlength: 254,
    autocomplete: 'off', placeholder: t(msgid('Sender or recipient')), disabled: !canRead, hooks: { 'data-whm-mail-queue-filter': 'text' } } }))}${formField({ id: 'v2-mail-queue-filter-queue', label: t(msgid('Queue')), control: {
    kind: 'select', disabled: !canRead, hooks: { 'data-whm-mail-queue-filter': 'queue' }, options: [{ value: '', label: t(msgid('All queues')) }, ...queues.map(([value, label]) => ({ value, label: t(label) }))],
  } })}${formField({ id: 'v2-mail-queue-filter-age', label: t(msgid('Age')), control: {
    kind: 'select', disabled: !canRead, hooks: { 'data-whm-mail-queue-filter': 'age' }, options: [
      { value: '0', label: t(msgid('Any age')) }, { value: '3600', label: t(msgid('Older than 1 hour')) },
      { value: '86400', label: t(msgid('Older than 24 hours')) }, { value: '604800', label: t(msgid('Older than 7 days')) },
    ],
  } })}</div>`
  const actions = [['deliver', msgid('Retry now'), icon('refresh', 16)], ['hold', msgctxt('whm-mail-queue-workspace', 'Hold'), glyph('lock')],
    ['release', msgid('Release'), glyph('send')], ['delete', msgid('Delete'), glyph('trash')]] as const
  const headings = [t(msgid('Queue ID')), t(msgid('Queue')), t(msgid('Arrived (UTC)')), t(msgid('Age')), t(msgid('Size')), t(msgid('Sender')), t(msgid('Recipients')), t(msgid('Delay reason')), t(msgid('Actions'))]
  const messages = group('queue-messages', t(msgid('Messages')),
    `<div class="flex flex-wrap items-center gap-2" data-whm-mail-queue-bulk-bar><span class="me-2.5 text-base font-medium text-mono tabular-nums" data-whm-mail-queue-selected>${escapeHtml(t(msgid('Selected: 0')))}</span>${actions.map(([key, label, iconHtml]) => button(t(label), { 'data-whm-mail-queue-bulk': key }, true, key === 'delete' ? 'danger' : 'default', iconHtml)).join('')}</div>
<p class="text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${escapeHtml(t(msgid('Bulk actions run one message at a time, up to 50 messages, and report each result.')))}</p>
${status('', { 'data-whm-mail-queue-result': true }, true)}<ol class="v2-whm-mail__results" data-whm-mail-queue-results hidden></ol>`,
    filters, { tableHtml: `<div class="${SCROLL_CLASS.flush}" role="region" tabindex="0" aria-label="${escapeHtml(t(msgid('Queued messages')))}"><table class="v2-whm-mail__table kt-table"${columnLabels(headings, 1)}><caption class="v2-sr">${escapeHtml(t(msgid('Queued messages')))}</caption><thead><tr><th scope="col"><label class="v2-whm-mail__check-cell"><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-whm-mail-queue-select-all aria-label="${escapeHtml(t(msgid('Select all shown messages')))}" disabled></label></th>${headings.map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody data-whm-mail-queue-rows><tr><td colspan="10">${escapeHtml(t(msgid('No messages have been read.')))}</td></tr></tbody></table></div>` })
  return page(input, '/whm/email/queue', t(msgid('Mail queue')), t(msgid('Postfix queue envelopes, delay reasons and per-message actions. Message content is never shown.')),
    `<div class="v2-whm-mail__stack" data-whm-mail-queue-workspace data-mail-queue-can-read="${canRead}" data-mail-queue-can-manage="${canManage}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mail-queue')}${summary}${messages}</div>`)
}

export function renderV2WhmMailQuality(input: WhmMailPageInput): string {
  const { t, locale, dir, canRead, canManage } = mailContext(input)
  const summary = group('quality-summary', t(msgid('Sending identity')),
    `${status(t(msgid('Hosted mail domains have not been read.')), { 'data-whm-mail-quality-status': true })}${facts(t, [
      ['hostname', msgid('Server hostname')], ['helo', msgid('HELO name')], ['addresses', msgid('Sending addresses')], ['checked', msgid('Domains checked')],
      ['problems', msgid('Domains with problems')], ['unavailable', msgid('Domains with unavailable checks')], ['checked-at', msgid('Last check (UTC)')],
    ], 'data-whm-mail-quality-fact')}
${points([`${escapeHtml(t(msgid("Checks query live DNS through this server's resolver and change nothing. Fix problems in")))} <a class="kt-link" href="/whm/dns">${escapeHtml(t(msgid('DNS zones')))}</a> ${escapeHtml(t(msgid('or review')))} <a class="kt-link" href="/whm/email/server">${escapeHtml(t(msgid('Mail server')))}</a>`,
      escapeHtml(t(msgid('SPF is evaluated for the sending addresses. include: and redirect= are followed one level; ptr, exists and macros are reported as not decidable.'))),
      escapeHtml(t(msgid('DKIM is compared with the signing key on this server, or with the saved zone record when the key cannot be read. Reverse DNS is set by the provider of each IP address.')))])}`,
    button(t(msgid('Reload domains')), { 'data-whm-mail-quality-refresh': true }, !canRead, 'default', icon('refresh', 16)))
  const columns = [t(msgid('Domain')), t(msgid('Account')), 'MX', 'SPF', 'DKIM', 'DMARC', t(msgid('Reverse DNS')), t(msgid('Checked (UTC)'))]
  const domains = group('quality-domains', t(msgid('Hosted mail domains')),
    `${note(t(msgid('Up to 50 domains per check, 5 at a time, within a bounded time limit.')))}${status('', { 'data-whm-mail-quality-result': true }, true)}${caution(t(msgid('Only the first 2000 domains are listed.')), { 'data-whm-mail-quality-truncated': true })}`,
    `<span class="text-base font-medium text-mono tabular-nums" data-whm-mail-quality-selected>${escapeHtml(t(msgid('Selected: 0')))}</span>${button(t(msgid('Check selected')), { 'data-whm-mail-quality-check': true }, true, 'primary', glyph('shieldSearch'))}`,
    { tableHtml: `<div class="${SCROLL_CLASS.flush}" role="region" tabindex="0" aria-label="${escapeHtml(t(msgid('Hosted mail domains')))}"><table class="v2-whm-mail__table kt-table"${columnLabels(columns, 1)}><caption class="v2-sr">${escapeHtml(t(msgid('Hosted mail domains')))}</caption><thead><tr><th scope="col"><label class="v2-whm-mail__check-cell"><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-whm-mail-quality-select-all aria-label="${escapeHtml(t(msgid('Select the first 50 domains')))}" disabled></label></th>${columns.map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody data-whm-mail-quality-rows><tr><td colspan="9">${escapeHtml(t(msgid('No domains have been read.')))}</td></tr></tbody></table></div>` })
  return page(input, '/whm/email/quality', t(msgid('Mail quality')), t(msgid('Live DNS checks of MX, SPF, DKIM, DMARC and reverse DNS for each hosted mail domain. Read-only.')),
    `<div class="v2-whm-mail__stack" data-whm-mail-quality-workspace data-mail-quality-can-read="${canRead}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mail-quality')}${summary}${domains}${renderV2ServerOps(t, ['mail-auth'], canManage)}</div>`)
}

export function renderV2WhmMailboxMaintenance(input: WhmMailPageInput): string {
  const { t, locale, dir, canRead, canManage } = mailContext(input)
  const mailboxes = group('maintenance-mailboxes', t(msgid('Mailboxes')),
    `${status(canRead ? t(msgid('Nothing has been read yet.')) : t(msgid('Mailbox maintenance requires an authorized root administrator. Nothing was read or changed.')), { 'data-whm-mailbox-maintenance-status': true })}
${facts(t, [['count', msgid('Saved mailboxes')], ['fts', msgid('Full text search')], ['jobs', msgid('Host jobs')], ['observed-at', msgid('Observed at (UTC)')]], 'data-whm-mailbox-maintenance-fact')}
${note(t(msgid('Only saved email accounts are listed. Select up to 32 mailboxes for one maintenance job, or inspect one to read its usage.')))}
${caution(t(msgid('Only the first 200 matching mailboxes are shown. Refine the search to see others.')), { 'data-whm-mailbox-maintenance-limited': true })}
${caution(t(msgid('Only the first 2000 saved mailboxes were read.')), { 'data-whm-mailbox-maintenance-truncated': true })}`,
    `<div class="flex flex-wrap items-center gap-2">${searchBox(formField({ id: 'v2-mail-maintenance-search', label: t(msgid('Search mailboxes')), control: { kind: 'input', type: 'search', dir: 'ltr', mono: true,
      maxlength: 254, autocomplete: 'off', placeholder: t(msgid('Search mailboxes')), disabled: !canRead, hooks: { 'data-whm-mailbox-maintenance-search': true } } }))}${button(t(msgid('Refresh')), { 'data-whm-mailbox-maintenance-refresh': true }, !canRead, 'default', icon('refresh', 16))}</div>`,
    { tableHtml: table(t, t(msgid('Saved mailboxes')), [t(msgid('Select')), t(msgctxt('whm-mailbox-maintenance-workspace', 'Mailbox')), t(msgid('Account')), t(msgid('Saved quota')), t(msgid('Usage'))], { 'data-whm-mailbox-maintenance-rows': 'mailboxes' }, t(msgid('No mailboxes have been read.')), true) })
  const usage = group('maintenance-usage', t(msgid('Mailbox usage')),
    `${status(t(msgid('Inspect a mailbox to read its quota and folder usage.')), { 'data-whm-mailbox-maintenance-usage-status': true })}
${facts(t, [['mailbox', msgctxt('whm-mailbox-maintenance-workspace', 'Mailbox')], ['account', msgid('Account')], ['saved-quota', msgid('Saved quota')],
      ['storage', msgid('Storage used')], ['messages', msgid('Messages')], ['size', msgid('Folder size total')]], 'data-whm-mailbox-maintenance-fact')}
${note(t(msgid('Quota comes from doveadm quota get; folder counts and virtual sizes come from doveadm mailbox status. Message content is never read.')))}
<div class="flex flex-col gap-2 min-w-0">${heading(t(msgid('Quota')))}${table(t, t(msgid('Quota')), [t(msgid('Quota root')), t(msgid('Resource')), t(msgid('Used')), t(msgid('Limit')), t(msgid('Percent'))], { 'data-whm-mailbox-maintenance-rows': 'quota' }, t(msgid('No quota has been read.')))}</div>
<div class="flex flex-col gap-2 min-w-0">${heading(t(msgid('Folders')))}${caution(t(msgid('Only the first 200 folders are listed. Totals include every folder.')), { 'data-whm-mailbox-maintenance-folders-truncated': true })}
${table(t, t(msgid('Folders')), [t(msgid('Folder')), t(msgid('Messages')), t(msgid('Size'))], { 'data-whm-mailbox-maintenance-rows': 'folders' }, t(msgid('No folders have been read.')))}</div>`)
  const actions = group('maintenance-actions', t(msgctxt('whm-mailbox-maintenance-workspace', 'Maintenance')),
    `${points([escapeHtml(t(msgid('Recalculate quota counts the stored messages again with doveadm quota recalc and replaces the recorded usage.'))),
      escapeHtml(t(msgid('Rebuild indexes runs doveadm force-resync on every folder to fix broken mailbox indexes. Mail clients may resynchronize afterwards.'))),
      escapeHtml(t(msgid('Update search index runs doveadm index on INBOX and is available only when Dovecot full text search is configured.')))])}
${caution(t(msgid('Full text search is not configured in Dovecot, so the search index cannot be updated.')), { 'data-whm-mailbox-maintenance-fts-note': true })}
${note(t(msgid('Each job runs one step per mailbox on the host and then reads every mailbox again to confirm the result.')))}
${status('', { 'data-whm-mailbox-maintenance-result': true }, true)}`, undefined,
    { footerHtml: `<p class="me-auto text-base font-medium text-mono tabular-nums" data-whm-mailbox-maintenance-selected role="status">${escapeHtml(t(msgid('Selected mailboxes: 0')))}</p>
<a class="v2-btn kt-btn kt-btn-outline" href="/whm/jobs?lang=${locale}" data-whm-mailbox-maintenance-job-link hidden>${icon('external', 16)}${escapeHtml(t(msgid('Open job')))}</a>${button(t(msgid('Rebuild indexes')), { 'data-whm-mailbox-maintenance-run': 'resync' }, true, 'default', glyph('loop'))}${button(t(msgid('Update search index')), { 'data-whm-mailbox-maintenance-run': 'index' }, true, 'default', glyph('searchList'))}${button(t(msgid('Recalculate quota')), { 'data-whm-mailbox-maintenance-run': 'quota-recalc' }, true, 'primary', glyph('calculator'))}` })
  return page(input, '/whm/email/maintenance', t(msgid('Mailbox maintenance')), t(msgid('Per-mailbox quota and folder usage from Dovecot, with quota recalculation, index rebuilds and search indexing that run as verified host jobs.')),
    `<div class="v2-whm-mail__stack" data-whm-mailbox-maintenance-workspace data-mailbox-maintenance-can-read="${canRead}" data-mailbox-maintenance-can-manage="${canManage}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mailbox-maintenance')}${mailboxes}${usage}${actions}</div>` + v2ListResetSection(t, { reset: canManage && listToolReady(input, 'mailing-list-password-reset'), restart: canManage && listToolReady(input, 'restart-mailing-lists') }))
}
