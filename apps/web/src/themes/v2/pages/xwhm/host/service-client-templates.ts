import { type Locale, SOURCE_LOCALE, translator } from '../../../../../i18n.ts'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'

/** The round icon tile of a service row. The row's `data-service-area` picks the glyph, so a row the controller
 *  clones shows the same tile as a row drawn by the server; a row without a known area shows the services glyph. */
export const serviceTile = `<span class="v2-services__tile flex items-center justify-center size-9 shrink-0 rounded-full border border-border bg-accent/60 text-secondary-foreground" aria-hidden="true"><span data-area-icon="web">${icon('globe', 16)}</span><span data-area-icon="mail">${icon('mail', 16)}</span><span data-area-icon="data">${icon('database', 16)}</span><span data-area-icon="access">${icon('shield', 16)}</span><span data-area-icon="">${icon('services', 16)}</span></span>`

/** Row actions: the leading Keenicon names the action beside its label. */
export const SERVICE_ACTION_ICONS = {
  reload: icon('refresh', 14),
  restart: '<i class="ki-filled ki-arrows-loop text-sm" aria-hidden="true"></i>',
  boot: '<i class="ki-filled ki-toggle-on-circle text-sm" aria-hidden="true"></i>',
} as const

/** Theme-owned rows; local selection never carries a native action flag. A phone shows each fact with its label. */
export function renderV2WhmServiceClientTemplates(kind: 'host' | 'manager', locale: Locale = SOURCE_LOCALE): string {
  const label = (message: string) => ` data-phone-label="${escapeHtml(translator(locale)(message))}"`
  // A role, version, uptime, memory size or load state names itself; the others need their label.
  const labels: Record<string, string> = { sub: msgid('Substate'), boot: msgid('Start at boot') }
  const cell = (slot: string) => `<td${labels[slot] ? label(labels[slot]) : ''}><bdi class="v2-mono text-sm text-foreground" dir="ltr" data-xp-slot="${slot}"></bdi></td>`
  // The state is a word in a neutral badge: the controller supplies the label only, never a tone.
  const state = (slot: string) => `<td><span class="v2-pill v2-pill--neutral kt-badge kt-badge-outline kt-badge-secondary rounded-[30px]"><span class="v2-pill__dot kt-badge-dot" aria-hidden="true"></span><span data-xp-slot="${slot}"></span></span></td>`
  if (kind === 'host') return `<template data-xp-template="host-service-row"><tr><th scope="row"><div class="flex items-center gap-2.5">${serviceTile}<button type="button" data-xp-action="select" aria-pressed="false"><span class="text-sm font-medium text-mono" data-xp-slot="service"></span><bdi class="v2-mono text-xs font-normal text-secondary-foreground" dir="ltr" data-xp-slot="unit"></bdi></button></div></th><td class="text-sm text-foreground" data-xp-slot="role"></td>${state('state')}${['version','uptime','memory'].map(cell).join('')}<td><div class="v2-services__actions"><button type="button" class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost kt-btn-sm" disabled>${SERVICE_ACTION_ICONS.reload}<span data-xp-slot="reload-label"></span></button><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-action="restart" disabled>${SERVICE_ACTION_ICONS.restart}<span data-xp-slot="restart-label"></span></button></div></td></tr></template><template data-xp-template="host-service-empty"><tr><td class="text-sm text-secondary-foreground" colspan="7" data-xp-slot="message"></td></tr></template>`
  return `<template data-xp-template="service-manager-row"><tr><td><div class="flex items-center gap-2.5">${serviceTile}<button type="button" data-xp-action="select" aria-pressed="false"><bdi class="v2-mono text-sm font-medium text-mono" dir="ltr" data-xp-slot="unit"></bdi></button></div></td>${['load', 'active', 'sub', 'boot'].map(cell).join('')}<td><div class="v2-host__actions"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-action="restart" disabled>${SERVICE_ACTION_ICONS.restart}<span data-xp-slot="restart-label"></span></button><button type="button" class="v2-btn v2-btn--ghost kt-btn kt-btn-ghost kt-btn-sm" data-xp-action="boot" disabled>${SERVICE_ACTION_ICONS.boot}<span data-xp-slot="boot-label"></span></button><span class="text-xs text-muted-foreground" data-xp-action="protected" data-xp-slot="protected-label"></span></div></td></tr></template><template data-xp-template="service-manager-empty"><tr><td class="text-sm text-secondary-foreground" colspan="6" data-xp-slot="message"></td></tr></template>`
}
