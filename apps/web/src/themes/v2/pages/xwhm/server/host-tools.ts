import type { Translate } from '../../../../../i18n.ts'
import { HOST_TOOL_CARDS, hostToolSpec, type HostToolCardId, type HostToolField } from '@xpanel/core'
import { card } from '../../../components/card.ts'
import { formField } from '../../../components/form-field.ts'
import { escapeHtml } from '../../../html.ts'
import { whmPolish } from '../monitoring/common.ts'
import { buttonIcon, ki, settingsCss, toggleCss } from './common.ts'

export const WHM_HOST_TOOLS_ROUTES = ['/whm/server/cron', '/whm/server/terminal', '/whm/server/networking', '/whm/server/setup', '/whm/services/more', '/whm/software/php', '/whm/monitoring/logs'] as const
export const WHM_HOST_TOOLS_CSS = `.v2-host-tools,.v2-host-tools__form{display:flex;flex-direction:column;gap:24px;min-inline-size:0}
@media(min-width:1024px){.v2-host-tools{gap:32px}}
.v2-host-tools :is(p,dl,dd,pre){margin:0}
${settingsCss('.v2-host-tools', { fields: 'div.v2-host-tools__fields', field: '.v2-field', facts: 'dl.v2-host-tools__fields', actions: ':is(.v2-host-tools__actions,[data-host-tool-row-actions])', scroll: '.v2-host-tools__scroll' })}${toggleCss('.v2-host-tools', '.v2-host-tools__toggle')}.v2-host-tools [data-host-tool-fact]{font-variant-numeric:tabular-nums}
.v2-host-tools__scroll :is(th,td){overflow-wrap:anywhere}
.v2-host-tools pre{max-block-size:320px;overflow:auto;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font-size:.8125rem;line-height:var(--lh-cap);font-variant-numeric:tabular-nums;white-space:pre-wrap;overflow-wrap:anywhere}
.v2-host-tools code{display:block;padding:.75rem 1rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--sunken);color:var(--text);font-family:var(--font-mono);font-size:.8125rem;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.v2-host-tools [hidden]{display:none!important}
${whmPolish('.v2-host-tools')}`

