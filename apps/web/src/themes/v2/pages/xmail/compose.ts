import { v2MailClientTemplates } from './client-templates.ts'
import { COMPOSE_ATTACHMENT_LIMITS, msgctxt, msgid } from '@xpanel/core'
import { formatAsciiBytes } from '../../../../display-format.ts'
import type { Translate } from '../../../../i18n.ts'
import { MAIL_COMPOSE_EDITOR_SCRIPT, mailComposeEditorCopy } from '../../../../mail-compose-editor-client.ts'
import { card } from '../../components/card.ts'
import { escapeHtml, hookAttrs } from '../../html.ts'
import { icon } from '../../icons.ts'
import { mailIcon, type MailIcon } from './icons.ts'
import { ROLE } from './roles.ts'
import { renderV2MailVacation } from './vacation.ts'
import type { MailComposeView } from './types.ts'

const FORMAT: readonly { key: MailIcon; label: string; action?: boolean }[] = [
  { key: 'bold', label: msgid('Bold') }, { key: 'italic', label: msgid('Italic') },
  { key: 'underline', label: msgid('Underline') }, { key: 'bullets', label: msgid('Bulleted list') },
  { key: 'numbers', label: msgid('Numbered list') }, { key: 'quote', label: msgid('Quote') },
  { key: 'link', label: msgid('Insert link'), action: true }, { key: 'clear', label: msgid('Remove formatting'), action: true },
]

// The header fields of a message: the label above its control on phones, beside it (the mail header layout the
// acceptance contract allows here) from the tablet width; 8px label to control, 16px between fields.
const ROW = 'v2-field flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 min-w-0'
const ROW_LABEL = 'kt-form-label leading-(--lh-label) md:w-24 md:shrink-0'
const ROW_BODY = 'flex flex-col gap-2 w-full min-w-0'
const HINT = 'text-[0.8125rem] leading-(--lh-cap) font-normal text-muted-foreground'
// full literal class lists, one per meter tone
const METER = {
  info: 'v2-bar kt-progress kt-progress-primary',
  warn: 'v2-bar kt-progress kt-progress-warning',
  bad: 'v2-bar kt-progress kt-progress-destructive',
} as const

function recipient(t: Translate, name: 'to' | 'cc' | 'bcc', label: string, value: string, disabled = false, helpHtml = ''): string {
  const box = `<div class="v2-mail-recipient kt-input flex flex-wrap items-center gap-2 h-auto py-0" data-mail-recip-box="${name}"><input id="compose-${name}" data-mail-recip-input="${name}" type="text" name="${name}" dir="ltr" inputmode="email" autocomplete="email" aria-describedby="recips-help" value="${escapeHtml(value)}"${disabled ? ' disabled' : ''}><ul aria-label="${escapeHtml(`${label} ${t('recipients')}`)}"></ul></div>`
  return `<div class="${ROW}" data-mail-recip="${name}"><label class="${ROW_LABEL}" for="compose-${name}">${escapeHtml(label)}</label>${helpHtml ? `<div class="${ROW_BODY}">${box}${helpHtml}</div>` : box}</div>`
}

const fact = (label: string, value: string, hooks: Record<`data-${string}`, string | boolean> = {}): string => `<div><dt>${escapeHtml(label)}</dt><dd${hookAttrs(hooks)}><bdi dir="ltr">${escapeHtml(value)}</bdi></dd></div>`

function identity(t: Translate, view: MailComposeView): string {
  const unread = t(msgctxt('xmail-compose', 'Not read'))
  return card({ title: t('Sending as'), titleId: 'v2-mail-sending-title', bodyHtml: `<dl class="v2-mail-facts">${fact(t('Address'), view.mailbox || unread, { 'data-mail-from-addr': true })}${fact(t('Sender name'), unread, { 'data-compose-identity-label': true })}${fact(t('Reply-To'), unread, { 'data-compose-reply-to': true })}${fact('DKIM', view.identity.dkim ?? unread)}${fact('SPF, DMARC', view.identity.spf ?? unread)}${fact(t('Size limit'), view.identity.size ?? unread)}</dl>` })
}

