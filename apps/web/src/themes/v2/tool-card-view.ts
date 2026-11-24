import type { ToolBlock, ToolCard, ToolField, ToolHooks } from '../../models/tool-cards.ts'
import { card } from './components/card.ts'
import { escapeHtml, hookAttrs } from './html.ts'
import { icon } from './icons.ts'

/** The V2 skin of the shared runtime, developer and panel-data cards; every control waits for its controller.
 *  Controls, buttons, alerts and tables are Metronic (kt-input, kt-btn, kt-alert, kt-table); these rules keep the
 *  standard rhythm (24px between the blocks, 16px between fields, labels 8px above their values), the fact tiles
 *  and the dark output block. */
export const TOOL_CARD_CSS = `.v2-tool-card__stack{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-tool-card__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--space-2);min-inline-size:0}
.v2-tool-card__fields:has(>.v2-field:only-child:not(:has(textarea))):not(.v2-tool-card__fields--rows){max-inline-size:480px}
.v2-tool-card__fields--rows{display:flex;flex-direction:column}
.v2-tool-card__facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:var(--space-2);min-inline-size:0}
.v2-tool-card__facts>div{display:flex;flex-direction:column;gap:var(--space-1);padding:.75rem 1rem;border-radius:var(--radius-notice);border:1px solid var(--line);background:color-mix(in oklab,var(--kt-muted) 40%,transparent);min-inline-size:0}
.v2-tool-card__facts dt{font-size:.875rem;line-height:var(--lh-label);color:var(--text-2)}
.v2-tool-card__facts dd{font-weight:500;color:var(--mono,var(--text));overflow-wrap:anywhere}
.v2-tool-card__output{padding:1rem;max-block-size:320px;overflow:auto;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.75rem/1.65 var(--font-mono);white-space:pre-wrap;overflow-wrap:anywhere}
.v2-tool-card__stack [data-state=unread]{font-size:.875rem;color:var(--text-2)}
.v2-tool-card__stack ul{padding-inline-start:1.25rem;list-style:disc}
`

