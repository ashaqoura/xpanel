import { renderV2WhmHome } from '../accounts/admin.ts'
import { canOpenRegisteredRoute } from '@xpanel/catalog'
import type { Translate } from '../../../../../i18n.ts'
import { auditActionLabel, auditActorLabel, auditOutcomeLabel, auditTargetLabel } from '../../../../../audit-labels.ts'
import { formatDisplayDateTime } from '../../../../../display-format.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { lineChart, type LineSeries } from '../../../components/chart.ts'
import { kpiCard, type KpiCardProps } from '../../../components/kpi-card.ts'
import { notice } from '../../../components/notice.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { emptyState } from '../../../components/state-block.ts'
import { statusPill } from '../../../components/status-pill.ts'
import { factList } from '../../../layouts/common.ts'
import { escapeHtml, type Tone } from '../../../html.ts'
import { ki } from '../monitoring/common.ts'

const finite = (value: number | undefined): value is number => value !== undefined && Number.isFinite(value) && value >= 0
const integer = (value: number | undefined): value is number => finite(value) && Number.isSafeInteger(value)
const number = (value: number): string => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
const bytes = (value: number): string => `${number(value / 1024 ** 3)} GiB`
const ltr = (value: string): string => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`
/** A card header toolbar link, as the Metronic dashboard cards carry. */
const toolbarLink = (href: string, label: string): string => `<a class="kt-link kt-link-underlined kt-link-dashed" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
/** A card footer link, centered as in the Metronic cards. */
const footerLink = (href: string, label: string): string => `<a class="kt-link kt-link-underlined kt-link-dashed mx-auto" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`

/** A presentation of the supplied host sample. An absent observation is never a healthy zero. */
function resources(t: Translate, props: WhmSurfaceProps): string {
  const host = props.hostSample
  const missing = t('Not read')
  const cpu = finite(host?.load1) && integer(host?.cores) && host.cores > 0
    ? { value: number(host.load1), note: t(msgctxt('theme:v2', 'Load {load} on {cores} cores'), { load: number(host.load1), cores: host.cores }) }
    : { value: '—', note: missing }
  const memory = host?.memory
  const validMemory = memory && finite(memory.totalBytes) && memory.totalBytes > 0 && finite(memory.availableBytes) && memory.availableBytes <= memory.totalBytes
  const disk = host?.disk
  const validDisk = disk && finite(disk.totalBytes) && disk.totalBytes > 0 && finite(disk.usedBytes) && disk.usedBytes <= disk.totalBytes
  const inodes = host?.inodes
  const validInodes = inodes && integer(inodes.total) && inodes.total > 0 && integer(inodes.used) && inodes.used <= inodes.total
  const items: KpiCardProps[] = [
    { label: t(msgctxt('theme:v2', 'CPU load')), icon: 'cpu', value: cpu.value, note: cpu.note },
    { label: t('Memory'), icon: 'memory', value: validMemory ? bytes(memory.totalBytes - memory.availableBytes) : '—',
      ...(validMemory ? { unit: `/ ${bytes(memory.totalBytes)}`, meter: { percent: 100 * (memory.totalBytes - memory.availableBytes) / memory.totalBytes } } : {}),
      note: validMemory ? t(msgctxt('theme:v2', '{value} available'), { value: bytes(memory.availableBytes) }) : missing },
    { label: disk ? t('Disk on {mount}', { mount: disk.mount }) : t('Disk'), icon: 'disk', value: validDisk ? bytes(disk.usedBytes) : '—',
      ...(validDisk ? { unit: `/ ${bytes(disk.totalBytes)}`, meter: { percent: 100 * disk.usedBytes / disk.totalBytes } } : { note: missing }) },
    { label: inodes ? t('Inodes on {mount}', { mount: inodes.mount }) : t(msgctxt('theme:v2', 'Inodes')), icon: 'files', value: validInodes ? number(inodes.used) : '—',
      ...(validInodes ? { unit: `/ ${number(inodes.total)}`, meter: { percent: 100 * inodes.used / inodes.total } } : { note: missing }) },
  ]
  return `<section class="v2-kpi-row grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5" aria-label="${escapeHtml(t('Server resources'))}">${items.map(item => kpiCard({ ...item, headingLevel: 2 })).join('')}</section>`
}

