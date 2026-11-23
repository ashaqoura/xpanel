import { v2AccountLifecycleTemplates } from './lifecycle-client-templates.ts'
import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { v2AccountAnnouncementNoticeTemplates } from '../../../components/account-announcement-notice-templates.ts'
import { languageName, localeDirection } from '../../../../../i18n.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'
import { actions, button, context, esc, facts, field, keenicon, page, row, rows, status, table, toolCard, type WhmAccountToolAuthority } from './common.ts'
import { v2WhmDiagnosticTemplates } from '../whm-diagnostic-client-templates.ts'
import { renderV2AccountRepair } from './repair.ts'
import { allowed, principalOf, qualified } from '../../../../../models/whm-account-access.ts'
import { renderV2EmailUsers, renderV2ForcePassword, renderV2Rearrange, renderV2Skeleton, renderV2WebTemplates } from '../accounts/admin.ts'

/** A toolbar search box as on the Metronic tables: the magnifier inside the input, named by a label for assistive technology. */
const search = (id: string, label: string, attrs: string): string => `<label class="v2-sr" for="${id}">${esc(label)}</label><span class="kt-input">${icon('search', 16)}<input id="${id}" type="search" dir="ltr" placeholder="${esc(label)}" autocomplete="off" ${attrs}></span>`
/** A toolbar select named for assistive technology only; its options name what it filters. */
const filter = (id: string, label: string, attrs: string, options: string): string => `<label class="v2-sr" for="${id}">${esc(label)}</label><select id="${id}" class="kt-select" ${attrs}>${options}</select>`
/** The explanation under a block: a hint, never a state. */
const hint = (text: string, attrs = ''): string => `<p class="v2-muted text-xs leading-5 font-normal"${attrs}>${esc(text)}</p>`
/** The empty state of a saved list, shown by its controller. */
const emptyState = (hook: string, glyph: string, title: string, textHtml: string): string => `<div class="v2-account-tool__empty" ${hook} hidden>${keenicon(glyph)}<h3>${esc(title)}</h3><p>${esc(textHtml)}</p></div>`

