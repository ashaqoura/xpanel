import { canOpenRegisteredRoute } from '@xpanel/catalog'
import type { Plan } from '@xpanel/core'
import { canManagePlan } from '@xpanel/core'
import type { Translate } from '../../../../../i18n.ts'
import type { WhmSurfaceProps } from '../../../../contract.ts'
import { card } from '../../../components/card.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { dataTable, type DataTableRow } from '../../../components/data-table.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { ki, labelInset, typeRole } from '../monitoring/common.ts'

/** Capability decisions are projected by core, separately from the page's stored facts. */
export interface WhmPlanAuthority {
  readonly presentation?: 'live' | 'read-only'
  readonly canReadFacts?: boolean
  readonly authorizedTools?: ReadonlySet<string>
  readonly canRead: boolean
  readonly canManage: boolean
  readonly allowUnlimited: boolean
  readonly ownerId: string | null
  readonly canReadAccounts?: boolean
}
export const DENIED_PLAN_AUTHORITY: WhmPlanAuthority = Object.freeze({ canRead: false, canManage: false, allowUnlimited: false, ownerId: null })
export const planPrincipal = (props: WhmSurfaceProps) => props.visibility?.principal ?? props.principal
export const planHref = (props: WhmSurfaceProps, id?: string): string => {
  const query = new URLSearchParams({ lang: props.locale ?? 'en', theme: props.theme ?? 'dark', density: props.density ?? 'comfortable' })
  if (id) query.set('planId', id)
  return '/whm/plans?' + query.toString()
}
export function planReadable(props: WhmSurfaceProps, authority: WhmPlanAuthority, route: string): boolean {
  const principal = planPrincipal(props)
  return authority.presentation !== 'read-only' && authority.canRead && props.capabilityUnavailable !== true && !!principal
    && canOpenRegisteredRoute(route, { ...props.visibility, principal, reseller: props.visibility?.reseller ?? props.activeReseller ?? undefined })
}
/** Saved configuration is distinct from permission to refresh or apply host state. */
export function planFactsReadable(props: WhmSurfaceProps, authority: WhmPlanAuthority, route: '/whm/plans' | '/whm/plans/features'): boolean {
  if (authority.presentation !== 'read-only') return planReadable(props, authority, route)
  const principal = planPrincipal(props)
  const tools = route === '/whm/plans' ? ['add-package', 'edit-package', 'delete-package'] : ['feature-manager', 'tweak-packages', 'feature-list-crud']
  return authority.presentation === 'read-only' && authority.canReadFacts === true && !!principal
    && tools.some(id => authority.authorizedTools?.has(id))
    && canOpenRegisteredRoute(route, { ...props.visibility, principal, reseller: props.visibility?.reseller ?? props.activeReseller ?? undefined })
}
export const planAccountFactsReadable = (authority: WhmPlanAuthority): boolean => authority.presentation === 'read-only'
  ? authority.canReadFacts === true && authority.authorizedTools?.has('list-accounts') === true : authority.canReadAccounts === true
export const planEditable = (props: WhmSurfaceProps, authority: WhmPlanAuthority, plan?: Plan): boolean =>
  authority.presentation !== 'read-only' && authority.canManage && !!planPrincipal(props) && (!plan || canManagePlan(planPrincipal(props)!, plan))
