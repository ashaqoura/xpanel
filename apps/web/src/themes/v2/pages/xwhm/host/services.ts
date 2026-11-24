import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { statusPill } from '../../../components/status-pill.ts'
import { kpiCard } from '../../../components/kpi-card.ts'
import { renderV2HostTools } from '../server/host-tools.ts'
import { formField } from '../../../components/form-field.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { projectServiceHealthSnapshot } from '../../../../../models/theme-surface.ts'
import { hostButton, hostCard, hostContext, hostFacts, hostIcons, hostPage, hostTable, hostTile, type HostPageProps } from './common.ts'
import { renderV2WhmServiceClientTemplates, SERVICE_ACTION_ICONS, serviceTile } from './service-client-templates.ts'

const RESTART_TOOLS = ['restart-web', 'restart-mysql', 'restart-mta', 'restart-imap', 'restart-ftp', 'restart-dns']

// An area filter: a small outline button whose pressed state takes the colours of kt-btn-outline kt-btn-primary.
const AREA_CHIP = 'v2-btn kt-btn kt-btn-outline rounded-full aria-pressed:border-primary/10 aria-pressed:bg-primary/10 aria-pressed:text-primary'
const AREA_COUNT = 'kt-badge kt-badge-sm kt-badge-outline kt-badge-secondary rounded-[30px]'
// Card frames written here keep the kit card's v2 hooks beside the Metronic classes.
const PANEL = 'v2-services__panel v2-card kt-card'
// The services table runs edge to edge under the header and the area filters.
const PANEL_FLUSH = 'v2-services__panel v2-card v2-card--flush kt-card'
const PANEL_HEAD = 'v2-card__head kt-card-header'
const PANEL_TITLE = 'kt-card-title text-base font-semibold text-mono'
const PANEL_BODY = 'v2-card__body kt-card-content flex flex-col gap-6'