/** Stored samples at their bucket positions; missing intervals leave gaps, and the description says how many were read. */
function history(t: Translate, props: WhmSurfaceProps): string {
  const data = props.performanceHistory
  const sample = (value: number | null | undefined): value is number => value !== null && value !== undefined && Number.isFinite(value) && value >= 0
  const totalBytes = props.hostSample?.memory?.totalBytes
  const totalMb = finite(totalBytes) && totalBytes > 0 ? totalBytes / 1024 ** 2 : undefined
  const count = data ? Math.max(data.cpuPercent.length, totalMb === undefined ? 0 : data.memoryMb.length) : 0
  const cpuBuckets = Array.from({ length: count }, (_, index) => {
    const value = data?.cpuPercent[index]
    return sample(value) ? value : null
  })
  const memoryBuckets = totalMb === undefined ? [] : Array.from({ length: count }, (_, index) => {
    const value = data?.memoryMb[index]
    return sample(value) ? 100 * value / totalMb : null
  })
  const cpu = cpuBuckets.filter(sample)
  const memory = memoryBuckets.filter(sample)
  const peak = (values: readonly number[]): string => `${number(Math.max(...values))}%`
  const series: LineSeries[] = [
    ...(count > 1 && cpu.length > 0 ? [{ label: t(msgctxt('theme:v2', 'CPU, peak {value}'), { value: peak(cpu) }), values: cpuBuckets }] : []),
    ...(count > 1 && memory.length > 0 ? [{ label: t(msgctxt('theme:v2', 'Memory, peak {value}'), { value: peak(memory) }), values: memoryBuckets, dashed: true }] : []),
  ]
  const link = canOpenRegisteredRoute('/whm/monitoring/performance', props.visibility)
  const toolbar = link ? toolbarLink('/whm/monitoring/performance', t('Performance history')) : undefined
  if (!data || !series.length) return card({ title: t(msgctxt('theme:v2', 'CPU and memory, last 24 hours')), titleId: 'v2-whm-history', actionsHtml: toolbar,
    bodyHtml: `<div class="v2-whm-overview__chart grow flex flex-col items-center justify-center gap-2.5 min-h-52 p-5 rounded-xl border border-dashed border-input text-sm text-secondary-foreground text-center" role="status">${ki('ki-chart-line', 'text-3xl text-muted-foreground')}<span>${escapeHtml(t('Performance history has not been read.'))}</span></div>`,
  })
  const sampled = Array.from({ length: count }, (_, index) => cpuBuckets[index] !== null || (memoryBuckets[index] ?? null) !== null).filter(Boolean).length
  const top = Math.max(100, Math.ceil(Math.max(...cpu, ...memory)))
  const from = formatDisplayDateTime(data.from), to = formatDisplayDateTime(data.to)
  return card({ title: t(msgctxt('theme:v2', 'CPU and memory, last 24 hours')), titleId: 'v2-whm-history',
    description: t(msgctxt('theme:v2', '15-minute averages, times in UTC. {read} of {total} intervals have samples.'), { read: sampled, total: count }),
    bodyHtml: lineChart({ label: t(msgctxt('theme:v2', 'CPU and memory use from {from} to {to} UTC'), { from, to }), series, max: top,
      yTicks: [1, 0.75, 0.5, 0.25, 0].map(part => `${number(top * part)}%`), xTicks: [from, to] }),
    actionsHtml: toolbar,
  })
}