type Translate = (message: string) => string
const hooks = (value: ToolHooks): string => hookAttrs(value)
const field = (t: Translate, item: ToolField): string => {
  const id = escapeHtml(item.id), label = escapeHtml(t(item.label))
  if (item.kind === 'check') return `<label class="v2-tool-card__check flex items-center gap-2 min-h-11 text-sm cursor-pointer"><input id="${id}" type="checkbox" class="kt-checkbox kt-checkbox-sm"${hooks(item.hooks)} disabled><span>${label}</span></label>`
  const help = 'help' in item && item.help ? `<p id="${id}-help" class="v2-field__help kt-form-description">${escapeHtml(t(item.help))}</p>` : ''
  const described = 'help' in item && item.help ? ` aria-describedby="${id}-help"` : ''
  const ltr = 'ltr' in item && item.ltr ? ' dir="ltr"' : ''
  const control = item.kind === 'select' ? `<select id="${id}" class="kt-select max-[959px]:text-base"${hooks(item.hooks)}${described} disabled>${item.options.map(([value, text]) => `<option value="${escapeHtml(value)}">${escapeHtml(t(text))}</option>`).join('')}</select>`
    : item.kind === 'area' ? `<textarea id="${id}" class="kt-textarea max-[959px]:text-base" rows="${item.rows ?? 3}"${ltr}${hooks(item.hooks)}${described} spellcheck="false" disabled></textarea>`
      : item.kind === 'file' ? `<input id="${id}" type="file" class="kt-input"${item.accept ? ` accept="${escapeHtml(item.accept)}"` : ''}${hooks(item.hooks)} disabled>`
        : `<input id="${id}" class="kt-input max-[959px]:text-base" type="${escapeHtml(item.type ?? 'text')}"${ltr}${item.placeholder ? ` placeholder="${escapeHtml(item.placeholder)}"` : ''} autocomplete="${escapeHtml(item.autocomplete ?? 'off')}"${hooks(item.hooks)}${described} disabled>`
  return `<div class="v2-field kt-form-item"><label for="${id}" class="kt-form-label">${label}</label>${control}${help}</div>`
}
type ToolButton = Extract<ToolBlock, { kind: 'actions' }>['buttons'][number]
// Leading Keenicons for the server-rendered buttons, keyed by the untranslated label (no client template is involved).
const BUTTON_ICONS: Readonly<Record<string, string>> = {
  'Save': icon('check', 16), 'Save project': icon('check', 16), 'Apply import': icon('check', 16),
  'Refresh': icon('refresh', 16), 'Read functions': icon('refresh', 16), 'Read log': icon('files', 16), 'Update': icon('refresh', 16), 'Reinstall': icon('refresh', 16),
  'Export configuration': icon('download', 16), 'Download': icon('download', 16), 'Download OpenAPI': icon('download', 16),
  'Upload': icon('upload', 16), 'Import plugin': icon('upload', 16),
  'Preview import': '<i class="ki-filled ki-eye text-base leading-none" aria-hidden="true"></i>',
  'Restore': '<i class="ki-filled ki-arrow-circle-left text-base leading-none v2-flip" aria-hidden="true"></i>',
  'Create snapshot': icon('plus', 16), 'Create environment': icon('plus', 16), 'Install': icon('plus', 16),
  'Delete': icon('trash', 16), 'Remove': icon('trash', 16), 'Uninstall': icon('trash', 16), 'Remove environment': icon('trash', 16),
  'Run call': '<i class="ki-filled ki-rocket text-base leading-none" aria-hidden="true"></i>', 'Send test event': '<i class="ki-filled ki-rocket text-base leading-none" aria-hidden="true"></i>',
  'Search': icon('search', 16), 'Package documentation': '<i class="ki-filled ki-book-open text-base leading-none" aria-hidden="true"></i>',
}
const actions = (t: Translate, buttons: readonly ToolButton[], cls: string): string => `<div class="${cls}">${buttons.map(button => `<button type="button" class="v2-btn${button.primary ? ' v2-btn--primary' : ''}${button.danger ? ' v2-btn--danger' : ''} ${button.danger ? 'kt-btn kt-btn-outline kt-btn-destructive' : button.primary ? 'kt-btn kt-btn-primary' : 'kt-btn kt-btn-outline'}"${hooks(button.hooks)} disabled>${BUTTON_ICONS[button.label] ?? ''}${escapeHtml(t(button.label))}</button>`).join('')}</div>`
const block = (t: Translate, cardId: string, item: ToolBlock, index: number): string => {
  switch (item.kind) {
    case 'note': return `<p class="v2-muted text-sm text-secondary-foreground">${escapeHtml(t(item.text))}</p>`
    case 'warning': return `<p class="v2-tool-card__warning kt-alert kt-alert-light kt-alert-destructive" role="note">${escapeHtml(t(item.text))}</p>`
    case 'facts': return `<dl class="v2-tool-card__facts">${item.rows.map(row => `<div><dt>${escapeHtml(t(row.label))}</dt><dd${hooks(row.hooks)}${row.technical ? ' dir="ltr"' : ''}>${escapeHtml(t(msgid('Not read')))}</dd></div>`).join('')}</dl>`
    case 'fields': {
      // A package import (a file chooser and its options, in a full-width card) stacks its fields in one column, each
      // label above its control.
      const rows = item.fields.some(entry => entry.kind === 'file') && item.fields.some(entry => entry.kind === 'check') && item.fields.every(entry => entry.kind === 'file' || entry.kind === 'check')
      return `<div class="${rows ? 'v2-tool-card__fields v2-tool-card__fields--rows' : 'v2-tool-card__fields'}">${item.fields.map(entry => field(t, entry)).join('')}</div>`
    }
    case 'table': { const caption = `v2-${cardId}-table-${index}`; return `<div class="v2-tool-card__table kt-scrollable-x-auto min-w-0 rounded-lg border border-border" role="region" tabindex="0" aria-labelledby="${caption}"><table class="kt-table"><caption id="${caption}" class="v2-sr">${escapeHtml(t(item.label))}</caption><thead><tr>${item.columns.map(name => `<th scope="col">${escapeHtml(t(name))}</th>`).join('')}</tr></thead><tbody${hooks(item.hooks)}><tr><td colspan="${item.columns.length}">${escapeHtml(t(item.empty))}</td></tr></tbody></table></div>` }
    case 'actions': return actions(t, item.buttons, 'v2-tool-card__actions flex flex-wrap items-center gap-2.5')
    case 'status': return `<p role="status" data-state="unread"${hooks(item.hooks)}>${escapeHtml(t(item.text))}</p>`
    case 'output': return `<pre class="v2-tool-card__output" role="region" tabindex="0" dir="ltr" aria-label="${escapeHtml(t(item.label))}"${hooks(item.hooks)}${item.hidden ? ' hidden' : ''}></pre>`
    case 'tree': return `<div${hooks(item.hooks)} dir="ltr"></div>`
  }
}
export function renderV2ToolCard(t: Translate, spec: ToolCard, canManage: boolean): string {
  // A single closing button row (only status lines after it) is the Metronic card footer with its actions at the end.
  const at = spec.blocks.findIndex(item => item.kind === 'actions')
  const closing = at >= 0 && spec.blocks.filter(item => item.kind === 'actions').length === 1 && spec.blocks.slice(at + 1).every(item => item.kind === 'status')
  const footer = closing ? spec.blocks[at] as Extract<ToolBlock, { kind: 'actions' }> : undefined
  const body = spec.blocks.map((item, index) => item === footer ? '' : block(t, spec.id, item, index)).join('')
  return card({ id: 'v2-' + spec.id, title: t(spec.title), titleId: `v2-${spec.id}-heading`, hooks: { ...spec.root, 'data-tool-can-manage': String(canManage) }, bodyHtml: `<div class="v2-tool-card__stack">${body}</div>`, ...(footer ? { footerHtml: actions(t, footer.buttons, 'v2-tool-card__actions flex flex-wrap items-center justify-end gap-2.5 w-full') } : {}) })
}
