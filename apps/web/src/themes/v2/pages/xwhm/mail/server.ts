import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { formField } from '../../../components/form-field.ts'
import { notice } from '../../../components/notice.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { button, caution, facts, formGroup, glyph, group, mailContext, note, page, rows, status, switchRow, table, type WhmMailPageInput } from './common.ts'

export type MailServerPage = 'server' | 'routing' | 'outbound'
interface Setting { key: string; source?: 'postfix' | 'dovecot'; list?: boolean; options?: readonly string[]; floor?: boolean }
const TLS = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'] as const
const FLOORS = ['!SSLv2, !SSLv3', '!SSLv2, !SSLv3, !TLSv1', '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1', '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1, !TLSv1.2'] as const satisfies readonly [string, string, string, string]

/** Presentation groups; server validation remains authoritative for every setting. */
const SETTINGS: readonly { id: string; label: string; fields: readonly Setting[] }[] = [
  { id: 'identity', label: msgid('Identity and networks'), fields: [
    { key: 'myhostname' }, { key: 'mydomain' }, { key: 'myorigin' }, { key: 'smtpd_banner' }, { key: 'inet_interfaces', list: true },
    { key: 'inet_protocols', options: ['all', 'ipv4', 'ipv6', 'ipv4, ipv6'] }, { key: 'mynetworks', list: true }, { key: 'smtpd_helo_required', options: ['yes', 'no'] },
  ] },
  { id: 'smtpd-tls', label: msgid('Incoming SMTP TLS'), fields: [
    { key: 'smtpd_tls_protocols', floor: true }, { key: 'smtpd_tls_mandatory_protocols', floor: true },
    { key: 'smtpd_tls_ciphers', options: ['medium', 'high'] }, { key: 'smtpd_tls_mandatory_ciphers', options: ['medium', 'high'] },
    { key: 'smtpd_tls_exclude_ciphers', list: true }, { key: 'tls_preempt_cipherlist', options: ['yes', 'no'] },
  ] },
  { id: 'smtp-tls', label: msgid('Outgoing SMTP TLS'), fields: [
    { key: 'smtp_tls_security_level', options: ['none', 'may', 'encrypt'] }, { key: 'smtp_tls_protocols', floor: true },
    { key: 'smtp_tls_mandatory_protocols', floor: true }, { key: 'smtp_tls_ciphers', options: ['medium', 'high'] },
  ] },
  { id: 'dovecot', label: msgid('Dovecot (IMAP and POP3)'), fields: [
    { key: 'protocols', source: 'dovecot' }, { key: 'ssl_min_protocol', source: 'dovecot', options: TLS },
    { key: 'ssl_cipher_list', source: 'dovecot' }, { key: 'ssl_prefer_server_ciphers', source: 'dovecot', options: ['yes', 'no'] },
  ] },
]
const LIMITS: readonly Setting[] = ['message_size_limit', 'smtpd_client_connection_rate_limit', 'smtpd_client_connection_count_limit',
  'default_destination_recipient_limit', 'smtp_destination_concurrency_limit', 'default_process_limit']
  .map(key => ({ key })).concat({ key: 'smtpd_client_event_limit_exceptions', list: true } as Setting)