/** Metronic stat tile: the value leads and its label sits under it, inside a dashed frame. */
const TILE = 'flex flex-col-reverse justify-end gap-2 min-w-0 rounded-md border border-dashed border-input px-3.5 py-3'
const tile = (label: string, value: string, options: { href?: string; warn?: boolean } = {}): string => {
  const body = `<span class="text-xs text-secondary-foreground">${escapeHtml(label)}</span><strong class="v2-num text-2xl leading-none font-semibold ${options.warn ? 'text-yellow-500' : 'text-mono'}"${options.warn ? ' data-tone="warn"' : ''}>${ltr(value)}</strong>`
  return options.href ? `<a class="v2-whm-overview__tile ${TILE} hover:border-primary hover:bg-accent/50" href="${escapeHtml(options.href)}">${body}</a>` : `<div class="v2-whm-overview__tile ${TILE}">${body}</div>`
}

function reconciler(t: Translate, props: WhmSurfaceProps): string {
  const gen = integer(props.generationId) && props.generationId > 0 ? props.generationId : undefined
  const knownDrift = integer(props.driftCount ?? undefined)
  const inSync = knownDrift && props.driftCount === 0 && gen !== undefined
  const check = (value: { ok: boolean; at: string } | undefined): string => value ? t(value.ok ? 'Passed' : 'Failed') : t('Not read')
  const rows: { label: string; value: string; glyph: string; mono?: boolean }[] = [
    { label: 'nginx -t', value: check(props.hostSample?.nginxTest), glyph: 'ki-code', mono: true },
    { label: 'apachectl configtest', value: check(props.hostSample?.apacheTest), glyph: 'ki-code', mono: true },
    { label: t('Rollback target'), value: integer(props.rollbackGenerationId) ? String(props.rollbackGenerationId) : t('Not read'), glyph: 'ki-arrow-circle-left' },
    { label: t(msgctxt('theme:v2', 'Last drift check')), value: props.driftCheckedAt ? formatDisplayDateTime(props.driftCheckedAt) : t('Not read'), glyph: 'ki-time' },
  ]
  const state = !knownDrift ? { tone: 'neutral' as const, label: t('Not read') }
    : inSync ? { tone: 'ok' as const, label: t('In sync') }
      : { tone: 'warn' as const, label: t('Review required') }
  // "Desired = applied" is stated only for a read drift count of zero; otherwise the tile names the generation alone.
  const generation = inSync ? tile(t(msgctxt('theme:v2', 'Desired = applied')), `${gen} = ${gen}`) : tile(t('Active generation'), gen === undefined ? '\u2014' : String(gen))
  return card({ title: t('Reconciler'), titleId: 'v2-whm-reconciler', actionsHtml: statusPill(state),
    bodyHtml: `<p class="v2-muted text-sm text-secondary-foreground">${escapeHtml(t(msgctxt('theme:v2', 'Changes are applied as tested configuration generations.')))}</p><div class="v2-whm-overview__tiles grid grid-cols-2 gap-2.5">${generation}${tile(t('Drift'), knownDrift ? String(props.driftCount) : '\u2014', { warn: knownDrift && props.driftCount !== 0 })}</div><dl class="v2-whm-overview__rows grid gap-3 pt-5 border-t border-input">${rows.map(row => `<div class="flex items-center justify-between flex-wrap gap-2"><dt class="flex items-center gap-1.5 text-sm font-normal text-mono">${ki(row.glyph, 'text-base text-muted-foreground')}${row.mono ? `<span class="v2-mono">${ltr(row.label)}</span>` : escapeHtml(row.label)}</dt><dd class="v2-num text-sm font-medium text-foreground text-end">${ltr(row.value)}</dd></div>`).join('')}</dl><p class="v2-muted v2-whm-overview__reconciler-note mt-auto text-xs text-muted-foreground" role="status">${escapeHtml(knownDrift ? t(msgctxt('theme:v2', 'This is the last supplied observation.')) : t(msgctxt('theme:v2', 'The applied state has not been read.')))}</p>`,
    footerHtml: canOpenRegisteredRoute('/whm/audit', props.visibility) ? footerLink('/whm/audit', t(msgctxt('theme:v2', 'View generations'))) : undefined,
  })
}

