const tpl = (name: string, tag: string, body: string, attrs = ''): string => `<template data-xp-template="whm-backup-${name}"><${tag}${attrs}>${body}</${tag}></template>`
const slot = (name: string, tag = 'span', attrs = ''): string => `<${tag} data-xp-slot="${name}"${attrs}></${tag}>`
/** A table cell; the leading cell of a row names it. */
const cell = (name: string, technical = false, lead = false): string => `<td${lead ? ' class="text-base font-medium text-mono"' : ''}>${slot(name, technical ? 'bdi' : 'span', technical ? ' dir="ltr" class="v2-mono"' : '')}</td>`
const ROW_BUTTON = { outline: 'v2-btn kt-btn kt-btn-outline', danger: 'v2-btn kt-btn kt-btn-outline kt-btn-destructive' } as const
// Core fills the label on the button itself, so a row button carries no icon element.
const button = (name: string, hooks = '', kind: keyof typeof ROW_BUTTON = 'outline'): string => `<button type="button" class="${ROW_BUTTON[kind]}" data-xp-slot="${name}"${hooks} disabled></button>`
const TITLE = ' class="text-base font-medium text-mono"'
const NOTE = ' class="text-base font-normal text-secondary-foreground"'
/** This theme owns every dynamic server-backup row, choice and restore view. */
export const v2WhmBackupClientTemplates = (): string => [
  tpl('activation', 'span', slot('before') + slot('link', 'a', ' class="kt-link"') + slot('after'), ' class="v2-muted text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground" id="backup-destination-activation-help"'),
  tpl('missing', 'div', slot('notice', 'p', ' class="text-base text-foreground"') + button('clear'), ' class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3"'),
  tpl('account-choice', 'label', '<input class="kt-checkbox" type="checkbox" data-backup-selected-account data-xp-slot="control" disabled>' + slot('text', 'bdi', ' dir="ltr"' + TITLE), ' class="v2-lifecycle__choice"'),
  tpl('destination-heading', 'strong', '', ' class="text-base font-semibold text-mono" data-xp-slot="text"'),
  tpl('destination-choice', 'label', '<input class="kt-checkbox" type="checkbox" data-backup-selected-destination data-xp-slot="control" disabled>' + slot('text', 'span', TITLE), ' class="v2-lifecycle__choice"'),
  tpl('destination-row', 'tr', cell('name', false, true) + cell('kind') + cell('endpoint', true) + cell('state') + '<td><div class="v2-lifecycle__actions">' + button('edit', ' data-backup-edit-destination') + button('remove', ' data-backup-delete-destination', 'danger') + '</div></td>'),
  tpl('destination-empty', 'tr', '<td colspan="5" data-xp-slot="message"></td>'),
  tpl('snapshot-row', 'tr', ['created','kind','username','bytes','contents','integrity','state'].map(key => cell(key, ['created','username','bytes'].includes(key))).join('') + '<td><details><summary data-xp-slot="summary"></summary><ul data-xp-slot="paths"></ul></details></td>'),
  tpl('path', 'li', slot('text', 'bdi', ' dir="ltr" class="v2-mono"')),
  tpl('snapshot-empty', 'tr', '<td colspan="8" data-xp-slot="message"></td>'),
  tpl('pager', 'div', button('previous') + slot('label', 'bdi', ' dir="ltr" class="text-sm font-medium text-secondary-foreground"') + button('next'), ' class="v2-lifecycle__actions"'),
  tpl('run-row', 'tr', ['created','trigger','accounts','bytes','duration','copies','state'].map(key => cell(key, ['created','bytes','duration'].includes(key))).join('') + '<td><div class="v2-lifecycle__actions">' + button('restore') + button('log') + '</div></td>'),
  tpl('run-empty', 'tr', '<td colspan="8" data-xp-slot="message"></td>'),
  tpl('log', 'li', ''),
  tpl('technical', 'bdi', '', ' dir="ltr" class="v2-mono" data-xp-slot="text"'),
  tpl('name', 'bdi', '', ' data-xp-slot="text"'),
  tpl('radio', 'button', '<span class="v2-lifecycle__radio-ring" aria-hidden="true"></span><span>' + slot('title', 'strong', TITLE) + slot('note', 'span', NOTE) + '</span>', ' type="button" class="v2-lifecycle__choice" role="radio" disabled'),
  tpl('choices-empty', 'p', '', ' class="text-base text-secondary-foreground" data-xp-slot="message"'),
  tpl('difference', 'tr', cell('part', false, true) + cell('name', true) + cell('current') + cell('backup') + cell('action')),
].join('')
