// The v2 shell in the Metronic "demo 3" arrangement: a header on the muted page background, the full navigation
// menu in a sidebar on the same background (hidden and shown by the header's toggle) and the page inside a bordered
// container. While the menu is out of sight (toggled off, or a phone) a tab row lists the pages of the current
// section. It emits the classic shell hooks (data-* attributes, data-action values and element ids) so
// ws-client.js works unchanged; Metronic is used as CSS only.

import { canonicalNavigationRoute, visibleNavigation, visibleRegisteredNavigation, type CatalogTool, type VisibilityContext } from '@xpanel/catalog'
import { catalogText, localeInfo, type Locale, type Translate } from '../../../i18n.ts'
import { brandingProductName } from '../../../branding.ts'
import type { ThemeViewProps } from '../../contract.ts'
import { attr, escapeHtml, hookAttrs, type HookAttributes, type Tone } from '../html.ts'
import { catalogIcon, icon } from '../icons.ts'
import { toastRegion } from '../components/toast-region.ts'
import { activityControl } from './activity-control.ts'
import { activityDrawer, commandPalette, reconcileBanner, type ActivityDrawerProps, type CommandPaletteProps, type ReconcileBannerProps, type V2Surface } from './overlays.ts'

const PRODUCT: Readonly<Record<V2Surface, string>> = { xpanel: 'xPanel', xwhm: 'xWHM', xmail: 'xMail' }

/** Account or server summary: beside the product name in the header, and a card at the top of the phone drawer. */
export interface NavContext {
  /** Landmark name, such as "Account" or "Server". */
  label: string
  title: string
  /** Avatar initial; without it a server tile is shown. */
  initial?: string
  /** Plan name or role beside the title. */
  badge?: string
  /** Second line, such as the primary domain. */
  detail?: string
  status?: { tone: Tone; label: string }
  meters?: readonly { label: string; valueText: string; percent?: number; tone?: Tone }[]
  /** Small facts on one line, such as the panel version and uptime. */
  meta?: readonly string[]
}

export interface V2ShellProps extends ThemeViewProps {
  surface: V2Surface
  /** The canonical current route; registered aliases mark their parent page. */
  activeRoute: string
  /** The signed-in principal's visibility; the navigation lists only the pages it may open. */
  visibility?: VisibilityContext
  catalog?: readonly CatalogTool[]
  homeHref: string
  context?: NavContext
  /** Theme-owned account/domain controls beside the context summary. */
  contextControlHtml?: string
  /** Theme-owned surface navigation, such as mailbox folders. Omit to use the authorized catalog. */
  sidebarHtml?: string
  /** Theme-owned search control, bound to the surface's existing core controller. */
  searchHtml?: string
  /** Links in the page footer, such as "Open xMail". */
  footerLinks?: readonly { label: string; href: string; external?: boolean }[]
  realtimeEnabled: boolean
  /** Server and active generation chip. */
  server?: { name: string; generationId?: number; tone?: Tone }
  /** Alternate locales with the current page's address in each. */
  languages: readonly { tag: Locale; href: string }[]
  /** The current color scheme and the address of the page in the other one. */
  scheme: { current: 'light' | 'dark'; toggleHref: string }
  /** Unread activity count; the bell opens the activity drawer. Requires `activity`. */
  unread?: number
  account: {
    signedIn: boolean
    username?: string
    roleLabel?: string
    securityHref?: string
    signInHref?: string
    links?: readonly { label: string; href: string; hooks?: HookAttributes }[]
  }
  contentHtml: string
  commandPalette?: Pick<CommandPaletteProps, 'entries'>
  activity?: ActivityDrawerProps
  reconcile?: ReconcileBannerProps
  /** Attributes on the shell root, such as data-account or data-uid. */
  hooks?: HookAttributes
}

const SEARCH_LABELS: Readonly<Record<V2Surface, string>> = {
  xpanel: msgid('Find a tool, domain or mailbox'),
  xwhm: msgctxt('theme:v2', 'Search accounts and settings'),
  xmail: msgctxt('shell', 'Find a page'),
}

interface RenderedNavigation {
  /** The navigation landmark's content: the section menu of the sidebar (and of the phone drawer). */
  readonly sections: string
  /** The tab row with the pages of the current section; empty when the route belongs to no section. */
  readonly navbar: string
}
interface CachedSidebarEntry {
  readonly closedSections: readonly string[]
  readonly closedJoined: string
  readonly byCurrent: Map<string, RenderedNavigation>
}
type NavigationSections = NonNullable<ReturnType<typeof visibleNavigation>[number]>['sections']
const SIDEBAR_SECTIONS_CACHE = new Map<string, CachedSidebarEntry>()
const CHEV_RIGHT_HTML = icon('chevRight', 14).replace('class="v2-icon', 'class="v2-icon v2-nav__chev')
const NO_NAVIGATION: RenderedNavigation = { sections: '', navbar: '' }