/** Counts come from the accounts this caller may list; an unread list shows a dash, never a zero. */
function accountsCard(t: Translate, props: WhmSurfaceProps): string {
  const accounts = props.accounts
  const count = (status: 'active' | 'suspended'): string => accounts ? String(accounts.filter(account => account.status === status).length) : '\u2014'
  const root = (props.visibility?.principal ?? props.principal)?.kind === 'root'
  const resellers = root && canOpenRegisteredRoute('/whm/resellers', props.visibility)
    ? tile(t('Resellers'), props.resellers ? String(props.resellers.length) : '\u2014', { href: '/whm/resellers' }) : ''
  const total = accounts ? `<p class="v2-muted text-sm text-secondary-foreground">${escapeHtml(t(msgctxt('theme:v2', '{count, plural, one {# account in total.} other {# accounts in total.}}'), { count: accounts.length }))}${root ? ' ' + escapeHtml(t(msgctxt('theme:v2', 'Resellers see only the accounts they own.'))) : ''}</p>` : ''
  const near = props.nearLimits
  const attention = near?.length
    ? `<ul class="v2-whm-overview__attention grid gap-2.5">${near.map(item => `<li class="flex flex-wrap items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5 text-sm"><span class="flex items-center justify-center shrink-0 size-8 rounded-full bg-yellow-500/10 text-yellow-500" aria-hidden="true">${ki('ki-information-2', 'text-base')}</span><span class="flex flex-col gap-0.5 grow basis-48 min-w-0"><strong class="v2-mono text-sm font-medium text-mono">${ltr(item.name)}</strong><span class="text-xs text-secondary-foreground">${escapeHtml(item.note)}</span></span><a class="v2-btn kt-btn kt-btn-outline kt-btn-sm" href="/whm/accounts" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Review {account}'), { account: item.name }))}">${escapeHtml(t('Review'))}</a></li>`).join('')}</ul>`
    : `<p class="v2-muted text-sm text-secondary-foreground" role="status">${escapeHtml(near === undefined ? t(msgctxt('theme:v2', 'Account usage has not been read.')) : t(msgctxt('theme:v2', 'No accounts are near a limit in the supplied observation.')))}</p>`
  const suspended = count('suspended')
  return card({ title: t('Accounts'), titleId: 'v2-whm-accounts', actionsHtml: toolbarLink('/whm/accounts', t('View accounts')),
    bodyHtml: `<div class="v2-whm-overview__tiles v2-whm-overview__tiles--auto grid gap-2.5">${tile(t('Active'), count('active'), { href: '/whm/accounts' })}${tile(t('Suspended'), suspended, { href: '/whm/accounts', warn: suspended !== '0' && suspended !== '\u2014' })}${resellers}</div>${total}<h3 class="v2-whm-overview__sub text-sm font-semibold text-mono">${escapeHtml(t(msgctxt('theme:v2', 'Need attention')))}</h3>${attention}`,
  })
}

/** The Keenicon of a well-known service; any other service takes the server rows glyph. */
const SERVICE_GLYPHS: Readonly<Record<string, string>> = {
  nginx: 'ki-compass', apache: 'ki-compass', 'php-fpm': 'ki-code', mariadb: 'ki-data', mysql: 'ki-data', postgresql: 'ki-data', redis: 'ki-flash-circle',
  dovecot: 'ki-directbox-default', postfix: 'ki-sms', exim: 'ki-sms', pdns: 'ki-route', nftables: 'ki-shield-tick', fail2ban: 'ki-shield-cross', 'pure-ftpd': 'ki-folder-up', sshd: 'ki-key',
}

