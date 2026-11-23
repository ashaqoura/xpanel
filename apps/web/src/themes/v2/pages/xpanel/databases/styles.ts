// Layout only: colors, radii, control and button looks come from the Metronic classes in the markup. Gaps use the
// Metronic scale (page and card grids 1.25rem, 1.875rem from the large breakpoint; stacks inside a card 1.25rem).
// Rows the controller rebuilds come from client templates without Metronic classes, so the row and tile looks that
// must match on both renderings are written against the table and list structure.
const SOFT_DANGER = 'border-color:color-mix(in oklab,var(--destructive) 10%,transparent);background:color-mix(in oklab,var(--destructive) 10%,transparent);color:var(--destructive)'
const STATUS = ':not(:empty,[hidden],[data-state=failed],[data-state=error])'

export const PANEL_DATABASES_CSS = `.v2-db-page{--v2-db-gap:1.25rem;display:grid;gap:var(--v2-db-gap);min-inline-size:0}
@media(min-width:1024px){.v2-db-page{--v2-db-gap:1.875rem}}
.v2-db-workspace{display:grid;gap:var(--v2-db-gap);min-inline-size:0}
.v2-db-stack{display:flex;flex-direction:column;gap:var(--v2-db-gap);min-inline-size:0}
.v2-card .v2-db-stack{gap:1.25rem}
.v2-db-form{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-db-columns{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:var(--v2-db-gap);align-items:stretch;min-inline-size:0}
.v2-db-columns:not(.v2-db-columns--stack):not(.v2-db-columns--strip)>.v2-db-stack>.v2-card:last-child{display:flex;flex-direction:column;flex:1 1 auto}
.v2-db-columns:not(.v2-db-columns--stack):not(.v2-db-columns--strip)>.v2-db-stack>.v2-card:last-child>.v2-card__body{display:flex;flex-direction:column;flex:1 1 auto}
.v2-db-columns:not(.v2-db-columns--stack):not(.v2-db-columns--strip)>.v2-db-stack>.v2-card:last-child>.v2-card__body>.v2-db-form{flex:1 1 auto}
.v2-db-columns:not(.v2-db-columns--stack):not(.v2-db-columns--strip)>.v2-db-stack>.v2-card:last-child>.v2-card__body>:is(.v2-btn,.v2-db-actions):last-child,.v2-db-columns:not(.v2-db-columns--stack):not(.v2-db-columns--strip)>.v2-db-stack>.v2-card:last-child .v2-db-form>.v2-db-actions:last-child{margin-block-start:auto}
.v2-db-columns--stack,.v2-db-columns--strip{grid-template-columns:minmax(0,1fr)}.v2-db-columns--strip>aside{order:-1}.v2-db-columns--strip>aside .v2-db-check-list{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:.5rem 1.875rem}
.v2-db-workspace .v2-card__body{gap:1.25rem;container-type:inline-size}
.v2-db-workspace .v2-card__body>p:not([role=status],[class]),.v2-db-form>p:not([role=status],[class]),.v2-db-workspace .v2-card__body>div>p:not([role=status],[class]){font-size:.875rem;line-height:1.5;color:var(--text-2)}
.v2-db-fields{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem;min-inline-size:0}
.v2-db-workspace .v2-field{display:grid;grid-template-columns:minmax(0,1fr);align-items:baseline;gap:.625rem;min-inline-size:0;text-align:start}
.v2-db-workspace .v2-field>*{min-inline-size:0}
.v2-db-workspace .v2-field>label{line-height:1.25}
.v2-db-workspace .v2-field>:is(input,select,textarea,.v2-select){inline-size:100%}
.v2-db-workspace .v2-field>p{font-size:.75rem;line-height:1.5;color:var(--text-2)}
.v2-db-workspace :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-db-workspace :is(input,select,textarea):not([type=checkbox]){inline-size:100%;min-inline-size:0}
.v2-db-workspace :is(fieldset,legend){border:0;margin:0;padding:0;min-inline-size:0}
.v2-db-workspace fieldset{display:grid;gap:.625rem}
.v2-db-facts{display:grid;grid-template-columns:minmax(0,1fr);gap:.625rem;min-inline-size:0}
.v2-db-facts>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .625rem;min-inline-size:0}
.v2-db-facts dt{flex:0 0 9rem;max-inline-size:100%}
.v2-db-facts dd{flex:1 1 12rem;min-inline-size:0;font-variant-numeric:tabular-nums}
.v2-db-facts :is(dt,dd){text-align:start;overflow-wrap:anywhere}
.v2-db-facts bdi{unicode-bidi:isolate}
@container (min-width:40rem){.v2-db-workspace .v2-field{grid-template-columns:14rem minmax(0,1fr);column-gap:.625rem}.v2-db-workspace .v2-field>:not(label){grid-column:2}.v2-db-workspace .v2-card__body .v2-db-facts dt{flex-basis:14rem}}
.v2-db-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-db-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:.25rem 1.25rem}
.v2-db-check{display:flex;align-items:center;gap:.5rem;min-block-size:var(--target);min-inline-size:0;font-size:.875rem;color:var(--text)}
.v2-db-workspace :is(.v2-card__body,.v2-db-form,[data-db-wizard])>[role=status]${STATUS},.v2-db-workspace>[role=status]${STATUS}{padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken);font-size:.875rem;line-height:1.5;color:var(--text)}
.v2-db-workspace>[role=status]${STATUS}{background:var(--surface)}
.v2-db-table-region{min-inline-size:0;max-inline-size:100%;overflow:auto}
.v2-card:not(.v2-card--flush) .v2-db-table-region{border:1px solid var(--line);border-radius:var(--radius-notice)}
.v2-db-table-region table{min-inline-size:840px}
.v2-db-columns .v2-db-table-region table{min-inline-size:0}.v2-db-columns .v2-db-table-region th{white-space:normal}
.v2-db-table-region :is(th,td){text-align:start}
.v2-db-table-region th{white-space:nowrap}
.v2-db-table-region tbody td:first-child:not([colspan]){font-weight:500;color:var(--mono,var(--text))}
.v2-db-table-region td[colspan]{padding-block:1.25rem;text-align:center;color:var(--muted)}
.v2-db-table-region :is(td,time,[data-xp-slot]),.v2-db-workspace :is([data-insights-fact],[data-remote-count],[data-db-fact]){font-variant-numeric:tabular-nums}
.v2-db-table-region bdi{display:inline-block;max-inline-size:100%;unicode-bidi:isolate;overflow-wrap:anywhere}
.v2-db-table-region .v2-db-actions{gap:.375rem}
.v2-db-table-region td .v2-btn{block-size:1.75rem;min-block-size:1.75rem;padding-inline:.625rem;gap:.3125rem;font-size:.75rem}
.v2-db-table-region td .v2-btn:is([data-db-trash-action],[data-db-row-action=delete],[data-db-row-action=drop],[data-xp-slot=trash],[data-xp-slot=delete],[data-xp-slot=drop]){${SOFT_DANGER}}
.v2-db-unread{color:var(--muted)}
.v2-db-table-region td[data-label]:empty{display:none}
@media(min-width:601px){.v2-db-table-region th:first-child{min-inline-size:180px}.v2-db-table-region td[data-label]{white-space:nowrap}.v2-db-table-region td[data-label] bdi{white-space:nowrap}.v2-db-table-region td[data-label]:has(>[data-xp-slot=state]){white-space:normal}.v2-db-table-region .v2-db-actions:has(>:nth-child(4)){display:grid;grid-template-columns:repeat(2,max-content);justify-content:start}}
@media(max-width:600px){.v2-db-table-region tr>td[data-label]{grid-column:1/-1!important;grid-row:auto!important;justify-self:stretch!important;display:flex;align-items:baseline;justify-content:space-between;gap:1rem;text-align:end!important}
.v2-db-table-region td[data-label]::before{content:attr(data-label);max-inline-size:50%;font-size:.75rem;color:var(--muted);text-align:start}
.v2-db-table-region td[data-label]:has(.v2-btn){display:block}.v2-db-table-region td[data-label]:has(.v2-btn)::before{content:none}}
.v2-db-workspace .v2-card__body>.v2-btn,.v2-db-workspace .v2-card__body>div>.v2-btn,.v2-db-workspace fieldset>.v2-btn,.v2-db-workspace [data-db-wizard-step]>.v2-btn{justify-self:start;align-self:flex-start}
.v2-db-workspace [data-db-wizard],.v2-db-workspace [data-db-wizard-step]:not([hidden]){display:grid;gap:1.25rem;min-inline-size:0}
.v2-db-workspace [data-db-wizard-status]:empty{display:none}
.v2-db-notes{display:grid;gap:.375rem;font-size:.75rem;line-height:1.5;color:var(--muted)}
.v2-db-workspace [data-db-counts]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.25rem}
.v2-db-workspace [data-db-counts]>div{display:flex;flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:.5rem;min-inline-size:0;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface);box-shadow:var(--shadow)}
.v2-db-workspace [data-db-counts] dt{flex:none;font-size:.875rem;line-height:1.4;font-weight:400;color:var(--text-2)}
.v2-db-workspace [data-db-counts] dd{flex:none;font-size:1.5rem;line-height:2rem;font-weight:600;color:var(--mono,var(--text))}
.v2-db-workspace [data-db-counts] dd{font-variant-numeric:tabular-nums}
.v2-db-kpis{position:relative;min-inline-size:0}
.v2-db-workspace [data-db-counts] dt{padding-inline-end:3rem}
.v2-db-kpi-icons{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.25rem;pointer-events:none}
.v2-db-kpi-icons>span{display:flex;justify-content:flex-end;align-items:flex-start;padding:1.25rem}
.v2-db-workspace [data-db-counts] dd:not(:has(bdi)){font-size:1.125rem}
.v2-db-workspace .v2-code{overflow:auto;border-radius:var(--radius-notice)}
.v2-db-workspace [data-dbu-secret-note]:empty{display:none}
.v2-db-workspace [data-db-grant-current],.v2-db-workspace [data-db-grant-preview]{overflow-wrap:anywhere;min-inline-size:0}
.v2-db-check-list{display:grid;gap:.5rem;padding-inline-start:1.25rem;font-size:.875rem;line-height:1.5;color:var(--text)}
.v2-db-code{padding:.875rem;border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.75rem/1.6 var(--font-mono);white-space:pre-wrap;overflow-wrap:anywhere}
.v2-db-legend{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.25rem;color:var(--muted);font-size:.75rem}
.v2-db-legend li{display:inline-flex;align-items:center;gap:.375rem}
.v2-db-workspace:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-db-workspace *{letter-spacing:0}
@media(max-width:1100px){.v2-db-columns{grid-template-columns:minmax(0,1fr)}}
@media(max-width:800px){.v2-db-workspace [data-db-counts],.v2-db-kpi-icons{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.v2-db-options{grid-template-columns:minmax(0,1fr)}.v2-db-workspace [data-db-counts]>div,.v2-db-kpi-icons>span{padding:1rem}.v2-db-workspace [data-db-counts] dd{overflow-wrap:anywhere}.v2-db-actions>.v2-btn{flex:1 1 auto}}
@media(min-width:601px){.v2-db-table-region #v2-db-remote-hosts{table-layout:fixed;inline-size:100%;min-inline-size:0}.v2-db-table-region #v2-db-remote-hosts td{white-space:normal}.v2-db-table-region #v2-db-remote-hosts th:nth-child(1){inline-size:18%}.v2-db-table-region #v2-db-remote-hosts th:nth-child(2){inline-size:26%}.v2-db-table-region #v2-db-remote-hosts th:nth-child(3){inline-size:16%}.v2-db-table-region #v2-db-remote-hosts th:nth-child(4){inline-size:14%}.v2-db-table-region #v2-db-remote-hosts th:nth-child(5){inline-size:12%}.v2-db-table-region #v2-db-remote-hosts th:nth-child(6){inline-size:14%}}
`
