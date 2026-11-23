import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

interface ControlBase {
  name?: string
  required?: boolean
  disabled?: boolean
  /** Technical values (domains, paths, keys) in the monospace face. */
  mono?: boolean
  dir?: 'ltr' | 'rtl' | 'auto'
  hooks?: HookAttributes
}

interface TextControl {
  minlength?: number
  maxlength?: number
  spellcheck?: boolean
}

export type FieldControl =
  | (ControlBase & TextControl & { kind: 'input'; type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'search' | 'tel' | 'date' | 'datetime-local' | 'time'; value?: string; placeholder?: string; autocomplete?: string; inputmode?: string; unit?: string; min?: string | number; max?: string | number; step?: number | 'any'; readonly?: boolean })
  | (ControlBase & { kind: 'select'; options: readonly { value: string; label: string; selected?: boolean }[] })
  | (ControlBase & TextControl & { kind: 'textarea'; value?: string; rows?: number; placeholder?: string; readonly?: boolean; autocomplete?: string })

const textConstraints = (control: TextControl): string =>
  `${attr('minlength', control.minlength)}${attr('maxlength', control.maxlength)}${attr('spellcheck', control.spellcheck === undefined ? undefined : String(control.spellcheck))}`

export interface FormFieldProps {
  id: string
  label: string
  help?: string
  /** The draft differs from its saved value; core supplies the translated annotation. */
  change?: string
  /** Validation message; marks the control aria-invalid and is read with it. */
  error?: string
  control: FieldControl
  /** `row` is the Metronic settings row: from the large breakpoint the label (up to 14rem) sits at the start and
   *  the control, its hint and its error grow beside it; narrower, and by default, the label sits above. */
  layout?: 'stacked' | 'row'
  hooks?: HookAttributes
}

const FIELD = 'v2-field kt-form-item'
// One grid of two columns: the label keeps the first, every other child (control, error, hint, change) the second.
const FIELD_ROW = 'v2-field v2-field--row kt-form-item lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-baseline lg:[&>:not(label)]:col-start-2'

