import { auditActionLabel, auditActorLabel, auditOutcomeLabel, auditTargetLabel } from '../../../audit-labels.ts'
import { renderBrandingFooter } from '../../../branding.ts'
import { formatAsciiNumber, formatDisplayDateTime } from '../../../display-format.ts'
import type { Translate } from '../../../i18n.ts'
import type { ActivityDrawerProps, CommandPaletteProps, DocumentBodyProps, ReconcileBannerProps, UiTheme } from '../../contract.ts'
import { statusPill } from '../components/status-pill.ts'
import { escapeHtml } from '../html.ts'
import { icon } from '../icons.ts'
import { v2Messages } from '../messages.ts'
import { activityDrawer, commandPalette, reconcileBanner } from '../shell/overlays.ts'
import { assembleActivityControl } from '../shell/activity-control.ts'
import { V2_PROMPT_CSS, V2_PROMPT_TEMPLATE } from '../components/prompt.ts'
import { renderV2IdentityCards } from '../pages/identity.ts'

// Document banners above the shell: full-width Metronic alerts without side borders or rounding.
const BANNER = 'v2-impersonation kt-alert kt-alert-light kt-alert-warning items-center rounded-none border-x-0 border-t-0'
const BANNER_INFO = 'v2-impersonation kt-alert kt-alert-light kt-alert-primary items-center rounded-none border-x-0 border-t-0'
const BANNER_ICON = `<span class="kt-alert-icon text-yellow-500">${icon('alert')}</span>`
const BANNER_INFO_ICON = `<span class="kt-alert-icon text-primary">${icon('info')}</span>`

export const V2_SECURITY_SLOT = '<div data-v2-account-security-slot></div>'
type SecurityProps = Parameters<UiTheme['slots']['accountSecurity']>[0]['security']

function rootRecoveryHint(t: Translate): string {
  const [before, after] = t('An administrator with root SSH access can turn it off with {command}. Password sign-in works again afterwards.').split('{command}')
  const tokens = ['xpanel', 'disable-2fa', 'root', '--confirm'].map(tok => `<span class="v2-security__tok">${tok}</span>`).join(' ')
  return `${escapeHtml(before ?? '')}<bdi class="v2-mono" dir="ltr">${tokens}</bdi>${escapeHtml(after ?? '')}`
}

// Metronic card (account/security/overview.html, settings-plain.html): kt-card-header with the title, a
// kt-card-content stack, settings rows (label column at the start, control growing beside it) and actions at the end.
const SEC_CARD = 'v2-card v2-security kt-card'
const SEC_HEAD = 'v2-card__head kt-card-header'
const SEC_TITLE = 'kt-card-title text-base font-semibold text-mono'
const SEC_BODY = 'v2-card__body v2-security__body kt-card-content'
const SEC_ROW = 'v2-field v2-field--row v2-security__field kt-form-item lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-baseline lg:[&>:not(label,.v2-field__label)]:col-start-2'
const SEC_LABEL = 'kt-form-label leading-tight max-w-56'
const SEC_INPUT = 'kt-input max-[959px]:text-base'
const SEC_TEXT = 'text-sm text-secondary-foreground'
const SEC_ACTIONS = 'v2-security__actions flex flex-wrap items-center justify-end gap-2.5'
const SEC_STATE = 'v2-security__state flex items-center gap-2 ps-0 text-sm text-mono'
const SEC_ON = '<i class="ki-filled ki-check-circle text-base leading-none text-green-500" aria-hidden="true"></i>'
const SEC_OFF = '<i class="ki-filled ki-information-2 text-base leading-none text-muted-foreground" aria-hidden="true"></i>'
const SEC_FEEDBACK = `<div role="alert" class="v2-security__error kt-alert kt-alert-light kt-alert-destructive" data-auth-error hidden></div><p role="status" aria-live="polite" class="v2-security__status ${SEC_TEXT}" data-auth-status></p>`

