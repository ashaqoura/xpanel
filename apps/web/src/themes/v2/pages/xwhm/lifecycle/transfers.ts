import { localeDirection } from '../../../../../i18n.ts'
import { v2Messages } from '../../../messages.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { lifecycleButton, lifecycleCard, lifecycleField, lifecycleHeader, lifecycleHeading, lifecycleLink, lifecycleNote, lifecycleRules, lifecycleStatus, lifecycleTable, phoneColumns, text, type LifecycleAccess, type LifecycleButtonLook } from './shared.ts'
import { renderV2TransferCredentials, v2TransferClientTemplates } from './client-templates.ts'

export interface V2TransferPageProps extends LifecycleAccess {
  readonly scope?: 'accounts' | 'server'
  /** Already authorized credential labels, never raw credentials. IDs are only option values. */
  readonly credentials?: readonly { readonly id: string; readonly label: string; readonly kind: 'ssh-key' | 'api-token' }[]
}

/** The persisted transfer controller fills every observation and enables actions after its own admission checks. */
export function renderV2TransferPage(props: V2TransferPageProps): string {
  const t = v2Messages.translator(props.locale)
  const scope = props.scope ?? 'accounts'
  const route = scope === 'server' ? '/whm/transfers/server' : '/whm/transfers'
  const button = (action: string, label: string, primary = false, look?: LifecycleButtonLook): string => lifecycleButton(t, label, { [`data-transfer-${action}`]: true }, primary, look)
  const input = (key: string, label: string, type = 'text', extra = ''): string => lifecycleField(t, key, label,
    `<input id="${key}" type="${type}" data-transfer-field="${key}" dir="ltr"${extra} disabled>`)
  const select = (id: string, label: string, hook: string, options = ''): string => lifecycleField(t, id, label,
    `<select id="${id}" data-transfer-${hook} disabled>${options}</select>`)
  const status = (label: string, hook: string): string => lifecycleStatus(t, label, { [`data-transfer-${hook}`]: true })
  const fields = (body: string): string => `<div class="v2-lifecycle__fields">${body}</div>`
  const actions = (body: string, end = false): string => `<div class="${end ? 'v2-lifecycle__actions justify-end' : 'v2-lifecycle__actions'}">${body}</div>`
  const fact = (label: string, hook: string): string => `<div class="v2-lifecycle__field"><dt class="text-sm leading-(--lh-label) text-secondary-foreground">${text(t, label)}</dt><dd class="text-base leading-(--lh-text) font-medium text-mono" data-transfer-${hook}>${text(t, msgid('Not read'))}</dd></div>`
  const source = lifecycleCard(t, 'transfer-source', msgctxt('theme:v2', 'Connect source'), `
${status(msgid('No authenticated source inventory has been read.'), 'source-observation')}
${fields(select('transfer-session', msgid('Saved session'), 'session'))}
<dl class="v2-lifecycle__fields v2-lifecycle__stats">${fact(msgid('Source'), 'source')}${fact(msgid('State'), 'state')}</dl>
${actions(button('discover', msgid('Connect and discover'), false, { icon: 'search' }) + button('cancel', msgid('Cancel pending session'), false, { icon: 'x', kind: 'danger' }), true)}
${lifecycleHeading(t, msgid('Create a source review'))}
${fields(input('transfer-host', msgid('Source host or HTTPS API URL'), 'text', ' maxlength="1024"')
    + select('transfer-credential', msgid('Stored credential'), 'credential', (props.canRead ? props.credentials ?? [] : []).map(credential => `<option value="${escapeHtml(credential.id)}" data-kind="${credential.kind}">${escapeHtml(credential.label)}</option>`).join(''))
    + input('transfer-port', msgid('SSH port'), 'number', ' min="1" max="65535" value="22"')
    + input('transfer-user', msgid('SSH user'), 'text', ' maxlength="16" value="root"')
    + input('transfer-fingerprint', msgid('Pinned host key or TLS fingerprint'), 'text', ' maxlength="128"')
    + select('transfer-node', msgid('Linked server'), 'node'))}
<label class="v2-lifecycle__choice v2-lifecycle__switch"><input class="kt-switch" type="checkbox" role="switch" data-transfer-live checked disabled><span><strong class="text-sm font-medium text-foreground">${text(t, msgid('Live transfer: final sync, then cut over'))}</strong></span></label>
${lifecycleNote(t, msgid('Choose a named credential already stored on this server. Source passwords, private keys and raw API tokens are never entered or stored here.'), undefined, true)}
${lifecycleNote(t, msgid('A linked server needs no credential here. A live transfer suspends the source account for the final sync, then its sites and mail pass through to this server and its zones point here.'), undefined, true)}
${actions(button('create', msgid('Save source review'), true, { icon: 'check' }), true)}
`, { 'data-whm-detail-section': 'transfer-source' }, { actionsHtml: button('refresh', msgid('Read saved sessions'), false, { icon: 'refresh', small: true }) })

  const selectAllHeader = `<label class="v2-lifecycle__choice"><input class="kt-checkbox" type="checkbox" data-transfer-select-all aria-label="${text(t, msgid('Select all accounts'))}" disabled><span class="v2-sr">${text(t, msgid('Select'))}</span></label>`
  const inventoryTable = lifecycleTable(t, msgctxt('theme:v2', 'Source accounts'), [{ label: msgid('Select'), headerHtml: selectAllHeader }, msgid('Account'), msgid('Plan'), msgid('Disk'), msgid('Databases'), msgid('Mailboxes'), msgid('Conflict'), msgid('Resolution')], { 'data-transfer-inventory-rows': true, 'data-transfer-accounts': true }, msgid('No observed records are available for this saved session.'), { name: 2, value: 1 })
  const selection = lifecycleCard(t, 'transfer-selection', msgctxt('theme:v2', 'Select accounts'), `
${scope === 'server' ? lifecycleNote(t, msgid('Whole-server migration selects every source account and plan. An account with a conflict can be skipped when you resolve it.')) : ''}
<div class="v2-lifecycle__choices" data-transfer-plans></div>
${status(msgid('No authenticated source inventory has been read.'), 'inventory-note')}
${status(msgctxt('theme:v2', 'Authenticated source inventory has not been read.'), 'identities-observation')}
<ul class="v2-transfer-discovery-pills" data-transfer-discovery-pills hidden></ul>
${inventoryTable}
${actions(button('select', msgid('Save selection'), true, { icon: 'check' }), true)}
`, { 'data-whm-detail-section': 'transfer-identities' })

  const buildTable = lifecycleTable(t, msgid('What will be built here'), [msgid('From source'), msgid('New account'), msgid('New UID'), msgid('Slice'), msgid('Vhost'), msgid('PHP')], { 'data-transfer-build-rows': true }, msgid('Build preview appears once source inventory or review is read.'), { name: 2, value: 3 })
  const mapping = lifecycleCard(t, 'transfer-plans', msgctxt('theme:v2', 'Plans and conflicts'), `
${status(msgctxt('theme:v2', 'The source plans and their destination mappings have not been read.'), 'plan-observation')}
${lifecycleTable(t, msgid('Plan mapping'), [msgid('Source plan'), msgid('Plan here'), msgid('Owner'), msgid('Review')], { 'data-transfer-plan-rows': true }, msgid('No observed records are available for this saved session.'), { value: 4 })}
${fields(select('transfer-conflict', msgid('Conflict'), 'conflict')
    + select('transfer-resolution', msgid('Resolution'), 'resolution')
    + input('transfer-resolution-target', msgid('Destination name'), 'text', ' maxlength="128"'))}
${actions(button('resolve', msgid('Save resolution')) + button('review', msgid('Build current review'), true, { icon: 'eye' }), true)}
<div data-transfer-review-results${phoneColumns([msgid('Source account'), msgid('Destination account'), msgid('Plan'), msgid('Domains'), msgid('Mailboxes')].map(label => t(label)))}></div>
${lifecycleHeading(t, msgid('What will be built here'))}
${buildTable}
<div class="v2-transfer-slice-box flex flex-col gap-2 min-w-0 rounded-lg border border-border bg-muted/40 p-4" data-transfer-slice-box hidden><span class="v2-transfer-slice-box__label text-[13px] leading-(--lh-cap) font-medium text-secondary-foreground" data-transfer-slice-label></span><pre class="v2-lifecycle__key" dir="ltr" data-transfer-slice-unit></pre></div>
`, { 'data-whm-detail-section': 'transfer-plans' })

  const execution = lifecycleCard(t, 'transfer-run', msgctxt('theme:v2', 'Run transfer'), `
${status(msgctxt('theme:v2', 'No transfer has been started.'), 'execution-note')}
${status(msgctxt('theme:v2', 'No transfer progress has been read.'), 'progress-state')}
${lifecycleTable(t, msgctxt('theme:v2', 'Account transfer progress'), [msgid('Account'), msgid('Home'), msgid('Databases'), msgid('Mail'), msgid('DNS'), msgid('Apply')], { 'data-transfer-progress-rows': true }, msgctxt('theme:v2', 'No transfer progress has been read.'), { value: 6 })}
${actions(button('stop', msgid('Stop after the current account'), false, { icon: 'xCircle', kind: 'danger' }) + button('run', msgid('Run reviewed transfer'), true, { icon: 'rocket' }), true)}
${lifecycleHeading(t, msgid('Revert a cutover'))}
${fields(select('transfer-revert-account', msgid('Moved account'), 'revert-account'))}
${lifecycleNote(t, msgid('Revert first reads what changed here since the cutover and asks you to confirm that list. None of it is carried back to the source.'))}
<div data-transfer-revert-loss></div>
${actions(button('revert', msgid('Revert cutover'), false, { icon: 'undo', kind: 'danger' }), true)}
`)

  const importDetails = (key: string, title: string): string => `<details data-transfer-import-part="${key}"><summary>${text(t, title)}<i class="ki-filled ki-down text-sm text-muted-foreground" aria-hidden="true"></i></summary>${lifecycleTable(t, title, [msgid('Source'), msgid('Proposed'), msgid('Detail'), msgid('State')], { [`data-transfer-import-${key}`]: true }, msgid('No parsed archive review was returned.'), { value: 4 })}</details>`
  const archive = lifecycleCard(t, 'transfer-import', msgid('Import a cPanel backup'), `
${status(msgid('No parsed archive review was returned.'), 'import-observation')}
${fields(input('transfer-archive', msgid('Backup file'), 'file', ' accept=".tar.gz,.tgz"')
    + input('transfer-archive-target', msgid('Destination username (optional)'), 'text', ' maxlength="16"'))}
<div class="v2-dropzone" data-file-dropzone role="button" tabindex="0" aria-label="${text(t, msgid('Drop a cPanel backup archive (.tar.gz or .tgz) here'))}"><i class="ki-filled ki-folder-up text-2xl text-muted-foreground" aria-hidden="true"></i><span class="v2-dropzone__title">${text(t, msgid('Drop a cPanel backup archive (.tar.gz or .tgz) here'))}</span><span class="v2-dropzone__hint">${text(t, msgid('Or click to choose a local archive for inspection before import.'))}</span></div>
${status(msgid('The import limit has not been read.'), 'archive-limit')}
${actions(button('inspect', msgid('Upload and read'), false, { icon: 'upload' }), true)}
${lifecycleHeading(t, msgid('Or fetch it from the cPanel server over SSH'))}
${fields(input('transfer-cpanel-host', 'cPanel host', 'text', ' maxlength="253"')
    + input('transfer-cpanel-port', msgid('SSH port'), 'number', ' min="1" max="65535" value="22"')
    + input('transfer-cpanel-user', 'cPanel username', 'text', ' maxlength="16"')
    + input('transfer-cpanel-fingerprint', msgid('Pinned host key'), 'text', ' maxlength="128"'))}
<p class="v2-muted text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${text(t, msgid('The cPanel server runs pkgacct as root with this server\'s transfer key; add its public key there first.'))} <bdi class="v2-mono" dir="ltr" data-transfer-ssh-key-value></bdi></p>
${actions(button('ssh-key', msgid('Show transfer key'), false, { icon: 'key' }) + button('fetch', msgid('Fetch over SSH'), false, { icon: 'download' }), true)}
${fields(select('transfer-import', msgid('Archive'), 'import') + select('transfer-import-plan', msgid('Plan here'), 'import-plan'))}
<div data-transfer-archive-review${phoneColumns([msgid('Not imported or changed'), msgid('Detail'), msgid('Path')].map(label => t(label)))}></div>
${importDetails('domains', msgid('Domains'))}${importDetails('home', msgid('Home files'))}${importDetails('databases', msgid('Databases and users'))}${importDetails('mail', msgid('Mailboxes'))}${importDetails('dns', msgid('DNS zones'))}
${lifecycleTable(t, msgid('Not imported or changed'), [msgid('State'), msgid('Detail'), msgid('Path')], { 'data-transfer-import-warnings': true }, msgid('No parsed archive review was returned.'))}
${lifecycleNote(t, msgid('The import builds a new UID, slice and vhost, then restores files, SQL, zones and mail into them. Zones get this server\'s name servers. It runs as its own job.'))}
${actions(button('import-discard', msgid('Discard archive'), false, { icon: 'trash', kind: 'danger' }) + button('import-run', msgid('Import account'), true, { icon: 'check' }), true)}
`, { 'data-whm-detail-section': 'transfer-import' })

  const note = lifecycleCard(t, 'transfer-boundary', msgctxt('theme:v2', 'Transfer review'), lifecycleRules(t, [
    msgid('Resume a saved review, inspect actual source inventory and resolve conflicts. Connection and execution results are accepted only from the trusted server adapter.'),
    msgctxt('theme:v2', 'No destination account is created until the current review is confirmed. Source identity, resource limits and proposed changes must be checked before running.'),
  ]))
  const summary = `<dl class="v2-lifecycle__summary grid grid-cols-2 lg:grid-cols-4 gap-6">${([['source', msgid('Source server'), 'server'], ['accounts', msgid('Selected accounts'), 'users'], ['conflicts', msgid('Conflicts'), 'shield'], ['ready', msgid('Ready to build'), 'check']] as const).map(([key, label, glyph]) => `<div class="v2-lifecycle__kpi kt-card p-4 gap-2"><dt class="flex items-center justify-between gap-2 text-sm leading-(--lh-label) font-normal text-secondary-foreground"><span>${text(t, label)}</span><span class="v2-tile v2-tile--neutral" aria-hidden="true">${icon(glyph)}</span></dt><dd class="text-lg leading-8 font-semibold text-mono" data-transfer-kpi="${key}">${text(t, msgid('Not read'))}</dd></div>`).join('')}</dl>`
  const steps = `<ol class="v2-lifecycle__steps" aria-label="${text(t, msgid('Steps'))}">${([['transfer-source', msgctxt('theme:v2', 'Connect source')], ['transfer-selection', msgctxt('theme:v2', 'Select accounts')], ['transfer-plans', msgctxt('theme:v2', 'Plans and conflicts')], ['transfer-run', msgctxt('theme:v2', 'Run transfer')]] as const).map(([key, label], index) => `<li><span aria-hidden="true">${index + 1}</span><a href="#v2-lifecycle-${key}">${text(t, label)}</a></li>`).join('')}</ol>`
  const headerActions = lifecycleLink(t, msgid('Audit log'), `/whm/audit?lang=${props.locale}`, 'notes') + (scope === 'server' ? '' : lifecycleLink(t, msgid('Import a cPanel backup'), '#v2-lifecycle-transfer-import', 'download'))
  return `<div class="v2-lifecycle" data-whm-detail-route="${route}" data-capability-state="${props.canRead ? 'authorized' : 'unavailable'}" lang="${props.locale}" dir="${localeDirection(props.locale)}">
${lifecycleHeader(t, scope === 'server' ? msgid('Server migration') : msgid('Transfer tool'), route, msgctxt('theme:v2', 'Move accounts from a verified source or inspect a cPanel archive before importing.'), headerActions)}
${scope === 'server' ? renderV2TransferCredentials(t, props.canRead && props.canManage) : ''}
<section class="v2-lifecycle__column" data-transfer-workspace data-transfer-inventory-layout="comparison" data-transfer-can-read="${props.canRead && props.canManage}" data-transfer-manage="${props.canRead && props.canManage}" data-transfer-scope="${scope}"${props.canRead ? ' data-transfer-credentials="read"' : ''} aria-label="${text(t, msgid('Saved transfer sessions and archive review'))}">
${summary}${steps}
${note}${source}${selection}${mapping}${execution}
${scope === 'server' ? `<div hidden>${archive}</div>` : archive}
<p class="v2-lifecycle__status text-sm" role="status" data-transfer-status data-state="unread">${text(t, props.canRead ? msgid('Saved transfer state has not been read.') : msgid('Transfer review is unavailable here. Nothing was read or changed.'))}</p>
${v2TransferClientTemplates(t)}
</section></div>`
}