function services(t: Translate, props: WhmSurfaceProps): string {
  const rows = props.services?.map(service => {
    const tone: Tone = service.checked === false || service.installed === false ? 'neutral' : service.active ? 'ok' : 'bad'
    const state = service.checked === false ? t('Not checked') : service.installed === false ? t('Not installed') : service.active ? t('Running') : t('Stopped')
    return `<li class="v2-whm-overview__service flex items-center justify-between flex-wrap gap-2.5"><span class="flex items-center gap-2.5 min-w-0"><span class="flex items-center justify-center shrink-0 size-9 rounded-full border border-input bg-accent/60 text-secondary-foreground" aria-hidden="true">${ki(SERVICE_GLYPHS[service.name] ?? 'ki-row-horizontal', 'text-base')}</span><span class="flex flex-col gap-0.5 min-w-0"><strong class="text-sm font-medium text-mono">${ltr(service.name)}</strong><span class="v2-mono v2-muted text-xs text-secondary-foreground">${ltr(service.version)}</span></span></span>${statusPill({ tone, label: state })}</li>`
  })
  return card({ title: t('Services'), titleId: 'v2-whm-services', flush: true,
    actionsHtml: canOpenRegisteredRoute('/whm/services', props.visibility) ? toolbarLink('/whm/services', t('Manage services')) : undefined,
    bodyHtml: rows?.length ? `<ul class="v2-whm-overview__services flex flex-col">${rows.join('')}</ul>` : `<p class="v2-inset text-sm text-secondary-foreground" role="status">${escapeHtml(props.services === undefined ? t(msgctxt('theme:v2', 'Service status has not been read.')) : t('No services were reported.'))}</p>`,
  })
}

function hostFacts(t: Translate, props: WhmSurfaceProps): string {
  const sample = props.hostSample
  const missing = t('Not read')
  return card({ title: t(msgctxt('theme:v2', 'Host facts')), titleId: 'v2-whm-host-facts', bodyHtml: factList([
    { label: t('Host'), value: sample?.hostname || props.hostname || missing, mono: true },
    { label: t('System'), value: sample?.system || missing },
    { label: t('Kernel'), value: sample?.kernel || missing, mono: true },
    { label: t('Uptime'), value: finite(sample?.uptimeSeconds) ? t('{days} d {hours} h', { days: Math.floor(sample.uptimeSeconds / 86400), hours: Math.floor(sample.uptimeSeconds % 86400 / 3600) }) : missing },
    { label: t('CPU'), value: sample?.cpuModel || missing },
    { label: t('Engine'), value: sample?.engine || missing, mono: true },
    { label: 'xPanel', value: sample?.panelVersion || props.version || missing, mono: true },
  ]) })
}

