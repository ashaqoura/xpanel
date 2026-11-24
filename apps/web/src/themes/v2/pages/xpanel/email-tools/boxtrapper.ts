import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'

type Translate = (message: string) => string

// The card is shared by xPanel and xMail, whose page styles differ, so its layout is written with utilities:
// groups 1.25rem apart (1.875rem from the large breakpoint) with a rule between them, and every setting a Metronic
// settings row (label column 14rem beside the growing control from the large breakpoint, stacked below it).
const GROUP = 'v2-boxtrapper__group grid grid-cols-1 gap-5 min-w-0'
const GROUP_NEXT = 'v2-boxtrapper__group grid grid-cols-1 gap-5 min-w-0 border-t border-border pt-5 lg:pt-7.5'
const ROWS = 'v2-boxtrapper__fields grid grid-cols-1 gap-5 min-w-0'
// The check boxes have no label of their own, so they line up with the control column of the rows above.
const CHECKS = 'v2-boxtrapper__fields grid grid-cols-1 gap-1 min-w-0 lg:ms-[14.625rem]'
const ROW = 'v2-field v2-field--row kt-form-item lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-baseline lg:[&>:not(label)]:col-start-2'
const ACTIONS = 'v2-actions flex flex-wrap items-center justify-end gap-2.5'
const HEADING = 'text-sm font-semibold text-mono'
const COPY = 'text-sm text-secondary-foreground'
const CODE = 'rounded-lg border border-border bg-muted p-3.5 text-xs leading-relaxed overflow-auto max-h-96 empty:hidden'
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const
const TRASH = '<i class="ki-filled ki-trash" aria-hidden="true"></i>'
const BLOCK = '<i class="ki-filled ki-shield-cross" aria-hidden="true"></i>'
const RESET = '<i class="ki-filled ki-arrows-loop" aria-hidden="true"></i>'
const IGNORE = '<i class="ki-filled ki-eye-slash" aria-hidden="true"></i>'
const DELIVER = '<i class="ki-filled ki-directbox-default" aria-hidden="true"></i>'

