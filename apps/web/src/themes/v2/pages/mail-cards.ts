import type { MailCard, MailCardField } from '../../../mail-cards.ts'
import { localeDirection, type Locale } from '../../../i18n.ts'
import { card as surface } from '../components/card.ts'
import { formField } from '../components/form-field.ts'
import { escapeHtml, xpTemplate } from '../html.ts'
import { mailIcon, type MailIcon } from './xmail/icons.ts'

// Metronic gives the look through the kt-* classes and utilities in the markup. These rules lay out what the mail-card
// controller writes into the card (fact values, status line, table rows) and keep their states.
const STATUS = '.v2-mail-card>[data-mail-card-status]'
export const V2_MAIL_CARD_CSS = `.v2-mail-cards{min-inline-size:0;text-align:start}
.v2-mail-card{min-inline-size:0}
.v2-mail-card :is(p,dl,dd){margin:0}
.v2-mail-card__fields{grid-template-columns:repeat(auto-fit,minmax(min(13.75rem,100%),1fr))}
.v2-mail-card__fields>:has(textarea){grid-column:1/-1}
.v2-mail-card__facts{display:grid;gap:1rem;min-inline-size:0}
.v2-mail-card__facts>div{display:flex;flex-direction:column;align-items:stretch;gap:.5rem;min-inline-size:0;text-align:start}
.v2-mail-card__facts dd{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.v2-mail-card__scroll{min-inline-size:0;font-variant-numeric:tabular-nums}
.v2-mail-card__list{grid-template-columns:repeat(auto-fill,minmax(min(11.25rem,100%),1fr))}
${STATUS}:not([data-state=failed],[data-state=error]){position:relative;padding-inline-start:1rem;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
${STATUS}:not([data-state=failed],[data-state=error])::before{content:"";position:absolute;inset-inline-start:0;inset-block-start:.5em;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:var(--line-strong)}
${STATUS}:is([data-state=read],[data-state=saved],[data-state=ready])::before{background:var(--ok)}
${STATUS}:is([data-state=reading],[data-state=saving],[data-state=busy])::before{background:var(--accent)}
${STATUS}:empty{display:none}
.v2-mail-card [hidden]{display:none!important}
`

// full literal class lists, one per action tone
const ACTION_CLASS = {
  plain: 'v2-btn kt-btn kt-btn-outline',
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  danger: 'v2-btn v2-btn--danger kt-btn kt-btn-outline kt-btn-destructive',
} as const
// the leading glyph Metronic shows on an action of that kind
// (a card-specific entry, card id and action key, wins over the generic one of the key)
const ACTION_GLYPH: Readonly<Record<string, MailIcon>> = { read: 'refresh', rebuild: 'refresh', check: 'shield', add: 'plus', create: 'plus', import: 'upload', upload: 'upload', review: 'eye', save: 'check', run: 'tools', 'reset-advanced': 'restore', 'reset-full': 'restore', 'mail-trace.run': 'route', 'track-delivery.read': 'search', 'mta-backups.create': 'download' }
const glyph = (card: MailCard, key: string): string => { const name = ACTION_GLYPH[`${card.id}.${key}`] ?? ACTION_GLYPH[key]; return name ? mailIcon(name, 16) : '' }
const CHECK = 'v2-mail-card__check kt-label items-center gap-2 min-h-11 font-normal text-base leading-(--lh-text)'

const control = (card: MailCard, field: MailCardField): string => {
  const id = `mail-card-${card.id}-${field.key}`, hooks = { 'data-mail-card-field': field.key }, disabled = !card.canRead
  if (field.kind === 'check') return `<label class="${CHECK}" for="${id}"><input class="kt-checkbox" id="${id}" type="checkbox" data-mail-card-field="${field.key}"${disabled ? ' disabled' : ''}><span>${escapeHtml(field.label)}</span></label>`
  if (field.kind === 'select') return formField({ id, label: field.label, ...(field.help ? { help: field.help } : {}), control: { kind: 'select', disabled, hooks, options: (field.options ?? []).map(([value, label]) => ({ value, label })) } })
  if (field.kind === 'lines') return formField({ id, label: field.label, ...(field.help ? { help: field.help } : {}), control: { kind: 'textarea', rows: 5, dir: 'ltr', mono: true, spellcheck: false, disabled, hooks } })
  if (field.kind === 'file') return `<div class="v2-field kt-form-item"><label class="kt-form-label leading-(--lh-label)" for="${id}">${escapeHtml(field.label)}</label><input class="kt-input" id="${id}" type="file" data-mail-card-field="${field.key}"${field.accept ? ` accept="${escapeHtml(field.accept)}"` : ''}${disabled ? ' disabled' : ''}>${field.help ? `<p class="v2-field__help kt-form-description text-[0.8125rem] leading-(--lh-cap)">${escapeHtml(field.help)}</p>` : ''}</div>`
  return formField({ id, label: field.label, ...(field.help ? { help: field.help } : {}), control: { kind: 'input', type: field.kind, ...(field.ltr ? { dir: 'ltr' as const } : {}), autocomplete: 'off', spellcheck: false, disabled, hooks,
    ...(field.min === undefined ? {} : { min: field.min }), ...(field.max === undefined ? {} : { max: field.max }), ...(field.accept ? { accept: field.accept } : {}) } })
}

