/** Structure and state only: Metronic classes in the markup supply surfaces, controls and type. Spacing is the
 *  Metronic scale (20px stacks, 10px groups, 6px label to control). */
export const WHM_RESELLERS_CSS = `.v2-resellers,.v2-reseller-detail{min-inline-size:0}
.v2-reseller-stack{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-reseller-stack>.v2-btn{align-self:flex-end}
.v2-resellers .v2-card p:not([role=status]){font-size:.875rem;line-height:1.375rem;color:var(--text-2)}
.v2-reseller-header>.v2-reseller-facts{flex:1 1 100%;grid-template-columns:repeat(auto-fit,minmax(min(176px,100%),1fr));margin-block-start:.625rem;padding-block-start:1.25rem;border-block-start:1px solid var(--line)}
.v2-reseller-header>.v2-reseller-facts>div{padding:.625rem .875rem;border:1px dashed var(--line-strong);border-radius:var(--radius-control)}
.v2-reseller-header>.v2-reseller-facts>div>dd{order:-1}
.v2-reseller-facts,.v2-reseller-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));align-items:start;gap:1.25rem;min-inline-size:0}
.v2-reseller-header>.v2-reseller-facts{align-items:stretch;gap:.625rem}
.v2-reseller-facts>div{min-inline-size:0;text-align:start}
.v2-reseller-facts dd{font-variant-numeric:tabular-nums;overflow-wrap:break-word;word-break:normal}.v2-reseller-facts bdi{unicode-bidi:isolate}
.v2-resellers>.v2-reseller-facts{grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));align-items:stretch}
.v2-reseller-field{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.375rem .75rem;min-inline-size:0;text-align:start}
.v2-reseller-field>:not(.v2-reseller-choice,input,select,textarea),.v2-reseller-field>:is(input,select,textarea):not(:has(+.v2-reseller-choice)){grid-column:1/-1}
.v2-reseller-field>label.v2-reseller-choice{white-space:nowrap}
.v2-reseller-field :is(input:not([type=checkbox]),select,textarea){inline-size:100%;min-inline-size:0}.v2-reseller-field [dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-reseller-fields>.v2-btn{align-self:end;justify-self:start}
.v2-reseller-fields>.v2-reseller-stack{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
.v2-reseller-fields>.v2-reseller-stack+.v2-reseller-stack{padding-block-start:1.25rem;border-block-start:1px solid var(--line)}
.v2-reseller-columns{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,1fr);gap:1.25rem;align-items:stretch}
.v2-reseller-columns>.v2-reseller-stack>.v2-card:last-child{flex:1 1 auto}
.v2-reseller-checks{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr));gap:.25rem 1.25rem}
.v2-reseller-choice{display:flex;align-items:center;gap:.5rem;min-inline-size:var(--target);min-block-size:var(--target);line-height:1.4;cursor:pointer}
.v2-reseller-choice>input{flex:none}
.v2-resellers fieldset{padding:0;margin:0;border:0;min-inline-size:0;display:flex;flex-direction:column;gap:.625rem}
.v2-resellers legend{float:inline-start;inline-size:100%;padding:0}
.v2-resellers .v2-meter__row{flex-direction:column;align-items:stretch;gap:.5rem}
.v2-resellers .v2-meter__value{justify-content:flex-start;flex-wrap:wrap;white-space:normal;min-inline-size:0;overflow-wrap:anywhere}
.v2-reseller-stack[data-whm-reseller-lists] .v2-reseller-field{max-inline-size:30rem}
.v2-reseller-savebar p:empty,.v2-reseller-actions>p:empty{display:none}
.v2-reseller-details:has(>.v2-reseller-detail:target)>.v2-reseller-detail:not(:target),.v2-reseller-details:not(:has(>.v2-reseller-detail:target))>.v2-reseller-detail:not(:first-child){display:none}
@media(min-width:1024px){.v2-reseller-columns,.v2-reseller-columns>.v2-reseller-stack,.v2-reseller-detail>.v2-reseller-stack,.v2-reseller-stack[data-whm-reseller-lists],.v2-reseller-stack[data-whm-reseller-email]{gap:1.875rem}}
@media(max-width:960px){.v2-reseller-columns{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.v2-reseller-fields>.v2-reseller-stack{grid-template-columns:minmax(0,1fr)}.v2-reseller-header>.v2-reseller-facts,.v2-resellers>.v2-reseller-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.v2-resellers #v2-reseller-list td .v2-reseller-ns{overflow-wrap:normal}
@media(min-width:1280px){.v2-resellers #v2-reseller-list td .v2-reseller-ns{white-space:nowrap}.v2-resellers #v2-reseller-list td .v2-reseller-ns wbr{display:none}}
.v2-reseller-cell{display:contents}
@media(max-width:600px){.v2-resellers td:has(>.v2-reseller-cell){grid-column:1/-1}.v2-reseller-cell{display:flex;align-items:baseline;justify-content:flex-end;gap:1rem}.v2-reseller-cell::before{content:attr(data-phone-label);margin-inline-end:auto;font-size:.75rem;color:var(--text-2)}.v2-reseller-cell>span{text-align:end;min-inline-size:0}}
.v2-reseller-name--pills{display:flex;flex-direction:column;align-items:flex-start;gap:.375rem;min-inline-size:0}
.v2-resellers #v2-reseller-list td{white-space:normal}
.v2-resellers #v2-reseller-list td bdi{white-space:normal;overflow-wrap:break-word;word-break:normal}
.v2-resellers #v2-reseller-list td:last-child{white-space:nowrap}
.v2-resellers #v2-reseller-list td:first-child bdi{white-space:nowrap}
.v2-resellers #v2-reseller-list td:first-child small bdi{white-space:normal}
.v2-resellers td{font-variant-numeric:tabular-nums}
.v2-resellers input[type=number]{font-variant-numeric:tabular-nums}
.v2-resellers #v2-reseller-records td bdi{overflow-wrap:anywhere}
.v2-resellers #v2-reseller-list td .v2-reseller-email{overflow-wrap:normal;word-break:normal}
.v2-reseller-ratio{display:inline-block;unicode-bidi:isolate;font-variant-numeric:tabular-nums}
.v2-resellers td>span.v2-muted{display:block;font-size:.75rem}
`
