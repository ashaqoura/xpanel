import type { PanelSurfaceProps } from '../../../../contract.ts'
import { localeDirection, type Locale, type Translate } from '../../../../../i18n.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import { card, notice, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { v2Messages } from '../../../messages.ts'
import { phoneLabelCss, phoneLabels } from '../settings/common.ts'
import { mailCardsFor } from '../../../../../mail-cards.ts'
import { renderV2MailCards } from '../../mail-cards.ts'

/** Core resolves route admission and the current account before calling these renderers. */
export interface PanelEmailAuthority {
  readonly canRead: boolean
  readonly presentation?: 'live' | 'read-only'
  readonly canReadFacts?: boolean
  readonly authorizedTools?: ReadonlySet<string>
  readonly canManage: boolean
}

export const NO_EMAIL_AUTHORITY: PanelEmailAuthority = Object.freeze({ canRead: false, canManage: false })
/** The mail tool cards of one account page; read-only documents keep them inert. */
export const panelMailCards = (route: string, locale: Locale, t: Translate, canRead: boolean, canManage: boolean, domains: readonly string[] = []): string => renderV2MailCards(mailCardsFor(route, t, { canRead, canAct: () => canManage, domains }), locale)
export const esc = escapeHtml
export const technical = (value: string | number): string => `<bdi dir="ltr" class="v2-mono">${esc(normalizeAsciiDigits(value))}</bdi>`
export function emailContext(props: PanelSurfaceProps, authority: PanelEmailAuthority = NO_EMAIL_AUTHORITY) {
  const locale = props.locale ?? 'en'
  const t = v2Messages.translator(locale)
  const readOnly = authority.presentation === 'read-only'
  const principal = props.visibility?.principal
  const identityMatches = principal?.kind === 'user' && props.account?.id === principal.accountId
  const factsReadable = readOnly && authority.canReadFacts === true && identityMatches
  const account = authority.canRead || factsReadable ? props.account : undefined
  const canManage = !!account && account.status === 'active' && authority.canManage && !readOnly
  const domains = account && (!readOnly || authority.authorizedTools?.has('domains')) ? props.domains?.filter(row => row.accountId === account.id) : undefined
  const mailboxes = account && (!readOnly || authority.authorizedTools?.has('email-accounts')) ? props.serviceUsers?.filter(row => row.accountId === account.id && row.services.email) : undefined
  const plan = account && (!readOnly || authority.authorizedTools?.has('server-information')) && props.plan?.id === account.planId ? props.plan : undefined
  return { locale, t, account, canManage, domains, mailboxes, plan, factsReadable }
}

/** Keenicons the v2 icon set lacks. Inside a button the button sizes the glyph. */
export const mailGlyph = {
  trash: '<i class="ki-filled ki-trash" aria-hidden="true"></i>',
  key: '<i class="ki-filled ki-key" aria-hidden="true"></i>',
  send: '<i class="ki-filled ki-paper-plane" aria-hidden="true"></i>',
  upload: '<i class="ki-filled ki-exit-up" aria-hidden="true"></i>',
  play: '<i class="ki-filled ki-rocket" aria-hidden="true"></i>',
  older: '<i class="ki-filled ki-double-left-arrow v2-flip" aria-hidden="true"></i>',
  newest: '<i class="ki-filled ki-double-right-arrow v2-flip" aria-hidden="true"></i>',
  allow: '<i class="ki-filled ki-shield-tick" aria-hidden="true"></i>',
} as const

/** The button hierarchy of a card: one primary, outline for the rest, ghost to step back, soft red to remove. */
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const

export interface PanelButtonLook {
  /** Leading glyph markup: `icon(...)` of the v2 set or a {@link mailGlyph}. */
  icon?: string
  kind?: 'outline' | 'ghost' | 'danger'
  /** Row and toolbar size. */
  small?: boolean
}

export const button = (label: string, hooks?: HookAttributes, disabled = true, primary = false, look: PanelButtonLook = {}): string =>
  `<button type="button" class="${primary ? BUTTON.primary : BUTTON[look.kind ?? 'outline']}${look.small ? ' kt-btn-sm' : ''}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${look.icon ?? ''}${esc(label)}</button>`