// Complete literal class lists: the stylesheet build only keeps utilities it can read as whole tokens.
const TAB = 'kt-menu-item border-b-2 border-b-transparent'
const TAB_HERE = 'kt-menu-item border-b-2 border-b-mono'
const TAB_TITLE = 'kt-menu-title text-nowrap text-sm text-foreground hover:text-mono'
const TAB_TITLE_HERE = 'kt-menu-title text-nowrap text-sm text-mono font-medium'
const ICON_BUTTON = 'kt-btn kt-btn-ghost kt-btn-icon size-9 rounded-full hover:[&_i]:text-primary'
const BRAND_MARK = 'v2-brand__mark flex items-center justify-center shrink-0 size-[30px] rounded-md bg-primary text-primary-foreground font-mono text-base font-bold leading-none'
const BRAND_NAME = 'v2-brand__name text-base font-medium truncate'
const CTX_MARK = 'flex items-center justify-center shrink-0 size-7 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase'
const AVATAR = 'v2-account__avatar flex items-center justify-center shrink-0 size-[34px] rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold uppercase'

/** One page of a section in the vertical menu; the hooks stay on the link and the section item. */
const pageItem = (route: string, label: string, here: boolean): string =>
  `<li class="kt-menu-item"><a class="kt-menu-link px-2.5 py-1.5" href="${escapeHtml(route)}" data-nav-route="${escapeHtml(route)}"${here ? ' aria-current="page"' : ''}><span class="kt-menu-title">${escapeHtml(label)}</span></a></li>`
const sectionItem = (id: string, glyph: string, name: string, pagesHtml: string, open: boolean): string =>
  `<li class="kt-menu-item" data-nav-section="${escapeHtml(id)}"><details${open ? ' open' : ''}><summary class="kt-menu-link gap-2.5 px-2.5 py-1.5"><span class="kt-menu-icon">${icon(catalogIcon(glyph))}</span><span class="kt-menu-title">${escapeHtml(name)}</span><span class="kt-menu-arrow">${CHEV_RIGHT_HTML}</span></summary><ul class="kt-menu flex-col" aria-label="${escapeHtml(name)}">${pagesHtml}</ul></details></li>`

function sectionTabs(locale: Translate['locale'], surface: V2Surface, section: NavigationSections[number], current: string): string {
  const name = catalogText(locale, `nav.section.${surface}.${section.id}.name`, section.name)
  const tabs = section.pages.map(page => {
    const here = page.route === current
    const label = catalogText(locale, `nav.page.${surface}.${page.id}.name`, page.name)
    return `<li class="${here ? TAB_HERE : TAB}"><a class="kt-menu-link" href="${escapeHtml(page.route)}"${here ? ' aria-current="page"' : ''}><span class="${here ? TAB_TITLE_HERE : TAB_TITLE}">${escapeHtml(label)}</span></a></li>`
  }).join('')
  return `<nav class="v2-navbar bg-muted" aria-label="${escapeHtml(name)}"><div class="v2-navbar__frame rounded-t-xl border border-input bg-background flex items-stretch grow"><div class="kt-container-fluid flex items-stretch"><div class="grid items-stretch"><div class="kt-scrollable-x-auto flex items-stretch"><ul class="kt-menu gap-5 lg:gap-7.5">${tabs}</ul></div></div></div></div></nav>`
}

function sidebarSectionsHtml(locale: Translate['locale'], surface: V2Surface, sectionsList: NavigationSections, current: string): RenderedNavigation {
  if (sectionsList.length === 0) return NO_NAVIGATION
  let sig = `${locale}\x1f${surface}`
  for (const s of sectionsList) {
    sig += `\x1e${s.id}\x1d${s.name}\x1d${s.icon}`
    for (const p of s.pages) sig += `\x1c${p.id}\x1b${p.route}\x1b${p.name}`
  }
  let entry = SIDEBAR_SECTIONS_CACHE.get(sig)
  if (!entry) {
    const closedSections = sectionsList.map(section => {
      const name = catalogText(locale, `nav.section.${surface}.${section.id}.name`, section.name)
      const pages = section.pages.map(page => {
        const label = catalogText(locale, `nav.page.${surface}.${page.id}.name`, page.name)
        return pageItem(page.route, label, false)
      }).join('')
      return sectionItem(section.id, section.icon, name, pages, false)
    })
    entry = { closedSections, closedJoined: closedSections.join(''), byCurrent: new Map() }
    if (SIDEBAR_SECTIONS_CACHE.size >= 64) SIDEBAR_SECTIONS_CACHE.clear()
    SIDEBAR_SECTIONS_CACHE.set(sig, entry)
  }
  const cached = entry
  const hit = cached.byCurrent.get(current)
  if (hit !== undefined) return hit
  const active = sectionsList.find(section => section.pages.some(page => page.route === current))
  const rendered: RenderedNavigation = active === undefined
    ? { sections: cached.closedJoined, navbar: '' }
    : {
        sections: sectionsList.map((section, idx) => {
          if (section !== active) return cached.closedSections[idx]!
          const name = catalogText(locale, `nav.section.${surface}.${section.id}.name`, section.name)
          const pages = section.pages.map(page => {
            const here = page.route === current
            const label = catalogText(locale, `nav.page.${surface}.${page.id}.name`, page.name)
            return pageItem(page.route, label, here)
          }).join('')
          return sectionItem(section.id, section.icon, name, pages, true)
        }).join(''),
        navbar: sectionTabs(locale, surface, active, current),
      }
  if (cached.byCurrent.size >= 256) cached.byCurrent.clear()
  cached.byCurrent.set(current, rendered)
  return rendered
}

