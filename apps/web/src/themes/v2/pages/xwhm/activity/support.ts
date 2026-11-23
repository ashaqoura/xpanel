import { v2WhmClientTemplates } from '../../../whm-client-templates.ts'
import { icon, type IconName } from '../../../icons.ts'
import { check, context, esc, help, page, status, table, type WhmObservationInput } from '../monitoring/common.ts'
import { activityActions, activityButton, activityFactTable, activityLink, activityPanel } from './style.ts'

/** The three manifest lists: what the bundle holds, what it never holds and how values are redacted. */
const MANIFEST: Readonly<Record<string, readonly [glyph: IconName, tile: string]>> = {
  included: ['okCircle', 'flex size-9 shrink-0 items-center justify-center rounded-full border border-input bg-accent/60 text-green-500'],
  excluded: ['xCircle', 'flex size-9 shrink-0 items-center justify-center rounded-full border border-input bg-accent/60 text-destructive'],
  redaction: ['shield', 'flex size-9 shrink-0 items-center justify-center rounded-full border border-input bg-accent/60 text-primary'],
}

export function renderV2WhmSupport(input: WhmObservationInput): string {
  const { t, canRead } = context(input)
  const list = (key: keyof typeof MANIFEST & string, label: string) => `<div class="v2-observation__groups gap-3.5 rounded-xl border border-border p-5"><div class="flex items-center gap-2.5"><span class="${MANIFEST[key]![1]}" aria-hidden="true">${icon(MANIFEST[key]![0], 16)}</span><h3 class="text-sm font-semibold text-mono">${esc(t(label))}</h3></div><ul class="v2-observation__list v2-activity__manifest text-sm text-secondary-foreground gap-2.5" data-whm-support-${key}><li>${esc(t(msgid('The manifest has not been read.')))}</li></ul></div>`
  const footerLink = (label: string, href: string, glyph: IconName): string => activityLink(t, label, href, {}, { icon: glyph })
  const body = activityPanel(t, {
    id: 'support-summary', title: msgid('Support summary'),
    description: msgid('Facts read from this server for a support request. A value that could not be read is shown as not read or not verified, never assumed.'),
    actionsHtml: activityButton(t, msgctxt('whm-support-workspace', 'Read again'), { 'data-whm-support-refresh': true }, { kind: 'primary', icon: 'refresh', small: true, enabled: canRead }),
    bodyHtml: status(t, canRead ? msgid('The support summary has not been read.') : msgid('Support requires an authorized root administrator on a qualified host. Nothing was read.'), { 'data-whm-support-status': true }, canRead ? 'unread' : 'unavailable')
    + activityFactTable(t, [['panel-version', msgid('Panel version')], ['release-path', msgid('Release directory')], ['os', msgid('Operating system')], ['os-profile', msgid('OS profile')], ['uptime', msgid('Uptime')], ['node', msgid('Agent Node.js runtime')], ['observed-at', msgid('Observed at (UTC)')]], 'data-whm-support-fact'),
  })
    + activityPanel(t, { id: 'support-services', title: msgid('Services'), description: msgid('State of each service the panel manages, from systemctl.'), flush: true, bodyHtml: table(t, msgid('Services'), [msgid('Service'), msgid('Unit'), msgid('State')], { 'data-whm-support-services': true }, msgid('No services have been read.')) })
    + activityPanel(t, {
      id: 'support-config', title: msgctxt('whm-support-workspace', 'Configuration'),
      bodyHtml: activityFactTable(t, [['generation', msgid('Active generation')], ['generation-activated', msgid('Activated at (UTC)')], ['generation-checksum', msgid('File-set checksum')], ['drift', msgid('Configuration drift')]], 'data-whm-support-fact'),
      footerHtml: footerLink(msgid('Open the repair center'), '/whm/monitoring/repair', 'tools'),
    })
    + activityPanel(t, {
      id: 'support-jobs', title: msgid('Recent failed jobs'), description: msgid('The 10 most recent host jobs that failed.'), flush: true,
      bodyHtml: table(t, msgid('Recent failed jobs'), [msgid('Job'), msgid('Kind'), msgid('Failure'), msgid('Finished (UTC)'), msgctxt('whm-support-workspace', 'Error')], { 'data-whm-support-jobs': true }, msgid('No failed jobs have been read.')),
      footerHtml: footerLink(msgid('Open all jobs'), '/whm/jobs', 'activity'),
    })
    + activityPanel(t, {
      id: 'support-bundle', title: msgid('Support bundle'),
      bodyHtml: help(t, msgid('The bundle is one JSON document generated on demand. It contains only the items below, after the redaction rules below. Review the manifest, confirm, then download. Nothing is sent anywhere; you decide whom to share the file with.'))
      + activityFactTable(t, [['manifest-id', msgid('Manifest')]], 'data-whm-support-fact') + `<div class="v2-observation__charts">${list('included', msgid('Included')) + list('excluded', msgid('Never included')) + list('redaction', msgid('Redaction rules'))}</div>`
      + `<p class="v2-muted text-xs text-muted-foreground" data-whm-support-hashing>${esc(t(msgid('Hashing is described after the manifest is read.')))}</p>`
      + check(t, msgid('I reviewed this manifest. The download contains only the items it lists.'), { 'data-whm-support-confirm': true })
      + status(t, canRead ? msgid('Read the manifest before downloading.') : msgid('The support bundle is unavailable here. Nothing was generated.'), { 'data-whm-support-bundle-status': true }),
      footerHtml: activityActions(activityButton(t, msgid('Download support bundle'), { 'data-whm-support-download': true }, { kind: 'primary', icon: 'download' })),
    })
    + activityPanel(t, { id: 'support-contact', title: msgid('Contact'), bodyHtml: `<div class="v2-observation__groups gap-2.5" data-whm-support-contact>${help(t, msgid('The support contact has not been read.'))}</div>` })
  return page(input, '/whm/support', msgid('Support'), msgid('Observed support facts, a redacted diagnostics bundle you review before downloading, and the support contact the server owner configured.'), v2WhmClientTemplates('support') + body, { 'data-whm-support-workspace': true, 'data-support-can-read': String(canRead) })
}