export const WHM_SERVICES_CSS = `
.v2-services{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-services__summary>*,.v2-services__panel{min-inline-size:0}
.v2-services__layout{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-services__layout>section{inline-size:100%;box-sizing:border-box}
.v2-services__aside{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);grid-template-rows:auto 1fr;align-items:stretch;gap:2rem;min-inline-size:0}
.v2-services__aside>:first-child{grid-row:1/span 2}
.v2-services__areas{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-services__field{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0;text-align:start}
.v2-services__facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.5rem;min-inline-size:0}
.v2-services__facts>div{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0;text-align:start}
.v2-services__facts dt{min-inline-size:0;text-box:trim-end text}
.v2-services__facts dd{min-inline-size:0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.v2-services__scroll{max-inline-size:100%}
.v2-services__table{min-inline-size:860px}
.v2-services__table :is(th,td){text-align:start;vertical-align:middle;overflow-wrap:break-word}
.v2-services__table thead th{white-space:nowrap}
.v2-services__table tbody th{padding:.75rem 1rem;background:none;font-weight:400}
.v2-services__table :is(th,td):first-child{padding-inline-start:var(--v2-panel-padding)}
.v2-services__table :is(th,td):last-child{padding-inline-end:var(--v2-panel-padding)}
.v2-services td,.v2-services [data-service-area-count],.v2-services [data-sm-area-count]{font-variant-numeric:tabular-nums}
.v2-services__tile>span{display:none}
.v2-services tr[data-service-area=web] .v2-services__tile>[data-area-icon=web],.v2-services tr[data-service-area=mail] .v2-services__tile>[data-area-icon=mail],.v2-services tr[data-service-area=data] .v2-services__tile>[data-area-icon=data],.v2-services tr[data-service-area=access] .v2-services__tile>[data-area-icon=access],.v2-services tr:not([data-service-area=web],[data-service-area=mail],[data-service-area=data],[data-service-area=access]) .v2-services__tile>[data-area-icon=""]{display:inline-flex}
.v2-services :is([data-service-select],[data-sm-select]){display:flex;flex-direction:column;align-items:flex-start;gap:.125rem;min-block-size:var(--target);padding:0;border:0;background:transparent;color:var(--mono,var(--text));text-align:start;font:inherit;cursor:pointer;transition:color 140ms ease-out}
.v2-services :is([data-service-select],[data-sm-select]):hover :is(span,bdi):first-child,.v2-services :is([data-service-select],[data-sm-select])[aria-pressed=true] :is(span,bdi):first-child{color:var(--accent)}
.v2-services tr:has([aria-pressed=true]) .v2-services__tile{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.v2-services__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-services td .v2-services__actions{flex-wrap:nowrap;gap:.5rem}
.v2-services [hidden]{display:none}
.v2-services :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.v2-services[dir=rtl] input[dir=ltr]{text-align:end}
.v2-services__field:has([type=search]){inline-size:min(100%,18rem)}
@media(prefers-reduced-motion:reduce){.v2-services :is([data-service-select],[data-sm-select]){transition:none}}
@media(max-width:1000px){.v2-services__aside{grid-template-columns:minmax(0,1fr)}.v2-services__aside>:first-child{grid-row:auto}}
@media(max-width:639px){.v2-services__facts{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-table--value-3 tr>:nth-child(2){grid-column:1;grid-row:auto;justify-self:stretch;text-align:start}.v2-table--value-3 tr>:nth-child(3){grid-column:2;grid-row:1;justify-self:end;text-align:end}.v2-services [data-phone-label]::before{content:attr(data-phone-label) " ";color:var(--muted)}.v2-services__table{min-inline-size:0;display:block}.v2-services__table>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-services__table>tbody{display:block}.v2-services tbody tr:not([hidden]){display:flex!important;flex-wrap:wrap;align-items:center;gap:0 1rem!important;padding:.75rem var(--v2-panel-padding);border-block-end:1px solid var(--line)}.v2-services tbody tr:not([hidden])::after{content:"";order:2;flex-basis:100%}.v2-services tbody tr>*{order:3;margin-block-start:.5rem;padding:0;border:0}.v2-services tbody tr>:is(:first-child,[colspan]){order:0;flex:1 1 0;margin-block-start:0}.v2-services tbody tr>:nth-child(3):not([colspan]){order:1;margin-block-start:0}.v2-services [data-service-select]{flex-flow:row wrap;align-items:baseline;gap:0 .5rem}}
`