/** The authorized catalog navigation of the surface: the sidebar menu and the current section's tab row. */
function catalogNavigation(t: Translate, props: V2ShellProps): RenderedNavigation {
  const locale = t.locale
  const current = canonicalNavigationRoute(props.activeRoute)
  // Account documents remain reachable while their native tools are unqualified.
  const navigation = props.surface === 'xpanel'
    ? visibleRegisteredNavigation(props.visibility)
    : visibleNavigation(props.visibility, props.catalog)
  const nav = navigation.find(item => item.surface === props.surface)
  const rendered = sidebarSectionsHtml(locale, props.surface, nav?.sections ?? [], current)
  const empty = rendered.sections ? '' : `<p class="v2-nav__empty" data-navigation-empty="true">${icon('info', 16)}<span>${escapeHtml(t('These tools are not available on this server yet.'))}</span></p>`
  const favoritesLabel = escapeHtml(t('Favorites'))
  const favorites = props.surface === 'xwhm' ? `<div class="v2-nav v2-nav--favorites" data-whm-favorites-nav hidden><h2 class="v2-nav__label">${icon('star', 16)}<span>${favoritesLabel}</span></h2><ul class="kt-menu flex-col" aria-label="${favoritesLabel}"></ul></div>` : ''
  return { sections: `${favorites}<nav class="v2-nav" aria-label="${escapeHtml(t('Hosting tools'))}">${empty}<ul class="kt-menu flex-col">${rendered.sections}</ul></nav>`, navbar: rendered.navbar }
}

function contextCard(context: NavContext): string {
  const mark = context.initial
    ? `<span class="v2-ctx__avatar ${CTX_MARK}" aria-hidden="true">${escapeHtml(context.initial)}</span>`
    : `<span class="v2-ctx__tile ${CTX_MARK} min-[960px]:hidden" aria-hidden="true">${icon('server', 16)}</span>`
  const status = context.status ? `<span class="v2-ctx__status v2-ctx__status--${context.status.tone} inline-flex items-center gap-1.5 shrink-0 text-xs font-medium whitespace-nowrap"><span aria-hidden="true"></span>${escapeHtml(context.status.label)}</span>` : ''
  const meters = (context.meters ?? []).map(m => `<div class="v2-ctx__meter"><div><span>${escapeHtml(m.label)}</span><span class="v2-num">${escapeHtml(m.valueText)}</span></div><div class="v2-ctx__bar" aria-hidden="true"><span class="v2-ctx__fill v2-ctx__fill--${m.tone ?? 'info'}" style="inline-size:${Math.min(100, Math.max(0, m.percent ?? 0))}%"></span></div></div>`).join('')
  const meta = context.meta?.length ? `<div class="v2-ctx__meta v2-num flex gap-2 shrink-0 text-2xs text-muted-foreground whitespace-nowrap">${context.meta.map(item => `<bdi dir="ltr">${escapeHtml(item)}</bdi>`).join('')}</div>` : ''
  return `<section class="v2-ctx" aria-label="${escapeHtml(context.label)}"><div class="v2-ctx__id flex items-center gap-2 min-w-0">${mark}<div class="v2-ctx__text"><span class="v2-ctx__title flex items-center gap-1.5 min-w-0 text-sm font-medium text-mono" title="${escapeHtml(context.title)}"><bdi class="v2-mono v2-ctx__name truncate" dir="ltr">${escapeHtml(context.title)}</bdi>${context.badge ? `<span class="v2-ctx__badge kt-badge kt-badge-stroke kt-badge-sm shrink-0">${escapeHtml(context.badge)}</span>` : ''}</span>${context.detail ? `<bdi class="v2-ctx__detail v2-mono truncate text-2sm text-muted-foreground" dir="ltr" title="${escapeHtml(context.detail)}">${escapeHtml(context.detail)}</bdi>` : ''}${status}</div></div>${meters}${meta}</section>`
}

/** The navigation landmark. Wide screens: its head sits in the header (logo, product, toggle, context) and its
 *  body is the sidebar under it, which the toggle hides and shows. Phones: the whole element is the slide-in drawer. */
function sidebar(t: Translate, props: V2ShellProps, navigationHtml: string): string {
  const product = brandingProductName(props.branding, PRODUCT[props.surface])
  const subtitle = props.surface === 'xwhm' ? `<span class="v2-brand__sub text-2xs text-muted-foreground whitespace-nowrap">${escapeHtml(t('Server administration'))}</span>` : ''
  const toggle = escapeHtml(t('Toggle sidebar'))
  const context = props.context ? `<span class="v2-side__sep shrink-0 px-2.5 font-medium text-muted-foreground" aria-hidden="true">/</span>${contextCard(props.context)}` : ''
  const controls = props.contextControlHtml ? `<div class="v2-ctx__controls">${props.contextControlHtml}</div>` : ''
  return `<aside class="v2-side" id="xp-sidebar" data-xp-sidebar tabindex="-1" aria-label="${escapeHtml(`${product} ${t('navigation')}`)}">
<div class="v2-side__top"><a class="v2-brand flex items-center shrink-0 min-w-0 max-w-full text-secondary-foreground hover:text-mono" href="${escapeHtml(props.homeHref)}"><span class="${BRAND_MARK} ms-5 me-3" aria-hidden="true">x</span><span class="v2-brand__text flex flex-col min-w-0 leading-tight"><span class="${BRAND_NAME}">${escapeHtml(product)}</span>${subtitle}</span></a><button type="button" class="v2-side__collapse kt-btn kt-btn-ghost kt-btn-icon kt-btn-sm" data-action="toggle-sidebar-collapse" aria-controls="xp-sidebar" aria-expanded="true" aria-label="${toggle}" title="${toggle}"><i class="v2-icon ki-filled ki-black-left-line text-base leading-none v2-flip" aria-hidden="true"></i></button>${context}${controls}<button type="button" class="v2-side__close kt-btn kt-btn-ghost kt-btn-icon kt-btn-sm" data-action="close-mobile-nav" aria-controls="xp-sidebar" aria-label="${escapeHtml(t(msgctxt('shell', 'Close navigation')))}">${icon('x', 16)}</button></div>
<div class="v2-side__body">${navigationHtml}</div>
</aside>`
}

