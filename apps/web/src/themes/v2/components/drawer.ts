import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

export interface DrawerProps {
  id: string
  title: string
  bodyHtml: string
  /** Cancel and the primary action, built with the kit. */
  footerHtml?: string
  /** Hooks of the controller that closes the drawer; without them no close button is shown. */
  close?: HookAttributes
  hidden?: boolean
  hooks?: HookAttributes
}

/** Side panel for create/edit forms and row details: a kt-card whose header carries the title and a small ghost
 *  close. Place it beside the main content in a `.v2-split` row. */
export function drawer(t: Translate, props: DrawerProps): string {
  const titleId = `${props.id}-title`
  return `<aside class="v2-drawer kt-card" id="${escapeHtml(props.id)}" aria-labelledby="${escapeHtml(titleId)}"${props.hidden ? ' hidden' : ''}${hookAttrs(props.hooks)}>
<header class="v2-drawer__head kt-card-header"><h2 id="${escapeHtml(titleId)}">${escapeHtml(props.title)}</h2>${props.close ? `<button type="button" class="v2-btn v2-btn--icon v2-btn--bare kt-btn kt-btn-sm kt-btn-icon kt-btn-ghost shrink-0 -me-2" aria-label="${escapeHtml(t('Close'))}"${hookAttrs(props.close)}>${icon('x', 14)}</button>` : ''}</header>
<div class="v2-drawer__body kt-card-content">${props.bodyHtml}</div>
${props.footerHtml ? `<footer class="v2-drawer__foot kt-card-footer justify-end">${props.footerHtml}</footer>` : ''}
</aside>`
}

// The drawer is a kt-card; its parts keep the card values (56px header, 20px gutters, 20px between the parts of
// the body) for a drawer written with the v2 classes alone.
export const DRAWER_CSS = `.v2-split{display:flex;flex-wrap:wrap;align-items:flex-start;gap:1.25rem}
.v2-split>:first-child{flex:999 1 480px;min-width:0}
.v2-drawer{flex:1 1 380px;max-width:440px;min-width:0;overflow:hidden}
.v2-drawer__head{display:flex;align-items:center;justify-content:space-between;gap:.625rem;min-height:3.5rem;padding:.625rem var(--v2-panel-padding);border-bottom:1px solid var(--line)}
.v2-drawer__body{flex-grow:1;display:flex;flex-direction:column;gap:1.25rem;padding:var(--v2-panel-padding);min-width:0}
.v2-drawer__foot{margin-top:auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.625rem;padding:1rem var(--v2-panel-padding);border-top:1px solid var(--line)}
@media(max-width:959px){.v2-drawer{max-width:none}}
@media(min-width:1024px){.v2-split{gap:1.875rem}}
`