export function renderV2WhmAccountHealthPage(props: WhmSurfaceProps, authority: WhmAccountToolAuthority): string {
  const { t, readable } = context(props, authority)
  const title = t(msgid('Account health & repair'))
  const unread = t(msgid('Not read'))
  const summary = toolCard('health-summary', t(msgid('Health checks')), `<p>${esc(t(msgid('Checks compare each account with its saved plan, certificates, DNS zones and PHP settings, and read its system user, home directory and disk quota on this server. Checks never change anything. Each problem links to the page that fixes it.')))}</p>`
    + status(t(readable ? msgid('Checks have not been run.') : msgid('Account health requires an authorized root administrator or a reseller with the list-accounts privilege. Nothing was read or changed.')), { 'data-whm-health-status': true }, readable ? 'unread' : 'unavailable')
    + facts([
      { label: t(msgid('Accounts checked')), hooks: { 'data-whm-health-count-accounts': true } },
      { label: t(msgid('Accounts with problems')), hooks: { 'data-whm-health-count-affected': true } },
      { label: t(msgid('Problems found')), hooks: { 'data-whm-health-count-problems': true } },
      { label: t(msgid('Checks not verified')), hooks: { 'data-whm-health-count-unavailable': true } },
      { label: t(msgid('Last checked (UTC)')), hooks: { 'data-whm-health-observed-at': true } },
    ], unread) + hint(t(msgid('Not verified means the evidence could not be read. It is never counted as healthy.'))),
  undefined, button(t(msgid('Run checks')), { 'data-whm-health-run': true }, readable, true))
  const options = [
    ['all', msgctxt('whm-account-health-workspace', 'All accounts')], ['problem', msgid('With problems')],
    ['unavailable', msgid('Not fully verified')], ['ok', msgid('No problems found')],
  ] as const
  const off = readable ? '' : ' disabled'
  const accounts = toolCard('health-accounts', t(msgid('Accounts')), `<div class="v2-account-tool__filters" role="search" aria-label="${esc(t(msgid('Filter checked accounts')))}">${search('v2-whm-health-search', t(msgid('Account or domain')), `maxlength="253" spellcheck="false" data-whm-health-search${off}`)}${filter('v2-whm-health-filter', t(msgctxt('whm-account-health-workspace', 'Show')), `data-whm-health-filter${off}`, options.map(([value, label]) => `<option value="${value}">${esc(t(label))}</option>`).join(''))}</div>`
    + actions(`<label class="v2-account-tool__choice kt-label leading-5"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-whm-health-select-all${off}><span>${esc(t(msgid('Select all shown')))}</span></label>${button(t(msgid('Recheck selected')), { 'data-whm-health-recheck': true })}<span data-whm-health-selection role="status">${esc(t(msgid('No accounts selected.')))}</span>`)
    + `<div class="v2-account-tool__groups" data-whm-health-list aria-live="polite"><p class="text-sm font-normal text-muted-foreground" data-whm-health-empty>${esc(t(msgid('No accounts have been checked.')))}</p></div>`)
  const quotaRead = readable && (authority.root === true || allowed(props, 'list-accounts')), quotaEdit = quotaRead && qualified(props, 'quota-modification') && (authority.root === true || allowed(props, 'edit-account'))
  const qoff = quotaRead ? '' : ' disabled'
  const sort = (key: string, label: string, numeric = false): string => `<th scope="col" aria-sort="none"${numeric ? ' data-numeric' : ''}><button type="button" class="v2-whm-quotas__sort" data-quotas-sort="${key}"${qoff}>${esc(t(label))}${keenicon('arrow-up-down')}</button></th>`
  const owners = authority.root === true && props.resellers ? [['root', 'root'] as const, ...props.resellers.map(reseller => [reseller.id, reseller.username] as const)] : []
  const quotas = toolCard('disk-quotas', t(msgid('Quota modification')), `<p>${esc(t(msgid('The disk limit in force for each account: its package value or its own limit. A change is saved for that account only and applied to its filesystem quota by the host reconcile; changing the package replaces it.')))}</p>`
    + `<div class="v2-account-tool__filters">${search('v2-whm-quotas-search', t(msgid('Account or domain')), `maxlength="64" data-quotas-search${qoff}`)}${filter('v2-whm-quotas-owner', t(msgid('Owner')), `data-quotas-owner${qoff}`, `<option value="">${esc(t(msgid('All owners')))}</option>${owners.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('')}`)}</div>`
    + status(t(quotaRead ? msgid('Disk quotas have not been read.') : msgid('Disk quotas require root or a reseller with the list-accounts privilege.')), { 'data-quotas-status': true }, quotaRead ? 'unread' : 'unavailable')
    + `<p class="v2-muted" data-quotas-usage></p>`
    + `<div class="v2-account-tool__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(t(msgid('Disk quotas')))}"><table class="v2-whm-quotas__table kt-table text-start"><caption class="v2-sr">${esc(t(msgid('Disk quotas')))}</caption><thead><tr>${sort('username', msgid('Account'))}${sort('owner', msgid('Owner'))}${sort('used', msgid('Disk used'), true)}${sort('limit', msgid('Disk limit in force'), true)}<th scope="col">${esc(t(msgid('Change')))}</th></tr></thead><tbody data-quotas-rows data-xp-columns="5"><tr><td colspan="5">${esc(t(msgid('Disk quotas have not been read.')))}</td></tr></tbody></table></div>`,
    { 'data-whm-quotas': true, 'data-quotas-can-read': String(quotaRead), 'data-quotas-can-edit': String(quotaEdit) },
    button(t(msgid('Read disk quotas')), { 'data-quotas-refresh': true }, quotaRead),
    `<div class="flex items-center gap-2"><label class="font-medium" for="v2-whm-quotas-size">${esc(t(msgid('Rows per page')))}</label><select id="v2-whm-quotas-size" class="kt-select w-20" data-quotas-page-size${qoff}>${[10, 25, 50, 100].map(n => `<option value="${n}"${n === 25 ? ' selected' : ''}>${n}</option>`).join('')}</select></div>`
    + `<nav class="v2-account-tool__actions" aria-label="${esc(t(msgid('Disk quota pages')))}"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-quotas-previous disabled>${icon('chevLeft', 14)}${esc(t(msgid('Previous')))}</button><span data-quotas-page></span><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-quotas-next disabled>${esc(t(msgid('Next')))}${icon('chevRight', 14)}</button></nav>`)
  const demoManage = readable && (props.visibility?.principal ?? props.principal)?.kind === 'root'
  const demo = toolCard('demo-mode', t(msgid('Demo mode')), `<p>${esc(t(msgid('An account in demo mode works like a showcase: its users can sign in and look at everything, but every change through the panels, the API and the command line is refused. Mail, FTP and SSH keep their own access, so give a showcase account no mailboxes, FTP accounts or shell.')))}</p>`
    + table(t(msgid('Accounts in demo mode')), [t(msgid('Account')), t(msgid('Domain')), t(msgid('Status'))], { 'data-demo-mode-rows': true }, unread)
    + rows(row('v2-whm-demo-mode-account', t(msgid('Account')), `<select id="v2-whm-demo-mode-account" data-demo-mode-account disabled><option value="">${esc(t(msgid('Select an account')))}</option></select>`))
    + status(t(demoManage ? msgid('Nothing has been read yet.') : msgid('This page requires an authorized administrator. Nothing was read or changed.')), { 'data-demo-mode-status': true }, demoManage ? 'unread' : 'unavailable')
    + status('', { 'data-demo-mode-result': true }, 'unread', true)
    + actions(button(t(msgid('Turn off demo mode')), { 'data-demo-mode-disable': true }) + button(t(msgid('Turn on demo mode')), { 'data-demo-mode-enable': true }, false, true), true),
  { 'data-demo-mode-workspace': true, 'data-demo-mode-can-manage': String(demoManage) }, button(t(msgid('Refresh')), { 'data-demo-mode-refresh': true }))
  return page(props, '/whm/accounts/health', title, t(msgid('Read-only checks of each account against its saved plan and this server, with links to the pages that fix each problem.')), v2WhmDiagnosticTemplates() + summary + accounts + (authority.root === true ? renderV2AccountRepair(t, readable && qualified(props, 'account-repair')) : '') + quotas + demo
      + renderV2ForcePassword(t, qualified(props, 'force-password-change') && allowed(props, 'edit-account')) + (authority.root === true ? renderV2Rearrange(t, qualified(props, 'rearrange-account')) : ''),
    { 'data-whm-health-workspace': true, 'data-health-can-read': String(readable), 'data-capability-state': readable ? 'authorized' : 'unavailable', 'data-health-root': String(authority.root === true) })
}

