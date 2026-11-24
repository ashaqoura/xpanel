import type { PanelEmailAuthority } from '../email-tools/common.ts'
import { card } from '../../../components/index.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { phoneLabelCss, phoneLabels } from '../settings/common.ts'

export interface PanelObservationAuthority extends PanelEmailAuthority {
  /** The independently admitted account log capabilities; absence never enables a log read. */
  readonly logKinds?: readonly ('access' | 'error')[]
  /** Core's current catalog/role-filtered routes, used for links to related authorized workflows. */
  readonly relatedRoutes?: ReadonlySet<string>
  /** True only when core applies the selected owned domain before reading traffic. */
  readonly domainSelectionAvailable?: boolean
  /** Core's verified tools for this account; Raw Access archives need raw-access. */
  readonly qualifiedTools?: ReadonlySet<string>
}

/** Two cards side by side: the wider one first (1.4 to 1), or two equal ones. */
export const pair = (first: string, second: string, even = false): string => `<div class="v2-panel-obs-pair${even ? ' v2-panel-obs-pair--even' : ''}">${first}${second}</div>`
/** Short fact cards in one row. */
export const strip = (body: string): string => `<div class="v2-panel-obs-strip">${body}</div>`
/** A card whose table runs edge to edge under its heading. */
export function tableCard(id: string, title: string, columns: readonly string[], bodyHtml: string, options: { description?: string; bodyHooks?: HookAttributes; headHooks?: HookAttributes; beforeHtml?: string; afterHtml?: string; actionsHtml?: string; footHtml?: string; hooks?: HookAttributes } = {}): string {
  const table = `<div class="v2-panel-obs-table" role="region" tabindex="0" aria-label="${escapeHtml(title)}"><table id="${escapeHtml(id)}-records" class="v2-table kt-table"${phoneLabels(columns)}><caption class="v2-sr">${escapeHtml(title)}</caption><thead${hookAttrs(options.headHooks)}><tr>${columns.map(column => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody${hookAttrs(options.bodyHooks)}>${bodyHtml}</tbody>${options.footHtml ? `<tfoot>${options.footHtml}</tfoot>` : ''}</table></div>`
  return card({ title, titleId: `${id}-heading`, flush: true, bodyHtml: `${options.beforeHtml ? `<div class="v2-panel-obs-inset">${options.beforeHtml}</div>` : ''}${table}${options.afterHtml ? `<div class="v2-panel-obs-inset v2-panel-obs-inset--after">${options.afterHtml}</div>` : ''}`,
    ...(options.description ? { description: options.description } : {}), ...(options.actionsHtml ? { actionsHtml: options.actionsHtml } : {}), ...(options.hooks ? { hooks: options.hooks } : {}) })
}
/** A designed truthful state inside a card: nothing was read, or the read returned nothing. */
export const blankState = (message: string, state: string): string => `<p class="v2-panel-obs-blank" data-chart-state="${escapeHtml(state)}" role="status">${escapeHtml(message)}</p>`

