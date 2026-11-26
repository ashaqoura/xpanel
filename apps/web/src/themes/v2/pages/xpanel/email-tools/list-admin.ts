import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { v2ModerationQueue } from './list-moderation.ts'

type Translate = (message: string) => string
const gate = (connected: boolean) => connected ? '' : ' data-capability-unavailable="true"'
const off = (connected: boolean) => connected ? '' : ' disabled'
// These sections render on xPanel, xMail and xWHM pages, whose page styles differ, so spacing, the action rows and
// the table frame are utilities; the field groups keep the grid class of their host page.
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
} as const
const ACTIONS = 'v2-actions flex flex-wrap items-center justify-end gap-2'
const TABLE_WRAP = 'v2-table-wrap kt-scrollable-x-auto rounded-lg border border-border'
const BODY = 'v2-card__body kt-card-content grid grid-cols-1 gap-6'
const KEY = '<i class="ki-filled ki-key" aria-hidden="true"></i>'
const field = (id: string, label: string, control: string) => `<div class="v2-field"><label class="kt-form-label" for="${id}">${escapeHtml(label)}</label>${control}</div>`
const ROW = 'v2-field kt-form-item'
const ROWS = 'grid grid-cols-1 gap-4 min-w-0'
const row = (id: string, label: string, control: string) => `<div class="${ROW}"><label class="kt-form-label" for="${id}">${escapeHtml(label)}</label>${control}</div>`
const button = (label: string, hook: string, disabled: boolean, primary = false, glyph = '') => `<button type="button" class="${primary ? BUTTON.primary : BUTTON.outline}" ${hook}${disabled ? ' disabled' : ''}>${glyph}${escapeHtml(label)}</button>`

/** v2 xPanel: the owner sets a list's administrator password without the old one. */
export function v2ListPasswordSection(t: Translate, connected: boolean): string {
  return `<section class="v2-card kt-card" aria-labelledby="v2-list-password-heading" data-list-password${gate(connected)}><div class="v2-card__head kt-card-header"><div class="v2-card__title"><h2 id="v2-list-password-heading">${escapeHtml(t('List administrator password'))}</h2><p>${escapeHtml(t('Whoever holds the list password can add and remove members from webmail. A new password replaces the old one.'))}</p></div></div><div class="${BODY}">`
    + `<div class="${ROWS}">${row('v2-list-password-list', t('List'), `<span class="v2-select"><select class="kt-select rtl:ps-6 rtl:pe-3" id="v2-list-password-list" dir="ltr" data-list-password-list${off(connected)}></select></span>`)}${row('v2-list-password-input', t('New password (minimum 8 characters)'), `<input class="kt-input" id="v2-list-password-input" type="password" dir="ltr" autocomplete="new-password" data-list-password-input${off(connected)}>`)}</div>`
    + `<p class="empty:hidden" data-list-admin-status role="status"></p><div class="${ACTIONS}">${button(t('Save list password'), 'data-list-password-save', !connected, true, KEY)}</div></div></section>`
}

