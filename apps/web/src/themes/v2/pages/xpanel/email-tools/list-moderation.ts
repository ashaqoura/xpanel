import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'

type Translate = (message: string) => string
const dis = (connected: boolean) => connected ? '' : ' disabled'
// The queue also renders inside xMail, whose page styles differ, so spacing, action rows and the table frame are
// utilities. A field inside a multi-column group keeps its label above the control on every host page.
const STACKED = 'v2-field grid-cols-1 [&>*]:col-auto'
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const
const ACTIONS = 'v2-actions flex flex-wrap items-center justify-end gap-2.5'
const GRID = 'v2-list-moderation__grid grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0'
const TRASH = '<i class="ki-filled ki-trash" aria-hidden="true"></i>'
const REJECT = '<i class="ki-filled ki-cross-circle" aria-hidden="true"></i>'
const field = (id: string, label: string, control: string, stacked = true) => `<div class="${stacked ? STACKED : 'v2-field'}"><label class="kt-form-label" for="${id}">${escapeHtml(label)}</label>${control}</div>`

/** v2 held message table of one list; the controller fills it after the surface's own sign-in. */
export function v2ModerationQueue(t: Translate): string {
  const button = (label: string, hook: string, kind: keyof typeof BUTTON = 'outline', glyph = '') => `<button type="button" class="${BUTTON[kind]}" ${hook} disabled>${glyph}${escapeHtml(label)}</button>`
  return `<div class="v2-list-moderation__queue grid grid-cols-1 gap-5 min-w-0" data-moderation-queue><p class="empty:hidden" data-moderation-status role="status"></p>`
    + `<div class="v2-table-wrap kt-scrollable-x-auto rounded-lg border border-border" tabindex="0" role="region" aria-label="${escapeHtml(t(msgid('Moderation queue')))}"><table class="v2-table kt-table align-middle"><thead><tr><th scope="col" class="w-12"><span class="v2-sr">${escapeHtml(t(msgid('Select')))}</span></th><th scope="col">${escapeHtml(t(msgid('Message')))}</th><th scope="col">${escapeHtml(t(msgid('Reason')))}</th><th scope="col" class="w-32">${escapeHtml(t(msgid('Action')))}</th></tr></thead><tbody data-moderation-rows></tbody></table></div>`
    + field('v2-list-moderation-reason', t(msgid('Rejection reason sent to the sender (optional)')), '<input class="kt-input" id="v2-list-moderation-reason" maxlength="500" autocomplete="off" data-moderation-reason disabled>', false)
    + `<div class="${ACTIONS}">${button(t(msgid('Discard')), 'data-moderation-discard', 'danger', TRASH)}${button(t(msgid('Reject')), 'data-moderation-reject', 'outline', REJECT)}${button(t(msgid('Approve')), 'data-moderation-approve', 'primary', icon('check', 16))}</div>`
    + `<pre class="v2-list-moderation__message text-xs leading-relaxed" dir="ltr" tabindex="0" data-moderation-message hidden></pre>`
    + `<template data-xp-template="list-moderation-row"><tr><td><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-xp-slot="select"></td><td><bdi dir="ltr" class="v2-mono font-medium text-mono" data-xp-slot="from"></bdi><br><span class="text-secondary-foreground" data-xp-slot="subject"></span></td><td><span data-xp-slot="reason"></span><br><bdi dir="ltr" class="v2-num text-xs text-muted-foreground" data-xp-slot="at"></bdi></td><td><button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline" data-xp-slot="open" disabled></button></td></tr></template></div>`
}

