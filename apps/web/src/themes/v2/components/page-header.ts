import type { Translate } from '../../../i18n.ts'
import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'
import { statusPill, type StatusPillProps } from './status-pill.ts'

export interface Crumb {
  label: string
  /** Omitted on the current page, which is marked aria-current="page". */
  href?: string
}

export interface PageHeaderProps {
  breadcrumb: readonly Crumb[]
  /** The page route, shown as code beside the breadcrumb. */
  route?: string
  title: string
  titleId?: string
  description?: string
  /** The page state pill beside the title, such as "Unsaved changes" or "3 active". */
  status?: StatusPillProps
  /** The applied-generation stamp at the head of the actions, such as "Applied · generation 142" over its UTC time. */
  stamp?: StatusPillProps & { meta?: string }
  /** Buttons or links built with the kit: secondary first, then the one primary action. */
  actionsHtml?: string
  hooks?: HookAttributes
}

const crumb = (item: Crumb, last: boolean): string =>
  `<li class="kt-breadcrumb-item">${last ? `<span class="kt-breadcrumb-page" aria-current="page">${escapeHtml(item.label)}</span>`
    : `${item.href ? `<a class="kt-breadcrumb-link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>` : `<span>${escapeHtml(item.label)}</span>`}${icon('chevRight', 14)}`}</li>`

export function pageHeader(t: Translate, props: PageHeaderProps): string {
  const stamp = props.stamp
    ? `<div class="v2-page-head__status">${statusPill(props.stamp)}${props.stamp.meta ? `<span class="v2-num v2-muted">${escapeHtml(props.stamp.meta)}</span>` : ''}</div>`
    : ''
  const aside = stamp || props.actionsHtml ? `<div class="v2-page-head__actions">${stamp}${props.actionsHtml ?? ''}</div>` : ''
  const title = `<h1${attr('id', props.titleId)}>${escapeHtml(props.title)}</h1>`
  return `<header class="v2-page-head"${attr('data-route', props.route)}${hookAttrs(props.hooks)}>
<nav class="v2-crumbs" aria-label="${escapeHtml(t('Breadcrumb'))}"><ol class="kt-breadcrumb">${props.breadcrumb.map((item, index) => crumb(item, index === props.breadcrumb.length - 1)).join('')}</ol></nav>
<div class="v2-page-head__row"><div class="v2-page-head__text">${props.status ? `<div class="v2-page-head__title">${title}${statusPill(props.status)}</div>` : title}${props.description ? `<p>${escapeHtml(props.description)}</p>` : ''}</div>${aside}</div>
</header>`
}

// The Metronic page toolbar: the title (text-xl, medium) over its secondary description, the actions 10px apart
// at the end. The trail is a kt-breadcrumb; the ol rule keeps a trail written without that class in line.
export const PAGE_HEADER_CSS = `.v2-page-head{display:flex;flex-direction:column;gap:.5rem}
.v2-crumbs ol{list-style:none;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:.375rem;font-size:.875rem;color:var(--muted)}
.v2-crumbs li{display:inline-flex;align-items:center;gap:.375rem}
.v2-crumbs a{color:var(--text-2);font-weight:400}
.v2-crumbs a:hover{color:var(--accent)}
.v2-crumbs [aria-current="page"]{color:var(--mono,var(--text))}
.v2-page-head__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem 1.25rem}
.v2-page-head__text{display:flex;flex-direction:column;gap:.5rem;min-width:0;max-width:84ch}
.v2-page-head__title{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .625rem}
.v2-page-head__text p{font-size:.875rem;line-height:1.5;color:var(--text-2)}
.v2-page-head__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-page-head__status{display:flex;flex-direction:column;align-items:flex-end;gap:.125rem;font-size:.75rem}
`
