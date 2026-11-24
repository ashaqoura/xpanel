import { localeDirection } from '../../../../i18n.ts'
import type { Locale, Translate } from '../../../../i18n.ts'
import { SVC_COPY, SVC_PANELS, svcHooks } from '../../../../models/svc-panels.ts'
import type { SvcFact, SvcForm, SvcInput, SvcPanel, SvcSection, SvcTable } from '../../../../models/svc-panels.ts'
import { card } from '../../components/card.ts'
import { escapeHtml as esc } from '../../html.ts'
import { whmPolish } from './monitoring/common.ts'
import { phoneColumns, phoneRows } from './lifecycle/shared.ts'
import { buttonIcon, ki, settingsCss, toggleCss } from './server/common.ts'

export const WHM_SVC_ROUTES = Object.freeze(Object.keys(SVC_PANELS))
/** Used only on the routes in WHM_SVC_ROUTES. */
export const WHM_SVC_CSS = `.v2-svc{display:flex;flex-direction:column;gap:24px;min-inline-size:0}
.v2-svc :is(h2,h3,p,dl,dd){margin:0}
.v2-svc__panel{display:flex;flex-direction:column;gap:24px;min-inline-size:0}
@media(min-width:1024px){.v2-svc,.v2-svc__panel{gap:32px}}
.v2-svc .v2-card__body{gap:24px}
${settingsCss('.v2-svc', { fields: 'div.v2-svc__grid', field: '.v2-field', facts: 'dl.v2-svc__grid', actions: '.v2-svc__actions', scroll: '.v2-svc__scroll', cssRows: true })}${toggleCss('.v2-svc', '.v2-svc__toggle')}.v2-svc textarea{min-block-size:6rem}
.v2-svc :is(th,td){overflow-wrap:break-word}
.v2-svc td>button{margin-inline-end:.5rem}
@media(max-width:600px){.v2-svc__scroll{border:0;border-radius:0;background:transparent}
${phoneRows('.v2-svc .v2-svc__scroll>table')}
.v2-svc .v2-svc__scroll>table>tbody>tr>:is(th,td){padding:0!important}
.v2-svc .v2-svc__scroll>table>tbody>tr:nth-child(n)>:nth-child(n){overflow-wrap:break-word}
.v2-svc__scroll:has(td[colspan])::before{content:attr(aria-label);display:block;margin-block-end:.5rem;font-size:.8125rem;color:var(--muted)}.v2-svc__scroll td[colspan]{padding-inline:0;font-weight:500}}
${whmPolish('.v2-svc')}`