export function renderV2WhmAccountBandwidthPage(props: WhmSurfaceProps, authority: WhmAccountToolAuthority): string {
  const { t, readable, editable } = context(props, authority)
  const root = editable && principalOf(props)?.kind === 'root'
  const canReset = root && qualified(props, 'reset-account-bandwidth-limit'), canRelieve = root && qualified(props, 'unsuspend-bandwidth-exceeders')
  const title = t(msgid('Bandwidth'))
  const body = toolCard('bandwidth', t(msgid('Bandwidth per account')), `<p>${esc(t(msgid('Traffic this month (UTC), counted from the saved site access logs, the Postfix delivery journal and the FTP transfer journal. Each source is sent plus received bytes.')))}</p><p>${esc(t(msgid('A plan with bandwidth enforcement on serves a bandwidth-exceeded page on its websites once the monthly limit is used, until the next month (UTC) or until the limit is raised. Mail, FTP and the panels keep working. Other plans are only compared.')))}</p>`
    + status(t(readable ? msgid('Bandwidth has not been read.') : msgid('Metering requires an authorized root administrator on a qualified host.')), { 'data-whm-metering-status': true }, readable ? 'unread' : 'unavailable')
    + facts([
      ['month', msgid('Month (UTC)')], ['since', msgid('Counted since (UTC)')], ['updated', msgid('Last counted (UTC)')],
      ['pending', msgid('Log data not yet counted')], ['web', msgid('Web logs')], ['mail', msgid('Mail journal')], ['ftp', msgid('FTP journal')],
    ].map(([key, label]) => ({ label: t(label!), hooks: { 'data-whm-metering-fact': key! } })), t(msgid('Not read')))
    + table(t(msgid('Bandwidth per account')), [msgid('Account'), msgid('Domain'), msgid('Status'), msgid('Web'), msgid('Mail'), 'FTP', msgid('Total'), msgid('Plan limit')].map(label => t(label)), { 'data-whm-metering-rows': 'bandwidth' }, t(msgid('No bandwidth has been read.'))),
  undefined, button(t(msgid('Read bandwidth')), { 'data-whm-metering-refresh': true }, readable))
  const relief = toolCard('bandwidth-relief', t(msgid('Unsuspend bandwidth exceeders')), `<p>${esc(t(msgid('Lifts the bandwidth-exceeded page of every account limited this month until 00:00 UTC. From the next UTC day each one is evaluated again and limited if it is still over its limit.')))}</p>`
    + status(canRelieve ? '' : t(msgid('Lifting limit pages requires root on a host that qualifies this tool.')), { 'data-whm-bandwidth-relief-status': true }, canRelieve ? 'unread' : 'unavailable', canRelieve)
    + actions(button(t(msgid('Unsuspend bandwidth exceeders')), { 'data-whm-bandwidth-relief': true }), true))
  const custom = toolCard('bandwidth-custom', t(msgid('Custom bandwidth limits')), `<p>${esc(t(msgid('Accounts whose monthly bandwidth limit differs from their package. Reset returns an account to its package limit; a custom limit is set in the account details.')))}</p>`
    + table(t(msgid('Custom bandwidth limits')), [msgid('Account'), msgid('Domain'), msgid('Plan'), msgid('Custom limit'), msgid('Package limit'), msgid('Actions')].map(label => t(label)), { 'data-whm-metering-rows': 'custom' }, t(canReset ? msgid('Custom limits have not been read.') : msgid('Resetting custom limits requires root on a host that qualifies this tool.')))
    + status('', { 'data-whm-bandwidth-custom-status': true }, 'unread', true))
  return page(props, '/whm/accounts/bandwidth', title, t(msgid('Monthly traffic per account: web from the saved site access logs, plus mail and FTP from their service logs.')), body + relief + custom,
    { 'data-whm-metering': 'bandwidth', 'data-metering-can-read': String(readable), 'data-bandwidth-can-reset': String(canReset), 'data-bandwidth-can-relieve': String(canRelieve), 'data-capability-state': readable ? 'authorized' : 'unavailable' })
}

