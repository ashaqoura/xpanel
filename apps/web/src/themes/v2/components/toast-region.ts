import type { Translate } from '../../../i18n.ts'
import { escapeHtml } from '../html.ts'

/** The live region the realtime runtime appends toasts to (`#xp-toast-region`, `[data-toast-level]` children). */
export const toastRegion = (t: Translate): string =>
  `<div id="xp-toast-region" class="v2-toasts" role="status" aria-live="polite" aria-label="${escapeHtml(t('Notifications'))}"></div>`

// Toast children come from the runtime as semantic elements: [data-toast-level] > body, then a decorative drain bar.
// The level icon is a Keenicon glyph (information-2, check-circle, information, cross-circle) drawn from the icon
// font the document already loads, in the tone of the level.
const TOAST = '#xp-toast-region>[data-toast-level]'
export const TOAST_REGION_CSS = `.v2-toasts{position:fixed;bottom:1.25rem;inset-inline-end:1.25rem;z-index:95;display:flex;flex-direction:column;gap:.625rem;inline-size:min(380px,calc(100vw - 32px));pointer-events:none}
${TOAST}{position:relative;overflow:hidden;min-height:3.25rem;padding:.875rem 1rem;padding-inline-start:2.875rem;border-radius:var(--radius-notice);background:var(--popover,var(--surface));color:var(--popover-foreground,var(--text));border:1px solid var(--line);box-shadow:var(--v2-elev);font-size:.875rem;font-weight:500;line-height:1.5;pointer-events:auto}
${TOAST}::before{content:"\\eb5e";position:absolute;top:1rem;inset-inline-start:1rem;font:1.25rem/1 keenicons-filled;color:var(--accent)}
${TOAST}[data-toast-level=ok]::before{content:"\\ea1b";color:var(--color-green-500,var(--ok))}
${TOAST}:is([data-toast-level=critical],[data-toast-level=bad],[data-toast-level=error])::before{content:"\\ea46";color:var(--destructive)}
${TOAST}[data-toast-level=warn]::before{content:"\\eb64";color:var(--color-yellow-500,var(--warn))}
${TOAST}>[aria-hidden]{position:absolute;inset-inline-start:0;bottom:0;height:3px;background:var(--accent-fill);animation:v2-drain 4s linear forwards}
${TOAST}[data-toast-level=ok]>[aria-hidden]{background:var(--color-green-500,var(--ok))}
${TOAST}:is([data-toast-level=critical],[data-toast-level=bad],[data-toast-level=error])>[aria-hidden]{background:var(--destructive)}
${TOAST}[data-toast-level=warn]>[aria-hidden]{background:var(--color-yellow-500,var(--warn))}
`