function liveIndicator(t: Translate, enabled: boolean): string {
  // The runtime sets data-ws-indicator; each label shows for its state, so no markup update is needed.
  const off = t('Live updates off')
  return `<span class="v2-live kt-badge kt-badge-stroke rounded-full" data-ws-indicator="${enabled ? 'disconnected' : 'unavailable'}" role="status"${enabled ? '' : ` aria-label="${escapeHtml(off)}" title="${escapeHtml(off)}"`}><span class="v2-live__dot" aria-hidden="true"></span><span class="v2-live__label" data-ws-label="connected">${escapeHtml(t(msgctxt('ws-client', 'Live')))}</span><span class="v2-live__label" data-ws-label="disconnected">${escapeHtml(t('Connecting'))}</span><span class="v2-live__label" data-ws-label="unavailable">${escapeHtml(off)}</span></span>`
}

function accountMenu(t: Translate, props: V2ShellProps): string {
  const { account } = props
  const name = account.signedIn && account.username ? account.username : t('Account')
  const initial = (account.username?.trim().charAt(0) || name.charAt(0)).toLocaleLowerCase('en')
  const avatar = `<span class="${AVATAR}" data-initial="${escapeHtml(initial)}" aria-hidden="true"></span>`
  const who = `<span${account.username ? ' dir="ltr"' : ''}>${escapeHtml(name)}</span>${account.roleLabel ? ` <span>${escapeHtml(account.roleLabel)}</span>` : ''}`
  const links = [
    ...(account.securityHref ? [`<a class="v2-menu__item kt-dropdown-menu-link" href="${escapeHtml(account.securityHref)}" data-security-link="true">${icon('shield', 16)}${escapeHtml(t('Security'))}</a>`] : []),
    ...(account.links ?? []).map(link => `<a class="v2-menu__item kt-dropdown-menu-link" href="${escapeHtml(link.href)}"${hookAttrs(link.hooks)}>${icon('gear', 16)}${escapeHtml(link.label)}</a>`),
  ].join('')
  const session = account.signedIn
    ? `<div class="v2-account__signout px-2.5 pt-1.5 pb-1"><button type="button" class="v2-menu__item v2-menu__item--danger kt-btn kt-btn-outline justify-center w-full" data-action="logout">${escapeHtml(t('Sign out'))}</button></div>`
    : account.signInHref ? `<a class="v2-menu__item kt-dropdown-menu-link" href="${escapeHtml(account.signInHref)}">${escapeHtml(t('Sign in'))}</a>` : ''
  const timezoneOptions = [['UTC', t('Server time (UTC)')], ['local', t('Browser local time')], ['Africa/Cairo', 'Africa/Cairo'], ['Asia/Amman', 'Asia/Amman'], ['Asia/Gaza', 'Asia/Gaza'], ['Asia/Riyadh', 'Asia/Riyadh'], ['Asia/Dubai', 'Asia/Dubai'], ['Europe/London', 'Europe/London'], ['Europe/Berlin', 'Europe/Berlin'], ['America/New_York', 'America/New_York'], ['America/Chicago', 'America/Chicago'], ['America/Los_Angeles', 'America/Los_Angeles'], ['Asia/Tokyo', 'Asia/Tokyo'], ['Australia/Sydney', 'Australia/Sydney']] as const
  const timezoneChoice = !account.signedIn ? '' : `<div class="v2-tz flex flex-col gap-1.5 px-2.5 py-1.5"><label class="kt-form-label" for="v2-user-tz">${escapeHtml(t('Time zone'))}</label><select class="kt-select kt-select-sm" id="v2-user-tz" data-user-timezone-select>${timezoneOptions.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('')}</select></div>`
  const interfaceChoice = !account.signedIn ? '' : `<section class="v2-ui-theme flex flex-col gap-2 px-2.5 py-1.5 break-words" data-ui-theme-preferences data-ui-theme-can-read="true" hidden><form class="flex flex-col gap-2" data-ui-theme-form hidden><label class="flex flex-col gap-1.5" for="v2-ui-theme-choice"><span class="kt-form-label">${escapeHtml(t(msgctxt('theme:v2', 'Interface theme')))}</span><select class="kt-select kt-select-sm" id="v2-ui-theme-choice" name="uiTheme" data-ui-theme-choice disabled><option value="classic">${escapeHtml(t('Classic'))}</option><option value="v2">V2</option></select></label><button class="kt-btn kt-btn-primary kt-btn-sm" type="submit" data-ui-theme-save disabled>${escapeHtml(t('Save'))}</button></form><p data-ui-theme-status role="status" aria-live="polite" hidden></p><button class="kt-btn kt-btn-outline kt-btn-sm" type="button" data-ui-theme-reload disabled hidden>${escapeHtml(t('Reload'))}</button></section>`
  const identity = `<div class="v2-account__head flex items-center gap-2.5 px-2.5 py-1.5">${avatar}<span class="v2-account__who flex flex-col min-w-0 leading-tight">${who}</span></div><div class="kt-dropdown-menu-separator"></div>`
  return `<details class="v2-account" data-user-menu><summary class="v2-account__summary kt-btn kt-btn-ghost kt-btn-icon size-9 rounded-full" aria-label="${escapeHtml(`${t('User menu for')} ${name}${account.roleLabel ? ` ${account.roleLabel}` : ''}`)}">${avatar}<span class="v2-account__id v2-sr">${who}</span></summary><div class="v2-account__panel kt-dropdown-menu open">${identity}${links}${timezoneChoice}${interfaceChoice}${session}</div></details>`
}