/** The quota the page already carries; nothing is measured here. */
function storage(t: Translate, view: MailComposeView): string {
  const percent = view.quota.percent === null ? null : Math.max(0, Math.min(100, view.quota.percent))
  const track = percent === null ? `<p role="status">${escapeHtml(t(msgctxt('xmail-compose', 'Not read')))}</p>` : `<div class="${percent >= 90 ? METER.bad : percent >= 75 ? METER.warn : METER.info}" role="meter" aria-labelledby="v2-mail-storage-card-title" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="v2-bar__fill v2-bar--${percent >= 90 ? 'bad' : percent >= 75 ? 'warn' : 'info'} kt-progress-indicator block" style="inline-size:${percent}%"></span></div>`
  return card({ title: t('Mailbox storage'), titleId: 'v2-mail-storage-card-title', actionsHtml: `<bdi class="v2-num ${ROLE.label} font-medium text-mono" dir="ltr">${escapeHtml(view.quota.text)}</bdi>`, bodyHtml: track, hooks: { 'data-mail-storage-card': true } })
}

function rules(t: Translate, view: MailComposeView): string {
  const body = view.rules === null ? `<p role="status">${escapeHtml(t('Saved record not read.'))}</p>` : view.rules.length === 0 ? `<p role="status">${escapeHtml(t(msgctxt('theme:v2', 'No Sieve rules configured.')))}</p>` : `<ul class="v2-mail-rules flex flex-col gap-2">${view.rules.map(rule => `<li class="flex flex-col gap-4 p-4 rounded-lg border border-border bg-muted/40"><h3 class="flex items-center gap-1.5 ${ROLE.label} font-semibold text-mono break-words">${icon('filter', 14)}<span>${escapeHtml(rule.name)}</span></h3><dl class="v2-mail-facts">${fact(t(msgctxt('theme:v2', 'Condition')), rule.condition)}${fact(t('Action'), rule.action)}${fact(t('Status'), t(rule.enabled ? 'Enabled' : 'Disabled'))}</dl></li>`).join('')}</ul>`
  // the filter page reads and writes the rules; compose only leads there
  const unavailable = view.canManageFilters ? '' : `<p role="status">${escapeHtml(t('Filters are not available for this mailbox.'))}</p>`
  const links = view.canManageFilters ? `<a class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost" href="/mail/settings/filters#new-filter">${icon('plus', 14)}${escapeHtml(t('Add filter'))}</a><a class="v2-btn kt-btn kt-btn-outline" href="/mail/settings/filters">${icon('gear', 14)}${escapeHtml(t('Manage filters'))}</a>` : ''
  return card({ id: 'filters', title: t('Filters'), titleId: 'v2-mail-filter-title', bodyHtml: body + unavailable, footerHtml: links })
}