export function renderV2WhmAccountAnnouncementsPage(props: WhmSurfaceProps, authority: WhmAccountToolAuthority): string {
  const { t, locale, editable } = context(props, authority)
  const off = editable ? '' : ' disabled'
  const title = t(msgid('Announcements'))
  const list = toolCard('announcements-list', t(msgid('Saved announcements')), status(t(msgid('Announcements have not been read. No announcement is assumed to be shown.')), { 'data-whm-announcements-status': true })
    + `<div data-whm-announcements-loading aria-busy="true" aria-label="${esc(t(msgid('Loading announcements')))}" hidden></div>`
    + table(t(msgid('Announcements, newest first')), [msgid('Title'), msgid('Severity'), msgid('Audience'), msgid('Shown (UTC)'), msgid('State'), msgid('Updated (UTC)'), msgid('Actions')].map(label => t(label)), { 'data-whm-announcements-rows': true }, t(msgid('Not read')))
    + emptyState('data-whm-announcements-empty', 'notification-status', t(msgid('No announcements yet')), t(msgid('Create one below. Account owners see no notice until then.')))
    + hint(t(msgid('Newest first. Up to 50 announcements can be active. Archived ones are kept as history, up to 100 records in all; past that, the oldest archived record is removed.')))
    + status('', { 'data-whm-announcements-list-status': true }, 'unread', true),
  undefined, button(t(msgid('Refresh')), { 'data-whm-announcements-refresh': true }, editable))
  const select = (key: string, options: readonly (readonly [string, string])[]): string => `<select id="v2-announcements-${key}" name="${key}" data-whm-announcements-input="${key}"${off}>${options.map(([value, label]) => `<option value="${esc(value)}">${esc(t(label))}</option>`).join('')}</select>`
  const content = (['en', 'ar'] as const).map(language => `<fieldset${off}><legend>${esc(languageName(language, locale))}</legend>`
    + field(`v2-announcements-title-${language}`, t(msgid('Title')), `<input id="v2-announcements-title-${language}" name="title-${language}" lang="${language}" dir="${localeDirection(language)}" type="text" maxlength="140" autocomplete="off" required aria-describedby="v2-announcements-text-help" data-whm-announcements-input="title-${language}"${off}>`)
    + field(`v2-announcements-body-${language}`, t(msgid('Message')), `<textarea id="v2-announcements-body-${language}" name="body-${language}" lang="${language}" dir="${localeDirection(language)}" rows="5" maxlength="2000" required aria-describedby="v2-announcements-text-help" data-whm-announcements-input="body-${language}"${off}></textarea>`) + '</fieldset>').join('')
  const choices = rows(row('v2-announcements-severity', t(msgid('Severity')), select('severity', [['info', msgid('Notice')], ['warning', msgid('Warning')], ['maintenance', msgid('Maintenance')]]))
    + row('v2-announcements-audience', t(msgid('Audience')), select('audience', [['all', msgid('All accounts')], ['plan', msgid('Accounts on a plan')], ['reseller', msgid("A reseller's accounts")], ['accounts', msgid('Listed accounts')]]))
    + row('v2-announcements-plan', t(msgid('Plan')), select('plan', [['', msgid('Not read')]]), undefined, { 'data-whm-announcements-audience-field': 'plan' }, true)
    + row('v2-announcements-reseller', t(msgid('Reseller')), select('reseller', [['', msgid('Not read')]]), undefined, { 'data-whm-announcements-audience-field': 'reseller' }, true)
    + row('v2-announcements-usernames', t(msgid('Accounts')), `<textarea id="v2-announcements-usernames" name="usernames" rows="3" dir="ltr" maxlength="1800" autocomplete="off" spellcheck="false" data-whm-announcements-input="usernames" aria-describedby="v2-announcements-usernames-help"${off}></textarea>`, t(msgid('Account usernames, one per line or comma-separated, up to 100. Each must exist.')), { 'data-whm-announcements-audience-field': 'accounts' }, true)
    + row('v2-announcements-starts', t(msgctxt('whm-announcements-workspace', 'Starts (UTC)')), `<input id="v2-announcements-starts" name="starts" type="datetime-local" dir="ltr" data-whm-announcements-input="starts" aria-describedby="v2-announcements-starts-help"${off}>`, t(msgid('Empty starts as soon as it is saved.')))
    + row('v2-announcements-ends', t(msgctxt('whm-announcements-workspace', 'Ends (UTC)')), `<input id="v2-announcements-ends" name="ends" type="datetime-local" dir="ltr" data-whm-announcements-input="ends" aria-describedby="v2-announcements-ends-help"${off}>`, t(msgid('Empty keeps it shown until you archive it.'))))
  const previews = (['en', 'ar'] as const).map(language => {
    const tr = v2Messages.translator(language)
    const labels = { info: tr(msgid('Notice')), warning: tr(msgid('Warning')), maintenance: tr(msgid('Maintenance')), until: tr(msgid('Until {end}')), dismiss: tr(msgid('Dismiss')), dismissFor: tr(msgid('Dismiss announcement: {title}')) }
    return `<div class="v2-account-tool__preview" data-whm-announcements-preview="${language}" lang="${language}" dir="${localeDirection(language)}" data-whm-announcements-labels="${esc(JSON.stringify(labels))}" aria-label="${esc(t(msgid('{language} preview'), { language: languageName(language, locale) }))}" hidden></div>`
  }).join('')
  const container = editable ? 'form' : 'div'
  const editor = toolCard('announcements-editor', t(msgid('Create announcement')), `<${container} class="v2-account-tool__groups" data-whm-announcements-form aria-labelledby="v2-announcements-editor-heading"${editable ? ' novalidate' : ''}><h3 id="v2-announcements-editor-heading" data-whm-announcements-editor-heading>${esc(t(msgid('Create announcement')))}</h3>${content}${hint(t(msgid('Plain text only: HTML is refused and links are not made clickable. Titles up to 140 characters, messages up to 2000. Both languages are required.')), ' id="v2-announcements-text-help"')}${choices}<section class="v2-account-tool__groups" aria-labelledby="v2-announcements-preview-heading"><h3 id="v2-announcements-preview-heading">${esc(t(msgid('Preview')))}</h3><p class="text-sm font-normal text-secondary-foreground" data-whm-announcements-preview-empty>${esc(t(msgid('Fill in both titles and messages to see how account owners will see the notice.')))}</p><div class="v2-account-tool__previews">${previews}</div></section>${status('', { 'data-whm-announcements-save-status': true }, 'unread', true)}${actions(`<button type="button" class="v2-btn kt-btn kt-btn-outline" data-whm-announcements-cancel hidden${off}>${esc(t(msgid('Cancel editing')))}</button><button type="${editable ? 'submit' : 'button'}" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-whm-announcements-save${off}>${keenicon('plus')}${esc(t(msgid('Create announcement')))}</button>`, true)}</${container}>`)
  return page(props, '/whm/accounts/announcements', title, t(msgid("Notices shown on account owners' xPanel home page while they are live, in English and Arabic. Owners can dismiss a notice for their own account. Nothing is emailed.")), v2WhmClientTemplates('announcements') + v2AccountAnnouncementNoticeTemplates() + list + editor + renderV2EmailUsers(t, editable && qualified(props, 'email-all-users')),
    { 'data-whm-announcements-workspace': true, 'data-announcements-can-manage': String(editable), 'data-capability-state': editable ? 'authorized' : 'unavailable' })
}

