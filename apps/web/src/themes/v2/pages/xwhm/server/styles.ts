import { adminStyles } from './common.ts'

const P = '.v2-server-page'
// The step whose card is the URL fragment target, or the first step without one.
const CURRENT_STEP = [...['identity', 'network', 'email', 'engine', 'workers', 'review'].map(key => `${P} [data-setup-stepper]:has(#v2-setup-${key}:target) a[href="#v2-setup-${key}"]`), `${P} [data-setup-stepper]:not(:has([data-setup-step]:target)) a[href="#v2-setup-identity"]`]

export const WHM_SERVER_CSS = adminStyles(P) + `${P} .v2-server-setup-steps{padding:1.25rem;overflow:auto}
${P} :is(.v2-server-setup-steps a,.v2-server-setup-choice,[data-tweak-settings] td a){transition:background-color 140ms ease-out,border-color 140ms ease-out,color 140ms ease-out,box-shadow 140ms ease-out}
@media(prefers-reduced-motion:reduce){${P} :is(.v2-server-setup-steps a,.v2-server-setup-choice,[data-tweak-settings] td a){transition:none}}
${P} .v2-server-setup-steps ol{display:flex;align-items:center;gap:.625rem;min-inline-size:860px}
${P} .v2-server-setup-steps li{flex:1 1 auto;display:flex;align-items:center;gap:.625rem;min-inline-size:0}
${P} .v2-server-setup-steps li:last-child{flex:0 0 auto}
${P} .v2-server-setup-steps li:not(:last-child)::after{content:"";flex:1 1 1rem;min-inline-size:1rem;block-size:1px;background:var(--line-strong)}
${P} .v2-server-setup-steps a{flex:none;display:flex;align-items:center;gap:.625rem;min-block-size:var(--target);border-radius:var(--radius-control);color:var(--text-2);text-decoration:none}
${P} .v2-server-setup-steps a>span:first-child{flex:none;display:grid;place-items:center;inline-size:2.25rem;block-size:2.25rem;border-radius:var(--radius-pill);background:var(--accent-soft);color:var(--accent);font-size:.875rem;font-weight:600;font-variant-numeric:tabular-nums}
${P} .v2-server-setup-steps a:hover{color:var(--accent)}
${CURRENT_STEP.join(',')}{color:var(--mono,var(--text))}
${CURRENT_STEP.map(selector => `${selector}>span:first-child`).join(',')}{background:var(--accent-fill);color:var(--on-accent)}
${P} [data-setup-wizard-form]{gap:1.25rem}
${P} .v2-setup-aside,${P} #v2-setup-detected bdi{overflow-wrap:break-word;word-break:normal}
${P} .v2-setup-handler-name,${P} .v2-setup-handler-name bdi{white-space:nowrap;overflow-wrap:normal;word-break:normal}
${P} .v2-setup-drawer>summary{min-block-size:3.5rem;font-size:1rem;font-weight:600}
${P} .v2-setup-drawer>summary>span>i{color:var(--muted)}
${P} .v2-setup-drawer>:not(summary){padding:1.25rem}
${P} [data-tweak-settings] td a{display:inline-flex;align-items:center;min-inline-size:var(--target);min-block-size:var(--target)}
${P} .v2-server-terminal-session{overflow:hidden}
${P} .v2-server-terminal-screen{block-size:clamp(280px,50vh,560px);padding:1rem;background:var(--code);color:var(--code-text);font-family:var(--font-mono);font-size:.8125rem;line-height:1.25rem;overflow:hidden;min-inline-size:0;box-sizing:border-box}
${P} .v2-server-terminal-screen .xterm{block-size:100%}
${P} .v2-server-terminal-bar .v2-admin-form{flex:1 1 auto;flex-direction:row;flex-wrap:wrap;align-items:flex-end;gap:.625rem}
${P} .v2-server-terminal-bar .v2-admin-field{flex:1 1 16rem}
${P} :is([data-terminal-pill],[data-terminal-exec-pill]){font-variant-numeric:tabular-nums}
${P} :is([data-terminal-pill],[data-terminal-exec-pill])::before{content:"";flex:none;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:currentColor;opacity:.75}
${P} :is([data-terminal-pill],[data-terminal-exec-pill])[data-tone=ok]{border-color:var(--ok-line);background:var(--ok-soft);color:var(--ok)}
${P} :is([data-terminal-pill],[data-terminal-exec-pill])[data-tone=warn]{border-color:var(--warn-line);background:var(--warn-soft);color:var(--warn)}
${P} :is([data-terminal-pill],[data-terminal-exec-pill])[data-tone=info]{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
@media(min-width:901px){${P} [data-setup-stepper]:not(:has(#v2-setup-workers:target,#v2-setup-review:target)) [data-setup-wizard-form]{flex:1}${P} [data-setup-wizard-form]>[data-setup-step],${P} [data-setup-stepper] .v2-admin-stack>[data-setup-step]:target{flex:1}${P} [data-setup-step]>.v2-card__body{flex:1}}
${P} [data-setup-stepper]:has([data-setup-step]:target) [data-setup-step]:not(:target),${P} [data-setup-stepper]:not(:has([data-setup-step]:target)) [data-setup-step]:not([data-setup-step=identity]){display:none!important}
${P} [data-setup-step]{scroll-margin-block-start:240px}
${P} .v2-server-setup-choices{border:0;border-radius:0;padding:0;margin:0;min-inline-size:0;display:flex;flex-direction:column;gap:.625rem}
${P} .v2-server-setup-choices>legend{padding:0;margin-block-end:.625rem;font-size:.875rem;line-height:1.25rem;font-weight:500;color:var(--text)}
${P} .v2-server-setup-choices>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:1.25rem}
${P} .v2-server-setup-choice{display:flex;align-items:flex-start;gap:.625rem;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface);cursor:pointer}
${P} .v2-server-setup-choice:hover:not(:has(:disabled)){border-color:var(--accent)}
${P} .v2-server-setup-choice:has(:checked){border-color:var(--accent);background:var(--accent-soft)}
${P} .v2-server-setup-choice:has(:disabled){cursor:not-allowed;background:var(--subtle)}
${P} .v2-server-setup-choice:has(:focus-visible){outline:2px solid var(--accent);outline-offset:2px}
${P} .v2-server-setup-choice input{flex:none;margin-block-start:1px}
${P} .v2-server-setup-choice>span{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0}
${P} .v2-server-setup-review{display:grid;grid-template-columns:minmax(0,1fr);margin:0}
${P} .v2-server-setup-review>div{display:grid;grid-template-columns:minmax(0,14rem) minmax(0,1fr) auto;gap:.625rem;align-items:center;min-block-size:3rem;padding-block:.375rem;border-block-end:1px solid var(--line);min-inline-size:0}
${P} .v2-server-setup-review>div:last-child{border-block-end:0}
${P} .v2-server-setup-review dd{margin:0;overflow-wrap:anywhere;unicode-bidi:plaintext;font-variant-numeric:tabular-nums;text-align:start;text-align:-webkit-match-parent;text-align:match-parent}
@media(max-width:600px){${P} .v2-server-setup-review>div{grid-template-columns:minmax(0,1fr) auto;gap:.125rem .625rem}${P} .v2-server-setup-review :is(dt,dd){grid-column:1}${P} .v2-server-setup-review a{grid-column:2;grid-row:1/span 2}}
@media(max-width:600px){${P} [data-tweak-settings] table{display:block;table-layout:auto;min-inline-size:0}${P} [data-tweak-settings] thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}${P} [data-tweak-settings] tbody{display:block}${P} [data-tweak-settings] tr[data-setting-group],${P} [data-tweak-settings] tr[data-setting-group]>th{display:block}${P} [data-tweak-settings] tr[data-setting-row]:not([hidden]){display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:.5rem 1rem;padding:.75rem}${P} [data-tweak-settings] tr[data-setting-row]>*{display:block;position:static;grid-row:auto;grid-column:auto;inline-size:auto;padding:0;margin:0;text-align:start;overflow-wrap:anywhere}${P} [data-tweak-settings] tr[data-setting-row]>*::before{content:none}${P} [data-tweak-settings] tr[data-setting-row]>:is(th,td:nth-child(4)){grid-column:1/-1}}
@media(max-width:600px){${P} #v2-ip-change-many-table tbody tr:not(:has([colspan])){display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.5rem 1rem}${P} #v2-ip-change-many-table tbody tr:not(:has([colspan]))>td{display:block;position:static;grid-row:auto;grid-column:auto;inline-size:auto;margin:0;padding:0;text-align:start}${P} #v2-ip-change-many-table tbody tr:not(:has([colspan]))>td:nth-child(3){grid-column:1/-1}${P} #v2-ip-change-many-table tbody tr:not(:has([colspan]))>td::before{content:none}${P} #v2-ip-change-many-table select{inline-size:100%;min-inline-size:0}${P} #v2-ip-change-many-table tbody tr{padding-block:.75rem}}
${P} .v2-admin-columns>:last-child .v2-admin-table table{min-inline-size:0}
${P} .v2-admin-columns>:last-child .v2-admin-table :is(th,td){white-space:normal}
${P} .v2-admin-table td{overflow-wrap:break-word}
${P} [data-tweak-settings] table{table-layout:fixed}
${P} [data-tweak-settings] thead th:first-child{inline-size:40%}
${P} [data-tweak-settings] thead th:nth-child(2){inline-size:16%}
${P} [data-tweak-settings] thead th:nth-child(3){inline-size:18%}
${P} [data-tweak-settings] td :is(input:not([type=checkbox]),select){inline-size:100%;min-inline-size:0;box-sizing:border-box}
${P} [data-tweak-settings] th[scope=row]{font-weight:400}
${P} [data-tweak-settings] th[scope=row]>span{display:block}
${P} [data-tweak-settings] th[scope=row] bdi{font-size:.75rem;color:var(--muted)}
${P} [data-tweak-settings] tr[data-setting-group]>th{padding:.625rem 1.25rem;background:var(--sunken);text-align:start;font-size:.8125rem;line-height:1.25rem;font-weight:600;color:var(--text-2)}
${P} [data-setting-value]{font-variant-numeric:tabular-nums}
${P} [data-ip-pool-table]{min-inline-size:760px}
${P} [data-ip-pool-table] td:first-child bdi,${P} .v2-ip-nowrap{white-space:nowrap}
${P} .v2-ip-wrap,${P} .v2-ip-wrap bdi,${P} .v2-ip-aside{overflow-wrap:break-word;word-break:normal}
${P} .v2-ip-flex-input{flex:1 1 200px;min-inline-size:140px}
${P} :is([data-node-cluster-members],[data-node-cluster-sections]):empty{display:none}
@media(max-width:600px){${P} .v2-server-setup-steps ol{min-inline-size:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem .625rem}${P} .v2-server-setup-steps li::after{content:none}${P} .v2-server-setup-steps a{flex:1 1 auto;flex-direction:column;text-align:center}}
`
