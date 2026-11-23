import { brandingProductName } from '../../../branding.ts'
import { publicContactEmail } from '../../../display-name.ts'
import { alternateLocales } from '../../../i18n.ts'
import { statusPageCopy } from '../../../models/status-page.ts'
import type { StatusPageModel, ThemeViewProps } from '../../contract.ts'
import { escapeHtml } from '../html.ts'
import { icon } from '../icons.ts'
import { v2Messages } from '../messages.ts'
import { renderV2Shell } from '../shell/shell.ts'

const PRODUCTS = { xpanel: 'xPanel', xwhm: 'xWHM', xmail: 'xMail' } as const
const HOMES = { xpanel: '/home', xwhm: '/whm', xmail: '/mail/inbox' } as const
// Complete literal class lists: the soft circle and the status badge of each tone, and the glyph of each status.
const TONE = {
  primary: { circle: 'flex items-center justify-center size-20 mb-7.5 rounded-full bg-primary/10 text-primary', badge: 'kt-badge kt-badge-primary kt-badge-outline mb-3' },
  warning: { circle: 'flex items-center justify-center size-20 mb-7.5 rounded-full bg-yellow-500/10 text-yellow-500', badge: 'kt-badge kt-badge-warning kt-badge-outline mb-3' },
  destructive: { circle: 'flex items-center justify-center size-20 mb-7.5 rounded-full bg-destructive/10 text-destructive', badge: 'kt-badge kt-badge-destructive kt-badge-outline mb-3' },
} as const
const LOOK: Readonly<Record<number, { tone: keyof typeof TONE; glyph: string }>> = {
  400: { tone: 'primary', glyph: 'ki-filled ki-question-2 text-4xl' },
  403: { tone: 'warning', glyph: 'ki-filled ki-lock text-4xl' },
  404: { tone: 'primary', glyph: 'ki-filled ki-search-list text-4xl' },
  421: { tone: 'warning', glyph: 'ki-filled ki-disconnect text-4xl' },
  500: { tone: 'destructive', glyph: 'ki-filled ki-information-2 text-4xl' },
  503: { tone: 'destructive', glyph: 'ki-filled ki-wrench text-4xl' },
}

/** Keeps appearance and account routing context on same-listener navigation only. */
function statusHref(href: string | undefined, model: StatusPageModel): string | undefined {
  if (!href?.startsWith('/') || href.startsWith('//')) return undefined
  const url = new URL(href, 'https://status.invalid')
  if (!url.searchParams.has('lang')) url.searchParams.set('lang', model.locale)
  if (!url.searchParams.has('theme')) url.searchParams.set('theme', model.theme)
  if (!url.searchParams.has('density')) url.searchParams.set('density', model.density)
  if (model.accountId && url.pathname !== '/login' && !url.searchParams.has('accountId')) url.searchParams.set('accountId', model.accountId)
  return url.pathname + '?' + url.searchParams.toString()
}

