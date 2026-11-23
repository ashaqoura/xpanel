import { adminStyles } from '../server/common.ts'
import { ki } from '../monitoring/common.ts'

/** The name of a setting inside a card: Metronic row titles are medium, not the card title weight. */
export const SUBGROUP_TITLE = 'text-sm font-medium text-mono'

/** A boolean setting as a Metronic switch row (account/notifications.html): its name and description at the start,
 *  the switch at the end. `labelHtml` is the state name beside the switch, as "Publish" beside a Metronic header
 *  switch; without it the whole row is the label of the switch, so `titleHtml` is phrasing content there.
 *  `hook` is the complete controller attribute of the checkbox, which core enables once the setting is read. */
export const switchSetting = (props: { titleHtml: string; descriptionHtml?: string; labelHtml?: string; hook: string }): string => {
  const input = `<input type="checkbox" class="kt-switch kt-switch-sm" ${props.hook} disabled>`
  return props.labelHtml
    ? `<div class="v2-panel-toggle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-5"><div class="flex flex-col gap-1 min-w-0 sm:flex-1">${props.titleHtml}${props.descriptionHtml ? `<p class="text-sm font-normal text-secondary-foreground">${props.descriptionHtml}</p>` : ''}</div><label class="kt-label shrink-0 self-start sm:self-auto font-normal text-secondary-foreground cursor-pointer">${props.labelHtml}${input}</label></div>`
    : `<label class="v2-panel-toggle flex items-center justify-between gap-5 cursor-pointer"><span class="flex flex-col gap-1 min-w-0">${props.titleHtml}${props.descriptionHtml ? `<span class="text-sm font-normal text-secondary-foreground">${props.descriptionHtml}</span>` : ''}</span>${input}</label>`
}

/** The soft destructive action of a button group: remove, delete, revoke. `hook` is its complete controller attribute. */
export const softDanger = (labelHtml: string, hook: string, small = false): string =>
  `<button type="button" class="${small ? 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive kt-btn-sm' : 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive'}" ${hook} disabled>${ki('ki-trash')}${labelHtml}</button>`

/** Links to the pages that own a setting, as Metronic menu rows: a Keenicon, the name and a chevron. */
export const linkList = (links: readonly (readonly [href: string, labelHtml: string, glyph: string])[]): string =>
  `<ul class="v2-admin-list v2-admin-links flex flex-col gap-0 list-none p-0">${links.map(([href, label, glyph]) => `<li class="border-b border-border last:border-b-0"><a class="flex items-center justify-between gap-2.5 min-h-11 text-sm font-medium text-mono hover:text-primary" href="${href}"><span class="flex items-center gap-2.5 min-w-0">${ki(glyph, 'text-base text-muted-foreground')}<span>${label}</span></span><i class="ki-filled ki-right v2-flip text-xs text-muted-foreground" aria-hidden="true"></i></a></li>`).join('')}</ul>`

/** Plain facts of a card as Metronic item rows: a round Keenicon tile and the text. */
export const iconRows = (rows: readonly (readonly [glyph: string, html: string])[]): string =>
  `<ul class="flex flex-col gap-2.5 list-none p-0">${rows.map(([glyph, html]) => `<li class="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5"><span class="flex items-center justify-center shrink-0 size-9 rounded-full border border-input bg-accent/60 text-secondary-foreground" aria-hidden="true">${ki(glyph, 'text-base')}</span><span class="text-sm font-medium text-mono min-w-0">${html}</span></li>`).join('')}</ul>`

/** Standing notes of a page as a Metronic check list: each line leads with a Keenicon. */
export const noteList = (notesHtml: readonly string[]): string =>
  `<ul class="flex flex-col gap-2.5 list-none p-0">${notesHtml.map(note => `<li class="flex items-start gap-2 text-sm text-foreground"><i class="ki-filled ki-check-circle text-base leading-5 text-green-500 shrink-0" aria-hidden="true"></i><span class="min-w-0">${note}</span></li>`).join('')}</ul>`

/** A hidden "nothing yet" block as a Metronic empty state; `attr` is the controller attribute that shows it. */
export const emptyBlock = (attr: string, glyph: string, titleHtml: string, textHtml: string): string =>
  `<div class="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-input px-5 py-7.5 text-center" ${attr} hidden>${ki(glyph, 'text-3xl text-muted-foreground')}<h3 class="text-sm font-semibold text-mono">${titleHtml}</h3><p class="text-sm text-secondary-foreground">${textHtml}</p></div>`

