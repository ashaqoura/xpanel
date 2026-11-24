import { escapeHtml, hookAttrs, type HookAttributes, type Tone } from '../html.ts'

export interface StatusPillProps {
  tone: Tone
  label: string
  /** Hollow dot: a state that is neither good nor bad, such as "Not installed" or "Not enforced". */
  hollow?: boolean
  /** Announces later changes of the label (role="status"). */
  live?: boolean
  hooks?: HookAttributes
}

// The Metronic status badge of each tone: an outline kt-badge, fully rounded, with a kt-badge-dot.
const BADGE: Readonly<Record<Tone, string>> = {
  ok: 'kt-badge kt-badge-outline kt-badge-success rounded-[30px]',
  warn: 'kt-badge kt-badge-outline kt-badge-warning rounded-[30px]',
  bad: 'kt-badge kt-badge-outline kt-badge-destructive rounded-[30px]',
  info: 'kt-badge kt-badge-outline kt-badge-primary rounded-[30px]',
  neutral: 'kt-badge kt-badge-outline kt-badge-secondary rounded-[30px]',
}

/** Status is never color alone: a dot and a word. */
export const statusPill = (props: StatusPillProps): string =>
  `<span class="v2-pill v2-pill--${props.tone}${props.hollow ? ' v2-pill--hollow' : ''} ${BADGE[props.tone]}"${props.live ? ' role="status"' : ''}${hookAttrs(props.hooks)}><span class="v2-pill__dot${props.hollow ? '' : ' kt-badge-dot'}" aria-hidden="true"></span>${escapeHtml(props.label)}</span>`

/** The pill of a template clone: core fills the label slot, and the tone follows the clone root's state through
 *  {@link stateTones}, so core never sets a class. */
export const statePill = (slot = 'state'): string =>
  `<span class="v2-pill v2-pill--state"><span class="v2-pill__dot" aria-hidden="true"></span><span data-xp-slot="${slot}"></span></span>`

const TONE_VARS: Readonly<Record<Tone, readonly [string, string, string]>> = {
  ok: ['--ok-soft', '--ok', '--ok-line'], warn: ['--warn-soft', '--warn', '--warn-line'], bad: ['--bad-soft', '--bad', '--bad-line'], info: ['--accent-soft', '--accent', '--accent-line'], neutral: ['--sunken', '--text-2', '--line'],
}

/** CSS that tones the state pills and icon tiles inside a clone root by its state attribute (data-state or
 *  data-level), one rule per token the controller sets. */
export const stateTones = (root: string, attribute: 'data-state' | 'data-level', tokens: Readonly<Record<string, Tone>>): string =>
  Object.entries(tokens).map(([token, tone]) => `${root}[${attribute}=${token}] :is(.v2-pill--state,.v2-tile--state){border-color:var(${TONE_VARS[tone][2]});background:var(${TONE_VARS[tone][0]});color:var(${TONE_VARS[tone][1]})}`).join('\n')

// A pill written with the v2 classes alone (a template clone toned by its root's state, or page markup) takes the
// kt-badge outline values from these rules.
export const STATUS_PILL_CSS = `.v2-pill{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;width:fit-content;height:1.5rem;min-inline-size:1.5rem;padding:0 .45rem;border-radius:30px;border:1px solid var(--line);font-size:.8125rem;font-weight:500;line-height:1rem;white-space:nowrap}
.v2-pill__dot{flex:none;width:.375rem;height:.375rem;border-radius:50%;background:currentColor;opacity:.75}
.v2-pill--hollow .v2-pill__dot{background:transparent;box-shadow:inset 0 0 0 1.5px currentColor}
.v2-pill--ok{border-color:var(--ok-line);background:var(--ok-soft);color:var(--ok)}
.v2-pill--warn{border-color:var(--warn-line);background:var(--warn-soft);color:var(--warn)}
.v2-pill--bad{border-color:var(--bad-line);background:var(--bad-soft);color:var(--bad)}
.v2-pill--info{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.v2-pill--neutral,.v2-pill--state{border-color:var(--line);background:var(--secondary);color:var(--text)}
`