export function renderV2WhmAccountTemplatesPage(props: WhmSurfaceProps, authority: WhmAccountToolAuthority): string {
  const { t, editable } = context(props, authority)
  const title = t(msgid('Templates'))
  const off = editable ? '' : ' disabled'
  const input = (key: string, label: string, max = 140): string => field(`v2-account-template-${key}`, label, `<input id="v2-account-template-${key}" type="text" maxlength="${max}" dir="auto" autocomplete="off" data-acct-templates-input="${key}"${off}>`)
  const application = toolCard('template-application', t(msgid('Where templates apply')), status(t(msgid('A new account whose plan uses a template gets the default zone plus the template records. Existing accounts and zones do not change.')), { 'data-acct-templates-application': true }, 'ready')
    + status(t(msgid('The page text of a template replaces the owner page for accounts on its plans.')), { 'data-acct-templates-pages': true }, 'ready'))
  const list = toolCard('template-list', t(msgid('Saved templates')), status(t(msgid('Templates have not been read.')), { 'data-acct-templates-status': true })
    + `<div data-acct-templates-loading aria-busy="true" aria-label="${esc(t(msgid('Loading templates')))}" hidden></div>`
    + table(t(msgid('Account creation templates')), [msgid('Name'), msgid('Plans'), msgid('Zone records'), msgid('Updated (UTC)'), msgid('Actions')].map(label => t(label)), { 'data-acct-templates-rows': true }, t(msgid('Not read')))
    + emptyState('data-acct-templates-empty', 'note-2', t(msgid('No templates yet')), t(msgid('Create one below. A plan uses at most one template.')))
    + status('', { 'data-acct-templates-list-status': true }, 'unread', true),
  undefined, button(t(msgid('Refresh')), { 'data-acct-templates-refresh': true }, editable))
  const contentPage = (kind: 'defaultPage' | 'suspendedPage', label: string, help: string): string => `<fieldset${off}><legend>${esc(label)}</legend><p>${esc(help)}</p>${input(`${kind}.title`, t(msgid('Title')))}${field(`v2-account-template-${kind}.body`, t(msgid('Message')), `<textarea id="v2-account-template-${kind}.body" rows="4" maxlength="2000" dir="auto" data-acct-templates-input="${kind}.body"${off}></textarea>`)}</fieldset>`
  const container = editable ? 'form' : 'div'
  const editor = toolCard('template-editor', t(msgid('Create template')), `<${container} class="v2-account-tool__groups" data-acct-templates-form${editable ? ' novalidate' : ''}><h3 data-acct-templates-editor-heading>${esc(t(msgid('Create template')))}</h3>${rows(row('v2-account-template-name', t(msgid('Template name')), `<input id="v2-account-template-name" type="text" maxlength="64" dir="auto" autocomplete="off" data-acct-templates-input="name"${off}>`))}<fieldset${off}><legend>${esc(t(msgid('Plans that use this template')))}</legend><div class="v2-account-tool__choice-list" data-acct-templates-plans><p>${esc(t(msgid('Plans have not been read.')))}</p></div></fieldset>`
    + rows(row('v2-account-template-zone', t(msgid('Extra zone records')), `<textarea id="v2-account-template-zone" rows="8" dir="ltr" spellcheck="false" autocomplete="off" data-acct-templates-input="zone" aria-describedby="v2-account-template-zone-help"${off}></textarea>`, t(msgid('One record per line: name, TTL in seconds, type, the priority for MX and SRV, then the content, for example: shop 3600 CNAME www.%domain%. These are added to the default zone. Lines starting with ; are ignored. Placeholders: {placeholders}. A line using %ipv6% is left out for an account without IPv6.'), { placeholders: '%domain%, %ipv4%, %ipv6%, %mailhost%' })))
    + contentPage('defaultPage', t(msgid('Default website page')), t(msgid('Plain text shown on a new site before the owner uploads files.')))
    + contentPage('suspendedPage', t(msgid('Suspended account page')), t(msgid('Plain text shown while an account is suspended.')))
    + status('', { 'data-acct-templates-save-status': true }, 'unread', true)
    + actions(`<button type="button" class="v2-btn kt-btn kt-btn-outline" data-acct-templates-cancel hidden${off}>${esc(t(msgid('Cancel editing')))}</button><button type="${editable ? 'submit' : 'button'}" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-acct-templates-save${off}>${keenicon('plus')}${esc(t(msgid('Create template')))}</button>`, true)
    + `</${container}>`)
  const preview = toolCard('template-preview', t(msgid('Zone preview')), `<p data-acct-templates-preview-note>${esc(t(msgid('Choose Edit on a saved template to see its full zone for example.com with documentation addresses 192.0.2.10 and 2001:db8::10. Unsaved changes are checked when you save.')))}</p>`
    + table(t(msgid('Zone preview')), [t(msgid('Name')), 'TTL', t(msgid('Type')), t(msgid('Priority')), t(msgid('Content'))], { 'data-acct-templates-preview': true }, t(msgid('No template selected'))))
  return page(props, '/whm/accounts/templates', title, t(msgid('Zone records for new accounts on a plan, the default and suspended pages, and the files every new account starts with.')), (authority.root === false ? '' : application + list + editor + preview + v2AccountLifecycleTemplates('templates')) + renderV2WebTemplates(t, editable) + renderV2Skeleton(t, editable),
    { 'data-acct-templates-workspace': true, 'data-templates-can-manage': String(editable), 'data-capability-state': editable ? 'authorized' : 'unavailable' })
}
