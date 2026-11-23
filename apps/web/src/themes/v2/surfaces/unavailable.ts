import { canonicalNavigationRoute, visibleRegisteredNavigation } from '@xpanel/catalog'
import { publicContactEmail } from '../../../display-name.ts'
import { alternateLocales, catalogText, type Translate } from '../../../i18n.ts'
import { projectActionState } from '../../../models/action-state.ts'
import type { UiTheme, UnavailableProps } from '../../contract.ts'
import { actionState } from '../components/action-state.ts'
import { escapeHtml } from '../html.ts'
import { catalogIcon, icon } from '../icons.ts'
import { v2Messages } from '../messages.ts'
import { renderV2Shell } from '../shell/shell.ts'
import { V2_SECURITY_SLOT } from './slots.ts'

export type V2ReadOnlyPage = (props: UnavailableProps) => string | undefined

// The vertical Metronic menu of the shell sidebar: the same item, link, icon, title and arrow classes.
const SECTION_LINK = 'kt-menu-link gap-2.5 px-2.5 py-1.5'
const PAGE_LINK = 'kt-menu-link px-2.5 py-1.5'
const CHEVRON = icon('chevRight', 14).replace('class="v2-icon', 'class="v2-icon v2-nav__chev')

function registeredSidebar(t: Translate, props: UnavailableProps): string {
  const current = canonicalNavigationRoute(props.route)
  const nav = visibleRegisteredNavigation(props.visibility).find(item => item.surface === props.surface)
  return `<nav class="v2-nav" aria-label="${escapeHtml(t('navigation'))}"><ul class="kt-menu flex-col">${(nav?.sections ?? []).map(section => {
    const name = catalogText(props.locale, `nav.section.${props.surface}.${section.id}.name`, section.name)
    return `<li class="kt-menu-item" data-nav-section="${escapeHtml(section.id)}"><details${section.pages.some(page => page.route === current) ? ' open' : ''}><summary class="${SECTION_LINK}"><span class="kt-menu-icon">${icon(catalogIcon(section.icon))}</span><span class="kt-menu-title">${escapeHtml(name)}</span><span class="kt-menu-arrow">${CHEVRON}</span></summary><ul class="kt-menu flex-col" aria-label="${escapeHtml(name)}">${section.pages.map(page => `<li class="kt-menu-item"><a class="${PAGE_LINK}" href="${escapeHtml(page.route)}" data-nav-route="${escapeHtml(page.route)}" data-nav-wiring="${props.qualifiedRoutes.has(page.route) ? 'live' : 'soon'}"${page.route === current ? ' aria-current="page"' : ''}><span class="kt-menu-title">${escapeHtml(catalogText(props.locale, `nav.page.${props.surface}.${page.id}.name`, page.name))}</span></a></li>`).join('')}</ul></details></li>`
  }).join('')}</ul></nav>`
}

// The summary is a Metronic general-info card: one row per fact, its label beside its value.
function workspaceSummary(props: UnavailableProps): string {
  const view = props.summary
  if (!view) return ''
  return `<section class="v2-card v2-unavailable__summary kt-card p-0 gap-0" data-workspace-identity="true"${props.surface === 'xpanel' ? ' data-workspace-account-overview="true"' : ''} aria-labelledby="v2-workspace-summary-title"><div class="kt-card-header"><h2 id="v2-workspace-summary-title" class="kt-card-title text-base font-semibold text-mono">${escapeHtml(view.title)}</h2></div><div class="kt-card-content flex flex-col gap-5"><dl class="v2-unavailable__facts flex flex-col gap-3.5">${view.fields.map(field => `<div class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:grid-cols-[minmax(9rem,14rem)_minmax(0,1fr)] items-baseline gap-2.5 min-w-0 text-start" data-workspace-field="${escapeHtml(field.key)}"><dt class="text-sm font-normal text-secondary-foreground">${escapeHtml(field.label)}</dt><dd class="text-sm font-normal text-mono break-words">${field.ltr ? `<bdi dir="ltr">${escapeHtml(field.value)}</bdi>` : escapeHtml(field.value)}</dd></div>`).join('')}</dl>${view.accountEmpty && view.accountEmptyText ? `<p class="kt-alert kt-alert-light kt-alert-primary" data-workspace-account-empty="true"><span class="kt-alert-icon text-primary">${icon('info', 18)}</span><span class="kt-alert-title">${escapeHtml(view.accountEmptyText)}</span></p>` : ''}${view.mfaHref && view.mfaText ? `<p class="text-sm font-medium" data-mfa-optional-link><a class="kt-link" href="${escapeHtml(view.mfaHref)}">${escapeHtml(view.mfaText)}</a></p>` : ''}</div></section>`
}

