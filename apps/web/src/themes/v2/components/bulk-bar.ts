import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'

export interface BulkBarProps {
  /** Selection summary, such as "2 selected". */
  countLabel: string
  actions: readonly { label: string; tone?: 'warn' | 'bad'; href?: string; hooks?: HookAttributes }[]
  /** Hooks of the controller that clears the selection; without them no Clear button is shown. */
  clear?: HookAttributes
  /** Hidden until rows are selected; the selection controller toggles `hidden`. */
  hidden?: boolean
  hooks?: HookAttributes
}

// The Metronic selection toolbar: a primary-tinted band with the count at the start and small outline actions at
// the end; a risky action is the soft destructive button.
export function bulkBar(t: Translate, props: BulkBarProps): string {
  const actions = props.actions.map(action => {
    const cls = action.tone === 'bad' ? 'v2-btn v2-bulk__bad kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive'
      : action.tone === 'warn' ? 'v2-btn v2-bulk__warn kt-btn kt-btn-sm kt-btn-outline border-yellow-200 text-yellow-700 dark:border-yellow-950 dark:text-yellow-600'
      : 'v2-btn kt-btn kt-btn-sm kt-btn-outline'
    return action.href
      ? `<a class="${cls}" href="${escapeHtml(action.href)}"${hookAttrs(action.hooks)}>${escapeHtml(action.label)}</a>`
      : `<button type="button" class="${cls}"${hookAttrs(action.hooks)}>${escapeHtml(action.label)}</button>`
  }).join('')
  const clear = props.clear ? `<button type="button" class="v2-btn v2-btn--ghost kt-btn kt-btn-sm kt-btn-ghost"${hookAttrs(props.clear)}>${escapeHtml(t('Clear'))}</button>` : ''
  return `<div class="v2-bulk flex flex-wrap items-center justify-between gap-2.5 px-5 py-2.5 border-y border-primary/10 bg-primary/5" role="region" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Bulk actions')))}"${props.hidden ? ' hidden' : ''}${hookAttrs(props.hooks)}><span class="v2-bulk__count v2-num text-sm font-medium text-primary" role="status">${escapeHtml(props.countLabel)}</span><span class="v2-bulk__actions flex flex-wrap items-center gap-2.5 ms-auto">${actions}${clear}</span></div>`
}

