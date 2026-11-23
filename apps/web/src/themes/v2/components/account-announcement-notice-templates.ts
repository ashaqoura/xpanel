import { icon } from '../icons.ts'

type Severity = 'info' | 'warning' | 'maintenance'
// The Metronic light alert of each severity; maintenance reads as information with its own icon.
const ALERT: Readonly<Record<Severity, string>> = {
  info: 'v2-notice v2-notice--info v2-account-announcement kt-alert kt-alert-light kt-alert-primary',
  warning: 'v2-notice v2-notice--warn v2-account-announcement kt-alert kt-alert-light kt-alert-warning',
  maintenance: 'v2-notice v2-notice--info v2-account-announcement kt-alert kt-alert-light kt-alert-primary',
}

/** V2 owns notice identity and layout independently of the Classic banner. Core prepends the dismiss label to the
 *  small ghost button, before its Keenicon. */
export function v2AccountAnnouncementNoticeTemplates(): string {
  return (['info', 'warning', 'maintenance'] as const).map(severity => `<template data-xp-template="account-announcement-notice-${severity}"><div class="${ALERT[severity]}" data-account-announcement="" data-severity="" role="status">${icon(severity === 'warning' ? 'alert' : severity === 'maintenance' ? 'clock' : 'info')}<div class="v2-notice__body v2-account-announcement__text kt-alert-title"><p class="v2-account-announcement__title"><span class="v2-account-announcement__severity kt-badge kt-badge-sm kt-badge-outline" data-xp-slot="severity"></span><span data-xp-slot="title"></span></p><p class="v2-account-announcement__body" data-xp-slot="body"></p><p class="v2-muted" data-xp-slot="expiry"><bdi dir="ltr" class="v2-mono" data-xp-slot="end"></bdi></p></div><button class="v2-notice__dismiss kt-btn kt-btn-sm kt-btn-ghost shrink-0" type="button" data-account-announcement-dismiss="" aria-label="" data-xp-slot="dismiss" disabled>${icon('x', 14)}</button></div></template>`).join('')
}

/** Used only by the existing account-announcement preview route. */
export const V2_ACCOUNT_ANNOUNCEMENT_CSS = `:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement{flex-wrap:wrap;min-inline-size:0}
:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement__text{flex:1 1 200px;min-inline-size:0}
:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement p{overflow-wrap:anywhere}
:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement__title{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-weight:600;color:var(--mono,var(--text))}
:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement__body{white-space:pre-line}
:where([data-ui-theme="v2"]) [data-whm-announcements-workspace] .v2-account-announcement .v2-muted{font-size:.75rem}
`
