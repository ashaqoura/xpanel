import type { SurfaceAuthority } from '../../../../../models/theme-surface.ts'
import type { Translate } from '../../../../../i18n.ts'
import { formatAsciiRate, formatQuotaMib } from '../../../../../display-format.ts'
import { accountPlanPreviewModel } from '../../../../../models/account-list.ts'
import { canCreate, principalOf } from '../../../../../models/whm-account-access.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { formField } from '../../../components/form-field.ts'
import { notice } from '../../../components/notice.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { factList } from '../../../layouts/common.ts'

const ltr = (value: string | number): string => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`
const json = (value: unknown): string => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026')
/** A Keenicon the v2 icon set lacks; decorative, sized by the button it sits in. */
const keenicon = (name: string): string => `<i class="ki-filled ki-${name}" aria-hidden="true"></i>`

// The Metronic settings card: a titled header, then rows with the label at the start and the growing control beside it.
const HEADER = 'kt-card-header'
const CONTENT = 'kt-card-content grid gap-5'
/** A settings row; below the desktop breakpoint the control wraps under its label. */
const settingRow = (id: string, label: string, bodyHtml: string): string => `<div class="v2-whm-create__row flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"><label class="kt-form-label max-w-56" for="${id}">${escapeHtml(label)}</label><div class="flex flex-col grow basis-full lg:basis-0 min-w-0 gap-1.5">${bodyHtml}</div></div>`
const HINT = 'v2-field__help kt-form-description mt-0'
/** A group of choice cards as a settings row: the legend is the row label, the cards fill the control column. */
const choiceGroup = (legend: string, bodyHtml: string, attrs = ''): string => `<fieldset class="v2-whm-create__owners"${attrs}><legend class="kt-form-label">${escapeHtml(legend)}</legend>${bodyHtml}</fieldset>`
// The Metronic radio card: an outlined card that takes the primary border while its radio is checked.
const CHOICE = 'v2-whm-create__choice flex items-start gap-2.5 cursor-pointer rounded-xl border border-input bg-background p-4 has-checked:border-primary'
const choiceText = (titleHtml: string, textHtml: string): string => `<span><strong class="text-sm font-medium text-mono">${titleHtml}</strong><small class="text-xs font-normal text-secondary-foreground">${textHtml}</small></span>`
// A summary panel inside a settings card: a section label, its figures and a hint.
const PANEL = 'v2-whm-create__panel flex flex-col gap-2.5 rounded-xl border border-border bg-muted/40 p-5'

function identity(t: Translate, enabled: boolean): string {
  const off = enabled ? '' : ' disabled'
  return `<fieldset class="v2-whm-create__section kt-card" id="v2-create-identity" data-wizard-step="1"><legend class="${HEADER}"><span class="kt-card-title">${escapeHtml(t(msgctxt('theme:v2', 'Identity and domain')))}</span></legend><div class="${CONTENT}">${settingRow('new-acc-username', t('Username'), `<input id="new-acc-username" class="kt-input" name="username" type="text" dir="ltr" required pattern="[a-z][a-z0-9]{0,15}" maxlength="16" autocomplete="off" autocapitalize="none" spellcheck="false"${off}><span class="${HINT}">${escapeHtml(t(msgctxt('theme:v2', 'Lowercase letters and digits, starting with a letter.')))}</span>`)}${settingRow('new-acc-domain', t('Primary domain'), `<input id="new-acc-domain" class="kt-input" name="primaryDomain" type="text" dir="ltr" required aria-describedby="new-acc-domain-help"${off}><span id="new-acc-domain-help" class="${HINT}">${escapeHtml(t(msgctxt('theme:v2', 'A DNS zone and a mail domain are requested for this domain.')))}</span>`)}${settingRow('new-acc-contact', t('Contact email'), `<input id="new-acc-contact" class="kt-input" name="contactEmail" type="email" inputmode="email" dir="ltr" autocomplete="email" aria-describedby="new-acc-contact-help"${off}><span id="new-acc-contact-help" class="${HINT}">${escapeHtml(t(msgctxt('theme:v2', 'Use an address outside this account for quota, suspension and certificate notices.')))}</span>`)}${settingRow('new-acc-password', t('Password'), `<div class="v2-whm-create__password"><input id="new-acc-password" class="kt-input" name="password" type="password" required minlength="8" autocomplete="new-password" aria-describedby="new-acc-password-help"${off}><button type="button" class="v2-btn kt-btn kt-btn-outline" data-account-toggle-password data-password-target="new-acc-password" aria-pressed="false" aria-controls="new-acc-password"${off}>${escapeHtml(t('Reveal password'))}</button><button type="button" class="v2-btn kt-btn kt-btn-outline" data-account-generate-password data-password-target="new-acc-password"${off}>${keenicon('key')}${escapeHtml(t('Generate password'))}</button></div><span id="new-acc-password-help" class="${HINT}">${escapeHtml(t('At least 8 characters.'))}</span>`)}</div></fieldset>`
}

function planSection(t: Translate, props: WhmSurfaceProps, enabled: boolean): string {
  const principal = principalOf(props)
  const plans = principal ? props.plans?.filter(plan => principal.kind === 'root' || plan.ownerId === null || plan.ownerId === principal.id) : undefined
  const preview = principal ? accountPlanPreviewModel({ principal, activeReseller: props.activeReseller, accounts: props.accounts, plans, resellers: props.resellers }) : { plans: [] }
  // Owner choices are saved records: a closed form still lists them, disabled.
  const owners = principal?.kind === 'root' ? [{ id: '', username: 'root' }, ...(props.resellers ?? [])] : principal?.kind === 'reseller' ? [principal] : []
  const ownerChoices = owners.map((owner, index) => `<label class="${CHOICE}" for="whm-create-owner-${index}"><input type="radio" class="kt-radio kt-radio-sm" id="whm-create-owner-${index}" name="ownerId" value="${escapeHtml(owner.id)}"${index === 0 ? ' checked' : ''}${enabled ? '' : ' disabled'} data-review-label="${escapeHtml(owner.username)}">${choiceText(ltr(owner.username), escapeHtml(t(owner.id === '' ? 'No reseller allocation cap' : 'The server checks this reseller’s capacity when submitted.')))}</label>`).join('')
  const cap = (value: number | 'unlimited' | undefined, unit = ''): string => value === undefined ? escapeHtml(t('Not read')) : value === 'unlimited' ? escapeHtml(t('Unlimited')) : ltr(`${value}${unit}`)
  const mib = (value: number | 'unlimited' | undefined): string => value === undefined ? escapeHtml(t('Not read')) : value === 'unlimited' ? escapeHtml(t('Unlimited')) : ltr(formatQuotaMib(value))
  const rate = (value: number | 'unlimited' | undefined): string => typeof value === 'number' ? ltr(formatAsciiRate(value)) : cap(value)
  const limitRows: readonly { label: string; read: (plan: NonNullable<WhmSurfaceProps['plans']>[number]) => string }[] = [
    { label: t('Disk'), read: plan => mib(plan.resources.diskMb) },
    { label: t('Bandwidth per month'), read: plan => mib(plan.resources.bandwidthMbMonth) },
    { label: t('CPU'), read: plan => cap(plan.resources.cpuPercent, '%') },
    { label: t('Memory'), read: plan => mib(plan.resources.memoryMb) },
    { label: t('Processes'), read: plan => cap(plan.resources.maxProcesses) },
    { label: t('Read bandwidth'), read: plan => rate(plan.resources.ioReadBps) },
    { label: t(msgctxt('theme:v2', 'Write bandwidth')), read: plan => rate(plan.resources.ioWriteBps) },
    { label: t(msgctxt('theme:v2', 'Read IOPS')), read: plan => cap(plan.resources.ioReadIops) },
    { label: t(msgctxt('theme:v2', 'Write IOPS')), read: plan => cap(plan.resources.ioWriteIops) },
    { label: t('Addon domains'), read: plan => cap(plan.caps.addonDomains) },
    { label: t('Subdomains'), read: plan => cap(plan.caps.subdomains) },
    { label: t('Mailboxes'), read: plan => cap(plan.caps.mailboxes) },
    { label: t('Databases'), read: plan => cap(plan.caps.databases) },
    { label: t('FTP accounts'), read: plan => cap(plan.caps.ftpAccounts) },
  ]
  // Plan choices are saved records: one card per plan, the first one selected, as the select used to default.
  const planChoices = (plans ?? []).map((plan, index) => `<label class="${CHOICE}" for="new-acc-plan-${index}"><input type="radio" class="kt-radio kt-radio-sm" id="new-acc-plan-${index}" name="planId" value="${escapeHtml(plan.id)}" required${index === 0 ? ' checked' : ''}${enabled ? '' : ' disabled'} data-review-label="${escapeHtml(plan.name)}">${choiceText(escapeHtml(plan.name), `${escapeHtml(t('Disk'))} ${mib(plan.resources.diskMb)} · ${escapeHtml(t('Bandwidth per month'))} ${mib(plan.resources.bandwidthMbMonth)}`)}</label>`).join('')
  const comparison = plans?.length ? `<div class="v2-table-scroll kt-scrollable-x-auto" role="region" aria-labelledby="v2-plan-comparison" tabindex="0"><table class="v2-table kt-table text-start caption-top"><caption id="v2-plan-comparison" class="mt-0 px-5 py-3 border-b border-border text-start text-sm font-semibold text-mono">${escapeHtml(t(msgctxt('theme:v2', 'Configured plan limits')))}</caption><thead><tr><th scope="col">${escapeHtml(t('Limit'))}</th>${plans.map(plan => `<th scope="col">${escapeHtml(plan.name)}</th>`).join('')}</tr></thead><tbody>${limitRows.map(row => `<tr><th scope="row">${escapeHtml(row.label)}</th>${plans.map(plan => `<td${plans.length > 1 ? ` data-phone-label="${escapeHtml(plan.name)}"` : ''}>${row.read(plan)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''
  return `<section class="v2-whm-create__section kt-card" id="v2-create-plan" data-wizard-step="2" aria-labelledby="v2-create-plan-heading"><div class="${HEADER}"><h2 id="v2-create-plan-heading" class="kt-card-title">${escapeHtml(t(msgctxt('theme:v2', 'Plan and resources')))}</h2></div><div class="${CONTENT}">${choiceGroup(t('Hosting plan'), `<div class="v2-whm-create__choices v2-whm-create__choices--fit">${planChoices || `<label class="${CHOICE}" for="new-acc-plan-empty"><input type="radio" class="kt-radio kt-radio-sm" id="new-acc-plan-empty" name="planId" value="" disabled><span class="text-sm font-normal text-secondary-foreground" role="status">${escapeHtml(t(msgctxt('theme:v2', 'Hosting plans have not been read.')))}</span></label>`}</div>`, ' id="new-acc-plan"')}${comparison}<p class="v2-muted text-xs font-normal">${escapeHtml(t(msgctxt('theme:v2', 'Configured limits are desired state. Their active host enforcement must be verified after apply.')))}</p>${choiceGroup(t('Owner'), `<div class="v2-whm-create__choices">${ownerChoices || `<label class="${CHOICE}" for="new-acc-owner-empty"><input type="radio" class="kt-radio kt-radio-sm" id="new-acc-owner-empty" name="ownerId" value="" disabled><span class="text-sm font-normal text-secondary-foreground">${escapeHtml(t('Owner unavailable'))}</span></label>`}</div>`)}<section class="${PANEL}" data-create-owner-capacity aria-labelledby="v2-create-owner-capacity"><h3 id="v2-create-owner-capacity" class="text-sm font-semibold text-mono">${escapeHtml(t('Owner after this account'))}</h3>${factList([{ label: t('Accounts after creation'), value: t('Candidate not read'), hooks: { 'data-create-owner-fact': 'accountsAfter' } }, { label: t('Assigned disk after creation'), value: t('Candidate not read'), hooks: { 'data-create-owner-fact': 'assignedDiskAfter' } }, { label: t('Configured owner caps'), value: t('Candidate not read'), hooks: { 'data-create-owner-fact': 'limitsSummary' } }])}<p class="v2-muted text-xs font-normal">${escapeHtml(t(msgctxt('theme:v2', 'The server checks the selected owner and rejects capacity violations when creating the account.')))}</p></section><section class="v2-stack ${PANEL}" data-create-plan-preview aria-labelledby="v2-create-plan-preview-heading"><h3 id="v2-create-plan-preview-heading" class="text-sm font-semibold text-mono">${escapeHtml(t('Selected plan'))}</h3><script type="application/json" data-plan-preview-model>${json(preview)}</script><dl class="v2-whm-create__preview"><div><dt>${escapeHtml(t('Plan'))}</dt><dd data-preview-plan-name></dd></div>${(['disk', 'memory', 'cpu'] as const).map(key => `<div><dt>${escapeHtml(t(key === 'disk' ? 'Disk (MiB)' : key === 'memory' ? 'Memory (MiB)' : 'CPU (%)'))}</dt><dd><bdi dir="ltr" data-preview-plan-${key}></bdi></dd></div>`).join('')}</dl><p class="text-sm font-normal text-secondary-foreground" data-preview-plan-capacity role="status" aria-live="polite"></p></section></div></section>`
}

function network(t: Translate, enabled: boolean): string {
  const off = enabled ? '' : ' disabled'
  const ipModes = ([{ value: 'shared', title: t('Default shared'), text: t(msgctxt('theme:v2', 'The default IPv4 of the server, shared with other accounts.')) }, { value: 'dedicated:auto', title: t('Dedicated · Automatic'), text: t(msgctxt('theme:v2', 'The next unallocated IPv4 that this plan may use.')) }] as const).map((item, index) => `<label class="${CHOICE}" for="new-acc-ip-mode-${index}"><input type="radio" class="kt-radio kt-radio-sm" id="new-acc-ip-mode-${index}" name="ipMode" value="${item.value}" data-account-ip-mode${item.value === 'shared' ? ' checked' : ''}${enabled && item.value === 'shared' ? '' : ' disabled'}>${choiceText(escapeHtml(item.title), escapeHtml(item.text))}</label>`).join('')
  const shells = ([{ value: 'none', title: t('No shell'), text: t('Web, mail, databases and file access remain subject to the account’s plan.') }, { value: 'jailed', title: t('Jailed shell'), text: t('Requires a plan that permits a jailed shell. The server checks eligibility.') }] as const).map(item => `<label class="${CHOICE}" for="whm-create-shell-${item.value}"><input type="radio" class="kt-radio kt-radio-sm" id="whm-create-shell-${item.value}" name="shell" value="${item.value}"${item.value === 'jailed' ? ' checked' : ''}${off} data-review-label="${escapeHtml(item.title)}">${choiceText(escapeHtml(item.title), escapeHtml(item.text))}</label>`).join('')
  return `<fieldset class="v2-whm-create__section kt-card" id="v2-create-network" data-wizard-step="3"><legend class="${HEADER}"><span class="kt-card-title">${escapeHtml(t(msgctxt('theme:v2', 'Network and access')))}</span></legend><div class="${CONTENT}">${choiceGroup(t('IP address'), `<div class="v2-whm-create__stack"><div class="v2-whm-create__choices">${ipModes}</div><div class="v2-fields"><div class="v2-field kt-form-item"><label class="kt-form-label leading-tight" for="new-acc-ipv4">${escapeHtml(t('IPv4 assignment'))}</label><select id="new-acc-ipv4" name="ipAssignment" required aria-describedby="new-acc-ipv4-address new-acc-ipv4-status" class="kt-select"${off}><option value="shared">${escapeHtml(t('Default shared'))}</option><option value="dedicated:auto" disabled>${escapeHtml(t('Dedicated · Automatic'))}</option></select></div>${formField({ id: 'new-acc-ipv6', label: t('IPv6 address (optional)'), control: { kind: 'input', name: 'ipv6', dir: 'ltr', disabled: !enabled } })}</div><div class="v2-whm-create__ip"><output class="kt-badge kt-badge-outline font-medium" data-account-ip-preview hidden><bdi id="new-acc-ipv4-address" dir="ltr" data-account-ip-address></bdi></output><p id="new-acc-ipv4-status" data-account-ip-status role="status" aria-live="polite">${escapeHtml(t(msgctxt('theme:v2', 'IP availability has not been read.')))}</p><button type="button" class="v2-btn kt-btn kt-btn-outline" data-account-ip-refresh${off}>${icon('refresh', 16)}${escapeHtml(t('Refresh IP availability'))}</button></div></div>`)}${choiceGroup(t('Shell access'), `<div class="v2-whm-create__choices">${shells}</div>`)}</div></fieldset>`
}

/** Live summary: the shared controller mirrors each named form field into its data-create-review cell. */
function accountReview(t: Translate, props: WhmSurfaceProps, plans: WhmSurfaceProps['plans']): string {
  const principal = principalOf(props)
  const blank = t('Not entered')
  const groups: readonly { title: string; rows: readonly (readonly [label: string, field: string, initial: string])[] }[] = [
    { title: t(msgctxt('theme:v2', 'Identity and domain')), rows: [[t('Username'), 'username', blank], [t('Primary domain'), 'primaryDomain', blank], [t('Contact email'), 'contactEmail', blank]] },
    { title: t(msgctxt('theme:v2', 'Plan and resources')), rows: [[t('Hosting plan'), 'planId', plans?.[0]?.name ?? t('Not read')], [t('Owner'), 'ownerId', principal?.kind === 'root' ? 'root' : principal?.kind === 'reseller' ? principal.username : t('Owner unavailable')]] },
    { title: t('Network'), rows: [[t('IPv4 assignment'), 'ipAssignment', t('Default shared')], [t('IPv6 address (optional)'), 'ipv6', blank], [t('Shell access'), 'shell', t('Jailed shell')]] },
  ]
  const review = groups.map((group, index) => `<section class="v2-whm-create__review" aria-labelledby="v2-whm-create-review-${index}"><h3 id="v2-whm-create-review-${index}" class="text-sm font-semibold text-mono">${escapeHtml(group.title)}</h3><dl class="v2-whm-create__preview">${group.rows.map(([label, field, initial]) => `<div><dt>${escapeHtml(label)}</dt><dd><bdi data-create-review="${field}">${escapeHtml(initial)}</bdi></dd></div>`).join('')}</dl></section>`).join('')
  const later = escapeHtml(t(msgctxt('theme:v2', 'Checked when submitted')))
  const checkItems: readonly (readonly [string, string])[] = [
    ['username', t('Username')],
    ['primaryDomain', t('Primary domain')],
    ['capacity', t(msgctxt('theme:v2', 'Plan and owner capacity'))],
  ]
  const checks = `<ul class="v2-whm-create__checks">${checkItems.map(([key, label]) => `<li><span>${escapeHtml(label)}</span><span class="v2-muted" data-account-preflight-check="${key}">${later}</span></li>`).join('')}<li><span>${escapeHtml(t('IPv4 assignment'))}</span><span class="v2-muted" data-account-ip-check>${escapeHtml(t(msgctxt('theme:v2', 'IP availability has not been read.')))}</span></li></ul>`
  return card({ title: t(msgctxt('theme:v2', 'Account review')), titleId: 'v2-whm-create-review', description: t(msgctxt('theme:v2', 'Live summary of the form.')), bodyHtml: review }) + card({ title: t(msgctxt('theme:v2', 'Availability checks')), titleId: 'v2-whm-create-checks', bodyHtml: checks })
}

function observations(t: Translate, props: WhmSurfaceProps, plans: WhmSurfaceProps['plans']): string {
  const createRoute = '/whm/accounts/new?' + new URLSearchParams({ lang: props.locale ?? 'en', theme: props.theme ?? 'dark', density: props.density ?? 'comfortable' }).toString()
  const steps = ['Reserve account identity and assign UID', 'Prepare private home and filesystem quotas', 'Prepare resource slice and plan limits', 'Prepare web virtual host and PHP handler', 'Prepare DNS zone and mail domain', 'Apply configuration and verify the target host']
  // The Metronic activity timeline: a numbered marker on a rail, the step and its observed state beside it.
  const progress = `<p class="text-sm font-normal text-secondary-foreground" data-account-creation-observation role="status">${escapeHtml(t(msgctxt('theme:v2', 'No account-creation operation has been observed.')))}</p><ol class="v2-whm-create__progress" data-account-creation-progress>${steps.map((label, index) => `<li class="flex items-start relative" data-account-creation-step="${index + 1}">${index < steps.length - 1 ? '<span class="w-9 start-0 top-9 absolute bottom-0 rtl:-translate-x-1/2 translate-x-1/2 border-s border-s-input" aria-hidden="true"></span>' : ''}<span class="v2-num flex items-center justify-center shrink-0 rounded-full bg-accent/60 border border-input size-9 text-sm font-medium text-secondary-foreground" aria-hidden="true">${index + 1}</span><span class="flex flex-col grow gap-0.5 ps-2.5 pt-1 mb-5"><span class="text-sm font-medium text-mono">${escapeHtml(t(label))}</span><span class="v2-muted text-xs font-normal" data-account-creation-step-state>${escapeHtml(t('Not observed'))}</span></span></li>`).join('')}</ol>`
  const another = `<button type="button" class="v2-btn kt-btn kt-btn-outline" data-account-create-another data-create-route="${escapeHtml(createRoute)}" disabled>${icon('plus', 16)}${escapeHtml(t('Create another account'))}</button>`
  const artifacts: readonly (readonly [string, string | undefined])[] = [
    ['Linux user', 'linuxUser'],
    ['Home', 'home'],
    ['Slice', undefined],
    ['Apache vhost', 'apacheVhost'],
    ['Nginx server', 'nginxServer'],
    ['PHP-FPM pool', 'phpPool'],
    ['DNS zone', 'dnsZone'],
    ['Mail domain', 'mailDomain'],
    ['Databases', undefined],
  ]
  return `<aside class="v2-whm-create__aside" data-approved-account-create-status aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Creation result')))}">${accountReview(t, props, plans)}${card({ title: t('Creation progress'), titleId: 'v2-whm-create-progress', bodyHtml: progress, footerHtml: another })}${card({ title: t('What will be created'), titleId: 'v2-whm-create-artifacts', bodyHtml: `<p>${escapeHtml(t(msgctxt('theme:v2', 'Expected components, not completed resources. The server allocates identities and paths.')))}</p>${factList(artifacts.map(([label, key]) => ({ label: t(label), value: t('Not observed'), ...(key ? { hooks: { 'data-create-artifact': key } } : {}) })))}${['slice', 'apache', 'nginx'].map(key => formField({ id: `v2-create-config-${key}`, label: t(msgctxt('theme:v2', 'Configuration preview: {kind}'), { kind: key }), help: t(msgctxt('theme:v2', 'Candidate configuration has not been read.')), control: { kind: 'textarea', dir: 'ltr', mono: true, readonly: true, disabled: true, rows: 5 } })).join('')}` })}</aside>`
}

/** Native create-controller hooks are preserved; server allocation and results remain authoritative. */
export function renderV2WhmAccountCreate(t: Translate, props: WhmSurfaceProps, authority?: SurfaceAuthority): string {
  const enabled = canCreate(props) && (authority === undefined || authority.presentation === 'live' && authority.canManage)
  if (authority?.presentation === 'read-only' && (!authority.canReadFacts || !authority.authorizedTools.has('create-account'))) props = { ...props, plans: undefined, accounts: undefined, resellers: undefined }
  const principal = principalOf(props)
  const plans = principal ? props.plans?.filter(plan => principal.kind === 'root' || plan.ownerId === null || plan.ownerId === principal.id) : undefined
  const submit = enabled && plans !== undefined && plans.length > 0
  const anchors = [['identity', t(msgctxt('theme:v2', 'Identity and domain'))], ['plan', t(msgctxt('theme:v2', 'Plan and resources'))], ['network', t('Network')], ['review', t('Review')]] as const
  // The last settings card closes the form: its footer carries Discard and the one primary action of the page.
  const review = `<section class="v2-whm-create__section kt-card" id="v2-create-review" data-wizard-step="4" aria-labelledby="v2-create-review-heading"><div class="${HEADER}"><h2 id="v2-create-review-heading" class="kt-card-title">${escapeHtml(t('Review'))}</h2></div><div class="${CONTENT}"><p class="text-sm font-normal text-secondary-foreground">${escapeHtml(t(msgctxt('theme:v2', 'The server checks capacity, permissions, address availability and the submitted plan.')))}</p><p data-account-create-status role="status" aria-live="polite" tabindex="-1" hidden></p></div><div class="v2-whm-create__actions kt-card-footer justify-end gap-2.5"><button type="reset" class="v2-btn kt-btn kt-btn-outline"${enabled ? '' : ' disabled'}>${escapeHtml(t('Discard'))}</button><button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${submit ? '' : ' disabled'}><i class="ki-filled ki-plus" aria-hidden="true"></i>${escapeHtml(t('Create account'))}</button></div></section>`
  const wizardFooter = `<div class="v2-wizard-nav"><button type="button" class="v2-btn kt-btn kt-btn-outline" data-wizard-prev hidden${enabled ? '' : ' disabled'}>${icon('chevLeft', 16)}${escapeHtml(t('Previous'))}</button><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-wizard-next hidden${enabled ? '' : ' disabled'}>${escapeHtml(t('Next'))}${icon('chevRight', 16)}</button></div>`
  return `<div class="v2-layout v2-whm-create" data-accounts-workspace data-approved-account-create-fields data-wizard="guided"${enabled ? ' data-account-preflight-url="/api/accounts/preflight"' : ''} data-capability-state="${enabled ? 'authorized' : 'unavailable'}">${pageHeader(t, { breadcrumb: [{ label: t('Home'), href: '/whm' }, { label: t('Accounts'), href: '/whm/accounts' }, { label: t('Create account') }], route: '/whm/accounts/new', title: t('Create account'), description: t(msgctxt('theme:v2', 'The account gets its own UID, slice and quotas. Nothing is created until the server applies the request.')), status: { tone: 'neutral', label: t(msgctxt('theme:v2', 'Not created yet')) }, actionsHtml: `<button type="button" class="v2-btn kt-btn kt-btn-outline" data-wizard-toggle aria-pressed="false"${enabled ? '' : ' disabled'}>${escapeHtml(t(msgid('Step-by-step mode')))}</button>` })}<nav class="v2-whm-create__steps kt-card" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Create account progress')))}"><ol>${anchors.map(([key, label], index) => `<li><a href="#v2-create-${key}" data-wizard-go="${index + 1}"${index === 0 ? ' aria-current="step"' : ''}><span class="v2-num">${index + 1}</span>${escapeHtml(label)}</a></li>`).join('')}</ol></nav>${!enabled ? notice(t, { tone: 'warn', text: t(msgctxt('theme:v2', 'Account creation is not qualified for this host or caller.')) }) : ''}<div class="v2-whm-create__columns"><form class="v2-whm-create__form" id="whm-create-account-drawer" method="post" action="/api/accounts" data-create-account-form data-account-create-actor="${escapeHtml(principal ? principal.kind + ':' + principal.username : '')}">${identity(t, enabled)}${planSection(t, props, enabled)}${network(t, enabled)}${review}${wizardFooter}</form>${observations(t, props, plans)}</div></div>`
}

// Structure, bidi and controller states: surfaces, type and spacing come from the Metronic classes in the markup.
// Choice cards, step markers and check results follow their radio, aria-current and data-check states with the
// colours the Metronic variants use.
export const WHM_ACCOUNT_CREATE_CSS = `@media(max-width:600px){.v2-whm-create .v2-table tr:has(>td[data-phone-label])>th{grid-column:1/-1}.v2-whm-create .v2-table tr>td[data-phone-label]:nth-child(n){grid-column:1/-1;grid-row:auto;display:flex;align-items:baseline;justify-content:space-between;gap:.625rem;justify-self:stretch}.v2-whm-create td[data-phone-label]::before{content:attr(data-phone-label);font-size:.8125rem;color:var(--muted)}}
.v2-whm-create .v2-num,.v2-whm-create .v2-table td,.v2-whm-create__preview dd,.v2-whm-create__aside .v2-facts dd,.v2-whm-create [data-account-ip-address]{font-variant-numeric:tabular-nums}
.v2-whm-create__columns{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(21.25rem,1fr);align-items:start;gap:1.25rem}
.v2-whm-create__form,.v2-whm-create__aside{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
@media(min-width:1024px){.v2-whm-create__columns,.v2-whm-create__form,.v2-whm-create__aside{gap:1.875rem}}
.v2-whm-create__section{min-inline-size:0;padding:0}
.v2-whm-create__section>legend{float:inline-start;inline-size:100%}
.v2-whm-create .v2-fields{align-items:start}
.v2-whm-create__password{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-whm-create__password>input{flex:1 1 100%;min-inline-size:0}
.v2-whm-create .v2-wizard-nav:not(:has(>button:not([hidden]))){display:none}
.v2-whm-create__steps{padding:.75rem 1.25rem}
.v2-whm-create__steps>ol{display:grid;list-style:none;grid-template-columns:repeat(auto-fit,minmax(min(11.25rem,100%),1fr));gap:.25rem .625rem}
.v2-whm-create__steps a{display:flex;align-items:center;gap:.625rem;min-block-size:2.5rem;border-radius:var(--radius-control);color:var(--text-2);font-size:.875rem;line-height:1.25rem;font-weight:500;text-decoration:none}
.v2-whm-create__steps a:hover{color:var(--accent)}
.v2-whm-create__steps a>span{flex:none;display:grid;place-items:center;inline-size:2.5rem;block-size:2.5rem;border-radius:50%;background:color-mix(in oklab,var(--primary) 10%,transparent);color:var(--accent);font-size:.875rem;font-weight:600}
.v2-whm-create__steps a[aria-current=step]{color:var(--mono,var(--text))}
.v2-whm-create__steps a[aria-current=step]>span{background:var(--accent-fill);color:var(--on-accent)}
.v2-whm-create__steps a[data-step-state=done]>span{background:var(--color-green-500,var(--ok));color:var(--on-accent)}
.v2-whm-create__owners{display:flex;flex-wrap:wrap;align-items:baseline;gap:.625rem;min-inline-size:0}
.v2-whm-create__owners>legend{float:inline-start;flex:0 0 100%;max-inline-size:14rem}
.v2-whm-create__owners>:not(legend){flex:1 1 100%;min-inline-size:0}
@media(min-width:1024px){.v2-whm-create__owners{flex-wrap:nowrap}.v2-whm-create__owners>:not(legend){flex:1 1 0}}
.v2-whm-create__stack{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-whm-create__choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.625rem}
.v2-whm-create__choices--fit{grid-template-columns:repeat(auto-fit,minmax(12.5rem,1fr))}
.v2-whm-create__choice:hover{border-color:var(--primary)}
.v2-whm-create__choice:has(input:focus-visible){outline:2px solid var(--focus);outline-offset:2px}
.v2-whm-create__choice:has(input:disabled){cursor:not-allowed}
.v2-whm-create__choice:has(input:disabled):hover{border-color:var(--line-strong)}
.v2-whm-create__choice:has(input:disabled:not(:checked)){background:var(--sunken)}
.v2-whm-create__choice:has(input:checked):hover{border-color:var(--primary)}
.v2-whm-create__choice>input{flex:none}
.v2-whm-create__choice>span{display:flex;flex-direction:column;gap:.25rem;min-inline-size:0;text-align:start}
.v2-whm-create__ip{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-whm-create__ip>p{flex:1 1 12.5rem;min-inline-size:0;font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-whm-create .v2-table-scroll{border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-whm-create .v2-table tbody th{font-weight:400;color:var(--text-2)}
.v2-whm-create .v2-table td{color:var(--mono,var(--text))}
.v2-whm-create__panel>:is(.v2-whm-create__preview,.v2-facts){display:flex;flex-wrap:wrap;align-items:stretch;gap:.5rem 1.25rem}
.v2-whm-create__panel>:is(.v2-whm-create__preview,.v2-facts)>div{display:flex;flex-direction:column-reverse;justify-content:space-between;gap:.375rem;min-inline-size:6rem;padding:.5rem .875rem;border:1px dashed var(--line-strong);border-radius:var(--radius-control);text-align:start}
.v2-whm-create__panel>:is(.v2-whm-create__preview,.v2-facts) dt{font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
.v2-whm-create__panel>:is(.v2-whm-create__preview,.v2-facts) dd{font-size:1rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere}
.v2-whm-create__panel>p:empty{display:none}
.v2-whm-create__review{display:flex;flex-direction:column;gap:.625rem;padding-block-start:1.25rem;border-block-start:1px solid var(--line);min-inline-size:0}
.v2-whm-create__review:first-child{padding-block-start:0;border-block-start:0}
.v2-whm-create__review>.v2-whm-create__preview,.v2-whm-create__aside .v2-facts{display:flex;flex-direction:column;gap:.625rem}
.v2-whm-create__review>.v2-whm-create__preview>div,.v2-whm-create__aside .v2-facts>div{display:flex;flex-direction:row;align-items:baseline;justify-content:space-between;gap:.625rem}
.v2-whm-create__aside :is(.v2-whm-create__preview,.v2-facts) dt{flex:0 1 auto;min-inline-size:0;font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
.v2-whm-create__aside :is(.v2-whm-create__preview,.v2-facts) dd{min-inline-size:0;font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text));text-align:end;overflow-wrap:anywhere}
.v2-whm-create__aside .v2-card__body{gap:1.25rem}
.v2-whm-create__aside .v2-card__body>p{font-size:.875rem;line-height:1.25rem;font-weight:400;color:var(--text-2)}
.v2-whm-create__checks{display:flex;flex-direction:column}
.v2-whm-create__checks>li{display:flex;align-items:center;justify-content:space-between;gap:.625rem;min-block-size:2.75rem;padding-block:.5rem;font-size:.875rem;line-height:1.25rem}
.v2-whm-create__checks>li+li{border-block-start:1px solid var(--line)}
.v2-whm-create__checks>li>span:first-child{min-inline-size:0;font-weight:500;color:var(--mono,var(--text))}
.v2-whm-create__checks>li>span:last-child{min-inline-size:0;font-size:.75rem;line-height:1rem;font-weight:400;text-align:end;overflow-wrap:anywhere}
.v2-whm-create__checks>li>:is(.v2-field-check,[data-state=failed]){padding:.1875rem .45rem;border:1px solid var(--line);border-radius:30px;background:var(--secondary);color:var(--text);font-weight:500}
.v2-whm-create__checks>li>.v2-field-check[data-check=ok]{border-color:var(--ok-line);background:var(--ok-soft);color:var(--ok)}
.v2-whm-create__checks>li>:is(.v2-field-check[data-check=bad],[data-state=failed]){border-color:var(--bad-line);background:var(--bad-soft);color:var(--bad)}
.v2-whm-create__progress,.v2-whm-create__checks{list-style:none}
.v2-whm-create__progress{display:flex;flex-direction:column}
.v2-whm-create__progress>li:last-child>span:last-child{margin-block-end:0}
@media(max-width:1240px){.v2-whm-create__columns{grid-template-columns:minmax(0,1fr)}.v2-whm-create__aside{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(18.75rem,100%),1fr));align-items:start}}
@media(max-width:600px){.v2-whm-create__choices{grid-template-columns:minmax(0,1fr)}.v2-whm-create__panel>:is(.v2-whm-create__preview,.v2-facts)>div{flex:1 1 40%}.v2-whm-create__password>.v2-btn{flex:1 1 auto}}
`