export function renderV2AccountSecurityCard(props: SecurityProps): string {
  const t = v2Messages.translator(props.locale)
  const root = props.principalKind === 'root' && props.surface === 'xwhm'
  const head = `<div class="${SEC_HEAD}"><h2 id="account-security-heading" class="${SEC_TITLE}">${escapeHtml(t('Two-factor authentication'))}</h2></div>`
  const section = (attrs: string, body: string): string => `<section class="${SEC_CARD}" data-account-security="two-factor"${attrs} aria-labelledby="account-security-heading">${head}<div class="${SEC_BODY}">${body}</div></section>`
  const state = (on: boolean, text: string): string => `<p role="status" class="${SEC_STATE}">${on ? SEC_ON : SEC_OFF}<span>${escapeHtml(text)}</span></p>`
  const row = (id: string, label: string, input: string): string => `<div class="${SEC_ROW}"><label for="${id}" class="${SEC_LABEL}">${escapeHtml(label)}</label><input id="${id}" ${input} class="${SEC_INPUT}"></div>`
  // Owner decision D5: a mailbox's authenticator guards xMail sign-in only, through the mailbox routes.
  const mailbox = props.surface === 'xmail', api = mailbox ? ' data-auth-api="/api/webmail/security"' : ''
  const scope = mailbox ? `<p class="${SEC_TEXT}" data-mailbox-factor-scope>${escapeHtml(t('The authenticator protects xMail sign-in only. Mail apps that use IMAP, POP3 or SMTP keep using the mailbox password, and app passwords are not offered.'))}</p>` : ''
  const removal = mailbox ? `${SEC_FEEDBACK}<form class="v2-security__form" data-auth-disable-form>${row('removal-password', t('Confirm current password'), 'name="password" type="password" dir="ltr" autocomplete="current-password" required')}${row('removal-code', t('Authenticator code'), 'name="code" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" dir="ltr" autocomplete="one-time-code"')}${row('removal-recovery', t('Recovery code'), 'name="recoveryCode" type="text" dir="ltr" autocomplete="off"')}<div class="${SEC_ACTIONS}"><button type="submit" class="v2-btn kt-btn kt-btn-outline kt-btn-destructive">${icon('trash', 16)}${escapeHtml(t('Remove two-factor authentication'))}</button></div></form>` : ''
  if (props.mfaMode === 'disabled') return section(` data-auth-state="development-disabled" data-mfa-disabled data-mfa-configured="${props.totpEnabled}"`, state(false, t('Two-factor verification is disabled in development. Saved factors and recovery codes stay unchanged. Factor management is unavailable in this mode.')))
  if (props.readOnly) return section(` data-auth-state="read-only" data-auth-readonly="true" data-mfa-configured="${props.totpEnabled}"`, `${state(false, t(msgctxt('account-security', 'Two-factor settings cannot be changed from a handed-off session.')))}<p class="${SEC_TEXT}">${escapeHtml(props.totpEnabled ? t('Sign-in asks for an authenticator code because two-factor authentication is enabled.') : t(msgctxt('account-security', 'Password sign-in is active.')))}</p>`)
  if (props.totpEnabled) return section(` data-mfa-enabled="true"${api}`, `${state(true, t('Sign-in asks for an authenticator code because two-factor authentication is enabled.'))}${root ? `<p class="${SEC_TEXT}">${rootRecoveryHint(t)}</p>` : ''}${scope}${removal}`)
  const intro = `<p role="status" class="${SEC_STATE}"${root ? ' data-mfa-recommendation' : ''}>${SEC_OFF}<span>${escapeHtml(root ? t('Two-factor authentication is off for root. Enabling an authenticator is recommended and does not block this workspace.') : t('Password sign-in is active. You can add an authenticator whenever you choose.'))}</span></p>`
  const setup = `<form class="v2-security__form" data-auth-setup-form>${row('enrollment-password', t('Confirm current password'), 'name="password" type="password" dir="ltr" autocomplete="current-password" required')}<div class="${SEC_ACTIONS}"><button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-action="setup-2fa">${icon('shield', 16)}${escapeHtml(t('Start enrollment'))}</button></div></form>`
  const details = `<div class="v2-security__stack" data-auth-enrollment-details hidden><div class="${SEC_ROW}" data-auth-totp-qr-field hidden><span class="v2-field__label ${SEC_LABEL}">${escapeHtml(t('Scan this QR code with your authenticator app'))}</span><div class="v2-security__qr" data-auth-totp-qr dir="ltr"></div></div><div class="${SEC_ROW}"><span class="v2-field__label ${SEC_LABEL}">${escapeHtml(t('Authenticator setup key'))}</span><div><bdi class="v2-mono v2-security__secret text-sm text-mono break-all" dir="ltr" data-auth-totp-secret></bdi></div></div><p class="${SEC_TEXT}">${escapeHtml(t('Scan the QR code or enter this key in your authenticator app, then submit its code.'))}</p><form class="v2-security__form" data-auth-enroll-form>${row('enrollment-code', t('Authenticator code'), 'name="code" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" dir="ltr" autocomplete="one-time-code" required')}<div class="${SEC_ACTIONS}"><button type="submit" class="v2-btn v2-btn--primary kt-btn kt-btn-primary">${icon('check', 16)}${escapeHtml(t('Verify and enable'))}</button></div></form><div class="${SEC_ACTIONS}"><button type="button" class="v2-btn kt-btn kt-btn-ghost" data-action="restart-enrollment">${icon('refresh', 16)}${escapeHtml(t('Restart enrollment'))}</button></div></div>`
  const recovery = `<section class="v2-security__stack v2-security__recovery" data-auth-recovery hidden aria-labelledby="recovery-heading"><h3 id="recovery-heading" class="text-sm font-semibold text-mono">${escapeHtml(t('Save your recovery codes'))}</h3><p class="${SEC_TEXT}">${escapeHtml(t('Store these codes safely. Each code can be used once. They disappear when you continue.'))}</p><ul class="v2-security__codes grid grid-cols-2 sm:grid-cols-3 gap-2.5" data-auth-recovery-codes></ul><div class="${SEC_ACTIONS}"><button type="button" class="v2-btn v2-btn--primary kt-btn kt-btn-primary" data-action="acknowledge-recovery">${icon('check', 16)}${escapeHtml(t('I saved the codes — continue'))}</button></div></section>`
  return section(` data-auth-state="optional"${api}`, `${scope}${SEC_FEEDBACK}<div class="v2-security__stack" data-auth-enrollment>${intro}${setup}${details}</div>${recovery}`)
}

