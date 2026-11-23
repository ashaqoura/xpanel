import type { WhmSurfaceProps } from '../../../../contract.ts'
import { localeDirection, type Translate } from '../../../../../i18n.ts'
import { card } from '../../../components/card.ts'
import { formField, type FieldControl } from '../../../components/form-field.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { v2Messages } from '../../../messages.ts'
import { v2SoftwareClientTemplates } from './client-templates.ts'
import type { WhmStoredFactAuthority } from '../stored-facts.ts'
import { whmPolish } from '../monitoring/common.ts'
import { actionsCss, buttonIcon, factsCss, fieldsCss, ki, scrollCss, type Keenicon } from '../server/common.ts'

/** Core resolves the route, listener, principal and capability before creating this presentation input. */
export interface WhmDataAuthority extends WhmStoredFactAuthority { readonly canRead: boolean; readonly canManage: boolean; readonly canKill?: boolean; readonly canRepair?: boolean; readonly canRootPassword?: boolean; readonly canDbProfiles?: boolean; readonly canFtpSettings?: boolean; readonly canDbMap?: boolean; readonly canDbHosts?: boolean; readonly canDbSettings?: boolean; readonly canPostgresql?: boolean; readonly canDbService?: boolean; readonly canDbQuota?: boolean; readonly canPmaAccess?: boolean }
export interface WhmDataPageInput extends WhmSurfaceProps { readonly dataAuthority?: WhmDataAuthority }
export const DENIED_DATA_AUTHORITY: WhmDataAuthority = Object.freeze({ canRead: false, canManage: false })
export function context(input: WhmDataPageInput, authority = input.dataAuthority ?? DENIED_DATA_AUTHORITY) {
  const canRead = authority.canRead === true && input.capabilityUnavailable !== true
  return { t: v2Messages.translator(input.locale ?? 'en'), canRead, canManage: canRead && authority.canManage === true,
    canKill: canRead && authority.canManage === true && authority.canKill === true }
}
export const esc = escapeHtml
export { ki, kiTile, type Keenicon } from '../server/common.ts'
export const technical = (value: string | number): string => `<bdi class="v2-mono" dir="ltr">${esc(value)}</bdi>`
export const actions = (html: string): string => `<div class="v2-whm-data__actions">${html}</div>`
/** Settings rows, one under the other. */
export const fields = (html: string): string => `<div class="v2-whm-data__fields">${html}</div>`
/** A filter bar: stacked fields side by side. Build its fields with `layout` set to `'stacked'`. */
export const filters = (html: string): string => `<div class="v2-whm-data__fields v2-whm-data__filters">${html}</div>`
export const stack = (html: string): string => `<div class="v2-whm-data__stack">${html}</div>`
/** A wide column beside a rail; `railFirst` puts the rail on the start edge and first in the document. */
export const split = (main: string, aside: string, railFirst = false): string => railFirst
  ? `<div class="v2-whm-data__split v2-whm-data__split--rail-first"><aside class="v2-whm-data__stack">${aside}</aside><div class="v2-whm-data__stack">${main}</div></div>`
  : `<div class="v2-whm-data__split"><div class="v2-whm-data__stack">${main}</div><aside class="v2-whm-data__stack">${aside}</aside></div>`
// A button names its Keenicon, or its hooks do (refresh, save, add, remove ...); `false` shows none.
const glyph = (icon: Keenicon | false | undefined, hooks: HookAttributes | undefined, size: 'text-sm' | 'text-base' = 'text-base'): string => {
  const name = icon === false ? undefined : icon ?? buttonIcon(undefined, hooks)
  return name ? ki(name, size) : ''
}
export const button = (label: string, hooks?: HookAttributes, disabled = true, primary = false, icon?: Keenicon | false): string =>
  `<button type="button" class="${primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary' : 'v2-btn kt-btn kt-btn-outline'}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${glyph(icon, hooks)}${esc(label)}</button>`
/** A header toolbar or table row button (`kt-btn-sm`). */
export const smallButton = (label: string, hooks?: HookAttributes, disabled = true, icon?: Keenicon | false): string =>
  `<button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${glyph(icon, hooks, 'text-sm')}${esc(label)}</button>`
