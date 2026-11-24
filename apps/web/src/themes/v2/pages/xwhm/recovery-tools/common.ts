import type { Translate } from '../../../../../i18n.ts'
import { escapeHtml, xpTemplate } from '../../../html.ts'
import { WHM_ACCOUNT_TOOLS_CSS } from '../account-tools/common.ts'
import { whmPolish } from '../monitoring/common.ts'
import { phoneRows, type PhoneRow } from '../lifecycle/shared.ts'

/** Marks a recovery table for the two-column phone rows: which cell is the row name and which value sits opposite it.
 *  These pages carry no style attribute, so the row templates name their other cells with data-phone-label. */
export const phoneTable = (tableHtml: string, phone: PhoneRow): string => tableHtml.replace(/<table(?:\s+data-phone-labels)?>/, () => `<table${phone.value ? ` data-phone-value="${phone.value}"` : ''}${phone.name ? ` data-phone-name="${phone.name}"` : ''}>`)

/** The column name a stacked phone cell shows above its value; absent without a translator. */
export const phoneLabel = (t: Translate | undefined, label: string): string => t ? ` data-phone-label="${escapeHtml(t(label))}"` : ''

/** The steps of a workflow sit in their own Metronic card. The controller moves aria-current between the steps;
 *  the page CSS draws the marker, the rail and the done state from it, matching the kit stepper. */
export const stepsCard = (stepsHtml: string): string => `<div class="kt-card"><div class="kt-card-content">${stepsHtml}</div></div>`

export function recoverySteps(t: Translate, marker: 'restore-more' | 'backup-files', steps: readonly (readonly [string, string])[]): string {
  return stepsCard(`<ol class="v2-recovery__steps" data-${marker}-steps aria-label="${escapeHtml(t(msgid('Restore steps')))}">${steps.map(([key, label], index) => `<li data-step="${key}"${index === 0 ? ' aria-current="step"' : ''}><span class="v2-recovery__step-number" aria-hidden="true">${index + 1}</span><span>${escapeHtml(t(label))}</span></li>`).join('')}</ol>`)
}

/** Standing rules of a recovery workflow: each line carries a Keenicon check mark, never a state. */
export const recoveryRules = (t: Translate, rules: readonly string[]): string =>
  `<ul class="v2-recovery__rules">${rules.map(rule => `<li><i class="ki-filled ki-check-circle text-base text-green-500" aria-hidden="true"></i><span>${escapeHtml(t(rule))}</span></li>`).join('')}</ul>`

/** Exactly the selected theme's templates consumed by the component-restore controller. */
export function restoreMoreTemplates(t?: Translate): string {
  const technical = (name: string) => `<bdi dir="ltr" data-xp-slot="${name}"></bdi>`
  const label = (text: string): string => phoneLabel(t, text)
  return xpTemplate('restore-more-archives', `<tr><td${label(msgid('Created (UTC)'))}>${technical('created')}</td><td>${technical('archive')}</td><td${label(msgid('Size'))}>${technical('bytes')}</td><td data-xp-slot="integrity"></td><td><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-slot="open"></button></td></tr>`)
    + xpTemplate('restore-more-components', `<tr><td data-xp-slot="name"></td><td data-xp-slot="contents"></td><td data-xp-slot="action"${label(msgid('Restore here'))}></td></tr>`)
    + xpTemplate('restore-more-mailboxes', `<tr><td><input class="kt-checkbox" type="checkbox" data-xp-slot="select"></td><td>${technical('address')}</td><td${label(msgid('Messages'))}>${technical('messages')}</td><td${label(msgid('Size'))}>${technical('bytes')}</td><td data-xp-slot="state"${label(msgid('Mailbox now'))}></td></tr>`)
    + xpTemplate('restore-more-review', `<tr><td>${technical('path')}</td><td>${technical('bytes')}</td></tr>`)
    + xpTemplate('restore-more-results', `<tr><td>${technical('path')}</td><td data-xp-slot="result"></td><td data-xp-slot="reason"${label(msgid('Reason'))}></td></tr>`)
    + xpTemplate('restore-more-empty', '<tr><td data-xp-slot="message"></td></tr>')
    + xpTemplate('restore-more-link', '<a class="v2-btn kt-btn kt-btn-outline" href="/whm/backups/files" data-xp-slot="label"></a>')
}