function auditEvents(t: Translate, props: WhmSurfaceProps): string {
  // A Metronic activity timeline: each event is a marker on a rail, its sentence, its time and its outcome. The
  // column names of the former table stay as hidden labels, so every part is still named for assistive technology.
  const name = (label: string): string => `<span class="v2-sr">${escapeHtml(label)}: </span>`
  const entries = props.auditEntries?.slice(0, 8)
  const rows = entries?.map((entry, index) => {
    const clock = formatDisplayDateTime(entry.at)
    const time = clock === '—' ? clock : `<time datetime="${escapeHtml(entry.at)}">${ltr(clock)}</time>`
    const actor = auditActorLabel(entry.actor)
    const target = auditTargetLabel(entry.target, t.locale)
    const tone: Tone = entry.outcome === 'ok' ? 'ok' : entry.outcome === 'denied' ? 'warn' : 'bad'
    const last = index === entries.length - 1
    return `<li class="flex items-start relative">${last ? '' : '<span class="w-9 start-0 top-9 absolute bottom-0 rtl:-translate-x-1/2 translate-x-1/2 border-s border-s-input" aria-hidden="true"></span>'}<span class="flex items-center justify-center shrink-0 rounded-full bg-accent/60 border border-input size-9 text-secondary-foreground" aria-hidden="true">${ki(AUDIT_GLYPHS[tone], 'text-base')}</span><div class="${last ? 'flex flex-wrap items-start justify-between gap-2.5 grow min-w-0 ps-2.5' : 'flex flex-wrap items-start justify-between gap-2.5 grow min-w-0 ps-2.5 mb-7'}"><div class="flex flex-col gap-0.5 min-w-0"><div class="text-sm text-foreground">${name(t(msgctxt('xwhm', 'Action')))}${escapeHtml(auditActionLabel(entry.action, t.locale, entry))}${target ? ` ${name(t('Target'))}<span class="font-medium text-mono">${ltr(target)}</span>` : ''}</div><div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-secondary-foreground"><span>${name(t('Time'))}${time}</span>${actor ? `<span class="inline-flex items-center gap-1">${ki('ki-user', 'text-xs text-muted-foreground')}${name(t('Actor'))}${ltr(actor)}</span>` : ''}</div></div><span>${name(t('Result'))}${statusPill({ tone, label: auditOutcomeLabel(entry.action, entry.outcome, t.locale) })}</span></div></li>`
  })
  const bodyHtml = rows === undefined ? `<p class="text-sm text-secondary-foreground" role="status">${escapeHtml(t('Not read'))}</p>`
    : rows.length ? `<ol class="v2-whm-overview__timeline flex flex-col" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Recent audit events')))}">${rows.join('')}</ol>`
      : `<div class="flex flex-col items-center gap-2.5 py-5 text-sm text-secondary-foreground text-center" role="status">${ki('ki-shield-search', 'text-3xl text-muted-foreground')}<span>${escapeHtml(t('No audit entries yet'))}</span></div>`
  return card({ title: t(msgctxt('theme:v2', 'Recent audit events')), titleId: 'v2-whm-recent-audit', bodyHtml, actionsHtml: toolbarLink('/whm/audit', t('Audit log')) })
}

/** The timeline marker of an outcome; the outcome itself is named by the badge beside the event. */
const AUDIT_GLYPHS: Readonly<Record<Tone, string>> = { ok: 'ki-check-circle', warn: 'ki-shield-cross', bad: 'ki-cross-circle', info: 'ki-information-2', neutral: 'ki-information-2' }

function certificateRenewalStrip(t: Translate, props: WhmSurfaceProps, canOpenTls: boolean): string {
  const certs = props.certificates
  const autoSsl = props.autoSsl
  if (certs === undefined && autoSsl === undefined) return ''
  const nowMs = Date.now()
  const windowMs = 30 * 86_400_000
  const seen = new Set<string>()
  let healthy = 0
  let expiringSoon = 0
  let expired = 0
  for (const cert of certs ?? []) {
    const key = `${[...cert.names].sort().join(',')}|${cert.notAfter}`
    if (seen.has(key)) continue
    seen.add(key)
    const exp = Date.parse(cert.notAfter)
    if (!Number.isFinite(exp)) continue
    if (exp <= nowMs) expired++
    else if (exp - nowMs <= windowMs) expiringSoon++
    else healthy++
  }
  const tone: Tone = expired > 0 ? 'bad' : expiringSoon > 0 ? 'warn' : certs !== undefined ? 'ok' : 'info'
  const lead = certs === undefined
    ? t(msgid('TLS certificate renewal'))
    : expired > 0 || expiringSoon > 0
      ? t(msgid('{expiring} expiring within 30 days · {healthy} healthy'), { expiring: expired + expiringSoon, healthy })
      : t(msgid('{healthy} TLS certificates healthy (0 expiring within 30 days)'), { healthy })
  const nextRun = autoSsl?.nextRunAt ? formatDisplayDateTime(autoSsl.nextRunAt) : '—'
  const text = autoSsl?.state === 'active' && nextRun !== '—'
    ? t(msgid('Next AutoSSL renewal check: {at}'), { at: nextRun })
    : autoSsl?.state === 'disabled'
      ? t(msgid('AutoSSL automatic renewal is disabled.'))
      : t(msgid('AutoSSL renewal schedule has not been verified on this host.'))
  return `<div data-cert-renewal-strip>${notice(t, {
    tone,
    lead,
    text,
    ...(canOpenTls ? { action: { label: t('SSL/TLS'), href: '/whm/tls' } } : {}),
  })}</div>`
}

