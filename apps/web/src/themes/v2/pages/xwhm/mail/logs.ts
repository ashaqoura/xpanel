import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { formField } from '../../../components/form-field.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { button, caution, facts, formGroup, glyph, group, mailContext, note, page, status, table, tiles, TILE_VALUE, type WhmMailPageInput } from './common.ts'

export function renderV2WhmMailLog(input: WhmMailPageInput, mode: 'delivery' | 'monitor'): string {
  const { t, locale, dir, canRead } = mailContext(input)
  const delivery = mode === 'delivery', prefix = `whm-mail-${mode}`
  const range = formField({ id: `${prefix}-range`, label: t(msgid('Time range')), control: { kind: 'select', name: `${prefix}-range`, disabled: true,
    hooks: { 'data-mail-log-range': true }, options: [
      { value: '1', label: t(msgid('Last hour')) }, { value: '6', label: t(msgid('Last 6 hours')) },
      { value: '24', label: t(msgid('Last 24 hours')), selected: true }, { value: '72', label: t(msgid('Last 3 days')) },
      { value: '168', label: t(msgid('Last 7 days')) }, ...(delivery ? [{ value: 'custom', label: t(msgid('Custom UTC range')) }] : []),
    ],
  } })
  const text = (name: string, label: string, help?: string, custom = false): string => formField({ id: `${prefix}-${name}`, label,
    ...(help ? { help } : {}), control: { kind: 'input', type: 'text', name, dir: 'ltr', mono: true, autocomplete: 'off', spellcheck: false,
      maxlength: name === 'dsn' ? 9 : 254, disabled: true, ...(custom ? { hooks: { 'data-mail-log-custom': true }, placeholder: 'YYYY-MM-DD HH:MM' } : {}) },
  })
  const filters = delivery ? `${formField({ id: `${prefix}-status`, label: t(msgid('Status')), control: { kind: 'select', name: 'status', disabled: true,
    options: [['', msgid('Any status')], ['sent', msgid('Delivered')], ['deferred', msgid('Deferred')], ['bounced', msgid('Bounced')],
      ['expired', msgid('Expired')], ['rejected', msgid('Rejected')], ['queued', msgid('Queued')]].map(([value, label]) => ({ value: value!, label: t(label!) })),
  } })}${text('since', t(msgid('From (UTC)')), t(msgid('Format YYYY-MM-DD HH:MM, for the custom range only.')), true)}
${text('until', t(msgid('To (UTC)')), t(msgid('At most 7 days after the start.')), true)}${text('sender', t(msgid('Sender contains')))}${text('recipient', t(msgid('Recipient contains')))}
${text('domain', t(msgid('Domain')), t(msgid('Exact sender or recipient domain.')))}${text('dsn', t(msgid('DSN code')), t(msgid('A class such as 5 or 4.4 matches every code inside it.')))}` : ''
  const formTag = canRead ? 'form' : 'div'
  const submit = (iconHtml: string, label: string): string => `<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-mail-log-submit disabled>${iconHtml}${escapeHtml(label)}</button>`
  const integrity = `${note('', { 'data-mail-log-integrity': true }, true)}${caution(t(msgid('The bounded read reached its line or size limit, so this view may be incomplete. Narrow the time range.')), { 'data-mail-log-limit': true }, 'note')}`
  const observed = `${status(delivery ? t(msgid('Delivery events have not been read.')) : t(msgid('Mail flow has not been read.')), { 'data-mail-log-status': true })}
${facts(t, [['observed', msgid('Observed at (UTC)')], ['window', msgid('Window (UTC)')], [delivery ? 'matched' : 'messages', delivery ? msgid('Matching messages') : msgid('Messages')],
    ...(delivery ? [] : [['records', msgid('Journal records')]] as const)], 'data-mail-log-fact')}${integrity}`
  if (!delivery) {
    // The time range and its submit sit in the card toolbar; the read facts fill the card.
    const search = group('monitor-search', t(msgid('Mail flow')), observed,
      `<${formTag} class="flex flex-wrap items-center gap-2 [&_.kt-form-label]:sr-only [&>.kt-form-item]:w-44" data-mail-log-form>${range}${submit(icon('activity', 16), t(msgid('Read mail flow')))}</${formTag}>`)
    const counts = [
      ['sent', msgid('Delivered'), icon('okCircle', 18), 'ok'], ['deferred', msgid('Deferred'), icon('clock', 18), 'warn'], ['bounced', msgid('Bounced'), icon('xCircle', 18), 'bad'],
      ['rejected', msgid('Rejected'), glyph('shieldCross', 'lg'), 'bad'], ['expired', msgid('Expired'), glyph('timer', 'lg'), 'neutral'], ['queued', msgid('Still queued'), icon('inbox', 18), 'info'],
    ] as const
    const summary = group('monitor-summary', t(msgid('Messages by final status')), `${tiles(counts.map(([key, label, iconHtml, tone]) => ({ label: t(label), iconHtml, tone,
      valueHtml: `<dd class="${TILE_VALUE}" data-mail-monitor-count="${key}">${escapeHtml(t(msgid('Not read')))}</dd>` })))}${note(t(msgid('Counts are messages by their latest observed state inside the window; a deferred message may still be delivered later.')))}`)
    const ranking = [['senders', msgid('Top senders'), [msgid('Sender'), msgid('Messages')]], ['domains', msgid('Top recipient domains'), [msgid('Domain'), msgid('Recipients')]],
      ['deferrals', msgid('Deferral reasons'), [msgid('DSN'), msgid('Reason'), msgid('Attempts')]]] as const
    const [senders, domains, deferrals] = ranking.map(([key, label, headings]) => group(`monitor-${key}`, t(label), '', undefined,
      { tableHtml: table(t, t(label), headings.map(value => t(value)), { 'data-mail-monitor-table': key }, t(msgid('Not read')), true) }))
    return page(input, '/whm/email/monitor', t(msgid('Mail monitor')), t(msgid('Mail flow counts computed from the same parsed journal window. Read-only.')),
      `<div class="v2-whm-mail__stack" data-whm-mail-log="monitor" data-mail-log-can-read="${canRead}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mail-log')}${search}${summary}<div class="grid gap-8 lg:grid-cols-2 min-w-0">${senders}${domains}</div>${deferrals}</div>`)
  }
  // Filters card: a grid of labelled filters with the actions in the card footer.
  const search = formGroup('delivery-search', t(msgid('Search deliveries')), `<${formTag} class="v2-whm-mail__form" data-mail-log-form role="search">`, `</${formTag}>`,
    `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-start gap-6 min-w-0">${range}${filters}</div>`,
    `${button(t(msgctxt('whm-mail-log-workspace', 'Clear filters')), { 'data-mail-log-clear': true })}${submit(icon('filter', 16), t(msgctxt('whm-mail-log-workspace', 'Apply filters')))}`)
  const results = group('delivery-results', t(msgid('Messages')), `${observed}${note('', { 'data-mail-log-omitted': true }, true)}`, undefined, {
    tableHtml: table(t, t(msgid('Delivery messages, newest first')), [t(msgid('Last event (UTC)')), t(msgid('Queue ID')), t(msgid('Sender')), t(msgid('Recipients')), t(msgid('Status')), t(msgid('DSN')), t(msgid('Timeline'))], { 'data-mail-log-rows': true }, t(msgid('No delivery events have been read.')), true),
    footerHtml: `<span class="me-auto text-base text-secondary-foreground tabular-nums" data-mail-log-page-label></span><button type="button" class="v2-btn kt-btn kt-btn-outline" data-mail-log-page="newer" disabled>${icon('chevLeft', 14)}${escapeHtml(t(msgid('Newer')))}</button><button type="button" class="v2-btn kt-btn kt-btn-outline" data-mail-log-page="older" disabled>${escapeHtml(t(msgid('Older')))}${icon('chevRight', 14)}</button>`,
  })
  const heading = (label: string): string => `<h3 class="text-base font-semibold text-mono">${escapeHtml(label)}</h3>`
  const detail = group('delivery-selected', t(msgid('Selected message')), `<div class="flex flex-col gap-6 min-w-0" data-mail-log-detail tabindex="-1"><p class="flex flex-col items-center gap-2 py-6 text-center text-base text-secondary-foreground" data-mail-log-detail-empty><span class="flex items-center justify-center size-12 rounded-full border border-input bg-accent/60 text-muted-foreground">${glyph('message', 'xl')}</span><span>${escapeHtml(t(msgid('Choose a message to see its recipients and timeline.')))}</span></p>
<div class="flex flex-col gap-6 min-w-0" data-mail-log-detail-body hidden><dl class="v2-whm-mail__facts" data-mail-log-detail-facts></dl><div class="flex flex-col gap-2 min-w-0">${heading(t(msgid('Recipients')))}
${table(t, t(msgid('Recipients of the selected message')), [t(msgid('Recipient')), t(msgid('Status')), t(msgid('DSN')), t(msgid('Relay')), t(msgid('Attempts')), t(msgid('Response'))], { 'data-mail-log-detail-recipients': true }, t(msgid('Not read')))}</div>
<div class="flex flex-col gap-2 min-w-0">${heading(t(msgid('Timeline')))}<ol class="v2-whm-mail__timeline" data-mail-log-detail-events></ol></div></div></div>`)
  return page(input, '/whm/email/delivery', t(msgid('Delivery reports')), t(msgid('Postfix delivery events from the system journal, grouped by queue ID. Read-only.')),
    `<div class="v2-whm-mail__stack" data-whm-mail-log="delivery" data-mail-log-can-read="${canRead}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mail-log')}${search}${results}${detail}</div>`)
}
