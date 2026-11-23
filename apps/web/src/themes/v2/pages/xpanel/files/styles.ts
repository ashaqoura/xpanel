// Layout only: colors, radii, control and button looks come from the Metronic classes in the markup. Gaps use the
// Metronic scale (page and card grids 1.25rem, 1.875rem from the large breakpoint; stacks inside a card 1.25rem).
// File-type glyphs: every row carries the same set and the row's kind and file extension show one of them.
const ext = (...names: string[]): string => `:is(${names.map(name => `[data-file-path$=".${name}" i]`).join(',')})`
const IMAGE = ext('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif')
const CODE = ext('php', 'js', 'mjs', 'ts', 'css', 'html', 'htm', 'json', 'xml', 'yml', 'yaml', 'sh', 'py', 'sql', 'htaccess', 'ini', 'conf')
const ARCHIVE = ext('zip', 'gz', 'tgz', 'tar', 'bz2', 'xz', '7z', 'rar')
const SHEET = ext('csv', 'xls', 'xlsx', 'ods', 'pdf', 'doc', 'docx')
const FILE_ROW = '.v2-files tr[data-file-kind=file]'
const STATUS = ':not(:empty,[hidden],[data-state=failed],[data-state=uncertain],[data-state=error])'

export const V2_FILES_CSS = `.v2-files{--v2-files-gap:1.25rem;display:flex;flex-direction:column;gap:var(--v2-files-gap);min-inline-size:0}
@media(min-width:1024px){.v2-files{--v2-files-gap:1.875rem}}
.v2-files .v2-card h3{font-size:.875rem;line-height:1.4}
.v2-files .v2-field,.v2-files[data-file-manager]~* .v2-field{gap:.625rem}
.v2-files :is(.v2-field>p,.v2-field__help),.v2-files[data-file-manager]~* :is(.v2-field>p,.v2-field__help,[role=status]){font-size:.75rem;line-height:1.5;color:var(--text-2)}
.v2-files :is(.v2-num,[data-file-manager-table] td,output,[data-file-detail=size],[data-file-detail=modified],[data-file-detail=mode],[data-xp-slot=bytes]){font-variant-numeric:tabular-nums}
.v2-file-controls{min-inline-size:0}
.v2-file-controls__body{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-files .v2-file-controls [role=status]:empty{display:none}
.v2-file-controls__body>[role=status]${STATUS}{padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--sunken);font-size:.875rem;line-height:1.5;color:var(--text)}
.v2-file-views{flex-wrap:wrap}
.v2-file-views>a{text-decoration:none}
.v2-file-toolbar,.v2-file-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-file-strip{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem 1.25rem;min-inline-size:0}
.v2-file-location{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem;min-inline-size:0}
.v2-file-crumbs{display:inline-flex;align-items:center;gap:.375rem;direction:ltr;unicode-bidi:isolate;max-inline-size:100%;min-block-size:1.75rem;padding:0 .625rem;border:1px solid var(--line);border-radius:var(--radius-control);background:var(--sunken);font-size:.8125rem;color:var(--text-2);overflow:auto;white-space:nowrap}
.v2-file-crumbs>.v2-icon{color:var(--muted)}
.v2-file-browser{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--v2-files-gap)}
.v2-file-tree,.v2-file-tree ul{display:flex;flex-direction:column;gap:.625rem;font-size:.875rem;color:var(--text)}
.v2-file-tree li{overflow-wrap:anywhere}.v2-file-tree .v2-icon{margin-inline-end:.5rem;color:var(--muted)}
.v2-file-tree ul{margin-block-start:.625rem;padding-inline-start:1.5rem}
.v2-file-glyph>[data-file-glyph]{display:none}
.v2-files tr[data-file-kind=directory] [data-file-glyph=folder],.v2-files tr[data-file-kind=symlink] [data-file-glyph=link],${FILE_ROW}${IMAGE} [data-file-glyph=image],${FILE_ROW}${CODE} [data-file-glyph=code],${FILE_ROW}${ARCHIVE} [data-file-glyph=archive],${FILE_ROW}${SHEET} [data-file-glyph=sheet],${FILE_ROW}:not(${IMAGE},${CODE},${ARCHIVE},${SHEET}) [data-file-glyph=file],.v2-files tr:not([data-file-kind]) [data-file-glyph=file]{display:inline-flex}
.v2-file-name{display:inline-flex;align-items:center;gap:.375rem;min-inline-size:0}
.v2-file-path{display:block;font-size:.75rem;color:var(--text-2)}
.v2-files [data-file-manager-table]{min-inline-size:760px}
.v2-files .v2-table :is(th,td){text-align:start}
.v2-files .v2-table td:last-child{min-inline-size:11.25rem}
.v2-files [data-file-manager-table] td:last-child>.v2-btn{margin-block:.125rem;margin-inline-end:.375rem}
.v2-files [data-file-manager-table] td:is(:nth-child(3),:nth-child(5),:nth-child(6)){white-space:nowrap}
.v2-files [data-file-manager-table] td[colspan]{padding-block:1.875rem;text-align:center;color:var(--text-2)}
.v2-file-view-empty{margin:0;padding:1.25rem;text-align:center;font-size:.875rem;color:var(--muted)}
.v2-file-editor .v2-field>label:has(>input[type=checkbox]){display:flex;align-items:center;gap:.5rem;min-block-size:var(--target);font-size:.875rem;font-weight:400}
.v2-file-details{display:grid;grid-template-columns:minmax(0,1.618fr) minmax(0,1fr);gap:var(--v2-files-gap)}
.v2-file-editor{display:flex;flex-direction:column;gap:1.25rem}
.v2-files #jailed-code-editor{inline-size:100%;min-block-size:280px;white-space:pre;tab-size:2;text-align:match-parent;text-align:-webkit-match-parent;overflow:auto}
.v2-file-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem}
.v2-files bdi{unicode-bidi:isolate;overflow-wrap:anywhere}
.v2-files [data-state=failed],.v2-files [data-state=uncertain]{color:var(--bad)}
.v2-file-trash-empty{display:flex;flex-direction:column;align-items:center;gap:.625rem;padding:1.875rem 1.25rem;text-align:center}
.v2-directory-privacy>[data-directory-privacy-preview-wrap]{display:flex;flex-direction:column;gap:.625rem}
.v2-directory-privacy>.v2-code,.v2-directory-privacy [data-directory-privacy-preview-wrap]>.v2-code{border-radius:var(--radius-notice)}
.v2-directory-privacy [data-directory-privacy-preview]{display:block;direction:ltr;white-space:pre;overflow:auto;text-align:match-parent;text-align:-webkit-match-parent}
.v2-directory-privacy>[role=status]${STATUS}{padding:.875rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--surface);font-size:.875rem;line-height:1.5;color:var(--text)}
.v2-files:dir(rtl) *,[data-ui-theme="v2"] [dir=rtl] .v2-files *,[data-ui-theme="v2"] [dir=rtl] .v2-files[data-file-manager]~* *{letter-spacing:0}
@media(max-width:1000px){.v2-file-details{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-file-fields{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-files [data-file-manager-table] tr>td[data-label]{grid-column:1/-1!important;grid-row:auto!important;justify-self:stretch!important;display:flex;align-items:baseline;justify-content:space-between;gap:1rem;text-align:end!important}.v2-files [data-file-manager-table] td[data-label]::before{content:attr(data-label);font-size:.75rem;color:var(--muted);text-align:start}}
@media(max-width:600px){.v2-files [data-file-manager-table] tbody tr:has(>td:first-child input[type=checkbox]){padding-inline-start:60px}.v2-files [data-file-manager-table] tbody tr>td:first-child:has(input[type=checkbox]){grid-column:auto!important;grid-row:auto!important;inset-inline-start:8px!important}}
@media(max-width:600px){.v2-files[data-leech-protection] tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.v2-files[data-leech-protection] tr>:last-child{grid-column:1/-1}.v2-files[data-leech-protection] th:last-child{display:none}}
.v2-files[data-file-manager] .v2-file-view-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.625rem 1.25rem;min-inline-size:0}
.v2-files[data-file-manager] .v2-file-view-controls>label{inline-size:15rem;max-inline-size:100%}
.v2-files[data-file-manager] .v2-file-view-controls>label>input{flex:1 1 auto;inline-size:100%;min-inline-size:0;min-block-size:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
.v2-files[data-file-manager] .v2-file-view-controls>label>input:focus-visible{outline:0;box-shadow:none}
.v2-files[data-file-manager] .v2-file-view-controls>div{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem}
.v2-files[data-file-manager] .v2-file-view-details{container-type:inline-size;min-inline-size:0}
.v2-files[data-file-manager] .v2-file-view-details__body{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem;min-inline-size:0}
.v2-files[data-file-manager] .v2-file-view-details dl{display:grid;grid-template-columns:minmax(0,1fr);align-content:start;gap:.625rem;min-inline-size:0}
.v2-files[data-file-manager] .v2-file-view-details dl>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .625rem;min-inline-size:0;text-align:start}
.v2-files[data-file-manager] .v2-file-view-details dt{flex:0 0 9rem;max-inline-size:100%}
.v2-files[data-file-manager] .v2-file-view-details dd{flex:1 1 10rem;min-inline-size:0;overflow-wrap:anywhere}
.v2-files[data-file-manager] .v2-file-view-permissions :is(th,td){text-align:start}
.v2-files[data-file-manager] .v2-file-view-permissions tbody th{font-weight:500;color:var(--mono,var(--text))}
@container (min-width:44rem){.v2-files[data-file-manager] .v2-file-view-details__body{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:1.25rem 1.875rem;align-items:start}.v2-files[data-file-manager] .v2-file-view-details__body>p{grid-column:1/-1}}
.v2-files[data-file-manager] .v2-file-view-uploads ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:.625rem}
.v2-files[data-file-manager] .v2-file-view-upload{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:.125rem .625rem;padding:.625rem;border:1px solid var(--line);border-radius:var(--radius-notice);min-inline-size:0}
.v2-files[data-file-manager] .v2-file-view-upload>.v2-file-glyph{grid-column:1;grid-row:1/3}
.v2-files[data-file-manager] .v2-file-view-upload>[data-xp-slot=name]{grid-column:2;grid-row:1;overflow-wrap:anywhere}
.v2-files[data-file-manager] .v2-file-view-upload>[data-xp-slot=bytes]{grid-column:2;grid-row:2}
.v2-files[data-file-manager] .v2-file-view-upload>[data-xp-slot=state]{grid-column:3;grid-row:1/3;white-space:normal}
.v2-files[data-file-manager] .v2-file-view-upload>[data-xp-slot=dismiss]{grid-column:4;grid-row:1/3}
.v2-files[data-file-manager] .v2-file-view-upload>[data-xp-slot=dismiss]::before{font-size:.875rem;color:var(--muted)}
.v2-files[data-file-manager] .v2-file-view-progress{grid-column:1/-1;margin-block-start:.375rem}
.v2-files[data-file-manager] [data-file-manager-table] :is(th,td):nth-child(3){text-align:end}
.v2-files[data-file-manager] [data-file-manager-table] :is(th,td):first-child{inline-size:3rem}
.v2-files[data-file-manager] [data-file-manager-table] td:first-child label,.v2-files[data-file-manager] [data-file-manager-table] th:first-child label{display:inline-flex;align-items:center;justify-content:center;min-inline-size:1.75rem;min-block-size:1.75rem}
.v2-files[data-file-manager] [data-file-manager-table] :is([data-xp-slot=kind],.v2-file-path){display:block;overflow-wrap:anywhere}
.v2-files[data-file-manager] [data-file-editor-panel][hidden],.v2-files[data-file-manager] [data-file-editor-closed][hidden],.v2-files[data-file-manager] [data-xp-slot=progress][hidden]{display:none!important}
@media(max-width:600px){.v2-files[data-file-manager] table.v2-file-view-permissions tr{display:table-row!important}.v2-files[data-file-manager] table.v2-file-view-permissions :is(th,td){display:table-cell!important;padding:.5rem .25rem!important}.v2-files[data-file-manager] table.v2-file-view-permissions thead{position:static!important;inline-size:auto!important;block-size:auto!important;clip-path:none!important;display:table-header-group!important}}
.v2-files[data-file-manager] .v2-file-details>div{display:flex;flex-direction:column;gap:var(--v2-files-gap);min-inline-size:0}
.v2-files[data-file-manager] .v2-file-tree-disclosure{display:flex;flex-direction:column;align-items:flex-start;gap:.625rem}
.v2-files[data-file-manager] .v2-file-tree-disclosure>summary{list-style:none}.v2-files[data-file-manager] .v2-file-tree-disclosure>summary::-webkit-details-marker{display:none}
.v2-files[data-file-manager] .v2-file-tree-disclosure[open]>summary>.v2-icon:last-child{transform:rotate(180deg)}
.v2-files[data-file-manager] .v2-file-tree-disclosure>.v2-card{align-self:stretch}
.v2-files[data-file-manager] [data-file-manager-table] tr[data-file-selected]>td{background:var(--accent-soft)}
.v2-files[data-file-manager] .v2-file-details:has(>div>[data-file-editor-closed]:not([hidden])){grid-template-columns:minmax(0,1fr)}
.v2-files[data-file-manager] .v2-file-side__stack{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--v2-files-gap);min-inline-size:0}
@media(min-width:1001px){.v2-files[data-file-manager] .v2-file-details:has(>div>[data-file-editor-closed]:not([hidden])) .v2-file-side__stack{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}.v2-files[data-file-manager] .v2-file-details:has(>div>[data-file-editor-closed]:not([hidden])) .v2-file-side__stack>*{height:100%}}
.v2-files[data-file-manager]~[data-image-tools] .v2-panel-operation-fields,.v2-files[data-file-manager]~* .v2-panel-operation-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:1.25rem;align-items:start}
.v2-files[data-file-manager]~[data-html-editor] .v2-field{max-inline-size:560px}
.v2-files[data-file-manager]~[data-html-editor] .v2-panel-operation-actions{display:flex;flex-wrap:wrap;gap:.5rem}
.v2-directory-privacy-users{display:flex;flex-direction:column;gap:.625rem}
.v2-directory-privacy-user{display:flex;flex-wrap:wrap;align-items:end;gap:.625rem}
.v2-directory-privacy-user>.v2-field{flex:1 1 8rem;display:flex;flex-direction:column;gap:.375rem;min-inline-size:0}.v2-directory-privacy-user>.v2-field:has(input){flex-basis:12rem}
.v2-leech-stack{display:flex;flex-direction:column;align-items:flex-start;gap:.25rem;min-inline-size:0;overflow-wrap:anywhere}
.v2-files iframe[data-html-frame],.v2-files[data-file-manager]~* iframe[data-html-frame]{inline-size:100%;min-block-size:320px;border:1px solid var(--line-strong);border-radius:var(--radius-notice)}
@media(max-width:600px){.v2-directory-privacy table:has(>[data-directory-privacy-rows]){display:block;min-inline-size:0!important}.v2-directory-privacy table:has(>[data-directory-privacy-rows])>thead{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}.v2-directory-privacy table:has(>[data-directory-privacy-rows])>tbody{display:block}.v2-directory-privacy table:has(>[data-directory-privacy-rows])>tbody>tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding:1rem}.v2-directory-privacy table:has(>[data-directory-privacy-rows])>tbody>tr>td{display:flex;flex-direction:column;align-items:flex-start;gap:.375rem;min-inline-size:0;padding:0;border:0}.v2-directory-privacy table:has(>[data-directory-privacy-rows])>tbody>tr>td:is(:first-child,:last-child,[colspan]),.v2-directory-privacy [data-directory-privacy-rows]>tr>td:nth-child(3){grid-column:1/-1}.v2-directory-privacy [data-directory-privacy-rows] td[data-label]::before{content:attr(data-label);font-size:.75rem;color:var(--muted)}.v2-directory-privacy [data-directory-privacy-rows] td>*{max-inline-size:100%}}
`
