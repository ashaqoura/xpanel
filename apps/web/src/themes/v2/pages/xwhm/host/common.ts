import { canOpenRegisteredRoute } from '@xpanel/catalog'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import type { Translate } from '../../../../../i18n.ts'
import { v2Messages } from '../../../messages.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { card } from '../../../components/card.ts'
import { icon } from '../../../icons.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { whmPolish } from '../monitoring/common.ts'
import { dataTable, type DataTableRow } from '../../../components/data-table.ts'

export type HostPageProps = WhmSurfaceProps

export function hostContext(props: HostPageProps, route: string) {
  const locale = props.locale ?? 'en'
  const principal = props.visibility?.principal ?? props.principal
  const authorized = principal?.kind === 'root'
    && canOpenRegisteredRoute(route, { ...props.visibility, principal })
  return { t: v2Messages.translator(locale), locale, authorized, readable: authorized && props.capabilityUnavailable !== true }
}

export const technical = (value: string | number | null | undefined, fallback = ''): string =>
  value === null || value === undefined ? escapeHtml(fallback) : `<bdi class="v2-mono" dir="ltr">${escapeHtml(value)}</bdi>`

/** Leading glyphs of the host pages: the v2 set where it has the glyph, a literal Keenicon where it does not. */
export const hostIcons = {
  add: icon('plus', 16),
  refresh: icon('refresh', 16),
  download: icon('download', 16),
  check: icon('check', 16),
  close: icon('x', 16),
  copy: icon('copy', 16),
  gear: icon('gear', 16),
  logs: icon('files', 16),
  upload: '<i class="ki-filled ki-exit-up text-base" aria-hidden="true"></i>',
  trash: '<i class="ki-filled ki-trash text-base" aria-hidden="true"></i>',
  edit: '<i class="ki-filled ki-pencil text-base" aria-hidden="true"></i>',
  restart: '<i class="ki-filled ki-arrows-loop text-base" aria-hidden="true"></i>',
  review: '<i class="ki-filled ki-search-list text-base" aria-hidden="true"></i>',
  save: '<i class="ki-filled ki-check-circle text-base" aria-hidden="true"></i>',
  discard: '<i class="ki-filled ki-cross-circle text-base" aria-hidden="true"></i>',
  power: '<i class="ki-filled ki-toggle-on-circle text-base" aria-hidden="true"></i>',
  unlock: '<i class="ki-filled ki-lock-2 text-base" aria-hidden="true"></i>',
  star: icon('star', 16),
  file: '<i class="ki-filled ki-file-up text-base" aria-hidden="true"></i>',
  shield: icon('shield', 16),
} as const
export type HostIconName = keyof typeof hostIcons

/** A round Metronic icon tile (integrations, notifications and session rows). */
export const hostTile = (iconHtml: string): string =>
  `<span class="flex items-center justify-center size-10 shrink-0 rounded-full border border-border bg-accent/60 text-secondary-foreground" aria-hidden="true">${iconHtml}</span>`

const BUTTON = {
  outline: 'v2-btn kt-btn kt-btn-outline',
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  danger: 'v2-btn v2-btn--danger kt-btn kt-btn-destructive',
  softDanger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
} as const

/** One button of the Metronic hierarchy: primary, outline (default), ghost, destructive or soft destructive. `small` marks a
 *  row action; it keeps the 44px target of every control. */
export function hostButton(label: string, hooks?: HookAttributes, options: { disabled?: boolean; primary?: boolean; danger?: boolean; soft?: boolean; ghost?: boolean; small?: boolean; icon?: HostIconName; type?: 'button' | 'submit' | 'reset' } = {}): string {
  const variant = options.danger ? (options.soft ? BUTTON.softDanger : BUTTON.danger) : options.primary ? BUTTON.primary : options.ghost ? BUTTON.ghost : BUTTON.outline
  return `<button type="${options.type ?? 'button'}" class="${variant}"${hookAttrs(hooks)}${options.disabled ? ' disabled' : ''}>${options.icon ? hostIcons[options.icon] : ''}${escapeHtml(label)}</button>`
}

export function hostCard(key: string, title: string, bodyHtml: string, hooks?: HookAttributes, actionsHtml?: string, headingLevel?: 2 | 3): string {
  return card({ title, titleId: `v2-host-${key}-heading`, ...(headingLevel ? { headingLevel } : {}), bodyHtml, hooks, ...(actionsHtml ? { actionsHtml } : {}) })
}

export function hostTable(t: Translate, id: string, caption: string, headings: readonly string[], rows: readonly DataTableRow[], emptyText: string, hooks?: HookAttributes, phoneValueColumn?: 3): string {
  return dataTable(t, { id: `v2-host-${id}`, caption, columns: headings.map(label => ({ label })), rows, emptyText,
    ...(hooks ? { bodyHooks: hooks } : {}), ...(phoneValueColumn ? { phoneValueColumn } : {}) })
}

