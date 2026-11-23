import type { Translate } from '../../../i18n.ts'
import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'
import { icon } from '../icons.ts'

export interface DataTableColumn {
  label: string
  /** Visually hidden header (the label still names the column for assistive technology). */
  srOnly?: boolean
  align?: 'start' | 'end'
}

export interface DataTableRow {
  /** One cell per column, built with the kit (icon-led first cell, pills, meters). */
  cellsHtml: readonly string[]
  /** Row actions for the last column: "Manage" plus a row menu. */
  actionsHtml?: string
  /** Row checkbox; the label names the row, such as "Select alice". */
  select?: { label: string; checked?: boolean; hooks?: HookAttributes }
  hooks?: HookAttributes
}

export type DataTableState = 'ready' | 'loading' | 'empty' | 'error'

export interface DataTableProps {
  id: string
  /** Names the table and its scroll region. Hidden by default because the card header shows the title. */
  caption: string
  showCaption?: boolean
  columns: readonly DataTableColumn[]
  rows: readonly DataTableRow[]
  state?: DataTableState
  emptyText?: string
  error?: { lead: string; detail?: string; retry?: HookAttributes }
  loadingRows?: number
  /** Adds the actions column; its header is named for assistive technology only. */
  actions?: boolean
  /** Adds the checkbox column with a "select all" control. */
  selectAll?: { label: string; hooks?: HookAttributes }
  minWidth?: number
  /** On a phone the third cell, not the second, is the value shown opposite the name. */
  phoneValueColumn?: 3
  regionHooks?: HookAttributes
  /** Hooks on <table>. */
  tableHooks?: HookAttributes
  /** Hooks on <tbody>, where controllers paint their rows. */
  bodyHooks?: HookAttributes
}