/** V2 drawing of the services and security centre panels of one route; the shared schema decides the content. */
export function renderV2SvcPanels(route: string, t: Translate, locale: Locale, canRead: boolean, canManage: (tool: string) => boolean): string {
  const panels = SVC_PANELS[route]
  if (!panels?.length || !canRead) return ''
  const text = (value: string): string => esc(t(value))
  // The primary action ends the row, on the inline end.
  const isPrimary = (button: NonNullable<SvcSection['buttons']>[number]): boolean => button.op === 'save' || ('primary' in button && !!button.primary)
  const fact = (item: SvcFact): string => `<div><dt class="text-sm font-normal text-secondary-foreground">${text(item.label)}</dt><dd class="text-base font-medium text-mono"><bdi dir="ltr"${svcHooks.fact(t, item)}>${text(SVC_COPY.notRead)}</bdi></dd></div>`
  const control = (panel: SvcPanel, form: SvcForm, field: SvcInput): string => {
    const id = `v2-svc-${panel.id}-${form.role}-${field.key.replaceAll('.', '-')}`, hooks = svcHooks.input(form, field), dir = field.technical || field.kind === 'number' ? ' dir="ltr"' : ''
    // A boolean option is a switch row: the label on the start edge, the switch on the end edge.
    if (field.kind === 'check') return `<div class="v2-svc__toggle"><label class="v2-svc__check text-base font-medium text-mono" for="${id}">${text(field.label)}</label><input id="${id}" class="kt-switch kt-switch" type="checkbox" role="switch"${hooks} disabled></div>`
    const body = field.kind === 'select' ? `<span class="v2-select"><select id="${id}" class="${dir ? 'kt-select rtl:ps-6 rtl:pe-3' : 'kt-select'}"${hooks}${dir} disabled>${(field.choices ?? []).map(([value, label]) => `<option value="${esc(value)}">${text(label)}</option>`).join('')}</select></span>`
      : field.kind === 'lines' || field.kind === 'area' ? `<textarea id="${id}" class="kt-textarea"${hooks}${dir} disabled></textarea>`
      : `<input id="${id}" class="kt-input" type="${field.kind === 'number' ? 'number' : 'text'}"${hooks}${dir}${field.min === undefined ? '' : ` min="${field.min}"`}${field.max === undefined ? '' : ` max="${field.max}"`} disabled>`
    return `<div class="v2-field"><label class="kt-form-label leading-5" for="${id}">${text(field.label)}</label>${body}${field.help ? `<p class="v2-muted kt-form-description">${text(field.help)}</p>` : ''}</div>`
  }
  const tableOf = (item: SvcTable): string => `<div class="v2-svc__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${text(item.title)}"><table class="kt-table"${phoneColumns([...item.columns.map(column => t(column.label)), ...(item.ops?.length ? [t(SVC_COPY.actions)] : [])])}><caption class="v2-sr">${text(item.title)}</caption><thead><tr>${item.columns.map(column => `<th scope="col">${text(column.label)}</th>`).join('')}${item.ops?.length ? `<th scope="col">${text(SVC_COPY.actions)}</th>` : ''}</tr></thead><tbody${svcHooks.rows(t, item)}><tr><td data-table-empty colspan="${item.columns.length + (item.ops?.length ? 1 : 0)}">${text(SVC_COPY.notRead)}</td></tr></tbody></table></div>`
  const section = (panel: SvcPanel, item: SvcSection, first: boolean): string => {
    const glyph = (button: NonNullable<SvcSection['buttons']>[number]): string => { const name = button.op === 'save' ? 'save' : button.op === 'refresh' ? 'refresh' : button.op === 'add' ? 'add' : buttonIcon(button.label); return name ? ki(name) : '' }
    const body = `${item.help ? `<p class="v2-muted text-base text-secondary-foreground">${text(item.help)}</p>` : ''}${(item.forms ?? []).map(form => `<div class="v2-svc__grid">${form.inputs.map(field => control(panel, form, field)).join('')}</div>`).join('')}${item.facts?.length ? `<dl class="v2-svc__grid">${item.facts.map(fact).join('')}</dl>` : ''}${(item.tables ?? []).map(tableOf).join('')}${item.buttons?.length ? `<div class="v2-svc__actions">${[...item.buttons].sort((a, b) => Number(isPrimary(a)) - Number(isPrimary(b))).map(button => `<button type="button" class="${isPrimary(button) ? 'v2-btn v2-btn--primary kt-btn kt-btn-primary' : 'v2-btn kt-btn kt-btn-outline'}"${svcHooks.button(t, button)} disabled>${glyph(button)}${text(button.label)}</button>`).join('')}</div>` : ''}${first ? `<p class="v2-svc__status" data-svc-status data-state="unread" role="status">${text(SVC_COPY.unread)}</p>` : ''}`
    return `<div data-svc-section>${card({ title: t(item.title), titleId: `v2-svc-${item.id}`, bodyHtml: body })}</div>`
  }
  const panel = (item: SvcPanel): string => `<div class="v2-svc__panel"${svcHooks.panel(item, canRead, canManage(item.tool))}><template data-svc-row-button><button type="button" class="v2-btn kt-btn kt-btn-outline"></button></template>${item.sections.map((part, index) => section(item, part, index === 0)).join('')}</div>`
  return `<div class="v2-svc" lang="${esc(locale)}" dir="${localeDirection(locale)}">${panels.map(panel).join('')}</div>`
}
