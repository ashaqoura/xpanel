import type { WhmSurfaceProps } from '../../../../contract.ts'
import { localeDirection, type Translate } from '../../../../../i18n.ts'
import { v2Messages } from '../../../messages.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { card } from '../../../components/card.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { icon } from '../../../icons.ts'
import { mailCardsFor } from '../../../../../mail-cards.ts'
import { renderV2MailCards } from '../../mail-cards.ts'
import type { WhmStoredFactAuthority } from '../stored-facts.ts'

/** Core has already authorized the listener, principal and specific mail capability. */
export interface WhmMailAuthority extends WhmStoredFactAuthority { readonly canRead: boolean; readonly canManage: boolean; readonly qualifiedTools?: ReadonlySet<string> }
export interface WhmMailPageInput extends WhmSurfaceProps { readonly mailAuthority?: WhmMailAuthority }

export function mailContext(input: WhmMailPageInput) {
  const locale = input.locale ?? 'en'
  const canRead = input.mailAuthority?.canRead === true && input.capabilityUnavailable !== true
  return { t: v2Messages.translator(locale), locale, dir: localeDirection(locale), canRead,
    canManage: canRead && input.mailAuthority?.canManage === true }
}

/** Keenicons the shared v2 icon set has no name for; complete literal class names. */
const GLYPHS = {
  eye: 'ki-eye', trash: 'ki-trash', lock: 'ki-lock', key: 'ki-key', calculator: 'ki-calculator', loop: 'ki-arrows-loop',
  searchList: 'ki-search-list', shieldSearch: 'ki-shield-search', shieldCross: 'ki-shield-cross', timer: 'ki-timer',
  message: 'ki-message-text-2', send: 'ki-paper-plane',
} as const
export type MailGlyph = keyof typeof GLYPHS
const GLYPH_SIZE = { base: 'text-base', lg: 'text-lg', xl: 'text-xl' } as const
/** A decorative Keenicon; its meaning is carried by the text beside it. */
export const glyph = (name: MailGlyph, size: keyof typeof GLYPH_SIZE = 'base'): string =>
  `<i class="v2-icon ki-filled ${GLYPHS[name]} ${GLYPH_SIZE[size]} leading-none" aria-hidden="true"></i>`