/** V2 cards of the scheduler and host tools, with the hooks the shared client binds. */
export function renderV2HostTools(t: Translate, ids: readonly HostToolCardId[], canManage: boolean): string {
  const e = (value: string): string => escapeHtml(t(value))
  const control = (id: string, field: HostToolField): string => {
    const key = `whm-tool-${id}-${field.name}`, when = field.when ? ` data-host-tool-when="${escapeHtml(`${field.when[0]}:${field.when[1].join(',')}`)}"` : ''
    // A boolean option is a switch row: label and hint on the start edge, the switch on the end edge.
    if (field.kind === 'check') return `<div class="v2-host-tools__toggle"${when}><div class="flex flex-col gap-2 min-w-0"><label class="v2-host-tools__check text-base font-medium text-mono" for="${key}">${e(field.label)}</label>${field.help ? `<p class="v2-muted text-2sm text-secondary-foreground" id="${key}-help">${e(field.help)}</p>` : ''}</div><input id="${key}" class="kt-switch kt-switch" type="checkbox" role="switch" name="${escapeHtml(field.name)}"${field.help ? ` aria-describedby="${key}-help"` : ''} disabled></div>`
    const help = field.help ? { help: t(field.help) } : {}
    const body = field.kind === 'select'
      ? formField({ id: key, label: t(field.label), ...help, control: { kind: 'select', name: field.name, disabled: true, ...(field.from ? { hooks: { 'data-host-tool-from': field.from } } : {}), options: (field.choices ?? []).map(([value, label]) => ({ value, label: t(label) })) } })
      : field.kind === 'area'
        ? formField({ id: key, label: t(field.label), ...help, control: { kind: 'textarea', name: field.name, disabled: true, dir: 'ltr', mono: true, spellcheck: false, rows: 4, autocomplete: 'off', ...(field.maxLength ? { maxlength: field.maxLength } : {}) } })
        : formField({ id: key, label: t(field.label), ...help, control: { kind: 'input', type: field.kind === 'password' ? 'password' : 'text', name: field.name, disabled: true, autocomplete: field.kind === 'password' ? 'new-password' : 'off', ...(field.technical || field.kind === 'password' ? { dir: 'ltr' as const, mono: true, spellcheck: false } : {}), ...(field.maxLength ? { maxlength: field.maxLength } : {}), ...(field.placeholder ? { placeholder: field.placeholder } : {}) } })
    return when ? `<div${when}>${body}</div>` : body
  }
  const body = ids.map(id => {
    const spec = HOST_TOOL_CARDS[id], columns = spec.columns ?? [], extra = spec.actions?.length ? 1 : 0
    const table = columns.length ? `<div class="v2-host-tools__scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${e(spec.title)}"><table class="kt-table"><caption class="v2-sr">${e(spec.title)}</caption><thead><tr>${columns.map(([title]) => `<th scope="col">${e(title)}</th>`).join('')}${extra ? `<th scope="col">${e(msgid('Actions'))}</th>` : ''}</tr></thead><tbody data-host-tool-rows><tr><td colspan="${columns.length + extra}">${e(msgid('Not read'))}</td></tr></tbody></table></div>` : ''
    const facts = spec.facts?.length ? `<dl class="v2-host-tools__fields">${spec.facts.map(([key, label]) => `<div><dt class="text-sm font-normal text-secondary-foreground">${e(label)}</dt><dd class="text-base font-medium text-mono"><bdi dir="ltr" data-host-tool-fact="${escapeHtml(key)}">${e(msgid('Not read'))}</bdi></dd></div>`).join('')}</dl>` : ''
    const fields = spec.fields.length ? `<div class="v2-host-tools__fields" data-host-tool-fields>${spec.fields.map(field => control(id, field)).join('')}</div>` : ''
    const tools = (spec.tools ?? []).map(([label, path]) => { const glyph = buttonIcon(label); return `<button type="button" class="v2-btn kt-btn kt-btn-outline" data-host-tool-tool="${escapeHtml(path)}" disabled>${glyph ? ki(glyph) : ''}${e(label)}</button>` }).join('')
    const link = spec.link ? `<a class="v2-btn kt-btn kt-btn-outline" href="${escapeHtml(spec.link[0])}">${ki('open')}${e(spec.link[1])}</a>` : ''
    const glyph = spec.submit ? buttonIcon(spec.submit) ?? (spec.danger ? undefined : 'save') : undefined
    const submit = spec.submit ? `<button type="button" class="v2-btn kt-btn kt-btn-ghost" data-host-tool-cancel hidden disabled>${e(msgid('Cancel'))}</button><button type="button" class="${spec.danger ? 'v2-btn v2-btn--danger kt-btn kt-btn-destructive' : 'v2-btn v2-btn--primary kt-btn kt-btn-primary'}" data-host-tool-submit disabled>${glyph ? ki(glyph) : ''}${e(spec.submit)}</button>` : ''
    const job = spec.jobLink ? `<a class="v2-btn kt-btn kt-btn-outline" href="/whm/jobs" data-host-tool-job hidden>${ki('open')}${e(msgid('Open job'))}</a>` : ''
    return card({ id: `v2-host-tool-${id}`, title: t(spec.title), titleId: `v2-host-tool-${id}-heading`, bodyHtml: `<div class="v2-host-tools__form" role="group" aria-labelledby="v2-host-tool-${id}-heading" data-host-tool="${id}" data-host-tool-api="${escapeHtml(spec.api)}" data-host-tool-can-read="${canManage}" data-host-tool-can-manage="${canManage}" data-host-tool-spec="${escapeHtml(hostToolSpec(spec, t))}"><p class="v2-muted text-base text-secondary-foreground">${e(spec.lede)}</p>${facts}${table}${fields}<p role="status" data-state="unread" data-host-tool-status>${e(msgid('Not read'))}</p><code data-host-tool-reveal dir="ltr" hidden></code><div class="v2-host-tools__actions">${tools}${job}${link}${submit}</div>${spec.log ? `<pre data-host-tool-log dir="ltr" tabindex="0" hidden></pre>` : ''}</div>` })
  }).join('')
  return `<div class="v2-host-tools">${body}</div>`
}
