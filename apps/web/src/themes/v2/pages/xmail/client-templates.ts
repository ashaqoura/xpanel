import { icon } from '../../icons.ts'

// Shared class lists of the client fragments (complete literal tokens for the stylesheet build).
const ROW_BUTTON = 'v2-btn kt-btn kt-btn-outline kt-btn-sm'
const ROW_REMOVE = 'v2-btn kt-btn kt-btn-ghost kt-btn-destructive kt-btn-sm'
const NAME = 'text-sm font-medium text-mono'
const META = 'text-xs font-normal text-muted-foreground'
const FILE = 'v2-btn kt-btn kt-btn-outline h-auto min-h-14 w-full justify-start gap-3 px-3.5 py-2.5 whitespace-normal text-start'
const FILE_BADGE = 'flex items-center justify-center shrink-0 size-9 rounded-md border border-border bg-muted text-[0.6875rem] font-semibold leading-none uppercase text-secondary-foreground'
const FILE_TEXT = 'flex flex-col gap-0.5 grow min-w-0 break-words'
const SHARE = 'flex flex-wrap items-center justify-between gap-2.5 py-2.5 border-b border-border last:border-b-0'

/** Hidden fragments owned by the V2 mailbox presentation. */
export function v2MailClientTemplates(kind: string): string {
  const template = (name: string, body: string): string => `<template data-xp-template="${name}">${body}</template>`
  const button = (name: string): string => template(name, `<button type="button" class="${ROW_BUTTON}" data-xp-slot="label"></button>`)
  const empty = (name: string, columns: number): string => template(name, `<tr><td colspan="${columns}" data-xp-slot="message"></td></tr>`)
  const share = (name: string): string => template(name, `<li class="${SHARE}"><span class="flex flex-col gap-0.5 min-w-0"><bdi dir="ltr" class="v2-mono ${NAME}" data-xp-slot="address"></bdi><span class="${META}" data-xp-slot="permission"></span></span><button type="button" class="${ROW_REMOVE}" data-xp-slot="remove"></button></li>`) + template(`${name}-empty`, '<li class="text-sm text-muted-foreground" data-xp-slot="message"></li>')
  switch (kind) {
    case 'attachments': return template('mail-attachment-row', `<li><a class="v2-mail-attachments__download ${FILE}" data-xp-slot="link" target="_blank" rel="noopener noreferrer" data-attachment-download><span class="v2-mail-attachments__badge ${FILE_BADGE}" data-xp-slot="badge" aria-hidden="true"></span><span class="v2-mail-attachments__file ${FILE_TEXT}"><span class="${NAME}"><bdi dir="auto" data-xp-slot="name"></bdi></span><span class="v2-mail-attachments__size v2-num ${META}"><bdi dir="ltr" data-xp-slot="size"></bdi></span></span>${icon('download', 16)}</a></li>`)
    case 'compose-attachments': return template('mail-compose-attachment-row', `<li class="flex flex-wrap items-center gap-2.5 min-w-0 px-3.5 py-2.5 rounded-lg border border-border bg-muted/40"><span class="${FILE_TEXT}"><span class="${NAME}"><bdi dir="auto" data-xp-slot="name"></bdi></span><span class="v2-num ${META}"><bdi dir="ltr" data-xp-slot="size"></bdi></span></span><button type="button" class="${ROW_REMOVE}" data-xp-slot="remove"></button></li>`) + button('mail-compose-attachment-dismiss')
    case 'search': return template('mail-search-row', `<li><button type="button" class="v2-btn v2-mail-search__result" data-xp-slot="open"><strong class="${NAME}" dir="auto" data-xp-slot="subject"></strong><bdi class="text-sm font-normal text-secondary-foreground" dir="auto" data-xp-slot="sender"></bdi><bdi class="v2-num ${META}" dir="ltr" data-xp-slot="date"></bdi><span class="text-sm font-normal text-secondary-foreground" dir="auto" data-xp-slot="preview"></span></button></li>`)
    case 'forwarders': return template('mail-forwarder-row', `<tr><td><bdi dir="ltr" class="${NAME}" data-xp-slot="address"></bdi></td><td class="text-end"><button type="button" class="${ROW_REMOVE}" data-xp-slot="remove"></button></td></tr>`) + empty('mail-forwarder-empty', 2)
    case 'identities': return template('mail-identity-card', `<article class="v2-mail-identities__row kt-card shadow-none p-5 gap-4 min-w-0"><header class="flex flex-wrap items-center justify-between gap-2.5"><strong class="text-sm font-semibold text-mono" data-xp-slot="name"></strong><span class="v2-muted kt-badge kt-badge-sm kt-badge-outline empty:hidden" data-xp-slot="badge"></span></header><dl class="v2-mail-workspace__facts" data-xp-slot="facts"></dl><div class="v2-mail-identities__actions flex flex-wrap items-center gap-2.5" data-xp-slot="actions"></div></article>`) + template('mail-identity-fact', '<div class="v2-mail-identities__datum"><dt data-xp-slot="label"></dt><dd><bdi data-xp-slot="value" dir="ltr"></bdi></dd></div>') + button('mail-identity-action') + template('mail-identity-empty', '<p class="v2-muted text-sm text-muted-foreground" data-xp-slot="message"></p>')
    case 'contacts': return template('mail-contact-row', `<tr><td><button type="button" class="${ROW_BUTTON}" data-xp-slot="select"></button></td><td><bdi dir="ltr" class="v2-mono text-sm text-foreground" data-xp-slot="email"></bdi></td><td class="text-sm text-secondary-foreground" data-xp-slot="organization"></td><td class="text-sm text-secondary-foreground" data-xp-slot="access"></td></tr>`) + empty('mail-contact-empty', 4)
    case 'contact-tools': return share('mail-contact-share')
    case 'calendar-settings': return share('mail-calendar-share')
    case 'folders': return template('mail-folder-admin-row', `<tr><td><div class="v2-mail-folders__name" data-xp-slot="tree"><strong class="${NAME}"><bdi dir="auto" data-xp-slot="name"></bdi></strong><span class="v2-muted ${META}" data-xp-slot="system" hidden></span><span class="v2-muted ${META}" data-xp-slot="raw" hidden></span></div></td><td><bdi dir="ltr" data-xp-slot="messages"></bdi></td><td><bdi dir="ltr" data-xp-slot="unseen"></bdi></td><td><input class="kt-switch kt-switch-sm" type="checkbox" data-xp-slot="subscription" data-mail-folders-subscribe><span class="${META}" data-xp-slot="unknown" hidden></span></td><td><span class="${META}" data-xp-slot="protected" hidden></span><div class="v2-mail-folders__row-actions flex flex-wrap items-center gap-2" data-xp-slot="actions"></div></td></tr>`) + button('mail-folder-admin-action') + empty('mail-folder-admin-empty', 5)
    case 'mailing-lists': return template('mail-membership-row', `<tr><td><bdi dir="ltr" class="${NAME}" data-xp-slot="address"></bdi></td><td data-xp-slot="name"></td><td data-xp-slot="observed"></td><td data-xp-slot="subscription"></td><td data-xp-slot="posting"></td><td data-xp-slot="membership"></td><td><button type="button" class="${ROW_BUTTON}" data-xp-slot="action"></button></td></tr>`) + empty('mail-membership-empty', 7)
    case 'preferences': return template('mail-preferences-technical', '<bdi dir="ltr" class="v2-mono"></bdi>')
    case 'vacation': return template('mail-vacation-technical', '<bdi dir="ltr" class="v2-mono"></bdi>')
    case 'folder-workspace': return template('mail-folder-filter-empty', '<p class="v2-mail-filter-empty px-5 py-10 text-center text-sm text-secondary-foreground" data-mail-filter-empty role="status"></p>') + template('mail-folder-move-menu', '<ul class="v2-mail-move-menu kt-menu kt-menu-default flex-col absolute top-full start-0 z-20 mt-1.5 min-w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-md" id="move-list" data-mail-move="true"></ul>') + template('mail-folder-move-choice', '<li class="kt-menu-item"><button type="button" class="kt-menu-link text-start text-2sm font-medium text-foreground hover:bg-accent hover:text-primary" data-mail-action="move" data-xp-slot="label"></button></li>') + template('mail-folder-attachment-info', `<li><button type="button" class="${FILE}" disabled data-xp-slot="button"><span class="${FILE_BADGE}" data-xp-slot="badge" aria-hidden="true"></span><span class="${FILE_TEXT}"><bdi class="${NAME}" dir="auto" data-xp-slot="name"></bdi><bdi class="v2-num ${META}" dir="ltr" data-xp-slot="size"></bdi></span></button></li>`)
    case 'track': return template('mail-track-row', `<tr><td><bdi dir="ltr" class="${NAME}" data-xp-slot="time"></bdi></td><td data-xp-slot="direction"></td><td data-xp-slot="counterpart"></td><td data-xp-slot="status"></td><td><bdi dir="ltr" data-xp-slot="dsn"></bdi></td><td><button type="button" class="${ROW_BUTTON}" data-xp-slot="view"></button></td></tr>`) + empty('mail-track-empty', 6)
    case 'calendar-view': return [
      ['calview-row', '<div class="v2-mail-calview__row" role="row"></div>'],
      ['calview-head', '<div class="v2-mail-calview__head flex flex-col gap-1 min-w-0 p-2 border-s border-border bg-muted/50 text-xs font-medium text-muted-foreground" role="columnheader"></div>'],
      ['calview-day', '<div class="v2-mail-calview__day group flex flex-col gap-1 min-w-0 min-h-32 border-t border-s border-border" role="gridcell"></div>'],
      ['calview-week', '<div class="v2-mail-calview__week v2-num px-1 py-2 bg-muted/50 text-center text-xs font-medium whitespace-nowrap text-muted-foreground"></div>'],
      ['calview-gutter', '<div class="v2-mail-calview__gutter v2-num bg-muted/50 text-center text-xs font-medium whitespace-nowrap text-muted-foreground"></div>'],
      ['calview-timeline', '<div class="v2-mail-calview__timeline"></div>'],
      ['calview-chip', '<button type="button" class="v2-mail-calview__chip v2-num flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-2 py-1 rounded-md text-start text-xs font-medium leading-snug text-foreground break-words cursor-pointer"></button>'],
      ['calview-long', '<span class="v2-mail-calview__long"></span>'], ['calview-short', '<span class="v2-mail-calview__short"></span>'],
      ['calview-more', '<span class="v2-mail-calview__more v2-num text-xs font-medium text-primary"></span>'],
      ['calview-swatch', '<span class="v2-mail-calview__swatch shrink-0 size-2.5 rounded-full"></span>'],
      ['calview-help', '<span class="v2-muted text-xs font-normal text-muted-foreground"></span>'],
      ['calview-empty', '<li class="v2-muted text-sm text-muted-foreground"></li>'],
      ['calview-notes', '<dd class="v2-mail-calview__notes whitespace-pre-wrap break-words"></dd>'],
      ['calview-date', '<bdi dir="ltr" class="v2-mail-calview__date v2-num text-xs font-medium text-foreground group-aria-[current=date]:font-semibold group-aria-[current=date]:text-primary group-data-[outside=true]:text-muted-foreground"></bdi>'],
    ].map(([name, body]) => template(name!, body!)).join('')
    default: throw new Error('unknown_mail_client_template_kind')
  }
}