export const technical = (value: string | number): string => `<bdi class="v2-mono v2-num" dir="ltr">${escapeHtml(value)}</bdi>`
/** The Metronic look of each button role: one primary per card, outline for the rest, soft destructive for removal. */
const BUTTON_LOOK = { primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary', danger: 'v2-btn v2-btn--danger kt-btn kt-btn-outline kt-btn-destructive', plain: 'v2-btn kt-btn kt-btn-outline' } as const
/** `glyph` names a leading Keenicon; `small` is the size of row and toolbar actions. */
export const button = (label: string, hooks?: HookAttributes, options: { disabled?: boolean; primary?: boolean; danger?: boolean; small?: boolean; glyph?: string; type?: 'button' | 'submit' | 'reset' } = {}) =>
  `<button type="${options.type ?? 'button'}" class="${BUTTON_LOOK[options.danger ? 'danger' : options.primary ? 'primary' : 'plain']}"${hookAttrs(hooks)}${options.disabled ? ' disabled' : ''}>${options.glyph ? ki(options.glyph) : ''}${escapeHtml(label)}</button>`
export const group = (key: string, title: string, bodyHtml: string, actionsHtml?: string): string =>
  card({ id: `v2-plan-${key}`, title, titleId: `v2-plan-${key}-heading`, bodyHtml, ...(actionsHtml ? { actionsHtml } : {}) })
/** A phone row has no column header, so the cell carries its own label there. */
export const phoneCell = (label: string, html: string): string => `<span class="v2-plan-cell" data-phone-label="${escapeHtml(label)}"><span>${html}</span></span>`
/** Facts are Metronic stat tiles: the page CSS frames each one and leads with the value; the markup order stays name, value. */
export const facts = (rows: readonly { label: string; valueHtml: string }[]): string =>
  `<dl class="v2-plan-facts grid gap-4">${rows.map(row => `<div class="flex flex-col gap-2 min-w-0"><dt class="text-sm text-secondary-foreground">${escapeHtml(row.label)}</dt><dd class="text-base font-medium text-mono">${row.valueHtml}</dd></div>`).join('')}</dl>`
export const table = (t: Translate, key: string, title: string, labels: readonly string[], rows: readonly DataTableRow[], emptyText: string): string =>
  dataTable(t, { id: `v2-plan-${key}-table`, caption: title, columns: labels.map(label => ({ label })), rows, emptyText })
/** The summary of a Metronic accordion row inside `<details class="group …">`: its name and a chevron that turns when the row opens. */
export const disclosureSummary = (labelHtml: string): string => `<summary class="flex items-center justify-between gap-2 list-none [&::-webkit-details-marker]:hidden text-base font-medium text-mono cursor-pointer"><span class="min-w-0">${labelHtml}</span>${ki('ki-down', 'text-2sm text-muted-foreground transition-transform group-open:rotate-180')}</summary>`
export function page(t: Translate, route: string, title: string, description: string, bodyHtml: string, readable: boolean, hooks?: HookAttributes): string {
  return `<section class="v2-plan-page flex flex-col gap-8" data-whm-detail-route="${escapeHtml(route)}" data-capability-state="${readable ? 'authorized' : 'unavailable'}"${hookAttrs(hooks)}>${pageHeader(t, { route, title, description, breadcrumb: [{ label: t('Home'), href: '/whm' }, { label: title }] })}${!readable ? `<p class="text-base text-secondary-foreground" role="status">${escapeHtml(t('This host has not qualified the operation. The workspace is retained; changes remain unavailable.'))}</p>` : ''}${bodyHtml}</section>`
}
/** Structure, bidi and controller state only: surfaces, controls, type and spacing come from the Metronic classes in
 *  the markup. Gaps are the Metronic scale (30px between cards on a desktop, 20px in stacks, 10px in groups). */
export const WHM_PLANS_CSS = `.v2-plan-filter{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-plan-filter>.v2-filter--fields{padding:0}
.v2-plan-page{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-plan-stack{display:flex;flex-direction:column;gap:var(--space-4);min-inline-size:0}
.v2-plan-columns{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-plan-columns--editor{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,1fr);align-items:stretch}
@media(max-width:960px){.v2-plan-columns--editor{grid-template-columns:minmax(0,1fr)}}
.v2-plan-main,.v2-plan-aside{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-plan-columns--editor>:is(.v2-plan-main,.v2-plan-aside)>.v2-card:last-child{flex:1 1 auto}
.v2-plan-columns--editor>.v2-plan-main>.v2-card:last-child>.v2-card__body{display:flex;flex-direction:column;flex:1 1 auto}
.v2-plan-columns--top>.v2-plan-aside{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));align-items:stretch}
.v2-plan-page .v2-card__body{gap:var(--space-3)}
.v2-plan-page .v2-card__body>.v2-btn,.v2-plan-section>.v2-btn{align-self:flex-end}
${typeRole('.v2-plan-page .v2-card__body p:not([class],[role]),.v2-plan-page p[role=status][data-state]', 'body', 'color:var(--text-2)')}.v2-plan-page td{font-variant-numeric:tabular-nums}
.v2-plan-page td .v2-plan-stack{gap:.125rem}
.v2-plan-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:16px 24px}
.v2-plan-fields>.v2-plan-field:last-child:nth-child(odd){grid-column:1/-1}
.v2-plan-page [data-acct-enh-form] .v2-plan-fields{grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr))}
.v2-plan-page [data-acct-enh-form] .v2-plan-fields>.v2-plan-field:last-child:nth-child(odd){grid-column:auto}
.v2-plan-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:16px}
.v2-plan-facts>div{display:flex;flex-direction:column;gap:8px;min-inline-size:0;padding:8px 16px;border:1px dashed var(--line-strong);border-radius:var(--radius-control);text-align:start}
.v2-plan-facts dd{font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.v2-plan-facts bdi{unicode-bidi:isolate}
.v2-plan-field{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px 16px;min-inline-size:0;text-align:start}
${labelInset('.v2-plan-field')}${labelInset('.v2-feature-column')}
.v2-plan-field>:not(.v2-plan-choice,input,select),.v2-plan-field>:is(input,select):not(:has(+.v2-plan-choice)){grid-column:1/-1}
${typeRole('.v2-plan-field>p', 'caption', 'color:var(--muted)')}
.v2-plan-field>label.v2-plan-choice{white-space:nowrap}
.v2-plan-field :is(input:not([type=checkbox]),select){inline-size:100%;min-inline-size:0}.v2-plan-field [dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-plan-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.v2-plan-editor,.v2-plan-section{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0}
.v2-plan-editor{flex:1 1 auto}
.v2-plan-editor>h2{display:none}
${typeRole('.v2-plan-editor>p[role=status]', 'body', 'color:var(--text-2)')}
.v2-plan-editor>.v2-plan-actions{margin-block-start:auto;padding-block-start:var(--space-3);border-block-start:1px solid var(--line);justify-content:flex-end}
.v2-plan-editor [role=tabpanel]{padding-block-start:var(--space-3)}
.v2-plan-editor .v2-plan-review-rows{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--space-3)}
.v2-plan-editor .v2-plan-review-rows>li{display:flex;flex-direction:column;gap:8px}
.v2-plan-editor .v2-plan-review-values{margin:0}
.v2-plan-editor .v2-plan-review-values>div{min-inline-size:0}
.v2-plan-editor .v2-plan-review-values :is(dt,dd){margin:0;overflow-wrap:anywhere}
.v2-plan-aside .v2-table{min-inline-size:0}
.v2-plan-aside .v2-table :is(th,td){padding-inline:.75rem;white-space:normal;overflow-wrap:break-word}
@media(min-width:601px){.v2-plan-aside :is(#v2-plan-impact-table,#v2-plan-assigned-table){table-layout:fixed}.v2-plan-aside #v2-plan-impact-table :is(th,td):first-child{inline-size:34%}.v2-plan-aside #v2-plan-impact-table :is(th,td):nth-child(2){inline-size:30%;text-align:end}.v2-plan-aside #v2-plan-impact-table :is(th,td):nth-child(3){inline-size:36%}.v2-plan-aside #v2-plan-assigned-table :is(th,td):first-child{inline-size:40%}.v2-plan-aside #v2-plan-assigned-table :is(th,td):nth-child(2){inline-size:60%}}
.v2-plan-aside .v2-table td:last-child bdi{overflow-wrap:anywhere}
.v2-plan-page #v2-plan-all td bdi{white-space:nowrap}
.v2-plan-page #v2-plan-all :is(th,td){padding-inline:.5rem;white-space:normal}
.v2-plan-page #v2-plan-all thead th{vertical-align:bottom}
.v2-plan-page td .v2-plan-actions{flex-wrap:nowrap;gap:.375rem}
.v2-plan-editor fieldset,.v2-plan-section fieldset{margin:0;padding:0;border:0;min-inline-size:0;display:flex;flex-direction:column;gap:var(--space-3)}
.v2-plan-editor legend,.v2-plan-section legend{float:inline-start;inline-size:100%;padding:0}
.v2-plan-editor :is(#v2-plan-resources,#v2-plan-resources+fieldset)>legend{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.v2-plan-editor #v2-plan-resources+fieldset{gap:8px;padding-block-start:var(--space-3);border-block-start:1px solid var(--line)}
.v2-plan-choice{display:flex;align-items:center;gap:8px;min-inline-size:var(--target);min-block-size:var(--target);cursor:pointer}
.v2-plan-choice>input{flex:none}
.v2-plan-picker{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(15rem,100%),1fr));gap:8px}
.v2-plan-picker a{text-decoration:none;transition:background-color 140ms ease-out,border-color 140ms ease-out}
.v2-plan-owner{margin:0}
.v2-feature-groups>li>span.v2-feature-shown{flex-basis:100%}
.v2-plan-cell{display:contents}
@media(max-width:600px){.v2-plan-page td:has(>.v2-plan-cell){grid-column:1/-1}.v2-plan-cell{display:flex;align-items:baseline;justify-content:flex-end;gap:1rem}.v2-plan-cell::before{content:attr(data-phone-label);margin-inline-end:auto;font-size:.8125rem;color:var(--text-2)}.v2-plan-cell>span{text-align:end;min-inline-size:0}}
.v2-plan-dialog{inline-size:min(32.5rem,calc(100% - 2rem));margin:auto;padding:0;border:0;background:transparent;color:inherit;overflow:visible}
.v2-plan-dialog::backdrop{background:var(--scrim);backdrop-filter:blur(4px)}
.v2-feature-matrix{overflow-x:auto;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card);container-type:inline-size}
.v2-feature-matrix table{min-inline-size:35rem}
.v2-feature-matrix caption:not(.v2-sr){caption-side:top;margin:0;padding:.75rem 1rem;text-align:start;white-space:normal;font-size:.8125rem;font-weight:400;color:var(--text-2)}
.v2-feature-matrix :is(th,td){text-align:start;white-space:normal;overflow-wrap:anywhere}
.v2-feature-matrix tbody th{padding:.5rem 1rem;vertical-align:middle;font-weight:500}
.v2-feature-matrix thead th{vertical-align:bottom}
.v2-feature-matrix td[colspan]{padding-block:1rem;color:var(--text-2)}
.v2-feature-matrix th[scope=row]>strong{display:block;font-weight:500;color:var(--mono,var(--text))}
${typeRole('.v2-feature-matrix th[scope=row]>.v2-muted', 'caption', 'font-weight:400;color:var(--muted)')}
.v2-feature-matrix :is(th:has(>.v2-feature-column),td:has(>.v2-feature-toggle)){inline-size:15rem}
.v2-feature-column{display:flex;flex-direction:column;gap:8px;min-inline-size:11.25rem;padding-block:.5rem;font-weight:400}
.v2-feature-column>input{inline-size:100%;min-inline-size:0}
.v2-feature-column>.v2-plan-actions{margin-block-start:.25rem}
.v2-feature-toggle{display:flex;align-items:center;gap:.5rem;min-inline-size:var(--target);min-block-size:var(--target)}
.v2-feature-groups{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.v2-feature-groups>li{font-variant-numeric:tabular-nums}
.v2-feature-groups>li>strong{flex:1 1 auto;overflow-wrap:anywhere}
.v2-feature-group>th{padding-block:0;background:var(--subtle);font-size:.8125rem;font-weight:600;color:var(--text-2)}
.v2-feature-matrix caption>span{display:block;position:sticky;inset-inline-start:1rem;max-inline-size:calc(100cqi - 2rem)}
.v2-feature-matrix th[scope=row]{min-inline-size:8.25rem}
.v2-feature-matrix tbody:has(.v2-feature-fold>input:not(:checked))>tr:not(.v2-feature-group){display:none}
.v2-feature-fold{display:flex;align-items:center;gap:8px;min-block-size:var(--target);cursor:pointer}
.v2-feature-fold>span:last-child{margin-inline-start:auto}
@media(prefers-reduced-motion:reduce){.v2-plan-picker a{transition:none}}
@media(max-width:1100px){.v2-plan-columns--editor{grid-template-columns:minmax(0,1fr)}.v2-plan-columns--editor>.v2-plan-aside{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));align-items:stretch}}
@media(max-width:600px){.v2-plan-fields{grid-template-columns:minmax(0,1fr)}.v2-plan-facts{grid-template-columns:repeat(2,minmax(0,1fr))}.v2-feature-matrix table{min-inline-size:0}.v2-feature-matrix :is(th:has(>.v2-feature-column),td:has(>.v2-feature-toggle)){inline-size:9.375rem}.v2-feature-matrix :is(th,td){padding-inline:.75rem}.v2-feature-column .v2-btn{inline-size:100%}.v2-feature-column{min-inline-size:0}}
`
