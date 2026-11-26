// v2 base element styles, scoped to the v2 root through :where() so they add no specificity: semantic elements
// inserted by core controllers get these defaults, and component classes override them by source order.
// Technical values (.v2-num, .v2-mono, code) use unicode-bidi:plaintext so numbers with units, dates, domains and
// commands keep their own reading order inside right-to-left pages.
// The element defaults carry the Metronic (KTUI) values of kt-btn, kt-input, kt-select, kt-textarea, kt-checkbox,
// kt-radio, kt-switch, kt-table and kt-progress, so markup that names only the v2 classes (or no class at all)
// renders like markup that also names the Metronic component class.
// Metrics follow the project standard over Metronic (docs/STANDARDS.md): 44px targets (--target) for buttons,
// fields, summaries and the labels of checkboxes and radios; body text and ordinary controls 16/24; one 2px focus
// outline; cards padded 24px (16px on phones) through --v2-panel-padding.

const R = '[data-ui-theme="v2"]'
const W = `:where(${R})`
const CONTROL = 'input:not([type=checkbox],[type=radio],[type=range],[type=file],[type=hidden],[type=color])'

// A matrix, or a table whose later columns hold checkboxes, only makes sense under its headers.
// A table keeps its columns when a later cell holds a checkbox (a matrix) or when it lays out its own phone rows.
const PT = `${W} :where(table:not(.v2-matrix,.v2-whm-quotas__table,:has(*+td [type=checkbox]),:is(.v2-identity-rows,.v2-boxtrapper,[data-leech-protection]) *))`
const CB = 'tr:has(>:first-child [type=checkbox])'
/**
 * Phone rows keep two columns: the item name with its other facts under it, opposite the second cell (value or status).
 * A leading checkbox sits beside the name. The headers show only while the table has no cells. Zero specificity lets
 * page rules shape their own rows; only the desktop widths and cell spacing are forced.
 */
export const V2_PHONE_TABLE_ROWS_CSS = `@media(max-width:600px){${PT}{position:relative;min-width:0!important}
${PT}:not(:has(td)) tr{display:table-row}
${PT}:has(td)>thead{position:absolute;top:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
${PT} tr{display:grid;grid-template-columns:minmax(0,1fr) fit-content(50%);gap:8px 16px;padding:10px 16px}
${PT} tr>*{grid-column:1;padding:0!important;border:0!important;min-width:0!important;white-space:normal;overflow-wrap:anywhere}
${PT} tbody tr:not(:last-child){border-block-end:1px solid var(--line)}
${PT} tr>:nth-child(2):not([colspan]),${PT} ${CB}>:nth-child(3){grid-column:2;grid-row:1;justify-self:end;text-align:end}
${PT} tr>:is([colspan],:nth-child(n+3):has(button,input,select)){grid-column:1/-1}
${PT} ${CB}{position:relative;padding-inline-start:48px}
${PT} ${CB}>:first-child{grid-column:auto;position:absolute;top:10px;inset-inline-start:16px}
${PT} ${CB}>:nth-child(2){grid-column:1;grid-row:1;justify-self:start;text-align:start}}`

const MUTED_40 = 'color-mix(in oklab,var(--kt-muted) 40%,transparent)'
const MUTED_50 = 'color-mix(in oklab,var(--kt-muted) 50%,transparent)'
const EASE = '.15s cubic-bezier(.4,0,.2,1)'
// The marks KTUI itself draws on kt-checkbox, kt-radio and kt-select, for bare controls that name no class.
const CHECK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7' fill='none'%3E%3Cpath d='M1 2.6 4 5.6 9 .7' stroke='white' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
const DASH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 10h8'/%3E%3C/svg%3E")`
const RADIO_DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22' fill='none'%3E%3Ccircle cx='10.9995' cy='11' r='5.86667' fill='white'/%3E%3C/svg%3E")`
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%239f9fa9' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E")`
const BOX = 'input:is([type=checkbox],[type=radio]):not([role=switch])'
const CHECKBOX = 'input[type=checkbox]:not([role=switch])'
const SWITCH = 'input[type=checkbox][role=switch]'
// The button and field fallbacks dress only markup that names no Metronic class: a kt-btn, kt-input, kt-select or
// kt-textarea (and the inner input of a kt-input wrapper) keeps every KTUI value, its sizes included.
const BTN = '.v2-btn:where(:not(.kt-btn))'
const FIELD = `:is(${CONTROL},select,textarea)`
const BARE = `${FIELD}:where(:not(.kt-input,.kt-select,.kt-textarea,.kt-input>*))`

