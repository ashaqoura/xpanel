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

/// The v2 rules carry the kt-card values (56px header, 20px gutters, 20px between the parts of a body), so a card
// written with the v2 classes alone looks like a kit card. A card without head, body or foot is a bare padded
// surface; loose children of a structured card keep the card gutter.
const STRUCT = ':has(>.v2-card__head,>.v2-card__body,>.v2-card__foot)'
const LOOSE = `.v2-card:not(.v2-card--flush)${STRUCT}>:not(.v2-card__head,.v2-card__body,.v2-card__foot,template)`
export const CARD_CSS = `.v2-card{display:flex;flex-direction:column;align-items:stretch;min-width:0;border-radius:var(--radius-card);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);color:var(--card-foreground,var(--text))}
.v2-card:not(.v2-card--flush,${STRUCT}){gap:1.25rem;padding:var(--v2-panel-padding)}
${LOOSE}{margin:0 var(--v2-panel-padding) var(--v2-panel-padding)}
${LOOSE}:first-child,.v2-card:not(.v2-card--flush)>.v2-card__head+:not(.v2-card__body,.v2-card__foot,template){margin-block-start:var(--v2-panel-padding)}
.v2-card__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.625rem;min-height:3.5rem;padding:.625rem var(--v2-panel-padding);border-bottom:1px solid var(--line)}
.v2-card__head:last-child{border-bottom:0}
.v2-card__title{flex:1 1 200px;display:flex;flex-direction:column;gap:.25rem;min-width:0}
.v2-card__title>h3{font-size:1rem}
.v2-card__title p{font-size:.875rem;line-height:1.45;font-weight:400;color:var(--text-2)}
.v2-card__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}
.v2-card__body{flex-grow:1;display:flex;flex-direction:column;gap:1.25rem;min-width:0}
.v2-card>.v2-card__body{padding:var(--v2-panel-padding)}
.v2-card__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.625rem}
.v2-card>.v2-card__foot{padding:1rem var(--v2-panel-padding);border-top:1px solid var(--line)}
.v2-card--flush{overflow:hidden}
.v2-card--flush>.v2-card__body{gap:0;padding:0}
`