/** Facts: each label 8px above its value on the same start edge (HOST_PAGES_CSS lays them out). */
export function hostFacts(rows: readonly { label: string; valueHtml: string; hooks?: HookAttributes }[]): string {
  return `<dl class="v2-host__facts">${rows.map(row => `<div><dt>${escapeHtml(row.label)}</dt><dd${hookAttrs(row.hooks)}>${row.valueHtml}</dd></div>`).join('')}</dl>`
}

/** A stack of stacked fields, 16px apart. */
export const HOST_SETTINGS = 'v2-host__settings flex flex-col gap-4'

/** The end of a settings card: the actions close the form on the end edge. */
export const hostActions = (html: string): string => `<div class="v2-host__actions flex flex-wrap items-center justify-end gap-2">${html}</div>`

export function hostPage(props: HostPageProps, route: string, title: string, description: string, body: string, hooks?: HookAttributes, actionsHtml?: string): string {
  const { t, authorized, readable } = hostContext(props, route)
  const head = pageHeader(t, { breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: title }], route, title, description, ...(actionsHtml ? { actionsHtml } : {}) })
  if (!authorized && props.capabilityUnavailable !== true)
    return `<section class="v2-host flex flex-col gap-8" data-whm-detail-denied>${head}<p class="kt-alert kt-alert-light kt-alert-warning" role="status">${escapeHtml(t(msgid('Root authorization is required for server operations.')))}</p></section>`
  return `<section class="v2-host flex flex-col gap-8" data-whm-detail-route="${escapeHtml(route)}" data-capability-state="${readable ? 'authorized' : 'unavailable'}"${hookAttrs(hooks)}>${head}${!readable ? `<p class="kt-alert kt-alert-light kt-alert-warning" role="status">${escapeHtml(t(msgid('This host has not qualified the operation. The workspace is retained; changes remain unavailable.')))}</p>` : ''}${body}</section>`
}

