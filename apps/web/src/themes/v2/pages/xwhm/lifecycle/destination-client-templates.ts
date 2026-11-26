import { lifecycleIcon, type LifecycleGlyph } from './shared.ts'

const ACTIONS: readonly (readonly [action: string, glyph: LifecycleGlyph])[] = [['edit', 'pencil'], ['test', 'verify'], ['activate', 'okCircle'], ['revoke', 'xCircle'], ['delete', 'trash']]

/** V2 owns destination row geometry; core fills only named values and action admission. A row action carries the bare
 *  v2 button class: the foundation draws it as an outline button, and the lifecycle sheet gives it the row size and
 *  tones the revoking and deleting actions. */
export const v2BackupDestinationTemplates = (): string => `<template data-xp-template="backup-destination-row"><tr><td class="text-base font-medium text-mono" data-xp-slot="name"></td><td class="v2-lifecycle__nowrap"><bdi class="kt-badge kt-badge-outline kt-badge-sm" dir="ltr" data-xp-slot="kind"></bdi></td><td><div class="flex flex-col gap-0.5 min-w-0"><bdi class="text-base text-foreground" dir="ltr" data-xp-slot="endpoint"></bdi><bdi class="text-[13px] leading-(--lh-cap) font-normal text-secondary-foreground" dir="ltr" data-xp-slot="prefix"></bdi></div></td><td class="text-base text-secondary-foreground" data-xp-slot="state"></td><td><div class="v2-lifecycle__actions">${ACTIONS.map(([action, glyph]) => `<button type="button" class="v2-btn" data-xp-action="${action}" disabled>${lifecycleIcon(glyph)}<span data-xp-slot="${action}-label"></span></button>`).join('')}</div></td></tr></template><template data-xp-template="backup-destination-empty"><tr><td colspan="5" data-xp-slot="message"></td></tr></template>`