/** The v2 theme's cards over the same view model and hooks as the classic theme. */
export function renderV2MailCards(cards: readonly MailCard[], locale: Locale): string {
  if (!cards.length) return ''
  return `<div class="v2-mail-cards flex flex-col gap-8" lang="${locale}" dir="${localeDirection(locale)}">${cards.map(card => {
    const interactive = card.fields.length + card.tables.length + card.actions.length > 0
    // The whole card is the controller root, so a card without settings carries its actions in the header toolbar;
    // a card with settings keeps them at the end of its form, beside what they act on.
    const buttons = card.actions.map(action => `<button type="button" class="${ACTION_CLASS[action.tone ?? 'plain']}" data-mail-card-action="${action.key}"${action.write ? ' data-mail-card-write' : ''} disabled>${glyph(card, action.key)}${escapeHtml(action.label)}</button>`).join('')
    const inHeader = card.actions.length > 0 && card.fields.length === 0
    const body = `<div class="v2-mail-card flex flex-col gap-6">
<p class="text-base leading-(--lh-text) font-normal text-secondary-foreground">${escapeHtml(card.lede)}</p>
${card.fields.length ? `<div class="v2-mail-card__fields grid gap-4 min-w-0">${card.fields.map(field => control(card, field)).join('')}</div>` : ''}
${card.list ? `<div class="v2-mail-card__list grid gap-2" role="group" aria-label="${escapeHtml(card.list.label)}" data-mail-card-list="${card.list.key}"></div>` : ''}
${card.actions.length && !inHeader ? `<div class="v2-mail-card__actions flex flex-wrap items-center justify-end gap-2">${buttons}</div>` : ''}
${interactive ? `<p data-mail-card-status data-state="unread" role="status">${escapeHtml(card.unread)}</p>` : ''}
${card.facts.length ? `<dl class="v2-mail-card__facts">${card.facts.map(([key, label]) => `<div><dt class="text-sm leading-(--lh-label) font-medium text-secondary-foreground">${escapeHtml(label)}</dt><dd class="text-base leading-(--lh-text) font-normal text-mono" data-mail-card-fact="${key}"></dd></div>`).join('')}</dl>` : ''}
${card.tables.map(table => `<div class="v2-mail-card__scroll kt-scrollable-x-auto overflow-x-auto rounded-lg border border-border" role="region" tabindex="0" aria-label="${escapeHtml(table.caption)}"><table class="v2-table kt-table text-start"><caption class="v2-sr">${escapeHtml(table.caption)}</caption><thead><tr>${table.columns.map(label => `<th class="text-start font-medium" scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody data-mail-card-rows="${table.key}"><tr><td data-table-empty colspan="${table.columns.length}">${escapeHtml(card.unread)}</td></tr></tbody></table></div>${xpTemplate(`mail-card-${table.key}`, `<tr>${table.slots.map(slot => `<td data-xp-slot="${slot}"></td>`).join('')}</tr>`)}`).join('')}
${card.notes.map(note => `<p class="text-[0.8125rem] leading-(--lh-cap) font-normal text-muted-foreground">${escapeHtml(note)}</p>`).join('')}
${interactive ? xpTemplate('mail-card-button', '<button type="button" class="v2-btn kt-btn kt-btn-outline" data-xp-slot="content" disabled></button>') + xpTemplate('mail-card-link', '<a class="kt-link" data-xp-slot="content"></a>') + xpTemplate('mail-card-select', '<select class="kt-select" data-xp-slot="content" disabled></select>') + xpTemplate('mail-card-check', `<label class="${CHECK}"><input class="kt-checkbox" type="checkbox" data-xp-slot="control" disabled><span data-xp-slot="label"></span></label>`) : ''}
</div>`
    return surface({ title: card.title, titleId: `v2-mail-card-${card.id}`, bodyHtml: body, ...(inHeader ? { actionsHtml: buttons } : {}), ...(interactive ? { hooks: { 'data-mail-card': card.id, 'data-mail-card-can-read': String(card.canRead), 'data-mail-card-can-act': String(card.canAct) } } : {}) })
  }).join('')}</div>`
}