/** v2 xPanel: who may post to one list, its sender rules, and its queue. */
export function v2ListModerationSection(t: Translate, connected: boolean): string {
  const off = dis(connected)
  const pick = (id: string, hook: string, options: readonly (readonly [string, string])[]) => `<span class="v2-select"><select class="kt-select" id="${id}" ${hook}${off}>${options.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('')}</select></span>`
  const area = (id: string, hook: string, label: string) => field(id, label, `<textarea class="kt-textarea" id="${id}" dir="ltr" rows="3" ${hook}${off}></textarea>`)
  const number = (id: string, hook: string, label: string, max: number) => field(id, label, `<input class="kt-input" id="${id}" type="number" min="0" max="${max}" dir="ltr" ${hook}${off}>`)
  const check = (id: string, hook: string, label: string) => `<label class="v2-check flex items-center gap-2 min-h-8.5 text-sm text-foreground" for="${id}"><input class="kt-checkbox kt-checkbox-sm" id="${id}" type="checkbox" ${hook}${off}> ${escapeHtml(label)}</label>`
  const actions = [['hold', t(msgid('Hold for review'))], ['reject', t(msgid('Reject with a notice'))], ['discard', t(msgid('Discard silently'))]] as const
  return `<section class="v2-card kt-card" aria-labelledby="v2-list-moderation-heading" data-list-moderation data-moderation-can-read="${connected}" data-moderation-can-manage="${connected}">`
    + `<div class="v2-card__head kt-card-header"><div class="v2-card__title"><h2 id="v2-list-moderation-heading">${escapeHtml(t(msgid('Posting moderation')))}</h2><p>${escapeHtml(t(msgid('Choose who may post. Posts the rules stop wait here until a moderator approves, rejects or discards them. The check runs as this account when mail arrives, and a list without rules stays a plain alias.')))}</p></div></div><div class="v2-card__body v2-list-moderation__stack kt-card-content grid grid-cols-1 gap-5">`
    + `<div class="${GRID}">${field('v2-list-moderation-list', t(msgid('List')), `<span class="v2-select"><select class="kt-select" id="v2-list-moderation-list" dir="ltr" data-moderation-list${off}></select></span>`)}`
    + field('v2-list-moderation-posting', t(msgid('Moderation')), pick('v2-list-moderation-posting', 'data-moderation-posting', [['open', t(msgid('Open'))], ['members', t(msgid('Members'))], ['moderated', t(msgid('Moderated'))]]))
    + field('v2-list-moderation-subscription', t(msgid('Self subscription')), pick('v2-list-moderation-subscription', 'data-moderation-subscription', [['closed', t(msgid('Closed'))], ['open', t(msgid('Open'))]]))
    + field('v2-list-moderation-non-member', t(msgid('Posts from non-members')), pick('v2-list-moderation-non-member', 'data-moderation-non-member', actions))
    + field('v2-list-moderation-member', t(msgid('Posts from moderated members')), pick('v2-list-moderation-member', 'data-moderation-member', actions))
    + number('v2-list-moderation-size', 'data-moderation-size', t(msgid('Hold messages larger than (KB, 0 for no limit)')), 1048576) + number('v2-list-moderation-retention', 'data-moderation-retention', t(msgid('Remove held messages after (days, 0 to keep)')), 365) + '</div>'
    + `<div class="${GRID} border-t border-border pt-5">${area('v2-list-moderation-moderators', 'data-moderation-moderators', t(msgid('Moderators (one address per line)')))}${area('v2-list-moderation-moderated', 'data-moderation-moderated', t(msgid('Moderated members (one address per line)')))}`
    + `${area('v2-list-moderation-accept', 'data-moderation-accept', t(msgid('Always accept from')))}${area('v2-list-moderation-hold', 'data-moderation-hold', t(msgid('Always hold from')))}${area('v2-list-moderation-reject', 'data-moderation-reject-senders', t(msgid('Always reject from')))}${area('v2-list-moderation-discard', 'data-moderation-discard-senders', t(msgid('Always discard from')))}</div>`
    + `<p class="text-xs text-muted-foreground">${escapeHtml(t(msgid('Sender rules take one address per line, where * and ? match any text, and apply to non-members. A moderator mailbox of this account opens the queue from webmail with its own sign-in.')))}</p>`
    + `<div class="${GRID} gap-y-1">${check('v2-list-moderation-notify-moderators', 'data-moderation-notify-moderators', t(msgid('Tell moderators about each held message')))}${check('v2-list-moderation-notify-sender', 'data-moderation-notify-sender', t(msgid('Tell senders their message is held')))}</div>`
    + `<div class="${ACTIONS}"><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-moderation-save${off}>${icon('check', 16)}${escapeHtml(t(msgid('Save posting policy')))}</button></div>`
    + `<dl class="${GRID} border-t border-border pt-5"><div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1"><dt class="text-sm text-secondary-foreground">${escapeHtml(t(msgid('Moderation queue')))}</dt><dd class="text-sm font-medium text-mono" data-moderation-state>${escapeHtml(t(msgid('Not read')))}</dd></div><div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1"><dt class="text-sm text-secondary-foreground">${escapeHtml(t(msgid('Held messages')))}</dt><dd class="text-sm font-medium text-mono" data-moderation-held>${escapeHtml(t(msgid('Not read')))}</dd></div></dl>`
    + `${v2ModerationQueue(t)}</div></section>`
}