/** Body renderer; the surface owner supplies the v2 shell and core document slots once. */
export function renderV2WhmOverview(t: Translate, props: WhmSurfaceProps): string {
  const principal = props.visibility?.principal ?? props.principal
  if (!principal || principal.kind === 'user' || props.capabilityUnavailable) return notice(t, { tone: 'warn', lead: t('Unavailable'), text: t(msgctxt('theme:v2', 'The server overview is unavailable for this caller.')) })
  const open = (route: string): boolean => canOpenRegisteredRoute(route, props.visibility)
  const actions = `${open('/whm/audit') ? `<a class="v2-btn kt-btn kt-btn-outline" href="/whm/audit">${ki('ki-shield-search')}${escapeHtml(t('Audit log'))}</a>` : ''}${open('/whm/accounts/new') ? `<a class="v2-btn v2-btn--primary kt-btn kt-btn-primary" href="/whm/accounts/new">${ki('ki-plus')}${escapeHtml(t('Create account'))}</a>` : ''}`
  const upgrade = principal.kind === 'root' && props.availableVersion && props.version && props.availableVersion !== props.version
    ? notice(t, { tone: 'info', lead: t(msgctxt('theme:v2', 'Upgrade {version} is available.'), { version: props.availableVersion }),
      text: t(msgctxt('theme:v2', 'This server runs {version}.'), { version: props.version }),
      ...(open('/whm/server/upgrade') ? { action: { label: t('Review the upgrade'), href: '/whm/server/upgrade' } } : {}) }) : ''
  const certStrip = principal.kind === 'root' ? certificateRenewalStrip(t, props, open('/whm/tls')) : ''
  const jobs = card({ title: t(msgctxt('theme:v2', 'Background jobs')), titleId: 'v2-whm-background-jobs',
    bodyHtml: `<div class="v2-whm-overview__unread" role="status">${emptyState({ icon: 'clock', title: t('Not read'), text: t(msgctxt('theme:v2', 'Background jobs have not been read.')),
      ...(open('/whm/jobs') ? { actionHtml: `<a class="v2-btn kt-btn kt-btn-outline kt-btn-sm" href="/whm/jobs">${ki('ki-time')}${escapeHtml(t(msgctxt('theme:v2', 'View jobs')))}</a>` } : {}) })}</div>`,
  })
  const audit = open('/whm/audit') ? auditEvents(t, props) : ''
  return `<div class="v2-layout v2-whm-overview flex flex-col gap-5 lg:gap-7.5" data-whm-overview>${pageHeader(t, { breadcrumb: [{ label: t('Home') }, { label: t('Dashboard') }], route: '/whm', title: t('Server dashboard'), description: t(msgctxt('theme:v2', 'The reconciler, accounts, resources and services.')), actionsHtml: actions })}${upgrade}${certStrip}${resources(t, props)}<div class="v2-whm-overview__primary grid gap-5 lg:gap-7.5 items-stretch">${history(t, props)}${reconciler(t, props)}</div><div class="v2-whm-overview__secondary grid gap-5 lg:gap-7.5 items-stretch">${open('/whm/services') ? services(t, props) : ''}<div class="v2-stack flex flex-col gap-5 lg:gap-7.5 min-w-0">${open('/whm/accounts') ? accountsCard(t, props) : ''}${jobs}</div></div>${renderV2WhmHome(t)}${hostFacts(t, props)}${audit}</div>`
}

