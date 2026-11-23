import { localeDirection } from '../../../../../i18n.ts'
import { v2Messages } from '../../../messages.ts'
import { lifecycleButton, lifecycleCard, lifecycleFacts, lifecycleField, lifecycleHeader, lifecycleLink, lifecycleNote, lifecycleStatus, lifecycleTable, text, type LifecycleAccess, type LifecycleButtonLook } from './shared.ts'
import { renderV2BackupDestinationManager } from './destination-manager.ts'

export type V2BackupDestinationsPageProps = LifecycleAccess

/** Destination tests, activation, copies and retention remain controlled by their core lifecycle controllers. */
export function renderV2BackupDestinationsPage(props: V2BackupDestinationsPageProps): string {
  const t = v2Messages.translator(props.locale)
  const manage = props.canRead && props.canManage
  const actions = (body: string): string => `<div class="v2-lifecycle__actions">${body}</div>`
  const runsTable = (key: string, title: string, labels: readonly string[], empty: string, value: number): string => `${lifecycleTable(t, title, labels, { 'data-backup-runs-rows': key }, msgid('Not read'), { value })}<p class="text-sm text-secondary-foreground" data-backup-runs-empty="${key}" hidden>${text(t, empty)}</p>`
  const runsButton = (key: string, label: string, primary = false, look?: LifecycleButtonLook): string => lifecycleButton(t, label, { [`data-backup-${key}`]: true }, primary, look)
  // The run controller refuses to read without its four row templates inside this section.
  const technical = (slot: string): string => `<td><bdi dir="ltr" class="v2-mono" data-xp-slot="${slot}"></bdi></td>`, plain = (slot: string): string => `<td data-xp-slot="${slot}"></td>`
  const runTemplate = (kind: string, cells: string): string => `<template data-xp-template="whm-backup-${kind}-row"><tr>${cells}</tr></template>`
  const runTemplates = runTemplate('runs', technical('started') + plain('trigger') + plain('state') + plain('copies') + plain('mail') + plain('retention'))
    + runTemplate('copies', technical('account') + plain('destination') + technical('archive') + technical('size') + technical('started') + '<td><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-slot="action" disabled></button></td>')
    + runTemplate('recoveries', technical('started') + technical('account') + technical('archive') + plain('state'))
    + runTemplate('retention', technical('archive') + technical('account') + technical('created') + technical('size') + plain('plan'))
  const history = lifecycleCard(t, 'destination-runs', msgid('Scheduled runs'), `
${lifecycleNote(t, msgctxt('theme:v2', 'A run counts copies only after their bytes and SHA-256 have been verified. Read the returned parts and failure details before treating a run as complete.'))}
${lifecycleStatus(t, msgid('Backup runs have not been read.'), { 'data-backup-runs-status': true, 'data-state': 'unread' })}
<div class="v2-lifecycle__group" data-backup-runs-loading aria-busy="true" aria-label="${text(t, msgid('Loading backup runs'))}" hidden><p class="text-sm text-secondary-foreground">${text(t, msgid('Loading backup runs'))}</p><span class="v2-skeleton kt-skeleton h-2.5 w-2/3 rounded-md" aria-hidden="true"></span><span class="v2-skeleton kt-skeleton h-2.5 w-1/2 rounded-md" aria-hidden="true"></span></div>
${lifecycleFacts(t, [
    { key: 'schedule', label: msgid('Schedule') }, { key: 'next', label: msgid('Next scheduled start (UTC)') }, { key: 'last', label: msgid('Last scheduled start (UTC)') },
  ], 'data-backup-runs-fact', 'tiles')}
${runsTable('runs', msgid('Backup run history'), [msgid('Started (UTC)'), msgid('Trigger'), msgid('State'), msgid('Verified copies'), msgid('Mail'), msgid('Retention')], msgid('No backup run has been recorded.'), 3)}
`, undefined, { actionsHtml: runsButton('runs-read', msgid('Read again'), false, { icon: 'refresh', small: true }) + runsButton('runs-start', msgid('Run backup now'), true, { icon: 'archive', small: true }) })
  const recovery = lifecycleCard(t, 'destination-copies', msgid('Verified remote copies'), `
${lifecycleNote(t, msgid('Recovery downloads one verified copy into the local archive folder of its account and checks its SHA-256 before it appears there. It never replaces an existing local archive. Restore it afterwards from Restore accounts.'))}
${runsTable('copies', msgid('Verified remote copies'), [msgid('Account'), msgid('Destination'), msgid('Archive'), msgid('Size'), msgid('Run started (UTC)'), msgid('Actions')], msgid('No verified remote copy is recorded.'), 4)}
${runsTable('recoveries', msgid('Recoveries'), [msgid('Started (UTC)'), msgid('Account'), msgid('Archive'), msgid('State')], msgid('No recovery has been requested.'), 4)}
`)
  const retention = lifecycleCard(t, 'destination-retention', msgid('Remote retention'), `
${lifecycleNote(t, msgid('Per account, the newest archive, the newest verified copy and the newest archives up to the schedule retention count are always kept. Only older archives past the destination retention days are deleted. Scheduled runs apply this after every copy is verified.'))}
${lifecycleField(t, 'v2-backup-retention-destination', msgid('Destination'), `<select id="v2-backup-retention-destination" data-backup-retention-destination disabled><option value="">${text(t, msgid('Not read'))}</option></select>`)}
${actions(runsButton('retention-preview', msgid('Review retention'), false, { icon: 'eye' }) + runsButton('retention-apply', msgid('Delete expired archives'), false, { icon: 'trash', kind: 'danger' }))}
${lifecycleStatus(t, '', { 'data-backup-retention-status': true }, true)}
${runsTable('retention', msgid('Retention plan'), [msgid('Archive'), msgid('Account'), msgid('Created (UTC)'), msgid('Size'), msgctxt('acct-backup-runs-workspace', 'Plan')], msgid('No xPanel archive was found at this destination.'), 5)}
`)
  return `<div class="v2-lifecycle" data-whm-detail-route="/whm/backups/destinations" data-capability-state="${props.canRead ? 'authorized' : 'unavailable'}" lang="${props.locale}" dir="${localeDirection(props.locale)}">
${lifecycleHeader(t, msgid('Backup destinations'), '/whm/backups/destinations', msgctxt('theme:v2', 'Save inactive destinations, verify their transport and review actual remote copies before recovery or retention.'), lifecycleLink(t, msgid('Server backups'), `/whm/backups?lang=${props.locale}`, 'archive'))}
${renderV2BackupDestinationManager(props, { after: `<section class="v2-lifecycle__column" data-whm-backup-runs data-can-manage="${manage}" aria-label="${text(t, msgid('Backup run history'))}">${history}${recovery}${retention}${runTemplates}</section>` })}</div>`
}
