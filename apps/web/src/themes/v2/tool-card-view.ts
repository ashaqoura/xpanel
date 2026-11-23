import type { ToolBlock, ToolCard, ToolField, ToolHooks } from '../../models/tool-cards.ts'
import { card } from './components/card.ts'
import { escapeHtml, hookAttrs } from './html.ts'

/** The V2 skin of the shared runtime, developer and panel-data cards; every control waits for its controller.
 *  Controls, buttons, alerts and tables are Metronic (kt-input, kt-btn, kt-alert, kt-table); these rules keep the
 *  20px rhythm between the blocks, the fact tiles and the dark output block. */
export const TOOL_CARD_CSS = `.v2-tool-card__stack{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-tool-card__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1.25rem;min-inline-size:0}
.v2-tool-card__fields:has(>.v2-field:only-child:not(:has(textarea))){max-inline-size:480px}
.v2-tool-card__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:.625rem;min-inline-size:0}
.v2-tool-card__facts>div{display:flex;flex-direction:column;gap:.25rem;padding:.75rem 1rem;border-radius:var(--radius-notice);border:1px solid var(--line);background:color-mix(in oklab,var(--kt-muted) 40%,transparent);min-inline-size:0}
.v2-tool-card__facts dt{font-size:.75rem;color:var(--text-2)}
.v2-tool-card__facts dd{font-size:.875rem;font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere}
.v2-tool-card__output{padding:1rem;max-block-size:320px;overflow:auto;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.75rem/1.65 var(--font-mono);white-space:pre-wrap;overflow-wrap:anywhere}
.v2-tool-card__stack [data-state=unread]{font-size:.875rem;color:var(--text-2)}
.v2-tool-card__stack ul{padding-inline-start:1.25rem;list-style:disc}
`

type Translate = (message: string) => string
const hooks = (value: ToolHooks): string => hookAttrs(value)
const field = (t: Translate, item: ToolField): string => {
  const id = escapeHtml(item.id), label = escapeHtml(t(item.label))
  if (item.kind === 'check') return `<label class="v2-tool-card__check flex items-center gap-2 min-h-8.5 text-sm cursor-pointer"><input id="${id}" type="checkbox" class="kt-checkbox kt-checkbox-sm"${hooks(item.hooks)} disabled><span>${label}</span></label>`
  const help = 'help' in item && item.help ? `<p id="${id}-help" class="v2-field__help kt-form-description">${escapeHtml(t(item.help))}</p>` : ''
  const described = 'help' in item && item.help ? ` aria-describedby="${id}-help"` : ''
  const ltr = 'ltr' in item && item.ltr ? ' dir="ltr"' : ''
  const control = item.kind === 'select' ? `<select id="${id}" class="kt-select max-[959px]:text-base"${hooks(item.hooks)}${described} disabled>${item.options.map(([value, text]) => `<option value="${escapeHtml(value)}">${escapeHtml(t(text))}</option>`).join('')}</select>`
    : item.kind === 'area' ? `<textarea id="${id}" class="kt-textarea max-[959px]:text-base" rows="${item.rows ?? 3}"${ltr}${hooks(item.hooks)}${described} spellcheck="false" disabled></textarea>`
      : item.kind === 'file' ? `<input id="${id}" type="file" class="kt-input"${item.accept ? ` accept="${escapeHtml(item.accept)}"` : ''}${hooks(item.hooks)} disabled>`
        : `<input id="${id}" class="kt-input max-[959px]:text-base" type="${escapeHtml(item.type ?? 'text')}"${ltr}${item.placeholder ? ` placeholder="${escapeHtml(item.placeholder)}"` : ''} autocomplete="${escapeHtml(item.autocomplete ?? 'off')}"${hooks(item.hooks)}${described} disabled>`
  return `<div class="v2-field kt-form-item"><label for="${id}" class="kt-form-label leading-tight">${label}</label>${control}${help}</div>`
}
const block = (t: Translate, cardId: string, item: ToolBlock, index: number): string => {
  switch (item.kind) {
    case 'note': return `<p class="v2-muted text-sm text-secondary-foreground">${escapeHtml(t(item.text))}</p>`
    case 'warning': return `<p class="v2-tool-card__warning kt-alert kt-alert-light kt-alert-destructive" role="note">${escapeHtml(t(item.text))}</p>`
    case 'facts': return `<dl class="v2-tool-card__facts">${item.rows.map(row => `<div><dt>${escapeHtml(t(row.label))}</dt><dd${hooks(row.hooks)}${row.technical ? ' dir="ltr"' : ''}>${escapeHtml(t(msgid('Not read')))}</dd></div>`).join('')}</dl>`
    case 'fields': return `<div class="v2-tool-card__fields">${item.fields.map(entry => field(t, entry)).join('')}</div>`
    case 'table': { const caption = `v2-${cardId}-table-${index}`; return `<div class="v2-tool-card__table kt-scrollable-x-auto min-w-0 rounded-lg border border-border" role="region" tabindex="0" aria-labelledby="${caption}"><table class="kt-table"><caption id="${caption}" class="v2-sr">${escapeHtml(t(item.label))}</caption><thead><tr>${item.columns.map(name => `<th scope="col">${escapeHtml(t(name))}</th>`).join('')}</tr></thead><tbody${hooks(item.hooks)}><tr><td colspan="${item.columns.length}">${escapeHtml(t(item.empty))}</td></tr></tbody></table></div>` }
    case 'actions': return `<div class="v2-tool-card__actions flex flex-wrap items-center gap-2.5">${item.buttons.map(button => `<button type="button" class="v2-btn${button.primary ? ' v2-btn--primary' : ''}${button.danger ? ' v2-btn--danger' : ''} ${button.danger ? 'kt-btn kt-btn-destructive' : button.primary ? 'kt-btn kt-btn-primary' : 'kt-btn kt-btn-outline'}"${hooks(button.hooks)} disabled>${escapeHtml(t(button.label))}</button>`).join('')}</div>`
    case 'status': return `<p role="status" data-state="unread"${hooks(item.hooks)}>${escapeHtml(t(item.text))}</p>`
    case 'output': return `<pre class="v2-tool-card__output" role="region" tabindex="0" dir="ltr" aria-label="${escapeHtml(t(item.label))}"${hooks(item.hooks)}${item.hidden ? ' hidden' : ''}></pre>`
    case 'tree': return `<div${hooks(item.hooks)} dir="ltr"></div>`
  }
}
export function renderV2ToolCard(t: Translate, spec: ToolCard, canManage: boolean): string {
  return card({ id: 'v2-' + spec.id, title: t(spec.title), titleId: `v2-${spec.id}-heading`, hooks: { ...spec.root, 'data-tool-can-manage': String(canManage) }, bodyHtml: `<div class="v2-tool-card__stack">${spec.blocks.map((item, index) => block(t, spec.id, item, index)).join('')}</div>` })
}