export const WHM_RECOVERY_TOOLS_CSS = WHM_ACCOUNT_TOOLS_CSS + `
.v2-recovery__grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:1.25rem;align-items:stretch;min-inline-size:0}
.v2-recovery__grid>.v2-card,.v2-recovery__grid>.v2-recovery__column>.v2-card:last-child{flex:1 1 auto}
.v2-recovery__column{display:flex;flex-direction:column;gap:1.25rem;min-inline-size:0}
.v2-recovery__steps{display:flex;flex-wrap:wrap;gap:.625rem 0;list-style:none;margin:0;padding:0}
.v2-recovery__steps>li{display:flex;flex:1 1 7.5rem;align-items:center;gap:.5rem;min-inline-size:0;font-size:.875rem;font-weight:500;color:var(--text-2)}
.v2-recovery__step-number{flex:none;display:flex;align-items:center;justify-content:center;inline-size:2rem;block-size:2rem;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums}
.v2-recovery__steps>li:not(:last-child)::after{content:"";flex:1 1 1rem;min-inline-size:.5rem;margin-inline-end:.5rem;block-size:2px;border-radius:1px;background:var(--line-strong)}
.v2-recovery__steps>li[aria-current=step]{color:var(--mono,var(--text))}
.v2-recovery__steps>li[aria-current=step]>.v2-recovery__step-number{background:var(--accent-fill);color:var(--on-accent)}
.v2-recovery__steps>li:has(~li[aria-current=step]){color:var(--text)}
.v2-recovery__steps>li:has(~li[aria-current=step])>.v2-recovery__step-number{background:var(--color-green-500,var(--ok));color:var(--on-accent)}
.v2-recovery__steps>li:has(~li[aria-current=step])::after{background:var(--color-green-500,var(--ok))}
.v2-recovery__rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17.5rem),1fr));gap:.625rem 1.25rem;list-style:none;margin:0;padding:0}
.v2-recovery__rules>li{display:flex;align-items:flex-start;gap:.375rem;font-size:.875rem;line-height:1.375rem;color:var(--mono,var(--text))}
.v2-recovery__rules>li>i{flex:none;line-height:1.375rem}
.v2-recovery-tools>p[role=status]:not([data-state=failed],[data-state=error]),.v2-recovery-tools>[data-acct-convert-empty]{padding:.875rem 1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--subtle);color:var(--text-2);font-size:.875rem;line-height:1.375rem}
.v2-recovery-tools>[data-acct-convert-empty]{display:flex;flex-direction:column;gap:.375rem;border-style:dashed;border-color:var(--line-strong);background:transparent;text-align:center;align-items:center;padding:1.875rem 1.25rem}
.v2-recovery-tools :is(.v2-account-tool__facts,.v2-account-tool__fields){grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))}
.v2-recovery-tools .v2-account-tool__facts dd{font-variant-numeric:tabular-nums}
.v2-recovery-tools .v2-account-tool__scroll{border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-recovery-tools table{inline-size:100%;border-collapse:collapse}
.v2-recovery-tools thead th{white-space:nowrap;overflow-wrap:normal}
.v2-recovery-tools td[colspan]{padding:1.25rem 1rem;text-align:center;color:var(--text-2)}
.v2-recovery-tools fieldset{display:flex;flex-direction:column;gap:.625rem;margin:0;padding:0;border:0;min-inline-size:0}
.v2-recovery-tools legend{float:inline-start;inline-size:100%;padding:0}
@media(min-width:1024px){.v2-recovery__grid,.v2-recovery__column{gap:1.875rem}}
.v2-recovery-tools td{font-variant-numeric:tabular-nums}
.v2-recovery-tools :is(input,select,textarea)[dir=ltr]{text-align:var(--v2-control-align,start)}
.v2-recovery-tools td input[type=checkbox]{margin:0}
.v2-recovery-tools td:first-child:not([colspan]){color:var(--mono,var(--text))}
.v2-recovery-tools :is(td,dd,bdi){overflow-wrap:anywhere}
.v2-recovery-tools [data-acct-convert-facts]:empty{display:none}
.v2-recovery-tools [hidden]{display:none}
${whmPolish('.v2-recovery-tools')}@media(max-width:1000px){.v2-recovery__grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){${phoneRows('.v2-recovery-tools .v2-account-tool__scroll>table')}
.v2-recovery-tools .v2-account-tool__scroll>table>tbody>tr:nth-child(n)>[data-phone-label]:nth-child(n)::before{content:attr(data-phone-label)}
.v2-recovery-tools .v2-account-tool__scroll td:has(>input[type=checkbox]){min-block-size:24px}
.v2-recovery-tools .v2-account-tool__facts{grid-template-columns:minmax(0,1fr)}
.v2-recovery__steps>li{flex-basis:100%}.v2-recovery__steps>li:not(:last-child)::after{display:none}.v2-recovery-tools .v2-account-tool__actions>:is(.v2-btn,button){flex:1 1 auto}}`
