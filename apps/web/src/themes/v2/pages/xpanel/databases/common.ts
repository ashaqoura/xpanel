import type { PanelSurfaceProps, ThemeViewProps } from '../../../../contract.ts'
import type { Translate } from '../../../../../i18n.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'

export type DatabasePageProps = PanelSurfaceProps & ThemeViewProps
export type DatabaseRoute = '/databases/mariadb' | '/databases/insights' | '/databases/remote-access'
  | '/databases/phpmyadmin' | '/databases/postgresql' | '/databases/phppgadmin'

/** Decisions supplied by core after account, catalog, listener and session admission. */
export interface DatabasePageAuthority {
  readonly presentation?: 'live' | 'read-only'
  readonly canRead: boolean
  readonly canManage: boolean
  /** Supplied saved metadata, never permission to contact a database provider. */
  readonly canReadFacts?: boolean
  /** Core's current feature/team-filtered permissions; required for fact-only reads. */
  readonly authorizedTools?: ReadonlySet<string>
  /** Related pages core has admitted for this caller, independent of the current page. */
  readonly relatedRoutes?: ReadonlySet<DatabaseRoute>
}

export const NO_DATABASE_AUTHORITY: DatabasePageAuthority = Object.freeze({ canRead: false, canManage: false })

export function databaseContext(props: DatabasePageProps, authority: DatabasePageAuthority) {
  const locale = props.locale ?? 'en'
  const principal = props.visibility?.principal
  const account = principal && (principal.kind !== 'user' || principal.accountId !== props.account?.id)
    ? undefined : props.account
  const canRead = account !== undefined && authority.canRead === true
  const matchingUser = principal?.kind === 'user' && principal.accountId === account?.id
  const factsAllowed = (tool: string): boolean => account !== undefined
    && (authority.authorizedTools === undefined
      ? canRead
      : (canRead || authority.canReadFacts === true && matchingUser) && authority.authorizedTools.has(tool))
  return {
    locale, account, canRead,
    canReadDatabaseFacts: factsAllowed('mysql-databases'),
    canReadUserFacts: factsAllowed('mysql-users'),
    canReadPostgreSqlFacts: factsAllowed('postgresql-databases'),
    canManage: canRead && authority.canManage === true && account?.status === 'active',
    t: v2Messages.translator(locale),
    direction: localeDirection(locale),
  }
}

export const technical = (value: string | number): string =>
  `<bdi dir="ltr" class="v2-mono">${escapeHtml(normalizeAsciiDigits(value))}</bdi>`

/** Keenicons the v2 icon set lacks. Inside a button the button sizes the glyph. */
export const dbGlyph = {
  trash: '<i class="ki-filled ki-trash" aria-hidden="true"></i>',
  discard: '<i class="ki-filled ki-arrows-loop" aria-hidden="true"></i>',
  key: '<i class="ki-filled ki-key" aria-hidden="true"></i>',
  eye: '<i class="ki-filled ki-eye" aria-hidden="true"></i>',
  restore: '<i class="ki-filled ki-time" aria-hidden="true"></i>',
  insights: '<i class="ki-filled ki-chart-simple" aria-hidden="true"></i>',
} as const

/** The button hierarchy of a database card: one primary, outline for the rest, ghost to step back, soft red to remove. */
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const

export interface DbButtonOptions {
  disabled?: boolean
  primary?: boolean
  submit?: boolean
  ariaControls?: string
  ariaExpanded?: boolean
  /** Leading glyph markup: `icon(...)` of the v2 set or a {@link dbGlyph}. */
  icon?: string
  kind?: 'outline' | 'ghost' | 'danger'
  /** Kept for callers; every button keeps the 44px target, so a row button is no smaller. */
  small?: boolean
}