export const V2_BASE_CSS = `${R}{--v2-panel-padding:1.5rem;--v2-control-align:-webkit-match-parent;--v2-elev:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)}
@media(max-width:600px){${R}{--v2-panel-padding:1rem}}
${R} body{margin:0;background:var(--bg);color:var(--text);font:1rem/var(--lh-text) var(--font-sans);-webkit-font-smoothing:antialiased;text-size-adjust:100%}
${R} *,${R} *::before,${R} *::after{box-sizing:border-box}
${R} [hidden]{display:none!important}
${W} :is(h1,h2,h3,h4,p,figure,dl,dd,pre){margin:0}
${W} :is(h1,h2,h3,h4){color:var(--mono,var(--text))}
${W} h1{font-size:1.625rem;line-height:var(--lh-page);font-weight:500}
${W} h2{font-size:1.125rem;line-height:var(--lh-card);font-weight:600}
${W} h3{font-size:1rem;line-height:var(--lh-text);font-weight:600}
${W} h4{font-size:.875rem;line-height:var(--lh-label);font-weight:600}
${W} :where(ul:not([class]),ol:not([class])){padding-inline-start:1.25rem;list-style:revert}
${W} a{color:var(--accent);text-decoration:none}
${W} :where(a:not([class])){font-weight:500}
${W} :where(a:not([class]):hover){text-decoration:underline;text-underline-offset:4px}
${W} :is(code,kbd,pre,samp){font-family:var(--font-mono);font-size:.93em}
${W} kbd{flex:none;display:inline-flex;align-items:center;justify-content:center;height:1.5rem;min-inline-size:1.5rem;padding:0 .25rem;border-radius:var(--radius-control);border:1px solid var(--line);background:var(--kt-accent);font-size:.75rem;line-height:.75rem;color:var(--kt-accent-foreground)}
${W} :focus-visible{outline:2px solid var(--focus)!important;outline-offset:2px}
${W} :where(summary){min-block-size:var(--target);align-content:center;cursor:pointer}
${W} :is(button,input,select,textarea){font:inherit;color:inherit}
${W} ::placeholder{color:var(--muted);opacity:1}
${W} .v2-sr{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
${W} .v2-mono{font-family:var(--font-mono)}
${W} :is(.v2-num,.v2-mono,code,kbd,samp):not([dir]){unicode-bidi:plaintext}
${W} select.v2-mono:not([dir=ltr]){font-family:var(--font-sans)}
${W} .v2-num{font-variant-numeric:tabular-nums}
${W} .v2-muted{color:var(--muted)}
${W} .v2-icon{flex:none}
${W} .v2-flip:dir(rtl){transform:scaleX(-1)}
${W} ${BTN}{display:inline-flex;flex:none;align-items:center;justify-content:center;gap:.375rem;height:var(--target);padding:0 .75rem;border-radius:var(--radius-control);border:1px solid var(--line-strong);background:var(--bg);color:var(--text-2);box-shadow:var(--shadow);font-size:1rem;font-weight:500;line-height:var(--lh-text);text-decoration:none;white-space:nowrap;cursor:pointer;transition:color ${EASE},box-shadow ${EASE}}
${W} ${BTN}>i{color:var(--muted)}
${W} ${BTN}:hover{background:var(--kt-accent);color:var(--kt-accent-foreground);text-decoration:none}
${W} ${BTN}:hover>i{color:var(--text-2)}
${W} ${BTN}.v2-btn--primary{border-color:transparent;background:var(--accent-fill);color:var(--on-accent)}
${W} ${BTN}.v2-btn--primary:hover{background:color-mix(in oklab,var(--accent-fill) 90%,transparent)}
${W} ${BTN}.v2-btn--ghost{border-color:transparent;background:transparent;box-shadow:none;color:var(--kt-accent-foreground)}
${W} ${BTN}.v2-btn--ghost:hover{background:var(--kt-accent)}
${W} ${BTN}.v2-btn--danger{border-color:transparent;background:var(--destructive);color:var(--destructive-foreground)}
${W} ${BTN}.v2-btn--danger:hover{background:color-mix(in oklab,var(--destructive) 90%,transparent)}
${W} ${BTN}.v2-btn--soft-danger{border-color:color-mix(in oklab,var(--destructive) 10%,transparent);background:color-mix(in oklab,var(--destructive) 10%,transparent);color:var(--destructive)}
${W} ${BTN}.v2-btn--soft-danger:hover{border-color:var(--destructive);background:var(--destructive);color:var(--destructive-foreground)}
${W} ${BTN}:is(.v2-btn--primary,.v2-btn--danger,.v2-btn--soft-danger)>i{color:inherit}
${W} ${BTN}.v2-btn--icon{width:var(--target);padding:0}
${W} ${BTN}:is(:disabled,[aria-disabled="true"]){border-color:var(--line);background:var(--sunken);box-shadow:none;color:var(--muted);cursor:not-allowed;transition:none}
${W} ${BTN}:disabled{pointer-events:none}
${W} ${FIELD}{max-width:100%;text-align:match-parent;text-align:-webkit-match-parent}
${W} ${BARE}{min-height:var(--target);padding:0 .75rem;border-radius:var(--radius-control);border:1px solid var(--line-strong);background-color:var(--bg);box-shadow:var(--shadow);color:var(--text);font-size:1rem;line-height:var(--lh-text);transition:color ${EASE},box-shadow ${EASE}}
${W} :is(${CONTROL},textarea)[readonly]:not(:disabled){background-color:var(--subtle)}
${W} textarea:not(.kt-textarea){min-height:5rem;padding:.75rem;resize:vertical}
${W} ${BARE}[aria-invalid="true"]{border-color:color-mix(in oklab,var(--destructive) 60%,transparent)}
${W} ${BARE}:disabled{opacity:.6;cursor:not-allowed}
${W} label:has(input:is([type=checkbox],[type=radio]):disabled){cursor:not-allowed}
${W} :where(label:has(>input:is([type=checkbox],[type=radio]))){display:inline-flex;align-items:center;gap:.5rem;min-block-size:var(--target);min-inline-size:var(--target)}
${W} ${BOX}{appearance:none;flex:none;width:1.125rem;height:1.125rem;margin:0;border:1px solid var(--line-strong);border-radius:var(--radius-chip);background:var(--bg) center no-repeat;vertical-align:middle;cursor:pointer}
${W} ${BOX}[type=radio]{border-radius:50%}
${W} ${BOX}:checked,${W} ${CHECKBOX}:indeterminate{border-color:var(--accent-fill);background-color:var(--accent-fill)}
${W} ${CHECKBOX}:checked{background-image:${CHECK}}
${W} ${CHECKBOX}:indeterminate{background-image:${DASH}}
${W} input[type=radio]:checked{background-image:${RADIO_DOT}}
${W} input[type=radio]:indeterminate{border-color:var(--line-strong)!important;background-color:var(--bg)!important}
${W} ${BOX}:disabled{opacity:.5;cursor:not-allowed}
${W} ${SWITCH}{appearance:none;position:relative;display:inline-flex;flex:none;width:1.875rem;height:1.25rem;margin:0;border-radius:var(--radius-pill);background:var(--line-strong);vertical-align:middle;cursor:pointer}
${W} ${SWITCH}::before{content:"";position:absolute;top:50%;inset-inline-start:0;display:block;width:.75rem;height:.75rem;border-radius:50%;background:#fff;box-shadow:var(--shadow);pointer-events:none;translate:.25rem -50%;transition:translate ${EASE}}
${W} ${SWITCH}:dir(rtl)::before{translate:-.25rem -50%}
${W} ${SWITCH}:checked{background:var(--accent-fill)}
${W} ${SWITCH}:checked::before{translate:.875rem -50%}
${W} ${SWITCH}:checked:dir(rtl)::before{translate:-.875rem -50%}
${W} ${SWITCH}:disabled{opacity:.5;cursor:not-allowed}
${W} select:not([multiple],[size]){appearance:none;padding-inline:.75rem 1.5rem;background-image:${CHEVRON};background-repeat:no-repeat;background-size:14px 11px;background-position:right .5rem center;cursor:pointer}
${W} select:dir(rtl){background-position:left .5rem center}
${W}:dir(rtl) select:dir(ltr):not([multiple],[size]){padding-inline:1.5rem .75rem;background-position:left .5rem center}
${W} .v2-select{position:relative;display:block}
${W} .v2-select>select{width:100%}
${W} .v2-select>:not(select){display:none!important}
${W} :is(meter,progress){inline-size:100%;block-size:4px;border:0;border-radius:var(--radius-pill);background:var(--secondary);vertical-align:middle}
${W} progress{appearance:none;overflow:hidden}
${W} ::-webkit-meter-bar,${W} ::-webkit-progress-bar{block-size:4px;border:0;border-radius:var(--radius-pill);background:var(--secondary)}
${W} ::-webkit-progress-value,${W} ::-webkit-meter-optimum-value{border-radius:var(--radius-pill);background:var(--accent-fill)}
${W} ::-webkit-meter-suboptimum-value{background:var(--warn)}
${W} ::-webkit-meter-even-less-good-value{background:var(--bad)}
${W} ::-moz-meter-bar,${W} ::-moz-progress-bar{background:var(--accent-fill)}
${W} :where(input[type=file]){max-inline-size:100%}
${W} :where(input[type=file]:not(.kt-input)){display:block;inline-size:100%;block-size:var(--target);padding:0 .75rem;border:1px solid var(--line-strong);border-radius:var(--radius-control);background:var(--bg);box-shadow:var(--shadow);color:var(--text);font-size:1rem}
${W} :where(input[type=file]:disabled){cursor:not-allowed;opacity:.6}
${W} :where(input[type=file])::file-selector-button{block-size:100%;margin:0;margin-inline-end:.75rem;padding:0;padding-inline-end:.75rem;border:0;border-inline-end:1px solid var(--line-strong);border-radius:0;background:transparent;color:var(--text);font:inherit;font-weight:500;cursor:pointer}
${W} table{width:100%;border-collapse:collapse;color:var(--text);font-size:1rem;line-height:var(--lh-text);text-align:start}
${W} caption{padding:0 0 .5rem;text-align:start;font-weight:600}
${W} :where(tr){border-block-end:1px solid var(--line)}
${W} :where(tbody:last-child>tr:last-child){border-block-end:0}
${W} :where(td,th){padding:.75rem 1rem;vertical-align:middle}
${W} th{font-weight:400;text-align:start}
${W} thead th{height:2.75rem;padding-block:0;background:${MUTED_40};color:var(--text-2);font-size:.875rem;line-height:var(--lh-label)}
${W} tbody th[scope=row]{font-weight:500}
${W} tbody th[scope=rowgroup]{padding-block:.625rem;background:${MUTED_40};color:var(--text-2);font-size:.875rem;line-height:var(--lh-label);font-weight:500}
${W} :is(th,td):first-child{padding-inline-start:var(--v2-panel-padding)}
${W} :is(th,td):last-child{padding-inline-end:var(--v2-panel-padding)}
${W} tbody tr:hover>td{background:${MUTED_50}}
${W} :where(p:is([role=alert],[data-state=failed],[data-state=error]):not(:empty)){padding:.875rem;border:1px solid color-mix(in oklab,var(--destructive) 10%,transparent);border-radius:var(--radius-notice);background:color-mix(in oklab,var(--destructive) 5%,transparent);color:var(--text);font-size:.875rem}
${W} :where(td[data-table-empty]){padding-block:1.25rem;text-align:center;color:var(--muted)}
${W} :where(td[data-label])::before{flex:0 1 auto;max-inline-size:45%;overflow-wrap:anywhere}
${W} :where(.kt-table,.v2-table)>tbody>tr:not([class])>td[colspan]:only-child:not(:has(form,input,select,textarea,dl,table)){padding-block:1.25rem;text-align:center;color:var(--muted)}
${W} .v2-table-scroll{overflow-x:auto;scrollbar-width:thin;border:1px solid var(--line);border-radius:.5rem}
${W} :is(.kt-card,.border,.kt-card-table,.v2-card--flush)>.v2-table-scroll,${W} :is(.kt-card-table,.v2-card--flush) .v2-table-scroll{border:0;border-radius:0}
${W} :is(.kt-card-table,.v2-card--flush) .v2-table-scroll:not(:first-child,.v2-card__head+*){border-top:1px solid var(--line)}
${W} .v2-table-scroll:focus-visible{outline-offset:-2px}
@keyframes v2-pulse{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes v2-spin{to{transform:rotate(360deg)}}
@keyframes v2-drain{from{inline-size:100%}to{inline-size:0}}
@media(max-width:959px){${W} :is(${CONTROL},select,textarea,[contenteditable="true"]){font-size:16px!important;line-height:24px}}
@media(forced-colors:active){${W} select{appearance:auto!important;padding-inline:12px!important;background-image:none!important}${W} ${BOX},${W} ${SWITCH}{appearance:auto}${W} ${SWITCH}::before{display:none}}
@media (prefers-reduced-motion:reduce){${R} *,${R} *::before,${R} *::after{animation:none!important;transition:none!important}}
`
