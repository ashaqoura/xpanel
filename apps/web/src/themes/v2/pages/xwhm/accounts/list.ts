import { effectivePlan } from '@xpanel/core'
import type { Account, Plan } from '@xpanel/core'
import { formatAsciiBytes, formatAsciiRate } from '../../../../../display-format.ts'
import { ACCOUNT_PACKAGE_LIMIT_FIELDS } from '../../../../../models/plan-fields.ts'
import type { SurfaceAuthority } from '../../../../../models/theme-surface.ts'
import type { Translate } from '../../../../../i18n.ts'
import { accountListModel, type AccountListModel } from '../../../../../models/account-list.ts'
import type { MeasuredTotal } from '../../../../../models/reseller-usage.ts'
import { accountFor, allowed, canCreate, principalOf, qualified, readableAccounts } from '../../../../../models/whm-account-access.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { formField } from '../../../components/form-field.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { rowMenu, type RowMenuItem } from '../../../components/row-menu.ts'
import { stateTones } from '../../../components/status-pill.ts'
import { escapeHtml, hookAttrs } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { factList } from '../../../layouts/common.ts'
import { filterBar } from '../../../components/filter-bar.ts'

// Metronic progress classes of each quota tone, as full literal names for the stylesheet build.
const BAR = { info: 'v2-bar kt-progress kt-progress-primary', warn: 'v2-bar kt-progress kt-progress-warning', bad: 'v2-bar kt-progress kt-progress-destructive' } as const
const FILL = { info: 'v2-bar__fill v2-bar--info kt-progress-indicator', warn: 'v2-bar__fill v2-bar--warn kt-progress-indicator', bad: 'v2-bar__fill v2-bar--bad kt-progress-indicator' } as const
const AVATAR = 'inline-flex items-center justify-center shrink-0 rounded-full bg-primary/5 ring-1 ring-primary/20 text-primary font-semibold'
const ltr = (value: string | number): string => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`
/** A Keenicon the v2 icon set lacks; decorative, sized by the button it sits in. */
const keenicon = (name: string): string => `<i class="ki-filled ki-${name}" aria-hidden="true"></i>`
/** A checkbox with its label, as the Metronic forms write one: the label is the 44px hit area. */
const SELECTION = 'v2-whm-accounts__selection kt-label'
// Type roles of the standard: caption 13/20, label 14/22, body 16/24.
const CAPTION = 'text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground'
const BODY = 'text-base leading-(--lh-text) font-normal text-foreground'

// One toolbar attached to the table: the status segments, the search box with the magnifier inside, the filter selects
// and Clear. The controls are named for assistive technology; their options name what they filter.
function filters(t: Translate, model: AccountListModel, quick: string): string {
  const choices = (items: readonly { value: string; label: string }[], all: string) => [{ value: '', label: all, selected: true }, ...items.map(item => ({ ...item, value: item.value === '' ? 'root' : item.value }))]
  const selectControl = (id: string, label: string, hook: string, options: readonly { value: string; label: string; selected?: boolean }[]) =>
    `<div class="v2-whm-accounts__filter-control"><label class="v2-sr" for="${id}">${escapeHtml(label)}</label><select id="${id}" class="kt-select" ${hook}>${options.map(option => `<option value="${escapeHtml(option.value)}"${option.selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></div>`
  const searchControl = `<div class="v2-whm-accounts__filter-control v2-whm-accounts__filter-search"><label class="v2-sr" for="account-list-search">${escapeHtml(t('Search loaded accounts'))}</label><span class="absolute z-1 start-3 inset-y-0 flex items-center pointer-events-none text-muted-foreground">${icon('search', 16)}</span><input id="account-list-search" class="kt-input ps-9" type="search" placeholder="${escapeHtml(t('Search loaded accounts'))}" autocomplete="off" data-list-search-input></div>`
  return `<div class="v2-whm-accounts__filters">${quick}${searchControl}${selectControl('account-list-owner', t('Owner'), 'data-list-owner-filter', choices(model.owners, t('All owners')))}${selectControl('account-list-plan', t('Plan'), 'data-list-plan-filter', choices(model.plans, t('All plans')))}${selectControl('account-list-state', t('Status'), 'data-list-state-filter', [{ value: '', label: t('All statuses'), selected: true }, { value: 'active', label: t('Active') }, { value: 'suspended', label: t('Suspended') }, { value: 'terminating', label: t('Terminating') }])}<a class="v2-btn v2-whm-accounts__clear kt-btn kt-btn-icon kt-btn-ghost" href="/whm/accounts" title="${escapeHtml(t(msgctxt('theme:v2', 'Clear filters')))}">${icon('x', 16)}<span class="v2-sr">${escapeHtml(t(msgctxt('theme:v2', 'Clear filters')))}</span></a></div>`
}

/** Shown by the list client when no loaded account matches the filters. */
const noMatches = (t: Translate): string => `<div class="v2-whm-accounts__empty" data-list-empty hidden>${icon('search', 24)}<p class="text-base font-medium text-mono">${escapeHtml(t('No accounts match these filters.'))}</p><a class="v2-btn kt-btn kt-btn-outline" href="/whm/accounts">${escapeHtml(t(msgctxt('theme:v2', 'Clear filters')))}</a></div>`

/** The datatable footer: the total and the usage note at the start, the shown range and the pager at the end. */
const listFooter = (t: Translate, total: string, note: string, listed: boolean): string => `<div class="v2-whm-accounts__foot kt-card-footer justify-center md:justify-between flex-col md:flex-row gap-4"><div class="v2-whm-accounts__note flex flex-col order-2 md:order-1">${total ? `<p class="${BODY}">${escapeHtml(total)}</p>` : ''}<p class="${CAPTION}">${escapeHtml(note)}</p></div>${listed ? `<div class="flex flex-wrap items-center justify-center gap-4 order-1 md:order-2"><p class="v2-whm-accounts__count text-base font-medium text-secondary-foreground" data-list-count role="status" aria-live="polite"></p><nav class="v2-whm-accounts__pager" data-list-pages aria-label="${escapeHtml(t('Loaded account pages'))}" hidden><button type="button" class="v2-btn kt-btn kt-btn-outline" data-list-previous>${icon('chevLeft', 16)}${escapeHtml(t('Previous'))}</button><span class="v2-num" data-list-page></span><button type="button" class="v2-btn kt-btn kt-btn-outline" data-list-next>${escapeHtml(t('Next'))}${icon('chevRight', 16)}</button></nav></div>` : ''}</div>`

/** A closed group of one native form, drawn as a Metronic accordion item; the form stays in the document with its saved values. */
const fold = (title: string, body: string, section?: string): string => `<details class="v2-whm-accounts__fold"${section ? ` data-account-detail-section="${section}"` : ''}><summary class="kt-accordion-toggle"><span class="kt-accordion-title text-base font-medium">${escapeHtml(title)}</span><span class="kt-accordion-indicator">${icon('chevDown', 16)}</span></summary>${body}</details>`

function planOwnerForms(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string {
  const principal = principalOf(props)!
  const editable = canManage && qualified(props, 'modify-account') && allowed(props, 'edit-account') && account.status !== 'terminating'
  const plans = props.plans?.filter(plan => principal.kind === 'root' || plan.ownerId === null || plan.ownerId === principal.id)
  const current = plans?.find(plan => plan.id === account.planId)
  const planEditable = editable && (principal.kind === 'root' || allowed(props, 'change-plan')) && current !== undefined && plans !== undefined && plans.length > 0
  const planField = formField({ id: `v2-${account.username}-plan`, label: t('Plan'), control: { kind: 'select', name: 'planId', disabled: !planEditable, options: [...(!current ? [{ value: '', label: t('Current plan not read') }] : []), ...(plans ?? []).map(plan => ({ value: plan.id, label: plan.name, selected: plan.id === account.planId }))] } })
  const planBody = `${planField}<p class="${CAPTION}">${escapeHtml(t(msgctxt('theme:v2', 'The server checks capacity, permissions and host reconciliation.')))}</p><p data-account-plan-status role="status" hidden></p><button class="v2-btn kt-btn kt-btn-outline" type="${planEditable ? 'submit' : 'button'}"${planEditable ? '' : ' disabled'}>${escapeHtml(t('Change plan'))}</button>`
  const planForm = planEditable ? `<form class="v2-form" data-account-plan-form data-account-username="${escapeHtml(account.username)}">${planBody}</form>` : `<div class="v2-form" data-account-plan-readonly>${planBody}</div>`
  const owners = principal.kind === 'root' && props.resellers !== undefined ? [{ id: '', username: 'root' }, ...props.resellers] : undefined
  const ownerKnown = owners?.some(owner => owner.id === (account.ownerId ?? '')) === true
  const ownerEditable = principal.kind === 'root' && editable && ownerKnown
  const ownerField = formField({ id: `v2-${account.username}-owner`, label: t('New owner'), control: { kind: 'select', name: 'ownerId', disabled: !ownerEditable, options: [...(!ownerKnown ? [{ value: '', label: t('Owner choices not read') }] : []), ...(owners ?? []).map(owner => ({ value: owner.id, label: owner.username, selected: owner.id === (account.ownerId ?? '') }))] } })
  const ownerBody = `${ownerField}<p class="${CAPTION}">${escapeHtml(t('Only root may change account ownership.'))}</p><p data-reseller-owner-status role="status" hidden></p><button class="v2-btn kt-btn kt-btn-outline" type="${ownerEditable ? 'submit' : 'button'}"${ownerEditable ? '' : ' disabled'}>${escapeHtml(t('Change owner'))}</button>`
  return `<div class="v2-whm-accounts__mutation" data-approved-account-mutations><h4 class="v2-sr">${escapeHtml(t('Plan and ownership'))}</h4>${fold(t('Change plan'), planForm, 'plan')}${fold(t('Change owner'), ownerEditable ? `<form class="v2-form" data-reseller-owner-form data-account-username="${escapeHtml(account.username)}">${ownerBody}</form>` : `<div class="v2-form" data-account-owner-readonly>${ownerBody}</div>`, 'owner')}</div>`
}

/** The account's package with its own overrides applied: what the server enforces. */
const accountPlan = (props: WhmSurfaceProps, account: Account): Plan | undefined => {
  const principal = principalOf(props)!
  const plan = props.plans?.find(item => item.id === account.planId && (principal.kind === 'root' || item.ownerId === null || item.ownerId === principal.id))
  return plan && effectivePlan(plan, account)
}
const LIMIT_FIELDS = [['diskMb', msgid('Disk space (MB)'), 'quota-modification'], ['bandwidthMbMonth', msgid('Monthly bandwidth (MB)'), 'limit-bandwidth-usage']] as const

/** WHM Modify Account / Quota Modification / Limit Bandwidth Usage: only the fields this caller may change are editable. */
function limitsForm(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string {
  const editable = canManage && allowed(props, 'edit-account') && account.status !== 'terminating'
  const on = LIMIT_FIELDS.filter(([, , tool]) => editable && qualified(props, tool))
  const fields = on.map(([key, label]) => {
    const value = account.limits?.resources?.[key], id = `v2-${account.username}-limit-${key}`
    return `<div class="v2-field kt-form-item"><label class="kt-form-label" for="${id}">${escapeHtml(t(label))}</label><input id="${id}" class="kt-input" type="text" inputmode="numeric" dir="ltr" autocomplete="off" data-account-limit="${key}" value="${typeof value === 'number' ? value : ''}" placeholder="${escapeHtml(t('Package value'))}"${value === 'unlimited' ? ' disabled' : ''}><label class="${SELECTION}"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-account-limit-unlimited="${key}"${value === 'unlimited' ? ' checked' : ''}><span>${escapeHtml(t('Unlimited'))}</span></label></div>`
  }).join('')
  const packageEditable = editable && qualified(props, 'modify-account')
  const packageFields = !packageEditable ? '' : `<div class="v2-whm-account-limit-grid">` + ACCOUNT_PACKAGE_LIMIT_FIELDS.map(({ key, label, group, scale }) => {
    const value = (account.limits?.[group] as Record<string, number | 'unlimited' | null> | undefined)?.[key], id = `v2-${account.username}-limit-${key}`
    return `<div class="v2-field kt-form-item"><label class="kt-form-label" for="${id}">${escapeHtml(t(label))}</label><input id="${id}" class="kt-input" type="text" inputmode="numeric" dir="ltr" autocomplete="off" data-account-limit="${key}" data-account-limit-group="${group}" data-account-limit-scale="${scale}" value="${typeof value === 'number' ? value / scale : ''}" placeholder="${escapeHtml(t('Package value'))}"${value === 'unlimited' ? ' disabled' : ''}><label class="${SELECTION}"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-account-limit-unlimited="${key}"${value === 'unlimited' ? ' checked' : ''}><span>${escapeHtml(t('Unlimited'))}</span></label></div>`
  }).join('') + `</div><div class="v2-field kt-form-item"><label class="kt-form-label" for="v2-${account.username}-limit-resolution">${escapeHtml(t('When a value differs from the package'))}</label><select id="v2-${account.username}-limit-resolution" class="kt-select" data-account-limit-resolution><option value="">${escapeHtml(t('Keep it on this account'))}</option><option value="create">${escapeHtml(t('Create a package for this account'))}</option><option value="switch">${escapeHtml(t('Switch to a matching package'))}</option><option value="update">${escapeHtml(t('Update the package for all its accounts'))}</option><option value="detach" disabled>${escapeHtml(t('Detach from the package (unavailable: every account keeps a package)'))}</option></select></div>`
  const note = `<p class="${CAPTION}">${escapeHtml(t('Leave a field empty to use the package value. Changing the package replaces these limits.'))}</p>`
  return on.length || packageFields
    ? fold(t('Account limits'), `<form class="v2-form" data-account-limits-form data-account-id="${escapeHtml(account.id)}"><h4 class="v2-sr">${escapeHtml(t('Account limits'))}</h4><div class="v2-whm-account-limit-grid">${fields}</div>${packageFields}${note}<p data-account-limits-status role="status" hidden></p><button class="v2-btn kt-btn kt-btn-outline" type="submit">${escapeHtml(t('Save limits'))}</button></form>`)
    : `<div class="v2-form v2-whm-accounts__fold py-4" data-account-limits-readonly><h4 class="text-base font-medium text-mono">${escapeHtml(t('Account limits'))}</h4><p class="${CAPTION}">${escapeHtml(t('Changing account limits is not qualified on this host or not permitted. Nothing can be saved here.'))}</p></div>`
}

/** A measured byte total; undefined when the host did not read or report it. */
const usedBytes = (total: MeasuredTotal | undefined): number | undefined => total?.state === 'read' && total.bytes !== null ? total.bytes : undefined

// Used / limit under its label. The bar is drawn only for a measured value against a finite limit; 80% warns, 95% is a problem.
function quota(t: Translate, label: string, used: MeasuredTotal | undefined, value: number | 'unlimited' | undefined, custom: boolean): string {
  // Limits are stored in MiB; both sides use the product byte format.
  const bytes = usedBytes(used), shown = bytes === undefined ? undefined : formatAsciiBytes(bytes), limit = typeof value === 'number' ? formatAsciiBytes(value * 1048576) : undefined
  const percent = bytes !== undefined && typeof value === 'number' && value > 0 ? Math.min(100, Math.round(bytes / (value * 1048576) * 1000) / 10) : undefined
  const tone = percent === undefined || percent < 80 ? 'info' : percent >= 95 ? 'bad' : 'warn'
  const bar = percent === undefined ? '' : `<div class="${BAR[tone]}" role="meter" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${escapeHtml(`${shown} / ${limit}`)}"><span class="${FILL[tone]}" style="inline-size:${percent}%"></span></div>`
  return `<small class="${CAPTION}">${escapeHtml(label)}</small><span class="${BODY}">${shown === undefined ? escapeHtml(t('Not read')) : ltr(shown)} / ${value === undefined ? escapeHtml(t('Not read')) : value === 'unlimited' ? escapeHtml(t('Unlimited')) : ltr(limit!)}</span>${bar}${custom ? `<small class="${CAPTION}">${escapeHtml(bytes === undefined ? t('Usage / the account’s own limit. Usage has not been read.') : t(msgctxt('theme:v2', 'Usage / the account’s own limit.')))}</small>` : ''}`
}

function details(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string {
  const principal = principalOf(props)!
  const plan = accountPlan(props, account)
  const owner = account.ownerId === null ? 'root' : principal.kind === 'reseller' && account.ownerId === principal.id ? principal.username : props.resellers?.find(item => item.id === account.ownerId)?.username
  const key = 'v2-account-detail-' + encodeURIComponent(account.username)
  const missing = t('Not read')
  const usage = props.accountUsage?.[account.id]
  const limit = (value: number | 'unlimited' | undefined, unit = ''): string => value === 'unlimited' ? t('Unlimited')
    : typeof value === 'number' && Number.isFinite(value) && value >= 0 ? String(value) + unit : missing
  const ioWrite = plan?.resources.ioWriteBps
  const ioWriteCap = ioWrite === 'unlimited' ? t('Unlimited')
    : typeof ioWrite === 'number' && Number.isFinite(ioWrite) && ioWrite >= 0 ? formatAsciiRate(ioWrite) : missing
  const mutation = (kind: 'contact' | 'password'): string => {
    const contact = kind === 'contact'
    const field = contact
      ? formField({ id: `v2-${account.username}-contact`, label: t('Contact email'), control: { kind: 'input', name: 'contactEmail', type: 'email', required: true, value: account.contactEmail, dir: 'ltr', disabled: !canManage } })
      : `<div class="v2-field kt-form-item"><label class="kt-form-label" for="v2-${escapeHtml(account.username)}-password">${escapeHtml(t('New password'))}</label><input id="v2-${escapeHtml(account.username)}-password" class="kt-input" name="password" type="password" required minlength="8" autocomplete="new-password"${canManage ? '' : ' disabled'}></div>`
    return `<${canManage ? 'form' : 'div'} class="v2-form"${canManage ? ` data-account-${kind}-form data-account-id="${escapeHtml(account.id)}"` : ' data-account-readonly-fields'}>${field}<p data-account-${kind}-status role="status" hidden></p><button class="v2-btn kt-btn kt-btn-outline" type="${canManage ? 'submit' : 'button'}"${canManage ? '' : ' disabled'}>${escapeHtml(t(contact ? 'Save email' : 'Change password'))}</button></${canManage ? 'form' : 'div'}>`
  }
  // Each group is a Metronic card of the profile pages: a titled header, then its fact table or its accordion of forms.
  const group = (suffix: string, title: string, body: string, content = 'kt-card-content flex flex-col gap-4 p-4'): string => `<section class="v2-whm-accounts__detail-group kt-card shadow-none" aria-labelledby="${key}-${suffix}"><div class="kt-card-header min-h-0 px-4 py-3"><h3 id="${key}-${suffix}" class="kt-card-title">${escapeHtml(title)}</h3></div><div class="${content}">${body}</div></section>`
  const identity = group('identity', t(msgctxt('theme:v2', 'Identity and plan')), factList([
    { label: t('Account'), value: account.username, mono: true }, { label: t('Primary domain'), value: account.primaryDomain, mono: true },
    { label: t('Plan'), value: plan?.name ?? missing }, { label: t('Owner'), value: owner ?? missing, ltr: owner !== undefined },
    { label: 'UID', value: String(account.uid), mono: true }, { label: t('Resource unit'), value: `xpanel-${account.uid}.slice`, mono: true },
    { label: 'IPv4', value: account.ipv4, mono: true }, ...(account.ipv6 ? [{ label: 'IPv6', value: account.ipv6, mono: true }] : []),
    { label: t('Shell'), value: account.shell, mono: true },
  ]))
  const capHtml = (value: number | 'unlimited' | undefined, unit = ''): string => {
    const shown = limit(value, unit)
    return `${escapeHtml(missing)} / ${typeof value === 'number' && Number.isFinite(value) && value >= 0 ? `<bdi dir="ltr">${escapeHtml(shown)}</bdi>` : escapeHtml(shown)}`
  }
  const limits = group('limits', t(msgctxt('theme:v2', 'Limits and usage')),
    `<p class="${CAPTION}">${escapeHtml(usage ? t(msgctxt('theme:v2', 'Usage / limit in force: the package value or the account’s own limit. Only disk and bandwidth usage are read.')) : t('Usage / limit in force: the package value or the account’s own limit. Usage has not been read.'))}</p>` + `<div class="v2-whm-accounts__usage"><div class="v2-whm-accounts__quota">${quota(t, t('Disk'), usage?.disk, plan?.resources.diskMb, account.limits?.resources?.diskMb !== undefined)}</div><div class="v2-whm-accounts__quota">${quota(t, t('Bandwidth per month'), usage?.traffic, plan?.resources.bandwidthMbMonth, account.limits?.resources?.bandwidthMbMonth !== undefined)}</div></div>` + factList([
      { label: t('Memory'), value: `${missing} / ${limit(plan?.resources.memoryMb, ' MiB')}`, valueHtml: capHtml(plan?.resources.memoryMb, ' MiB') },
      { label: 'CPU', value: `${missing} / ${limit(plan?.resources.cpuPercent, '%')}`, valueHtml: capHtml(plan?.resources.cpuPercent, '%') },
      { label: t('Processes'), value: `${missing} / ${limit(plan?.resources.maxProcesses)}`, valueHtml: capHtml(plan?.resources.maxProcesses) },
      { label: t('PHP workers'), value: `${missing} / ${limit(plan?.caps.phpWorkers)}`, valueHtml: capHtml(plan?.caps.phpWorkers) },
      { label: t('IO write cap'), value: ioWriteCap, ltr: typeof ioWrite === 'number' && Number.isFinite(ioWrite) && ioWrite >= 0 },
    ]))
  const contact = group('contact', t('Contact'), factList([{ label: t('Contact email'), value: account.contactEmail, mono: true }]) + (allowed(props, 'edit-account') ? fold(t(msgctxt('theme:v2', 'Edit account')), mutation('contact'), 'modify') : ''), 'kt-card-content flex flex-col gap-4 px-4 pt-4 pb-0')
  const edit = group('actions', t('Actions'), `${allowed(props, 'change-password') ? fold(t('Change password'), mutation('password'), 'password') : ''}${(!canManage || accountFor(props, account.username)) ? planOwnerForms(t, props, account, canManage) + limitsForm(t, props, account, canManage) : ''}${stateActions(t, props, account, canManage)}`, 'kt-card-content flex flex-col px-4 py-0')
  return `<section class="v2-whm-accounts__detail-body" data-account-detail-for="${escapeHtml(account.username)}" aria-label="${escapeHtml(account.username)}" hidden><div class="v2-whm-accounts__detail-summary flex flex-wrap items-center gap-4"><span class="v2-whm-accounts__avatar ${AVATAR} size-12 text-lg" aria-hidden="true">${escapeHtml(account.username.charAt(0).toUpperCase())}</span><div class="flex flex-col grow"><p class="v2-mono text-lg font-medium text-mono">${ltr(account.username)}</p><p class="v2-mono text-base font-normal text-secondary-foreground">${ltr(account.primaryDomain)}</p></div>${handoff(t, props, account, canManage, 'panel')}</div>${identity}${limits}${contact}${edit}</section>`
}

function detailAside(t: Translate, props: WhmSurfaceProps, accounts: readonly Account[], canManage: boolean): string {
  return `<aside id="v2-account-detail" class="v2-whm-accounts__detail-aside" data-account-details data-account-detail-panel aria-labelledby="v2-account-detail-title" hidden><div class="v2-whm-accounts__detail-header kt-drawer-header"><h2 id="v2-account-detail-title" class="kt-drawer-title">${escapeHtml(t(msgctxt('theme:v2', 'Account details')))}</h2><button type="button" class="v2-btn v2-whm-accounts__detail-close kt-btn kt-btn-icon kt-btn-ghost" data-account-detail-close aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Close account details')))}">${icon('x', 16)}</button></div>${accounts.map(account => details(t, props, account, canManage)).join('')}</aside>`
}

const handoff = (t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean, place: 'panel' | 'menu'): string => canManage && allowed(props, 'edit-account') && account.status === 'active'
  ? `<span class="v2-whm-accounts__handoff" data-handoff-control><button type="button" ${place === 'menu' ? 'role="menuitem" class="v2-menu__item kt-dropdown-menu-link"' : 'class="v2-btn v2-btn--primary kt-btn kt-btn-primary"'} data-handoff="xpanel" data-handoff-account="${escapeHtml(account.id)}" data-handoff-state="idle">${place === 'menu' ? MENU_GLYPHS.login : keenicon('entrance-left')}${escapeHtml(t('Log in to xPanel'))}</button><span data-handoff-status role="status" aria-live="polite" hidden></span></span>` : ''

/** Leading Keenicons of the hand-written row-menu items, sized as the kit's menu icons. */
const MENU_GLYPHS = { login: '<i class="v2-icon ki-filled ki-entrance-left text-base leading-none" aria-hidden="true"></i>', modify: '<i class="v2-icon ki-filled ki-pencil text-base leading-none" aria-hidden="true"></i>', password: '<i class="v2-icon ki-filled ki-key text-base leading-none" aria-hidden="true"></i>', plan: '<i class="v2-icon ki-filled ki-cube-2 text-base leading-none" aria-hidden="true"></i>', owner: '<i class="v2-icon ki-filled ki-user-edit text-base leading-none" aria-hidden="true"></i>' } as const

/** Suspend / Unsuspend and Delete carry the account they act on; the core action client opens its dialog from either place. */
function stateItems(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): RowMenuItem[] {
  if (!canManage || account.status === 'terminating') return []
  const attrs = { 'data-account-id': account.id, 'data-username': account.username, 'data-domain': account.primaryDomain } as const
  return [
    ...(allowed(props, 'suspend-account') ? [{ label: t(account.status === 'suspended' ? 'Unsuspend' : 'Suspend'), icon: account.status === 'suspended' ? 'okCircle' as const : 'xCircle' as const, hooks: { 'data-action': account.status === 'suspended' ? 'unsuspend-account' : 'suspend-account', ...attrs } }] : []),
    ...(allowed(props, 'terminate-account') ? [{ label: t('Delete'), icon: 'trash' as const, danger: true, hooks: { 'data-action': 'terminate-account', ...attrs } }] : []),
  ]
}

// The drawer closes with its account actions at the inline end: the soft-danger delete carries the Metronic trash icon.
const stateActions = (t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string => {
  const items = stateItems(t, props, account, canManage)
  return items.length ? `<div class="v2-whm-accounts__state-actions v2-whm-accounts__fold flex flex-wrap items-center justify-end gap-2 py-4">${items.map(item => `<button type="button" class="${item.danger ? 'v2-btn v2-btn--danger kt-btn kt-btn-outline kt-btn-destructive' : 'v2-btn kt-btn kt-btn-outline'}"${hookAttrs(item.hooks)}>${item.danger ? keenicon('trash') : item.icon ? icon(item.icon, 16) : ''}${escapeHtml(item.label)}</button>`).join('')}</div>` : ''
}

/** The parts of the details panel a row-menu item opens; only parts the panel renders are offered. */
function sectionOpeners(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): readonly (readonly [string, string])[] {
  const forms = Boolean(accountFor(props, account.username))
  return [
    ...(allowed(props, 'edit-account') ? [['modify', t(msgctxt('theme:v2', 'Edit account'))] as const] : []),
    ...(allowed(props, 'change-password') ? [['password', t('Change password')] as const] : []),
    ...(forms ? [['plan', t('Change plan')] as const, ['owner', t('Change owner')] as const] : []),
  ]
}

function actions(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string {
  if (!canManage) return `<span class="${CAPTION}">${escapeHtml(t('Read only'))}</span>`
  const id = `v2-account-${account.username}-menu`
  const items = stateItems(t, props, account, canManage)
  // Log in sits first in the row menu, as on the board; its status line stays inside the open menu.
  const login = handoff(t, props, account, canManage, 'menu')
  // Section openers open this account's details at that part; popovertargetaction closes the menu on the way.
  const openers = sectionOpeners(t, props, account, canManage).map(([section, label]) => `<li role="none"><button type="button" role="menuitem" class="v2-menu__item kt-dropdown-menu-link" data-account-detail-open="${escapeHtml(account.username)}" data-account-detail-section="${section}" aria-controls="v2-account-detail" aria-expanded="false" popovertarget="${escapeHtml(id)}" popovertargetaction="hide">${MENU_GLYPHS[section as keyof typeof MENU_GLYPHS] ?? ''}${escapeHtml(label)}</button></li>`).join('')
  if (!items.length && !login && !openers) return `<span class="${CAPTION}">${escapeHtml(t('Read only'))}</span>`
  return rowMenu({
    id,
    label: t(msgctxt('theme:v2', 'Actions for {username}'), { username: account.username }),
    prependItemsHtml: `${login ? `<li role="none">${login}</li>` : ''}${openers}`,
    items: items.map((item, index) => index === 0 && openers ? { ...item, separatorBefore: true } : item),
  })
}

function row(t: Translate, props: WhmSurfaceProps, account: Account, canManage: boolean): string {
  const principal = principalOf(props)!
  const plan = accountPlan(props, account)
  const owner = account.ownerId === null ? 'root' : principal.kind === 'reseller' && account.ownerId === principal.id ? principal.username : props.resellers?.find(item => item.id === account.ownerId)?.username
  const phoneLabel = (text: string): string => ` data-phone-label="${escapeHtml(text)}"`
  const usage = props.accountUsage?.[account.id]
  const ioWrite = plan?.resources.ioWriteBps
  const ioWriteCap = ioWrite === 'unlimited' ? escapeHtml(t('Unlimited'))
    : typeof ioWrite === 'number' && Number.isFinite(ioWrite) && ioWrite >= 0 ? ltr(formatAsciiRate(ioWrite)) : escapeHtml(t('Not read'))
  const status = account.status === 'active' ? t('Active') : account.status === 'suspended' ? t('Suspended') : t('Terminating')
  const fields = hookAttrs({ 'data-account-row': account.username, 'data-account-id': account.id, 'data-list-search': `${account.username} ${account.primaryDomain}`.toLowerCase(), 'data-list-owner': account.ownerId ?? '', 'data-list-plan': account.planId, 'data-list-state': account.status })
  const select = `<td><label class="v2-whm-accounts__selection"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" value="${escapeHtml(account.username)}" data-account-selection disabled><span class="v2-sr">${escapeHtml(t('Select account'))} ${ltr(account.username)}</span></label></td>`
  // The accessible name starts with the visible text (username and UID line), then names what the button opens.
  const opener = `<td><button type="button" class="v2-whm-accounts__opener" data-account-detail-open="${escapeHtml(account.username)}" aria-controls="v2-account-detail" aria-expanded="false" aria-label="${escapeHtml(`${account.username} UID ${account.uid} · ${t(msgctxt('theme:v2', 'Account details'))}`)}"><span class="v2-whm-accounts__avatar ${AVATAR} size-9 text-base" aria-hidden="true">${escapeHtml(account.username.charAt(0).toUpperCase())}</span><span><strong class="v2-mono text-base font-medium text-mono">${ltr(account.username)}</strong><small class="v2-mono whitespace-nowrap ${CAPTION}">UID ${ltr(account.uid)}</small></span></button></td>`
  // Secondary values sit under their primary cell: the addresses under the domain, the owner under the plan.
  const domain = `<td><div class="v2-whm-accounts__stack"><span class="v2-mono ${BODY}">${ltr(account.primaryDomain)}</span><small class="v2-mono ${CAPTION}" data-account-table-value="ip">${ltr(account.ipv4)}${account.ipv6 ? ` ${ltr(account.ipv6)}` : ''}</small></div></td>`
  const used = `<td><div class="v2-whm-accounts__stack"><div class="v2-whm-accounts__quota" data-account-table-value="disk">${quota(t, t('Disk'), usage?.disk, plan?.resources.diskMb, account.limits?.resources?.diskMb !== undefined)}</div><div class="v2-whm-accounts__quota" data-account-table-value="bandwidth">${quota(t, t('Bandwidth per month'), usage?.traffic, plan?.resources.bandwidthMbMonth, account.limits?.resources?.bandwidthMbMonth !== undefined)}</div></div></td>`
  const state = `<td><span data-account-status data-state="${account.status}"><span class="v2-pill v2-pill--state"><span class="v2-pill__dot" aria-hidden="true"></span><span data-account-status-label>${escapeHtml(status)}</span></span></span><template data-account-status-pending><span class="v2-pill v2-pill--warn kt-badge kt-badge-outline kt-badge-warning rounded-[30px]"><span class="v2-pill__dot kt-badge-dot" aria-hidden="true"></span><span data-account-status-label>${escapeHtml(t('Verification required'))}</span></span></template></td>`
  const planCell = `<td${phoneLabel(t('Plan'))}><div class="v2-whm-accounts__stack"><span class="${BODY}">${escapeHtml(plan?.name ?? t('Not read'))}</span><small class="${CAPTION}" data-account-table-value="owner">${escapeHtml(t('Owner'))} ${owner ? ltr(owner) : escapeHtml(t('Not read'))}</small></div></td>`
  return `<tr${fields}>${select}${opener}${domain}${used}${state}${planCell}<td data-account-table-value="io-write"${phoneLabel(t('IO write cap'))}>${ioWriteCap}</td><td class="v2-whm-accounts__actions">${actions(t, props, account, canManage)}</td></tr>`
}

// The native dialog wears the Metronic modal frame: a titled header, the body and a footer with its actions at the inline end.
function actionDialog(t: Translate, root: boolean): string {
  return `<dialog class="v2-whm-accounts__dialog" data-account-dialog aria-labelledby="v2-account-dialog-title" aria-describedby="v2-account-dialog-description"><form class="v2-form gap-0" method="dialog" data-account-action-form novalidate><div class="kt-modal-header"><h2 id="v2-account-dialog-title" class="kt-modal-title text-lg leading-(--lh-card)" data-account-dialog-title>${escapeHtml(t('Account action'))}</h2></div><div class="kt-modal-body flex flex-col gap-4"><p id="v2-account-dialog-description" class="text-base font-normal text-secondary-foreground" data-account-dialog-description></p><dl class="v2-whm-accounts__identity grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-border bg-muted/40 p-4"><div><dt>${escapeHtml(t('Account'))}</dt><dd><bdi dir="ltr" data-account-dialog-username></bdi></dd></div><div><dt>${escapeHtml(t('Primary domain'))}</dt><dd><bdi dir="ltr" data-account-dialog-domain></bdi></dd></div></dl><div class="v2-field kt-form-item" data-account-confirm-field hidden><label class="kt-form-label" for="v2-terminate-confirm-user">${escapeHtml(t('Type the username to confirm'))}</label><input id="v2-terminate-confirm-user" class="kt-input" name="confirmUsername" type="text" dir="ltr" autocomplete="off" spellcheck="false" data-type-to-confirm aria-describedby="v2-account-confirm-help"><span id="v2-account-confirm-help" class="v2-field__help kt-form-description block">${escapeHtml(t('Must exactly match the account above.'))}</span></div><div class="v2-field kt-form-item" data-account-reason-field hidden><label class="kt-form-label" for="v2-account-suspend-reason">${escapeHtml(t('Suspension reason'))}</label><textarea id="v2-account-suspend-reason" class="kt-textarea" name="reason" rows="2" maxlength="500"></textarea></div>${root ? `<label class="${SELECTION}" data-account-lock-field hidden><input type="checkbox" class="kt-checkbox kt-checkbox-sm" name="lock"><span>${escapeHtml(t('Prevent resellers from unsuspending this account'))}</span></label>` : ''}<p data-account-action-status role="status" aria-live="polite" tabindex="-1" hidden></p></div><div class="v2-whm-accounts__actions kt-modal-footer justify-end gap-2"><button type="button" class="v2-btn kt-btn kt-btn-outline" data-account-action-cancel>${escapeHtml(t('Cancel'))}</button><button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-account-action-submit disabled>${escapeHtml(t('Confirm'))}</button></div></form></dialog>`
}

export function renderV2WhmAccountList(t: Translate, props: WhmSurfaceProps, authority?: SurfaceAuthority): string {
  const canManage = authority ? authority.presentation === 'live' && authority.canManage : props.capabilityUnavailable !== true
  const principal = principalOf(props)
  const list: AccountListModel = principal ? accountListModel({ principal, activeReseller: props.activeReseller, accounts: readableAccounts(props, authority?.presentation === 'read-only' ? authority : undefined), plans: props.plans, resellers: props.resellers }) : { state: 'forbidden', accounts: [], owners: [], plans: [] }
  const empty = list.state === 'forbidden' ? t('Account listing is not permitted.') : list.state === 'unavailable' ? t('The account list is unavailable.') : t('No accounts.')
  // The bulk bar renders disabled; the bulk client enables only the actions this caller may run through the bulk API.
  const root = principal?.kind === 'root', listed = list.state === 'ready' || list.state === 'empty'
  const canSuspend = listed && canManage && allowed(props, 'suspend-account')
  const canPlan = listed && canManage && qualified(props, 'modify-account') && allowed(props, 'edit-account') && (root || allowed(props, 'change-plan'))
  const canOwner = listed && canManage && root && qualified(props, 'modify-account') && props.resellers !== undefined
  const plans = canPlan ? (props.plans ?? []).filter(plan => root || plan.ownerId === null || plan.ownerId === principal?.id) : []
  const owners = canOwner ? [{ id: '', username: 'root' }, ...(props.resellers ?? [])] : []
  const choices = `<div class="v2-whm-accounts__bulk-choices">${formField({ id: 'v2-account-bulk-plan', label: t('Plan for selected accounts'), control: { kind: 'select', disabled: true, options: plans.map(plan => ({ value: plan.id, label: plan.name })), hooks: { 'data-account-bulk-plan-choice': true } } })}${formField({ id: 'v2-account-bulk-owner', label: t('Owner for selected accounts'), control: { kind: 'select', disabled: true, options: owners.map(owner => ({ value: owner.id, label: owner.username })), hooks: { 'data-account-bulk-owner-choice': true } } })}</div>`
  // The bulk bar takes no room until a row is selected or a bulk result is shown; Select all sits in the table header.
  const bulkBar = `<div class="v2-whm-accounts__bulk"><output class="kt-badge kt-badge-outline kt-badge-primary rounded-[30px] font-medium" data-account-selected-count>${escapeHtml(t('0 selected'))}</output>${([['suspend', 'Suspend'], ['unsuspend', 'Unsuspend'], ['plan', 'Change plan'], ['owner', 'Change owner'], ['clear', 'Clear selection']] as const).map(([name, label]) => `<button type="button" class="${name === 'clear' ? 'v2-btn kt-btn kt-btn-ghost' : 'v2-btn kt-btn kt-btn-outline'}" data-account-bulk-control="${name}" disabled>${escapeHtml(t(label))}</button>`).join('')}${choices}<p class="${CAPTION}">${escapeHtml(t('Selected accounts change one at a time with the same checks as each account’s own action, up to 25 per request. Each result is listed here; nothing is retried automatically.'))}</p><p data-account-bulk-status role="status" hidden></p><ol class="v2-whm-accounts__bulk-results" data-account-bulk-results hidden></ol></div>`
  const selectAll = `<label class="v2-whm-accounts__selection"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-account-select-all disabled aria-label="${escapeHtml(t('Select loaded accounts'))}"><span class="v2-sr">${escapeHtml(t('Select'))}</span></label>`
  const statsLock = (engine: string, label: string): string => formField({ id: `v2-web-stats-lock-${engine}`, label, control: { kind: 'select', disabled: true, options: [{ value: '', label: t(msgid('Users choose')) }, { value: 'on', label: t(msgid('Locked on')) }, { value: 'off', label: t(msgid('Locked off')) }], hooks: { 'data-web-stats-lock': engine } } })
  // A reseller's statistics locks are a settings card of their own under the list: its fields, its state, then Save at the end.
  const statsLocks = principal?.kind === 'reseller' ? card({ title: t(msgid('Statistics engine locks')), titleId: 'v2-web-stats-locks-heading', hooks: { 'data-web-stats-locks': true, 'data-web-stats-enabled': String(listed && canManage && qualified(props, 'metrics-editor')) }, bodyHtml: `<p class="text-base font-normal text-secondary-foreground">${escapeHtml(t(msgid('A lock holds an engine on or off for every account you own, and account owners cannot change it. An engine root has not made available stays off.')))}</p><div class="v2-whm-accounts__lock-choices">${statsLock('analog', 'Analog')}${statsLock('awstats', 'AWStats')}${statsLock('webalizer', 'Webalizer')}</div><p class="text-base font-normal text-secondary-foreground" data-web-stats-locks-status role="status" data-state="unread">${escapeHtml(t(msgid('The statistics locks have not been read.')))}</p>`, footerHtml: `<button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-web-stats-locks-save disabled>${escapeHtml(t(msgid('Save')))}</button>` }) : ''
  // Status quick filters: the account list client binds data-list-state-chip to its status filter. The segments carry no
  // counts, so the whole toolbar stays one row at desktop width; the footer states the total.
  const quick = filterBar({ segments: { label: t('Status'), options: ([['', 'All'], ['active', 'Active'], ['suspended', 'Suspended'], ['terminating', 'Terminating']] as const).map(([value, label]) => ({ label: t(label), pressed: value === '', hooks: { 'data-list-state-chip': value } })) } })
  const columns = [t('Select'), t('Account'), t('Primary domain'), t('Usage'), t('Status'), t('Plan'), t('IO write cap'), t('Actions')]
  const table = `<div class="v2-table-scroll kt-scrollable-x-auto" role="region" aria-labelledby="v2-whm-accounts-list" tabindex="0"><table class="v2-table v2-whm-accounts__table kt-table text-start"><caption class="v2-sr">${escapeHtml(t('Accounts'))}</caption><thead><tr>${columns.map((label, index) => `<th scope="col">${index === 0 ? selectAll : escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${list.accounts.map(account => row(t, props, account, canManage)).join('') || `<tr><td colspan="${columns.length}"><p role="status">${escapeHtml(empty)}</p></td></tr>`}</tbody></table></div>`
  const note = props.accountUsage ? t(msgctxt('theme:v2', 'Usage / configured plan limit. An account the host did not report shows Not read.')) : t('Usage / configured plan limit. Usage has not been read.')
  const description = root && listed
    ? `${t(msgctxt('theme:v2', 'Hosting accounts, their configured plans and authorized actions.'))} ${t(msgctxt('theme:v2', 'Resellers see only the accounts they own.'))}`
    : t(msgctxt('theme:v2', 'Hosting accounts, their configured plans and authorized actions.'))
  // The list client reads its search, filters, shown range and pager inside the element that carries data-account-list-controls.
  const total = listed ? `${t(msgctxt('theme:v2', '{count, plural, one {# account in total.} other {# accounts in total.}}'), { count: list.accounts.length })} ${t(msgctxt('theme:v2', 'Newest first.'))}` : ''
  const bulk = `<div class="v2-whm-accounts__bulk-scope" data-approved-account-bulk${hookAttrs({ 'data-account-bulk-suspend': String(canSuspend), 'data-account-bulk-plan': String(canPlan), 'data-account-bulk-owner': String(canOwner) })}>${bulkBar}${table}</div>`
  const listBody = `<div class="v2-whm-accounts__list"${listed ? ' data-account-list-controls data-list-page-size="20"' : ''}>${listed ? `<div class="v2-whm-accounts__toolbar">${filters(t, list, quick)}</div>` : ''}${bulk}${listed ? noMatches(t) : ''}${listFooter(t, total, note, listed)}</div>`
  return `<div class="v2-layout v2-whm-accounts" data-accounts-workspace data-account-detail-workspace="/whm/accounts" tabindex="-1">${pageHeader(t, { breadcrumb: [{ label: t('Home'), href: '/whm' }, { label: t('Accounts') }], route: '/whm/accounts', title: t('Accounts'), description, ...(root || (canManage && canCreate(props)) ? { actionsHtml: `${root ? `<a href="/whm/plans" class="v2-btn kt-btn kt-btn-outline">${icon('package', 16)}${escapeHtml(t('Plans'))}</a>` : ''}${canManage && canCreate(props) ? `<a href="/whm/accounts/new" class="v2-btn v2-btn--primary kt-btn kt-btn-primary">${icon('plus', 16)}${escapeHtml(t('Create account'))}</a>` : ''}` } : {}) })}<div class="v2-whm-accounts__body"><div class="v2-whm-accounts__main"><section class="v2-card v2-card--flush kt-card" aria-labelledby="v2-whm-accounts-list"><div class="v2-card__body kt-card-table"><h2 id="v2-whm-accounts-list" class="v2-sr">${escapeHtml(t(msgctxt('theme:v2', 'Account list')))}</h2>${listBody}</div></section>${statsLocks}</div>${detailAside(t, props, list.accounts, canManage)}</div>${actionDialog(t, principal?.kind === 'root')}</div>`
}

/// Structure, bidi and controller states: surfaces, type and spacing come from the Metronic classes in the markup.
// Rhythm: 8px label to value, 16px between fields, 24px between groups, 32px between sections.
export const WHM_ACCOUNTS_CSS = `${stateTones('.v2-whm-accounts [data-account-status]', 'data-state', { active: 'ok', suspended: 'warn', terminating: 'bad', 'verification-required': 'warn' })}
.v2-layout.v2-whm-accounts{gap:1.5rem}
.v2-whm-accounts__body{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:2rem;min-inline-size:0}
.v2-whm-accounts__main{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-whm-accounts__list{display:flex;flex-direction:column;min-inline-size:0}
.v2-whm-accounts__toolbar{padding:.5rem 1.5rem;border-block-end:1px solid var(--line)}
.v2-whm-accounts__filters{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;min-inline-size:0}
.v2-whm-accounts__filters>.v2-filter{flex:none;padding:0}
.v2-whm-accounts__filter-control{flex:1 1 8.5rem;min-inline-size:0}
.v2-whm-accounts__filter-search{position:relative;flex:1.5 1 10rem}
.v2-whm-accounts__filter-control>:is(input,select){inline-size:100%}
.v2-whm-accounts__clear{flex:none}
.v2-whm-accounts__count:empty{display:none}
.v2-whm-accounts__count,.v2-whm-accounts [data-account-selected-count],.v2-whm-accounts__pager [data-list-page],.v2-whm-accounts [data-list-state-chip] .v2-count,.v2-whm-accounts__opener small,.v2-whm-accounts [data-account-table-value=ip],.v2-whm-accounts [data-account-table-value=io-write],.v2-whm-accounts__detail-body .v2-facts dd,.v2-whm-accounts__identity dd,.v2-whm-account-limit-grid input[type=text],.v2-whm-accounts__quota>span{font-variant-numeric:tabular-nums}
.v2-whm-accounts__empty{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:2rem 1.5rem;border-block-start:1px solid var(--line);text-align:center}
.v2-whm-accounts__empty>.v2-icon{color:var(--muted)}
.v2-whm-accounts__bulk,.v2-whm-accounts__pager,.v2-whm-accounts__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-whm-accounts__bulk-scope{display:flex;flex-direction:column;min-inline-size:0}
.v2-whm-accounts__bulk{padding:1rem 1.5rem;border-block-end:1px solid var(--accent-line);background:var(--accent-soft)}
.v2-whm-accounts__bulk-scope:not(:has(:is([data-account-selection],[data-account-select-all]):checked,[data-account-bulk-status]:not([hidden]),[data-account-bulk-results]:not([hidden])))>.v2-whm-accounts__bulk{display:none}
.v2-whm-accounts__bulk>:is(p,ol,.v2-whm-accounts__bulk-choices){flex-basis:100%}
.v2-whm-accounts__bulk>p[role]{font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-whm-accounts__lock-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(11.25rem,100%),1fr));gap:1rem}
.v2-whm-accounts__bulk-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.v2-whm-accounts__bulk-results{list-style:none;display:flex;flex-direction:column;gap:.5rem;font-size:.8125rem;line-height:1.25rem}
.v2-whm-accounts__bulk-results>li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem}
.v2-whm-accounts__table{inline-size:100%}
.v2-whm-accounts__table td .v2-mono{overflow-wrap:anywhere}
@media(min-width:601px){.v2-whm-accounts__quota>span{white-space:nowrap}.v2-whm-accounts__table td.v2-whm-accounts__actions{display:table-cell;text-align:end;white-space:nowrap}.v2-whm-accounts__table td.v2-whm-accounts__actions>*{vertical-align:middle}.v2-whm-accounts__table th:last-child{text-align:end}.v2-whm-accounts__table :is(th,td):first-child{inline-size:3rem}.v2-whm-accounts__table :is(th,td):nth-child(3){inline-size:22%}.v2-whm-accounts__table td:nth-child(3) .v2-whm-accounts__stack>span.v2-mono{overflow-wrap:normal}}
@media(min-width:601px) and (max-width:1439px){.v2-whm-accounts__table th{white-space:normal}}
@media(max-width:600px){.v2-whm-accounts__table [data-phone-label]{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:.5rem;text-align:start}.v2-whm-accounts__table [data-phone-label]::before{content:attr(data-phone-label);font-size:.875rem;line-height:var(--lh-label);color:var(--text-2)}.v2-whm-accounts__table tr>td:first-child{grid-column:auto}.v2-whm-accounts__table tr>td:nth-child(3):not([data-phone-label]){grid-column:1/-1;grid-row:auto;justify-self:start;text-align:start;overflow-wrap:anywhere}.v2-whm-accounts__table tr>td:nth-child(4){grid-column:1/-1}.v2-whm-accounts__table td .v2-whm-accounts__stack{gap:.5rem}.v2-whm-accounts__table tr>td:has([data-account-status]){grid-column:2;grid-row:1;justify-self:end;align-self:center}
.v2-whm-accounts .v2-whm-accounts__table:has(td)>thead{position:static;width:auto;height:auto;overflow:visible;clip-path:none}
.v2-whm-accounts .v2-whm-accounts__table>thead>tr:has(>:first-child [type=checkbox]){display:flex;gap:0;padding:0;border-block-end:1px solid var(--line)}
.v2-whm-accounts .v2-whm-accounts__table>thead>tr:has(>:first-child [type=checkbox])>th{position:static;display:flex;align-items:center;min-block-size:var(--target)}
.v2-whm-accounts .v2-whm-accounts__table>thead>tr>th:nth-child(2){flex:1 1 auto}
.v2-whm-accounts .v2-whm-accounts__table>thead .v2-whm-accounts__selection{margin-inline-start:1rem}
.v2-whm-accounts .v2-whm-accounts__table>thead>tr:has(>:first-child [type=checkbox])>th:nth-child(n+3){position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}}
.v2-whm-accounts__opener{display:inline-flex;align-items:center;gap:.5rem;max-inline-size:100%;min-inline-size:var(--target);min-block-size:var(--target);padding:0;border:0;background:transparent;color:var(--text);font:inherit;text-align:start;cursor:pointer}
.v2-whm-accounts__opener>span:last-child{display:flex;flex-direction:column;min-inline-size:0}
.v2-whm-accounts__opener strong{white-space:nowrap}
.v2-whm-accounts__opener:hover strong,.v2-whm-accounts__opener[aria-expanded=true] strong{color:var(--accent)}
.v2-menu__list .v2-whm-accounts__handoff{align-items:stretch;inline-size:100%}
.v2-menu__list [data-handoff-status]{padding:0 .5rem .5rem;font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-whm-accounts__stack{display:flex;flex-direction:column;gap:.25rem;min-inline-size:0}
.v2-whm-accounts__usage{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.v2-whm-accounts__usage>.v2-whm-accounts__quota>span{font-weight:500;color:var(--mono,var(--text))}
.v2-whm-accounts__selection{display:inline-flex;align-items:center;justify-content:center;min-block-size:var(--target);min-inline-size:var(--target);cursor:pointer}
.v2-whm-accounts__quota>.v2-bar{align-self:stretch;min-inline-size:4.5rem;max-inline-size:10rem}
.v2-whm-accounts__usage .v2-bar{max-inline-size:none}
.v2-whm-accounts__quota,.v2-whm-accounts__handoff{display:flex;flex-direction:column;align-items:flex-start;gap:.25rem}
@media(min-width:1700px){.v2-whm-accounts[data-account-detail-selected] .v2-whm-accounts__body{grid-template-columns:minmax(0,1fr) minmax(22.5rem,27.5rem)}}
@media(max-width:1699px){.v2-whm-accounts .v2-whm-accounts__detail-aside{position:fixed;inset-block:0;inset-inline-end:0;z-index:75;inline-size:min(27.5rem,100%);overflow-y:auto;overscroll-behavior:contain;border-radius:0;border-block:0;border-inline-end:0;box-shadow:0 0 0 100vmax var(--scrim),var(--shadow)}}
.v2-whm-accounts__body>*,.v2-whm-accounts__detail-body,.v2-whm-accounts__detail-summary>div{min-inline-size:0}
.v2-whm-accounts__detail-aside{border:1px solid var(--line);border-radius:var(--radius-card);background:var(--popover,var(--surface));color:var(--popover-foreground,var(--text));box-shadow:var(--shadow)}
.v2-whm-accounts__detail-header{position:sticky;inset-block-start:0;z-index:1;border-start-start-radius:inherit;border-start-end-radius:inherit;background:var(--popover,var(--surface))}
.v2-whm-accounts__detail-body{display:flex;flex-direction:column;gap:1.5rem;padding:1.5rem}
.v2-whm-accounts__detail-summary p{overflow-wrap:anywhere}
.v2-whm-accounts__detail-summary>.v2-whm-accounts__handoff{align-items:flex-end}
.v2-whm-accounts__detail-summary [data-handoff-status]{font-size:.8125rem;line-height:1.25rem;color:var(--text-2)}
.v2-whm-accounts__detail-body .v2-facts{grid-template-columns:repeat(auto-fit,minmax(min(12rem,100%),1fr))}
.v2-whm-accounts__detail-body .v2-facts>div{gap:.5rem}
.v2-whm-accounts__detail-body .v2-facts dt{text-box:trim-end text}
.v2-whm-accounts__detail-body .v2-facts dd{min-inline-size:0;overflow-wrap:anywhere}
.v2-whm-accounts__mutation{display:flex;flex-direction:column}
.v2-whm-accounts__fold{border-block-start:1px solid var(--line)}
.v2-whm-accounts .kt-card-content>.v2-whm-accounts__fold:first-child,.v2-whm-accounts .kt-card-content>.v2-whm-accounts__mutation:first-child>.v2-whm-accounts__fold:first-of-type{border-block-start:0}
.v2-whm-accounts__fold>summary{list-style:none;min-block-size:var(--target)}
.v2-whm-accounts__fold>summary::-webkit-details-marker{display:none}
.v2-whm-accounts__fold>summary .v2-icon{transition:transform .2s ease-out}
.v2-whm-accounts__fold[open]>summary .v2-icon{transform:rotate(180deg)}
.v2-whm-accounts__fold>summary:hover .kt-accordion-title{color:var(--accent)}
.v2-whm-accounts__fold>summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:var(--radius-control)}
.v2-whm-accounts__fold[open]>:not(summary){padding-block-end:1.5rem}
.v2-whm-accounts__fold .v2-form{gap:1rem}
.v2-whm-accounts__fold .v2-form>.v2-btn{align-self:flex-end}
.v2-whm-account-limit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.v2-whm-account-limit-grid .v2-field{min-inline-size:0}
.v2-whm-accounts__dialog{inline-size:min(35rem,calc(100% - 2rem));margin:auto;padding:0;border:1px solid var(--line);border-radius:.5rem;background:var(--popover,var(--surface));color:var(--popover-foreground,var(--text));box-shadow:var(--v2-elev,var(--shadow))}
.v2-whm-accounts__dialog::backdrop{background:var(--scrim)}
.v2-whm-accounts__identity>div{display:flex;flex-direction:column;gap:.5rem;text-align:start}
.v2-whm-accounts__identity dt{font-size:.875rem;line-height:1.375rem;font-weight:500;color:var(--text-2);text-box:trim-end text}
.v2-whm-accounts__identity dd{overflow-wrap:anywhere;font-family:var(--font-mono);font-size:1rem;line-height:1.5rem;font-weight:500;color:var(--mono,var(--text))}
.v2-whm-accounts__dialog:has([data-account-confirm-field]:not([hidden])) [data-account-action-submit]{border-color:var(--destructive,var(--bad))!important;background:var(--destructive,var(--bad))!important;color:var(--destructive-foreground,var(--surface))!important}
.v2-whm-accounts__dialog:has([data-account-reason-field]:not([hidden])) [data-account-action-submit]{border:1px solid color-mix(in oklab,var(--destructive,var(--bad)) 40%,transparent)!important;background:var(--surface)!important;color:var(--destructive,var(--bad))!important}
@media(max-width:600px){.v2-whm-accounts__toolbar,.v2-whm-accounts__bulk{padding-inline:1rem}.v2-whm-accounts__filters>.v2-filter,.v2-whm-accounts__filter-control,.v2-whm-accounts__filter-search{flex:1 1 100%}.v2-whm-accounts__bulk-choices,.v2-whm-account-limit-grid,.v2-whm-accounts__usage{grid-template-columns:1fr}.v2-whm-accounts__detail-body{padding:1rem}}
`
