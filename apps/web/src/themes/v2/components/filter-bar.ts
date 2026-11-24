import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

export interface FilterSelect {
  id: string
  label: string
  name?: string
  options: readonly { value: string; label: string; selected?: boolean }[]
  hooks?: HookAttributes
}

export interface FilterBarProps {
  search?: { id: string; label: string; placeholder?: string; name?: string; value?: string; hooks?: HookAttributes }
  /** Applied filters; each removes itself. `removeLabel` names the action, such as "Remove filter Owner: reseller1". */
  chips?: readonly { label: string; removeLabel: string; hooks?: HookAttributes }[]
  selects?: readonly FilterSelect[]
  /** Segmented quick filters with optional counts; in a bar of fields the label also shows above the group. */
  segments?: { label: string; options: readonly { label: string; count?: number; pressed: boolean; hooks?: HookAttributes }[] }
  clear?: { label: string; hooks?: HookAttributes }
  /** Trailing actions built with the kit, such as "Columns" or "Export CSV". */
  actionsHtml?: string
  /** The bar's own controls are disabled, such as while the list has not been read; `actionsHtml` is the caller's. */
  disabled?: boolean
  hooks?: HookAttributes
}

/// A bar with a search or a select is a row of labelled fields: each kt-form-label sits above its control, as on
// the boards. A bar of segments alone (quick filters in a card header) names its group with aria-label.
const field = (cls: string, labelHtml: string, controlHtml: string): string => `<div class="v2-filter__field ${cls}">${labelHtml}${controlHtml}</div>`

// kt-select draws its own arrow, so the wrapper holds the select alone.
const select = (item: FilterSelect, off: string): string =>
  field('v2-filter__select', `<label class="v2-filter__label kt-form-label" for="${escapeHtml(item.id)}">${escapeHtml(item.label)}</label>`, `<span class="v2-select"><select id="${escapeHtml(item.id)}"${attr('name', item.name)}${hookAttrs(item.hooks)}${off} class="kt-select max-[959px]:text-base">${item.options.map(option => `<option value="${escapeHtml(option.value)}"${option.selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></span>`)

// The Metronic segmented control is a kt-toggle-group of outline buttons; core toggles aria-pressed, never a class.
const SEGMENT = 'kt-btn kt-btn-outline aria-pressed:bg-accent aria-pressed:text-accent-foreground'

export function filterBar(props: FilterBarProps): string {
  const off = props.disabled ? ' disabled' : ''
  const fields = Boolean(props.search || props.selects?.length)
  // The Metronic search input: the magnifier inside the kt-input wrapper, before the borderless input.
  const search = props.search
    ? field('v2-filter__search', `<label class="v2-filter__label kt-form-label" for="${escapeHtml(props.search.id)}">${escapeHtml(props.search.label)}</label>`, `<span class="v2-filter__input kt-input max-[959px]:text-base"><input id="${escapeHtml(props.search.id)}" type="search" autocomplete="off" spellcheck="false"${attr('name', props.search.name)}${attr('placeholder', props.search.placeholder)}${attr('value', props.search.value)}${hookAttrs(props.search.hooks)}${off}>${icon('search', 16)}</span>`) : ''
  const chips = (props.chips ?? []).map(chip => `<button type="button" class="v2-chip v2-chip--applied kt-btn kt-btn-outline kt-btn-primary rounded-full" aria-label="${escapeHtml(chip.removeLabel)}"${hookAttrs(chip.hooks)}${off}>${escapeHtml(chip.label)}${icon('x', 12)}</button>`).join('')
  const segmentButtons = props.segments?.options.map(option => `<button type="button" class="${SEGMENT}" aria-pressed="${option.pressed}"${hookAttrs(option.hooks)}${off}>${escapeHtml(option.label)}${option.count === undefined ? '' : `<span class="v2-count v2-num kt-badge kt-badge-sm kt-badge-outline rounded-[30px]">${option.count}</span>`}</button>`).join('') ?? ''
  const segments = !props.segments ? ''
    : `<div class="v2-segmented kt-toggle-group" role="group" aria-label="${escapeHtml(props.segments.label)}">${segmentButtons}</div>`
  const group = fields && segments ? field('v2-filter__group', `<span class="v2-filter__label kt-form-label" aria-hidden="true">${escapeHtml(props.segments!.label)}</span>`, segments) : segments
  const clear = props.clear ? `<button type="button" class="v2-btn v2-btn--ghost v2-filter__clear kt-btn kt-btn-ghost"${hookAttrs(props.clear.hooks)}${off}>${icon('x', 14)}${escapeHtml(props.clear.label)}</button>` : ''
  return `<div class="v2-filter${fields ? ' v2-filter--fields' : ''}"${off ? ' aria-disabled="true"' : ''}${hookAttrs(props.hooks)}>${search}${(props.selects ?? []).map(item => select(item, off)).join('')}${group}${chips}${clear}${props.actionsHtml ? `<div class="v2-filter__actions">${props.actionsHtml}</div>` : ''}</div>`
}

// The bar itself stays a v2 rule so a page can drop its padding; the controls are Metronic (kt-input, kt-select,
// kt-btn). A segmented group or a count written with the v2 classes alone keeps the toggle-group and badge look.
const SEG = '.v2-segmented>button:not(.kt-btn)'
export const FILTER_BAR_CSS = `.v2-filter{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem;padding:.75rem var(--v2-panel-padding)}
.v2-card__actions>.v2-filter{padding:0}
.v2-filter--fields{align-items:flex-end}
.v2-filter__field{display:flex;flex-direction:column;gap:var(--space-1);min-width:0}
.v2-filter__label{padding-inline:calc(.75rem + 1px);text-box:trim-end text}
.v2-filter__search{flex:1 1 200px;max-inline-size:22.5rem}
.v2-filter__select{flex:0 1 180px}
.v2-filter__group{flex:0 1 auto}
.v2-filter__actions{display:flex;flex-wrap:wrap;gap:.625rem;margin-inline-start:auto}
.v2-segmented{display:inline-flex;flex-wrap:wrap}
${SEG}{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;height:var(--target);margin-inline-start:-1px;padding:0 .75rem;border:1px solid var(--line);background:transparent;color:var(--kt-accent-foreground);font-size:.8125rem;font-weight:500;cursor:pointer}
${SEG}:first-child{margin-inline-start:0;border-start-start-radius:var(--radius-control);border-end-start-radius:var(--radius-control)}
${SEG}:last-child{border-start-end-radius:var(--radius-control);border-end-end-radius:var(--radius-control)}
${SEG}:is(:hover:not(:disabled),[aria-pressed="true"]){background:var(--kt-accent)}
.v2-segmented>button:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:600px){.v2-segmented{flex-wrap:nowrap;max-inline-size:100%;overflow-x:auto;scrollbar-width:none}.v2-segmented>button{flex:none}}
.v2-count{display:inline-flex;align-items:center;justify-content:center;height:1.25rem;min-inline-size:1.25rem;padding:0 .325rem;border-radius:30px;border:1px solid var(--line);background:var(--sunken);color:var(--text-2);font-size:.8125rem;font-weight:500;line-height:.75rem}
`