export function renderV2WhmMailServer(input: WhmMailPageInput, mode: MailServerPage = 'server'): string {
  const { t, locale, dir, canRead, canManage } = mailContext(input)
  const route = `/whm/email/${mode}`
  const title = mode === 'server' ? t(msgid('Mail server')) : mode === 'routing' ? t(msgid('Mail routing')) : t(msgid('Outbound mail routing'))
  const id = (key: string) => `v2-mail-server-${mode}-${key}`
  const compared = [t(msgid('Observed')), t(msgid('Rendered by xPanel')), t(msgid('State'))]
  const field = (setting: Setting) => {
    const options = setting.floor ? FLOORS : setting.options
    const hooks = { 'data-mail-setting': setting.key, 'data-mail-setting-source': setting.source ?? 'postfix', ...(setting.list ? { 'data-mail-setting-list': 'true' } : {}) }
    return formField({ id: id(setting.key), label: setting.key, control: options ? {
      kind: 'select', mono: true, dir: 'ltr', disabled: true, hooks,
      options: [{ value: '', label: t(msgid('Not managed (keep the host value)')) }, ...options.map((value, index) => ({ value,
        label: setting.floor ? t(msgid('{version} or later'), { version: TLS[index]! }) : value }))],
    } : { kind: 'input', type: 'text', mono: true, dir: 'ltr', autocomplete: 'off', spellcheck: false, disabled: true, hooks,
      placeholder: t(msgid('Not managed (keep the host value)')) } })
  }
  const settingsGroups = mode === 'routing' ? [] : mode === 'outbound'
    ? [{ id: 'limits', label: msgid('Rate and size limits'), fields: LIMITS }] : SETTINGS
  // One settings card per group, all inside the one form; the last card carries the preview and the save actions.
  const fields = settingsGroups.map(section => group(`${mode}-${section.id}`, t(section.label), rows(section.fields.map(field).join(''), 'wide'))).join('')
  const certificates = ['smtp', 'submission', 'imap'].map((key, index) => formField({ id: id(`certificate-${key}`),
    label: t([msgid('Incoming SMTP (port 25)'), msgid('Mail clients sending (ports 587 and 465)'), msgid('Mail clients reading (IMAP and POP3)')][index]!),
    control: { kind: 'select', disabled: true, hooks: { 'data-mail-certificate': key }, options: [{ value: '', label: t(msgid('Default certificate')) }] },
  })).join('')
  const extras = mode !== 'server' ? '' : group('server-rbl', t(msgid('DNS blocklists (RBL)')), rows(
    `${switchRow(id('rbl-managed'), t(msgid('Manage smtpd_client_restrictions with these blocklists')), { 'data-mail-rbl-managed': true })}
${formField({ id: id('rbl'), label: t(msgid('Blocklist zones')), help: t(msgid('One DNS zone per line, checked in order after trusted networks and signed-in senders.')),
      control: { kind: 'textarea', mono: true, dir: 'ltr', rows: 4, spellcheck: false, disabled: true, hooks: { 'data-mail-rbl': true } } })}`, 'wide'))
    + group('server-certificates', t(msgid('Certificates')), rows(certificates, 'wide'))
  const editor = !canManage ? '' : `<form class="v2-whm-mail__stack" data-whm-mail-settings novalidate>${notice(t, { tone: 'info', text: mode === 'routing'
    ? t(msgid('Choose a route for each domain in the table above. Local delivers here; backup MX accepts mail and relays it to the primary exchanger; remote sends mail to the MX of the domain.'))
    : t(msgid('An empty value is not managed and keeps the host value. Each change is previewed, checked with postfix check and doveconf -n, and restored automatically when a check fails.')),
    ...(mode === 'routing' ? {} : { extraHtml: `<p>${escapeHtml(t(msgid('Separate list entries with a comma and a space.')))}</p>` }) })}${fields}${extras}
${group(`${mode}-editor`, mode === 'routing' ? t(msgid('Change routing')) : t(msgid('Change settings')),
    `${status(t(msgid('The saved policy has not been read.')), { 'data-whm-mail-settings-status': true })}
<div class="flex flex-col gap-2 min-w-0" data-whm-mail-settings-preview hidden><h3 class="text-base font-semibold text-mono">${escapeHtml(t(msgid('Changes to apply')))}</h3>${table(t, t(msgid('Changes to apply')), [t(msgid('Where')), t(msgid('Setting')), t(msgid('Now')), t(msgid('After'))], { 'data-whm-mail-server-changes': true })}</div>`,
    undefined, { footerHtml: `${button(t(msgid('Preview changes')), { 'data-whm-mail-settings-preview-button': true }, true, 'default', glyph('eye'))}<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-whm-mail-settings-save disabled><i class="ki-filled ki-check" aria-hidden="true"></i>${escapeHtml(t(msgid('Save and apply')))}</button>` })}</form>`
  const sourceFacts = facts(t, [[ 'postfix', msgid('Postfix main.cf') ], ...(mode !== 'routing' ? [[ 'master', msgid('Postfix master.cf') ]] as const : []),
    ...(mode === 'server' ? [[ 'dovecot', msgid('Dovecot') ]] as const : []), ['desired', msgid('Rendered by xPanel')], ['observed-at', msgid('Observed at (UTC)')]], 'data-whm-mail-server-fact')
  const summary = group(`${mode}-sources`, t(msgid('Configuration sources')),
    `${status(t(msgid('The mail server configuration has not been read.')), { 'data-whm-mail-server-status': true })}${sourceFacts}
<p class="flex items-center gap-1.5 text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${glyph('lock')}<span>${escapeHtml(t(msgid('Passwords, keys and lookup table contents are never read.')))}</span></p>`,
    button(t(msgid('Refresh')), { 'data-whm-mail-server-refresh': true }, !canRead, 'default', icon('refresh', 16)),
    { footerHtml: `<a class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost" href="/whm/monitoring/repair">${icon('tools', 16)}${escapeHtml(t(msgid('Repair center')))}</a><a class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost" href="/whm/panel/data">${icon('clock', 16)}${escapeHtml(t(msgid('Configuration history')))}</a>` })
  const observed = group(`${mode}-observed`, mode === 'outbound' ? t(msgid('Rate and size limits')) : t(msgid('Postfix and Dovecot settings')),
    mode === 'outbound' ? `<p class="text-base text-secondary-foreground">${escapeHtml(t(msgid('The remote SMTP servers saved in Remote service IPs are also included in smtpd_client_event_limit_exceptions; they are changed only there.')))} <a href="/whm/server/ips">${escapeHtml(t(msgid('Remote service IPs')))}</a></p>` : '',
    undefined, { tableHtml: table(t, t(msgid('Settings')), [t(msgid('Source')), t(msgid('Setting')), ...compared], { 'data-whm-mail-server-settings': true }, undefined, true) })
  const services = mode === 'routing' ? '' : group(`${mode}-services`, mode === 'server' ? t(msgid('Listening services (master.cf)')) : t(msgid('Submission services')),
    note(t(msgid('Only reviewed -o overrides are shown; other overrides are counted.'))), undefined,
    { tableHtml: table(t, t(msgid('Services')), [t(msgid('Service')), t(msgid('Setting')), ...compared], { 'data-whm-mail-server-services': true }, undefined, true) })
  const domains = mode !== 'routing' ? '' : group('routing-domains', t(msgid('Hosted mail domains')),
    `${note(t(msgid('MX records come from the saved DNS zones on this server, not from live DNS lookups.')))}${caution(t(msgid('Only the first 2000 domains are listed.')), { 'data-whm-mail-server-truncated': true })}`, undefined,
    { tableHtml: table(t, t(msgid('Hosted mail domains')), [t(msgid('Domain')), t(msgid('Account')), t(msgid('Mailboxes')), t(msgid('Saved zone')), t(msgid('Saved MX')), t(msgid('Expectation')), ...(canManage ? [t(msgid('Routing'))] : [])], { 'data-whm-mail-server-domains': true }, undefined, true) })
  const workspace = `<div class="v2-whm-mail__stack" data-whm-mail-server-workspace data-mail-server-page="${mode}" data-mail-server-can-read="${canRead}" data-mail-server-can-manage="${canManage}" lang="${locale}" dir="${dir}">${v2WhmClientTemplates('mail-server')}${summary}${observed}${services}${domains}${editor}</div>`
  return page(input, route, title, t(msgctxt('theme:v2', 'Compare observed mail settings, review the saved policy, and apply only a verified change.')),
    `${mode === 'outbound' ? outboundPolicy(input) : ''}${workspace}`)
}