export const link = (label: string, href: string, hooks?: HookAttributes, icon: Keenicon | false = 'open'): string => `<a class="v2-btn kt-btn kt-btn-outline" href="${esc(href)}"${hookAttrs(hooks)}>${icon ? ki(icon) : ''}${esc(label)}</a>`
/** A Metronic settings row by default: the label at the start, the control and its hint beside it from 1024px. */
export const field = (id: string, label: string, control: FieldControl, help?: string, layout: 'row' | 'stacked' = 'row'): string => formField({ id, label, control, layout, ...(help ? { help } : {}) })
export const check = (label: string, hooks?: HookAttributes, disabled = true, describedBy?: string): string => `<label class="v2-whm-data__check text-sm font-normal text-foreground"><input type="checkbox" class="kt-checkbox kt-checkbox-sm"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}${describedBy ? ` aria-describedby="${esc(describedBy)}"` : ''}><span>${esc(label)}</span></label>`
export const note = (text: string, hooks?: HookAttributes, hidden = false): string => `<p class="v2-muted text-sm text-secondary-foreground"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${esc(text)}</p>`
export const status = (text: string, hooks: HookAttributes, hidden = false): string => `<p role="status" data-state="unread"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${esc(text)}</p>`
export interface SectionOptions {
  /** Header toolbar built with the kit, such as a small refresh button or a count badge. */
  actionsHtml?: string
  /** The body is one table that runs edge to edge (`kt-card-table`). */
  flush?: boolean }
export const section = (key: string, title: string, html: string, hooks?: HookAttributes, focusable = false, options: SectionOptions = {}): string => {
  const body = card({ title, titleId: `v2-whm-data-${key}`, bodyHtml: html, ...(!focusable && hooks ? { hooks } : {}), ...(options.actionsHtml ? { actionsHtml: options.actionsHtml } : {}), ...(options.flush ? { flush: true } : {}) })
  return focusable ? `<div tabindex="-1"${hookAttrs(hooks)}>${body}</div>` : body
}
/** Label and value rows, as the "General info" tables of the Metronic profile pages. */
export function facts(t: Translate, rows: readonly (readonly [string, string])[], attribute: string): string {
  return `<dl class="v2-whm-data__facts">${rows.map(([key, label]) => `<div><dt class="text-sm font-normal text-secondary-foreground">${esc(t(label))}</dt><dd class="text-sm font-medium text-mono" ${attribute}="${esc(key)}">${esc(t(msgid('Not read')))}</dd></div>`).join('')}</dl>`
}
export function table(t: Translate, title: string, headers: readonly string[], hooks: HookAttributes, unread = t(msgid('Not read'))): string {
  return `<div class="v2-whm-data__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${esc(title)}"><table class="kt-table" style="${esc(headers.map((label, index) => `--v2-col-${index + 1}:'${t(label).replace(/[\\']/g, '\\$&')}'`).join(';'))}"><caption class="v2-sr">${esc(title)}</caption><thead><tr>${headers.map(label => `<th scope="col">${esc(t(label))}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)} data-columns="${headers.length}"><tr><td colspan="${headers.length}">${esc(unread)}</td></tr></tbody></table></div>`
}
export function page(input: WhmDataPageInput, route: string, title: string, description: string, body: string, hooks?: HookAttributes, actionsHtml?: string): string {
  const { t, canRead } = context(input)
  return `<section class="v2-whm-data" lang="${esc(input.locale ?? 'en')}" dir="${localeDirection(input.locale ?? 'en')}" data-whm-detail-route="${esc(route)}" data-capability-state="${canRead ? 'authorized' : 'unavailable'}"${hookAttrs(hooks)}>${pageHeader(t, { route, title, description, breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: title }], ...(actionsHtml ? { actionsHtml } : {}) })}${body}${v2SoftwareClientTemplates(route)}</section>`
}