/** The selected V2 page supplies one explicit host; absence cannot silently drop security controls. */
export const renderV2AccountSecuritySlot: UiTheme['slots']['accountSecurity'] = ({ bodyHtml, security }) => {
  if (bodyHtml.split(V2_SECURITY_SLOT).length !== 2) throw new Error('v2_account_security_slot_missing_or_duplicated')
  return bodyHtml.replace(V2_SECURITY_SLOT, renderV2AccountSecurityCard(security) + renderV2IdentityCards(security))
}

export function renderV2CommandPalette(props: CommandPaletteProps): string {
  return props.surface === 'login' ? '' : commandPalette(v2Messages.translator(props.locale), { surface: props.surface, entries: props.entries })
}

export function renderV2ActivityDrawer(props: ActivityDrawerProps): string {
  const t = v2Messages.translator(props.locale)
  const status = { queued: msgid('Queued'), running: msgid('Running'), succeeded: msgid('Succeeded'), failed: msgid('Failed'), cancelled: msgid('Cancelled') }
  const jobs = props.live.recentJobs.map(job => `<li class="v2-activity-row" data-job-state="${job.status}"><div><strong>${escapeHtml(t(msgctxt('theme:v2', 'Host job')))}</strong>${statusPill({ tone: job.status === 'failed' ? 'bad' : job.status === 'succeeded' ? 'ok' : 'info', label: t(status[job.status]) })}</div><dl><div><dt>${escapeHtml(t('Job Ref'))}</dt><dd>${escapeHtml(t('Unnumbered'))}</dd></div><div><dt>${escapeHtml(t('Kind'))}</dt><dd><bdi class="v2-mono" dir="ltr">${escapeHtml(job.kind)}</bdi></dd></div><div><dt>${escapeHtml(t('Progress'))}</dt><dd><bdi class="v2-num" dir="ltr">${Number.isFinite(job.progress) && job.progress >= 0 && job.progress <= 100 ? formatAsciiNumber(job.progress) + '%' : '—'}</bdi></dd></div><div><dt>${escapeHtml(t('Updated'))}</dt><dd><bdi dir="ltr"><time datetime="${escapeHtml(job.updatedAt)}">${escapeHtml(formatDisplayDateTime(job.updatedAt))}</time></bdi></dd></div></dl>${job.error ? `<p role="status">${escapeHtml(job.error)}</p>` : ''}</li>`).join('')
  const audit = props.live.recentAuditEntries.map(entry => `<li class="v2-activity-row"><div><strong>${escapeHtml(auditActionLabel(entry.action, props.locale))}</strong>${statusPill({ tone: entry.outcome === 'ok' ? 'ok' : entry.outcome === 'denied' ? 'warn' : 'bad', label: auditOutcomeLabel(entry.action, entry.outcome, props.locale) })}</div><dl><div><dt>${escapeHtml(t('Actor'))}</dt><dd><bdi dir="ltr">${escapeHtml(auditActorLabel(entry.actor) || '—')}</bdi></dd></div><div><dt>${escapeHtml(t('Target'))}</dt><dd><bdi dir="ltr">${escapeHtml(auditTargetLabel(entry.target, props.locale) || '—')}</bdi></dd></div><div><dt>${escapeHtml(t('Date'))}</dt><dd><bdi dir="ltr"><time datetime="${escapeHtml(entry.at)}">${escapeHtml(formatDisplayDateTime(entry.at))}</time></bdi></dd></div></dl></li>`).join('')
  const bodyHtml = `<section class="v2-security__stack" aria-labelledby="v2-activity-jobs"><h3 id="v2-activity-jobs">${escapeHtml(t(msgctxt('theme:v2', 'Recent jobs')))}</h3>${jobs ? `<ul class="v2-activity-list">${jobs}</ul>` : `<p class="v2-muted">${escapeHtml(t(msgctxt('theme:v2', 'No recent jobs were supplied.')))}</p>`}</section><section class="v2-security__stack" aria-labelledby="v2-activity-audit"><h3 id="v2-activity-audit">${escapeHtml(t(msgctxt('theme:v2', 'Recent activity')))}</h3>${audit ? `<ul class="v2-activity-list">${audit}</ul>` : `<p class="v2-muted">${escapeHtml(t(msgctxt('theme:v2', 'No recent audit observations were supplied.')))}</p>`}</section>`
  const reconcile = props.live.reconcile
  return activityDrawer(t, { bodyHtml, ...(reconcile.generationId > 0 && reconcile.updatedAt !== null ? { generation: { id: reconcile.generationId, applied: reconcile.status === 'applied' } } : {}) })
}

