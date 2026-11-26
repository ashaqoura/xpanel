import { xpTemplate } from './html.ts'

// Complete literal class lists (the stylesheet build keeps only whole tokens). Row actions are small Metronic
// buttons; a state is the outline kt-badge of its tone with a dot; a progress track is kt-progress.
const BUTTON = 'v2-btn kt-btn kt-btn-sm kt-btn-outline'
const BUTTON_GHOST = 'v2-btn v2-btn--ghost kt-btn kt-btn-sm kt-btn-ghost'
const BUTTON_DANGER = 'v2-btn v2-btn--danger kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive'
const ACTIONS = 'flex flex-wrap items-center gap-2.5'
type PillTone = 'ok' | 'bad' | 'info' | 'neutral'
const PILL: Readonly<Record<PillTone, string>> = {
  ok: 'v2-pill v2-pill--ok kt-badge kt-badge-outline kt-badge-success rounded-[30px]',
  bad: 'v2-pill v2-pill--bad kt-badge kt-badge-outline kt-badge-destructive rounded-[30px]',
  info: 'v2-pill v2-pill--info kt-badge kt-badge-outline kt-badge-primary rounded-[30px]',
  neutral: 'v2-pill v2-pill--neutral kt-badge kt-badge-outline kt-badge-secondary rounded-[30px]',
}
const TRACK: Readonly<Record<'ok' | 'bad' | 'info', string>> = {
  ok: 'v2-bar kt-progress kt-progress-success', bad: 'v2-bar kt-progress kt-progress-destructive', info: 'v2-bar kt-progress kt-progress-primary',
}
const FILL: Readonly<Record<'ok' | 'bad' | 'info', string>> = {
  ok: 'v2-bar__fill v2-bar--ok kt-progress-indicator', bad: 'v2-bar__fill v2-bar--bad kt-progress-indicator', info: 'v2-bar__fill v2-bar--info kt-progress-indicator',
}

const primitive = (name: string, tag: string, cls: string, extra = '') => xpTemplate(name, `<${tag}${cls ? ` class="${cls}"` : ''} data-xp-slot="content"${extra}${['button', 'select'].includes(tag) && !extra.includes('disabled') ? ' disabled' : ''}></${tag}>`)
const row = (name: string, slots: readonly string[]) => xpTemplate(name, `<tr>${slots.map(slot => `<td data-xp-slot="${slot}"></td>`).join('')}</tr>`)
const pill = (name: string, tone: PillTone, slotAttrs = 'data-xp-slot="content"') => xpTemplate(name, `<span class="${PILL[tone]}"><span class="v2-pill__dot kt-badge-dot" aria-hidden="true"></span><span ${slotAttrs}></span></span>`)
export function v2WhmClientTemplates(family: string): string {
  switch (family) {
    case 'panel-data': return (['active', 'none'] as const).map(state => pill('whm-generation-current-' + state, state === 'active' ? 'ok' : 'neutral', 'data-generations-current-label data-xp-slot="content"')).join('') + row('whm-generation-row', ['generation', 'created', 'summary', 'state', 'actions']) + xpTemplate('whm-generation-empty', '<tr><td colspan="5" data-xp-slot="content"></td></tr>') + pill('whm-generation-state-active', 'ok') + pill('whm-generation-state-other', 'neutral') + primitive('whm-generation-rollback', 'button', BUTTON, ' type="button" disabled')
    case 'mail-server': return primitive('whm-mail-route-select', 'select', 'kt-select max-[959px]:text-base')
    case 'mail-queue': return row('whm-mail-queue-row', ['select', 'reference', 'queue', 'arrived', 'age', 'bytes', 'sender', 'recipients', 'reason', 'actions']) + xpTemplate('whm-mail-queue-empty', '<tr><td colspan="10" data-xp-slot="content"></td></tr>') + primitive('whm-mail-queue-actions', 'div', `v2-whm-mail__actions ${ACTIONS}`) + primitive('whm-mail-queue-action', 'button', BUTTON, ' type="button"') + primitive('whm-mail-queue-delete', 'button', BUTTON_DANGER, ' type="button"')
    case 'mail-log': return primitive('whm-mail-timeline-button', 'button', BUTTON, ' type="button"')
    case 'mail-quality': return primitive('whm-mail-quality-check', 'div', 'v2-field kt-form-item')
    case 'mailbox-maintenance': return primitive('whm-mailbox-inspect', 'button', BUTTON, ' type="button"')
    case 'notifications': return primitive('whm-notifications-secret', 'code', 'v2-mono')
    case 'developer': return xpTemplate('whm-developer-field', '<div class="v2-field kt-form-item"><dt class="text-sm font-normal text-secondary-foreground" data-xp-slot="label"></dt><dd class="text-sm font-medium text-mono" data-xp-slot="value"></dd></div>')
    case 'support': return primitive('whm-support-note', 'p', 'v2-muted text-sm text-secondary-foreground')
    case 'jobs': return row('whm-jobs-row', ['reference', 'kind', 'summary', 'state', 'progress', 'created', 'started', 'finished', 'actor']) + row('whm-jobs-step', ['order', 'title', 'state', 'exit']) + primitive('whm-jobs-select', 'button', BUTTON_GHOST, ' type="button"') + (['queued', 'running', 'succeeded', 'failed', 'cancelled'] as const).map(state => pill('whm-jobs-state-' + state, state === 'succeeded' ? 'ok' : state === 'failed' ? 'bad' : state === 'running' ? 'info' : 'neutral')).join('') + (['other', 'failed', 'succeeded'] as const).map(state => { const tone = state === 'failed' ? 'bad' : state === 'succeeded' ? 'ok' : 'info'; return xpTemplate('whm-jobs-progress-' + state, `<div class="v2-observation__job-progress"><div class="${TRACK[tone]}" data-xp-slot="track" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span class="${FILL[tone]}" data-xp-slot="fill"></span></div><bdi dir="ltr" class="v2-num" data-xp-slot="content"></bdi></div>`) }).join('')
    case 'tokens': return row('whm-token-row', ['name', 'scopes', 'addresses', 'created', 'expires', 'used', 'state', 'actions']) + primitive('whm-token-list', 'ul', 'v2-admin-list') + primitive('whm-token-revoke', 'button', BUTTON_DANGER, ' type="button"') + (['active', 'expired', 'revoked'] as const).map(state => pill('whm-token-state-' + state, state === 'active' ? 'ok' : state === 'revoked' ? 'bad' : 'neutral')).join('')
    case 'announcements': return row('whm-announcement-row', ['titles', 'severity', 'audience', 'window', 'phase', 'updated', 'actions']) + primitive('whm-announcement-cell', 'div', 'v2-field kt-form-item') + primitive('whm-announcement-note', 'span', 'v2-muted text-xs text-muted-foreground') + primitive('whm-announcement-actions', 'div', `v2-account-tool__actions ${ACTIONS}`) + primitive('whm-announcement-button', 'button', BUTTON, ' type="button"')
    case 'processes': return primitive('whm-process-actions', 'div', `v2-observation__actions ${ACTIONS}`) + primitive('whm-process-term', 'button', BUTTON, ' type="button"') + primitive('whm-process-kill', 'button', BUTTON_DANGER, ' type="button"') + primitive('whm-process-kill-user', 'button', BUTTON_DANGER, ' type="button"')
    default: throw new Error('unknown_whm_client_template_family')
  }
}