const D = '.v2-whm-data'
export const WHM_DATA_COMMON_CSS = `${D}{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
${D} :is(p,dl,dd,ul,ol,pre,fieldset){margin:0}
${D}__stack,${D} form{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
${D} .v2-card__body{gap:var(--space-3)}
${D} .v2-card__body h3{font-size:.875rem;line-height:1.25rem;font-weight:600;color:var(--mono,var(--text))}
${D} .v2-card__body>h3:not(:first-child),${D} .v2-card__body>:is(form,${D}__stack)>h3:not(:first-child){padding-block-start:var(--space-3);border-block-start:1px solid var(--line)}
${fieldsCss(D, `${D}__fields`, '.v2-field')}${D} ${D}__filters{grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),20rem));gap:.625rem var(--space-3);align-items:end}
${factsCss(D, `${D}__facts`)}${D} .v2-field>label,${D}__facts dt{text-box-trim:trim-end;text-box-edge:text}
${D}__facts dd>span{unicode-bidi:plaintext}
${actionsCss(D, `${D}__actions`)}@media(min-width:1101px){${D} td>${D}__actions{flex-wrap:nowrap}}
${D}[data-whm-software-center] .v2-software-center__identity{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0}
${D}__check{display:flex;align-items:center;gap:.625rem;min-block-size:var(--target);cursor:pointer}
${D}__split{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:var(--space-3);align-items:stretch}
${D}__split>${D}__stack>.v2-card:last-child{flex:1 1 auto}
@media(min-width:1024px){${D},${D}__split,${D}__split>${D}__stack{gap:var(--space-4)}}
${D} fieldset{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0;margin:0;padding:0;border:0}
${D} legend{padding:0;margin-block-end:var(--space-1);font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--text)}
${D}__split--rail-first{grid-template-columns:minmax(260px,1fr) minmax(0,2fr)}
${D}__scroll{min-inline-size:0;max-inline-size:100%;overflow-x:auto}
${D}__scroll table{min-inline-size:480px}
${scrollCss(D, `${D}__scroll`)}${D} dd[data-sw-observed]{unicode-bidi:plaintext}
${D}__split>aside ${D}__scroll table{min-inline-size:0}
${D}__changes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
${D}__changes>div{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0}
${D}__list{padding-inline-start:var(--space-3);display:flex;flex-direction:column;gap:var(--space-1);font-size:.875rem;line-height:1.25rem;color:var(--text-2)}
${D}__list>li::marker{color:var(--muted)}
${D} ol${D}__list{list-style:decimal}
${D} ul${D}__list{list-style:disc}
${D} ul${D}__items{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
${D}__items>li{display:flex;align-items:flex-start;gap:var(--space-2);min-inline-size:0;padding:var(--space-3);border:1px solid var(--line);border-radius:var(--radius-card)}
${D} pre{padding:var(--space-2);border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.8125rem/1.25rem var(--font-mono);font-variant-numeric:tabular-nums;white-space:pre-wrap;overflow-wrap:anywhere}
${D} pre:empty{display:none}
${D} [data-ctr-workspace] pre{max-block-size:24rem;overflow:auto}
${D} input[type=file]{max-inline-size:480px}
${D} :is(input,textarea,select)[dir=ltr]{text-align:var(--v2-control-align,start)}
${D} [hidden]{display:none!important}
${D} .v2-tool-card__fields:has(>.v2-field:only-child:not(:has(textarea))){max-inline-size:480px}
${D} tbody th{color:var(--mono,var(--text));white-space:normal}
${whmPolish(D)}@media(max-width:1000px){${D}__split{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){${D}__changes,${D} ul${D}__items{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){${D} .v2-tool-card__table tbody>tr{padding-block:.5rem;border-block-end:1px solid var(--line)}${D} .v2-tool-card__table tbody>tr>td{border-block-end:0}${D} [data-sc-groups] td:is([data-xp-slot=candidate],[data-xp-slot=estimate],[data-xp-slot=relations]):not(:empty){display:block}${D} [data-sc-groups] td:is([data-xp-slot=candidate],[data-xp-slot=estimate],[data-xp-slot=relations])::before{display:block;margin-block-end:.25rem}
${D}__scroll td:nth-child(n+3):not([colspan]){grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem;text-align:end;overflow-wrap:anywhere}
${D}__scroll td:nth-child(n+3):not([colspan])::before{flex:none;font-size:.8125rem;color:var(--muted);text-align:start}
${[3, 4, 5, 6, 7, 8, 9, 10].map(n => `${D}__scroll td:nth-child(${n}):not([colspan])::before{content:var(--v2-col-${n})}`).join('\n')}}
@media(min-width:601px) and (max-width:1439px){${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows]){display:block;min-inline-size:0}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody{display:block}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem 1rem;padding:1rem;border-block-end:1px solid var(--line)}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr:last-child{border-block-end:0}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr>td{display:flex;flex-direction:column;gap:.125rem;padding:0;border:0;min-inline-size:0;overflow-wrap:anywhere}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr>td:is(:first-child,[colspan]){grid-column:1/-1}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr>td:first-child{font-weight:600}
${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr>td:not(:first-child,[colspan])::before{font-size:.75rem;color:var(--muted)}
${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `${D}[data-whm-detail-route="/whm/services/certificates"] table:has(>[data-whm-service-detail-rows])>tbody>tr>td:nth-child(${n}):not([colspan])::before{content:var(--v2-col-${n})}`).join('\n')}}
`
