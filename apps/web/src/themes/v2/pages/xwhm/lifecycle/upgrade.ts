import { renderV2ServerOps } from '../server/server-ops.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { v2Messages } from '../../../messages.ts'
import { escapeHtml } from '../../../html.ts'
import { lifecycleButton, lifecycleCard, lifecycleFacts, lifecycleField, lifecycleHeader, lifecycleHeading, lifecycleIcon, lifecycleLink, lifecycleNote, lifecycleRules, lifecycleStatus, lifecycleTable, phoneColumns, text, type LifecycleAccess, type LifecycleButtonLook } from './shared.ts'

export interface V2UpgradePageProps extends LifecycleAccess {
  readonly hostname?: string
}

const CHECKS = [
  ['disk-space', msgid('Free space is at least twice the release')],
  ['os-supported', msgid('Operating system is supported')],
  ['no-active-transfer', msgid('No transfer or queued job is running')],
  ['version-newer', msgid('Target release is newer')],
  ['schema-compatible', msgid('Schema change is forward only')],
] as const

const PHASES = [
  ['precheck', msgid('Precheck')], ['snapshot', msgid('Snapshot')], ['stage', msgid('Stage')],
  ['migrate', msgid('Migrate')], ['switch', msgid('Switch')], ['health-check', msgid('Health')], ['rollback', msgid('Rollback')],
] as const