export function renderV2Status(props: StatusPageModel & ThemeViewProps): string {
  const t = v2Messages.translator(props.locale)
  const copy = statusPageCopy(props.status, props.locale)
  const workspace = statusHref(props.workspaceHref, props)
  const retry = (props.status === 500 || props.status === 503) ? statusHref(props.retryHref, props) : undefined
  const contact = (props.status === 403 || props.status === 404) ? publicContactEmail(props.supportEmail) : undefined
  const look = LOOK[props.status] ?? LOOK[404]!
  const actions = `${workspace ? `<a class="v2-btn v2-btn--primary kt-btn kt-btn-primary" href="${escapeHtml(workspace)}">${icon('home', 16)}${escapeHtml(t('Back to workspace'))}</a>` : ''}${retry ? `<a class="v2-btn kt-btn kt-btn-outline" href="${escapeHtml(retry)}">${icon('refresh', 16)}${escapeHtml(t('Try again'))}</a>` : ''}${!props.signedIn && props.status !== 421 && !workspace ? `<a class="v2-btn v2-btn--primary kt-btn kt-btn-primary" href="${escapeHtml(statusHref('/login', props)!)}">${icon('user', 16)}${escapeHtml(t('Sign in'))}</a>` : ''}`
  // Metronic's error page: a glyph in a soft circle where the illustration stands, the status as a badge, then title, text and actions.
  const body = `<section class="v2-status-card v2-card flex flex-col items-center justify-center w-full max-w-[640px] mx-auto gap-0 px-5 py-10 lg:py-20 border-0 rounded-none bg-transparent shadow-none text-center" data-status-page="${props.status}" role="alert" aria-labelledby="v2-status-title"><span class="${TONE[look.tone].circle}" aria-hidden="true"><i class="${look.glyph}"></i></span><p class="v2-status-code v2-num ${TONE[look.tone].badge}"><bdi dir="ltr">${props.status}</bdi></p><h1 id="v2-status-title" class="mb-2 text-2xl font-semibold text-mono text-center">${escapeHtml(copy.title)}</h1><p class="max-w-[520px] text-base font-normal text-secondary-foreground text-center">${escapeHtml(copy.explanation)}</p>${props.notice ? `<p class="kt-alert kt-alert-light kt-alert-primary mt-5 text-start" data-status-notice><span class="kt-alert-icon text-primary">${icon('info', 18)}</span><span class="kt-alert-title">${escapeHtml(props.notice)}</span></p>` : ''}${contact ? `<p class="mt-2.5 text-sm font-normal text-secondary-foreground">${escapeHtml(t('Write to'))} <a class="kt-link" href="mailto:${escapeHtml(contact)}"><bdi dir="ltr">${escapeHtml(contact)}</bdi></a>.</p>` : ''}<div class="v2-status-actions flex flex-wrap items-center justify-center gap-2.5 mt-7.5 empty:hidden">${actions}</div></section>`
  if (!props.visibility) {
    return `<div class="v2-status-standalone flex flex-col min-h-dvh bg-background text-foreground" data-surface="${props.surface}"><header class="v2-status-header flex flex-wrap items-center justify-between gap-2.5 px-5 lg:px-10 py-5"><strong class="text-lg font-semibold leading-none text-mono" dir="ltr">${escapeHtml(brandingProductName(props.branding, PRODUCTS[props.surface]))}</strong>${props.hostname ? `<bdi dir="ltr" class="v2-mono text-xs text-muted-foreground">${escapeHtml(props.hostname)}</bdi>` : ''}</header><main id="main-content" class="v2-status-main flex grow items-center justify-center p-5" tabindex="-1">${body}</main></div>`
  }
  return renderV2Shell(t, {
    branding: props.branding, surface: props.surface, activeRoute: props.path,
    visibility: props.visibility, catalog: props.catalog, homeHref: HOMES[props.surface],
    realtimeEnabled: false,
    searchHtml: `<button type="button" class="v2-search" disabled aria-label="${escapeHtml(t('Search'))}" title="${escapeHtml(t('Unavailable'))}">${escapeHtml(t('Search'))}</button>`,
    languages: alternateLocales(props.locale).map(locale => ({ tag: locale.tag, href: statusHref(props.path, { ...props, locale: locale.tag }) ?? '/login' })),
    scheme: { current: props.theme, toggleHref: statusHref(props.path, { ...props, theme: props.theme === 'dark' ? 'light' : 'dark' }) ?? '/login' },
    ...(props.hostname ? { server: { name: props.hostname } } : {}),
    account: { signedIn: props.signedIn === true, ...(props.username ? { username: props.username } : {}), ...(props.role ? { roleLabel: props.role } : {}), signInHref: '/login', ...(props.signedIn ? { securityHref: props.surface === 'xwhm' ? '/whm/security/sign-in' : props.surface === 'xmail' ? '/mail/settings/security' : '/security/account' } : {}) },
    contentHtml: body,
  })
}

/** The Metronic error-page look is carried by the classes in the markup; this keeps the code readable in both directions. */
export const V2_STATUS_CSS = `.v2-status-card{min-inline-size:0}.v2-status-code bdi{unicode-bidi:isolate}`