/** Real send/draft/identity/attachment controllers decide readiness; no renderer claims submission or persistence. */
export function renderV2MailCompose(t: Translate, view: MailComposeView & { readonly readOnly?: boolean }): string {
  if (view.readOnly === true) view = { ...view, canSend: false, canSaveDraft: false, canUseAttachments: false, canManageVacation: false, canManageFilters: false }
  const format = FORMAT.map(item => `<button type="button" class="v2-btn v2-btn--icon kt-btn kt-btn-icon kt-btn-ghost" data-mail-format="${item.key}" data-mail-format-action="${item.action === true}" aria-label="${escapeHtml(t(item.label))}"${item.action ? '' : ' aria-pressed="false"'}${view.readOnly === true ? ' disabled' : ''}>${mailIcon(item.key, 16)}</button>`).join('')
  const identityTools = `<div class="v2-mail-identity-tools flex flex-wrap items-center gap-2" data-compose-identities-tools><div class="v2-mail-actions flex flex-wrap items-center gap-2"><button type="button" class="v2-btn kt-btn kt-btn-outline" data-compose-identities-refresh disabled>${mailIcon('refresh', 14)}${escapeHtml(t('Read sender identities'))}</button><button type="button" class="v2-btn kt-btn kt-btn-ghost" data-compose-signature-insert disabled>${mailIcon('pencil', 14)}${escapeHtml(t('Insert signature'))}</button></div><p class="basis-full" id="compose-identities-status" data-compose-identities-status role="status">${escapeHtml(t('Saved sender identities have not been read.'))}</p></div>`
  const recipsHelp = `<p id="recips-help" class="v2-muted ${HINT}">${escapeHtml(t('Press Enter or type a comma after each address. Bcc recipients are hidden from everyone else.'))}</p>`
  const fields = `<div class="${ROW}"><label class="${ROW_LABEL}" for="compose-from">${escapeHtml(t('From'))}</label><div class="${ROW_BODY}"><span class="v2-select"><select class="kt-select" id="compose-from" dir="auto" disabled aria-describedby="compose-identities-status"><option value="" data-addr="${escapeHtml(view.mailbox)}">${escapeHtml(view.mailbox || t(msgctxt('xmail-compose', 'Not read')))}</option></select>${icon('chevDown', 16)}</span>${identityTools}</div></div>${recipient(t, 'to', t('To'), view.draft.to, view.readOnly === true)}${recipient(t, 'cc', t('Cc'), view.draft.cc, view.readOnly === true)}${recipient(t, 'bcc', t('Bcc'), view.draft.bcc, view.readOnly === true, recipsHelp)}<div class="${ROW}"><label class="${ROW_LABEL}" for="compose-subject">${escapeHtml(t('Subject'))}</label><input class="kt-input" id="compose-subject" name="subject" dir="auto" value="${escapeHtml(view.draft.subject)}"${view.readOnly === true ? ' disabled' : ''}></div>`
  const requestCapBytes = COMPOSE_ATTACHMENT_LIMITS.maxRequestBytes
  const effectiveLimitBytes = typeof view.identity.sizeBytes === 'number' && Number.isSafeInteger(view.identity.sizeBytes) && view.identity.sizeBytes > 0
    ? Math.min(requestCapBytes, view.identity.sizeBytes)
    : requestCapBytes
  const effectiveLimitText = formatAsciiBytes(effectiveLimitBytes)
  const hasInitialDraft = Boolean(view.draft.to || view.draft.cc || view.draft.bcc || view.draft.subject || view.draft.body)
  const initialDraftBytes = hasInitialDraft
    ? new TextEncoder().encode(JSON.stringify({ to: view.draft.to, cc: view.draft.cc, bcc: view.draft.bcc, subject: view.draft.subject, text: view.draft.body })).byteLength
    : 0
  const initialMeterTone = initialDraftBytes > effectiveLimitBytes ? 'bad' : initialDraftBytes >= effectiveLimitBytes * 0.8 ? 'warn' : 'ok'
  const sizeMeter = `<div class="v2-mail-size-meter flex flex-col gap-2 p-4 rounded-lg" data-compose-size-meter data-tone="${initialMeterTone}" data-size-limit-bytes="${effectiveLimitBytes}" data-size-limit-label="${escapeHtml(effectiveLimitText)}"><div class="v2-mail-size-meter__head flex flex-wrap items-center justify-between gap-2"><span class="${ROLE.label} font-medium text-mono">${escapeHtml(t('Message size'))}</span><bdi class="v2-num ${ROLE.caption} font-medium text-secondary-foreground" dir="ltr" data-compose-size-meter-text>${escapeHtml(`${formatAsciiBytes(initialDraftBytes)} / ${effectiveLimitText}`)}</bdi></div><progress class="v2-mail-size-meter__bar" max="${effectiveLimitBytes}" value="${Math.min(effectiveLimitBytes, initialDraftBytes)}" data-compose-size-meter-progress aria-label="${escapeHtml(t('Message size'))}"></progress>${view.identity.size ? `<p class="v2-muted v2-num v2-mail-size-meter__note ${ROLE.caption} text-muted-foreground">${escapeHtml(t('Server limit: {size}', { size: view.identity.size }))}</p>` : ''}</div>`
  const dropzone = view.readOnly === true ? '' : `<div class="v2-dropzone flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-lg border border-dashed border-input bg-muted/40 text-center cursor-pointer" data-file-dropzone role="button" tabindex="0"><span class="flex items-center justify-center size-10 mb-1 rounded-full bg-primary/10 text-primary" aria-hidden="true">${mailIcon('upload', 20)}</span><span class="v2-dropzone__title ${ROLE.label} font-medium text-mono">${escapeHtml(t(msgid('Drop files here to attach')))}</span><span class="v2-dropzone__hint ${ROLE.caption} text-muted-foreground">${escapeHtml(t(msgid('Up to 10 files, 512 KiB combined.')))}</span></div>`
  const attachments = `<section class="v2-mail-compose-attachments flex flex-col gap-4" data-compose-attachments data-compose-attachment-enabled="${view.canUseAttachments}" aria-labelledby="v2-compose-attachments-title">${v2MailClientTemplates('compose-attachments')}<div class="v2-mail-card-head flex flex-wrap items-center justify-between gap-2"><h2 class="${ROLE.label} font-semibold text-mono" id="v2-compose-attachments-title">${escapeHtml(t('Attachments'))} <span class="v2-num ${ROLE.caption} font-normal text-muted-foreground" data-compose-attachment-summary></span></h2><button type="button" class="v2-btn kt-btn kt-btn-outline" data-compose-attachment-open aria-controls="compose-file-input" aria-describedby="compose-attachment-status" disabled>${mailIcon('attach', 14)}${escapeHtml(t('Attach files'))}</button></div><input id="compose-file-input" data-compose-attachment-input type="file" multiple hidden disabled>${dropzone}<ul data-compose-attachment-list></ul>${sizeMeter}<p class="${HINT}" id="compose-attachment-status" data-compose-attachment-status role="status">${escapeHtml(t('Choose up to 10 files, with a combined limit of 512 KiB. Files have not been read.'))}</p></section>`
  const editor = `<section class="v2-mail-compose-editor kt-card xl:col-span-2 min-w-0" data-compose-form="true" data-mail-send-availability="${view.canSend ? 'available' : 'unavailable'}" data-compose-identities="true" data-compose-identities-can-read="${view.readOnly !== true}" data-compose-identities-manage="${view.readOnly !== true}" data-compose-mailbox="${escapeHtml(view.mailbox)}" data-compose-identities-state="unread" data-compose-send-enabled="${view.canSend}" data-compose-draft-enabled="${view.canSaveDraft}" aria-labelledby="compose-title"><div class="v2-mail-compose-body kt-card-content flex flex-col gap-6 p-6 max-[600px]:p-4"><div class="v2-mail-compose-fields grid gap-4">${fields}</div><div class="v2-mail-editor flex flex-col grow min-w-0 overflow-hidden rounded-md border border-input shadow-xs"><div class="v2-mail-format flex flex-wrap items-center gap-1 p-1 border-b border-border bg-muted/40" role="toolbar" aria-label="${escapeHtml(t('Formatting'))}" aria-controls="compose-body">${format}</div><span id="compose-body-label" class="v2-sr">${escapeHtml(t('Message body'))}</span><div id="compose-body" class="v2-mail-editor-body grow min-h-72 p-4 bg-background ${ROLE.body} text-foreground" role="textbox" contenteditable="${view.readOnly === true ? 'false' : 'true'}"${view.readOnly === true ? ' aria-readonly="true"' : ''} dir="auto" aria-labelledby="compose-body-label" aria-multiline="true" spellcheck="true">${escapeHtml(view.draft.body)}</div></div>${attachments}<div data-mail-feedback hidden></div></div><footer class="v2-mail-compose-footer kt-card-footer flex-wrap gap-2 px-6 max-[600px]:px-4"><div class="flex flex-wrap items-center gap-2 me-auto" data-mail-discard role="group" aria-label="${escapeHtml(t('Discard draft'))}"><button type="button" class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost kt-btn-destructive dark:text-red-500" data-mail-action="discard-ask"${view.readOnly === true ? ' disabled' : ''}>${mailIcon('trash', 16)}${escapeHtml(t('Discard'))}</button></div><div class="v2-mail-actions flex flex-row-reverse items-center gap-2 min-w-0"><button type="button" class="v2-btn kt-btn kt-btn-outline" data-mail-action="save-draft" disabled aria-describedby="mail-draft-status">${escapeHtml(t('Save draft'))}</button><span id="mail-draft-status" data-mail-draft-status role="status">${escapeHtml(t('Draft saving has not been checked.'))}</span></div><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-mail-send="true" disabled aria-describedby="mail-send-status compose-identities-status">${mailIcon('send', 16)}${escapeHtml(t('Send'))}</button></footer></section>`
  const head = `<header class="v2-mail-compose-head"><div><h1 class="${ROLE.pageHeading} font-medium text-mono" id="compose-title">${escapeHtml(t('New message'))}</h1><p class="${ROLE.label}" id="mail-send-status" role="status">${escapeHtml(t('Send through the local mail server.'))}</p></div><a class="v2-btn kt-btn kt-btn-outline" href="/mail/inbox">${mailIcon('back', 16)}${escapeHtml(t(msgctxt('theme:v2', 'Back to Inbox')))}</a></header>`
  return `<div class="v2-mail-compose flex flex-col gap-6 lg:gap-8 min-w-0"${view.readOnly === true ? ' data-readonly="true"' : ''} data-board-port="xmail-compose" data-product="true" data-mailbox="${escapeHtml(view.mailbox)}" data-locale="${t.locale}"${view.readOnly === true ? '' : mailComposeEditorCopy(t, '/mail/inbox')}>${head}<div class="v2-mail-compose__grid grid xl:grid-cols-3 gap-6 lg:gap-8 min-w-0">${editor}<aside class="v2-mail-compose-aside grid md:grid-cols-2 xl:grid-cols-1 content-start gap-6 lg:gap-8 min-w-0" aria-label="${escapeHtml(t('Sending as'))}">${storage(t, view)}${identity(t, view)}${renderV2MailVacation(t, view)}${rules(t, view)}</aside></div>${view.readOnly === true ? '' : MAIL_COMPOSE_EDITOR_SCRIPT}</div>`
}