/** Trusted renderer hooks identify the controller that owns this specific fragment. */
export function v2MailClientTemplatesForHooks(hooks?: object): string {
  if (!hooks) return ''
  const kinds: readonly (readonly [string, string])[] = [
    ['data-mail-preferences', 'preferences'], ['data-mail-forwarders', 'forwarders'], ['data-mail-identities', 'identities'],
    ['data-mail-folders', 'folders'], ['data-mail-search-workspace', 'search'], ['data-mail-mailing-lists', 'mailing-lists'],
    ['data-mail-track-delivery', 'track'], ['data-mail-calendar', 'calendar-settings'], ['data-mail-calendar-view', 'calendar-view'],
    ['data-mail-contacts-tools', 'contact-tools'], ['data-mail-vacation', 'vacation'],
  ]
  return kinds.filter(([hook]) => Object.hasOwn(hooks, hook)).map(([, kind]) => v2MailClientTemplates(kind)).join('')
}

// Structure and controller state of the fragments above; their look is in the Metronic classes of the templates.
export const V2_MAIL_DYNAMIC_CSS = `.v2-mail-reading-fragment{display:contents}
.v2-mail-compose-attachments li>span>span{display:block}
.v2-mail-workspace__facts>.v2-mail-identities__datum{gap:var(--space-1)}
.v2-mail-folders__name{display:grid;gap:.125rem;padding-inline-start:calc(var(--mail-folder-depth,0)*1rem)}
.v2-mail-folders__name [data-xp-slot=raw]{font-family:var(--font-mono);direction:ltr;unicode-bidi:isolate}
.v2-mail-workspace [data-xp-slot=messages],.v2-mail-workspace [data-xp-slot=unseen],.v2-mail-workspace [data-xp-slot=date],.v2-mail-workspace [data-xp-slot=time],.v2-mail-workspace [data-xp-slot=dsn]{font-variant-numeric:tabular-nums}
.v2-mail-workspace [data-xp-slot=dsn],.v2-mail-workspace [data-xp-slot=address]{font-family:var(--font-mono);direction:ltr;unicode-bidi:isolate}
.v2-mail-search__result{display:grid;gap:.25rem;inline-size:100%;block-size:auto;padding:.875rem 1.25rem;border:1px solid var(--line);border-radius:var(--radius-card);background:var(--surface);box-shadow:none;white-space:normal;text-align:start;justify-items:start;overflow-wrap:anywhere;cursor:pointer;transition:background-color 140ms ease-out,border-color 140ms ease-out}
.v2-mail-search__result:hover{background:var(--subtle);border-color:var(--line-strong)}
.v2-mail-search__result:hover>strong{color:var(--accent)}
.v2-mail-move-menu button{inline-size:100%}
.v2-mail-move-menu button:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
[data-ui-theme="v2"] [data-mail-calendar-view] [data-calview-grid]{display:flex;flex-direction:column;min-inline-size:40rem}
.v2-mail-calview__row{display:grid;grid-template-columns:3.5rem repeat(7,minmax(0,1fr))}
.v2-mail-calview__short{display:none}
.v2-mail-calview__day{padding:.5rem;outline-offset:-2px}
.v2-mail-calview__day[data-outside=true]{background:color-mix(in oklab,var(--kt-muted) 40%,transparent)}
.v2-mail-calview__day[aria-current=date]{background:color-mix(in oklab,var(--kt-accent) 50%,transparent)}
.v2-mail-calview__day[aria-selected=true]{box-shadow:inset 0 0 0 2px var(--accent)}
.v2-mail-calview__chip{min-inline-size:2.75rem;border-inline-start:3px solid var(--calview-chip,var(--accent));background:color-mix(in oklab,var(--calview-chip,var(--accent)) 10%,var(--surface));transition:background-color 140ms ease-out}
.v2-mail-calview__chip:hover{background:color-mix(in oklab,var(--calview-chip,var(--accent)) 18%,var(--surface))}
.v2-mail-calview__chip>bdi{flex:none;white-space:nowrap;overflow-wrap:normal;font-weight:400;color:var(--text-2)}
.v2-mail-calview__chip>span:last-child{min-inline-size:0;overflow:hidden;text-overflow:ellipsis}
.v2-mail-calview__swatch{background:var(--calview-chip,var(--accent))}
[data-ui-theme="v2"] [data-calview-grid]:is([data-mode=week],[data-mode=day]) .v2-mail-calview__row{grid-template-columns:3.5rem repeat(var(--calview-days,7),minmax(0,1fr))}
[data-ui-theme="v2"] [data-calview-grid]:is([data-mode=week],[data-mode=day]) .v2-mail-calview__day{padding:0}
[data-ui-theme="v2"] [data-calview-grid]:is([data-mode=week],[data-mode=day]) .v2-mail-calview__gutter{display:grid;grid-template-rows:repeat(24,2.5rem);padding:0 .25rem}
.v2-mail-calview__timeline{position:relative;block-size:60rem;inline-size:100%;background:repeating-linear-gradient(180deg,transparent 0,transparent calc(2.5rem - 1px),var(--line) calc(2.5rem - 1px),var(--line) 2.5rem)}
.v2-mail-calview__timeline>.v2-mail-calview__chip{position:absolute;inset-block-start:var(--calview-top);block-size:var(--calview-height);inset-inline-start:var(--calview-start);inline-size:var(--calview-width);overflow:hidden;min-block-size:1.5rem;min-inline-size:0}
@media(max-width:600px){.v2-mail-calview__long{display:none}.v2-mail-calview__short{display:inline}}
@media(prefers-reduced-motion:reduce){.v2-mail-search__result,.v2-mail-calview__chip{transition:none}}
`
