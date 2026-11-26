/** V2 owns every dynamic IP record, status pill, action and empty state. */
const PILL = { ok: 'v2-pill v2-pill--ok kt-badge kt-badge-outline kt-badge-success', warn: 'v2-pill v2-pill--warn kt-badge kt-badge-outline kt-badge-warning', neutral: 'v2-pill v2-pill--neutral kt-badge kt-badge-outline kt-badge-secondary' } as const
/** The role and primary badge of an IP row; the page and its client templates draw the same one. */
export const ipBadge = (tone: keyof typeof PILL, labelHtml: string): string => `<span class="${PILL[tone]}"><span class="v2-pill__dot kt-badge-dot" aria-hidden="true"></span>${labelHtml}</span>`
export function renderV2WhmIpClientTemplates(): string {
  const technical = (slot: string) => `<td><bdi class="v2-mono v2-num" dir="ltr" data-xp-slot="${slot}"></bdi></td>`
  const badge = (name: string, tone: keyof typeof PILL) => `<template data-xp-template="${name}">${ipBadge(tone, '<span data-xp-slot="label"></span>')}</template>`
  return `<template data-xp-template="whm-ip-row"><tr>${technical('address')}${technical('version')}${technical('interface')}<td><span data-xp-action="role"></span></td>${technical('owner')}${technical('ptr')}<td><span data-xp-action="primary"></span></td><td><button type="button" class="v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive" data-xp-action="remove" disabled><i class="ki-filled ki-trash text-sm" aria-hidden="true"></i><span data-xp-slot="remove-label"></span></button></td></tr></template><template data-xp-template="whm-ip-empty"><tr><td colspan="8" data-xp-slot="message"></td></tr></template>${badge('whm-ip-role-web', 'ok')}${badge('whm-ip-role-mail', 'warn')}${badge('whm-ip-primary', 'ok')}${badge('whm-ip-secondary', 'neutral')}`
}