/** Structure, bidi and controller state only; the family layout comes from adminStyles and the Metronic classes in the markup. */
export const WHM_PANEL_CSS = adminStyles('.v2-panel-page') + `.v2-panel-page [data-whm-whmcs-form]{gap:var(--space-3)}
@media(min-width:1024px){.v2-panel-page [data-whm-whmcs-form]{gap:var(--space-4)}}
.v2-panel-page #v2-panel-whmcs-plan-table td :is(input,select){inline-size:100%;min-inline-size:0}
.v2-panel-page #v2-panel-whmcs-plan-table td{vertical-align:middle}
@media(min-width:1280px){.v2-panel-page #v2-panel-token-table :is(th,td){padding-inline:.5rem}.v2-panel-page #v2-panel-token-table td *{overflow-wrap:break-word}.v2-panel-page #v2-panel-token-table ul{padding-inline-start:1rem}}
.v2-panel-page .v2-panel-branding-preview img{max-inline-size:100%;max-block-size:100%}
.v2-panel-page .v2-panel-toggle :is(h3,p){margin:0}
.v2-panel-page .v2-panel-module-ops{list-style:none;margin:0;padding:0}
.v2-panel-page .v2-panel-module-ops li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-block-size:2.75rem;border-block-end:1px solid var(--line)}
.v2-panel-page .v2-panel-module-ops li:last-child{border-block-end:0}
.v2-panel-page .v2-card__body:has(>.v2-panel-branding-asset){display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:var(--space-3);align-items:start;align-content:start}
.v2-panel-page .v2-panel-data__tools{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-3);align-items:start}
@media(min-width:1024px){.v2-panel-page .v2-panel-data__tools{gap:var(--space-4)}}
.v2-panel-page .v2-panel-data__rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:var(--space-2) var(--space-4)}
.v2-panel-page [data-generation-rows] td:nth-child(2){min-inline-size:12.5rem}
.v2-panel-page [data-generation-rows] td:is(:first-child,:nth-child(4),:last-child){white-space:nowrap}
.v2-panel-page [data-whm-languages-row]>th>span{display:block}
.v2-panel-page [data-whm-languages-row]>th>.v2-muted{font-size:.75rem;font-weight:400;color:var(--text-2)}
.v2-panel-page [data-whm-languages-row] .v2-admin-actions{gap:.375rem;justify-content:flex-start}
.v2-panel-page [data-locale-copy-form]{display:flex;flex-direction:column;gap:var(--space-3)}
.v2-panel-page [data-locale-copy-form] .v2-account-tool__fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.v2-panel-page [data-locale-copy-form] .v2-account-tool__field{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0}
.v2-panel-page [data-locale-copy-form] :is(input,select){inline-size:100%;min-inline-size:0;box-sizing:border-box}
.v2-panel-page :is([data-whm-languages-messages],[data-whm-tokens-rows] td,[data-whm-whmcs-plan-rows] td,[data-whm-whmcs-log-rows] td,[data-dev-fact],[data-panel-settings-updated],[data-branding-updated],[data-whm-whmcs-updated],[data-whm-whmcs-token-created],[data-whm-notifications-field=updated],[data-whm-preferences-field=updatedAt]){font-variant-numeric:tabular-nums}
@media(min-width:641px){.v2-panel-page #v2-panel-token-scopes :is(th,td):nth-child(n+3){inline-size:5.5rem;text-align:center}.v2-panel-page #v2-panel-token-scopes :is(th,td){vertical-align:middle}.v2-panel-page #v2-panel-token-scopes input[type=checkbox]{vertical-align:middle}}
@media(max-width:900px){.v2-panel-page .v2-panel-data__tools{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-panel-page .v2-admin-table :is(th,td){border-block-end:0}
.v2-panel-page .v2-admin-table tbody>tr{border-block-end:1px solid var(--line)}
.v2-panel-page td[data-phone-label]{grid-column:1/-1;display:flex;justify-content:space-between;gap:var(--space-2);text-align:end}
.v2-panel-page td[data-phone-label]::before{content:attr(data-phone-label);flex:none;font-size:.75rem;color:var(--text-2);text-align:start}}
@media(max-width:640px){.v2-panel-page [data-locale-copy-form] .v2-account-tool__fields{grid-template-columns:minmax(0,1fr)}.v2-panel-page #v2-panel-token-scopes,.v2-panel-page #v2-panel-token-scopes :is(thead,tbody){display:block;inline-size:100%;min-inline-size:0}
.v2-panel-page #v2-panel-token-scopes tr{display:grid;grid-template-columns:minmax(0,1fr) 56px 56px;align-items:center;column-gap:var(--space-1);border-block-end:1px solid var(--line)}
.v2-panel-page #v2-panel-token-scopes tr>*{min-inline-size:0;padding:var(--space-1) 0;border:0}
.v2-panel-page #v2-panel-token-scopes thead th:nth-child(2){position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
.v2-panel-page #v2-panel-token-scopes tr>:nth-child(3){grid-area:1/2/3/3;text-align:center}
.v2-panel-page #v2-panel-token-scopes tr>:nth-child(4){grid-area:1/3/3/4;text-align:center}
.v2-panel-page #v2-panel-token-scopes tbody th{grid-area:1/1;padding-block-end:0}
.v2-panel-page #v2-panel-token-scopes tbody td:nth-child(2){grid-area:2/1;padding-block-start:0;font-size:.75rem;color:var(--text-2)}}
.v2-panel-page .v2-panel-token-scope-check{display:inline-flex;align-items:center;justify-content:center;min-inline-size:var(--target);min-block-size:var(--target);cursor:pointer}
.v2-panel-page [data-dev-result-fields]:empty{display:none}
`