export function dataTable(t: Translate, props: DataTableProps): string {
  const state = props.state ?? (props.rows.length ? 'ready' : 'empty')
  const captionId = `${props.id}-caption`
  const span = props.columns.length + (props.actions ? 1 : 0) + (props.selectAll ? 1 : 0)
  const head = [
    props.selectAll ? `<th scope="col" class="v2-table__check"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" aria-label="${escapeHtml(props.selectAll.label)}"${hookAttrs(props.selectAll.hooks)}></th>` : '',
    ...props.columns.map(column => `<th scope="col"${column.align === 'end' ? ' class="v2-table__end text-end"' : ''}>${column.srOnly ? `<span class="v2-sr">${escapeHtml(column.label)}</span>` : escapeHtml(column.label)}</th>`),
    props.actions ? `<th scope="col" class="v2-table__actions text-end"><span class="v2-sr">${escapeHtml(t('Actions'))}</span></th>` : '',
  ].join('')
  const row = (item: DataTableRow): string => dataTableRow(props, item)
  const stateRow = (kind: Exclude<DataTableState, 'ready'>, content: string): string => `<tr class="v2-table__state" data-table-state="${kind}"><td colspan="${span}">${content}</td></tr>`
  const skeleton = `<span class="v2-skeleton v2-skeleton--tile"></span><span class="v2-skeleton-lines"><span class="v2-skeleton" style="inline-size:40%"></span><span class="v2-skeleton v2-skeleton--thin" style="inline-size:24%"></span></span><span class="v2-skeleton v2-skeleton--pill"></span>`
  const body = state === 'ready' ? props.rows.map(row).join('')
    : state === 'empty' ? stateRow('empty', `<p role="status">${escapeHtml(props.emptyText ?? t(msgctxt('theme:v2', 'Nothing to show yet.')))}</p>`)
    : state === 'loading' ? Array.from({ length: props.loadingRows ?? 3 }, (_, i) => i === 0
      ? stateRow('loading', `<span class="v2-sr">${escapeHtml(t('Loading'))}</span><div class="v2-skeleton-row" aria-hidden="true">${skeleton}</div>`)
      : `<tr class="v2-table__state" aria-hidden="true"><td colspan="${span}"><div class="v2-skeleton-row">${skeleton}</div></td></tr>`).join('')
    : stateRow('error', `<div class="v2-table__error" role="alert"><p><strong>${escapeHtml(props.error?.lead ?? t(msgctxt('theme:v2', 'This list could not be read.')))}</strong></p>${props.error?.detail ? `<code>${escapeHtml(props.error.detail)}</code>` : ''}${props.error?.retry ? `<button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline"${hookAttrs(props.error.retry)}>${icon('refresh', 14)}${escapeHtml(t('Retry'))}</button>` : ''}</div>`)
  // Metronic table: kt-scrollable-x-auto > table.kt-table. A shown caption sits above the table, as before.
  return `<div class="v2-table-scroll kt-scrollable-x-auto" role="region" aria-labelledby="${escapeHtml(captionId)}" tabindex="0"${state === 'loading' ? ' aria-busy="true"' : ''}${hookAttrs(props.regionHooks)}><table id="${escapeHtml(props.id)}" class="v2-table${props.phoneValueColumn ? ' v2-table--value-3' : ''} kt-table text-start${props.showCaption ? ' caption-top' : ''}"${attr('style', props.minWidth ? `min-inline-size:${props.minWidth}px` : undefined)}${hookAttrs(props.tableHooks)}><caption id="${escapeHtml(captionId)}"${props.showCaption ? ' class="mt-0 pb-2 text-start font-semibold text-foreground"' : ' class="v2-sr"'}>${escapeHtml(props.caption)}</caption><thead><tr>${head}</tr></thead><tbody${hookAttrs(props.bodyHooks)}>${body}</tbody></table></div>`
}

/** One body row in the table's column layout; layouts also use it for the row templates core controllers clone. */
export function dataTableRow(props: Pick<DataTableProps, 'columns' | 'actions' | 'selectAll'>, item: DataTableRow): string {
  const cellClass = (index: number): string => props.columns[index]?.align === 'end' ? ' class="v2-table__end text-end"' : ''
  return `<tr${hookAttrs(item.hooks)}>${props.selectAll ? `<td class="v2-table__check">${item.select ? `<input type="checkbox" class="kt-checkbox kt-checkbox-sm" aria-label="${escapeHtml(item.select.label)}"${item.select.checked ? ' checked' : ''}${hookAttrs(item.select.hooks)}>` : ''}</td>` : ''}${item.cellsHtml.map((cell, index) => `<td${cellClass(index)}>${cell}</td>`).join('')}${props.actions ? `<td class="v2-table__actions text-end">${item.actionsHtml ?? ''}</td>` : ''}</tr>`
}

/// A selected row is its checked checkbox, so there is no class to toggle. The actions column scrolls with the table:
// a sticky one covered the last data column whenever the table was a little wider than its card. The cell stays
// positioned so its visually hidden header label scrolls with it instead of widening the page.
// Metronic type: headers are regular and secondary (kt-table), the first data cell of a row is the record's name
// (medium, mono colour) and the other cells stay regular. The name rule adds no specificity beyond the table class.
export const DATA_TABLE_CSS = `.v2-table :where(tbody>tr>td:first-child:not([colspan],.v2-table__check),.v2-table__check+td){font-weight:500;color:var(--mono,var(--text))}
.v2-table .v2-table__check{inline-size:3rem}
.v2-table .v2-table__actions{position:relative;text-align:end;white-space:nowrap}
.v2-table .v2-table__actions>*{display:inline-flex;gap:.5rem;vertical-align:middle}
.v2-table tr:has(>.v2-table__check>input:checked)>td{background:var(--sunken)}
.v2-table tbody .v2-table__state:hover>td{background:transparent}
.v2-table__state>td{padding:1.875rem 1.25rem;text-align:center;color:var(--text-2);font-size:.875rem}
.v2-table__state:is([aria-hidden],[data-table-state=loading])>td{padding-block:.75rem;text-align:start}
.v2-table__error{display:flex;flex-direction:column;align-items:center;gap:.625rem;color:var(--text)}
.v2-table__error strong{color:var(--destructive);font-weight:500}
.v2-table__error code{padding:.5rem .75rem;border-radius:var(--radius-control);border:1px solid color-mix(in oklab,var(--destructive) 10%,transparent);background:color-mix(in oklab,var(--destructive) 5%,transparent);overflow-wrap:anywhere}
.v2-table .v2-meter{min-inline-size:120px}
.v2-table .v2-meter__row{white-space:nowrap}
.v2-cell-lead{display:flex;align-items:center;gap:.625rem;min-width:0}
.v2-cell-lead__mark{flex:none;display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:50%;border:1px solid var(--accent-line);background:var(--accent-soft);color:var(--accent);font-size:.8125rem;font-weight:600}
.v2-cell-lead__text{display:flex;flex-direction:column;gap:1px;min-width:0}
.v2-cell-lead__text>:first-child{font-weight:500;color:var(--mono,var(--text))}
.v2-cell-lead__text>:nth-child(2){font-weight:400;color:var(--text-2)}
`

/** Icon-led first cell: a 36px round mark (an initial, or an icon from the kit) with a primary and an optional meta line. */
export const leadCell = (props: { initial?: string; iconHtml?: string; title: string; meta?: string; mono?: boolean }): string =>
  `<div class="v2-cell-lead"><span class="v2-cell-lead__mark" aria-hidden="true">${props.iconHtml ?? escapeHtml(props.initial ?? '')}</span><span class="v2-cell-lead__text"><span${props.mono ? ' class="v2-mono"' : ''}>${escapeHtml(props.title)}</span>${props.meta ? `<span${props.mono ? ' class="v2-mono"' : ''}>${escapeHtml(props.meta)}</span>` : ''}</span></div>`
