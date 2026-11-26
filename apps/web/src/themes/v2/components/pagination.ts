import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

export interface PageLink {
  /** A link navigates; without href the control is a button bound through hooks. Omit both when unavailable. */
  href?: string
  hooks?: HookAttributes
  disabled?: boolean
}

export interface PaginationProps {
  /** Range summary, such as "1-25 of 44". */
  summary: string
  pageSize?: { id: string; name?: string; options: readonly number[]; selected: number; hooks?: HookAttributes }
  previous: PageLink
  next: PageLink
  hooks?: HookAttributes
}

// Metronic datatable footer controls: small ghost icon buttons (28px), as the kt-datatable pagination.
const PAGE_BUTTON = 'v2-btn v2-btn--icon kt-btn kt-btn-sm kt-btn-icon kt-btn-ghost'

const control = (link: PageLink, label: string, iconName: 'chevLeft' | 'chevRight'): string => {
  const content = icon(iconName, 14)
  if (link.disabled || (!link.href && !link.hooks)) return `<button type="button" class="${PAGE_BUTTON}" aria-label="${escapeHtml(label)}" disabled>${content}</button>`
  return link.href
    ? `<a class="${PAGE_BUTTON}" href="${escapeHtml(link.href)}" aria-label="${escapeHtml(label)}"${hookAttrs(link.hooks)}>${content}</a>`
    : `<button type="button" class="${PAGE_BUTTON}" aria-label="${escapeHtml(label)}"${hookAttrs(link.hooks)}>${content}</button>`
}

export function pagination(t: Translate, props: PaginationProps): string {
  const size = props.pageSize
    ? `<span class="flex items-center gap-2"><label for="${escapeHtml(props.pageSize.id)}">${escapeHtml(t(msgctxt('theme:v2', 'Rows')))}</label><span class="v2-select"><select id="${escapeHtml(props.pageSize.id)}"${props.pageSize.name ? ` name="${escapeHtml(props.pageSize.name)}"` : ''}${hookAttrs(props.pageSize.hooks)} class="kt-select w-16 max-[959px]:text-base">${props.pageSize.options.map(option => `<option value="${option}"${option === props.pageSize!.selected ? ' selected' : ''}>${option}</option>`).join('')}</select></span></span>` : ''
  // The Metronic datatable footer: the range on one side, rows per page and the page controls on the other.
  return `<nav class="v2-pagination kt-card-footer flex-wrap justify-between gap-2.5 text-sm font-medium text-secondary-foreground" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'Pagination')))}"${hookAttrs(props.hooks)}><span class="v2-num">${escapeHtml(props.summary)}</span><span class="v2-pagination__controls flex flex-wrap items-center gap-4">${size}<span class="kt-pagination">${control(props.previous, t('Previous page'), 'chevLeft')}${control(props.next, t('Next page'), 'chevRight')}</span></span></nav>`
}

