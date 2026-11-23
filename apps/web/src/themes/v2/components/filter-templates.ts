import { xpTemplate } from '../html.ts'

// Row actions are small Metronic buttons: outline for the neutral ones, the soft destructive for delete and remove.
const BUTTON = 'v2-btn kt-btn kt-btn-sm kt-btn-outline'
const BUTTON_DANGER = 'v2-btn kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive'
const CARD = 'v2-card kt-card'
const BODY = 'v2-card__body kt-card-content gap-2.5'
const ACTIONS = 'v2-panel-extra__actions v2-mail-workspace__actions flex flex-wrap items-center gap-2.5'
const SELECT = 'kt-select max-[959px]:text-base'
const INPUT = 'kt-input max-[959px]:text-base'

/** The selected theme owns dynamic rule cards and editor controls on both mail surfaces. */
export function filterClientTemplates(): string {
  const button = (action: string) => `<button type="button" class="${action === 'delete' || action === 'remove' ? BUTTON_DANGER : BUTTON}" data-xp-action="${action}"></button>`
  const caption = (name: string) => `<label class="kt-form-label" data-xp-slot="${name}-label"></label>`
  return xpTemplate('filter-rule', `<li class="${CARD}"><div class="${BODY}"><h3 data-xp-slot="title"></h3><p class="text-sm text-secondary-foreground" data-filter-summary data-xp-slot="summary"></p><p class="text-sm text-secondary-foreground" data-xp-slot="routing"></p><div class="text-sm" data-xp-slot="conditions"></div><p class="text-sm" data-filter-actions data-xp-slot="actions"></p><div class="${ACTIONS}" data-xp-slot="controls">${['edit','toggle','up','down','delete'].map(button).join('')}</div></div></li>`)
    + xpTemplate('filter-blocked-rule', `<li class="${CARD}"><div class="${BODY}"><h3 data-xp-slot="title"></h3><p class="text-sm text-secondary-foreground" data-xp-slot="warning"></p><div class="${ACTIONS}" data-xp-slot="controls">${button('delete')}</div></div></li>`)
    + xpTemplate('filter-condition-summary', '<span><span data-xp-slot="field"></span> <span data-xp-slot="comparator"></span> <span data-filter-header-group hidden><bdi dir="ltr" class="v2-mono" data-xp-slot="header"></bdi>: </span><bdi dir="ltr" class="v2-mono" data-xp-slot="value"></bdi></span>')
    + xpTemplate('filter-action-summary', '<span><span data-xp-slot="type"></span><span data-filter-target-group hidden>: <bdi dir="ltr" class="v2-mono" data-xp-slot="target"></bdi></span></span>')
    + xpTemplate('filter-technical', '<bdi dir="ltr" class="v2-mono" data-xp-slot="value"></bdi>')
    + xpTemplate('filter-condition-builder', `<div class="${CARD}" data-filter-condition><div class="v2-panel-extra__fields v2-mail-workspace__fields"><div class="v2-field kt-form-item" data-condition="field">${caption('field')}<span class="v2-select"><select class="${SELECT}" data-xp-slot="field" data-condition-field="field"></select></span></div><div class="v2-field kt-form-item" data-condition="comparator">${caption('comparator')}<span class="v2-select"><select class="${SELECT}" data-xp-slot="comparator" data-condition-field="comparator"></select></span></div><div class="v2-field kt-form-item" data-condition="headerName">${caption('header')}<input class="${INPUT}" data-xp-slot="header" data-condition-field="headerName" type="text" maxlength="64" dir="ltr"></div><div class="v2-field kt-form-item" data-condition="value">${caption('value')}<input class="${INPUT}" data-xp-slot="value" data-condition-field="value" type="text" maxlength="1024" required></div>${button('remove')}</div></div>`)
    + xpTemplate('filter-action-builder', `<div class="${CARD}" data-filter-action-row><div class="v2-panel-extra__fields v2-mail-workspace__fields"><div class="v2-field kt-form-item" data-action="type">${caption('type')}<span class="v2-select"><select class="${SELECT}" data-xp-slot="type" data-action-field="type"></select></span></div><div class="v2-field kt-form-item" data-action="target">${caption('target')}<input class="${INPUT}" data-xp-slot="target" data-action-field="target" type="text"></div>${button('remove')}</div></div>`)
    + xpTemplate('filter-trace', `<li class="${CARD}"><div class="${BODY}"><h4 data-xp-slot="title"></h4><p class="text-sm" data-xp-slot="verdict"></p><div class="text-sm text-secondary-foreground" data-xp-slot="tests"></div><p class="text-xs text-muted-foreground" data-xp-slot="ran"></p></div></li>`)
    + xpTemplate('filter-trace-test', '<p><span data-xp-slot="condition"></span> — <span data-xp-slot="verdict"></span> · <span data-xp-slot="actual"></span></p>')
}