/** v2 xMail List administration body: members of one list, unlocked by its administrator password. */
export function v2ListAdminBody(t: Translate, connected: boolean): string {
  return `<div class="grid grid-cols-1 gap-6 min-w-0" data-list-admin data-list-admin-can-read="${connected}" data-list-admin-manage="${connected}"${gate(connected)}><p class="text-secondary-foreground">${escapeHtml(t('Enter the list address and its administrator password to manage its members or work its moderation queue. A moderator mailbox opens the queue with an empty password. Archives and storage measurements are unavailable here.'))}</p>`
    + `<div class="${ROWS}">${row('v2-list-admin-address', t('List address'), `<input class="kt-input" id="v2-list-admin-address" dir="ltr" autocomplete="off" data-list-admin-address${off(connected)}>`)}${row('v2-list-admin-password', t('List password'), `<input class="kt-input" id="v2-list-admin-password" type="password" dir="ltr" autocomplete="current-password" data-list-admin-password${off(connected)}>`)}</div>`
    + `<div class="${ACTIONS}">${button(t('Moderation queue'), 'data-moderation-open', true)}${button(t('Open administration'), 'data-list-admin-open', !connected, true, KEY)}</div><p class="empty:hidden" data-list-admin-status role="status"></p>`
    + `<div class="${TABLE_WRAP}" tabindex="0" role="region" aria-label="${escapeHtml(t('List members'))}"><table class="v2-table kt-table align-middle"><thead><tr><th scope="col">${escapeHtml(t('Member'))}</th><th scope="col" class="w-40">${escapeHtml(t('Actions'))}</th></tr></thead><tbody data-list-admin-members></tbody></table></div>`
    + `<div class="${ROWS}">${row('v2-list-admin-member', t('New member'), `<input class="kt-input" id="v2-list-admin-member" dir="ltr" autocomplete="off" data-list-admin-member${off(connected)}>`)}</div><div class="${ACTIONS}">${button(t('Add member'), 'data-list-admin-add', true, false, icon('plus', 16))}</div>`
    + `<template data-xp-template="list-admin-member"><tr><td><bdi dir="ltr" class="v2-mono font-medium text-mono" data-xp-slot="address"></bdi></td><td><button type="button" class="v2-btn kt-btn kt-btn-outline" data-xp-slot="action" disabled></button></td></tr></template>${v2ModerationQueue(t, true)}</div>`
}

/** v2 xWHM: every list with its password state, the reset form and the list delivery restart. */
export function v2ListResetSection(t: Translate, connected: { reset: boolean; restart: boolean }): string {
  return `<section class="v2-card kt-card" aria-labelledby="v2-list-reset-heading" data-list-reset${gate(connected.reset || connected.restart)}><div class="v2-card__head kt-card-header"><div class="v2-card__title"><h2 id="v2-list-reset-heading">${escapeHtml(t('Mailing list administration'))}</h2><p>${escapeHtml(t('Lists are delivered from the Postfix alias table, so a restart tests the Postfix configuration and restarts Postfix.'))}</p></div></div><div class="${BODY}">`
    + `<div class="${TABLE_WRAP}" tabindex="0" role="region" aria-label="${escapeHtml(t('Mailing lists'))}"><table class="v2-table kt-table align-middle"><thead><tr><th scope="col">${escapeHtml(t('List address'))}</th><th scope="col">${escapeHtml(t('Account'))}</th><th scope="col">${escapeHtml(t('Administrator password'))}</th></tr></thead><tbody data-list-reset-rows></tbody></table></div>`
    + `<div class="v2-whm-mail__fields">${field('v2-list-reset-list', t('List'), `<span class="v2-select"><select class="kt-select rtl:ps-6 rtl:pe-3" id="v2-list-reset-list" dir="ltr" data-list-reset-list${off(connected.reset)}></select></span>`)}${field('v2-list-reset-password', t('New password (minimum 8 characters)'), `<input class="kt-input" id="v2-list-reset-password" type="password" dir="ltr" autocomplete="new-password" data-list-reset-password${off(connected.reset)}>`)}</div>`
    + `<p class="empty:hidden" data-list-admin-status role="status"></p><div class="${ACTIONS}">${button(t('Restart mailing list delivery'), 'data-list-restart', !connected.restart, false, icon('refresh', 16))}${button(t('Reset list password'), 'data-list-reset-save', !connected.reset, true, KEY)}</div>`
    + `<template data-xp-template="list-reset-row"><tr><td><bdi dir="ltr" class="v2-mono font-medium text-mono" data-xp-slot="address"></bdi></td><td><bdi dir="ltr" class="v2-mono" data-xp-slot="account"></bdi></td><td data-xp-slot="password"></td></tr></template></div></section>`
}