export function renderV2ReconcileBanner(props: ReconcileBannerProps): string {
  const t = v2Messages.translator(props.locale)
  const live = props.live, value = live.reconcile
  const stages = [
    ['render', msgid('1. Render config')], ['test', msgid('2. Config test')], ['switch', msgid('3. Atomic switch')],
    ['reload', msgid('4. Service reload')], ['verify', msgid('5. Health verify')],
  ] as const
  const banner = reconcileBanner(t, { generationId: value.generationId, status: value.status, observed: value.updatedAt !== null,
    stages: stages.map(([stage, label]) => ({ stage, label: t(label), status: value.stages[stage] })),
    ...(value.failedTest ? { failedTest: value.failedTest } : {}), ...(value.error ? { error: value.error } : {}) })
  const ws = live.connectionState === 'connected' ? t('Live stream connected') : live.connectionState === 'reconnecting' ? t('Reconnecting live stream...') : t('Live stream offline')
  const metadata = value.stateChecksum && value.durationMs !== null
    ? `<p class="v2-reconcile-facts v2-mono v2-num" data-v2-reconcile-meta><bdi dir="ltr">${escapeHtml(t('{filesCount} files · {durationMs} ms · sha256 {checksum}', { filesCount: value.filesCount, durationMs: value.durationMs, checksum: value.stateChecksum }))}</bdi></p>` : ''
  return `<div class="v2-global-reconcile"><div class="v2-reconcile-connection" data-ws-state="${live.connectionState}" data-v2-reconcile-connection>${escapeHtml(ws)}</div>${banner}${metadata}</div>`
}

