import { canOpenRegisteredRoute, isToolAuthorized, navigation } from '@xpanel/catalog'
import type { PanelSurfaceProps } from '../../../../contract.ts'
import { localeDirection } from '../../../../../i18n.ts'
import { normalizeAsciiDigits } from '../../../../../display-format.ts'
import { card, pageHeader } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2Messages } from '../../../messages.ts'
import { actionGlyph, actionVariant, phoneLabels } from '../settings/common.ts'

/** These are current core admission decisions, independent of presentation. */
export interface PanelOperationAuthority {
  readonly presentation?: 'live' | 'read-only'
  readonly canReadFacts?: boolean
  readonly authorizedTools?: ReadonlySet<string>
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canUseTerminal?: boolean
}

export const deniedOperationAuthority: PanelOperationAuthority = { canRead: false, canManage: false }

export function operationContext(props: PanelSurfaceProps, authority: PanelOperationAuthority, route = props.activeRoute ?? '') {
  const locale = props.locale ?? 'en'
  const readOnly = authority.presentation === 'read-only'
  const canRead = !readOnly && !!props.account && authority.canRead === true
  const matched = props.visibility?.principal.kind === 'user' && props.visibility.principal.accountId === props.account?.id
  const factIdentity = readOnly && authority.canReadFacts === true && matched && !!props.visibility && canOpenRegisteredRoute(route, props.visibility)
  const canReadFacts = (ids: readonly string[]): boolean => canRead || !!factIdentity && ids.some(id => authority.authorizedTools?.has(id) && props.catalog?.some(tool => tool.id === id && isToolAuthorized(tool, props.visibility!)))
  const pageTools = navigation.find(surface => surface.surface === 'xpanel')?.sections.flatMap(section => section.pages).find(page => page.route === route)?.tools ?? []
  const account = canReadFacts(pageTools) ? props.account : undefined
  return { locale, t: v2Messages.translator(locale), account, canRead, canReadFacts, canManage: canRead && props.account?.status === 'active' && authority.canManage === true }
}

export const technical = (value: string | number): string => `<bdi dir="ltr" class="v2-mono">${escapeHtml(normalizeAsciiDigits(value))}</bdi>`

export function operationButton(label: string, hooks?: HookAttributes, disabled = true, primary = false, hidden = false): string {
  return `<button type="button" class="${actionVariant(hooks, primary)}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}${hidden ? ' hidden' : ''}>${actionGlyph(hooks)}${escapeHtml(label)}</button>`
}

/** A table row action: a full-height (44px) Metronic button, soft danger for removal. */
export function operationRowButton(label: string, hooks?: HookAttributes, disabled = true): string {
  return `<button type="button" class="${actionVariant(hooks, false)}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${actionGlyph(hooks)}${escapeHtml(label)}</button>`
}

export function operationSelect(selectHtml: string): string {
  return `<span class="v2-select">${selectHtml}${icon('chevDown', 16)}</span>`
}

export function operationField(id: string, label: string, control: string, help?: string): string {
  const described = help ? control.replace(/<(input|select|textarea)\b/, `<$1 aria-describedby="${escapeHtml(id)}-help"`) : control
  return `<div class="v2-field"><label class="kt-form-label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>${described}${help ? `<p id="${escapeHtml(id)}-help" class="v2-field__help">${escapeHtml(help)}</p>` : ''}</div>`
}

export function operationFacts(facts: readonly { label: string; valueHtml: string }[]): string {
  return `<dl class="v2-panel-operation-facts">${facts.map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${fact.valueHtml}</dd></div>`).join('')}</dl>`
}

export function operationTable(id: string, title: string, heads: readonly string[], bodyHooks: HookAttributes, bodyHtml: string): string {
  return `<div class="v2-panel-operation-table kt-scrollable-x-auto" role="region" tabindex="0" aria-labelledby="${escapeHtml(id)}-caption"><table class="kt-table" id="${escapeHtml(id)}"${phoneLabels(heads)}><caption id="${escapeHtml(id)}-caption" class="v2-sr">${escapeHtml(title)}</caption><thead><tr>${heads.map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody${hookAttrs(bodyHooks)}>${bodyHtml}</tbody></table></div>`
}

export const unreadRow = (columns: number, message: string): string => `<tr><td colspan="${columns}"><p role="status">${escapeHtml(message)}</p></td></tr>`

export function operationCard(id: string, title: string, bodyHtml: string, description?: string, actionsHtml?: string): string {
  return card({ title, titleId: id, bodyHtml, ...(description ? { description } : {}), ...(actionsHtml ? { actionsHtml } : {}) })
}

/** A card's re-read action for its header toolbar: the Metronic outline button with the refresh Keenicon. */
export function operationToolbarButton(label: string, hooks: HookAttributes, disabled = true): string {
  return `<button type="button" class="v2-btn kt-btn kt-btn-outline"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${actionGlyph(hooks) || '<i class="ki-filled ki-arrows-circle" aria-hidden="true"></i>'}${escapeHtml(label)}</button>`
}

export function operationPage(props: PanelSurfaceProps, route: string, title: string, description: string, bodyHtml: string, hooks?: HookAttributes, authority: PanelOperationAuthority = deniedOperationAuthority): string {
  const { account, canRead } = operationContext(props, authority, route)
  const locale = props.locale ?? 'en'
  const t = v2Messages.translator(locale)
  const header = pageHeader(t, { route, title, description, breadcrumb: [{ label: t(msgid('Home')), href: '/home' }, { label: title }] })
  return `<section class="v2-panel-operations" data-v2-operations-route="${escapeHtml(route)}"${!canRead ? ' data-readonly="true"' : ''}${account ? ` data-account="${escapeHtml(account.id)}" data-uid="${account.uid}"` : ''} lang="${locale}" dir="${localeDirection(locale)}"${hookAttrs(hooks)}>${header}${bodyHtml}</section>`
}
