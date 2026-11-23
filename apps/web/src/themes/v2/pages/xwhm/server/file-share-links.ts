import type { Translate } from '../../../../../i18n.ts'
import { escapeHtml } from '../../../html.ts'

const HOURS: readonly (readonly [string, string])[] = [['1', msgid('1 hour')], ['24', msgid('24 hours')], ['168', msgid('7 days')], ['720', msgid('30 days')]]

/** Expiring public downloads of one file; file-share-links-client.ts owns the behaviour. */
export function renderV2FileShareLinks(t: Translate, canManage: boolean): string {
  const text = (copy: string): string => escapeHtml(t(copy))
  const heads = [msgid('File'), msgid('Account'), msgid('Expires (UTC)'), msgid('Status'), msgid('Actions')]
  return `<section class="v2-card kt-card" data-file-share-links data-file-share-can-manage="${canManage}" aria-labelledby="v2-file-share-links"><div class="v2-card__head kt-card-header"><div class="v2-card__title"><h2 id="v2-file-share-links">${text(msgid('Share links'))}</h2></div><div class="v2-card__actions kt-card-toolbar"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-file-share-read disabled><i class="ki-filled ki-arrows-circle text-sm" aria-hidden="true"></i>${text(msgid('Read links'))}</button></div></div><div class="v2-card__body kt-card-content">
<template data-xp-template="file-share-action"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" disabled><span data-xp-slot="label"></span></button></template>
<p>${text(msgid('A link lets anyone who has it download one file from an account, with no sign-in, until it expires or you revoke it. Every link, download and revocation is in the audit log.'))}</p>
<div class="v2-admin-fields"><div class="v2-field"><label class="kt-form-label leading-5" for="v2-file-share-path">${text(msgid('File path'))}</label><input id="v2-file-share-path" class="kt-input" dir="ltr" maxlength="1200" autocomplete="off" spellcheck="false" placeholder="/home/example/public_html/report.pdf" data-file-share-path disabled></div>
<div class="v2-field"><label class="kt-form-label leading-5" for="v2-file-share-hours">${text(msgid('Expires after'))}</label><select id="v2-file-share-hours" class="kt-select" data-file-share-hours disabled>${HOURS.map(([value, label]) => `<option value="${value}"${value === '24' ? ' selected' : ''}>${text(label)}</option>`).join('')}</select></div></div>
<div class="v2-admin-actions"><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-file-share-create disabled><i class="ki-filled ki-plus text-base" aria-hidden="true"></i>${text(msgid('Create link'))}</button></div>
<p data-file-share-status data-state="unread" role="status">${text(msgid('Share links have not been read.'))}</p>
<div class="v2-admin-form" data-file-share-result hidden><div class="v2-field"><label class="kt-form-label leading-5" for="v2-file-share-url">${text(msgid('New link, shown only once'))}</label><input id="v2-file-share-url" class="kt-input" dir="ltr" readonly data-file-share-url disabled></div><div class="v2-admin-actions"><button type="button" class="v2-btn kt-btn kt-btn-outline" data-file-share-copy disabled><i class="ki-filled ki-copy text-base" aria-hidden="true"></i>${text(msgid('Copy link'))}</button></div></div>
<div class="v2-admin-table kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${text(msgid('Share links'))}"><table class="kt-table" style="${escapeHtml(heads.map((label, index) => `--v2-col-${index + 1}:'${t(label).replace(/[\\']/g, '\\$&')}'`).join(';'))}"><caption class="v2-sr">${text(msgid('Share links'))}</caption><thead><tr>${heads.map(head => `<th scope="col">${text(head)}</th>`).join('')}</tr></thead><tbody data-file-share-rows><tr><td colspan="5">${text(msgid('Share links have not been read.'))}</td></tr></tbody></table></div></div></section>`
}
