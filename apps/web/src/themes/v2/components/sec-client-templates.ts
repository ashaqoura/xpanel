type SecActionPage = 'account-waf' | 'account-cloudflare' | 'dns-providers' | 'dns-cluster' | 'identity-panel' | 'identity-whm'

/** Complete V2 action prototypes retain each owning page family's existing action layout; each action is a small
 *  Metronic outline button and the group keeps the 10px button gap. */
export function v2SecClientTemplates(page: SecActionPage): string {
  const group = page === 'account-waf' || page === 'identity-panel' ? 'v2-panel-settings__actions' : page === 'account-cloudflare' ? 'v2-domain-actions' : page === 'identity-whm' ? 'v2-observation__actions' : 'v2-whm-network__actions'
  return `<template data-xp-template="sec-action"><button type="button" class="v2-btn kt-btn kt-btn-sm kt-btn-outline"><span data-xp-slot="label"></span></button></template>
    <template data-xp-template="sec-action-group"><div class="${group} flex flex-wrap items-center gap-2.5" data-xp-slot="items"></div></template>`
}