export const technical = (value: string | number): string => `<bdi class="v2-mono" dir="ltr">${escapeHtml(value)}</bdi>`
/** Complete class names per tone, so the stylesheet build finds them. */
const BUTTON_CLASS = { default: 'v2-btn kt-btn kt-btn-outline', primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary', danger: 'v2-btn v2-btn--danger kt-btn kt-btn-outline kt-btn-destructive' } as const
/** `iconHtml` is a leading icon built with `icon()` or `glyph()`. */
export const button = (label: string, hooks: HookAttributes, disabled = true, tone: 'default' | 'primary' | 'danger' = 'default', iconHtml = ''): string =>
  `<button type="button" class="${BUTTON_CLASS[tone]}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${iconHtml}${escapeHtml(label)}</button>`
/** A state line: quiet while nothing needs attention, a light alert once its controller reports a state that does. */
export const status = (message: string, hooks: HookAttributes, hidden = false): string =>
  `<div class="v2-whm-mail__note"><span aria-hidden="true"><span>${icon('info', 18)}</span><span>${icon('okCircle', 18)}</span><span>${icon('alert', 18)}</span></span><p class="v2-whm-mail__status" role="status" data-state="unread"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${escapeHtml(message)}</p></div>`
/** Secondary copy inside a card. */
export const note = (text: string, hooks: HookAttributes = {}, hidden = false): string =>
  `<p class="text-base text-secondary-foreground"${hookAttrs(hooks)}${hidden ? ' hidden' : ''}>${escapeHtml(text)}</p>`

/** A warning that appears when its controller unhides it (a truncated or incomplete read). */
export const caution = (text: string, hooks: HookAttributes, role = ''): string =>
  `<p class="kt-alert kt-alert-light kt-alert-warning"${hookAttrs(hooks)}${role ? ` role="${role}"` : ''} hidden><span class="kt-alert-icon text-yellow-500">${icon('alert', 18)}</span><span class="kt-alert-title">${escapeHtml(text)}</span></p>`

export interface GroupParts {
  /** A table region that runs edge to edge under the card content. */
  tableHtml?: string
  /** Footer actions, laid out at the end of the card. */
  footerHtml?: string
}
const CONTENT = 'v2-whm-mail__content kt-card-content flex flex-col gap-6 min-w-0'
const FOOTER = 'flex flex-wrap items-center justify-end gap-2 w-full'
export const group = (key: string, title: string, bodyHtml: string, actionsHtml?: string, parts: GroupParts = {}): string =>
  card({ title, titleId: `v2-whm-mail-${key}`, flush: true,
    bodyHtml: `${bodyHtml ? `<div class="${CONTENT}">${bodyHtml}</div>` : ''}${parts.tableHtml ?? ''}`,
    ...(actionsHtml ? { actionsHtml } : {}), ...(parts.footerHtml ? { footerHtml: `<div class="${FOOTER}">${parts.footerHtml}</div>` } : {}) })
/** A settings card whose form (or its read-only stand-in) wraps both the rows and the footer actions. */
export const formGroup = (key: string, title: string, open: string, close: string, bodyHtml: string, footerHtml: string): string =>
  card({ title, titleId: `v2-whm-mail-${key}`, flush: true,
    bodyHtml: `${open}<div class="${CONTENT}">${bodyHtml}</div><div class="v2-whm-mail__foot kt-card-footer flex-wrap justify-end gap-2">${footerHtml}</div>${close}` })

/** A stack of fields 16px apart, each label 8px above its control. `wide` names the settings with long keys (Postfix
 *  parameter names); both stack the same way now that the label column is withdrawn. */
const ROWS = { normal: 'v2-whm-mail__rows grid gap-4 min-w-0', wide: 'v2-whm-mail__rows grid gap-4 min-w-0' } as const
export const rows = (fieldsHtml: string, labels: keyof typeof ROWS = 'normal'): string => `<div class="${ROWS[labels]}">${fieldsHtml}</div>`
/** A switch row: label and description on the start, the switch on the end. */
export const switchRow = (id: string, label: string, hooks: HookAttributes, help?: string): string =>
  `<div class="v2-whm-mail__switch flex items-center justify-between gap-6 pb-4 border-b border-border"><div class="flex flex-col gap-1 min-w-0"><label for="${id}" class="inline-flex items-center min-h-11 text-base font-medium text-mono">${escapeHtml(label)}</label>${help ? `<p id="${id}-help" class="text-[13px] leading-(--lh-cap) text-secondary-foreground">${escapeHtml(help)}</p>` : ''}</div><input id="${id}" class="kt-switch shrink-0" type="checkbox" role="switch"${hookAttrs(hooks)}${help ? ` aria-describedby="${id}-help"` : ''} disabled></div>`

/** Facts: each label 8px above its value on the same start edge, in a grid of columns on wide screens. */
export function facts(t: Translate, rows: readonly (readonly [string, string])[], attribute: string): string {
  return `<dl class="v2-whm-mail__facts">${rows.map(([key, label]) => `<div><dt>${escapeHtml(t(label))}</dt><dd><bdi dir="ltr" ${attribute}="${escapeHtml(key)}">${escapeHtml(t(msgid('Not read')))}</bdi></dd></div>`).join('')}</dl>`
}
const TILE_TONE = { neutral: 'text-muted-foreground', ok: 'text-green-500', warn: 'text-yellow-500', bad: 'text-destructive', info: 'text-primary' } as const
export interface MailTile { label: string; iconHtml: string; tone?: keyof typeof TILE_TONE; valueHtml: string }
/** Counter tiles: the label with its icon, the value large under it. */
export const tiles = (items: readonly MailTile[]): string =>
  `<dl class="v2-whm-mail__tiles grid grid-cols-2 md:grid-cols-3 min-[1600px]:grid-cols-6 gap-2 lg:gap-6 min-w-0">${items.map(item => `<div class="flex flex-col gap-2 min-w-0 rounded-md border border-dashed border-input px-4 py-3"><dt class="flex items-center gap-1.5 text-sm leading-(--lh-label) text-secondary-foreground"><span class="inline-flex ${TILE_TONE[item.tone ?? 'neutral']}">${item.iconHtml}</span>${escapeHtml(item.label)}</dt>${item.valueHtml}</div>`).join('')}</dl>`
export const TILE_VALUE = 'text-lg sm:text-2xl font-semibold text-mono leading-8'

/** Phone rows name each stacked value: the translated headers travel to CSS as custom properties on the table. */
export const columnLabels = (headers: readonly string[], offset = 0): string =>
  ` style="${escapeHtml(headers.map((label, index) => `--v2-col-${index + 1 + offset}:'${label.replace(/[\\']/g, '\\$&')}'`).join(';'))}"`

