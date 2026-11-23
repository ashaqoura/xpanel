import { escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'

export interface TabItem {
  id: string
  label: string
  /** The tab panel this tab controls. */
  panelId: string
  selected: boolean
  count?: number
  /** An empty count slot a controller fills later; it shows once it has text. Ignored when `count` is given. */
  countHooks?: HookAttributes
  hooks?: HookAttributes
}

export interface TabsProps {
  /** Names the tab list, such as "Site settings". */
  label: string
  tabs: readonly TabItem[]
  hooks?: HookAttributes
}

// Core toggles aria-selected, never a class, so the active Metronic look keys on that attribute.
const TAB = 'kt-tab-toggle aria-selected:border-b-primary aria-selected:text-primary'
const COUNT = 'v2-count v2-num kt-badge kt-badge-sm kt-badge-outline rounded-[30px] empty:hidden'

/** Tab list; only the selected tab is in the Tab sequence (arrow keys move between tabs in the core controller). */
export const tabs = (props: TabsProps): string =>
  `<div class="v2-tabs kt-tabs kt-tabs-line" role="tablist" aria-label="${escapeHtml(props.label)}"${hookAttrs(props.hooks)}>${props.tabs.map(tab => `<button type="button" role="tab" id="${escapeHtml(tab.id)}" aria-selected="${tab.selected}" aria-controls="${escapeHtml(tab.panelId)}" tabindex="${tab.selected ? '0' : '-1'}" class="${TAB}"${hookAttrs(tab.hooks)}>${escapeHtml(tab.label)}${tab.count !== undefined ? `<span class="${COUNT}">${tab.count}</span>` : tab.countHooks ? `<span class="${COUNT}"${hookAttrs(tab.countHooks)}></span>` : ''}</button>`).join('')}</div>`

export interface TabPanelProps {
  id: string
  /** Id of the tab that labels this panel. */
  tabId: string
  bodyHtml: string
  hidden?: boolean
  /** Page sections keep the approved 32px hierarchy instead of compact component spacing. */
  sectionSpacing?: boolean
  hooks?: HookAttributes
}

export const tabPanel = (props: TabPanelProps): string =>
  `<div class="v2-tabpanel${props.sectionSpacing ? ' v2-tabpanel--sections' : ''}" role="tabpanel" id="${escapeHtml(props.id)}" aria-labelledby="${escapeHtml(props.tabId)}" tabindex="0"${props.hidden ? ' hidden' : ''}${hookAttrs(props.hooks)}>${props.bodyHtml}</div>`

// The tab list is kt-tabs kt-tabs-line and each tab a kt-tab-toggle (medium, secondary, primary when selected).
// A count written with the v2 classes alone keeps the small outline badge look and follows the selected tab.
export const TABS_CSS = `.v2-tabs{display:flex;flex-wrap:wrap;align-items:center;gap:0 1.75rem;border-bottom:1px solid var(--line)}
.v2-tabs .v2-count{display:inline-flex;align-items:center;justify-content:center;height:1.25rem;min-inline-size:1.25rem;padding:0 .325rem;border-radius:30px;border:1px solid var(--line);background:var(--sunken);color:var(--text-2);font-size:.6875rem;font-weight:500;line-height:.75rem}
.v2-tabs>[aria-selected="true"] .v2-count{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.v2-tabs .v2-count:empty{display:none}
@media(max-width:600px){.v2-tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x proximity;scroll-padding-inline:var(--space-2);padding-inline-end:32px;mask-image:linear-gradient(to right,#000 calc(100% - 32px),transparent)}.v2-tabs:dir(rtl){mask-image:linear-gradient(to left,#000 calc(100% - 32px),transparent)}.v2-tabs>[role=tab]{flex:none;white-space:nowrap;scroll-snap-align:start}}
.v2-tabpanel{display:flex;flex-direction:column;gap:1.25rem;padding-top:1.25rem}
.v2-tabpanel--sections{gap:var(--space-4);padding-top:0}
`
