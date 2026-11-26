import type { Translate } from '../../../../../i18n.ts'
import type { PanelSurfaceProps } from '../../../../contract.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { v2Messages } from '../../../messages.ts'
import { phoneLabelCss, phoneLabels } from '../settings/common.ts'

export interface DomainPageAuthority {
  readonly canRead: boolean
  readonly presentation?: 'live' | 'read-only'
  readonly canReadFacts?: boolean
  readonly authorizedTools?: ReadonlySet<string>
  readonly canManage: boolean
}

export const NO_DOMAIN_AUTHORITY: DomainPageAuthority = { canRead: false, canManage: false }

export function domainContext(props: PanelSurfaceProps, authority: DomainPageAuthority) {
  const locale = props.locale ?? 'en'
  const t = v2Messages.translator(locale)
  const readOnly = authority.presentation === 'read-only'
  const factAccess = readOnly && authority.canReadFacts === true && authority.authorizedTools?.has('domains') === true
  const principal = props.visibility?.principal
  const identityMatches = principal?.kind === 'user' && props.account?.id === principal.accountId
  const account = (authority.canRead || factAccess) && (!readOnly || identityMatches) ? props.account : undefined
  const canManage = !!account && account.status === 'active' && authority.canManage && !readOnly
  const domains = account ? (props.domains ?? []).filter(domain => domain.accountId === account.id) : []
  const selected = domains.find(domain => domain.name === props.activeDomain)
    ?? domains.find(domain => domain.name === account?.primaryDomain) ?? domains[0]
  return { locale, t, account, canManage, domains, selected, domainsObserved: !!account && props.domains !== undefined }
}

export function domainHeader(t: Translate, route: string, title: string, description: string, actionsHtml?: string): string {
  return pageHeader(t, { breadcrumb: [{ label: t(msgid('Home')), href: '/home' }, { label: t(msgid('Domains')), href: '/domains' }, { label: title }], route, title, description, ...(actionsHtml ? { actionsHtml } : {}) })
}

export const technical = (value: string | number): string => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`
/** Display names for saved domain kinds and site types; unknown values stay technical. */
export const domainKindLabel = (t: Translate, kind: string): string => kind === 'primary' ? t(msgid('Primary')) : kind === 'addon' ? t(msgid('Addon')) : kind === 'subdomain' ? t(msgid('Subdomain')) : kind === 'alias' ? t(msgid('Alias')) : kind
export const siteTypeLabel = (t: Translate, type: string): string => type === 'php' ? t(msgid('PHP files')) : type === 'static' ? t(msgid('Static files')) : type === 'proxy' ? t(msgid('Reverse proxy')) : type === 'node' ? 'Node.js' : type === 'python' ? 'Python' : type

/** Keenicons the v2 icon set lacks. Inside a button the button sizes the glyph. */
export const domainGlyph = {
  trash: '<i class="ki-filled ki-trash" aria-hidden="true"></i>',
  discard: '<i class="ki-filled ki-arrows-loop" aria-hidden="true"></i>',
  lock: '<i class="ki-filled ki-lock" aria-hidden="true"></i>',
  unlock: '<i class="ki-filled ki-shield-slash" aria-hidden="true"></i>',
  key: '<i class="ki-filled ki-key" aria-hidden="true"></i>',
  hide: '<i class="ki-filled ki-eye-slash" aria-hidden="true"></i>',
  eye: '<i class="ki-filled ki-eye" aria-hidden="true"></i>',
  publish: '<i class="ki-filled ki-rocket" aria-hidden="true"></i>',
  restore: '<i class="ki-filled ki-time" aria-hidden="true"></i>',
  eraser: '<i class="ki-filled ki-cross-circle" aria-hidden="true"></i>',
} as const

/** The button hierarchy of a domain card: one primary, outline for the rest, ghost to step back, soft red to remove. */
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const

export interface DomainButtonLook {
  /** Leading glyph markup: `icon(...)` of the v2 set or a {@link domainGlyph}. */
  icon?: string
  kind?: 'outline' | 'ghost' | 'danger'
  /** Kept for callers; every button keeps the 44px target, so a row button is no smaller. */
  small?: boolean
}

export const domainButton = (label: string, hooks?: HookAttributes, disabled = true, primary = false, look: DomainButtonLook = {}): string =>
  `<button type="button" class="${primary ? BUTTON.primary : BUTTON[look.kind ?? 'outline']}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${look.icon ?? ''}${escapeHtml(label)}</button>`