/** Complete class lists of a table region: flush under card content, or boxed inside it. */
export const SCROLL_CLASS = { flush: 'v2-whm-mail__scroll kt-scrollable-x-auto', boxed: 'v2-whm-mail__scroll kt-scrollable-x-auto rounded-lg border border-border' } as const
export function table(t: Translate, title: string, headers: readonly string[], hooks: HookAttributes, empty = t(msgid('Nothing has been read.')), flush = false): string {
  return `<div class="${SCROLL_CLASS[flush ? 'flush' : 'boxed']}" role="region" tabindex="0" aria-label="${escapeHtml(title)}"><table class="v2-whm-mail__table kt-table"${columnLabels(headers)}><caption class="v2-sr">${escapeHtml(title)}</caption><thead><tr>${headers.map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody${hookAttrs(hooks)}><tr><td colspan="${headers.length}">${escapeHtml(empty)}</td></tr></tbody></table></div>`
}

export function page(input: WhmMailPageInput, route: string, title: string, description: string, body: string): string {
  const { t, canRead, canManage, locale } = mailContext(input)
  const cards = renderV2MailCards(mailCardsFor(route, t, { canRead, canAct: tool => canManage && input.mailAuthority?.qualifiedTools?.has(tool) === true }), locale)
  const head = pageHeader(t, { route, title, description, breadcrumb: [
    { label: t(msgid('Home')), href: '/whm' }, { label: t(msgid('Email')) }, { label: title },
  ] })
  return `<section class="v2-whm-mail" data-whm-detail-route="${escapeHtml(route)}" data-capability-state="${canRead ? 'authorized' : 'unavailable'}">${head}${body}${cards}</section>`
}

