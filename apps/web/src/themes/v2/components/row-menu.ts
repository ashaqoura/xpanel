import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon, type IconName } from '../icons.ts'

export interface RowMenuItem {
  label: string
  /** Leading icon, as the items of a Metronic menu carry one. */
  icon?: IconName
  /** Keyboard hint shown beside the item, such as "E". */
  shortcut?: string
  danger?: boolean
  separatorBefore?: boolean
  /** A link item navigates; otherwise the item is a button bound through its hooks. */
  href?: string
  hooks?: HookAttributes
}

export interface RowMenuProps {
  id: string
  /** Names the trigger and the menu, such as "Actions for alice". */
  label: string
  items: readonly RowMenuItem[]
  /** Optional custom `<li role="none">...</li>` menu items prepended before `items`. */
  prependItemsHtml?: string
  /** Hooks on the trigger, such as the `menu` verb of the `row-menu` template. */
  triggerHooks?: HookAttributes
  hooks?: HookAttributes
}

/** Row action menu: a small ghost kebab trigger (ki-dots-vertical) and a role="menu" list in a native popover, so it opens without
 *  script, escapes the table's scroll clipping (top layer) and closes on Escape or an outside click.
 *  Arrow-key roving focus between items belongs to a core menu controller. */
export function rowMenu(props: RowMenuProps): string {
  const label = escapeHtml(props.label)
  const items = `${props.prependItemsHtml ?? ''}${props.items.map(item => {
    const content = `${item.icon ? icon(item.icon, 16) : ''}${escapeHtml(item.label)}${item.shortcut ? `<kbd class="ms-auto" aria-hidden="true">${escapeHtml(item.shortcut)}</kbd>` : ''}`
    const cls = item.danger ? 'v2-menu__item v2-menu__item--danger kt-dropdown-menu-link text-destructive hover:text-destructive' : 'v2-menu__item kt-dropdown-menu-link'
    const control = item.href
      ? `<a role="menuitem" class="${cls}" href="${escapeHtml(item.href)}"${hookAttrs(item.hooks)}>${content}</a>`
      : `<button type="button" role="menuitem" class="${cls}"${hookAttrs(item.hooks)}>${content}</button>`
    return `${item.separatorBefore ? '<li role="separator"></li>' : ''}<li role="none">${control}</li>`
  }).join('')}`
  const id = escapeHtml(props.id)
  return `<span class="v2-menu"${hookAttrs(props.hooks)}><button type="button" class="v2-btn v2-btn--icon kt-btn kt-btn-sm kt-btn-icon kt-btn-ghost [&:has(+:popover-open)]:bg-accent" popovertarget="${id}" aria-haspopup="menu" aria-controls="${id}" aria-label="${label}"${hookAttrs(props.triggerHooks)}><i class="v2-icon ki-filled ki-dots-vertical text-lg leading-none" aria-hidden="true"></i></button><ul class="v2-menu__list" id="${id}" role="menu" aria-label="${label}" popover>${items}</ul></span>`
}

/// Without CSS anchor positioning the popover keeps the browser's centered placement (margin:auto, which the
// stylesheet reset would otherwise clear). The list carries the Metronic dropdown-menu values: the kt-dropdown-menu
// root itself only shows with its script. Items are kt-dropdown-menu-link.
export const ROW_MENU_CSS = `.v2-menu{display:inline-flex}
.v2-menu__list{min-inline-size:175px;max-block-size:calc(100dvh - 16px);margin:auto;overflow-y:auto;padding:.5rem;border-radius:var(--radius-control);background:var(--popover,var(--surface));color:var(--popover-foreground,var(--text));border:1px solid var(--line);box-shadow:var(--v2-elev);text-align:start}
.v2-menu__list:popover-open{display:flex;flex-direction:column;gap:.25rem}
@supports (position-area:block-end){.v2-menu__list{inset:auto;margin:4px 0 0;position-area:block-end span-inline-start;position-try-fallbacks:flip-block,flip-inline,flip-block flip-inline}}
.v2-menu__list [role=separator]{flex:none;height:1px;margin:.375rem -.5rem;background:var(--line)}
.v2-menu__item:focus-visible{outline:0;background:var(--kt-accent)}
`
