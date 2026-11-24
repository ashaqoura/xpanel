import { attr, escapeHtml, hookAttrs, type HookAttributes } from '../html.ts'

export interface CardProps {
  /** With a title the card is a labelled section; without one it is a plain surface. */
  title?: string
  /** Required with a title: the heading id the section is labelled by. */
  titleId?: string
  headingLevel?: 2 | 3
  description?: string
  /** Announces later changes of the description, such as a list's read summary (role="status"). */
  descriptionLive?: boolean
  descriptionHooks?: HookAttributes
  /** Header actions built with the kit, such as a count pill or a secondary button. */
  actionsHtml?: string
  bodyHtml: string
  footerHtml?: string
  /** Flush: the body runs edge to edge (tables, logs); header and footer keep their padding. */
  flush?: boolean
  id?: string
  hooks?: HookAttributes
}

export function card(props: CardProps): string {
  // Metronic card: kt-card > kt-card-header + kt-card-content (kt-card-table when flush) + kt-card-footer.
  const cls = `v2-card${props.flush ? ' v2-card--flush' : ''} kt-card`
  const body = `<div class="${props.flush ? 'v2-card__body kt-card-table' : 'v2-card__body kt-card-content'}">${props.bodyHtml}</div>`
  const footer = props.footerHtml ? `<div class="v2-card__foot kt-card-footer">${props.footerHtml}</div>` : ''
  if (props.title === undefined) {
    return `<div class="${cls}"${attr('id', props.id)}${hookAttrs(props.hooks)}>${body}${footer}</div>`
  }
  if (!props.titleId) throw new Error('A titled card needs titleId for aria-labelledby')
  const h = `h${props.headingLevel ?? 2}`
  const head = `<div class="v2-card__head kt-card-header"><div class="v2-card__title"><${h} id="${escapeHtml(props.titleId)}">${escapeHtml(props.title)}</${h}>${props.description ? `<p${props.descriptionLive ? ' role="status"' : ''}${hookAttrs(props.descriptionHooks)}>${escapeHtml(props.description)}</p>` : ''}</div>${props.actionsHtml ? `<div class="v2-card__actions kt-card-toolbar">${props.actionsHtml}</div>` : ''}</div>`
  return `<section class="${cls}"${attr('id', props.id)} aria-labelledby="${escapeHtml(props.titleId)}"${hookAttrs(props.hooks)}>${head}${body}${footer}</section>`
}

// The project standards set the card metrics (docs/STANDARDS.md): the padding is on the card element itself (24px,
// 16px on phones through --v2-panel-padding) and its parts sit 24px apart inside it; header, body and footer add no
// second padding layer (the header divider and footer rule are inset with them). Only a flush body (a table, a log)
// runs edge to edge, under a title without a divider. The build entry's standards block
// strips the KTUI paddings of kt-card-header/-content/-footer inside a .v2-card.
const P = 'var(--v2-panel-padding)'
const N = 'calc(var(--v2-panel-padding)*-1)'
const FLUSH = '.v2-card>.kt-card-table,.v2-card--flush>.v2-card__body'
export const CARD_CSS = `.v2-card{display:flex;flex-direction:column;align-items:stretch;gap:var(--space-3);min-width:0;padding:${P};border-radius:var(--radius-card);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);color:var(--card-foreground,var(--text))}
.v2-card__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem 1rem;padding-block-end:${P};border-bottom:1px solid var(--line)}
.v2-card__head:is(:last-child,:has(+.kt-card-table)){padding-block-end:0;border-bottom:0}
.v2-card__title{flex:1 1 200px;display:flex;flex-direction:column;gap:.25rem;min-width:0}
.v2-card__title>:is(h2,h3){font-size:1.125rem;line-height:var(--lh-card);font-weight:600}
.v2-card__title p{font-size:.875rem;line-height:var(--lh-label);font-weight:400;color:var(--text-2)}
.v2-card__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-card__body{flex-grow:1;display:flex;flex-direction:column;gap:var(--space-3);min-width:0}
.v2-card__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.625rem;padding-block-start:${P};border-top:1px solid var(--line)}
.v2-card--flush{overflow:hidden}
${FLUSH}{margin-inline:${N}}
.v2-card--flush>.v2-card__body{gap:0}
.v2-card>.kt-card-table:first-child,.v2-card--flush>.v2-card__body:first-child{margin-block-start:${N}}
.v2-card>.kt-card-table:last-child,.v2-card--flush>.v2-card__body:last-child{margin-block-end:${N}}
.v2-card>.v2-card__head+.kt-card-table{border-top:1px solid var(--line)}
.v2-card>.kt-card-table+.v2-card__foot{margin-block-start:${N};padding-block-start:1rem}
`
