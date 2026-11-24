import { phoneLabelCss } from '../settings/common.ts'

/** Blocks whose direct fields stack the label 8px above its control or value on the same start edge (no label column). */
const ROWS = ':is(.v2-card__body,form,fieldset,[role=tabpanel],.v2-panel-operation-fields)'

export const PANEL_OPERATIONS_CSS = `.v2-panel-operations{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-panel-operation-stack{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-panel-operation-dialog h2{font-size:1.125rem;line-height:1.75rem;font-weight:600}
.v2-panel-operations .v2-card__body{gap:var(--space-3)}
.v2-panel-operations .v2-card--flush>.v2-card__body{gap:0}
.v2-panel-operation-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px);gap:var(--space-3);align-items:stretch;min-inline-size:0}.v2-panel-operation-columns--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.v2-panel-operation-columns>.v2-panel-operation-stack{gap:var(--space-3)}
.v2-panel-operation-columns>.v2-panel-operation-stack>.v2-card:last-child{display:flex;flex-direction:column;flex:1 1 auto}
.v2-panel-operation-columns>.v2-panel-operation-stack>.v2-card:last-child>.v2-card__body{display:flex;flex-direction:column;flex:1 1 auto}
.v2-panel-operation-columns>.v2-panel-operation-stack>.v2-card:last-child>.v2-card__body>.v2-panel-operation-actions:last-child{margin-block-start:auto}
.v2-panel-operation-fields{container-type:inline-size;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));align-items:start;gap:var(--space-2);min-inline-size:0}
@container (min-width:40rem){.v2-panel-operation-fields:not(:has(>.v2-panel-operation-inline))>.v2-field{grid-column:1/-1}}
.v2-panel-operations ${ROWS}>.v2-field{display:flex;flex-direction:column;align-items:stretch;gap:var(--space-1);text-align:start}
.v2-panel-operations ${ROWS}>.v2-field>*{min-inline-size:0;margin-block:0}
.v2-panel-operations [data-account-backup]{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-panel-operations [data-backup-files-steps]{list-style:none;padding:0;gap:var(--space-1) var(--space-3);font-size:.8125rem;line-height:var(--lh-cap);font-weight:500;color:var(--text-2)}
.v2-panel-operations [data-backup-files-steps]>li{display:flex;align-items:center;gap:var(--space-1)}
.v2-panel-operations [data-backup-files-steps] strong{display:inline-flex;align-items:center;justify-content:center;inline-size:1.875rem;block-size:1.875rem;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-weight:600;font-variant-numeric:tabular-nums;flex:none}
.v2-panel-operations [data-backup-files-steps]>[aria-current=step]{color:var(--mono,var(--text));font-weight:600}
.v2-panel-operations [data-backup-files-steps]>[aria-current=step] strong{background:var(--accent-fill);color:var(--on-accent)}
.v2-panel-operation-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:var(--space-2);min-inline-size:0}
.v2-panel-operation-facts>div,.v2-panel-operations .v2-tool-card__facts>div{display:flex;flex-direction:column;align-items:stretch;gap:var(--space-1);min-inline-size:0;text-align:start}
.v2-panel-operation-facts :is(dt,dd),.v2-panel-operations .v2-tool-card__facts :is(dt,dd){overflow-wrap:anywhere;margin:0}
.v2-panel-operation-facts dt,.v2-panel-operations .v2-tool-card__facts dt{font-size:.875rem;line-height:var(--lh-label);text-box:trim-end text;font-weight:500;color:var(--text-2)}
.v2-panel-operation-facts dd,.v2-panel-operations .v2-tool-card__facts dd{font-size:1rem;line-height:var(--lh-text);text-box:trim-start text;font-weight:500;color:var(--mono,var(--text));font-variant-numeric:tabular-nums}
.v2-panel-operation-facts bdi{unicode-bidi:isolate}
.v2-panel-operations .v2-card__body>:is(button,a.v2-btn),.v2-panel-operations [role=tabpanel]>:is(button,a.v2-btn){align-self:flex-start}
.v2-panel-operations .v2-field>p,.v2-panel-operations .v2-field__help{font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--muted)}
.v2-panel-operations [role=tabpanel]:not(.v2-tabpanel){display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-panel-operations [role=tabpanel][hidden]{display:none}
.v2-panel-operations :is([data-ftp-sessions-tool],[data-runtime-preflight]){display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-panel-operation-table .v2-pill{margin-inline-end:.25rem}
.v2-panel-operation-table .v2-panel-operation-actions{flex-wrap:wrap;gap:var(--space-1)}
.v2-card.v2-panel-terminal-session{padding:0;gap:0}
.v2-panel-operations .v2-panel-terminal-session>.v2-panel-terminal-pad{gap:var(--space-3);padding:var(--v2-panel-padding)}
.v2-panel-operations pre:empty{display:none}
.v2-panel-operation-inline{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2);min-inline-size:0}
.v2-panel-operation-inline>.v2-field{flex:1 1 180px;gap:var(--space-1);min-inline-size:0}
.v2-panel-operation-fields:has(>.v2-panel-operation-inline){grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.v2-panel-operations .v2-steps--inline>.v2-step{flex:1 1 150px}
.v2-panel-operations .v2-steps--inline .v2-step__label{white-space:nowrap}
.v2-panel-operation-actions{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1)}
.v2-panel-operations :is(.v2-card__body,form,[role=tabpanel],[data-ftp-anonymous-tool])>.v2-panel-operation-actions:has(>.kt-btn-primary){justify-content:flex-end}
.v2-panel-operations :is(.v2-card__body,form,[role=tabpanel],[data-ftp-anonymous-tool])>.v2-panel-operation-actions:has(>.kt-btn-primary:first-child){flex-direction:row-reverse;justify-content:flex-start}
.v2-panel-operation-actions [aria-disabled=true]{pointer-events:none;opacity:.5}
.v2-panel-operations :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-panel-operations :is(input,select,textarea){min-inline-size:0;max-inline-size:100%}
.v2-panel-operation-table{max-inline-size:100%;overflow:auto;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-panel-operation-table td[colspan]{padding-block:var(--space-3);text-align:center;color:var(--muted)}
.v2-panel-operation-table:has(tbody:empty){display:none}
.v2-panel-operation-table table{min-inline-size:480px}
.v2-panel-operation-table :is(th,td){text-align:start;overflow-wrap:break-word}
.v2-panel-operation-table thead th,.v2-panel-operations .v2-tool-card__table thead th{white-space:normal}
.v2-panel-operation-table :is(bdi,time){unicode-bidi:isolate;font-family:var(--font-mono);font-variant-numeric:tabular-nums}
.v2-panel-operations :is(.v2-num,.v2-kpi__value,td,time,[data-account-backup-count],[data-runtime-stat],[data-runtime-version],[data-sw-apps-sequence],[data-sw-apps-expires]){font-variant-numeric:tabular-nums}
.v2-panel-operation-table .v2-panel-operation-stack{gap:var(--space-1);align-items:flex-start}
.v2-panel-operation-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:var(--space-2);min-inline-size:0}
.v2-panel-operation-options legend{margin-block-end:var(--space-1);padding:0;font-size:.875rem;line-height:var(--lh-label);font-weight:600;color:var(--mono,var(--text))}
.v2-panel-operation-options label{display:flex;align-items:flex-start;gap:var(--space-1);padding:var(--space-2);border:1px solid var(--line-strong);border-radius:var(--radius-card);font-size:.875rem;line-height:var(--lh-label);font-weight:500;color:var(--mono,var(--text));min-block-size:var(--target);cursor:pointer}
.v2-panel-operation-options label:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.v2-panel-operation-options label:has(input:disabled){cursor:not-allowed}
.v2-panel-operation-options label:has(input:disabled:not(:checked)){background:var(--subtle);color:var(--text-2);font-weight:400}
.v2-panel-operation-check{display:flex;align-items:center;gap:var(--space-1);min-block-size:var(--target);font-size:.875rem;line-height:var(--lh-label);color:var(--text)}
.v2-panel-operation-options input,.v2-panel-operation-check input{flex:none;margin-block-start:.125rem}
.v2-panel-operations .v2-card__body>p:not([role=status],[role=alert],[class]),.v2-panel-operations .v2-card__body>div>p:not([role=status],[role=alert],[class]),.v2-panel-operations [role=tabpanel]>p:not([role=status],[role=alert]){font-size:1rem;line-height:var(--lh-text);color:var(--text-2)}
.v2-panel-operations :is([role=status],[role=alert])[data-state]:not([data-state=failed],[data-state=error]){font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-panel-operations :is([role=status],[role=alert])[data-state]:is([data-state=uncertain],[data-state=invalid],[data-state=unavailable]):not(:empty){padding:var(--space-2);border:1px solid var(--warn-line);background:var(--warn-soft);border-radius:var(--radius-notice,var(--radius-control));color:var(--text)}
.v2-panel-operations .v2-field>:is(input,select,textarea,.v2-select){inline-size:100%}
.v2-panel-operation-dialog{inline-size:min(560px,calc(100% - 2rem));padding:var(--v2-panel-padding);border:1px solid var(--line-strong);border-radius:var(--radius-card);background:var(--surface);color:var(--text)}
.v2-panel-operation-dialog form{display:flex;flex-direction:column;gap:var(--space-3)}
.v2-panel-operation-dialog::backdrop{background:var(--scrim)}
.v2-panel-operations pre{white-space:pre-wrap;overflow-wrap:anywhere;max-block-size:360px;overflow:auto;background:var(--code);color:var(--code-text);padding:var(--space-2);border-radius:var(--radius-card);min-inline-size:0;font-size:.8125rem;line-height:1.5}
.v2-panel-operations [data-html-frame]{inline-size:100%;min-block-size:240px;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface)}
.v2-panel-operation-unavailable{display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-2);border:1px solid var(--warn-line);border-radius:var(--radius-notice,var(--radius-control));background:var(--warn-soft);font-size:.875rem;line-height:var(--lh-label)}
.v2-panel-operation-unavailable>strong{font-weight:600;color:var(--mono,var(--text))}
.v2-panel-terminal-session{overflow:hidden;min-inline-size:0}
.v2-panel-terminal-head h2{flex:1 1 auto}
.v2-panel-terminal-head :is([data-terminal-pill],[data-terminal-exec-pill]){display:inline-flex;align-items:center;gap:.375rem;block-size:1.5rem;padding:0 .5rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--subtle);color:var(--text-2);font-size:.8125rem;font-weight:500}
.v2-panel-terminal-head [data-tone=ok]{color:var(--ok);background:var(--ok-soft);border-color:var(--ok-line)}
.v2-panel-terminal-head [data-tone=warn]{color:var(--warn);background:var(--warn-soft);border-color:var(--warn-line)}
.v2-panel-terminal-head [data-tone=info]{color:var(--accent);background:var(--accent-soft);border-color:var(--accent-line)}
.v2-panel-operations [data-state-chip]{display:inline-flex;align-items:center;gap:.375rem;block-size:1.5rem;padding:0 .5rem;border:1px solid var(--line);border-radius:var(--radius-control);color:var(--text-2);font-size:.8125rem;font-weight:500}
.v2-panel-operations [data-state-chip=ok]{color:var(--ok);background:var(--ok-soft);border-color:var(--ok-line)}
.v2-panel-operations [data-state-chip=problem]{color:var(--bad);background:var(--bad-soft);border-color:var(--bad-line)}
.v2-panel-terminal-pad{display:flex;flex-direction:column;gap:var(--space-3)}
.v2-panel-terminal-screen{block-size:clamp(280px,50vh,560px);padding:var(--space-2);background:var(--code);color:var(--code-text);font-family:var(--font-mono);overflow:hidden;min-inline-size:0}
.v2-panel-terminal-screen .xterm{block-size:100%}
.v2-panel-terminal-bar{flex-wrap:wrap;align-items:flex-end;gap:var(--space-2)}
.v2-panel-terminal-command{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2);flex:1 1 100%;min-inline-size:0}
.v2-panel-terminal-command>.v2-field{flex:1 1 240px;gap:var(--space-1)}
.v2-panel-operations .v2-tool-card__table{border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-panel-operations:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-panel-operations *{letter-spacing:0}
@media(max-width:640px){.v2-panel-operations{--v2-panel-padding:var(--space-2)}.v2-panel-operation-dialog{padding:var(--space-2)}}
@media(min-width:601px){.v2-panel-operation-table .v2-panel-operation-actions:has(>:nth-child(3)){min-inline-size:232px}}
@media(max-width:1000px){.v2-panel-operation-columns{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-panel-operation-fields,.v2-panel-operation-facts{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-panel-operations .v2-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-panel-operations .v2-kpi-row>.v2-kpi:last-child:nth-child(odd){grid-column:1/-1}}
@media(max-width:600px){.v2-panel-operation-table tr>td:nth-child(2):not([colspan]){grid-column:1/-1;grid-row:auto;justify-self:start;text-align:start}.v2-panel-operation-table td bdi{overflow-wrap:anywhere}}
@media(min-width:601px){.v2-panel-operation-table :is(#v2-runtime-containers-table,#v2-runtime-apps,#v2-ftp-table,#v2-ftp-sessions-table){table-layout:fixed;inline-size:100%}.v2-panel-operation-table :is(#v2-runtime-containers-table,#v2-runtime-apps,#v2-ftp-table) .v2-panel-operation-actions:has(>:nth-child(3)){min-inline-size:0}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(1){inline-size:15%}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(2){inline-size:24%}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(3){inline-size:11%}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(4){inline-size:14%}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(5){inline-size:11%}.v2-panel-operation-table #v2-runtime-containers-table th:nth-child(6){inline-size:25%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(1){inline-size:16%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(2){inline-size:10%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(3){inline-size:22%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(4){inline-size:12%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(5){inline-size:12%}.v2-panel-operation-table #v2-runtime-apps th:nth-child(6){inline-size:28%}.v2-panel-operation-table #v2-ftp-table th:nth-child(1){inline-size:29%}.v2-panel-operation-table #v2-ftp-table th:nth-child(2){inline-size:24%}.v2-panel-operation-table #v2-ftp-table th:nth-child(3){inline-size:10%}.v2-panel-operation-table #v2-ftp-table th:nth-child(4){inline-size:11%}.v2-panel-operation-table #v2-ftp-table th:nth-child(5){inline-size:26%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(1){inline-size:24%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(2){inline-size:17%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(3){inline-size:13%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(4){inline-size:11%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(5){inline-size:11%}.v2-panel-operation-table #v2-ftp-sessions-table th:nth-child(6){inline-size:24%}}
.v2-panel-operation-table #v2-ftp-sessions-table td .v2-btn{white-space:normal}
${phoneLabelCss('.v2-panel-operation-table')}
`
