import { xpTemplate } from '../../html.ts'

/** Selected-theme dynamic nodes for server/account health, alert delivery and repair previews. */
export function v2WhmDiagnosticTemplates(): string {
  const tags = ['article', 'bdi', 'button', 'details', 'div', 'h3', 'h4', 'header', 'input', 'li', 'p', 'span', 'summary', 'ul'] as const
  const variants: readonly (readonly [string, string, string])[] = [
    ['account-health-row', 'article', 'v2-diagnostic__account'], ['account-selection', 'div', 'v2-diagnostic__selection'], ['account-headline', 'span', 'v2-diagnostic__head'], ['account-checks', 'ul', 'v2-diagnostic__list'], ['account-check', 'li', 'v2-diagnostic__item'], ['account-check-head', 'div', 'v2-diagnostic__head'], ['account-items', 'ul', 'v2-diagnostic__children'],
    ['server-health-item', 'li', 'v2-diagnostic__item'], ['server-health-head', 'div', 'v2-diagnostic__head'], ['server-health-items', 'ul', 'v2-diagnostic__children'], ['repair-item', 'article', 'v2-diagnostic__item'], ['repair-head', 'header', 'v2-diagnostic__head'], ['alert-result', 'li', 'v2-diagnostic__item'], ['alert-head', 'div', 'v2-diagnostic__head'], ['alert-badges', 'span', 'v2-diagnostic__badges'],
    ['evidence', 'pre', 'v2-diagnostic__evidence'], ['actions', 'div', 'v2-diagnostic__actions'], ['note', 'p', 'v2-muted text-sm text-secondary-foreground'], ['note-item', 'li', 'v2-muted text-sm text-secondary-foreground'], ['link', 'a', 'v2-btn kt-btn kt-btn-outline kt-btn-sm'],
    // The repair controller marks a destructive start with data-severity; the utilities follow that state above the outline look.
    ['action', 'button', 'v2-btn kt-btn kt-btn-outline kt-btn-sm data-[severity=danger]:bg-destructive data-[severity=danger]:border-destructive data-[severity=danger]:text-destructive-foreground'], ['badge', 'span', 'v2-pill v2-pill--neutral kt-badge kt-badge-outline kt-badge-secondary'], ['badge-ok', 'span', 'v2-pill v2-pill--ok kt-badge kt-badge-outline kt-badge-success'], ['badge-critical', 'span', 'v2-pill v2-pill--bad kt-badge kt-badge-outline kt-badge-destructive'], ['badge-warn', 'span', 'v2-pill v2-pill--warn kt-badge kt-badge-outline kt-badge-warning'],
  ]
  const node = (name: string, tag: string, cls = '') => xpTemplate('whm-diagnostic-' + name, `<${tag}${cls ? ` class="${cls}"` : ''}${tag === 'input' ? ' class="kt-checkbox kt-checkbox-sm" type="checkbox"' : ''}${tag === 'button' ? ' type="button"' : ''}${tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' ? ' disabled' : ''} data-xp-slot="content">${tag === 'input' ? '' : `</${tag}>`}`)
  const slot = (name: string) => `<span data-xp-slot="${name}"></span>`
  return tags.map(tag => node(tag, tag)).join('') + variants.map(([name, tag, cls]) => node(name, tag, cls)).join('')
    + xpTemplate('whm-diagnostic-threshold-row', `<tr><td>${slot('label')}</td><td>${slot('warning')}</td><td>${slot('problem')}</td></tr>`)
    + xpTemplate('whm-diagnostic-limits-row', `<tr><td>${slot('resource')}</td><td>${slot('plan')}</td><td>${slot('enforced')}</td><td>${slot('comparison')}</td><td>${slot('usage')}</td><td>${slot('percent')}</td></tr>`)
    + xpTemplate('whm-diagnostic-limits-table', `<div class="v2-diagnostic__scroll kt-scrollable-x-auto"><table class="kt-table"><thead><tr>${['resource', 'plan', 'enforced', 'comparison', 'usage', 'percent'].map(name => `<th scope="col">${slot('heading-' + name)}</th>`).join('')}</tr></thead><tbody data-xp-slot="rows"></tbody></table></div>`)
    + xpTemplate('whm-diagnostic-alert-delivery-row', `<tr>${['at', 'rule', 'kind', 'channel', 'result'].map(name => `<td>${slot(name)}</td>`).join('')}</tr>`)
    + xpTemplate('whm-diagnostic-alert-delivery-empty', '<tr><td colspan="5" data-xp-slot="message"></td></tr>')
}

export const WHM_DIAGNOSTIC_CLIENT_CSS = `.v2-diagnostic__account{display:flex;align-items:flex-start;gap:.625rem;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface);min-inline-size:0}
.v2-diagnostic__account>details{flex:1 1 auto;min-inline-size:0}
.v2-diagnostic__account summary{display:flex;align-items:center;min-block-size:var(--target);font-size:.875rem;font-weight:500;color:var(--mono,var(--text));cursor:pointer}
.v2-diagnostic__selection{flex:none;display:flex;align-items:center;min-block-size:var(--target)}
.v2-diagnostic__head,.v2-diagnostic__badges,.v2-diagnostic__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .625rem;min-inline-size:0}
.v2-diagnostic__head{justify-content:space-between;font-weight:500;color:var(--mono,var(--text))}
.v2-diagnostic__list,.v2-diagnostic__children{display:flex;flex-direction:column;gap:.625rem;padding:0;list-style:none;min-inline-size:0}
.v2-diagnostic__children{padding-inline-start:1rem;border-inline-start:2px solid var(--line)}
.v2-diagnostic__children>li{display:flex;flex-direction:column;gap:.375rem;min-inline-size:0}
.v2-diagnostic__item{display:flex;flex-direction:column;gap:.625rem;padding:1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface);font-size:.875rem;line-height:1.25rem;color:var(--text);min-inline-size:0}
.v2-diagnostic__item[data-state=problem],.v2-diagnostic__account[data-state=problem]{border-color:var(--bad-line)}
.v2-diagnostic__item[data-state=warning],.v2-diagnostic__account[data-state=warning]{border-color:var(--warn-line)}
.v2-diagnostic__evidence{max-block-size:240px;overflow:auto;padding:1rem;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--code);color:var(--code-text);font:.8125rem/1.25rem var(--font-mono);font-variant-numeric:tabular-nums;white-space:pre-wrap;overflow-wrap:anywhere;text-align:start}
.v2-diagnostic__scroll{max-inline-size:100%;overflow:auto;min-inline-size:0;border:1px solid var(--line);border-radius:var(--radius-card)}
.v2-diagnostic__scroll :is(th,td){text-align:start;overflow-wrap:anywhere}
.v2-diagnostic__scroll td{font-variant-numeric:tabular-nums}
.v2-observation [data-whm-repair-start][data-severity=danger]:not(.kt-btn){background:var(--destructive);border-color:var(--destructive);color:var(--destructive-foreground)}
`
