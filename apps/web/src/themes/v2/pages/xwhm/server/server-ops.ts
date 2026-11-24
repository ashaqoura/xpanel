import type { Translate } from '../../../../../i18n.ts'
import { SERVER_OPS_API, SERVER_OPS_CARDS, type ServerOpsCardId, type ServerOpsField } from '@xpanel/core'
import { card } from '../../../components/card.ts'
import { formField } from '../../../components/form-field.ts'
import { escapeHtml } from '../../../html.ts'
import { whmPolish } from '../monitoring/common.ts'
import { buttonIcon, ki, settingsCss, toggleCss } from './common.ts'

export const WHM_SERVER_OPS_ROUTES = ['/whm/server/networking', '/whm/server/role', '/whm/server/cron', '/whm/server/upgrade', '/whm/dns/more', '/whm/domains', '/whm/email/quality', '/whm/services/dns', '/whm/services/ftp', '/whm/services/certificates', '/whm/panel/notifications'] as const
export const WHM_SERVER_OPS_CSS = `.v2-server-ops,.v2-server-ops__form{display:flex;flex-direction:column;gap:24px;min-inline-size:0}
@media(min-width:1024px){.v2-server-ops{gap:32px}}
.v2-server-ops :is(p,dl,dd){margin:0}
.v2-server-ops__checks{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;min-inline-size:0}
${settingsCss('.v2-server-ops', { fields: '.v2-server-ops__fields', field: '.v2-field', actions: '.v2-server-ops__actions', scroll: '.v2-server-ops__scroll' })}${toggleCss('.v2-server-ops', '.v2-server-ops__toggle')}.v2-server-ops__scroll :is(th,td){overflow-wrap:anywhere}
.v2-server-ops [hidden]{display:none!important}
${whmPolish('.v2-server-ops')}`

/** V2 cards of the server operation tools, with the hooks the shared client binds. */
export function renderV2ServerOps(t: Translate, ids: readonly ServerOpsCardId[], canManage: boolean, canRead = true): string {
  const e = (value: string): string => escapeHtml(t(value))
  const control = (id: string, field: ServerOpsField): string => {
    const key = `whm-ops-${id}-${field.name}`
    // A boolean option is a switch row: label and hint on the start edge, the switch on the end edge.
    if (field.kind === 'check') return `<div class="v2-server-ops__toggle"><div class="flex flex-col gap-2 min-w-0"><label class="v2-server-ops__check text-base font-medium text-mono" for="${key}">${e(field.label)}</label>${field.help ? `<p class="v2-muted text-2sm text-secondary-foreground" id="${key}-help">${e(field.help)}</p>` : ''}</div><input id="${key}" class="kt-switch kt-switch" type="checkbox" role="switch" name="${escapeHtml(field.name)}"${field.help ? ` aria-describedby="${key}-help"` : ''} disabled></div>`
    return formField({ id: key, label: t(field.label), ...(field.help ? { help: t(field.help) } : {}), control: field.kind === 'select'
      ? { kind: 'select', name: field.name, disabled: true, options: (field.choices ?? []).map(([value, label]) => ({ value, label: t(label) })) }
      : { kind: 'input', name: field.name, disabled: true, ...(field.technical ? { dir: 'ltr' as const, mono: true, spellcheck: false } : {}), ...(field.maxLength ? { maxlength: field.maxLength } : {}), ...(field.placeholder ? { placeholder: field.placeholder } : {}) } })
  }
  const body = ids.map(id => {
    const spec = SERVER_OPS_CARDS[id]
    const table = spec.columns ? `<div class="v2-server-ops__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${e(spec.title)}"><table class="kt-table"><caption class="v2-sr">${e(spec.title)}</caption><thead><tr>${spec.columns.map(title => `<th scope="col">${e(title)}</th>`).join('')}</tr></thead><tbody data-server-ops-rows><tr><td colspan="${spec.columns.length}">${e(msgid('Not read'))}</td></tr></tbody></table></div>` : ''
    // Consecutive checkboxes form their own row group so they never interleave with text fields.
    const runs: ServerOpsField[][] = []
    for (const field of spec.fields) { const last = runs.at(-1); if (last && (last[0]!.kind === 'check') === (field.kind === 'check')) last.push(field); else runs.push([field]) }
    const fields = runs.map(run => `<div class="v2-server-ops__${run[0]!.kind === 'check' ? 'checks' : 'fields'}">${run.map(field => control(id, field)).join('')}</div>`).join('')
    const job = spec.jobLink ? `<a class="v2-btn kt-btn kt-btn-outline" href="/whm/jobs" data-server-ops-job hidden>${ki('open')}${e(msgid('Open job'))}</a>` : ''
    const glyph = buttonIcon(spec.submit) ?? 'save'
    return card({ id: `v2-server-ops-${id}`, title: t(spec.title), titleId: `v2-server-ops-${id}-heading`, bodyHtml: `<div class="v2-server-ops__form" role="group" aria-labelledby="v2-server-ops-${id}-heading" data-server-ops="${id}" data-server-ops-api="${SERVER_OPS_API[id]}" data-server-ops-can-read="${canRead}" data-server-ops-can-manage="${canManage}"><p class="v2-muted text-base text-secondary-foreground">${e(spec.lede)}</p>${fields}${table}<p role="status" data-state="unread" data-server-ops-status>${e(msgid('Not read'))}</p><div class="v2-server-ops__actions">${job}<button type="button" class="${spec.danger ? 'v2-btn v2-btn--danger kt-btn kt-btn-destructive' : 'v2-btn v2-btn--primary kt-btn kt-btn-primary'}" data-server-ops-submit disabled>${ki(glyph)}${e(spec.submit)}</button></div></div>` })
  }).join('')
  return `<div class="v2-server-ops">${body}</div>`
}