function topbar(t: Translate, props: V2ShellProps): string {
  const searchLabel = t(SEARCH_LABELS[props.surface])
  const product = escapeHtml(brandingProductName(props.branding, PRODUCT[props.surface]))
  const server = props.server
    ? `<span class="v2-server v2-num kt-badge kt-badge-stroke rounded-full" title="${escapeHtml(props.server.name)}"${attr('data-generation-chip', props.server.generationId)}><span class="v2-server__dot v2-server__dot--${props.server.tone ?? 'ok'}" aria-hidden="true"></span><span class="v2-mono">${escapeHtml(props.server.name)}</span>${props.server.generationId === undefined ? '' : `<span class="v2-muted">${escapeHtml(t(msgctxt('theme:v2', 'gen {generation}'), { generation: props.server.generationId }))}</span>`}</span>` : ''
  const languages = props.languages.map(language => `<a class="v2-top__lang kt-btn kt-btn-ghost" href="${escapeHtml(language.href)}" lang="${language.tag}" hreflang="${language.tag}" data-lang-switch="${language.tag}">${icon('language', 16)}<span>${escapeHtml(localeInfo(language.tag).nativeName)}</span></a>`).join('')
  const next = props.scheme.current === 'dark' ? 'light' : 'dark'
  const schemeLabel = next === 'dark' ? t('Dark theme') : t('Light theme')
  const scheme = `<a class="v2-top__scheme ${ICON_BUTTON}" href="${escapeHtml(props.scheme.toggleHref)}" data-theme-toggle="${next}" aria-label="${escapeHtml(schemeLabel)}" title="${escapeHtml(schemeLabel)}">${icon(next === 'dark' ? 'moon' : 'sun')}</a>`
  const bell = activityControl(t, { available: false })
  const whmBell = props.surface === 'xwhm' ? `<a class="v2-top__bell ${ICON_BUTTON}" href="/whm#whm-inbox-heading" data-whm-bell data-unread="false" aria-label="${escapeHtml(t('Notifications'))}">${icon('bell')}<span class="v2-top__count v2-num kt-badge kt-badge-destructive kt-badge-xs rounded-full" data-whm-bell-count aria-hidden="true" hidden></span></a>` : ''
  return `<header class="v2-top bg-muted" role="banner">
<button type="button" class="v2-top__menu kt-btn kt-btn-ghost kt-btn-icon" data-action="toggle-mobile-nav" aria-controls="xp-sidebar" aria-expanded="false" aria-label="${escapeHtml(t('Menu'))}">${icon('menu')}</button>
<a class="v2-top__brand flex items-center shrink-0 min-w-0 text-secondary-foreground hover:text-mono" href="${escapeHtml(props.homeHref)}"><span class="${BRAND_MARK} ms-1 me-2.5" aria-hidden="true">x</span><span class="${BRAND_NAME}">${product}</span></a>
<details class="v2-tools" open data-xp-toolbar-options><summary class="v2-tools__toggle kt-btn kt-btn-outline kt-btn-sm">${escapeHtml(t('Search & account'))}</summary><div class="v2-tools__content">
${props.searchHtml ?? `<button type="button" class="v2-search" data-action="open-cmdk" aria-keyshortcuts="Control+K Meta+K">${icon('search', 16)}<span>${escapeHtml(searchLabel)}</span> <kbd class="kt-kbd kt-kbd-sm">Ctrl K</kbd></button>`}
${liveIndicator(t, props.realtimeEnabled)}${server}${languages}${scheme}${bell}${whmBell}${accountMenu(t, props)}
</div></details>
</header>`
}

/** The complete v2 shell for one surface; `contentHtml` is the page body (page header, cards, tables).
 *  Like every kit function with built-in text, it takes the page translator first. */
