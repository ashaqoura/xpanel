import { V2_PANEL_STORE_ROUTES } from '../store/index.ts'

/** Routes of the account software pages that load this sheet beside the shared settings sheet. */
export const PANEL_SOFTWARE_PAGES_ROUTES: readonly string[] = Object.freeze(['/software/php', '/software/optimize', ...V2_PANEL_STORE_ROUTES])

const P = '.v2-panel-php'
const S = '.v2-panel-settings[data-v2-settings-route^="/software/"]'
/** Page rules of PHP, Optimize and the application store; the shared settings sheet stays the base. */
export const PANEL_SOFTWARE_PAGES_CSS = `.v2-panel-settings .v2-card--flush>.v2-card__body{gap:0}
.v2-panel-settings .v2-card--flush .v2-panel-settings__table{border:0;border-radius:0}
.v2-panel-settings form${P}{gap:var(--space-3)}
${P} .v2-panel-settings__split{grid-template-columns:minmax(0,1fr) minmax(300px,400px)}
${P} .v2-panel-settings__split>.v2-panel-settings__groups{gap:var(--space-3)}
${P}-status__top{display:flex;flex-wrap:wrap;align-items:stretch;gap:var(--space-3);padding:var(--v2-panel-padding)}
${P}-status__tile{flex:1 1 280px;min-inline-size:0;display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-2);border:1px solid var(--line);border-radius:var(--radius-card);background:var(--subtle)}
${P}-status__tile>div{display:flex;align-items:center;gap:var(--space-1);min-inline-size:0}
${P}-status__tile>div>span{flex:none;inline-size:.5rem;block-size:.5rem;border-radius:50%;background:var(--muted)}
${P}-status__tile h2{overflow-wrap:anywhere;min-inline-size:0}
${P}-status__tile p{font-size:1rem;line-height:var(--lh-text);font-weight:500;color:var(--mono,var(--text))}
${P}-status__tile p+p{font-size:.8125rem;line-height:var(--lh-cap);font-weight:400;color:var(--text-2)}
${P}-status__fields{flex:999 1 420px;min-inline-size:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:var(--space-2);align-items:start}
${P}-status__fields>.v2-field{display:flex;flex-direction:column;gap:var(--space-1)}
${P}-status__fields select[dir=ltr]{font-family:var(--font-mono)}
${P}-status__running{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--v2-panel-padding);border-block-start:1px solid var(--line)}
${P}-tabs>.v2-tabs{padding-inline:var(--space-2)}
${P}-tabs>.v2-tabs>[role=tab]{min-block-size:3.5rem}
${P}-tabs>.v2-tabpanel{gap:var(--space-3);padding:var(--v2-panel-padding)}
${P}-tabs>.v2-tabpanel[hidden]{display:none}
${P}-tabs>.v2-tabpanel[hidden]:has(:invalid){display:flex!important;border-block-start:1px solid var(--line)}
${P}-tabs :is(input,select):invalid:not(:focus):not(:focus-visible){border-color:var(--bad)}
${P}-tabs:has(#v2-php-runtime :invalid) #v2-php-tab-runtime,${P}-tabs:has(#v2-php-pool :invalid) #v2-php-tab-pool,${P}-tabs:has(#v2-php-ini :invalid) #v2-php-tab-ini{color:var(--bad);box-shadow:inset 0 -2px 0 var(--bad)}
${P}-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-1) var(--space-2)}
${P}-head>div{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0}
${P}-head p{font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
${P}-tabs .v2-panel-settings__fields label:not([for$=IdleTimeoutSec]),${P}-tabs .v2-panel-settings__table th[scope=row]{font-family:var(--font-mono)}
${P}-tabs .v2-field>:is(input,.v2-select){inline-size:100%}
${P}-unit{display:flex;align-items:stretch;min-inline-size:0}
${P}-unit>input{flex:1 1 auto;inline-size:0;font-family:var(--font-mono);font-variant-numeric:tabular-nums}
${P}-tabs input[type=text]{font-family:var(--font-mono)}
${P}-box{padding:var(--space-2);border:1px solid var(--line);border-radius:var(--radius-card);background:var(--subtle)}
${P}-memory{display:flex;flex-direction:column;gap:var(--space-1)}
${P}-memory>div:first-child{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--space-1);font-size:.875rem;line-height:var(--lh-label)}
${P}-memory>div:first-child>strong{font-weight:600;color:var(--mono,var(--text))}
${P}-memory>div:first-child>span{color:var(--text-2);font-weight:500}
${P}-memory>.v2-bar{block-size:.375rem;background:var(--sunken)}
${P}-memory>p{font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
.v2-panel-settings ${P}-handlers{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:var(--space-2)}
${P}-handlers>li{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1);padding:var(--space-2);border:1px solid var(--line-strong);border-radius:var(--radius-card);font-size:.875rem;line-height:var(--lh-label)}
${P}-handlers>li>strong{font-weight:600;color:var(--mono,var(--text))}
${P}-handlers>li>span:last-child{flex:1 1 100%;font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
${P}-handlers>li[data-current=true]{border-color:var(--accent);background:var(--accent-soft)}
${P}-handlers>li[data-offered=false]{background:var(--subtle)}${P}-handlers>li[data-offered=false]>strong{color:var(--text-2);font-weight:500}
${P}-save>div:first-child{flex:1 1 320px;min-inline-size:0;display:flex;flex-direction:column;gap:var(--space-1);font-size:1rem;line-height:var(--lh-text)}
${P}-save>div:first-child>strong{font-weight:600;color:var(--mono,var(--text))}
${P}-save>div:first-child>p{font-size:.8125rem;line-height:var(--lh-cap);color:var(--text-2)}
${P}-save>div:first-child>p[role=status]{color:var(--text)}
${P}-blank{padding:var(--space-2);border:1px dashed var(--line-strong);border-radius:var(--radius-card);background:var(--subtle);color:var(--text-2);font-size:.8125rem;line-height:var(--lh-cap)}
@media(min-width:1100px){${P}-status__fields{grid-template-columns:minmax(0,1.5fr) minmax(0,.8fr) minmax(0,1fr)}}
${S} :is([role=status],[role=alert])[data-state]:is([data-state=uncertain],[data-state=invalid],[data-state=unavailable]):not(:empty),${S} [data-installer-state=unavailable]{padding:var(--space-2);border:1px solid var(--warn-line);background:var(--warn-soft);border-radius:var(--radius-notice,var(--radius-control));font-size:.875rem;line-height:var(--lh-label);color:var(--text)}
${S} [data-installer-progress]{font-size:.8125rem;color:var(--text-2)}
.v2-panel-settings[data-panel-store] .v2-panel-settings__tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}
.v2-panel-settings[data-panel-store] .v2-panel-settings__tabs>a{flex:none;white-space:nowrap}
.v2-panel-settings[data-panel-store] .v2-panel-settings__split>.v2-panel-settings__groups{gap:var(--space-3)}
.v2-panel-settings[data-panel-store] .v2-panel-settings__steps>li[aria-current=step]{color:var(--mono,var(--text));font-weight:600}
.v2-panel-settings[data-panel-store] .v2-panel-settings__steps>li[aria-current=step]>b{background:var(--accent-fill);color:var(--on-accent)}
.v2-panel-settings[data-panel-store] #v2-store-install-target .v2-panel-settings__fields>.v2-field:first-child{grid-column:1/-1}
.v2-panel-settings[data-panel-store] .v2-field>:is(input,.v2-select){inline-size:100%}
.v2-panel-settings[data-panel-store] pre.v2-panel-settings__preview{background:var(--code);color:var(--code-text);border-color:transparent;font-size:.8125rem;line-height:var(--lh-cap)}
@media(max-width:1000px){${P} .v2-panel-settings__split{grid-template-columns:minmax(0,1fr)}}
@media(max-width:700px){.v2-panel-settings[data-panel-store] .v2-panel-settings__tabs{flex-wrap:wrap;overflow:visible}}
@media(max-width:600px){${P}-status__top{padding:var(--space-2)}${P}-status__running{padding:var(--space-2)}}
`