export const domainSelect = (selectHtml: string): string => `<span class="v2-select">${selectHtml}</span>`

/** One field: the label above its control on the same start edge; hints sit under the control. */
export function domainField(id: string, label: string, control: string, help?: string): string {
  return `<div class="v2-field v2-domain-field"><label class="kt-form-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>${control}${help ? `<p class="v2-muted kt-form-description">${escapeHtml(help)}</p>` : ''}</div>`
}

/** Label above value, both on the same start edge. */
export function domainFacts(items: readonly { label: string; valueHtml: string; hooks?: HookAttributes }[]): string {
  return `<dl class="v2-domain-facts">${items.map(item => `<div><dt class="text-secondary-foreground">${escapeHtml(item.label)}</dt><dd class="text-mono"${hookAttrs(item.hooks)}>${item.valueHtml}</dd></div>`).join('')}</dl>`
}

/** Phone rows name their values from the headers; the domain list cells carry their own data-label. */
export function domainTable(label: string, headers: readonly string[], rowsHtml: string, hooks: HookAttributes, tableHooks?: HookAttributes): string {
  return `<div class="v2-domain-scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${escapeHtml(label)}"><table class="kt-table align-middle"${tableHooks?.['data-domain-table'] ? '' : phoneLabels(headers)}${hookAttrs(tableHooks)}><caption class="v2-sr">${escapeHtml(label)}</caption><thead><tr>${headers.map(header => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}>${rowsHtml}</tbody></table></div>`
}

export function domainCard(id: string, title: string, bodyHtml: string, actionsHtml?: string): string {
  return card({ title, titleId: `v2-${id}-heading`, bodyHtml, ...(actionsHtml ? { actionsHtml } : {}) })
}