export function renderV2Shell(t: Translate, props: V2ShellProps): string {
  const actorScope = props.account.signedIn && props.account.username
    ? `${props.surface}:${props.account.username}${props.hooks?.['data-uid'] !== undefined ? `:${String(props.hooks['data-uid'])}` : ''}`
    : ''
  // A surface with its own navigation (mailbox folders) fills the same sidebar and has no section tab row.
  const navigation: RenderedNavigation = props.sidebarHtml === undefined ? catalogNavigation(t, props) : { sections: props.sidebarHtml, navbar: '' }
  const footer = props.footerLinks?.length
    ? `<footer class="v2-foot py-3"><nav class="v2-foot__links flex flex-wrap justify-center md:justify-end gap-4 py-2 text-sm text-secondary-foreground">${props.footerLinks.map(link => `<a class="inline-flex items-center gap-1.5 hover:text-primary" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}${link.external ? icon('external', 14) : ''}</a>`).join('')}</nav></footer>` : ''
  return `<div class="v2-shell" data-xp-activity-shell data-surface="${props.surface}" data-shell-nav="${props.sidebarHtml === undefined ? 'catalog' : 'surface'}"${actorScope ? ` data-session-actor="${escapeHtml(actorScope)}"` : ''}${hookAttrs(props.hooks)}>
<a class="v2-skip kt-btn kt-btn-primary" href="#main-content">${escapeHtml(t('Skip to content'))}</a>
${sidebar(t, props, navigation.sections)}
<button type="button" class="v2-backdrop" data-action="close-mobile-nav" data-xp-nav-backdrop hidden tabindex="-1" aria-label="${escapeHtml(t(msgctxt('shell', 'Close navigation')))}"></button>
<div class="v2-work" data-xp-shell-content>
${topbar(t, props)}
${navigation.navbar}
<div class="v2-content flex flex-col grow min-w-0 bg-background"><main id="main-content" class="v2-main" tabindex="-1"><div class="v2-page">${props.reconcile ? reconcileBanner(t, props.reconcile) : ''}${props.contentHtml}</div></main>${footer}</div>
</div>
${toastRegion(t)}
<aside id="xp-ops-dock" class="v2-ops-dock" data-xp-ops-dock role="region" aria-label="${escapeHtml(t('Activity & Jobs'))}" hidden></aside>
${props.commandPalette ? commandPalette(t, { surface: props.surface, entries: props.commandPalette.entries }) : ''}
${props.activity ? activityDrawer(t, props.activity) : ''}
</div>`
}

// Structure only: colors, borders, radii and type come from the Metronic classes in the markup. The runtime's
// phone breakpoint is 960px (mobile-navigation-client), so the layout switches there and not at Tailwind's `lg`.
// The Keenicons stylesheet is unlayered and Metronic components sit above the v2 layer, so hiding an icon or a
// `kt-*` element from here needs !important.
const WIDE = '@media(min-width:960px)'
const PHONE = '@media(max-width:959px)'
const SR = 'position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap'
const COLLAPSED = '.v2-shell[data-sidebar-collapsed="true"]'
// The slide runs only right after the toggle was pressed, never while a page loads with the menu already hidden.
const TOGGLING = '.v2-shell:has(.v2-side__collapse:focus)'