/** Structure only: Metronic classes in the markup supply surfaces, type and spacing. The favourites and inbox cards
 * (accounts/admin.ts) reuse the two-column row and the separated list, so their geometry stays here. */
export const WHM_OVERVIEW_CSS = `.v2-whm-overview :is(.v2-chart__x,.v2-chart__y),.v2-whm-overview [data-cert-renewal-strip],.v2-whm-overview__timeline time,.v2-whm-overview #v2-whm-host-facts dd{font-variant-numeric:tabular-nums}
.v2-whm-overview__primary,.v2-whm-overview__secondary{display:grid;gap:1.25rem;align-items:stretch;min-inline-size:0}
.v2-whm-overview__primary{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.v2-whm-overview__secondary{grid-template-columns:repeat(2,minmax(0,1fr))}
.v2-whm-overview__primary>.v2-card>.v2-card__body,.v2-whm-overview__secondary>.v2-card>.v2-card__body{flex:1 1 auto}
.v2-whm-overview__secondary>.v2-stack>.v2-card:last-child{flex:1 1 auto}
.v2-whm-overview__secondary>.v2-stack>.v2-card:last-child>.v2-card__body{flex:1 1 auto;justify-content:center}
.v2-whm-overview__tiles--auto{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}
.v2-whm-overview__tile{text-decoration:none;overflow-wrap:anywhere;transition:background-color 140ms ease-out,border-color 140ms ease-out}
.v2-whm-overview__services{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.v2-whm-overview__services:empty{display:none}
.v2-whm-overview__services>li{padding:.75rem 1.25rem;border-block-end:1px solid var(--line);overflow-wrap:anywhere}
.v2-whm-overview__services>li:last-child{border-block-end:0}
.v2-whm-overview__services>.v2-whm-inbox__row{padding-inline:0}
.v2-whm-inbox__row[data-read=true]{color:var(--muted)}
.v2-whm-inbox__row[hidden]{display:none}
.v2-whm-inbox__main{display:flex;flex-direction:column;gap:.125rem;flex:1 1 13.75rem;min-inline-size:0}
.v2-whm-inbox__meta{display:flex;flex-wrap:wrap;align-items:center;gap:.375rem;font-size:.75rem;font-variant-numeric:tabular-nums}
.v2-whm-inbox__meta bdi{white-space:nowrap}
.v2-whm-inbox__filter{display:inline-flex;align-items:center;gap:.5rem;min-block-size:var(--target);color:var(--text-2);cursor:pointer}
.v2-whm-overview__services>.v2-whm-favorites__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem;padding-inline:0}
.v2-whm-favorites__link{display:flex;flex-direction:column;gap:.125rem;flex:1 1 11.25rem;min-inline-size:0}
.v2-whm-favorites__link>a{font-size:.875rem;font-weight:500;color:var(--mono,var(--text));text-decoration:none}
.v2-whm-favorites__link>a:hover{color:var(--accent)}
.v2-whm-favorites__actions{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.375rem}
.v2-whm-overview__unread>.v2-state--empty{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;justify-items:start;gap:.25rem .875rem;padding:.875rem;border-radius:.75rem;text-align:start}
.v2-whm-overview__unread .v2-state__icon{grid-row:1/3}
.v2-whm-overview__unread :is(h2,h3,p){grid-column:2}
.v2-whm-overview__unread .v2-btn{grid-column:3;grid-row:1/3}
@media(prefers-reduced-motion:reduce){.v2-whm-overview__tile{transition:none}}
@media(min-width:1024px){.v2-whm-overview__primary,.v2-whm-overview__secondary{gap:1.875rem}}
@media(max-width:1050px){.v2-whm-overview__primary,.v2-whm-overview__secondary{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.v2-whm-overview__unread .v2-btn{grid-column:1/-1;grid-row:auto;justify-self:stretch;margin-block-start:.5rem}.v2-whm-overview__services>li:not(.v2-whm-inbox__row,.v2-whm-favorites__row){padding-inline:1rem}}
`
