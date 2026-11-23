import { escapeHtml, hookAttrs, type HookAttributes, type Tone } from '../html.ts'
import { icon, type IconName } from '../icons.ts'
import { sparklinePaths } from './chart.ts'

export interface KpiCardProps {
  label: string
  headingLevel?: 2 | 3
  value: string
  /** Keeps the numeric display scale when a client will populate digits later. */
  numeric?: boolean
  /** Unit or capacity after the value, such as "%" or "/ 10 GB". */
  unit?: string
  unitHooks?: HookAttributes
  alwaysRenderUnit?: boolean
  icon?: IconName
  /** Icon tile tone; status tones also color the meter bar. */
  tone?: Tone
  /** Quota bar, 0-100. The caller picks the tone from the product thresholds; the note says the state in words. */
  meter?: { percent: number; tone?: Tone; hidden?: boolean; fillHooks?: HookAttributes }
  /** Trend sparkline; `label` is its text summary for assistive technology. */
  spark?: { values: readonly number[]; label: string }
  note?: string
  noteTone?: Tone
  /** Hooks on the value, such as `data-live-kpi` for live updates. */
  valueHooks?: HookAttributes
  hooks?: HookAttributes
}

const clampPercent = (value: number): number => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

/** The track of a tone: kt-progress with the Metronic variant that colors its indicator. */
export const BAR_TRACK: Readonly<Record<Tone, string>> = {
  info: 'v2-bar kt-progress kt-progress-primary', ok: 'v2-bar kt-progress kt-progress-success', warn: 'v2-bar kt-progress kt-progress-warning',
  bad: 'v2-bar kt-progress kt-progress-destructive', neutral: 'v2-bar kt-progress',
}
/** The fill of a tone; a neutral fill keeps the v2 color, so it takes no indicator class. */
export const BAR_FILL: Readonly<Record<Tone, string>> = {
  info: 'v2-bar__fill v2-bar--info kt-progress-indicator', ok: 'v2-bar__fill v2-bar--ok kt-progress-indicator', warn: 'v2-bar__fill v2-bar--warn kt-progress-indicator',
  bad: 'v2-bar__fill v2-bar--bad kt-progress-indicator', neutral: 'v2-bar__fill v2-bar--neutral',
}

export function kpiCard(props: KpiCardProps): string {
  const h = `h${props.headingLevel ?? 3}`
  const tone = props.tone ?? 'info'
  const meter = props.meter
    ? `<div class="${BAR_TRACK[props.meter.tone ?? 'info']}" aria-hidden="true"${props.meter.hidden ? ' hidden' : ''}><span class="${BAR_FILL[props.meter.tone ?? 'info']}"${hookAttrs(props.meter.fillHooks)} style="inline-size:${clampPercent(props.meter.percent)}%"></span></div>` : ''
  const spark = props.spark && props.spark.values.length > 1 ? (() => {
    const { area, line } = sparklinePaths(props.spark.values, 120, 28)
    return `<svg class="v2-kpi__spark" role="img" aria-label="${escapeHtml(props.spark.label)}" viewBox="0 0 120 28" preserveAspectRatio="none"><path d="${area}" fill="currentColor" opacity="0.12"/><path d="${line}" fill="none" stroke="currentColor" stroke-width="1.75" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`
  })() : ''
  const unit = props.unit || props.alwaysRenderUnit ? `<span class="v2-kpi__unit"${hookAttrs(props.unitHooks)}>${escapeHtml(props.unit ?? '')}</span>` : ''
  const textValue = !props.numeric && !/\d/.test(props.value)
  return `<article class="v2-kpi kt-card"${hookAttrs(props.hooks)}>
<div class="v2-kpi__head"><${h}>${escapeHtml(props.label)}</${h}>${props.icon ? `<span class="v2-tile v2-tile--${tone}" aria-hidden="true">${icon(props.icon)}</span>` : ''}</div>
<p class="v2-kpi__value${textValue ? ' v2-kpi__value--text' : ''} v2-num"><span${hookAttrs(props.valueHooks)}>${escapeHtml(props.value)}</span>${unit}</p>
${meter}${spark}${props.note ? `<p class="v2-kpi__note v2-num${props.noteTone ? ` v2-text--${props.noteTone}` : ''}">${escapeHtml(props.note)}</p>` : ''}
</article>`
}

// The Metronic stat tile: a small secondary label over a large semibold figure (text-2xl, mono colour), the icon
// in a soft circle at the end of the label row. The card surface itself comes from kt-card.
export const KPI_CARD_CSS = `.v2-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));align-items:stretch;gap:1.25rem}
.v2-kpi{height:100%;gap:.375rem;min-width:0;padding:1.25rem}
.v2-kpi__head{display:flex;align-items:center;justify-content:space-between;gap:.625rem}
.v2-kpi__head>:is(h2,h3){font-size:.875rem;line-height:1.4;font-weight:400;letter-spacing:0;color:var(--text-2)}
.v2-kpi__value{display:flex;flex-wrap:wrap;align-items:baseline;gap:.375rem;margin-block-end:auto;color:var(--mono,var(--text))}
.v2-kpi__value>span{unicode-bidi:plaintext}
.v2-kpi__value>:first-child{font-size:1.5rem;line-height:2rem;font-weight:600}
.v2-kpi__value--text>:first-child{font-size:1.125rem}
.v2-kpi__unit{font-size:.875rem;font-weight:400;color:var(--text-2)}
.v2-kpi__spark{display:block;width:100%;height:26px;color:var(--accent)}
.v2-kpi__note{font-size:.75rem;line-height:1.4;color:var(--muted)}
.v2-tile{flex:none;display:flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;border-radius:50%;border:1px solid var(--line)}
.v2-tile--info{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.v2-tile--ok{border-color:var(--ok-line);background:var(--ok-soft);color:var(--ok)}
.v2-tile--warn{border-color:var(--warn-line);background:var(--warn-soft);color:var(--warn)}
.v2-tile--bad{border-color:var(--bad-line);background:var(--bad-soft);color:var(--bad)}
.v2-tile--neutral{background:color-mix(in oklab,var(--kt-accent) 60%,transparent);color:var(--muted)}
.v2-text--ok{color:var(--ok)}.v2-text--warn{color:var(--warn)}.v2-text--bad{color:var(--bad)}.v2-text--info{color:var(--accent)}.v2-text--neutral{color:var(--muted)}
.v2-bar{position:relative;inline-size:100%;height:4px;border-radius:var(--radius-pill);background:var(--secondary);overflow:hidden}
.v2-bar__fill{display:block;height:100%;border-radius:var(--radius-pill);transition:inline-size .25s ease-out}
.v2-bar--info{background:var(--accent-fill)}.v2-bar--ok{background:var(--color-green-500,var(--ok))}.v2-bar--warn{background:var(--color-yellow-500,var(--warn))}.v2-bar--bad{background:var(--destructive)}.v2-bar--neutral{background:var(--line-strong)}
@media(min-width:1024px){.v2-kpi-row{gap:1.875rem}}
`
