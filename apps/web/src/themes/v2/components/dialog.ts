import type { Translate } from '../../../i18n.ts'
import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

export interface DialogProps {
  id: string
  title: string
  bodyHtml: string
  footerHtml?: string
  /** role="alertdialog" for confirmations of destructive actions (type to confirm, terminate). */
  alert?: boolean
  /** Id of the body element that describes the dialog (required reading for an alertdialog). */
  describedBy?: string
  close?: HookAttributes
  /** Dialogs render hidden; the overlay controller shows them. */
  open?: boolean
  hooks?: HookAttributes
}

// The Metronic modal: kt-modal-content with a kt-modal-header (title and a small ghost close), kt-modal-body and
// kt-modal-footer, each 20px by 16px. The overlay is written with utilities: the kt-modal root needs its script.
const CLOSE = 'v2-btn v2-btn--icon v2-btn--bare kt-btn kt-btn-sm kt-btn-icon kt-btn-ghost shrink-0 -me-2'

export function dialog(t: Translate, props: DialogProps): string {
  const titleId = `${props.id}-title`
  return `<div class="v2-dialog fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-(--scrim) backdrop-blur-xs px-4 pb-4 pt-[max(1.5rem,10vh)]" id="${escapeHtml(props.id)}" role="${props.alert ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}"${attr('aria-describedby', props.describedBy)}${props.open ? '' : ' hidden'}${hookAttrs(props.hooks)}>
<div class="v2-dialog__panel kt-modal-content w-full max-w-[560px]">
<header class="v2-dialog__head kt-modal-header"><h2 id="${escapeHtml(titleId)}" class="kt-modal-title">${escapeHtml(props.title)}</h2>${props.close ? `<button type="button" class="${CLOSE}" aria-label="${escapeHtml(t('Close'))}"${hookAttrs(props.close)}>${icon('x', 14)}</button>` : ''}</header>
<div class="v2-dialog__body kt-modal-body flex flex-col gap-5 min-w-0">${props.bodyHtml}</div>
${props.footerHtml ? `<footer class="v2-dialog__foot kt-modal-footer flex-wrap justify-end gap-2.5">${props.footerHtml}</footer>` : ''}
</div>
</div>`
}