/** Release and host observations are filled by the authoritative upgrade controller, never prototype values. */
export function renderV2UpgradePage(props: V2UpgradePageProps): string {
  const t = v2Messages.translator(props.locale)
  const button = (key: string, label: string, primary = false, look?: LifecycleButtonLook): string => lifecycleButton(t, label, { [`data-upgrade-${key}`]: true }, primary, look)
  const status = (key: string, label: string): string => lifecycleStatus(t, label, { [`data-upgrade-${key}`]: true })
  const fact = (key: string, label: string): { key: string; label: string } => ({ key, label })
  const facts = (rows: readonly { key: string; label: string }[], look?: 'table' | 'tiles'): string => lifecycleFacts(t, rows, 'data-upgrade-fact', look)
  const actions = (body: string, end = false): string => `<div class="${end ? 'v2-lifecycle__actions justify-end' : 'v2-lifecycle__actions'}">${body}</div>`
  // The installed and the available release side by side, each a titled panel of summary tiles.
  const panel = (label: string, look: string, rows: readonly { key: string; label: string }[]): string => `<section class="${look}" aria-label="${text(t, label)}"><h3 class="text-base font-semibold text-mono">${text(t, label)}</h3>${facts(rows, 'tiles')}</section>`
  const release = lifecycleCard(t, 'upgrade-release', msgid('Release'), `
<div class="v2-lifecycle__release">${panel(msgid('Current'), 'v2-lifecycle__group rounded-xl border border-border p-4', [fact('current-version', msgid('Installed')), fact('current-schema', msgid('Schema')), fact('current-path', msgid('Release folder')), fact('current-since', msgid('Since (UTC)'))])}
${panel(msgid('Available'), 'v2-lifecycle__group rounded-xl border border-primary/20 bg-primary/5 p-4', [fact('available-version', msgid('Version')), fact('available-schema', msgid('Schema')), fact('available-bytes', msgid('Unpacked size')), fact('available-signature', msgid('Signature'))])}</div>
${lifecycleField(t, 'v2-upgrade-target', msgid('Target release'), `<select id="v2-upgrade-target" name="targetRelease" data-upgrade-target disabled><option value="">${text(t, msgid('No verified staged release has been read'))}</option></select>`, msgid('Only releases staged on this server whose Ed25519 signature verifies against the root-held release keys are listed.'))}
${facts([fact('trust-keys', msgid('Trusted release keys')), fact('trust-source', msgid('Key file')), fact('staged-directory', msgid('Staging folder')), fact('coordinator', msgid('Upgrade coordinator'))])}
${lifecycleTable(t, msgid('Staged releases'), [msgid('Manifest'), msgid('Version'), msgid('Schema'), msgid('Signature')], { 'data-upgrade-staged': true }, msgid('No staged release has been read.'), { value: 2 })}
${lifecycleHeading(t, msgid('What changes'))}
${status('notes', msgid('Release notes are not part of the signed release manifest, so none are shown as evidence.'))}
${status('migrations', msgid('Migrations in this release: the schema range is read from the signed manifest; individual migrations are checked by the upgrade machine after unpacking and must be expand only.'))}
${actions(button('open-confirm', msgid('Upgrade to selected release'), true, { icon: 'rocket' }), true)}
<details class="v2-lifecycle__group" data-upgrade-confirm><summary>${text(t, msgid('Confirm upgrade'))}<i class="ki-filled ki-down text-sm text-muted-foreground" aria-hidden="true"></i></summary>
<dl class="v2-lifecycle__fields"><div class="v2-lifecycle__field"><dt class="text-sm leading-(--lh-label) text-secondary-foreground">${text(t, msgid('Server'))}</dt><dd class="text-base leading-(--lh-text) text-mono"><bdi dir="ltr">${!props.canRead || props.hostname === undefined ? text(t, msgid('Not read')) : escapeHtml(props.hostname)}</bdi></dd></div></dl>
${facts([fact('confirm-from', msgid('From version')), fact('confirm-to', msgid('To version'))])}
${lifecycleNote(t, msgid('Panel sign-in pauses while the xPanel API and agent restart. Sites, mail and databases keep serving. If the health check fails, the previous release is switched back and the current desired state is reconciled; earlier generations are not replayed.'))}
<div class="v2-lifecycle__field"><label class="kt-form-label" for="v2-upgrade-phrase">${text(t, msgid('Type the confirmation exactly'))} <bdi class="v2-mono" dir="ltr" data-upgrade-fact="confirm-phrase">upgrade</bdi></label><input id="v2-upgrade-phrase" class="kt-input" type="text" dir="ltr" autocomplete="off" spellcheck="false" data-upgrade-confirm-input disabled></div>
${actions(button('cancel', msgid('Cancel'), false, { kind: 'ghost' }) + button('start', msgid('Start upgrade'), true, { icon: 'rocket' }), true)}</details>
${status('status', msgid('No upgrade has been requested from this page.'))}
`, { 'data-whm-detail-section': 'upgrade-version' }, { actionsHtml: button('refresh', msgid('Read release state'), false, { icon: 'refresh', small: true }) })

  const preflight = lifecycleCard(t, 'upgrade-preflight', msgid('Preflight'), `
${status('preflight-summary', msgid('Preflight has not run. Every value is read from this server when it runs.'))}
<div class="v2-lifecycle__scroll kt-scrollable-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${text(t, msgid('Preflight checks'))}"><table class="v2-lifecycle__table kt-table"${phoneColumns([msgid('Check'), msgid('Result'), msgid('Observed')].map(label => t(label)), { value: 2 })}><caption class="v2-sr">${text(t, msgid('Preflight checks'))}</caption><thead><tr>${[msgid('Check'), msgid('Result'), msgid('Observed')].map(label => `<th scope="col">${text(t, label)}</th>`).join('')}</tr></thead><tbody data-upgrade-checks>${CHECKS.map(([key, label]) => `<tr data-upgrade-check="${key}"><th scope="row">${text(t, label)}</th><td class="text-sm font-medium text-foreground" data-upgrade-check-result>${text(t, msgid('Not run'))}</td><td class="text-base text-secondary-foreground"><bdi dir="ltr" data-upgrade-check-detail>${text(t, msgid('Not run'))}</bdi></td></tr>`).join('')}</tbody></table></div>
`, { 'data-whm-detail-section': 'upgrade-preflight' }, { actionsHtml: button('preflight', msgid('Run preflight again'), false, { icon: 'shield', small: true }) })
  const rollback = lifecycleCard(t, 'upgrade-rollback', msgctxt('theme:v2', 'Automatic rollback'), `${lifecycleNote(t, msgid('Rollback reconciles the current desired state; earlier generations are not replayed.'))}${facts([fact('snapshot-dir', msgid('Control-database snapshot is written to'))])}`)

  const progress = lifecycleCard(t, 'upgrade-progress', msgid('Upgrade job and progress'), `
<div data-upgrade-progress-state="not-read">${status('progress', msgid('No upgrade job or progress observation has been read.'))}</div>
<div class="v2-upgrade-progress flex flex-col gap-4"><div class="v2-upgrade-progress__head flex flex-wrap items-center justify-between gap-2 text-base text-secondary-foreground"><span data-upgrade-progress-label>${text(t, msgid('Not read'))}</span><bdi class="font-medium text-mono" dir="ltr" data-upgrade-progress-pct>0%</bdi></div><div class="v2-upgrade-meter kt-progress kt-progress-primary" role="progressbar" aria-label="${text(t, msgid('Upgrade progress'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-upgrade-progressbar><progress class="v2-upgrade-meter__native" max="100" value="0" data-upgrade-progress-native aria-hidden="true"></progress></div></div>
<div class="v2-lifecycle__scroll kt-scrollable-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${text(t, msgid('Upgrade progress'))}"><table class="v2-lifecycle__table kt-table" data-phone-value="2"><caption class="v2-sr">${text(t, msgid('Upgrade progress'))}</caption><thead><tr><th scope="col">${text(t, msgid('Phase'))}</th><th scope="col">${text(t, msgid('State'))}</th></tr></thead><tbody data-upgrade-phases>${PHASES.map(([key, label]) => `<tr data-upgrade-phase="${key}"><th scope="row">${text(t, label)}</th><td class="text-base text-secondary-foreground" data-upgrade-phase-state>${text(t, msgid('Not read'))}</td></tr>`).join('')}</tbody></table></div>
${lifecycleHeading(t, msgid('Upgrade log'))}
<ol class="v2-upgrade-log" data-upgrade-log-list><li><span class="v2-upgrade-log__msg">${text(t, msgid('No upgrade log entries have been read.'))}</span></li></ol>
${actions(button('cancel-pending', msgid('Cancel pending upgrade'), false, { icon: 'xCircle', kind: 'danger' }), true)}
${lifecycleNote(t, msgid('The upgrade machine has no cancel step. Once handed off it finishes or rolls back on its own.'), undefined, true)}
`, { 'data-whm-detail-section': 'upgrade-job' })

  const history = lifecycleCard(t, 'upgrade-history', msgid('Upgrade history'), lifecycleTable(t, msgid('Upgrade history'), [msgid('From → to'), msgid('Schema'), msgid('Started (UTC)'), msgid('Result'), msgid('Actor'), msgid('Reason')], { 'data-upgrade-history': true }, msgid('No records have been read.'), { value: 4 }), { 'data-whm-detail-section': 'upgrade-history' },
    { footerHtml: `<a class="v2-btn kt-btn kt-btn-outline" href="/whm/audit?lang=${props.locale}">${lifecycleIcon('notes')}${text(t, msgid('All entries in the audit log'))}</a>` })
  const list = (labels: readonly string[]): string => lifecycleRules(t, labels)
  const boundaries = lifecycleCard(t, 'upgrade-boundaries', msgid('What an upgrade touches'), `
${lifecycleHeading(t, msgid('Never touched'))}${list([msgctxt('theme:v2', 'Account homes in /home'), msgid('Mail stores and mailboxes'), msgid('Customer MariaDB databases')])}
${lifecycleHeading(t, msgid('Kept as they are'))}${list([msgid('UIDs and GIDs of every account'), msgid('Account slices and their limits'), msgid('Disk quotas, IO bandwidth and IOPS caps')])}
${lifecycleHeading(t, msgid('Added'))}${facts([fact('added-release', msgid('Release folder')), fact('added-schema', msgid('Control-database schema'))])}
${lifecycleNote(t, msgid('A new configuration generation is built from the same desired state after the switch.'))}
`)
  const health = lifecycleCard(t, 'upgrade-health', msgid('Health check after the switch'), `${lifecycleNote(t, msgid('Every check must pass within the health attempts. Any failure starts the automatic rollback.'))}${list([
    msgid('Reconciler equals the desired state and account identities are unchanged'),
    msgid('A canary account is served under its own UID, when a canary is configured'),
    msgid('The control plane services and private IPC are ready'),
  ])}`)
  const process = lifecycleCard(t, 'upgrade-process', msgid('How the upgrade runs'), `${lifecycleNote(t, msgid('Only xPanel’s own services restart. Nginx, Apache, PHP-FPM, MariaDB and mail are reloaded at most.'))}<ol class="v2-lifecycle__steps" aria-label="${text(t, msgid('Steps'))}">${PHASES.filter(([key]) => key !== 'rollback').map(([, label], index) => `<li><span aria-hidden="true">${index + 1}</span><span>${text(t, label)}</span></li>`).join('')}</ol>${lifecycleNote(t, msgid('A healthy host flow stays recorded as retirement pending until the native coordinator settles it. A failed health check switches back to the previous release.'))}`)
  return `<div class="v2-lifecycle" data-whm-detail-route="/whm/server/upgrade" data-capability-state="${props.canRead === true ? 'authorized' : 'unavailable'}" lang="${props.locale}" dir="${localeDirection(props.locale)}">
${lifecycleHeader(t, msgid('Upgrade'), '/whm/server/upgrade', msgctxt('theme:v2', 'Review a verified release, run host preflight and confirm before changing the control plane.'), lifecycleLink(t, msgid('Upgrade history'), '#v2-lifecycle-upgrade-history', 'clock'))}
<div class="v2-lifecycle__column" data-whm-upgrade-workspace data-upgrade-can-manage="${props.canRead && props.canManage}">
${status('banner', props.canRead ? msgid('Release state has not been read. Nothing has changed.') : msgctxt('theme:v2', 'Upgrade state is unavailable to this account. Nothing has changed.'))}
${release}
<div class="v2-lifecycle__grid"><div class="v2-lifecycle__column">${preflight}${progress}</div><aside class="v2-lifecycle__column" aria-label="${text(t, msgctxt('theme:v2', 'Upgrade behavior and recovery'))}">${process}${health}${rollback}${boundaries}</aside></div>
${history}${renderV2ServerOps(t, ['updates'], props.canRead && props.canManage)}
</div></div>`
}