export function formField(props: FormFieldProps): string {
  const { id, control } = props
  const helpId = props.help ? `${id}-help` : undefined
  const errorId = props.error ? `${id}-error` : undefined
  const changeId = props.change ? `${id}-change` : undefined
  const described = [errorId, helpId, changeId].filter(Boolean).join(' ')
  // The Metronic control class sits beside v2-mono; phones keep 16px text so focusing a control does not zoom the page.
  const common = (kt: string): string => `id="${escapeHtml(id)}"${attr('name', control.name)}${control.required ? ' required' : ''}${control.disabled ? ' disabled' : ''} class="${control.mono ? 'v2-mono ' : ''}${kt}"${attr('dir', control.dir)}${attr('aria-describedby', described)}${props.error ? ' aria-invalid="true"' : ''}${hookAttrs(control.hooks)}`
  let field: string
  if (control.kind === 'select') {
    // kt-select draws its own arrow. A left-to-right select inside a right-to-left page keeps it clear of the value.
    field = `<span class="v2-select"><select ${common(control.dir === 'ltr' ? 'kt-select max-[959px]:text-base rtl:ps-6 rtl:pe-3' : 'kt-select max-[959px]:text-base')}>${control.options.map(option => `<option value="${escapeHtml(option.value)}"${option.selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></span>`
  } else if (control.kind === 'textarea') {
    field = `<textarea ${common('kt-textarea max-[959px]:text-base')}${attr('rows', control.rows)}${attr('placeholder', control.placeholder)}${attr('autocomplete', control.autocomplete)}${textConstraints(control)}${control.readonly ? ' readonly' : ''}>${escapeHtml(control.value ?? '')}</textarea>`
  } else {
    const input = `<input ${common('kt-input max-[959px]:text-base')} type="${control.type ?? 'text'}"${attr('value', control.value)}${attr('placeholder', control.placeholder)}${attr('autocomplete', control.autocomplete)}${attr('inputmode', control.inputmode)}${attr('min', control.min)}${attr('max', control.max)}${attr('step', control.step)}${textConstraints(control)}${control.readonly ? ' readonly' : ''}>`
    field = control.unit ? `<span class="v2-field__unit kt-input-group">${input}<span class="kt-input-addon">${escapeHtml(control.unit)}</span></span>` : input
  }
  const row = props.layout === 'row'
  return `<div class="${row ? FIELD_ROW : FIELD}"${hookAttrs(props.hooks)}><label for="${escapeHtml(id)}" class="${row ? 'kt-form-label leading-tight max-w-56' : 'kt-form-label leading-tight'}">${escapeHtml(props.label)}</label>${field}${props.error ? `<span class="v2-field__error kt-form-message flex items-center gap-1.5" id="${escapeHtml(errorId!)}">${icon('alert', 14)}${escapeHtml(props.error)}</span>` : ''}${props.help ? `<span class="v2-field__help kt-form-description block" id="${escapeHtml(helpId!)}">${escapeHtml(props.help)}</span>` : ''}${props.change ? `<span class="v2-field__change text-xs font-medium text-primary" id="${escapeHtml(changeId!)}">${escapeHtml(props.change)}</span>` : ''}</div>`
}

export interface SwitchRowProps {
  id: string
  label: string
  help?: string
  change?: string
  name?: string
  checked?: boolean
  disabled?: boolean
  hooks?: HookAttributes
}

/** A Metronic notification row: the label and its description at the start, the switch (checkbox role="switch")
 *  at the end; the whole row is the label, so it toggles the switch. */
export const switchRow = (props: SwitchRowProps): string =>
  `<label class="v2-switch-row flex items-center justify-between gap-5 cursor-pointer" for="${escapeHtml(props.id)}"><span class="v2-switch-row__text flex flex-col gap-1"><span class="${props.change ? 'v2-switch-row__label flex flex-wrap items-center gap-2 text-sm font-medium text-mono' : 'text-sm font-medium text-mono'}">${escapeHtml(props.label)}${props.change ? `<span class="v2-switch-row__change kt-badge kt-badge-sm kt-badge-outline kt-badge-primary" id="${escapeHtml(props.id)}-change">${escapeHtml(props.change)}</span>` : ''}</span>${props.help ? `<span class="text-sm font-normal text-secondary-foreground" id="${escapeHtml(props.id)}-help">${escapeHtml(props.help)}</span>` : ''}</span><input type="checkbox" role="switch" id="${escapeHtml(props.id)}"${attr('name', props.name)}${props.checked ? ' checked' : ''}${props.disabled ? ' disabled' : ''}${props.help || props.change ? ` aria-describedby="${[props.help ? `${escapeHtml(props.id)}-help` : '', props.change ? `${escapeHtml(props.id)}-change` : ''].filter(Boolean).join(' ')}"` : ''} class="kt-switch"${hookAttrs(props.hooks)}></label>`

// A field written with the v2 classes alone (no kt-form-item, kt-form-label, kt-form-description) keeps the same look.
export const FORM_FIELD_CSS = `.v2-form{display:flex;flex-direction:column;gap:var(--space-3)}
.v2-field{display:flex;flex-direction:column;gap:.625rem;min-width:0}
.v2-field>label:not(:has(>input)),.v2-field>.v2-field__label{display:flex;align-items:center;gap:.5rem;font-size:.875rem;line-height:1.25;font-weight:500;color:var(--text)}
.v2-field :is(input,select,textarea):not([type=checkbox],[type=radio]){inline-size:100%}
.v2-field__help,.v2-field__error{margin-block-start:-.25rem;font-size:.75rem;line-height:1.4;font-weight:400;color:var(--text-2)}
.v2-field__error{display:inline-flex;align-items:center;gap:.375rem;color:var(--destructive)}
`