/** The complete stylesheet of the account observation pages; no other page folder's stylesheet is needed. */
export const PANEL_OBSERVATIONS_CSS = `.v2-panel-extra{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-panel-extra .v2-field{display:flex;flex-direction:column;align-items:stretch;gap:var(--space-1);text-align:start}
.v2-panel-extra .v2-field>*{margin-block:0}
.v2-panel-extra .v2-field>.v2-label{display:block;font-size:.875rem;line-height:var(--lh-label);font-weight:500;color:var(--text);text-box:trim-end text}
.v2-panel-extra .v2-field>:is(p,.v2-field__help){font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--muted)}
.v2-panel-extra :is(.v2-num,.v2-kpi__value,.v2-kpi__unit,td,dd,time,[data-health-count],[data-health-problems],[data-ftp-report-fact]){font-variant-numeric:tabular-nums}
.v2-panel-extra .v2-card__body{gap:var(--space-3)}
.v2-panel-extra .v2-card--flush>.v2-card__body{gap:0}
.v2-panel-extra__groups,.v2-panel-extra fieldset{display:grid;gap:var(--space-3);min-inline-size:0}
.v2-panel-extra legend{padding:0;margin-block-end:var(--space-1);font-size:.875rem;line-height:var(--lh-label);font-weight:600;color:var(--mono,var(--text))}
.v2-panel-extra__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:var(--space-2);min-inline-size:0;align-items:start}
.v2-panel-extra__actions,.v2-panel-operation-actions{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1)}
.v2-panel-extra :is(.v2-card__body,.v2-panel-extra__groups)>.v2-panel-extra__actions:has(>.kt-btn-primary){justify-content:flex-end}
.v2-panel-extra :is(.v2-card__body,.v2-panel-extra__groups)>.v2-panel-extra__actions:has(>.kt-btn-primary:first-child){flex-direction:row-reverse;justify-content:flex-start}
.v2-panel-extra__facts,.v2-panel-operation-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:var(--space-2);min-inline-size:0}
.v2-panel-extra__facts>div,.v2-panel-operation-facts>div{display:flex;flex-direction:column;align-items:stretch;gap:var(--space-1);min-inline-size:0;text-align:start}
.v2-panel-extra__facts :is(dt,dd),.v2-panel-operation-facts :is(dt,dd){text-align:start;overflow-wrap:anywhere;margin:0}
.v2-panel-extra__facts dt,.v2-panel-operation-facts dt{font-size:.875rem;line-height:var(--lh-label);text-box:trim-end text;font-weight:500;color:var(--text-2)}
.v2-panel-extra__facts dd,.v2-panel-operation-facts dd{font-size:1rem;line-height:var(--lh-text);text-box:trim-start text;font-weight:500;color:var(--mono,var(--text));font-variant-numeric:tabular-nums}
.v2-panel-extra__facts dd bdi,.v2-panel-operation-facts dd bdi{unicode-bidi:isolate}
.v2-panel-extra__check{display:flex;align-items:center;gap:var(--space-1);min-block-size:var(--target)}
.v2-panel-extra__check>input{flex:none}
.v2-panel-extra__fields>.v2-field:only-child{max-inline-size:360px}
.v2-panel-extra__table,.v2-panel-operation-table,.v2-panel-obs-table{overflow:auto;min-inline-size:0;max-inline-size:100%}
.v2-panel-extra__table,.v2-panel-operation-table{border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-panel-obs-table{border-block-start:1px solid var(--line)}
.v2-panel-extra__table:has(tbody:empty),.v2-panel-operation-table:has(tbody:empty){display:none}
.v2-panel-extra :is(.v2-panel-extra__table,.v2-panel-operation-table,.v2-panel-obs-table) :is(th,td){text-align:start;overflow-wrap:anywhere}
.v2-panel-extra :is(.v2-panel-extra__table,.v2-panel-operation-table,.v2-panel-obs-table) thead th{white-space:normal}
.v2-panel-extra table :is(bdi,time){unicode-bidi:isolate;font-variant-numeric:tabular-nums}
.v2-panel-extra td[colspan]{color:var(--muted);padding-block:var(--space-3);text-align:center}
.v2-panel-extra tfoot :is(th,td){color:var(--mono,var(--text));font-weight:600}
.v2-panel-obs-inset{display:flex;flex-direction:column;gap:var(--space-2);padding:0 var(--v2-panel-padding) var(--space-2)}
.v2-panel-obs-inset--after{margin-block-start:auto;padding-block:var(--space-2) var(--v2-panel-padding);border-block-start:1px solid var(--line)}
.v2-panel-obs-pair{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-3);align-items:stretch;min-inline-size:0}
.v2-panel-obs-pair--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.v2-panel-obs-pair>.v2-card,.v2-panel-obs-strip>.v2-card{height:100%}
.v2-panel-obs-pair>.v2-panel-extra__groups{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-panel-obs-pair>.v2-panel-extra__groups>.v2-card:last-child{flex:1 1 auto}
.v2-panel-obs-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:var(--space-3);align-items:stretch;min-inline-size:0}
.v2-panel-obs-strip>.v2-card>.v2-card__body>.v2-panel-extra__actions:last-child{margin-block-start:auto}
.v2-panel-obs-select{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2) var(--space-3);min-inline-size:0}
.v2-panel-obs-select>*{min-inline-size:0}
.v2-panel-obs-select>form{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2);flex:1 1 320px}
.v2-panel-obs-select>form>:is(.v2-field,.v2-panel-extra__fields){flex:1 1 180px;min-inline-size:0}
.v2-panel-obs-select>form>.v2-panel-extra__fields{flex-basis:420px}
.v2-panel-obs-select>.v2-field{flex:0 1 auto}
.v2-panel-obs-select>.v2-field:first-child{flex:1 1 240px;max-inline-size:420px}

.v2-panel-obs-seg{max-inline-size:100%}
.v2-panel-obs-meta{display:flex;flex-wrap:wrap;gap:var(--space-1);list-style:none;padding:0}
.v2-panel-obs-meta bdi{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
.v2-panel-obs-blank{padding:var(--space-3) var(--space-2);border:1px dashed var(--line-strong);border-radius:var(--radius-card);background:var(--subtle);color:var(--text-2);font-size:.8125rem;line-height:var(--lh-cap);text-align:center}
.v2-panel-obs-bar{display:flex;block-size:.5rem;border-radius:var(--radius-pill);overflow:hidden;background:var(--sunken)}
.v2-panel-obs-bar>span{min-inline-size:2px}
.v2-panel-obs-tone{display:inline-flex;align-items:center;gap:.5rem}
.v2-panel-obs-tone::before{content:"";inline-size:.5rem;block-size:.5rem;border-radius:50%;background:var(--obs-tone,var(--muted));flex:none}
.v2-panel-obs-bar>span[data-tone=ok],.v2-panel-obs-tone[data-tone=ok]{--obs-tone:var(--color-green-500,var(--ok))}
.v2-panel-obs-bar>span[data-tone=info],.v2-panel-obs-tone[data-tone=info]{--obs-tone:var(--accent-fill)}
.v2-panel-obs-bar>span[data-tone=warn],.v2-panel-obs-tone[data-tone=warn]{--obs-tone:var(--color-yellow-500,var(--warn))}
.v2-panel-obs-bar>span[data-tone=bad],.v2-panel-obs-tone[data-tone=bad]{--obs-tone:var(--destructive,var(--bad))}
.v2-panel-obs-bar>span{background:var(--obs-tone,var(--muted))}
.v2-panel-obs-kpis--five{grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr))}
.v2-panel-extra [data-state-chip]{display:inline-flex;align-items:center;gap:.375rem;block-size:1.5rem;padding:0 .5rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--sunken);color:var(--text-2);font-size:.8125rem;font-weight:500;white-space:nowrap}
.v2-panel-extra [data-state-chip]::before{content:"";inline-size:.375rem;block-size:.375rem;border-radius:50%;background:currentColor;flex:none}
.v2-panel-extra [data-state-chip=ok]{color:var(--ok);background:var(--ok-soft);border-color:var(--ok-line)}
.v2-panel-extra [data-state-chip=problem]{color:var(--bad);background:var(--bad-soft);border-color:var(--bad-line)}
.v2-panel-extra [data-state-chip=unavailable]{color:var(--warn);background:var(--warn-soft);border-color:var(--warn-line)}
.v2-panel-extra__scope{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:var(--space-3);padding:0;list-style:none}
.v2-panel-extra__scope>li{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--line);border-radius:var(--radius-card);font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
.v2-panel-extra__scope>li>.v2-tile{flex:none}
.v2-panel-extra :is(p,dd){overflow-wrap:anywhere}
.v2-panel-extra .v2-card__body>p:not([role=status],[role=alert],[class]){font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
.v2-panel-extra :is([role=status],[role=alert])[data-state]:not([data-state=failed],[data-state=error]){font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-panel-extra :is([role=status],[role=alert])[data-state]:is([data-state=uncertain],[data-state=invalid],[data-state=unavailable]):not(:empty){padding:var(--space-2);border:1px solid var(--warn-line);background:var(--warn-soft);border-radius:var(--radius-notice,var(--radius-control));color:var(--text)}
.v2-panel-extra :is(input,select,textarea){min-inline-size:0;max-inline-size:100%}
.v2-panel-extra .v2-field>:is(input,.v2-select){inline-size:100%}
.v2-panel-extra :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-panel-extra pre{white-space:pre-wrap;overflow-wrap:anywhere;max-inline-size:100%;min-inline-size:0;text-align:start}
.v2-panel-extra td>pre,.v2-panel-extra td>code{font-family:var(--font-mono);font-size:.8125rem;line-height:var(--lh-cap)}
.v2-panel-extra [hidden]{display:none}
.v2-panel-extra a.v2-btn[aria-disabled=true]{pointer-events:none;opacity:.5}
.v2-panel-extra:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-panel-extra *{letter-spacing:0}
@media(max-width:1000px){.v2-panel-obs-pair,.v2-panel-obs-pair--even{grid-template-columns:minmax(0,1fr)}}
@media(min-width:1100px){.v2-panel-obs-kpis--five{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(max-width:640px){.v2-panel-extra{--v2-panel-padding:var(--space-2)}}
@media(max-width:600px){.v2-panel-extra__facts,.v2-panel-operation-facts,.v2-panel-extra__fields{grid-template-columns:minmax(0,1fr)}.v2-panel-obs-seg{display:flex;inline-size:100%;overflow-x:auto}.v2-panel-obs-select>.v2-field:first-child{max-inline-size:none}.v2-panel-extra td[colspan]{text-align:start;padding-block:var(--space-2)}}
${phoneLabelCss('.v2-panel-extra')}
@media(max-width:600px){.v2-panel-extra table:not(:has(td)) thead{position:static;inline-size:auto;block-size:auto;clip-path:none}.v2-panel-extra table:not(:has(td)) thead tr{display:flex;flex-wrap:wrap;gap:.25rem var(--space-2);padding:var(--space-1) 0}.v2-panel-extra table:not(:has(td)) th{padding:0;background:none}}
@media(min-width:440px) and (max-width:600px){.v2-panel-extra .v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-panel-extra .v2-kpi-row>.v2-kpi:last-child:nth-child(odd){grid-column:1/-1}}
@media(min-width:601px){.v2-panel-extra #v2-ftp-report-users{table-layout:fixed;inline-size:100%}.v2-panel-extra #v2-ftp-report-users th:nth-child(1){inline-size:46%}.v2-panel-extra #v2-ftp-report-users th:nth-child(2),.v2-panel-extra #v2-ftp-report-users th:nth-child(3){inline-size:16%}.v2-panel-extra #v2-ftp-report-users th:nth-child(4){inline-size:22%}}
@media(max-width:600px){.v2-panel-extra [id^=v2-ftp-report-] td::before{display:block;margin:0 0 .25rem!important}.v2-panel-extra #v2-web-stats-metrics-records{display:block;min-inline-size:0!important}.v2-panel-extra #v2-web-stats-metrics-records>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-panel-extra #v2-web-stats-metrics-records>tbody{display:block}.v2-panel-extra #v2-web-stats-metrics-records>tbody>tr{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1) var(--space-2);padding:var(--space-2);border-block-start:1px solid var(--line)}.v2-panel-extra #v2-web-stats-metrics-records>tbody>tr>td{display:block;padding:0;border:0;min-inline-size:0}.v2-panel-extra #v2-web-stats-metrics-records>tbody>tr>td:first-child{flex:1 1 100%}}
`