/** One observed table and one native restart control per canonical service. */
export function renderV2WhmServices(props: HostPageProps): string {
  const { authorized } = hostContext(props, '/whm/services')
  const locale = props.locale ?? 'en'
  const raw = hostContext(props, '/whm/services').t
  const t = (copy: string) => escapeHtml(raw(copy))
  if (!authorized && !props.capabilityUnavailable) return hostPage(props, '/whm/services', raw(msgid('Services')), raw(msgid('Service versions, memory use and running status.')), '')
  const readable = authorized && props.capabilityUnavailable !== true
  const qualified = readable && RESTART_TOOLS.some(id => props.catalog?.some(tool => tool.id === id && tool.status === 'verified' && tool.delivery.status === 'verified'))
  const { observed, rows } = projectServiceHealthSnapshot(props, readable)
  const notReadText = raw(msgid('Not read'))
  const unread = notReadText
  const state = (value: string) => value === 'active' ? raw(msgid('Running')) : value === 'inactive' ? raw(msgid('Stopped')) : value === 'not-installed' ? raw(msgid('Not installed')) : notReadText
  // A checked row carries its tone; an unread or absent service is a hollow neutral badge.
  const statePill = (value: string) => statusPill({ label: state(value), tone: value === 'active' ? 'ok' : value === 'inactive' ? 'bad' : 'neutral', hollow: value !== 'active' && value !== 'inactive' })
  const memory = (value: number | null) => value === null ? notReadText : `${value} MB`
  const boot = (value: boolean | null) => value === null ? notReadText : raw(value ? msgid('Enabled') : msgid('Disabled'))
  const areas = [['', msgid('All services')], ['web', msgid('Web')], ['mail', msgid('Mail')], ['data', msgid('Data')], ['access', msgid('DNS and access')], ['unread', msgid('Not read')]] as const
  const facts = (values: readonly (readonly [string, string])[]) => `<dl class="v2-services__facts">${values.map(([key,label]) => `<div><dt class="text-sm leading-(--lh-label) font-normal text-secondary-foreground">${t(label)}</dt><dd class="text-base font-medium text-mono"><bdi dir="auto" data-host-detail="${key}">${t(msgid('Not read'))}</bdi></dd></div>`).join('')}</dl>`
  const running = observed && rows.every(row => row.state !== 'unchecked')
  const summary = `<div class="v2-services__summary v2-kpi-row">${[
    kpiCard({ label: raw(msgid('Managed services')), value: observed ? String(rows.length) : notReadText, icon: 'services' }),
    kpiCard({ label: raw(msgid('Running')), value: running ? String(rows.filter(row => row.state === 'active').length) : notReadText, icon: 'okCircle', tone: running ? 'ok' : 'neutral' }),
    kpiCard({ label: raw(msgid('Memory')), value: observed && rows.length > 0 && rows.every(row => row.rssMb !== null) ? memory(rows.reduce((sum,row) => sum + row.rssMb!,0)) : notReadText, icon: 'memory' }),
    kpiCard({ label: raw(msgid('Updated')), value: notReadText, icon: 'clock', tone: 'neutral' }),
  ].join('')}</div>`
  const tableRows = rows.map(row => `<tr data-service-snapshot data-service-row="${escapeHtml(row.label)}" data-service-key="${row.key}" data-service-label="${escapeHtml(row.label)}" data-service-unit="${escapeHtml(row.unit)}" data-service-state="${escapeHtml(state(row.state))}" data-service-area="${row.area}" data-health-role="${escapeHtml(row.role ?? '')}" data-health-version="${escapeHtml(row.version ?? '')}" data-health-memory="${escapeHtml(memory(row.rssMb))}" data-health-boot="${escapeHtml(boot(row.enabled))}"><th scope="row"><div class="flex items-center gap-2">${serviceTile}<button type="button" data-service-select aria-pressed="false" aria-controls="v2-services-details"><bdi class="text-base font-medium text-mono" dir="ltr">${escapeHtml(row.label)}</bdi><bdi class="text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground" dir="ltr">${escapeHtml(row.unit || notReadText)}</bdi></button></div></th><td class="text-base text-foreground">${escapeHtml(row.role ?? notReadText)}</td><td>${statePill(row.state)}</td><td><bdi class="text-base text-foreground" dir="ltr">${escapeHtml(row.version ?? notReadText)}</bdi></td><td class="text-base text-foreground" data-phone-label="${t(msgid('Uptime'))}">${t(msgid('Not read'))}</td><td><bdi class="text-base text-foreground" dir="ltr">${escapeHtml(memory(row.rssMb))}</bdi></td><td><div class="v2-services__actions"><button type="button" class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost" disabled>${SERVICE_ACTION_ICONS.reload}${t(msgid('Reload'))}</button><button type="button" class="v2-btn kt-btn kt-btn-outline" disabled>${SERVICE_ACTION_ICONS.restart}${t(msgid('Restart'))}</button></div></td></tr>`).join('')
  // Optional services as Metronic integration cards: tile and state on top, name and purpose, the settings link in the footer.
  const optional = hostCard('optional-services', t(msgid('Optional services')), `<p>${escapeHtml(t(msgid('Installation and activation are separate operations. Package inventory, installation progress and activation have not been read for these optional services.')))}</p><div class="v2-host__fields grid grid-cols-1 lg:grid-cols-2 gap-8">${[
    { title: 'OpenLiteSpeed', description: t(msgctxt('theme:v2', 'Alternative engine for the whole server. Installing does not switch engines.')), href: '/whm/services/web', label: t(msgid('Engine settings')), glyph: icon('server', 20) },
    { title: 'ModSecurity with OWASP CRS', description: t(msgctxt('theme:v2', 'Adds the OWASP Core Rule Set to the Nginx edge.')), href: '/whm/security/waf', label: t(msgid('WAF settings')), glyph: icon('shield', 20) },
  ].map(item => `<section class="kt-card shadow-none"><div class="kt-card-content flex flex-col gap-4 p-6"><div class="flex items-center justify-between gap-2">${hostTile(item.glyph)}${statusPill({ label: unread, tone: 'neutral', hollow: true })}</div><div class="flex flex-col gap-1.5"><h3 class="text-base font-medium text-mono">${escapeHtml(item.title)}</h3><p class="text-base text-secondary-foreground">${escapeHtml(item.description)}</p></div></div><div class="kt-card-footer justify-between items-center py-3.5"><a class="v2-btn kt-btn kt-btn-outline" href="${item.href}?lang=${props.locale ?? 'en'}">${hostIcons.gear}${escapeHtml(item.label)}</a></div></section>`).join('')}</div>`)
  const content = `<section class="v2-services" dir="${localeDirection(locale)}" data-host-services data-host-can-read="${qualified}" data-host-can-manage="${qualified}">${summary}<div class="v2-services__layout"><section class="${PANEL_FLUSH}" data-section="service-health" aria-labelledby="v2-services-heading"><div class="${PANEL_HEAD} flex-wrap gap-2 py-3"><h2 class="${PANEL_TITLE}" id="v2-services-heading">${t(msgid('Managed services'))}</h2><div class="v2-services__field"><label class="v2-sr" for="v2-service-search">${t(msgid('Search service units'))}</label><span class="kt-input max-[959px]:text-base">${icon('search', 16)}<input id="v2-service-search" type="search" dir="ltr" data-host-service-search maxlength="192" autocomplete="off" spellcheck="false" placeholder="${t(msgid('Search service units'))}"></span></div></div><div class="v2-services__areas border-b border-border px-6 py-3 max-[600px]:px-4" role="group" aria-label="${t(msgid('Area'))}">${areas.map(([key,label]) => `<button type="button" class="${AREA_CHIP}" data-service-area="${key}" aria-pressed="${key === ''}">${t(label)} <span class="${AREA_COUNT}" data-service-area-count="${key}">${rows.filter(row => !key || row.area === key).length}</span></button>`).join('')}</div><div class="v2-services__scroll kt-card-table kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${t(msgid('Managed services'))}"><table class="v2-services__table v2-table--value-3 kt-table"><caption class="v2-sr">${t(msgid('Managed services'))}</caption><thead><tr>${[msgid('Service'),msgid('Role'),msgid('Status'),msgid('Version'),msgid('Uptime'),msgid('Memory'),msgid('Actions')].map(label => `<th scope="col">${t(label)}</th>`).join('')}</tr></thead><tbody data-host-service-rows>${tableRows}<tr data-service-filter-empty${rows.length ? ' hidden' : ''}><td class="text-base text-secondary-foreground" colspan="7">${t(observed ? msgid('No services match these filters.') : msgid('Service state has not been read.'))}</td></tr></tbody></table></div><div class="v2-card__foot kt-card-footer flex-col items-stretch gap-2"><p class="text-base text-secondary-foreground" data-host-service-status role="status">${t(observed ? msgid('Service state read from this host.') : msgid('Service state has not been read.'))}</p><p class="text-base text-secondary-foreground" data-capability-unavailable="${!qualified}">${t(msgid('Choose Restart beside a managed service to review its name and confirm before the request is sent. Cancel leaves its current state unchanged. A restart can interrupt every account using that service; a successful request alone does not prove that application connections recovered.'))}</p><p class="text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground">${t(msgid('The connected service action is restart. A separate reload endpoint is not connected, so reload is unavailable here. Optional installation never appears as a completed restart.'))}</p></div></section><aside class="v2-services__aside" id="v2-services-details" data-host-service-details aria-label="${t(msgid('Details'))}"><section class="${PANEL}"><div class="${PANEL_HEAD}"><h2 class="${PANEL_TITLE}">${t(msgid('Details'))}</h2></div><div class="${PANEL_BODY}"><div class="flex items-center gap-2">${hostTile(icon('services', 18))}<h3 class="text-base font-medium text-mono" data-host-detail="name">${t(msgid('No service is selected.'))}</h3></div>${facts([['unit',msgid('Unit')],['role',msgid('Role')],['state',msgid('Status')],['version',msgid('Version')],['uptime',msgid('Uptime')],['memory',msgid('Memory')],['boot',msgid('Start at boot')],['test',msgid('Configuration test')]])}<div class="flex flex-col gap-2 border-t border-border pt-6"><h3 class="text-base font-semibold text-mono">${t(msgid('Restart confirmation'))}</h3><p class="text-base text-secondary-foreground">${t(msgid('Choose Restart beside a managed service to review its name and confirm before the request is sent. Cancel leaves its current state unchanged. A restart can interrupt every account using that service; a successful request alone does not prove that application connections recovered.'))}</p></div></div></section><section class="${PANEL}"><div class="${PANEL_HEAD}"><h3 class="${PANEL_TITLE}">${t(msgctxt('theme:v2', 'Dependencies'))}</h3></div><div class="${PANEL_BODY}"><p class="text-base text-secondary-foreground" role="status">${t(msgid('Not read'))}</p></div></section><section class="${PANEL}"><div class="${PANEL_HEAD}"><h3 class="${PANEL_TITLE}">${t(msgid('Logs'))}</h3></div><div class="${PANEL_BODY}"><p class="text-base text-secondary-foreground" role="status">${t(msgid('Not read'))}</p></div><div class="v2-card__foot kt-card-footer justify-end"><a class="v2-btn kt-btn kt-btn-outline" href="/whm/monitoring/logs?lang=${locale}">${hostIcons.logs}${t(msgid('Logs'))}</a></div></section></aside></div>${renderV2WhmServiceClientTemplates('host', locale)}</section>`
  return hostPage(props, '/whm/services', raw(msgid('Services')), raw(msgid('Service versions, memory use and running status.')), content + optional, { 'data-approved-whm-operations': '/whm/services', 'data-operation-state': qualified ? 'qualified' : 'unavailable' })
}