export const SHELL_CSS = `[data-ui-theme="v2"] body:has(>.v2-shell){display:flex;flex-direction:column;min-block-size:100dvh}
[data-ui-theme="v2"] body:has(>.v2-shell)>.v2-shell{min-block-size:0}
.v2-shell{--v2-header:58px;--v2-rail:280px;--v2-col:var(--v2-rail);--v2-navbar:56px;--v2-gutter:20px;--v2-strip:min(42vw,640px);flex:1 0 auto;display:flex;flex-direction:column;min-inline-size:0;min-block-size:100dvh}
.v2-shell summary{list-style:none;cursor:pointer}
.v2-shell summary::-webkit-details-marker{display:none}
.v2-work{display:contents}
.v2-skip{position:fixed;inset-inline-start:var(--space-1);inset-block-start:-100px;z-index:100}
.v2-skip:focus{inset-block-start:var(--space-1)}
.v2-side{outline:none}
.v2-ctx,.v2-ctx__text{display:flex;min-inline-size:0}
.v2-ctx__detail{flex:0 4 auto}
.v2-ctx__status{color:var(--ok)}
.v2-ctx__status>span{inline-size:6px;block-size:6px;border-radius:50%;background:currentColor}
.v2-ctx__status--warn{color:var(--warn)}.v2-ctx__status--bad{color:var(--bad)}.v2-ctx__status--info{color:var(--accent)}.v2-ctx__status--neutral{color:var(--text-2)}
.v2-ctx__meter{flex:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--text-2);white-space:nowrap}
.v2-ctx__meter>div:first-child{display:flex;justify-content:space-between;gap:var(--space-1)}
.v2-ctx__bar{block-size:4px;border-radius:var(--radius-pill);background:var(--sunken);overflow:hidden}
.v2-ctx__fill{display:block;block-size:100%;background:var(--accent-fill)}
.v2-ctx__fill--warn{background:var(--warn)}.v2-ctx__fill--bad{background:var(--bad)}.v2-ctx__fill--ok{background:var(--ok)}
.v2-side__body{display:flex;flex-direction:column;gap:12px;min-block-size:0;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent}
.v2-nav ul{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.v2-nav summary,.v2-nav details a,.v2-nav--favorites a{display:flex;align-items:center;gap:10px;min-block-size:var(--target);padding:6px 10px;border:1px solid transparent;border-radius:var(--radius-control);color:var(--text);font-size:13px;font-weight:500;line-height:1.25;text-decoration:none}
.v2-nav summary{font-size:14px}
.v2-nav summary .v2-icon{color:var(--muted)}
.v2-nav summary:hover,.v2-nav summary:hover .v2-icon,.v2-nav details a:hover,.v2-nav--favorites a:hover,.v2-nav details:has([aria-current="page"])>summary .kt-menu-icon>.v2-icon{color:var(--accent)}
.v2-nav details[open]>summary{color:var(--nav-strong)}
.v2-nav details[open]>summary .v2-nav__chev{transform:rotate(90deg)}
.v2-nav details[open]>summary .v2-nav__chev:dir(rtl){transform:scaleX(-1) rotate(90deg)}
.v2-nav details>ul{margin-inline-start:18px;padding-block:2px 6px;padding-inline-start:12px;border-inline-start:1px solid var(--line-strong)}
.v2-nav details a[aria-current="page"]{background:var(--bg);border-color:var(--line-strong);color:var(--accent);font-weight:600}
.v2-nav__label,.v2-nav__empty{display:flex;align-items:center;gap:var(--space-1);padding:6px 10px;font-size:12px;font-weight:500;color:var(--muted)}
.v2-nav__empty{align-items:flex-start}
.v2-backdrop{position:fixed;inset:0;z-index:60;border:0;background:var(--scrim);backdrop-filter:blur(4px)}
.v2-top{flex:none;position:sticky;inset-block-start:0;z-index:30;display:flex;align-items:center;gap:var(--space-1);block-size:var(--v2-header);padding-inline:var(--space-2)}
.v2-tools{flex:1 1 auto;min-inline-size:0}
.v2-tools__content{display:flex;align-items:center;justify-content:flex-end;gap:var(--space-1)}
.v2-search{flex:0 1 240px;min-width:0;display:flex;align-items:center;gap:var(--space-1);block-size:var(--target);padding-inline:10px 6px;border:1px solid var(--line-strong);border-radius:var(--radius-control);background:var(--bg);color:var(--muted);font-size:13px;text-align:start;cursor:pointer}
.v2-search:hover:not(:disabled){color:var(--text)}
.v2-search:disabled{opacity:.6;cursor:not-allowed}
.v2-search>span{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v2-live__dot,.v2-server__dot{flex:none;inline-size:6px;block-size:6px;border-radius:50%;background:var(--ok)}
.v2-live__dot{background:none;box-shadow:inset 0 0 0 1.5px var(--muted)}
.v2-live__label{display:none}
.v2-live[data-ws-indicator=disconnected] [data-ws-label=disconnected],.v2-live[data-ws-indicator=connected] [data-ws-label=connected],.v2-live[data-ws-indicator=unavailable] [data-ws-label=unavailable]{display:inline}
.v2-live[data-ws-indicator=connected] .v2-live__dot{background:var(--ok);box-shadow:none;animation:v2-pulse 2.2s ease-in-out infinite}
.v2-live[data-ws-indicator=disconnected] .v2-live__dot{background:var(--warn);box-shadow:none}
.v2-server{min-inline-size:0}
.v2-server>.v2-mono{min-inline-size:0;max-inline-size:24ch;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.v2-server__dot--warn{background:var(--warn)}.v2-server__dot--bad{background:var(--bad)}.v2-server__dot--info{background:var(--accent)}.v2-server__dot--neutral{background:var(--muted)}
.v2-top__bell,.v2-top__activity,.v2-account{position:relative}
.v2-top__activity[data-xp-activity-control="unavailable"]{display:none!important}
.v2-top__badge,.v2-top__count{position:absolute;inset-block-start:-2px;inset-inline-end:-2px}
.v2-account__avatar::before{content:attr(data-initial)}
.v2-account__panel{position:absolute;z-index:40;inset-inline-end:0;inset-block-start:calc(100% + var(--space-1));inline-size:max-content;min-inline-size:240px;max-inline-size:min(320px,calc(100vw - 2*var(--space-2)))}
.v2-account__who>:first-child{overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:600;color:var(--nav-strong)}
.v2-account__who>:nth-child(2){font-size:12px;color:var(--muted)}
.v2-navbar{flex:none;display:flex;align-items:stretch;block-size:var(--v2-navbar);margin-inline:var(--space-1)}
.v2-navbar a{outline-offset:-2px}
.v2-content{margin:0 var(--space-1) var(--space-1);border:1px solid var(--line-strong);border-radius:var(--radius-card)}
.v2-navbar+.v2-content{border-block-start-width:0;border-start-start-radius:0;border-start-end-radius:0}
.v2-main{flex:1 1 auto;min-inline-size:0;outline:none}
.v2-page{display:flex;flex-direction:column;gap:var(--space-3);inline-size:100%;padding:var(--space-3) var(--space-2) var(--space-4)}
.v2-foot{padding-inline:var(--space-2)}
${WIDE}{
.v2-shell{display:grid;grid-template-columns:var(--v2-col) minmax(0,1fr);grid-template-rows:var(--v2-header) auto minmax(0,1fr)}
.v2-top{grid-column:1/-1;grid-row:1;padding-inline:var(--v2-strip) var(--v2-gutter)}
.v2-top__menu,.v2-top__brand,.v2-tools>summary,.v2-side__close{display:none!important}
.v2-side{grid-column:1;grid-row:2/4;position:sticky;inset-block-start:var(--v2-header);z-index:40;align-self:start;display:flex;flex-direction:column;max-block-size:calc(100dvh - var(--v2-header))}
.v2-side__top{position:absolute;inset-block-end:100%;inset-inline-start:0;display:flex;align-items:center;block-size:var(--v2-header);inline-size:max-content;max-inline-size:calc(var(--v2-strip) - var(--space-2))}
.v2-side__collapse{flex:none;margin-inline-start:var(--space-1)}
.v2-ctx,.v2-ctx__text{align-items:center;gap:10px}
.v2-ctx__bar{display:none}
.v2-ctx__name{max-inline-size:34ch}
.v2-ctx__detail{max-inline-size:26ch}
.v2-ctx__meter{flex-direction:row}
.v2-ctx__controls{flex:none;margin-inline-start:10px}
.v2-side__body{flex:0 1 auto;align-self:flex-start;inline-size:var(--v2-rail);padding-block:2px var(--v2-gutter);padding-inline:var(--v2-gutter) 12px}
.v2-navbar{grid-column:2;grid-row:2;position:sticky;inset-block-start:var(--v2-header);z-index:20;margin-inline:0 var(--v2-gutter)}
.v2-content{grid-column:2;grid-row:3;margin:0;margin-inline-end:var(--v2-gutter);margin-block-end:var(--v2-gutter)}
.v2-page,.v2-foot{padding-inline:var(--space-3)}
.v2-shell:not([data-sidebar-collapsed="true"]) .v2-navbar{display:none}
.v2-shell:not([data-sidebar-collapsed="true"]) .v2-content{border-block-start-width:1px;border-radius:var(--radius-card)}
${COLLAPSED}{--v2-col:var(--v2-gutter)}
[data-ui-theme="v2"]:has(${COLLAPSED} .v2-navbar){scroll-padding-block-start:var(--v2-navbar,56px)}
${COLLAPSED}>.v2-side{pointer-events:none}
${COLLAPSED}>.v2-side>.v2-side__top{pointer-events:auto}
${COLLAPSED}>.v2-side>.v2-side__body{margin-inline-start:calc(-1*var(--v2-rail));opacity:0;visibility:hidden}
${COLLAPSED} .v2-side__collapse>i{transform:rotate(180deg)}
${COLLAPSED} .v2-side__collapse>i:dir(rtl){transform:none}
${TOGGLING}{transition:grid-template-columns .2s ease-out}
${TOGGLING} .v2-side__body{transition:margin .2s ease-out,opacity .2s ease-out,visibility 0s}
${TOGGLING}[data-sidebar-collapsed="true"] .v2-side__body{transition-delay:0s,0s,.2s}
}
@media(min-width:960px) and (max-width:1279px){.v2-live__label,.v2-top__lang>span{${SR}}.v2-search>span{display:none}.v2-search{flex:none}}
@media(min-width:960px) and (max-width:1535px){.v2-ctx__detail,.v2-ctx__meta,.v2-ctx__meter{display:none}}
@media(min-width:960px) and (max-width:1679px){.v2-server>.v2-mono{display:none}}
@media(min-width:1280px){.v2-page,.v2-foot{padding-inline:var(--space-4)}}
${PHONE}{
.v2-side{position:fixed;inset-block:0;inset-inline-start:0;z-index:70;display:flex;flex-direction:column;inline-size:min(300px,88vw);block-size:100dvh;background:var(--sunken);border-inline-end:1px solid var(--line-strong);box-shadow:var(--v2-elev);visibility:hidden;pointer-events:none;overscroll-behavior:contain}
.v2-shell[data-mobile-nav="open"]>.v2-side,.v2-side[aria-modal="true"]{visibility:visible;pointer-events:auto}
.v2-side__top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:10px 0;padding-block:12px;padding-inline-end:12px;border-block-end:1px solid var(--line-strong)}
.v2-side__top>.v2-brand{flex:1 1 0}
.v2-side__sep,.v2-side__collapse{display:none!important}
.v2-side__close{order:2}
.v2-ctx{order:3;flex:1 1 100%;flex-direction:column;gap:10px;margin-inline-start:12px;padding:12px;border:1px solid var(--line-strong);border-radius:var(--radius-notice);background:var(--bg)}
.v2-ctx__text{flex:1 1 auto;flex-direction:column;gap:2px}
.v2-ctx__title{flex-wrap:wrap}
.v2-ctx__controls{order:4;flex:1 1 100%;margin-inline-start:12px}
.v2-side__body{flex:1 1 auto;padding:12px}
.v2-top__menu{margin-inline-start:-6px}
.v2-tools{text-align:end}
.v2-tools__content{position:absolute;inset-inline:0;inset-block-start:100%;flex-wrap:wrap;justify-content:flex-start;padding:12px var(--space-2);background:var(--bg);border-block-end:1px solid var(--line);box-shadow:var(--v2-elev);text-align:start}
.v2-tools__content>:first-child{flex:1 1 100%;max-inline-size:none}
.v2-tools:not([data-mobile-ready])>.v2-tools__content{display:none}
.v2-tools[open]>summary::after{content:"";position:fixed;inset:0;z-index:-1}
}
@media(max-width:600px){.v2-account{position:static}.v2-account__panel{inset-inline:var(--space-2);inset-block-start:auto;inline-size:auto;max-inline-size:none}}
@media(prefers-reduced-motion:reduce){${TOGGLING},${TOGGLING} .v2-side__body{transition:none}}
`