export const actions = (body: string): string => `<div class="v2-panel-extra__actions">${body}</div>`
/** The closing actions of a form or card: stepping back first, the primary action at the end. */
export const endActions = (body: string): string => `<div class="v2-panel-extra__actions justify-end">${body}</div>`
export const fields = (body: string): string => `<div class="v2-panel-extra__fields">${body}</div>`
export function field(id: string, label: string, control: string, help?: string): string {
  const described = help && !control.includes('aria-describedby=')
    ? control.replace(/<(input|select|textarea)\b/, `<$1 aria-describedby="${esc(id)}-help"`) : control
  return `<div class="v2-field"><label class="kt-form-label" for="${esc(id)}">${esc(label)}</label>${described}${help ? `<p id="${esc(id)}-help" class="v2-field__help kt-form-description">${esc(help)}</p>` : ''}</div>`
}
export const input = (id: string, hooks?: HookAttributes, extra = '', disabled = true): string =>
  `<input class="kt-input" id="${esc(id)}"${hookAttrs(hooks)}${extra}${disabled ? ' disabled' : ''}>`
export const area = (id: string, hooks?: HookAttributes, extra = '', disabled = true): string =>
  `<textarea class="kt-textarea" id="${esc(id)}"${hookAttrs(hooks)}${extra}${disabled ? ' disabled' : ''}></textarea>`