/** Auxiliary host jobs retain their own admission flags and read-back lifecycle. */
export function renderV2WhmServiceManager(props: HostPageProps): string {
  const route = '/whm/services/more'
  const { t, readable } = hostContext(props, route)
  const fact = (key: string, label: string) => ({ label: t(label), valueHtml: escapeHtml(t(msgid('Not read'))), hooks: { 'data-sm-fact': key } })
  const areas = [['', msgid('All services')], ['web', msgid('Web')], ['mail', msgid('Mail')], ['data', msgid('Data')], ['access', msgid('DNS and access')], ['unread', msgid('Not read')]] as const
  const manager = hostCard('service-manager', t(msgid('Service manager')), `<p>${escapeHtml(t(msgctxt('theme:v2', 'Actions run as host jobs; the job must read back the result before it can confirm success.')))}</p>
<p data-sm-status data-state="unread" role="status">${escapeHtml(t(msgid('Service state has not been read.')))}</p><p data-sm-result role="status" hidden></p>
<p data-sm-job hidden><a class="kt-link" href="/whm/jobs" data-sm-job-link>${escapeHtml(t(msgid('Review host jobs')))}</a></p>
${hostFacts([fact('services', msgid('Observed services')), fact('active', msgid('Active services')), fact('boot-time', msgid('Server boot time (UTC)')), fact('observed-at', msgid('Observed at (UTC)'))])}
<div class="v2-host__fields">${formField({ id: 'v2-sm-search', label: t(msgid('Search service units')), control: { kind: 'input', type: 'search', disabled: true, mono: true, dir: 'ltr', hooks: { 'data-sm-search': true } } })}
${formField({ id: 'v2-sm-state', label: t(msgid('Service state')), control: { kind: 'select', disabled: true, hooks: { 'data-sm-filter': true }, options: [{ value: '', label: t(msgid('All services')) }, { value: 'active', label: t(msgid('Active')) }, { value: 'attention', label: t(msgid('Needs attention')) }, { value: 'editable', label: t(msgid('Editable boot items')) }] } })}</div>
<div class="v2-services__areas" role="group" aria-label="${escapeHtml(t(msgid('Area')))}">${areas.map(([key, label]) => `<button type="button" class="${AREA_CHIP}" data-sm-area="${key}" aria-pressed="${key === ''}">${escapeHtml(t(label))} <span class="${AREA_COUNT}" data-sm-area-count="${key}">${escapeHtml(t(msgid('Not read')))}</span></button>`).join('')}</div>
${hostTable(t, 'managed-units', t(msgid('Observed service units')), [t(msgid('Service unit')), t(msgid('Load state')), t(msgid('Active state')), t(msgid('Substate')), t(msgid('Start at boot')), t(msgid('Actions'))], [], t(msgid('No services have been read.')), { 'data-sm-rows': true }, 3)}
<p>${escapeHtml(t(msgctxt('theme:v2', 'Only reviewed auxiliary units allow boot changes. Panel, SSH, networking, web, database, mail and DNS services stay protected.')))}</p>`, undefined,
  hostButton(t(msgid('Read service state')), { 'data-sm-refresh': true }, { disabled: true, icon: 'refresh' }))
  const detail = (key: string, label: string) => ({ label: t(label), valueHtml: `<bdi dir="auto" data-sm-detail="${key}">${escapeHtml(t(msgid('Not read')))}</bdi>` })
  const reboot = hostCard('service-reboot', t(msgid('Reboot server')), `<p>${escapeHtml(t(msgctxt('theme:v2', 'A reboot disconnects active sessions and stops hosted services temporarily. After reconnecting, read the server boot time to confirm that it changed.')))}</p>
<div class="v2-host__field v2-field kt-form-item"><label class="kt-form-label" for="v2-sm-confirm">${escapeHtml(t(msgid('Type the confirmation phrase')))}: <bdi dir="ltr">REBOOT SERVER</bdi></label><input id="v2-sm-confirm" class="kt-input" type="text" dir="ltr" autocomplete="off" spellcheck="false" maxlength="13" data-sm-confirm disabled></div>
<div class="v2-host__actions justify-end">${hostButton(t(msgid('Submit reboot job')), { 'data-sm-reboot': true }, { danger: true, disabled: true, icon: 'power' })}</div>`)
  return hostPage(props, route, t(msgid('Service manager & watchdog')), t(msgctxt('theme:v2', 'Review observed system services and their start-at-boot state.')), `<div class="v2-services">${manager}<div class="v2-host__pair grid-cols-1 lg:grid-cols-2"><section class="${PANEL}" id="v2-sm-details" data-sm-details aria-labelledby="v2-sm-details-heading"><div class="${PANEL_HEAD}"><h2 class="${PANEL_TITLE}" id="v2-sm-details-heading">${escapeHtml(t(msgid('Details')))}</h2></div><div class="${PANEL_BODY}">${hostFacts([detail('unit', msgid('Service unit')), detail('load', msgid('Load state')), detail('active', msgid('Active state')), detail('sub', msgid('Substate')), detail('boot', msgid('Start at boot')), detail('observed', msgid('Observed at (UTC)'))])}</div></section>${reboot}</div>${renderV2WhmServiceClientTemplates('manager', props.locale)}</div>${readable ? renderV2HostTools(t, ['daemon-profile', 'daemons', 'watchdog'], readable) : ''}`,
    { 'data-whm-service-manager': true, 'data-sm-can-read': String(readable), 'data-sm-can-manage': String(readable) })
}