// State selectors carry the colours of the matching Metronic variants: the light kt-alert for state lines and
// results, the outline kt-badge for check results. The glyph in the timeline marker is Keenicons "time".
const ALERT = ':is([data-state=failed],[data-state=error],[role=alert],[data-outcome=failed],[data-outcome=denied],[data-outcome=unknown],[data-outcome=refused],[data-outcome=conflict])'
const CAUTION = ':is([data-state=unavailable],[data-state=partial],[data-state=drift],[data-state=stale],[data-state=uncertain],[data-state=not-saved],[data-outcome=partial],[data-outcome=skipped])'
const DONE = ':is([data-state=saved],[data-state=applied],[data-outcome=confirmed],[data-outcome=attempted],[data-outcome=submitted],[data-outcome=applied],[data-outcome=ok])'
const NOTE = '.v2-whm-mail__note'
const STACKED = ':is(.v2-whm-mail__scroll tr:not(:has(>td>[type=checkbox]))>td:nth-child(n+3):not([colspan],:empty),.v2-whm-mail__scroll tr:has(>td>[type=checkbox])>td:nth-child(n+4):not(:empty))'
export const WHM_MAIL_CSS = `.v2-whm-mail,.v2-whm-mail__stack{display:flex;flex-direction:column;gap:2rem;min-inline-size:0}
.v2-whm-mail__field{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0}
.v2-whm-mail__field>.kt-form-label{display:block;padding-inline:calc(.75rem + 1px);text-box:trim-end text}
.v2-whm-mail [dir=ltr]:is(input,select,textarea,pre){text-align:var(--v2-control-align,start)}
.v2-whm-mail :is(input.v2-mono:placeholder-shown,select.v2-mono:has(>option[value=""]:checked)){font-family:inherit}
.v2-whm-mail__form{display:flex;flex-direction:column;min-inline-size:0;margin:0}
.v2-whm-mail__rows>.kt-form-item>:first-child{overflow-wrap:anywhere}
.v2-whm-mail__content a:not([class]){font-weight:500;text-underline-offset:4px}
.v2-whm-mail__content a:not([class]):hover{text-decoration:underline}
.v2-whm-mail dd:empty::before{content:"—";color:var(--muted)}
.v2-whm-mail__fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:1rem 1.5rem;min-inline-size:0}
.v2-whm-mail [data-list-reset] .v2-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
${NOTE}{display:flex;align-items:flex-start;gap:.5rem;min-inline-size:0;font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
${NOTE}:has(>.v2-whm-mail__status:is([hidden],:empty)){display:none}
${NOTE}>span{flex:none;display:inline-flex;color:var(--muted)}
${NOTE}>span>span{display:none}
${NOTE}>span>span:first-child{display:inline-flex}
.v2-whm-mail__status{flex:1 1 0;min-inline-size:0;padding:0;border:0;border-radius:0;background:none;color:inherit;font-size:inherit;overflow-wrap:anywhere}
${NOTE}:has(>${ALERT},>${CAUTION},>${DONE}){padding:1rem;border:1px solid var(--line);border-radius:.5rem;color:var(--text)}
${NOTE}:has(>${ALERT}){border-color:color-mix(in oklab,var(--destructive) 10%,transparent);background:color-mix(in oklab,var(--destructive) 5%,transparent)}
${NOTE}:has(>${CAUTION}){border-color:var(--warn-line);background:var(--warn-soft)}
${NOTE}:has(>${DONE}){border-color:var(--ok-line);background:var(--ok-soft)}
${NOTE}:has(>${ALERT})>span{color:var(--destructive)}
${NOTE}:has(>${CAUTION})>span{color:var(--color-yellow-500)}
${NOTE}:has(>${DONE})>span{color:var(--color-green-500)}
${NOTE}:has(>${ALERT},>${CAUTION},>${DONE})>span>span:first-child{display:none}
${NOTE}:has(>${ALERT},>${CAUTION})>span>span:last-child,${NOTE}:has(>${DONE})>span>span:nth-child(2){display:inline-flex}
.v2-whm-mail__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));gap:1rem 1.5rem;min-inline-size:0}
.v2-whm-mail__facts>div{display:flex;flex-direction:column;gap:.5rem;min-inline-size:0}
.v2-whm-mail__facts dt{min-inline-size:0;font-size:.875rem;line-height:var(--lh-label);color:var(--text-2);text-box:trim-end text}
.v2-whm-mail__facts dd{min-inline-size:0;font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--mono,var(--text));font-variant-numeric:tabular-nums;unicode-bidi:plaintext;text-align:var(--v2-control-align,match-parent);overflow-wrap:anywhere}
.v2-whm-mail__tiles dd{font-variant-numeric:tabular-nums;unicode-bidi:plaintext;text-align:var(--v2-control-align,match-parent);overflow-wrap:break-word}
.v2-whm-mail__timeline{display:flex;flex-direction:column}
.v2-whm-mail__timeline>li{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.25rem;min-block-size:2.25rem;padding-inline-start:3rem;padding-block-end:1.5rem;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2);overflow-wrap:anywhere}
.v2-whm-mail__timeline>li:last-child{padding-block-end:0}
.v2-whm-mail__timeline>li>strong{font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--text)}
.v2-whm-mail__timeline>li::before{content:"\\ecd5";position:absolute;inset-block-start:0;inset-inline-start:0;display:flex;align-items:center;justify-content:center;inline-size:2.25rem;block-size:2.25rem;border:1px solid var(--line-strong);border-radius:50%;background:color-mix(in oklab,var(--kt-accent) 60%,transparent);font-family:"keenicons-filled";font-size:1rem;line-height:1;color:var(--text-2)}
.v2-whm-mail__timeline>li:not(:last-child)::after{content:"";position:absolute;inset-block:2.25rem 0;inset-inline-start:1.125rem;border-inline-start:1px solid var(--line-strong)}
.v2-whm-mail__results{display:flex;flex-direction:column;gap:.5rem;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text)}
.v2-whm-mail__results>li{position:relative;padding-inline-start:1rem;overflow-wrap:anywhere}
.v2-whm-mail__results>li::before{content:"";position:absolute;inset-block-start:.4375rem;inset-inline-start:0;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:var(--muted);opacity:.75}
.v2-whm-mail__results>li${ALERT}::before{background:var(--destructive)}
.v2-whm-mail__results>li${CAUTION}::before{background:var(--color-yellow-500)}
.v2-whm-mail__results>li${DONE}::before{background:var(--color-green-500)}
.v2-whm-mail__scroll{min-inline-size:0;overflow-x:auto}
.v2-whm-mail__content+.v2-whm-mail__scroll{border-block-start:1px solid var(--line)}
.v2-whm-mail__table :is(th,td){text-align:start}
.v2-whm-mail__table thead th{white-space:nowrap}
.v2-whm-mail__table:where(:has(thead th:nth-child(5))){min-inline-size:45rem}
.v2-whm-mail__table td{overflow-wrap:break-word;font-variant-numeric:tabular-nums}
.v2-whm-mail__table td[colspan]{padding-block:2rem;text-align:center;color:var(--muted)}
.v2-whm-mail__table tbody tr:not(:has([type=checkbox]))>td:first-child:not([colspan]),.v2-whm-mail__table tbody tr:has(>td:first-child [type=checkbox])>td:nth-child(2){font-weight:500;color:var(--mono,var(--text))}
.v2-whm-mail__table td[data-state]{font-size:.8125rem;line-height:var(--lh-cap);font-weight:500;white-space:nowrap;color:var(--text-2)}
.v2-whm-mail [data-check] strong::before{content:"";flex:none;inline-size:.375rem;block-size:.375rem;margin-inline-end:.375rem;border-radius:50%;background:currentColor;opacity:.75}
@media(min-width:601px){.v2-whm-mail__table td[data-state]::before{content:"";display:inline-block;inline-size:.375rem;block-size:.375rem;margin-inline-end:.375rem;border-radius:50%;background:currentColor;opacity:.75;vertical-align:middle}}
.v2-whm-mail__table td[data-state=match]{color:var(--ok)}
.v2-whm-mail__table td[data-state=drift]{color:var(--warn)}
.v2-whm-mail [data-check]>.v2-field{align-items:flex-start;gap:.5rem;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-whm-mail [data-check] strong{display:inline-flex;align-items:center;block-size:1.5rem;padding-inline:.5rem;border:1px solid var(--line);border-radius:.375rem;background:var(--sunken);color:var(--text-2);font-size:.8125rem;font-weight:500;white-space:nowrap}
.v2-whm-mail [data-check] strong[data-state=ok]{border-color:var(--ok-line);background:var(--ok-soft);color:var(--ok)}
.v2-whm-mail [data-check] strong[data-state=problem]{border-color:var(--bad-line);background:var(--bad-soft);color:var(--bad)}
.v2-whm-mail [data-check] strong[data-state=unavailable]{border-color:var(--warn-line);background:var(--warn-soft);color:var(--warn)}
.v2-whm-mail__check-cell{display:inline-flex;align-items:center;justify-content:center;min-inline-size:var(--target);min-block-size:var(--target);cursor:pointer}
.v2-whm-mail__table th:has(>.v2-whm-mail__check-cell){inline-size:3.75rem}
.v2-whm-mail__table td>select{inline-size:100%;min-inline-size:12.5rem;max-inline-size:16.25rem}

.v2-whm-mail__table tr:has(>td:nth-child(10))>td:is(:nth-child(7),:nth-child(8)){overflow-wrap:anywhere}
@media(min-width:601px){.v2-whm-mail__table tr:has(>td:nth-child(10))>td:is(:nth-child(2),:nth-child(3),:nth-child(4),:nth-child(5),:nth-child(6)){overflow-wrap:normal;white-space:nowrap}.v2-whm-mail__table:has(>[data-whm-mail-queue-rows] td:nth-child(10)) th:is(:nth-child(7),:nth-child(8),:nth-child(9)){min-inline-size:15rem}.v2-whm-mail__table:has(>[data-whm-mail-queue-rows] td:nth-child(10)) th:last-child{min-inline-size:14rem}.v2-whm-mail__table:has(>[data-whm-mail-queue-rows]) tr>:last-child:not([colspan]){position:sticky;inset-inline-end:0;background:var(--surface);border-inline-start:1px solid var(--line)}.v2-whm-mail__table:has(>[data-whm-mail-queue-rows]) thead tr>:last-child:not([colspan]){background-image:linear-gradient(var(--subtle),var(--subtle))}}
@media(max-width:640px){.v2-whm-mail__fields{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-whm-mail ${STACKED}{grid-column:1/-1;display:flex;flex-direction:column;gap:.5rem;text-align:start;overflow-wrap:anywhere}
.v2-whm-mail ${STACKED}>*{min-inline-size:0}
.v2-whm-mail__table td>.v2-whm-mail__actions{justify-content:flex-start}
.v2-whm-mail ${STACKED}::before{flex:none;font-size:.875rem;line-height:var(--lh-label);color:var(--text-2);text-align:start}
.v2-whm-mail__scroll td:nth-child(3):not([colspan])::before{content:var(--v2-col-3)}.v2-whm-mail__scroll tr:has(>td>[type=checkbox])>td:nth-child(3)::before{content:none}.v2-whm-mail__scroll td:nth-child(4):not([colspan])::before{content:var(--v2-col-4)}.v2-whm-mail__scroll td:nth-child(5):not([colspan])::before{content:var(--v2-col-5)}.v2-whm-mail__scroll td:nth-child(6):not([colspan])::before{content:var(--v2-col-6)}.v2-whm-mail__scroll td:nth-child(7):not([colspan])::before{content:var(--v2-col-7)}.v2-whm-mail__scroll td:nth-child(8):not([colspan])::before{content:var(--v2-col-8)}.v2-whm-mail__scroll td:nth-child(9):not([colspan])::before{content:var(--v2-col-9)}.v2-whm-mail__scroll td:nth-child(10):not([colspan])::before{content:var(--v2-col-10)}
.v2-whm-mail__table td .v2-btn{min-height:var(--target)}.v2-whm-mail table.v2-whm-mail__table tr>td:first-child:has(>[type=checkbox]){grid-column:auto;grid-row:auto;line-height:0}.v2-whm-mail__table:where(:has(thead th:nth-child(5))){min-inline-size:35rem}}
`
