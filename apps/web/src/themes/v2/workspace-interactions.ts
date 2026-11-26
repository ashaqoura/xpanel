// Workspace interaction styles: operations dock, sticky unsaved-changes save bar,
// multi-step wizard navigation, file dropzones, sortable handles, table pagination,
// password strength indicator, cron preview, and skeleton shimmer.

export const WORKSPACE_INTERACTIONS_CSS = `.v2-ops-dock{position:fixed;bottom:16px;inset-inline-start:16px;z-index:85;display:flex;flex-direction:column;gap:8px;inline-size:min(380px,calc(100vw - 32px));max-block-size:50dvh;overflow-y:auto}
@media(min-width:960px){.v2-ops-dock{inset-inline-start:calc(var(--v2-col,0px) + 16px)}}
.v2-ops-item{display:flex;flex-direction:column;gap:8px;padding:.875rem;border-radius:var(--radius-notice);background:var(--popover,var(--surface));border:1px solid var(--line);box-shadow:var(--v2-elev)}
.v2-ops-item[data-ops-state="running"]{border-inline-start:3px solid var(--accent-fill)}
.v2-ops-item[data-ops-state="succeeded"]{border-inline-start:3px solid var(--ok)}
.v2-ops-item[data-ops-state="failed"]{border-inline-start:3px solid var(--bad)}
.v2-ops-item__head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.v2-ops-item__title{font-size:.8125rem;font-weight:500;color:var(--mono,var(--text));min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v2-ops-item__meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted)}
.v2-ops-item__bar{height:4px;border-radius:var(--radius-pill);background:var(--secondary);overflow:hidden}
.v2-ops-item__fill{display:block;height:100%;border-radius:var(--radius-pill);background:var(--accent-fill);transition:inline-size .2s ease-out}
.v2-ops-item[data-ops-state="succeeded"] .v2-ops-item__fill{background:var(--color-green-500,var(--ok))}
.v2-ops-item[data-ops-state="failed"] .v2-ops-item__fill{background:var(--destructive)}
.v2-ops-item__log{margin:0;padding:8px 10px;border-radius:var(--radius-chip);background:var(--code);color:var(--code-text);font:12px/1.5 var(--font-mono);max-block-size:140px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
.v2-save-bar{position:sticky;bottom:16px;z-index:45;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;padding:.75rem var(--v2-panel-padding);border-radius:var(--radius-card);background:var(--popover,var(--surface));color:var(--text);border:1px solid var(--line);box-shadow:var(--v2-elev)}
.v2-save-bar__info{display:flex;align-items:center;gap:.625rem;font-size:.8125rem;font-weight:500;color:var(--mono,var(--text))}
.v2-save-bar__dot{width:8px;height:8px;border-radius:50%;background:var(--color-yellow-500,var(--warn))}
.v2-save-bar__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-wizard-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:10px var(--v2-panel-padding);border-radius:var(--radius-card);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)}
[data-ui-theme="v2"] [data-wizard-step][data-wizard-hidden="true"]{display:none}
.v2-dropzone{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-block-size:112px;padding:16px 20px;border-radius:var(--radius-card);border:1px dashed var(--line-strong);background:color-mix(in oklab,var(--kt-muted) 40%,transparent);color:var(--text-2);text-align:center;cursor:pointer;transition:border-color .15s,background-color .15s}
.v2-dropzone:hover,.v2-dropzone[data-drag-over="true"]{border-color:var(--accent-fill);background:var(--accent-soft);color:var(--accent)}
.v2-dropzone__title{font-size:.875rem;font-weight:500;color:var(--mono,var(--text))}
.v2-dropzone__hint{font-size:12px;color:var(--muted)}
.v2-dropzone__queue{display:flex;flex-direction:column;gap:8px;inline-size:100%;margin-top:8px}
.v2-dropzone__file{display:flex;flex-direction:column;gap:4px;padding:8px 12px;border-radius:var(--radius-control);border:1px solid var(--line);background:var(--surface);text-align:start;font-size:12px}
.v2-dropzone__file-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.v2-pagination-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem;padding:1rem var(--v2-panel-padding);border-top:1px solid var(--line);font-size:.875rem;font-weight:500;color:var(--text-2)}
.v2-pagination-bar__controls{display:inline-flex;align-items:center;gap:6px}
.v2-field-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600}
.v2-field-check[data-check="ok"]{color:var(--ok)}.v2-field-check[data-check="bad"]{color:var(--bad)}.v2-field-check[data-check="checking"]{color:var(--muted)}
.v2-password-meter{display:flex;flex-direction:column;gap:4px}
.v2-password-meter__track{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;height:5px}
.v2-password-meter__seg{border-radius:3px;background:var(--sunken);transition:background-color .15s}
.v2-password-meter[data-strength="1"] .v2-password-meter__seg:nth-child(1){background:var(--bad)}
.v2-password-meter[data-strength="2"] .v2-password-meter__seg:nth-child(-n+2){background:var(--warn)}
.v2-password-meter[data-strength="3"] .v2-password-meter__seg:nth-child(-n+3){background:var(--accent-fill)}
.v2-password-meter[data-strength="4"] .v2-password-meter__seg{background:var(--ok)}
.v2-password-meter__label{font-size:12px;color:var(--muted)}
.v2-cron-preview{display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:4px 10px;border-radius:var(--radius-chip);background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:600}
.v2-nav-progress{position:fixed;top:0;inset-inline:0;z-index:110;height:2.5px;background:var(--accent-fill);transform-origin:0 50%;opacity:0;pointer-events:none;transition:opacity .15s}
.v2-nav-progress[data-loading="true"]{opacity:1}
[data-ui-theme="v2"] :is([id],section,h1,h2,h3){scroll-margin-block-start:72px}
`
