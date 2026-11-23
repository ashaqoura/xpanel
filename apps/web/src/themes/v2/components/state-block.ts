import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon, type IconName } from '../icons.ts'

export interface EmptyStateProps {
  icon: IconName
  title: string
  text?: string
  /** The next step, built with the kit (usually the primary action). */
  actionHtml?: string
  headingLevel?: 2 | 3
  hooks?: HookAttributes
}

export const emptyState = (props: EmptyStateProps): string => {
  const h = `h${props.headingLevel ?? 3}`
  return `<div class="v2-state v2-state--empty"${hookAttrs(props.hooks)}><span class="v2-state__icon" aria-hidden="true">${icon(props.icon, 22)}</span><${h}>${escapeHtml(props.title)}</${h}>${props.text ? `<p>${escapeHtml(props.text)}</p>` : ''}${props.actionHtml ?? ''}</div>`
}

export interface LoadingStateProps {
  /** What is loading, read by assistive technology, such as "Loading databases". */
  label?: string
  rows?: number
  hooks?: HookAttributes
}

/** Skeleton rows in the final layout so nothing jumps; one visually hidden label announces the wait. */
export const loadingState = (t: Translate, props: LoadingStateProps): string =>
  `<div class="v2-state v2-state--loading" aria-busy="true"${hookAttrs(props.hooks)}><span class="v2-sr" role="status">${escapeHtml(props.label ?? t('Loading'))}</span>${Array.from({ length: props.rows ?? 3 }, (_, i) => `<div class="v2-skeleton-row" aria-hidden="true"><span class="v2-skeleton v2-skeleton--tile"></span><span class="v2-skeleton-lines"><span class="v2-skeleton" style="inline-size:${[56, 44, 64][i % 3]}%"></span><span class="v2-skeleton v2-skeleton--thin" style="inline-size:${[32, 24, 40][i % 3]}%"></span></span></div>`).join('')}</div>`

export interface ErrorStateProps {
  /** Cause and consequence, such as "Databases could not be read." */
  lead: string
  text?: string
  /** Technical detail, such as the agent error line. */
  detail?: string
  /** Hooks of the controller that retries; without them no Retry button is shown. */
  retry?: HookAttributes
  hooks?: HookAttributes
}

/** The Metronic destructive alert: the toned Keenicon, then cause and consequence, the technical line and Retry. */
export const errorState = (t: Translate, props: ErrorStateProps): string =>
  `<div class="v2-state v2-state--error kt-alert kt-alert-light kt-alert-destructive" role="alert"${hookAttrs(props.hooks)}>${icon('xCircle')}<div class="v2-state__body flex flex-col items-start gap-2.5 grow min-w-0"><p><strong>${escapeHtml(props.lead)}</strong>${props.text ? ` ${escapeHtml(props.text)}` : ''}</p>${props.detail ? `<code>${escapeHtml(props.detail)}</code>` : ''}${props.retry ? `<button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline"${hookAttrs(props.retry)}>${icon('refresh', 14)}${escapeHtml(t('Retry'))}</button>` : ''}</div></div>`

// The Metronic empty state: the icon in a soft circle, a semibold title, secondary text and the action, centered
// with no frame of its own (it sits in a card). The error block is a kt-alert.
export const STATE_BLOCK_CSS = `.v2-state--empty{display:flex;flex-direction:column;align-items:center;gap:.625rem;padding:2.5rem 1.25rem;text-align:center}
.v2-state--empty>:is(h2,h3){font-size:1rem;font-weight:600}
.v2-state--empty>p{max-width:48ch;margin-block-end:.375rem;font-size:.875rem;line-height:1.5;color:var(--text-2)}
.v2-state__icon{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;margin-block-end:.25rem;border-radius:50%;border:1px solid var(--line);background:color-mix(in oklab,var(--kt-accent) 60%,transparent);color:var(--muted)}
.v2-state--loading{display:flex;flex-direction:column;gap:1rem}
.v2-state--error{line-height:1.5}
.v2-state--error>.v2-icon{margin-block-start:.125rem;color:var(--destructive)}
.v2-state--error strong{color:var(--destructive);font-weight:600}
.v2-state--error code{inline-size:100%;padding:.5rem .75rem;border-radius:var(--radius-control);background:var(--surface);border:1px solid var(--line);font-size:.75rem;color:var(--text-2);overflow-wrap:anywhere}
.v2-skeleton-row{display:flex;align-items:center;gap:.75rem;animation:v2-pulse 1.6s ease-in-out infinite}
.v2-skeleton-lines{flex:1 1 auto;display:flex;flex-direction:column;gap:.375rem}
.v2-skeleton{display:block;height:.625rem;border-radius:var(--radius-control);background:var(--kt-accent)}
.v2-skeleton--thin{height:.5rem}
.v2-skeleton--tile{flex:none;width:2.25rem;height:2.25rem;border-radius:50%}
.v2-skeleton--pill{flex:none;width:4.5rem;height:1.5rem;border-radius:var(--radius-pill)}
`