export function renderV2DocumentBody(props: DocumentBodyProps): string {
  const t = v2Messages.translator(props.locale)
  const impersonation = props.impersonation ? (() => {
    const sentence = escapeHtml(t('Signed in as {target} by {issuer}', { target: '\uE000', issuer: '\uE001' }))
      .replace('\uE000', `<bdi dir="ltr">${escapeHtml(props.impersonation!.target)}</bdi>`)
      .replace('\uE001', `<bdi dir="ltr">${escapeHtml(props.impersonation!.issuer)}</bdi>`)
    return `<div class="${BANNER}" role="region" aria-label="${escapeHtml(t('Handed-off session'))}" data-impersonation>${BANNER_ICON}<p class="kt-alert-title">${sentence}</p><div class="kt-alert-toolbar"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-action="logout" data-impersonation-end>${escapeHtml(t('End session'))}</button></div></div>`
  })() : ''
  const qualification = props.qualificationMode ? `<div class="${BANNER}" role="region" aria-label="${escapeHtml(t('Qualification mode'))}" data-qualification-mode>${BANNER_ICON}<p class="kt-alert-title">${escapeHtml(t('Qualification mode is on. Unverified tools are open on this lab host and every operation is recorded in the audit log.'))}</p></div>` : ''
  const themePreview = props.themePreviewName ? `<div class="${BANNER_INFO}" role="status" data-theme-preview>${BANNER_INFO_ICON}<p class="kt-alert-title">${escapeHtml(t('Preview of the theme {name}. It was not chosen or saved, and the next page uses your own theme.', { name: props.themePreviewName }))}</p></div>` : ''
  const body = `${qualification}${themePreview}${impersonation}${props.reconcileHtml}${props.surfaceHtml}${renderBrandingFooter(props.branding, props.locale)}${props.paletteHtml}${props.activityHtml}${V2_PROMPT_TEMPLATE}${props.clientScriptsHtml}`
  return assembleActivityControl(t, body, props.activityHtml)
}

export const v2SharedSlots: UiTheme['slots'] = Object.freeze({
  documentBody: renderV2DocumentBody, accountSecurity: renderV2AccountSecuritySlot,
  activityDrawer: renderV2ActivityDrawer, commandPalette: renderV2CommandPalette, reconcileBanner: renderV2ReconcileBanner,
})

export const V2_SLOTS_CSS = `.v2-security__body{gap:1.25rem}
.v2-security__stack,.v2-security__form{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-security [data-auth-status]:empty{display:none}
.v2-security__tok{white-space:nowrap}
.v2-security__qr>svg{display:block;max-inline-size:12rem;block-size:auto;padding:.5rem;border:1px solid var(--line);border-radius:var(--radius-control)}
[data-ui-theme="v2"] .v2-security.v2-card .v2-security__state[role=status]:not(.kt-alert)::before{content:none}
[data-ui-theme="v2"] .v2-security .v2-security__form{max-inline-size:none}
.v2-security__codes>li{padding:.375rem .625rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--subtle);font-family:var(--font-mono);font-size:.8125rem;text-align:center}
.v2-impersonation{flex:none;padding-inline:var(--space-3)}
.v2-impersonation>p{min-inline-size:0;overflow-wrap:anywhere}
.v2-activity-list{display:flex;flex-direction:column;gap:var(--space-2)}
.v2-activity-row{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-2);border-radius:var(--radius-notice);border:1px solid var(--line);background:var(--subtle)}
.v2-activity-row>div:first-child{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-1)}
.v2-activity-row dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:var(--space-2)}
.v2-activity-row dl>div{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0}
.v2-activity-row dt{font-size:12px;color:var(--muted)}
.v2-activity-row dd{overflow-wrap:anywhere}
.v2-global-reconcile{flex:none;padding:var(--space-2) var(--space-3) 0}
.v2-reconcile-connection{font-size:12px;color:var(--muted);padding-block-end:var(--space-1)}
.v2-reconcile-facts{padding:var(--space-2);font-size:12px;overflow-wrap:anywhere}
[data-ui-theme="v2"] [data-handoff-control]{display:inline-flex;flex-direction:column;align-items:flex-start;gap:var(--space-1);min-inline-size:0}
[data-ui-theme="v2"] [data-handoff-status]{overflow-wrap:anywhere}
[data-ui-theme="v2"] [data-brand-footer]{flex:none;display:flex;flex-wrap:wrap;justify-content:center;gap:var(--space-1) var(--space-3);padding:0 var(--space-3) var(--space-2);font-size:12px;color:var(--muted)}` + '\n' + V2_PROMPT_CSS