export const dbButton = (label: string, hooks?: HookAttributes, options: DbButtonOptions = {}): string =>
  `<button type="${options.submit ? 'submit' : 'button'}" class="${options.primary ? BUTTON.primary : BUTTON[options.kind ?? 'outline']}"${options.ariaControls ? ` aria-controls="${escapeHtml(options.ariaControls)}"` : ''}${options.ariaExpanded !== undefined ? ` aria-expanded="${options.ariaExpanded}"` : ''}${hookAttrs(hooks)}${options.disabled ? ' disabled' : ''}>${options.icon ?? ''}${escapeHtml(label)}</button>`

export const dbSelect = (selectHtml: string): string =>
  `<span class="v2-select">${selectHtml}</span>`

export const dbField = (id: string, label: string, controlHtml: string, help?: string): string =>
  `<div class="v2-field"><label class="kt-form-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>${controlHtml}${help ? `<p class="v2-field__help kt-form-description">${escapeHtml(help)}</p>` : ''}</div>`

export const dbFacts = (rows: readonly { label: string; valueHtml: string; hooks?: HookAttributes }[], hooks?: HookAttributes): string =>
  {
  // The count strip is a row of KPI tiles (the controller rebuilds its entries, so the tile look is in the page
  // styles); every other fact list puts the label above its value on the same start edge.
  const counts = hooks?.['data-db-counts'] !== undefined
  return `<dl class="v2-db-facts"${hookAttrs(hooks)}>${rows.map(row => `<div><dt class="text-secondary-foreground">${escapeHtml(row.label)}</dt><dd class="${counts ? 'font-semibold text-mono' : 'text-mono'}"${hookAttrs(row.hooks)}>${row.valueHtml}</dd></div>`).join('')}</dl>`
}

export const dbCard = (key: string, title: string, bodyHtml: string, options: { flush?: boolean; description?: string; actionsHtml?: string } = {}): string =>
  card({ titleId: `v2-db-${key}-title`, title, bodyHtml, ...options })

export const dbEmptyRow = (columns: number, text: string): string =>
  `<tr><td colspan="${columns}" class="v2-db-unread">${escapeHtml(text)}</td></tr>`

// Server-rendered rows carry the same phone labels as the rows the controller rebuilds.
const labelCells = (headings: readonly string[], rowsHtml: string): string => rowsHtml.replace(/<tr[ >].*?<\/tr>/gs, row => {
  let index = 0
  return row.replace(/<td(?=[ >])(?! colspan)/g, cell => index++ > 0 && headings[index - 1] ? `${cell} data-label="${escapeHtml(headings[index - 1]!)}"` : cell)
})

export const dbTable = (id: string, title: string, headings: readonly string[], bodyHtml: string, bodyHooks: HookAttributes, tableHooks?: HookAttributes): string =>
  `<div class="v2-db-table-region kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${escapeHtml(title)}"><table id="${escapeHtml(id)}" class="v2-table kt-table align-middle"${hookAttrs(tableHooks)}><caption class="v2-sr">${escapeHtml(title)}</caption><thead><tr>${headings.map(heading => `<th scope="col">${escapeHtml(heading)}</th>`).join('')}</tr></thead><tbody${hookAttrs(bodyHooks)}>${labelCells(headings, bodyHtml)}</tbody></table></div>`

export function dbPage(t: Translate, route: DatabaseRoute, title: string, description: string, bodyHtml: string): string {
  return `<div class="v2-db-page">${pageHeader(t, {
    route, title, description, breadcrumb: [{ label: t('Home'), href: '/home' }, { label: t('Databases') }, { label: title }],
  })}${bodyHtml}</div>`
}

export function relatedDatabasePage(t: Translate, authority: DatabasePageAuthority, route: DatabaseRoute, label: string): string {
  return authority.relatedRoutes?.has(route)
    ? `<a class="v2-btn kt-btn kt-btn-outline" href="${route}">${escapeHtml(label)}${icon('arrow', 16)}</a>`
    : `<button type="button" class="v2-btn kt-btn kt-btn-outline" disabled>${escapeHtml(label)}${icon('arrow', 16)}</button>`
}