// Layout only: colors, radii, control and button looks come from the Metronic classes in the markup. Spacing follows
// the standard rhythm: 32px between page sections, 24px between groups, 16px between fields, 8px label to value.
export const DOMAIN_PAGES_CSS = `.v2-domain-page{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-domain-stack{display:flex;flex-direction:column;gap:1.5rem;min-inline-size:0;container-type:inline-size}
.v2-domain-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);gap:2rem;align-items:stretch}
.v2-domain-split>:is(.v2-domain-stack,aside){display:flex;flex-direction:column;gap:1.5rem;min-inline-size:0}
.v2-domain-split:not(.v2-domain-split--strip) :is(.v2-domain-stack,aside)>.v2-card:last-child{flex:1 1 auto}
.v2-domain-split:not(.v2-domain-split--strip) :is(.v2-domain-stack,aside)>.v2-card:last-child>.v2-card__body>.v2-domain-actions:last-child{margin-block-start:auto}
.v2-domain-split--strip{grid-template-columns:minmax(0,1fr)}.v2-domain-split--strip>aside{order:-1}
.v2-domain-split--strip .v2-domain-notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:.5rem 1.5rem}
.v2-domain-page .v2-kpi-row{grid-template-columns:repeat(4,minmax(0,1fr))}.v2-domain-page .v2-kpi__note{overflow-wrap:anywhere}
.v2-domain-page .v2-card__head{flex-wrap:nowrap}.v2-domain-page .v2-card__title{flex:1 1 auto}.v2-domain-page .v2-card__actions{flex:none}
.v2-domain-page .v2-card__body{gap:1.5rem;container-type:inline-size}
.v2-domain-page[data-reverse-proxy] .v2-card{gap:1rem}
.v2-domain-page .v2-card__body>p,.v2-domain-page :is(form,.v2-domain-create,.v2-domain-stack,.v2-domain-review)>p{color:var(--text-2)}
.v2-domain-fields{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;min-inline-size:0}
.v2-domain-field{min-inline-size:0;text-align:start}
.v2-domain-field>*{min-inline-size:0}
.v2-domain-field>.v2-select{inline-size:100%}
.v2-domain-field :is(input,select,textarea):not([type=checkbox],[type=radio]){inline-size:100%;min-inline-size:0;text-align:match-parent;text-align:-webkit-match-parent}
.v2-domain-field>p:not([role=alert]),.v2-domain-page :is(.v2-domain-stack,form)>p:is([data-domain-root-help],[data-domain-alias-help],[data-domain-settings-help]){font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-domain-page .v2-domain-field textarea{min-block-size:7.5rem;resize:vertical}
.v2-domain-page textarea[dir=ltr][spellcheck=false]{text-align:start}
.v2-domain-facts{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;min-inline-size:0}
.v2-domain-facts>div{display:flex;flex-direction:column;align-items:stretch;gap:.5rem;min-inline-size:0;text-align:start}
.v2-domain-facts dt{font-size:.875rem;line-height:var(--lh-label);font-weight:500;text-box-trim:trim-end;text-box-edge:text}
.v2-domain-facts dd{min-inline-size:0;overflow-wrap:anywhere;text-box-trim:trim-start;text-box-edge:text}
.v2-domain-facts bdi{display:inline;unicode-bidi:isolate}
.v2-domain-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-domain-check{display:flex;align-items:center;gap:.5rem;min-inline-size:var(--target);min-block-size:var(--target);color:var(--text)}
.v2-domain-options{display:flex;flex-wrap:wrap;gap:0 1.5rem}
.v2-domain-meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;color:var(--text-2)}
.v2-domain-meta>[data-domain-status]:not([data-state=failed],[data-state=error],[role=alert]){font-weight:500;color:var(--text)}
.v2-domain-notes{display:flex;flex-direction:column;gap:.5rem;color:var(--text-2)}
.v2-domain-review{display:flex;flex-direction:column;gap:1rem;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken)}
.v2-domain-page>[role=status]:not(:empty,[hidden],[data-state=failed],[data-state=error]),.v2-domain-page .v2-card__body>[role=status]:not(:empty,[hidden],[data-state=failed],[data-state=error]){padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken);color:var(--text)}
.v2-domain-page>[role=status]:not(:empty,[hidden],[data-state=failed],[data-state=error]){background:var(--surface)}
.v2-domain-scroll{overflow:auto;min-inline-size:0;max-inline-size:100%;border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-domain-scroll table{min-inline-size:0}
.v2-domain-scroll :is(th,td){text-align:start;vertical-align:middle;overflow-wrap:break-word}.v2-domain-scroll td bdi{overflow-wrap:anywhere}.v2-domain-scroll .v2-domain-check{white-space:nowrap}
.v2-domain-scroll bdi{unicode-bidi:isolate}
.v2-domain-scroll tbody td:first-child:not([colspan]){font-weight:500;color:var(--mono,var(--text))}
.v2-domain-scroll td[colspan]{padding-block:1.5rem;color:var(--muted);text-align:center}
.v2-domain-scroll td>p:not([class]){margin-block-start:.5rem;font-size:.8125rem;line-height:var(--lh-cap);color:var(--muted)}
.v2-domain-scroll td[data-xp-slot=actions]>.v2-btn{margin-block:.125rem;margin-inline-end:.375rem}
.v2-domain-cell{display:flex;flex-direction:column;align-items:flex-start;gap:.125rem;min-inline-size:0}
.v2-domain-cell>strong{font-size:.875rem;font-weight:500;color:var(--mono,var(--text))}
.v2-domain-cell>span{font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--text-2)}
.v2-domain-more>summary{list-style:none}.v2-domain-more>summary::-webkit-details-marker{display:none}
.v2-domain-more[open]>summary{margin-block-end:.5rem}
.v2-domain-page :is(.v2-num,.v2-kpi__value,.v2-kpi__unit,.v2-domain-facts dd,.v2-domain-scroll td,.v2-domain-scroll time,[data-domain-count],[data-ddns-count]){font-variant-numeric:tabular-nums}
.v2-domain-scroll table[data-domain-table]{min-inline-size:860px}
.v2-domain-scroll table[data-domain-table] th:first-child{inline-size:28%}
@media(min-width:601px){.v2-domain-scroll table[data-domain-table]{table-layout:fixed}.v2-domain-scroll table[data-domain-table] th{white-space:normal}.v2-domain-scroll table[data-domain-table] th:nth-child(2){inline-size:13%}.v2-domain-scroll table[data-domain-table] th:nth-child(3){inline-size:11%}.v2-domain-scroll table[data-domain-table] th:nth-child(4){inline-size:12%}.v2-domain-scroll table[data-domain-table] th:nth-child(5){inline-size:11%}.v2-domain-scroll table[data-domain-table] th:nth-child(6){inline-size:9%}.v2-domain-scroll table[data-domain-table] .v2-domain-check{white-space:normal}.v2-domain-scroll table[data-domain-table] :is(th,td){padding-inline:.75rem}}
.v2-domain-page .v2-domain-wide{grid-column:1/-1}
.v2-domain-page [hidden]{display:none!important}
.v2-domain-preview{inline-size:100%;block-size:420px;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--surface)}
.v2-domain-secret{overflow-wrap:anywhere;user-select:all}
.v2-domain-page:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-domain-page *{letter-spacing:0}
@media(max-width:1100px){.v2-domain-split{grid-template-columns:1fr}.v2-domain-page .v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.v2-domain-scroll table[data-domain-table]{display:block;min-inline-size:0}.v2-domain-scroll table[data-domain-table] thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
.v2-domain-scroll table[data-domain-table] tbody{display:block}
.v2-domain-scroll table[data-domain-table] tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding-block:1rem}
.v2-domain-scroll table[data-domain-table] td{display:flex;flex-direction:column;align-items:flex-start;gap:.25rem;min-inline-size:0;padding:0;border:0}
.v2-domain-scroll table[data-domain-table] td:is(:first-child,:last-child,[colspan]){grid-column:1/-1}
.v2-domain-scroll table[data-domain-table] td[data-label]::before{content:attr(data-label);font-size:.8125rem;line-height:var(--lh-cap);color:var(--muted)}
.v2-domain-preview{block-size:360px}.v2-domain-actions>.v2-btn{flex:1 1 auto;max-inline-size:100%;block-size:auto!important;min-block-size:var(--target);white-space:normal!important}.v2-domain-page .v2-card__head{flex-wrap:wrap}.v2-domain-scroll{border:0;border-block-start:1px solid var(--line);border-radius:0}}
.v2-domain-page .v2-filter--fields{padding:0}.v2-domain-page [data-list-row][hidden]{display:none}
.v2-domain-filter-empty{margin:0;padding:1.5rem;text-align:center;color:var(--muted)}
.v2-domain-filter-count{display:flex;align-items:center;gap:.5rem;min-block-size:var(--target);margin:0;font-size:.8125rem;line-height:var(--lh-cap);color:var(--muted)}
@media(min-width:601px){.v2-domain-scroll table:has(>[data-staging-rows]){table-layout:fixed;inline-size:100%;min-inline-size:0}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(1){inline-size:34%}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(2){inline-size:15%}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(3){inline-size:8%}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(4){inline-size:13%}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(5){inline-size:13%}.v2-domain-scroll table:has(>[data-staging-rows]) th:nth-child(6){inline-size:17%}}
@media(min-width:601px){.v2-domain-scroll table:has(>[data-ddns-rows]){table-layout:fixed;inline-size:100%;min-inline-size:0}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(1){inline-size:26%}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(2){inline-size:8%}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(3){inline-size:20%}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(4){inline-size:15%}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(5){inline-size:14%}.v2-domain-scroll table:has(>[data-ddns-rows]) th:nth-child(6){inline-size:17%}}
@media(min-width:601px){.v2-domain-scroll table:has(>:is([data-ddns-rows],[data-staging-rows])) .v2-pill{white-space:normal;text-align:start}}
@media(min-width:601px){.v2-domain-scroll table:has(>[data-staging-rows]) th{overflow-wrap:anywhere;white-space:normal}.v2-domain-scroll [data-staging-rows] time{overflow-wrap:normal}}
@media(max-width:600px){.v2-domain-scroll [data-staging-rows] tr>td:nth-child(2):not([colspan]){grid-column:1/-1;grid-row:auto;justify-self:start;text-align:start}.v2-domain-scroll [data-staging-rows] td:is(:has(>bdi:empty),:has(>time:empty)){display:none}.v2-domain-scroll [data-staging-rows] time{white-space:nowrap}}
@media(min-width:1101px){.v2-domain-create{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);align-items:start;gap:1.5rem}}
.v2-domain-page .v2-filter__field{gap:.5rem}
.v2-domain-page .v2-filter__field>.kt-form-label{display:block!important;padding-inline-start:calc(2.25rem + 1px);font-size:.875rem;line-height:var(--lh-label);text-box:trim-end text}
.v2-domain-page .v2-filter__input{position:relative;padding-inline:0!important;gap:0!important}
.v2-domain-page .v2-filter__input>:not(input){position:absolute!important;inset-inline-start:.75rem;inset-block-start:50%;translate:0 -50%;pointer-events:none}
.v2-domain-page .v2-filter__input>input{align-self:stretch;inline-size:100%;block-size:auto;min-block-size:var(--target);margin-block:-1px;padding-inline:2.25rem .75rem!important}
${phoneLabelCss('.v2-domain-scroll')}
`