/** v2 BoxTrapper card of xPanel and xMail: settings, templates, sender lists, the held queue and the daily log. */
export function v2BoxTrapperSection(t: Translate, input: { scope: 'owner' | 'mailbox'; connected: boolean }): string {
  const { scope, connected } = input, off = connected ? '' : ' disabled', id = `v2-boxtrapper-${scope}`
  const e = (message: string): string => escapeHtml(t(message))
  const field = (key: string, label: string, control: string, help = ''): string => `<div class="${ROW}"><label class="kt-form-label max-w-56" for="${id}-${key}">${e(label)}</label>${control}${help ? `<p class="kt-form-description">${e(help)}</p>` : ''}</div>`
  const check = (key: string, hook: string, label: string): string => `<label class="v2-boxtrapper__check flex items-center gap-2 min-h-8.5 text-sm text-foreground" for="${id}-${key}"><input class="kt-checkbox kt-checkbox-sm" type="checkbox" id="${id}-${key}" ${hook} data-boxtrapper-control${off}><span>${e(label)}</span></label>`
  const text = (key: string, hook: string, extra: string): string => `<input class="kt-input" id="${id}-${key}" ${hook} data-boxtrapper-control ${extra}${off}>`
  const area = (key: string, hook: string, rows: number): string => `<textarea class="kt-textarea" id="${id}-${key}" dir="ltr" rows="${rows}" ${hook} data-boxtrapper-control${off}></textarea>`
  const select = (key: string, hook: string, options = ''): string => `<span class="v2-select"><select class="kt-select" id="${id}-${key}" dir="ltr" ${hook} data-boxtrapper-control${off}>${options}</select></span>`
  const button = (hook: string, label: string, kind: keyof typeof BUTTON = 'outline', glyph = ''): string => `<button type="button" class="${BUTTON[kind]}" ${hook} data-boxtrapper-control${off}>${glyph}${e(label)}</button>`
  const heading = (label: string): string => `<h3 class="${HEADING}">${e(label)}</h3>`
  return `<section class="v2-card v2-boxtrapper kt-card" data-boxtrapper data-boxtrapper-scope="${scope}" data-boxtrapper-can-read="${connected}" data-boxtrapper-manage="${connected}"${connected ? '' : ' data-capability-unavailable="true"'} aria-labelledby="${id}-heading"><div class="v2-card__head kt-card-header"><div class="v2-card__title kt-card-title"><h2 id="${id}-heading">BoxTrapper</h2></div></div><div class="v2-card__body v2-boxtrapper__body kt-card-content grid grid-cols-1 gap-5 lg:gap-7.5">`
    + `<p class="${COPY}">${e(msgid('Holds mail from unknown senders until they answer one verification message. Automatic mail and mail the spam filter flags is held without a reply, so forged senders are not answered.'))}</p>`
    + `<p data-boxtrapper-status data-state="unread" role="status">${e(msgid('BoxTrapper has not been read.'))}</p>`
    + `<div class="${GROUP}"><div class="${ROWS}">${scope === 'owner' ? field('mailbox', msgid('Mailbox'), select('mailbox', 'data-boxtrapper-mailbox')) : ''}${field('name', msgid('Display name'), text('name', 'data-boxtrapper-name', 'maxlength="100"'))}${field('days', msgid('Days to keep the log and the queue'), text('days', 'data-boxtrapper-days', 'type="number" dir="ltr" min="1" max="365"'))}${field('score', msgid('Spam score that bypasses verification'), text('score', 'data-boxtrapper-score', 'type="number" dir="ltr" min="-100" max="100" step="0.1"'), msgid('Mail scoring below this is delivered. It needs a spam filter wired into the mail server.'))}</div>`
    + `<div class="${CHECKS}">${check('enabled', 'data-boxtrapper-enabled', msgid('Ask unknown senders to verify before delivery'))}${check('auto-sent', 'data-boxtrapper-auto-sent', msgid('Allow addresses this mailbox wrote to'))}${check('association', 'data-boxtrapper-association', msgid('Allow the other recipients of allowed mail'))}</div>`
    + `<div class="${ROWS}">${field('extra', msgid('Other addresses that deliver here'), area('extra', 'data-boxtrapper-extra', 3), msgid('One address per line.'))}${field('forward', msgid('Forward allowed mail to'), area('forward', 'data-boxtrapper-forward', 3), msgid('Up to four addresses, one per line.'))}</div></div>`
    + `<div class="${GROUP_NEXT}">${heading(msgid('Messages sent to senders'))}<div class="${ROWS}">${field('template', msgid('Message'), select('template', 'data-boxtrapper-template', `<option value="verify">${e(msgid('Verification request'))}</option><option value="released">${e(msgid('Message released'))}</option><option value="failed">${e(msgid('Verification failed'))}</option><option value="deny">${e(msgid('Sender denied'))}</option>`))}${field('subject', msgid('Subject'), text('subject', 'data-boxtrapper-template-subject', 'dir="auto" maxlength="200"'))}`
    + field('body', msgid('Text'), `<textarea class="kt-textarea" id="${id}-body" dir="auto" rows="6" maxlength="4000" data-boxtrapper-template-body data-boxtrapper-control${off}></textarea>`, msgid('Placeholders: {sender}, {subject}, {mailbox}, {name} and {token}. The verification subject must keep verify#{token}.'))
    + `</div><div class="${ACTIONS}">${button('data-boxtrapper-template-reset', msgid('Reset to default'), 'ghost', RESET)}${button('data-boxtrapper-save', msgid('Save BoxTrapper settings'), 'primary', icon('check', 16))}</div></div>`
    + `<div class="${GROUP_NEXT}">${heading(msgid('Sender lists'))}<p class="${COPY}">${e(msgid('One rule per line: a sender address or pattern, or from, to or subject followed by a pattern. * and ? are wildcards. Ignore beats deny, and deny beats allow.'))}</p><div class="${ROWS}">${field('allow', msgid('Allow (deliver)'), area('allow', 'data-boxtrapper-list="allow"', 4))}${field('ignore', msgid('Ignore (drop silently)'), area('ignore', 'data-boxtrapper-list="ignore"', 4))}${field('deny', msgid('Deny (drop and tell the sender)'), area('deny', 'data-boxtrapper-list="deny"', 4))}</div><div class="${ACTIONS}">${button('data-boxtrapper-lists-save', msgid('Save sender lists'), 'outline', icon('check', 16))}</div></div>`
    + `<div class="${GROUP_NEXT}">${heading(msgid('Held mail'))}<div class="${ROWS}">${field('day', msgid('Day'), select('day', 'data-boxtrapper-day'))}</div>`
    + `<div class="v2-table-wrap kt-scrollable-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${e(msgid('Held mail'))}"><table class="v2-table kt-table align-middle"><thead><tr><th scope="col" class="w-12"><span class="v2-sr">${e(msgid('Select'))}</span></th>${[msgid('Received (UTC)'), msgid('Sender'), msgid('Subject'), msgid('Size'), msgid('Actions')].map(column => `<th scope="col">${e(column)}</th>`).join('')}</tr></thead><tbody data-boxtrapper-queue><tr><td colspan="6" class="py-5 text-center text-muted-foreground">${e(msgid('Nothing has been read.'))}</td></tr></tbody></table></div>`
    + `<p data-boxtrapper-queue-status hidden></p>`
    + `<div class="${ACTIONS}">${button('data-boxtrapper-act="deny"', msgid('Deny sender'), 'danger', BLOCK)}${button('data-boxtrapper-act="ignore"', msgid('Ignore sender'), 'outline', IGNORE)}${button('data-boxtrapper-act="delete"', msgid('Delete'), 'danger', TRASH)}${button('data-boxtrapper-act="deliver"', msgid('Deliver'), 'outline', DELIVER)}${button('data-boxtrapper-act="allow"', msgid('Deliver and allow'), 'primary', icon('check', 16))}</div><pre class="${CODE}" dir="ltr" data-boxtrapper-message hidden></pre></div>`
    + `<div class="${GROUP_NEXT}">${heading(msgid('Activity log'))}<div class="${ROWS}">${field('log-day', msgid('Day'), select('log-day', 'data-boxtrapper-log-day'))}</div><pre class="${CODE}" dir="ltr" data-boxtrapper-log></pre></div>`
    + `<template data-xp-template="boxtrapper-row"><tr><td><label class="v2-boxtrapper__pick flex items-center justify-center"><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-xp-slot="select"></label></td><td><bdi dir="ltr" data-xp-slot="at"></bdi></td><td><bdi dir="ltr" class="font-medium text-mono" data-xp-slot="from"></bdi></td><td><bdi data-xp-slot="subject"></bdi></td><td><bdi dir="ltr" data-xp-slot="size"></bdi></td><td><button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline" data-xp-slot="view" disabled></button></td></tr></template>`
    + `<template data-xp-template="boxtrapper-empty"><tr><td colspan="6" class="py-5 text-center text-muted-foreground" data-xp-slot="message"></td></tr></template></div></section>`
}