export const select = (id: string, options: readonly (readonly [string, string])[], hooks?: HookAttributes, disabled = true, extra = '', selectedValue?: string): string =>
  `<span class="v2-select"><select class="kt-select" id="${esc(id)}"${hookAttrs(hooks)}${extra}${disabled ? ' disabled' : ''}>${options.map(([value, label]) => `<option value="${esc(value)}"${value === selectedValue ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select></span>`
export const check = (id: string, label: string, hooks?: HookAttributes, disabled = true, checked = false, extra = ''): string =>
  `<label class="v2-panel-extra__check" for="${esc(id)}"><input class="kt-checkbox kt-checkbox-sm" id="${esc(id)}" type="checkbox"${hookAttrs(hooks)}${extra}${disabled ? ' disabled' : ''}${checked ? ' checked' : ''}><span>${esc(label)}</span></label>`
/** Label and value rows on the email pages, as in a Metronic "General info" list. */
export const facts = (rows: readonly { label: string; valueHtml: string; hooks?: HookAttributes }[]): string =>
  `<dl class="v2-panel-extra__facts">${rows.map(row => `<div><dt class="text-sm text-secondary-foreground">${esc(row.label)}</dt><dd class="text-sm text-mono"${hookAttrs(row.hooks)}>${row.valueHtml}</dd></div>`).join('')}</dl>`
export const section = (id: string, title: string, bodyHtml: string, hooks?: HookAttributes, actionsHtml?: string): string =>
  card({ title, titleId: `${id}-heading`, bodyHtml, ...(hooks ? { hooks } : {}), ...(actionsHtml ? { actionsHtml } : {}) })
export const table = (id: string, label: string, columns: readonly string[], bodyHtml: string, hooks?: HookAttributes, headHooks?: HookAttributes): string =>
  `<div class="v2-panel-extra__table kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(label)}"><table id="${esc(id)}" class="v2-table kt-table align-middle"${phoneLabels(columns)}><caption class="v2-sr">${esc(label)}</caption><thead${hookAttrs(headHooks)}><tr>${columns.map(column => `<th scope="col">${esc(column)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}>${bodyHtml}</tbody></table></div>`
export const unread = (t: Translate, columns: number): string => `<tr><td colspan="${columns}">${esc(t(msgid('Nothing has been read.')))}</td></tr>`
export const state = (message: string, hooks?: HookAttributes): string => `<p data-state="unread" role="status"${hookAttrs(hooks)}>${esc(message)}</p>`
export const header = (t: Translate, route: string, title: string, description: string): string =>
  pageHeader(t, { route, title, description, breadcrumb: [{ label: t(msgid('Home')), href: '/home' }, { label: title }] })
export function missingAccount(t: Translate, route: string, title: string): string {
  return `<section class="v2-panel-extra">${header(t, route, title, t(msgid('Manage your hosting account and domains.')))}${notice(t, { tone: 'warn', lead: t(msgid('Unavailable')), text: t(msgctxt('theme:v2', 'An authorized account has not been read.')), urgent: true })}</section>`
}
export function page(locale: Locale, route: string, bodyHtml: string, hooks?: HookAttributes): string {
  return `<section class="v2-panel-extra" lang="${esc(locale)}" dir="${localeDirection(locale)}" data-v2-panel-page="${esc(route)}"${hookAttrs(hooks)}>${bodyHtml}</section>`
}

// The email pages lay their forms out as Metronic settings rows and their facts as label and value rows; the
// observation pages that share these helpers keep their own grids, so those rules are scoped to the email routes.
const MAIL = '.v2-panel-extra[data-v2-panel-page^="/email/"]'
const STATUS = ':not(:empty,[hidden],[data-state=failed],[data-state=error])'

/** Shared by these account email and observation pages; no global layout or token changes. Layout only: colors,
 *  radii, control and button looks come from the Metronic classes in the markup; gaps use the Metronic scale. */
export const PANEL_ADDITIONAL_CSS = `.v2-panel-extra{--v2-extra-gap:1.25rem;display:flex;flex-direction:column;gap:var(--v2-extra-gap);min-inline-size:0}
@media(min-width:1024px){.v2-panel-extra{--v2-extra-gap:1.875rem}}
.v2-panel-extra .v2-field{gap:.625rem}
.v2-panel-extra .v2-field>p{font-size:.75rem;line-height:1.5;color:var(--text-2)}
.v2-panel-extra .v2-card__body{gap:1.25rem}
.v2-panel-extra__groups,.v2-panel-extra__editor,.v2-panel-extra fieldset{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem;min-inline-size:0}
.v2-panel-extra>.v2-panel-extra__groups{gap:var(--v2-extra-gap)}
.v2-panel-extra [data-filter-editor] [data-filter-group]{display:grid;gap:1rem;min-inline-size:0}
.v2-panel-extra__handoff{display:flex;flex-direction:column;align-items:flex-start;gap:.375rem;min-inline-size:0}
.v2-panel-extra fieldset{margin:0;padding:0;border:0}
.v2-panel-extra legend{margin-block-end:.625rem;padding:0;font-size:.875rem;font-weight:600;color:var(--mono,var(--text))}
.v2-panel-extra__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:1.25rem;min-inline-size:0}
.v2-panel-extra__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-panel-extra__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:1rem;min-inline-size:0}
.v2-panel-extra__facts>div{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0;text-align:start}
.v2-panel-extra__facts :is(dt,dd){text-align:start;overflow-wrap:anywhere}
.v2-panel-extra :is(.v2-num,.v2-panel-extra__facts dd,td,time,[data-filter-count],[data-quarantine-total],[data-quarantine-score]){font-variant-numeric:tabular-nums}
.v2-panel-extra__check{display:flex;align-items:center;gap:.5rem;min-block-size:var(--target);font-size:.875rem;color:var(--text)}
.v2-panel-extra__check>input{margin-block:0;flex:none}
.v2-panel-extra__table{overflow:auto;min-inline-size:0;max-inline-size:100%;border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-panel-extra .v2-card p{font-size:.875rem;line-height:1.5}.v2-panel-extra .v2-card :is(h3,legend){font-size:.875rem}
.v2-panel-extra .v2-card__body>p:not([role],[class]),.v2-panel-extra .v2-card__body>:is(form,div)>p:not([role],[class]){color:var(--text-2)}
.v2-panel-extra .v2-card p[role=status]${STATUS}{padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken);color:var(--text)}
.v2-panel-extra__table td[colspan]{padding-block:1.25rem;color:var(--muted);text-align:center}
.v2-panel-extra__table :is(th,td){text-align:start}
.v2-panel-extra__table tbody :is(td,th):first-child:not([colspan]){font-weight:500;color:var(--mono,var(--text))}
.v2-panel-extra__table td .v2-btn{block-size:1.75rem;min-block-size:1.75rem;padding-inline:.625rem;gap:.3125rem;font-size:.75rem}
.v2-panel-extra__table td .v2-panel-extra__actions{gap:.375rem}
.v2-panel-extra__list{display:grid;gap:.625rem;min-inline-size:0}
.v2-panel-extra__list>li{padding:.875rem var(--v2-panel-padding);border:1px solid var(--line);border-radius:var(--radius-notice);display:grid;gap:.625rem;min-inline-size:0}
.v2-panel-extra__scope{display:grid;gap:.5rem;padding-inline-start:1.25rem}
.v2-panel-extra :is(p,dd){overflow-wrap:anywhere}
.v2-panel-extra :is(input,select,.v2-select,textarea){min-inline-size:0;max-inline-size:100%}
.v2-panel-extra :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-panel-extra textarea{inline-size:100%;resize:vertical;min-block-size:6rem}
.v2-panel-extra pre{white-space:pre-wrap;overflow-wrap:anywhere;max-inline-size:100%;min-inline-size:0;text-align:start}
.v2-panel-extra pre.v2-panel-extra__raw{direction:ltr;white-space:pre;overflow:auto;padding:.875rem;background:var(--code);color:var(--code-text);border-radius:var(--radius-notice);font-size:.75rem;line-height:1.6}
.v2-panel-extra [role=status][data-state=uncertain]{padding:.875rem;border:1px solid var(--warn-line);background:var(--warn-soft);border-radius:var(--radius-notice)}
.v2-panel-extra :is(p,ol,pre):empty{display:none}
.v2-panel-extra .v2-mail-card__scroll{border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-panel-extra [data-email-disk-usage] .v2-card__body>.v2-btn{align-self:flex-start}
.v2-panel-extra [data-email-disk-usage] [role=region]{overflow:auto;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-panel-extra [data-email-disk-usage] :is(th,td){text-align:start}
.v2-panel-extra [data-email-disk-usage] td[colspan]{padding-block:1.25rem;color:var(--muted);text-align:center}
.v2-panel-extra [data-email-disk-usage] th>.v2-btn{margin-inline-start:-.625rem}
.v2-panel-extra [hidden]{display:none}
.v2-panel-extra:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-panel-extra *{letter-spacing:0}
${MAIL} .v2-card__body{container-type:inline-size}
${MAIL} .v2-panel-extra__fields{grid-template-columns:minmax(0,1fr)}
${MAIL} .v2-field{display:grid;grid-template-columns:minmax(0,1fr);align-items:baseline;gap:.625rem;min-inline-size:0}
${MAIL} .v2-field>*{min-inline-size:0}
${MAIL} .v2-field>:is(label,.v2-label,.v2-field__label){line-height:1.25}
${MAIL} .v2-field>:is(input,select,textarea,.v2-select){inline-size:100%}
${MAIL} .v2-panel-extra__facts:not(.v2-dav-guide){display:grid;grid-template-columns:minmax(0,1fr);gap:.625rem}
${MAIL} .v2-panel-extra__facts:not(.v2-dav-guide)>div{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:.25rem .625rem}
${MAIL} .v2-panel-extra__facts:not(.v2-dav-guide) dt{flex:0 0 9rem;max-inline-size:100%}
${MAIL} .v2-panel-extra__facts:not(.v2-dav-guide) dd{flex:1 1 12rem;min-inline-size:0}
@container (min-width:40rem){${MAIL} .v2-field{grid-template-columns:14rem minmax(0,1fr);column-gap:.625rem}${MAIL} .v2-field>:not(label,.v2-field__label,.v2-label){grid-column:2}${MAIL} .v2-field:has(>textarea,>pre){align-items:start}${MAIL} .v2-field:has(>textarea,>pre)>:is(label,.v2-label){padding-block-start:.625rem}${MAIL} .v2-panel-extra__facts:not(.v2-dav-guide) dt{flex-basis:14rem}${MAIL} .v2-panel-extra__fields>.v2-panel-extra__check,${MAIL} .v2-card__body>.v2-panel-extra__check,${MAIL} :is(form,.v2-panel-extra__editor,.v2-panel-extra__groups)>.v2-panel-extra__check{margin-inline-start:14.625rem}}
@media(max-width:600px){.v2-panel-extra__fields{grid-template-columns:minmax(0,1fr)}.v2-panel-extra__facts{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-panel-extra .v2-table thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-panel-extra :is(.v2-mail-card__scroll,.v2-table-wrap):has(tbody:empty){display:none}.v2-panel-extra__actions>button{flex:1 1 auto}.v2-panel-extra__table{border:0;border-block-start:1px solid var(--line);border-radius:0}.v2-panel-extra__groups[data-account-quarantine] .v2-panel-extra__actions>button{max-inline-size:100%;white-space:normal}}
.v2-panel-extra__stack{display:grid;gap:.25rem}.v2-panel-extra__stack--wide{display:flex;flex-wrap:wrap;gap:.375rem}.v2-panel-extra__field{display:flex;flex-direction:column;gap:.625rem;min-inline-size:0}
${phoneLabelCss('.v2-panel-extra')}
@media(max-width:600px){.v2-panel-extra table:not(:has(td)) thead{position:static;inline-size:auto;block-size:auto;clip-path:none}.v2-panel-extra table:not(:has(td)) thead tr{display:flex;flex-wrap:wrap;gap:.25rem 1rem;padding:.5rem 0}.v2-panel-extra table:not(:has(td)) th{padding:0;background:none}}
@media(min-width:601px){.v2-panel-extra #v2-email-archive-records{table-layout:fixed;inline-size:100%}.v2-panel-extra #v2-email-archive-records td>:is(select,.v2-select,input:not([type=checkbox])){inline-size:100%;min-inline-size:0}.v2-panel-extra #v2-email-archive-records th:nth-child(1){inline-size:17%}.v2-panel-extra #v2-email-archive-records th:nth-child(2){inline-size:24%}.v2-panel-extra #v2-email-archive-records th:nth-child(3){inline-size:8%}.v2-panel-extra #v2-email-archive-records th:nth-child(4){inline-size:8%}.v2-panel-extra #v2-email-archive-records th:nth-child(5){inline-size:11%}.v2-panel-extra #v2-email-archive-records th:nth-child(6){inline-size:13%}.v2-panel-extra #v2-email-archive-records th:nth-child(7){inline-size:19%}}
@media(max-width:600px){.v2-panel-extra #v2-email-archive-records{display:block;min-inline-size:0!important}.v2-panel-extra #v2-email-archive-records>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-panel-extra #v2-email-archive-records>tbody{display:block}.v2-panel-extra #v2-email-archive-records>tbody>tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding:1rem}.v2-panel-extra #v2-email-archive-records>tbody>tr>td{display:flex;flex-direction:column;align-items:flex-start;gap:.375rem;min-inline-size:0;padding:0;border:0}.v2-panel-extra #v2-email-archive-records>tbody>tr>td:is(:first-child,:last-child,[colspan]),.v2-panel-extra #v2-email-archive-records>tbody>tr>td:nth-child(2){grid-column:1/-1}.v2-panel-extra #v2-email-archive-records td>:is(select,.v2-select,input:not([type=checkbox])){inline-size:100%}.v2-panel-extra #v2-email-archive-records td::before{margin:0!important}}
.v2-panel-extra #v2-address-books td>input:not([type=checkbox]),.v2-panel-extra #v2-task-lists td>input:not([type=checkbox]){inline-size:100%;min-inline-size:0}
@media(max-width:600px){.v2-panel-extra :is(#v2-address-books,#v2-task-lists){display:block;min-inline-size:0!important}.v2-panel-extra :is(#v2-address-books,#v2-task-lists)>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-panel-extra :is(#v2-address-books,#v2-task-lists)>tbody{display:block}.v2-panel-extra :is(#v2-address-books,#v2-task-lists)>tbody>tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem 1rem;padding:1rem}.v2-panel-extra :is(#v2-address-books,#v2-task-lists)>tbody>tr>td{display:flex;flex-direction:column;align-items:stretch;gap:.25rem;min-inline-size:0;padding:0;border:0}.v2-panel-extra :is(#v2-address-books,#v2-task-lists)>tbody>tr>td:is(:first-child,:nth-child(2),[colspan]){grid-column:1/-1}.v2-panel-extra #v2-dav-principals dl{grid-template-columns:minmax(0,1fr)!important}}
.v2-panel-extra #v2-email-archive-records td .v2-btn{white-space:normal;block-size:auto;padding-block:.25rem}
.v2-panel-extra [data-quarantine-inspect]{align-self:flex-start;justify-self:start;inline-size:auto}
`
