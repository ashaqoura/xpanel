import type { Translate } from '../../../i18n.ts'
import { escapeHtml, hookAttrs, type HookAttributes, type Tone } from '../html.ts'
import { icon, type IconName } from '../icons.ts'

export interface NoticeProps {
  tone: Exclude<Tone, 'neutral'>
  /** Bold lead, such as "Not enforced." */
  lead?: string
  text: string
  action?: { label: string; href: string; kind?: 'link'; hooks?: HookAttributes }
    | { label: string; kind: 'button'; hooks: HookAttributes; disabled?: boolean }
  /** Interrupting notices (failed test, risky action) use role="alert"; the default is role="status". */
  urgent?: boolean
  /** Hooks of the controller that dismisses this notice; without them no dismiss button is shown. */
  dismiss?: HookAttributes
  /** Optional sanitized HTML appended after the main notice paragraph. */
  extraHtml?: string
  hooks?: HookAttributes
}

const NOTICE_ICONS: Readonly<Record<NoticeProps['tone'], IconName>> = { info: 'info', ok: 'okCircle', warn: 'alert', bad: 'xCircle' }
// The Metronic alert of each tone: the light kt-alert variant.
const ALERT: Readonly<Record<NoticeProps['tone'], string>> = {
  info: 'kt-alert kt-alert-light kt-alert-primary', ok: 'kt-alert kt-alert-light kt-alert-success',
  warn: 'kt-alert kt-alert-light kt-alert-warning', bad: 'kt-alert kt-alert-light kt-alert-destructive',
}

export function notice(t: Translate, props: NoticeProps): string {
  const action = !props.action ? '' : props.action.kind === 'button'
    ? `<button type="button" class="v2-notice__action kt-link"${props.action.disabled ? ' disabled' : ''}${hookAttrs(props.action.hooks)}>${escapeHtml(props.action.label)}</button>`
    : `<a class="v2-notice__action kt-link" href="${escapeHtml(props.action.href)}"${hookAttrs(props.action.hooks)}>${escapeHtml(props.action.label)}</a>`
  const dismiss = props.dismiss ? `<button type="button" class="v2-notice__dismiss kt-btn kt-btn-sm kt-btn-icon kt-btn-ghost shrink-0 -my-2.5 -me-2.5" aria-label="${escapeHtml(t('Dismiss'))}"${hookAttrs(props.dismiss)}>${icon('x', 14)}</button>` : ''
  return `<div class="v2-notice v2-notice--${props.tone} ${ALERT[props.tone]}" role="${props.urgent ? 'alert' : 'status'}"${hookAttrs(props.hooks)}>${icon(NOTICE_ICONS[props.tone])}<div class="v2-notice__body kt-alert-title"><p>${props.lead ? `<strong>${escapeHtml(props.lead)}</strong> ` : ''}${escapeHtml(props.text)}</p>${props.extraHtml ?? ''}${action}</div>${dismiss}</div>`
}

// The surface, border and padding of each tone come from kt-alert kt-alert-light; these rules place the Keenicon
// (toned, on the first text line), stack the body and tone the icon.
export const NOTICE_CSS = `.v2-notice{align-items:flex-start;line-height:1.5}
.v2-notice>.v2-icon{margin-block-start:.125rem;color:var(--tone)}
.v2-notice__body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:.25rem}
.v2-notice__body strong{font-weight:600}
.v2-notice__action:disabled{opacity:.5;cursor:not-allowed}
.v2-notice--info{--tone:var(--accent)}
.v2-notice--ok{--tone:var(--color-green-500,var(--ok))}
.v2-notice--warn{--tone:var(--color-yellow-500,var(--warn))}
.v2-notice--bad{--tone:var(--destructive)}
`
