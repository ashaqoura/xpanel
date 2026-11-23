// Mail glyphs the shared v2 icon set does not carry, drawn with the same Keenicons font as icon().
const GLYPHS = {
  compose: 'ki-message-edit',
  attach: 'ki-paper-clip',
  send: 'ki-paper-plane',
  bold: 'ki-text-bold',
  italic: 'ki-text-italic',
  underline: 'ki-text-underline',
  bullets: 'ki-text-circle',
  numbers: 'ki-text-number',
  quote: 'ki-message-text',
  link: 'ki-fasten',
  clear: 'ki-eraser',
  reply: 'ki-arrow-left',
  replyAll: 'ki-double-left',
  forward: 'ki-arrow-right',
  junk: 'ki-shield-cross',
  inbox: 'ki-directbox-default',
  restore: 'ki-arrows-loop',
  back: 'ki-arrow-left',
  trash: 'ki-trash',
  star: 'ki-star',
  image: 'ki-picture',
  // folders of the mailbox menu
  sent: 'ki-paper-plane',
  drafts: 'ki-notepad-edit',
  archive: 'ki-archive',
  folder: 'ki-folder',
  // workspace actions
  refresh: 'ki-arrows-circle',
  plus: 'ki-plus',
  check: 'ki-check',
  cross: 'ki-cross',
  download: 'ki-exit-down',
  upload: 'ki-exit-up',
  search: 'ki-magnifier',
  pencil: 'ki-pencil',
  share: 'ki-share',
  filter: 'ki-filter',
  calendar: 'ki-calendar',
  prev: 'ki-left',
  next: 'ki-right',
  eye: 'ki-eye',
  test: 'ki-flask',
  key: 'ki-key',
  users: 'ki-users',
  devices: 'ki-devices',
  gear: 'ki-setting-2',
  time: 'ki-time',
  shield: 'ki-shield-tick',
  disk: 'ki-external-drive',
  list: 'ki-row-horizontal',
  profile: 'ki-profile-circle',
  book: 'ki-address-book',
  flag: 'ki-flag',
  tools: 'ki-wrench',
  delivery: 'ki-parcel-tracking',
  info: 'ki-information-2',
} as const

export type MailIcon = keyof typeof GLYPHS

/** Glyphs that point along the reading direction and mirror in right-to-left pages. */
const DIRECTIONAL: ReadonlySet<MailIcon> = new Set(['reply', 'replyAll', 'forward', 'back', 'prev', 'next'])

// The glyph size is a font size: complete literal utilities, so the stylesheet build keeps them.
const SIZE: Readonly<Record<number, string>> = { 12: 'text-xs', 14: 'text-sm', 16: 'text-base', 18: 'text-lg', 20: 'text-xl', 24: 'text-2xl', 30: 'text-3xl' }

export const mailIcon = (name: MailIcon, size = 18): string =>
  `<i class="v2-icon ki-filled ${GLYPHS[name]} ${SIZE[size] ?? 'text-lg'}${DIRECTIONAL.has(name) ? ' v2-flip' : ''}" aria-hidden="true"></i>`