// Without a page layout the route shows as a Metronic empty page: a glyph in a soft circle over the page name.
const emptyHeading = (heading: string): string =>
  `<div class="v2-unavailable__empty flex flex-col items-center gap-5 px-5 py-10 text-center"><span class="flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary" aria-hidden="true">${icon('info', 30)}</span><h1 class="text-xl font-medium leading-tight text-mono">${escapeHtml(heading)}</h1></div>`

/** Missing qualified renderers are an integration error, never silently replaced by an unavailable card; an admitted caller without realm facts gets the unavailable summary. */
export function createV2UnavailableRenderer(readOnlyPage: V2ReadOnlyPage): UiTheme['renderUnavailable'] {
  return props => {
    const t = v2Messages.translator(props.locale)
    const hasReadOnly = props.admitted && props.readOnlyFacts !== undefined
    const layout = hasReadOnly ? readOnlyPage(props) : undefined
    if (hasReadOnly && !layout) throw new Error(`v2_unqualified_layout_missing:${props.surface}:${props.route}`)
    if (hasReadOnly && props.securityPage && layout!.split(V2_SECURITY_SLOT).length !== 2) throw new Error('v2_unqualified_security_slot_missing_or_duplicated')
    const contact = publicContactEmail(props.supportEmail)
    const path = props.route.startsWith('/') ? props.route : '/'
    const href = (locale = props.locale, theme = props.theme) => `${path}?${new URLSearchParams({ lang: locale, theme, density: props.density })}`
    const content = `<section class="v2-unavailable flex flex-col gap-5 lg:gap-7.5 min-w-0" data-surface="${props.surface}" data-tool-availability="unverified"${props.securityPage ? ' data-security-page="true"' : ''}${props.surface === 'xpanel' && props.route === '/domains/reverse-proxy' ? ' data-unqualified-route="/domains/reverse-proxy"' : ''}>${layout ?? emptyHeading(props.heading)}${props.securityPage && !layout ? V2_SECURITY_SLOT : ''}${props.actionState ? actionState(projectActionState({ ...props.actionState, locale: props.locale })) : ''}${props.securityPage ? '' : workspaceSummary(props)}${!props.securityPage && contact ? `<p class="text-sm font-normal text-secondary-foreground">${escapeHtml(t('Write to'))} <a class="kt-link" href="mailto:${escapeHtml(contact)}"><bdi dir="ltr">${escapeHtml(contact)}</bdi></a>.</p>` : ''}<div class="kt-alert kt-alert-light kt-alert-destructive block" role="alert" data-auth-error hidden></div><p class="empty:hidden text-sm text-secondary-foreground" role="status" data-auth-status></p></section>`
    return renderV2Shell(t, {
      branding: props.branding, surface: props.surface, activeRoute: props.route, visibility: props.visibility,
      homeHref: props.surface === 'xwhm' ? '/whm' : props.surface === 'xmail' ? '/mail/inbox' : '/home',
      sidebarHtml: registeredSidebar(t, props), realtimeEnabled: false,
      searchHtml: `<button type="button" class="v2-search" disabled aria-label="${escapeHtml(t('Search'))}" title="${escapeHtml(t('Unavailable'))}">${escapeHtml(t('Search'))}</button>`,
      languages: alternateLocales(props.locale).map(locale => ({ tag: locale.tag, href: href(locale.tag) })),
      scheme: { current: props.theme, toggleHref: href(props.locale, props.theme === 'dark' ? 'light' : 'dark') },
      account: { signedIn: props.signedIn, username: props.session?.username, roleLabel: props.session?.role, signInHref: '/login', ...(props.signedIn ? { securityHref: props.surface === 'xwhm' ? '/whm/security/sign-in' : props.surface === 'xmail' ? '/mail/settings/security' : '/security/account' } : {}) },
      contentHtml: content,
    })
  }
}

/** Cards, rows and notices use Metronic classes in the markup; only the bidi isolation of fact values stays here. */
export const V2_UNAVAILABLE_CSS = `.v2-unavailable,.v2-unavailable__summary{min-inline-size:0}.v2-unavailable__facts bdi{display:inline;unicode-bidi:isolate}`
