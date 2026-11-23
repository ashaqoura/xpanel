import type { Translate } from '../../../../../i18n.ts'
import { card } from '../../../components/index.ts'
import { actions, button, esc, keenicon, row, rows, status, table, toolCard } from '../account-tools/common.ts'

/** A session that cannot save keeps the layout and gets no native form, like every other administrator workspace. */
const formBlock = (editable: boolean, attrs: string, body: string): string =>
  editable ? `<form ${attrs} novalidate>${body}</form>` : `<div ${attrs}>${body}</div>`
const technical = (slot: string): string => `<bdi dir="ltr" class="v2-mono" data-xp-slot="${slot}"></bdi>`
/** A checkbox with its label, as the Metronic forms write one. */
const choice = (inputAttrs: string, label: string): string => `<label class="v2-account-tool__choice kt-label leading-5"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" ${inputAttrs}><span>${esc(label)}</span></label>`
/** The destructive action of a saved row: a small soft-danger button with the Metronic trash icon. */
const rowRemove = (label: string, off: string): string => `<button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive" data-xp-slot="remove"${off}>${keenicon('trash')}${esc(label)}</button>`

/** WHM Force Password Change: rows are painted by WHM_ACCOUNT_ADMIN_CLIENT_BINDING. */
export function renderV2ForcePassword(t: Translate, editable: boolean): string {
  const row = `<template data-xp-template="force-password-row"><tr><td><label class="v2-account-tool__choice kt-label leading-5"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-xp-slot="forced"${editable ? '' : ' disabled'}>${technical('username')}</label></td><td>${technical('domain')}</td><td data-xp-slot="state"></td></tr></template>`
  return toolCard('force-password', t(msgid('Force password change')), `<p>${esc(t(msgid('A selected user is signed out and can only change the password at the next sign-in. The mark stays until the password has been changed.')))}</p>${row}`
    + table(t(msgid('Force password change')), [t(msgid('Account')), t(msgid('Domain')), t(msgid('Status'))], { 'data-force-password-rows': true }, t(msgid('Accounts have not been read.')))
    + status(t(msgid('Accounts have not been read.')), { 'data-force-password-status': true })
    + actions(button(t(msgid('Select all')), { 'data-force-password-all': true }, editable) + button(t(msgid('Clear all')), { 'data-force-password-none': true }, editable) + button(t(msgid('Save')), { 'data-force-password-save': true }, editable, true), true),
  { 'data-whm-force-password': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Rearrange an Account: the destination comes from the home roots this server reports. */
export function renderV2Rearrange(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const select = (id: string, name: string, label: string, first: string): string => row(id, label, `<select id="${id}" name="${name}" dir="ltr"${off}><option value="">${esc(first)}</option></select>`)
  return toolCard('rearrange', t(msgid('Rearrange an account')), `<p>${esc(t(msgid('Moves an account to another home root, on the same disk or another one. The account stops serving while its files move, and every copied file is compared before the old directory is removed.')))}</p>`
    + formBlock(editable, 'data-rearrange-form', rows(select('v2-rearrange-account', 'account', t(msgid('Account')), t(msgid('Select an account'))) + select('v2-rearrange-root', 'root', t(msgid('Home root')), t(msgid('Select a home root'))))
      + choice(`name="acknowledge"${off}`, t(msgid('Scripts with the old home path written in them will break.')))
      + actions(`<button type="button" class="v2-btn kt-btn kt-btn-outline" data-rearrange-recover hidden${off}>${keenicon('arrows-loop')}${esc(t(msgid('Settle an interrupted move')))}</button><button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-rearrange-submit${off}>${keenicon('arrow-right-left')}${esc(t(msgid('Move account')))}</button>`, true))
    + status(t(msgid('Accounts have not been read.')), { 'data-rearrange-status': true }),
  { 'data-whm-rearrange': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Manage Shell Access: one choice per account and a bulk action; the package value stays visible. */
export function renderV2ShellAccess(t: Translate, editable: boolean): string {
  const row = `<template data-xp-template="shell-access-row"><tr><td>${technical('username')}</td><td><select class="kt-select" data-xp-slot="shell"${editable ? '' : ' disabled'}><option value="jailed">${esc(t(msgid('Jailed')))}</option><option value="none">${esc(t(msgid('Disabled')))}</option></select></td><td data-xp-slot="source"></td></tr></template>`
  return toolCard('shell-access', t(msgid('Manage shell access')), `<p>${esc(t(msgid('Jailed gives a confined shell. Disabled blocks shell sign-in and also stops SFTP. Normal shells are not offered, because they would leave the account confinement.')))}</p>${row}`
    + table(t(msgid('Manage shell access')), [t(msgid('Account')), t(msgid('Shell')), t(msgid('Source'))], { 'data-shell-rows': true }, t(msgid('Accounts have not been read.')))
    + status(t(msgid('Accounts have not been read.')), { 'data-shell-status': true })
    + actions(button(t(msgid('Jail all accounts')), { 'data-shell-all': 'jailed' }, editable) + button(t(msgid('Disable all accounts')), { 'data-shell-all': 'none' }, editable), true),
  { 'data-whm-shell-access': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Email All Users: the first step reviews recipients, only the second sends. */
export function renderV2EmailUsers(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const input = (id: string, name: string, label: string, attrs: string): string => row(id, label, `<input id="${id}" name="${name}" autocomplete="off" ${attrs}${off}>`)
  return toolCard('email-users', t(msgid('Email all users')), `<p>${esc(t(msgid('One message per account contact address, through the local mail server. Review comes first; nothing is sent until you confirm it.')))}</p>`
    + formBlock(editable, 'data-email-users-form', rows(input('v2-email-users-name', 'fromName', t(msgid('Sender name')), 'dir="auto" maxlength="80"') + input('v2-email-users-address', 'fromAddress', t(msgid('Sender email')), 'type="email" dir="ltr" maxlength="254"') + input('v2-email-users-subject', 'subject', t(msgid('Subject')), 'dir="auto" maxlength="200"')
      + row('v2-email-users-body', t(msgid('Message')), `<textarea id="v2-email-users-body" name="body" rows="6" dir="auto" maxlength="20000"${off}></textarea>`))
      + choice(`name="includeResellerCustomers"${off}`, t(msgid("Include resellers' customers")))
      + actions(`<button type="submit" class="v2-btn kt-btn kt-btn-outline" data-email-users-review${off}>${keenicon('eye')}${esc(t(msgid('Review recipients')))}</button><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-email-users-send disabled>${keenicon('paper-plane')}${esc(t(msgid('Send')))}</button>`, true))
    + status(t(msgid('Nothing has been reviewed yet.')), { 'data-email-users-status': true }) + '<ul data-email-users-recipients hidden></ul>',
  { 'data-whm-email-users': true, 'data-account-admin-editable': String(editable) })
}

/** A reseller's view of Account Enhancements: what root gave it, assigned per account. */
export function renderV2EnhancementAssign(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const select = (id: string, name: string, label: string, first: string): string => row(id, label, `<select id="${id}" name="${name}" dir="ltr"${off}><option value="">${esc(first)}</option></select>`)
  return toolCard('assign-enhancements', t(msgid('Assign enhancements')), `<p>${esc(t(msgid('Root sets which enhancements you may assign and how many.')))}</p>`
    + formBlock(editable, 'data-enh-assign-form', rows(select('v2-enh-account', 'account', t(msgid('Account')), t(msgid('Select an account'))) + select('v2-enh-enhancement', 'enhancement', t(msgid('Enhancement')), t(msgid('Select an enhancement'))) + row('v2-enh-value', t(msgid('Value')), `<input id="v2-enh-value" name="value" type="number" dir="ltr" min="0"${off}>`))
      + actions(button(t(msgid('Remove')), { 'data-enh-unassign': true }, editable) + `<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-enh-assign${off}>${keenicon('check')}${esc(t(msgid('Assign')))}</button>`, true))
    + status(t(msgid('Enhancements have not been read.')), { 'data-enh-assign-status': true }),
  { 'data-whm-account-enhancements': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Home: the administrator's favorites and notifications, filled by WHM_HOME_CLIENT_BINDING. */
export function renderV2WhmHome(t: Translate): string {
  // Metronic list cards: the view choice sits in the header toolbar, the rows form a divided list in the body and the
  // card-wide action closes the card in its footer. Rows are painted by the client into the lists.
  const favorites = toolCard('favorites', t(msgid('Favorites')), `<p class="v2-whm-home__empty flex items-center gap-2 text-sm text-secondary-foreground" data-whm-favorites-empty><i class="ki-filled ki-star text-base text-muted-foreground" aria-hidden="true"></i><span>${esc(t(msgid('Star a page in the quick bar to keep it here and in the side menu.')))}</span></p><ul class="v2-whm-overview__services v2-whm-home__list" data-whm-favorites-list data-sortable-list></ul>`
    + status('', { 'data-whm-favorites-status': true }, 'unread', true), { 'data-whm-favorites': true }, choice('data-whm-favorites-descriptions checked', t(msgid('Show descriptions'))))
  const inbox = card({ title: t(msgid('Notifications')), titleId: 'whm-inbox-heading', hooks: { 'data-whm-inbox': true }, actionsHtml: choice('data-whm-inbox-unread-only', t(msgid('Unread only'))).replace('v2-account-tool__choice', 'v2-whm-inbox__filter v2-account-tool__choice'),
    bodyHtml: status(t(msgid('Notifications have not been read.')), { 'data-whm-inbox-status': true }) + '<ul class="v2-whm-overview__services v2-whm-home__list" data-whm-inbox-list></ul>',
    footerHtml: actions(button(t(msgid('Mark all as read')), { 'data-whm-inbox-read': true }), true) })
  return `<div class="v2-whm-overview__secondary">${favorites}${inbox}</div>`
}

/** WHM Web Template Editor: one editor per page; the host publishes each save. */
export function renderV2WebTemplates(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const page = (kind: 'default' | 'suspended', label: string, help: string): string => formBlock(editable, `class="v2-account-tool__fields" data-web-template-form="${kind}"`, `<h3>${esc(label)}</h3><p class="v2-muted text-sm font-normal">${esc(help)}</p><p class="v2-muted text-xs font-normal" data-web-template-state></p>`
    + row(`v2-web-template-${kind}`, label, `<textarea id="v2-web-template-${kind}" name="html" class="v2-mono" rows="12" dir="ltr" spellcheck="false"${off}></textarea>`)
    + actions(`<label class="v2-btn kt-btn kt-btn-outline">${keenicon('exit-up')}${esc(t(msgid('Upload a file')))}<input type="file" accept=".html,.htm,text/html" hidden data-web-template-upload${off}></label>`
      + button(t(msgid('Preview')), { 'data-web-template-action': 'preview' }, editable) + button(t(msgid('Revert to last saved')), { 'data-web-template-action': 'revert' }, editable) + button(t(msgid('Restore the shipped page')), { 'data-web-template-action': 'shipped' }, editable)
      + `<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${off}>${keenicon('check')}${esc(t(msgid('Save')))}</button>`, true))
  return toolCard('web-templates', t(msgid('Web template editor')), `<p>${esc(t(msgid('Your pages apply to the accounts you own. %contact% becomes your contact address. Saving publishes the page through the web server.')))}</p>`
    + page('default', t(msgid('Default website page')), t(msgid('Shown for a site with an empty public_html instead of an access error.'))) + page('suspended', t(msgid('Suspended account page')), t(msgid('Shown while an account is suspended.')))
    + `<iframe title="${esc(t(msgid('Preview')))}" sandbox="" data-web-template-preview hidden></iframe>`
    + status(t(msgid('Templates have not been read.')), { 'data-web-template-status': true }),
  { 'data-whm-web-templates': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Skeleton Directory: files copied once, when an account is created. */
export function renderV2Skeleton(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const line = `<template data-xp-template="skeleton-row"><tr><td>${technical('path')}</td><td><bdi dir="ltr" data-xp-slot="size"></bdi></td><td>${rowRemove(t(msgid('Remove')), off)}</td></tr></template>`
  return toolCard('skeleton', t(msgid('Skeleton directory')), `<p>${esc(t(msgid('Files here are copied into public_html or public_ftp of each new account you create. Existing accounts do not change.')))}</p>${line}`
    + table(t(msgid('Skeleton directory')), [t(msgid('File')), t(msgid('Size')), t(msgid('Actions'))], { 'data-skeleton-rows': true }, t(msgid('The skeleton has not been read.')))
    + formBlock(editable, 'data-skeleton-form', rows(row('v2-skeleton-path', t(msgid('File path')), `<input id="v2-skeleton-path" name="path" class="v2-mono" dir="ltr" maxlength="240" placeholder="public_html/index.html" autocomplete="off" spellcheck="false"${off}>`) + row('v2-skeleton-file', t(msgid('File')), `<input id="v2-skeleton-file" name="file" type="file"${off}>`)
      + row('v2-skeleton-text', t(msgid('Or type the content')), `<textarea id="v2-skeleton-text" name="text" class="v2-mono" rows="4" dir="ltr" spellcheck="false"${off}></textarea>`))
      + actions(`<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${off}>${keenicon('check')}${esc(t(msgid('Save file')))}</button>`, true))
    + status(t(msgid('The skeleton has not been read.')), { 'data-skeleton-status': true }),
  { 'data-whm-skeleton': true, 'data-account-admin-editable': String(editable) })
}

/** WHM Copy a Locale: a new code starts as a full copy of a locale, then its catalog is uploaded like any other. */
export function renderV2LocaleCopy(t: Translate, editable: boolean): string {
  const off = editable ? '' : ' disabled'
  const line = `<template data-xp-template="locale-copy-row"><tr><td>${technical('tag')}</td><td data-xp-slot="name"></td><td>${technical('source')}</td><td>${technical('messages')}</td><td data-xp-slot="state"></td><td>${rowRemove(t(msgid('Delete')), off)}</td></tr></template>`
  return toolCard('locale-copy', t(msgid('Copy a locale')), `<p>${esc(t(msgid('A copy holds every string of its source. It joins the panels at the next panel start, and can then be offered and translated like any other language.')))}</p>${line}`
    + table(t(msgid('Locale copies')), [t(msgid('Code')), t(msgid('Name')), t(msgid('Source')), t(msgid('Strings')), t(msgid('Status')), t(msgid('Actions'))], { 'data-locale-copy-rows': true }, t(msgid('Locale copies have not been read.')))
    + formBlock(editable, 'data-locale-copy-form', rows(row('v2-locale-copy-source', t(msgid('Source locale')), `<select id="v2-locale-copy-source" name="source" dir="ltr"${off}></select>`) + row('v2-locale-copy-tag', t(msgid('New code')), `<input id="v2-locale-copy-tag" name="tag" class="v2-mono" dir="ltr" maxlength="35" placeholder="pt-BR" autocomplete="off" spellcheck="false"${off}>`))
      + actions(`<button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary"${off}>${keenicon('copy')}${esc(t(msgid('Copy locale')))}</button>`, true))
    + status(t(msgid('Locale copies have not been read.')), { 'data-locale-copy-status': true }),
  { 'data-whm-locale-copy': true, 'data-account-admin-editable': String(editable) })
}