const FIREWALL = '.v2-host[data-whm-detail-route="/whm/security/firewall"]'
export const HOST_PAGES_CSS = `.v2-host,.v2-host__stack{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-host .v2-card__body{display:flex;flex-direction:column;gap:1.5rem}
.v2-host .v2-filter--fields{padding:0}
@media(max-width:600px){.v2-host .v2-segmented>button{min-block-size:var(--target)}}
.v2-host__groups{display:flex;flex-direction:column;gap:1.5rem;min-inline-size:0}
.v2-host__fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.5rem}
.v2-host__field{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0;text-align:start}
.v2-host__facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr));gap:1rem 1.5rem;min-inline-size:0}
.v2-host__facts>div{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0;text-align:start}
.v2-host__facts dt{min-inline-size:0;font-size:.875rem;font-weight:400;line-height:var(--lh-label);color:var(--text-2);overflow-wrap:anywhere;text-box:trim-end text}
.v2-host__facts dd{min-inline-size:0;font-size:1rem;font-weight:500;line-height:var(--lh-text);color:var(--mono,var(--text));font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;text-align:start;text-align:-webkit-match-parent;text-align:match-parent}
.v2-host__facts bdi{unicode-bidi:isolate}
@media(min-width:1101px){${FIREWALL} [data-whm-firewall-panel=port] table{min-inline-size:0}${FIREWALL} [data-whm-firewall-panel=port] :is(th,td){padding-inline:6px}${FIREWALL} [data-whm-firewall-panel=port] :is(th,td):first-child{padding-inline-start:.75rem}${FIREWALL} [data-whm-firewall-panel=port] :is(th,td):last-child{padding-inline-end:.75rem}${FIREWALL} td>.v2-host__actions{gap:.5rem}}
.v2-host__actions,.v2-host__choices{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-host__choice{display:flex;align-items:center;gap:.5rem;min-inline-size:var(--target);min-block-size:var(--target)}
.v2-host fieldset{min-inline-size:0;display:flex;flex-direction:column;gap:.5rem}
.v2-host legend{margin-block-end:.5rem;font-size:.875rem;font-weight:500;line-height:var(--lh-label);color:var(--text)}
.v2-host__field :is(input,select,textarea){inline-size:100%;min-inline-size:0}
.v2-host :is(.v2-host__field,.v2-field) [dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-host__split{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:2rem;align-items:stretch}
.v2-host__split>:is(.v2-host__stack,.v2-card),.v2-host__split>.v2-host__stack>.v2-card:last-child{flex:1 1 auto}
.v2-host[data-whm-detail-route="/whm/security/firewall"] .v2-host__split{grid-template-columns:minmax(0,1.25fr) minmax(320px,1fr)}
.v2-host__pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:2rem;align-items:stretch}
.v2-host .v2-tabs{flex-wrap:nowrap;overflow:auto hidden;scroll-padding-inline:.75rem;scrollbar-width:thin}
.v2-host .v2-tabs>[role=tab]{flex:none;white-space:nowrap;margin-block-end:0}
.v2-host .v2-tabs>[role=tab]:disabled{opacity:.6;cursor:not-allowed}
.v2-host :is(h2,h3)[id]{scroll-margin-block-start:96px}
.v2-host .v2-kpi-row{grid-template-columns:repeat(4,minmax(0,1fr))}
.v2-host .v2-card__body>.v2-table-scroll,.v2-host .v2-card__body :is(.v2-host__groups,[role=tabpanel])>.v2-table-scroll,.v2-host .v2-card__body>div>.v2-table-scroll{border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-host__unavailable{display:flex;flex-direction:column;list-style:none;padding:0}
.v2-host__unavailable li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem;padding-block:.5rem;font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
.v2-host__unavailable li+li{border-block-start:1px solid var(--line)}
.v2-host__power{display:flex;align-items:center;gap:1rem;min-inline-size:0}
.v2-host__power>div{flex:1 1 0;display:flex;flex-direction:column;gap:.5rem;min-inline-size:0}
.v2-host__tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.5rem}
.v2-host__tile{min-inline-size:0}
.v2-host__tile>dd{font-variant-numeric:tabular-nums;overflow-wrap:break-word;text-align:-webkit-match-parent;text-align:match-parent}
.v2-host__tile>dd bdi.v2-mono{white-space:nowrap}
.v2-host__tile>dd.v2-host__tile-note{font-size:.8125rem;font-weight:400;line-height:var(--lh-cap);color:var(--text-2)}
.v2-host td,.v2-host .v2-mono{font-variant-numeric:tabular-nums}
.v2-host [data-firewall-apply-steps]{padding:.75rem 1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--subtle)}
.v2-host__ports{display:flex;flex-wrap:wrap;gap:.5rem}
.v2-host__ports bdi{font-weight:500;color:var(--mono,var(--text))}
.v2-host [data-whm-firewall-tabs]:has(tbody [data-xp-slot]) [data-whm-firewall-tab] .v2-count{display:none}
.v2-host [data-whm-firewall-panel] td:is([data-xp-slot=purpose],[data-xp-slot=origin]){color:var(--text-2)}
.v2-host [data-whm-firewall-panel] :is(th,td){padding-inline:.625rem}
.v2-host [data-whm-firewall-panel] td>.v2-host__actions{display:grid;grid-template-columns:repeat(2,max-content);gap:.5rem}
.v2-host [data-whm-firewall-panel] td[data-xp-action=cell]{background:var(--subtle)}
.v2-host [hidden]{display:none}
.v2-host details{border-block-end:1px solid var(--line)}
.v2-host details>summary{display:flex;align-items:center;justify-content:space-between;gap:.5rem;min-block-size:var(--target);padding-block:.5rem;font-size:1rem;font-weight:500;line-height:var(--lh-text);color:var(--mono,var(--text));cursor:pointer;list-style:none}
.v2-host details>summary::-webkit-details-marker{display:none}
.v2-host details>summary>i{color:var(--muted);transition:rotate .14s ease-out}
.v2-host details[open]>summary>i{rotate:180deg}
.v2-host details[open]{padding-block-end:1rem}
@media(prefers-reduced-motion:reduce){.v2-host details>summary>i{transition:none}}
@media(min-width:601px){.v2-host table:has(>thead>tr>:nth-child(9)) td:is(:nth-child(6),:nth-child(7)){white-space:nowrap}}
.v2-host tbody th{background:none;color:var(--mono,var(--text));font-size:1rem;font-weight:500;white-space:normal}
${whmPolish('.v2-host')}@media(max-width:1100px){.v2-host .v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:1000px){.v2-host__tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-host__split,.v2-host[data-whm-detail-route="/whm/security/firewall"] .v2-host__split,.v2-host__pair{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.v2-host__fields{grid-template-columns:minmax(0,1fr)}.v2-host__tiles{gap:1rem}}
@media(max-width:600px){.v2-host :is([data-whm-firewall-panel],#v2-host-php-effective) :is(td[data-phone-label]:nth-child(n+3),td:nth-child(n+3):has(>[data-phone-label])){grid-column:1/-1}
.v2-host :is([data-whm-firewall-panel],#v2-host-php-effective) :is(td[data-phone-label]:nth-child(n+3),td:nth-child(n+3)>[data-phone-label]){display:flex;flex-direction:column;gap:.5rem;text-align:start;overflow-wrap:anywhere}
.v2-host :is([data-whm-firewall-panel],#v2-host-php-effective) :is(td[data-phone-label],td>[data-phone-label])::before{content:attr(data-phone-label);flex:none;font-size:.875rem;line-height:var(--lh-label);font-weight:400;color:var(--text-2);text-align:start}
.v2-host [data-whm-firewall-panel] td:first-child{font-weight:500}
.v2-host [data-whm-firewall-panel] td>.v2-host__actions{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
.v2-host [data-whm-firewall-panel] td>.v2-host__actions>.v2-btn{min-block-size:var(--target)}
.v2-host [data-whm-firewall-panel] td>.v2-host__actions:empty{display:none}}
`
