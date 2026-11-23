import { V2_MAIL_DYNAMIC_CSS } from './client-templates.ts'
const R = '.v2-shell[data-surface="xmail"]'
const LIVE = 'p[role=status]:not([data-state=failed],[data-state=error],.kt-alert)'

// Metronic supplies the look of cards, buttons, inputs, badges, alerts, menus and type through the kt-* classes and
// utilities in the markup. What stays here is structure, bidi and controller state. The shared compose script paints
// the chips, toggles, feedback and discard confirmation it creates inline, with another theme's tokens: the rules
// for those elements repaint them, so they need !important.
export const V2_MAIL_CSS =`${R} .v2-page{max-inline-size:none}
${V2_MAIL_DYNAMIC_CSS}
${R} .v2-mail-search{display:flex;justify-content:flex-start;gap:.625rem;flex:1 1 17.5rem;max-inline-size:32.5rem;min-inline-size:0}
${R} .v2-mail-search>input[type=search]{inline-size:100%}
${R} .v2-mail-navigation{display:flex;flex:1;flex-direction:column;gap:1.25rem;min-block-size:0}
${R} .v2-mail-navigation .kt-menu-title{min-inline-size:0;overflow-wrap:anywhere}
${R} .v2-mail-folder:not(a){cursor:default}
${R} .v2-mail-tools summary{list-style:none;cursor:pointer}
${R} .v2-mail-tools summary::-webkit-details-marker{display:none}
${R} .v2-mail-tools details[open]>summary .kt-menu-arrow>.v2-icon{transform:rotate(90deg)}
${R} .v2-mail-tools details[open]>summary .kt-menu-arrow>.v2-icon:dir(rtl){transform:scaleX(-1) rotate(90deg)}
${R} .v2-mail-tools .kt-menu-arrow>.v2-icon{transition:transform 140ms ease-out}
.v2-mail-inbox ${LIVE},.v2-mail-compose ${LIVE}{font-size:.8125rem;line-height:1.5;color:var(--text-2);overflow-wrap:anywhere}
.v2-mail-inbox ${LIVE}:empty,.v2-mail-compose ${LIVE}:empty{display:none}
.v2-mail-folder-feedback>[data-mail-folder-status]{display:flex;align-items:center;gap:.5rem;flex:1 1 15rem;min-block-size:1.75rem}
.v2-mail-folder-feedback>[data-mail-folder-status]:not([data-state=failed])::before{content:"";flex:none;inline-size:.375rem;block-size:.375rem;border-radius:50%;background:var(--line-strong)}
.v2-mail-folder-feedback>:is([data-state=read],[data-state=saved])::before{background:var(--ok)}
.v2-mail-folder-feedback>:is([data-state=reading],[data-state=saving])::before{background:var(--accent)}
.v2-mail-folder-feedback>[data-state=uncertain]::before{background:var(--warn)}
.v2-mail-folder-feedback>[data-mail-folder-status][data-state=uncertain]{padding:.875rem;border:1px solid var(--warn-line);border-radius:var(--radius-notice);background:var(--warn-soft);color:var(--text)}
.v2-mail-panes{display:grid;grid-template-columns:minmax(18.75rem,1fr) minmax(0,1.618fr);gap:1.25rem;align-items:stretch;min-inline-size:0;min-block-size:40rem}
.v2-mail-list{min-inline-size:0;overflow:hidden}
.v2-mail-row{background:var(--surface);color:var(--text);cursor:pointer;transition:background-color 140ms ease-out}
.v2-mail-row:hover:not(:disabled,[aria-current=true]){background:var(--subtle)}
.v2-mail-row:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.v2-mail-row:disabled{cursor:default}
.v2-mail-row[aria-current=true]{background:color-mix(in oklab,var(--accent) 6%,var(--surface));box-shadow:inset 3px 0 0 var(--accent)}
.v2-mail-row[aria-current=true]:dir(rtl){box-shadow:inset -3px 0 0 var(--accent)}
.v2-mail-row__content [dir=auto],.v2-mail-reader__head :is(h2,[data-mail-detail-name]){text-align:match-parent;text-align:-webkit-match-parent}
.v2-mail-row__star,.v2-mail-row__clip{display:inline-flex;align-items:center}
.v2-mail-row[data-starred=false] .v2-mail-row__star,.v2-mail-row[data-attach="0"] .v2-mail-row__clip{display:none}
.v2-mail-row[data-starred=true] .v2-mail-row__star{color:var(--warn)}
.v2-mail-reader{min-inline-size:0}
.v2-mail-sender__addr:has(>bdi:empty),.v2-mail-sender__who dl>div:is([hidden],:has(>dd>bdi:empty)){display:none}
.v2-mail-sender__who dl>div{display:flex;align-items:baseline;gap:.375rem;min-inline-size:0}
.v2-mail-facts{display:grid;gap:.875rem;min-inline-size:0}
.v2-mail-facts>div:is([hidden],:has(>dd>bdi:empty)){display:none}
.v2-mail-facts>div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-items:baseline;gap:.625rem;min-inline-size:0}
.v2-mail-facts dt{font-size:.875rem;line-height:1.25rem;color:var(--text-2);overflow-wrap:anywhere}
.v2-mail-facts dd{font-size:.875rem;line-height:1.25rem;color:var(--mono,var(--text));font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.v2-mail-facts dd>bdi{unicode-bidi:isolate;text-align:start}
.v2-mail-remote-notice__copy>.v2-icon{color:var(--warn)}
.v2-mail-remote-images{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,13.75rem),1fr));gap:1rem;padding:0 1.25rem 1.25rem}
.v2-mail-remote-images img{display:block;max-inline-size:100%;block-size:auto;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--sunken)}
.v2-mail-reader__body{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--text)}
.v2-mail-reader__body[data-mail-body=pending]{color:var(--muted)}
.v2-mail-attachments ul{margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr));gap:.625rem}
.v2-mail-attachments ul:empty{display:none}
.v2-mail-attachments li{display:flex;min-inline-size:0;overflow-wrap:anywhere}
.v2-mail-quick-reply__status[data-state=failed]{padding:0;border:0;background:none;color:var(--bad)}
.v2-mail-quick-reply__status[data-state=sent]{color:var(--ok)}
.v2-mail-compose-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem 1.25rem}
.v2-mail-compose-head>div{display:flex;flex-direction:column;gap:.625rem;flex:1 1 20rem;min-inline-size:0;max-inline-size:72ch}
.v2-mail-compose-head p[data-state=failed]{padding:0;border:0;background:none;color:var(--bad)}
.v2-mail-recipient input{flex:1 1 10rem;min-inline-size:7.5rem;min-block-size:1.5rem;text-align:match-parent;text-align:-webkit-match-parent}
.v2-mail-recipient:has(input:disabled){opacity:.6}
.v2-mail-recipient>ul{order:-1;display:flex;flex-wrap:wrap;gap:.375rem;margin:0;padding:0!important}
.v2-mail-recipient>ul:empty{display:none}
.v2-mail-recipient [data-mail-chip]{min-block-size:1.5rem!important;padding:0!important;padding-inline-start:.5rem!important;border:1px solid var(--line)!important;border-radius:var(--radius-control)!important;background:var(--sunken)!important;color:var(--text)!important;font-size:.75rem!important}
.v2-mail-recipient [data-mail-chip][data-invalid=true]{border-color:var(--bad-line)!important;background:var(--bad-soft)!important}
.v2-mail-recipient [data-mail-chip]>span{color:var(--text)!important}
.v2-mail-recipient [data-mail-chip]>span:empty{display:none}
.v2-mail-recipient [data-mail-chip]>span:nth-of-type(2){direction:ltr;unicode-bidi:isolate;font-family:inherit!important}
.v2-mail-recipient [data-mail-chip]>span:not(:empty)+span:nth-of-type(2){color:var(--muted)!important}
.v2-mail-recipient [data-mail-chip][data-invalid=true]>span{color:var(--bad)!important}
.v2-mail-recipient [data-mail-chip]>button{display:inline-flex;align-items:center;justify-content:center;inline-size:1.5rem!important;block-size:1.5rem!important;padding:0;border-radius:var(--radius-control);color:var(--muted)!important;font-size:0;line-height:1;cursor:pointer}
.v2-mail-recipient [data-mail-chip]>button::before{content:"\\ea49";font:normal .625rem/1 'keenicons-filled'}
.v2-mail-recipient [data-mail-chip]>button:hover{background:var(--line)!important;color:var(--text)!important}
.v2-mail-compose-body>[data-mail-feedback]:not([hidden]){margin:0!important;padding:.875rem!important;border:1px solid var(--warn-line)!important;border-radius:var(--radius-notice)!important;background:var(--warn-soft)!important;color:var(--text)!important;font-size:.875rem!important;overflow-wrap:anywhere}
.v2-mail-compose-body>[data-mail-feedback][role=alert]{border-color:var(--bad-line)!important;background:var(--bad-soft)!important}
.v2-mail-compose-footer>[data-mail-discard]:has(>span){padding:.25rem;padding-inline-start:.75rem;border:1px solid var(--bad-line);border-radius:var(--radius-notice);background:var(--bad-soft)}
.v2-mail-compose-footer>[data-mail-discard]>span{font-size:.8125rem;color:var(--bad)!important}
.v2-mail-compose-footer>[data-mail-discard]>:is(button,a):not(.v2-btn){display:inline-flex;align-items:center;min-block-size:var(--target)!important;padding-inline:.75rem;border-radius:var(--radius-control)!important;font-size:.8125rem!important;font-weight:500;cursor:pointer}
.v2-mail-compose-footer>[data-mail-discard]>[data-mail-action=discard-cancel]{border:1px solid var(--line-strong)!important;background:var(--surface)!important;color:var(--text)!important}
.v2-mail-compose-footer>[data-mail-discard]>a{border:1px solid var(--bad)!important;background:var(--surface)!important;color:var(--bad)!important}
.v2-mail-compose-footer>[data-mail-discard]>a:hover{background:var(--bad)!important;color:var(--surface)!important}
.v2-mail-compose-footer>.v2-mail-actions>[role=status]{max-inline-size:32ch;font-size:.75rem;color:var(--muted);text-align:end;overflow-wrap:anywhere}
.v2-mail-editor:has(>.v2-mail-editor-body:focus-visible){border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 30%,transparent)}
.v2-mail-format .v2-btn{border-color:transparent!important;background:transparent!important;color:var(--text-2)!important}
.v2-mail-format .v2-btn:hover:not(:disabled){background:var(--kt-accent)!important;color:var(--text)!important}
.v2-mail-format .v2-btn[aria-pressed=true]{background:var(--accent-soft)!important;color:var(--accent)!important}
.v2-mail-format .v2-btn[aria-pressed=true]>.v2-icon{color:inherit}
.v2-mail-editor-body{white-space:pre-wrap;overflow-wrap:anywhere;text-align:match-parent;text-align:-webkit-match-parent;outline:0}
.v2-mail-size-meter{border:1px solid var(--line);background:color-mix(in oklab,var(--kt-muted) 40%,transparent)}
.v2-mail-size-meter[data-tone=warn]{border-color:var(--warn-line);background:var(--warn-soft)}
.v2-mail-size-meter[data-tone=bad]{border-color:var(--bad-line);background:var(--bad-soft)}
.v2-mail-size-meter__bar{appearance:none;-webkit-appearance:none;display:block;inline-size:100%;block-size:.25rem;border:0;border-radius:var(--radius-pill);background:var(--secondary);overflow:hidden;accent-color:var(--accent)}
.v2-mail-size-meter__bar::-webkit-progress-bar{background:var(--secondary);border-radius:var(--radius-pill)}
.v2-mail-size-meter__bar::-webkit-progress-value{background:var(--accent-fill);border-radius:var(--radius-pill);transition:inline-size 140ms ease-out}
.v2-mail-size-meter[data-tone=warn] .v2-mail-size-meter__bar{accent-color:var(--warn)}
.v2-mail-size-meter[data-tone=warn] .v2-mail-size-meter__bar::-webkit-progress-value{background:var(--warn)}
.v2-mail-size-meter[data-tone=bad] .v2-mail-size-meter__bar{accent-color:var(--bad)}
.v2-mail-size-meter[data-tone=bad] .v2-mail-size-meter__bar::-webkit-progress-value{background:var(--bad)}
.v2-mail-size-meter__bar::-moz-progress-bar{background:var(--accent-fill);border-radius:var(--radius-pill)}
.v2-mail-size-meter[data-tone=warn] .v2-mail-size-meter__bar::-moz-progress-bar{background:var(--warn)}
.v2-mail-size-meter[data-tone=bad] .v2-mail-size-meter__bar::-moz-progress-bar{background:var(--bad)}
.v2-mail-compose-attachments>ul{margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,18.75rem),1fr));gap:.625rem}
.v2-mail-compose-attachments>ul:empty{display:none}
.v2-mail-vacation input[type=number]{font-variant-numeric:tabular-nums}
.v2-mail-vacation pre{padding:1rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--code,var(--sunken));color:var(--code-text,var(--text));font:.75rem/1.7 var(--font-mono);white-space:pre-wrap;overflow-wrap:anywhere;min-inline-size:0;direction:ltr;text-align:start}
.v2-mail-compose-aside .v2-card__body>p{font-size:.875rem;line-height:1.5;color:var(--text-2)}
@media(min-width:1024px){.v2-mail-panes{gap:1.875rem}}
@media(max-width:959px){.v2-mail-inbox input,.v2-mail-compose :is(input,select,textarea,[contenteditable]){font-size:16px!important}}
@media(max-width:767px){.v2-mail-panes{grid-template-columns:minmax(0,1fr);min-block-size:0}.v2-mail-compose-footer>[data-mail-send]{flex:1 1 100%;order:3}}
@media(prefers-reduced-motion:reduce){${R} .v2-mail-tools .kt-menu-arrow>.v2-icon,.v2-mail-row,.v2-mail-size-meter__bar::-webkit-progress-value{transition:none}}
`
