import { localeDirection, type Locale, type Translate } from '../../../../../i18n.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'
import { whmPolish } from '../monitoring/common.ts'
import { V2_ACCOUNT_ANNOUNCEMENT_CSS } from '../../../components/account-announcement-notice-templates.ts'

/** Core supplies independent read and mutation decisions for this exact route. */
export interface WhmAccountToolAuthority {
  readonly canRead: boolean
  readonly canManage: boolean
  /** Used only to describe the account-health scope; it never grants an operation. */
  readonly root?: boolean
}
export const NO_ACCOUNT_TOOL_AUTHORITY: WhmAccountToolAuthority = Object.freeze({ canRead: false, canManage: false })
export function context(props: WhmSurfaceProps, authority: WhmAccountToolAuthority) {
  const locale: Locale = props.locale ?? 'en'
  const readable = authority.canRead === true && props.capabilityUnavailable !== true
  return { locale, t: v2Messages.translator(locale), readable, editable: readable && authority.canManage === true }
}
export const esc = escapeHtml
export const text = (t: Translate, value: string): string => escapeHtml(t(value))
export const technical = (value: string): string => `<bdi dir="ltr">${escapeHtml(value)}</bdi>`
/** A literal Keenicon the v2 icon set lacks; decorative, sized by the control it sits in. */
export const keenicon = (name: string): string => `<i class="ki-filled ki-${name}" aria-hidden="true"></i>`
// The leading icon of a secondary action, read from its controller hook: Metronic shows one on refresh, preview,
// remove, restore and send buttons.
const ACTION_ICONS: readonly (readonly [RegExp, string])[] = [
  [/refresh|recheck/, icon('refresh', 16)], [/preview/, keenicon('eye')], [/remove|unassign/, keenicon('trash')],
  [/revert|shipped|recover/, keenicon('arrows-loop')], [/inbox-read/, keenicon('double-check')], [/repair-run/, icon('tools', 16)],
]
// Primary actions lead with the Keenicon Metronic shows for the verb: review (eye), restore (download), convert,
// run checks, enable, save. Full literal class names, so the stylesheet build finds them.
const PRIMARY_ICONS: readonly (readonly [RegExp, string])[] = [
  [/preview/, keenicon('eye')], [/restore/, keenicon('cloud-download')], [/convert/, keenicon('arrow-right-left')],
  [/health-run/, keenicon('shield-tick')], [/enable/, keenicon('toggle-on-circle')], [/save|assign/, keenicon('check')],
]
const actionIcon = (hooks: HookAttributes | undefined, primary = false): string => {
  const key = hooks ? Object.entries(hooks).map(([name, value]) => `${name}=${String(value)}`).join(' ') : ''
  return key ? (primary ? PRIMARY_ICONS : ACTION_ICONS).find(([pattern]) => pattern.test(key))?.[1] ?? '' : ''
}
// Buttons whose label a controller rewrites: the text sits in a label slot, so the rewrite keeps the leading icon.
const RELABELLED = /data-whm-health-run/
export const button = (label: string, hooks?: HookAttributes, enabled = false, primary = false): string => {
  const glyph = actionIcon(hooks, primary), slot = glyph && hooks && RELABELLED.test(Object.keys(hooks).join(' '))
  return `<button type="button" class="${primary ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary' : 'v2-btn kt-btn kt-btn-outline'}"${hookAttrs(hooks)}${enabled ? '' : ' disabled'}>${glyph}${slot ? `<span data-xp-slot="label">${escapeHtml(label)}</span>` : escapeHtml(label)}</button>`
}
/** Adds the Metronic control class to the text controls a caller hands to {@link field}; choices and hidden inputs stay as they are. */
const metronicControl = (html: string): string => html.replace(/<(input|select|textarea)\b([^>]*)>/g, (tag, name: string, attrs: string) => {
  if (name === 'input' && /type="(?:checkbox|radio|hidden)"/.test(attrs)) return tag
  const kt = name === 'input' ? 'kt-input' : name === 'select' ? 'kt-select' : 'kt-textarea'
  return /\sclass="/.test(attrs) ? `<${name}${attrs.replace(/\sclass="([^"]*)"/, ` class="$1 ${kt}"`)}>` : `<${name} class="${kt}"${attrs}>`
})
const fieldHelp = (id: string, help: string | undefined, cls: string): string => help ? `<p class="${cls}" id="${escapeHtml(id)}-help">${escapeHtml(help)}</p>` : ''
/** A stacked field: the label 8px above its control on the control's text edge, the hint under it (the v2 field). */
export const field = (id: string, label: string, control: string, help?: string, hooks?: HookAttributes, hidden = false): string => `<div class="v2-account-tool__field v2-field kt-form-item"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}><label class="kt-form-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>${metronicControl(control)}${fieldHelp(id, help, 'v2-field__help kt-form-description')}</div>`
/** A full-width field of a settings stack: the same stacked field (the label-beside-control row is withdrawn). */
export const row = (id: string, label: string, control: string, help?: string, hooks?: HookAttributes, hidden = false): string => `<div class="v2-account-tool__field v2-account-tool__row v2-field kt-form-item"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}><label class="kt-form-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>${metronicControl(control)}${fieldHelp(id, help, 'v2-field__help kt-form-description')}</div>`
export const fields = (html: string): string => `<div class="v2-account-tool__fields">${html}</div>`
/** A stack of fields, 16px apart. */
export const rows = (html: string): string => `<div class="v2-account-tool__rows grid gap-4 min-w-0">${html}</div>`
/** An action group; `end` closes a form with its buttons at the inline end, the primary one last. */
export const actions = (html: string, end = false): string => `<div class="${end ? 'v2-account-tool__actions justify-end' : 'v2-account-tool__actions'}">${html}</div>`
/** A tool card. `toolbarHtml` sits in the card header beside the title; `footerHtml` closes the card. */
export const toolCard = (key: string, title: string, bodyHtml: string, hooks?: HookAttributes, toolbarHtml?: string, footerHtml?: string): string => card({ title, titleId: `v2-account-tool-${key}`, bodyHtml, ...(toolbarHtml ? { actionsHtml: toolbarHtml } : {}), ...(footerHtml ? { footerHtml } : {}), ...(hooks ? { hooks } : {}) })
export function table(title: string, headers: readonly string[], hooks: HookAttributes, unread: string): string {
  return `<div class="v2-account-tool__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${escapeHtml(title)}"><table data-phone-labels><caption class="v2-sr">${escapeHtml(title)}</caption><thead><tr>${headers.map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)} data-xp-columns="${headers.length}"><tr><td colspan="${headers.length}">${escapeHtml(unread)}</td></tr></tbody></table></div>`
}
/** Facts: each label (14/22) 8px above the value a controller fills, on the same start edge. */
export const facts = (rows: readonly { label: string; hooks: HookAttributes; value?: string }[], unread: string): string => `<dl class="v2-account-tool__facts">${rows.map(row => `<div class="flex flex-col gap-2 min-w-0"><dt class="text-sm leading-(--lh-label) font-normal text-secondary-foreground">${escapeHtml(row.label)}</dt><dd class="min-w-0 text-base leading-(--lh-text) font-normal text-mono"><bdi dir="ltr"${hookAttrs(row.hooks)}>${escapeHtml(row.value ?? unread)}</bdi></dd></div>`).join('')}</dl>`
export const status = (label: string, hooks: HookAttributes, state = 'unread', hidden = false): string => `<p class="v2-account-tool__status" role="status"${hookAttrs(hooks)} data-state="${escapeHtml(state)}"${hidden ? ' hidden' : ''}>${escapeHtml(label)}</p>`
export function page(props: WhmSurfaceProps, route: string, title: string, description: string, bodyHtml: string, hooks?: HookAttributes): string {
  const locale = props.locale ?? 'en'
  const t = v2Messages.translator(locale)
  return `<section class="v2-account-tools" data-whm-detail-route="${escapeHtml(route)}" lang="${locale}" dir="${localeDirection(locale)}"${hookAttrs(hooks)}>${pageHeader(t, { title, route, description, breadcrumb: [{ label: t(msgid('Home')), href: '/whm' }, { label: title }] })}${bodyHtml}</section>`
}

// Structure, bidi and controller states only: surfaces, type and spacing come from the Metronic classes in the markup.
// The helper rules are not scoped to the page root, because the administrator cards also render on other WHM pages.
// Rhythm: 8px label to value, 16px between fields, 24px between groups, 32px between cards.
const TOOL_CARD = '.v2-card[aria-labelledby^="v2-account-tool-"]'
const STATUS = '.v2-account-tool__status'
export const WHM_ACCOUNT_TOOLS_CSS = V2_ACCOUNT_ANNOUNCEMENT_CSS + `.v2-account-tools{display:flex;flex-direction:column;gap:2rem;min-inline-size:0;text-align:start}
${TOOL_CARD}>.v2-card__body>p:not([class],[role]){font-size:1rem;line-height:var(--lh-text);font-weight:400;color:var(--text-2)}
${TOOL_CARD}>.v2-card__foot{justify-content:space-between;gap:.5rem 1rem;font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--text-2)}
${TOOL_CARD}>.v2-card__foot:has(>:only-child){justify-content:flex-end}
.v2-account-tool__groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;min-inline-size:0}
.v2-account-tool__groups>:not(fieldset),.v2-account-tool__groups>fieldset:not(fieldset+fieldset):not(:has(+fieldset)){grid-column:1/-1}
.v2-account-tool__groups>h3,.v2-account-tool__fields[data-web-template-form]>h3{font-size:1rem;line-height:var(--lh-text);font-weight:600;color:var(--mono,var(--text))}
.v2-account-tool__groups>:is([data-whm-announcements-editor-heading],[data-acct-templates-editor-heading]){font-size:.875rem;line-height:var(--lh-label);font-weight:500;color:var(--text-2)}
.v2-account-tool__fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.5rem;min-inline-size:0}
.v2-account-tool__fields:has(>:nth-child(3):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}
.v2-account-tool__fields[data-web-template-form]{grid-template-columns:minmax(0,1fr);gap:1rem}
.v2-account-tool__fields>[data-web-template-state]:empty{display:none}
.v2-account-tools form:not([class]),.v2-card__body>:is(form,div):not([class]):has(>.v2-account-tool__rows){display:flex;flex-direction:column;gap:1.5rem;min-inline-size:0}
.v2-account-tool__field{min-inline-size:0;text-align:start}
.v2-account-tool__field :is(input,textarea,select)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-account-tool__field :is(input,textarea)[dir=auto]{text-align:start}
.v2-account-tool__field textarea{min-block-size:8rem}
.v2-account-tool__filters{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;min-inline-size:0}
.v2-account-tool__filters>.v2-account-tool__search{flex:1 1 14rem;max-inline-size:20rem}
.v2-account-tool__search>input{inline-size:100%}
.v2-account-tool__filters>select{flex:0 1 12rem;inline-size:auto}
.v2-account-tool__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:1rem 1.5rem;min-inline-size:0}
.v2-account-tool__facts dt{text-box:trim-end text}
.v2-account-tool__facts dd{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
${STATUS}{font-size:1rem;line-height:var(--lh-text);font-weight:400;color:var(--text-2);overflow-wrap:anywhere}
${STATUS}:empty{display:none}
${STATUS}[data-state=unread]{color:var(--muted)}
${STATUS}:is([data-state=unavailable],[data-state=partial],[data-state=warning],[data-state=problem],[data-state=uncertain],[data-state=refused]):not(:empty){padding:1rem;border:1px solid var(--warn-line);border-radius:var(--radius-notice);background:var(--warn-soft);color:var(--text)}
${STATUS}:is([data-state=ok],[data-state=saved],[data-state=success]):not(:empty){padding:1rem;border:1px solid var(--ok-line);border-radius:var(--radius-notice);background:var(--ok-soft);color:var(--text)}
.v2-account-tool__actions,.v2-account-tool__choice-list{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.v2-account-tools :is([data-whm-health-selection],[data-quotas-page],[data-quotas-usage]){font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--text-2);font-variant-numeric:tabular-nums}
.v2-account-tool__choice{display:inline-flex;align-items:center;gap:.5rem;min-block-size:var(--target);font-size:.875rem;line-height:var(--lh-label);font-weight:500;color:var(--text);cursor:pointer}
.v2-account-tool__choice>input{flex:none}
.v2-account-tool__scroll{max-inline-size:100%;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-account-tool__scroll:has(>table>tbody:empty){display:none}
.v2-account-tool__scroll table{inline-size:100%}
.v2-account-tool__scroll td{font-variant-numeric:tabular-nums}
.v2-account-tool__scroll td[colspan]{color:var(--muted);text-align:center}
.v2-account-tool__scroll :is(th,td){overflow-wrap:anywhere}
.v2-account-tool__empty{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:2rem 1.5rem;border:1px dashed var(--line-strong);border-radius:var(--radius-card);text-align:center}
.v2-account-tool__empty>i{font-size:1.5rem;line-height:1;color:var(--muted)}
.v2-account-tool__empty>h3{font-size:1rem;line-height:var(--lh-text);font-weight:600;color:var(--mono,var(--text))}
.v2-account-tool__empty>p{font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--text-2)}
@media(min-width:1280px){.v2-account-tool__scroll :is(th,td){overflow-wrap:break-word}}
.v2-account-tools fieldset{display:flex;flex-direction:column;gap:1rem;border:1px solid var(--line);border-radius:var(--radius-card);padding:1.5rem;min-inline-size:0}
.v2-account-tools legend{float:inline-start;inline-size:100%;padding:0;font-size:1rem;line-height:var(--lh-text);font-weight:600;color:var(--mono,var(--text))}
.v2-account-tools fieldset>p:not([class],[role]){font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-account-tool__previews{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;min-inline-size:0}
.v2-account-tools [data-web-template-preview]{inline-size:100%;block-size:20rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--subtle)}
.v2-account-tool__preview{padding:1.5rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--subtle);min-inline-size:0}
.v2-whm-home__list.v2-whm-overview__services>li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem;padding-inline:0}
.v2-whm-home__list.v2-whm-overview__services>li[hidden]{display:none}
.v2-whm-home__list .v2-whm-inbox__main>strong{font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--mono,var(--text))}
.v2-whm-home__list .v2-whm-inbox__row[data-read=true] .v2-whm-inbox__main>strong{font-weight:400;color:var(--text-2)}
.v2-whm-home__list .v2-whm-favorites__link>small{font-size:.75rem;line-height:1rem;color:var(--muted)}
.v2-whm-home__list>li .v2-btn:not(.kt-btn){min-block-size:1.75rem;padding-inline:.625rem;font-size:.75rem;font-weight:500}
.v2-whm-home__list .v2-whm-favorites__actions{gap:.375rem}
.v2-whm-home__empty>i{flex:none}
.v2-whm-quotas__table{min-inline-size:45rem}
.v2-whm-quotas__table td small{display:block;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-whm-quotas__sort{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:.375rem;min-block-size:var(--target);cursor:pointer;font:inherit;color:inherit;border-radius:var(--radius-control)}
.v2-whm-quotas__sort>i{font-size:.75rem;color:var(--muted)}
.v2-whm-quotas__sort:hover,.v2-whm-quotas__table [aria-sort]:not([aria-sort=none])>.v2-whm-quotas__sort,.v2-whm-quotas__table [aria-sort]:not([aria-sort=none])>.v2-whm-quotas__sort>i{color:var(--accent)}
.v2-whm-quotas__sort:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.v2-whm-quotas__table td[data-quota-cell=change]{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.v2-whm-quotas__table td[data-quota-cell=change] input[type=text]{inline-size:8rem}
@media(max-width:800px){.v2-account-tool__previews,.v2-account-tool__groups{grid-template-columns:minmax(0,1fr)}.v2-account-tool__fields:has(>:nth-child(3):last-child){grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.v2-account-tool__fields,.v2-account-tool__fields:has(>:nth-child(3):last-child){grid-template-columns:minmax(0,1fr)}
.v2-account-tools fieldset{padding:1rem}
.v2-account-tool__filters>:is(.v2-account-tool__search,select){flex:1 1 100%;max-inline-size:none}
.v2-account-tool__scroll:has(>table[data-phone-labels]){border:0;border-radius:0;overflow:visible}
.v2-account-tool__scroll:has(>table[data-phone-labels] td[colspan])::before{content:attr(aria-label);display:block;margin-block-end:.5rem;font-size:.875rem;line-height:var(--lh-label);font-weight:600;color:var(--text-2)}
.v2-account-tool__scroll>table[data-phone-labels],.v2-account-tool__scroll>table[data-phone-labels]>tbody{display:block}
.v2-account-tool__scroll>table[data-phone-labels]>thead{display:none}
.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr{display:grid;gap:.5rem;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface)}
.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr+tr{margin-block-start:.5rem}
.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr>td{display:flex;flex-direction:column;gap:.5rem;padding:0;border:0}
.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr>td[data-phone-label]::before{content:attr(data-phone-label);font-size:.875rem;line-height:var(--lh-label);font-weight:500;color:var(--text-2)}
.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr>td:not([data-phone-label]),.v2-account-tool__scroll>table[data-phone-labels]>tbody>tr>td[colspan]{display:block}
.v2-whm-quotas__table{min-inline-size:0}.v2-whm-quotas__table thead{display:none}.v2-whm-quotas__table tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem;padding:1rem}.v2-whm-quotas__table td{padding:0!important;border:0!important}.v2-whm-quotas__table tr+tr{border-block-start:1px solid var(--line)}.v2-whm-quotas__table td[data-quota-cell=account]{grid-row:span 2}.v2-whm-quotas__table td[data-quota-cell=owner]{display:none}.v2-whm-quotas__table td[data-quota-cell=change]{grid-column:1/-1}}${whmPolish('.v2-account-tools')}`
