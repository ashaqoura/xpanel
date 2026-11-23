import type { Translate } from '../../../../../i18n.ts'
import { escapeHtml } from '../../../html.ts'
/** V2 firewall records, actions and editors retain their own presentation after every readback. */
export function renderV2WhmFirewallClientTemplates(labels?: Readonly<Record<'port' | 'ip' | 'forward' | 'prefix' | 'ban', readonly string[]>>, t?: Translate): string {
  // Each cell names its column for phone rows. The action is a pill; its tone needs a row state the controller does not set.
  const cell = (kind: keyof NonNullable<typeof labels>) => (name: string, index: number) => {
    const label = labels && t ? ` data-phone-label="${escapeHtml(t(labels[kind][index]!))}"` : ''
    return name === 'action' && kind !== 'prefix' ? `<td${label}><span class="v2-pill v2-pill--neutral kt-badge kt-badge-outline kt-badge-secondary rounded-[30px]"><span class="v2-pill__dot kt-badge-dot" aria-hidden="true"></span><span data-xp-slot="action"></span></span></td>`
      : ['action', 'comment', 'reason', 'purpose', 'origin'].includes(name) ? `<td${label} data-xp-slot="${name}"></td>` : `<td${label}><bdi class="v2-mono v2-num" dir="ltr" data-xp-slot="${name}"></bdi></td>`
  }
  const actions = '<td><div class="v2-host__actions" data-xp-action="actions"></div></td>'
  const rows = [['port', ['position', 'action', 'protocol', 'port', 'source', 'purpose', 'origin', 'comment']], ['ip', ['action', 'source', 'port', 'comment', 'added', 'expires']], ['forward', ['protocol', 'port', 'destination', 'source', 'comment']], ['prefix', ['name', 'action', 'entries', 'port', 'file', 'updated']], ['ban', ['address', 'reason', 'source', 'since', 'expires']]] as const
  return rows.map(([kind, names]) => `<template data-xp-template="firewall-${kind}-row"><tr data-list-row>${names.map(cell(kind)).join('')}${kind === 'prefix' ? '' : actions}</tr></template>`).join('')
    + '<template data-xp-template="firewall-empty"><tr><td colspan="1" data-xp-action="cell" data-xp-slot="message"></td></tr></template>'
    + '<template data-xp-template="firewall-action"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-slot="label"></button></template>'
    + '<template data-xp-template="firewall-editor"><tr><td data-xp-action="cell"><form class="v2-host__groups p-2.5" data-xp-action="form"><fieldset><legend class="text-sm font-semibold text-mono" data-xp-slot="title"></legend><div class="v2-host__fields" data-xp-action="fields"></div></fieldset><div class="v2-host__actions justify-end" data-xp-action="actions"></div></form></td></tr></template>'
    + '<template data-xp-template="firewall-edit-input"><div class="v2-host__field"><label class="kt-form-label" data-xp-action="label" data-xp-slot="label"></label><input type="text" class="kt-input" dir="ltr" data-xp-action="control"></div></template>'
    + '<template data-xp-template="firewall-edit-select"><div class="v2-host__field"><label class="kt-form-label" data-xp-action="label" data-xp-slot="label"></label><select class="kt-select" data-xp-action="control"></select></div></template>'
}
