import { visibleNavigation } from '@xpanel/catalog'
import { catalogText, type Translate } from '../../../../i18n.ts'
import type { MailSurfaceProps } from '../../../contract.ts'
import { escapeHtml } from '../../html.ts'
import { catalogIcon, icon } from '../../icons.ts'
import { mailIcon, type MailIcon } from './icons.ts'
import type { MailFolderFacts, MailPageFacts } from './types.ts'

// The vertical Metronic menu of the shell sidebar: the same item, link, icon, title, arrow and badge classes.
const MENU = 'kt-menu flex-col gap-0.5'
const LINK = 'v2-mail-folder kt-menu-link group gap-2.5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-input hover:bg-background aria-[current=page]:border-input aria-[current=page]:bg-background'
const PLAIN = 'v2-mail-folder kt-menu-link gap-2.5 px-2.5 py-1.5 rounded-lg border border-transparent opacity-70'
const SUB_LINK = 'v2-mail-folder kt-menu-link group gap-2.5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-input hover:bg-background aria-[current=page]:border-input aria-[current=page]:bg-background'
const GLYPH = 'kt-menu-icon w-5 justify-center text-muted-foreground group-hover:text-primary group-aria-[current=page]:text-primary'
const TITLE = 'kt-menu-title text-sm font-medium leading-tight text-foreground group-hover:text-primary group-aria-[current=page]:font-semibold group-aria-[current=page]:text-primary'
const SUB_TITLE = 'kt-menu-title text-2sm font-normal leading-tight text-foreground group-hover:text-primary group-aria-[current=page]:font-semibold group-aria-[current=page]:text-primary'
const HEADING = 'text-xs font-medium uppercase text-muted-foreground'
const FOLDER_GLYPHS: Readonly<Record<string, MailIcon>> = { INBOX: 'inbox', Sent: 'sent', Drafts: 'drafts', Junk: 'junk', Trash: 'trash', Archive: 'archive' }

function folder(item: MailFolderFacts): string {
  const glyph = `<span class="${GLYPH}">${mailIcon(FOLDER_GLYPHS[item.id] ?? 'folder', 18)}</span>`
  const label = `<span class="${TITLE}">${escapeHtml(item.label)}</span>${item.count === undefined ? '' : `<span class="kt-menu-badge"><span class="v2-num kt-badge kt-badge-sm kt-badge-outline rounded-full" data-mail-count="${escapeHtml(item.id)}">${item.count}</span></span>`}`
  const attrs = ` data-mail-folder="${escapeHtml(item.id)}"${item.current ? ' aria-current="page"' : ''}`
  return `<li class="kt-menu-item">${item.href ? `<a class="${LINK}" href="${escapeHtml(item.href)}" data-nav-route="${escapeHtml(item.href)}"${attrs}>${glyph}${label}</a>` : `<span class="${PLAIN}"${attrs}>${glyph}${label}</span>`}</li>`
}

/** Only core-qualified folder links are interactive; observed names alone never grant folder access. */
export function renderV2MailSidebar(t: Translate, view: MailPageFacts, access: Pick<MailSurfaceProps, 'visibility' | 'catalog'>): string {
  const compose = view.canCompose ? `<a class="v2-btn v2-btn--primary kt-btn kt-btn-primary justify-center" href="/mail/compose" data-nav-route="/mail/compose"${view.route === '/mail/compose' ? ' aria-current="page"' : ''}>${mailIcon('compose', 16)}${escapeHtml(t('Compose'))}</a>` : ''
  const manage = view.folderManageHref ? `<a class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost kt-btn-sm" href="${escapeHtml(view.folderManageHref)}">${mailIcon('gear', 14)}${escapeHtml(t('Manage'))}</a>` : ''
  const percent = view.quota.percent === null ? null : Math.max(0, Math.min(100, view.quota.percent))
  const quota = percent === null ? '' : `<div class="v2-mail-storage__track kt-progress kt-progress-primary" role="meter" aria-label="${escapeHtml(t('Mailbox quota'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="kt-progress-indicator block" style="inline-size:${percent}%"></span></div>`
  const folderRoutes = new Set(['/mail/inbox', '/mail/compose', ...view.folders.flatMap(item => item.href ? [item.href] : [])])
  const nav = visibleNavigation(access.visibility, access.catalog).find(item => item.surface === 'xmail')
  const tools = (nav?.sections ?? []).map(group => {
    const pages = group.pages.filter(page => !folderRoutes.has(page.route))
    if (!pages.length) return ''
    const label = catalogText(t.locale, `nav.section.xmail.${group.id}.name`, group.name)
    return `<li class="kt-menu-item"><details${pages.some(page => page.route === view.route) ? ' open' : ''}><summary class="kt-menu-link group gap-2.5 px-2.5 py-1.5 rounded-lg border border-transparent"><span class="${GLYPH}">${icon(catalogIcon(group.icon))}</span><span class="${TITLE}">${escapeHtml(label)}</span><span class="kt-menu-arrow text-muted-foreground">${icon('chevRight', 12)}</span></summary><ul class="${MENU} ms-5 ps-2.5 py-1 border-s border-input">${pages.map(page => `<li class="kt-menu-item"><a class="${SUB_LINK}" href="${escapeHtml(page.route)}" data-nav-route="${escapeHtml(page.route)}"${page.route === view.route ? ' aria-current="page"' : ''}><span class="${SUB_TITLE}">${escapeHtml(catalogText(t.locale, `nav.page.xmail.${page.id}.name`, page.name))}</span></a></li>`).join('')}</ul></details></li>`
  }).join('')
  return `<div class="v2-mail-navigation">${compose}<ul class="${MENU}" aria-label="${escapeHtml(t('Mail folders'))}">${view.folders.map(folder).join('')}</ul><section class="flex flex-col gap-1.5" aria-labelledby="v2-mail-custom-title"><div class="v2-mail-navigation__head flex flex-wrap items-center justify-between gap-2.5 min-h-7 ps-2.5"><h2 class="${HEADING}" id="v2-mail-custom-title">${escapeHtml(t('Your folders'))}</h2>${manage}</div><ul class="${MENU}">${view.customFolders.map(folder).join('')}</ul></section><nav class="v2-mail-tools pt-4 border-t border-input" aria-label="${escapeHtml(t('Mail tools'))}"><ul class="${MENU}">${tools}</ul></nav><section class="v2-mail-storage flex flex-col gap-2 mt-auto px-2.5 pt-4 border-t border-input" data-mail-quota aria-labelledby="v2-mail-storage-title"><div class="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1"><h2 class="text-xs font-medium text-secondary-foreground" id="v2-mail-storage-title" data-mail-quota-label>${escapeHtml(t('Mailbox quota'))}</h2><bdi class="v2-num text-xs font-semibold text-mono" dir="ltr" data-mail-quota-value>${escapeHtml(view.quota.text)}</bdi></div>${quota}</section></div>`
}