function outboundPolicy(input: WhmMailPageInput): string {
  // Root's saved mail IP configuration shows on a read-only page too, disabled.
  const facts = input.mailAuthority, readOnlyFacts = facts?.presentation === 'read-only' && facts.canReadFacts === true
  const { t, canRead, canManage } = mailContext(input), saved = canRead || readOnlyFacts ? input.mailIpConfig : undefined
  const editable = canManage && saved !== undefined
  const controls = [['defaultIpv4', msgid('Default outbound IPv4')], ['defaultIpv6', msgid('Default outbound IPv6')], ['defaultHelo', msgid('Default EHLO / HELO Hostname')]] as const
  return formGroup('outbound-policy', t(msgid('Postfix Outbound Mail IP & HELO Transport Map')),
    `<form class="v2-whm-mail__form" action="/api/mail/ips" method="post" data-mail-ip-config-form="true" data-mail-ip-editable="${editable}">`, '</form>',
    `${rows(`${formField({ id: 'mail-outbound-mode', label: t(msgid('Outbound mail routing')), control: {
      kind: 'select', name: 'mode', disabled: !editable, options: [...(!saved ? [{ value: '', label: t(msgid('Not read')), selected: true }] : []), ...[
        { value: 'server-default', label: t(msgid('Server Default IP')) }, { value: 'account-ip', label: t(msgid('Per-Account Dedicated IP')) },
        { value: 'domain-ip', label: t(msgid('Per-Domain Dedicated IP')) }, { value: 'custom-map', label: t(msgid('Explicit Per-Domain Custom Map')) },
      ].map(option => ({ ...option, selected: saved?.mode === option.value }))],
    } })}${controls.map(([key, label]) => formField({ id: `mail-${key}`, label: t(label), control: { kind: 'input', type: 'text', name: key,
      dir: 'ltr', mono: true, disabled: !editable, value: saved?.[key] ?? '', autocomplete: 'off', spellcheck: false } })).join('')}
<div class="v2-whm-mail__field kt-form-item"><span id="v2-mail-overrides-label" class="kt-form-label block">${escapeHtml(t(msgid('Per-Domain Outbound IPv4/IPv6 & HELO Overrides')))}</span><pre class="rounded-md border border-input bg-muted/50 p-3 text-sm leading-(--lh-label) whitespace-pre-wrap break-words tabular-nums" role="region" aria-labelledby="v2-mail-overrides-label"><bdi dir="ltr" data-mail-ip-overrides>${saved ? escapeHtml(saved.domainOverrides.map(row => [row.domainName, row.ipv4, row.ipv6, row.heloHostname].filter(Boolean).join(' · ')).join('\n') || t(msgid('No domain overrides are configured.'))) : escapeHtml(t(msgid('Not read')))}</bdi></pre></div>`)}
<p class="text-base text-secondary-foreground" data-mail-ip-status role="status" aria-live="polite" tabindex="-1" hidden></p><noscript><p class="text-base text-secondary-foreground">${escapeHtml(t(msgid('Saving mail settings requires JavaScript.')))}</p></noscript>`,
    `<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" disabled><i class="ki-filled ki-eye" aria-hidden="true"></i>${escapeHtml(t(msgctxt('common', 'Review changes')))}</button>`)
}
