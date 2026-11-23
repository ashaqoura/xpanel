// v2 icon set: Keenicons (filled style) from the Metronic icon font. Each v2 name maps to the closest glyph;
// the font is loaded by the document through /assets/metronic/keenicons.css.

const GLYPHS = {
  activity: 'ki-pulse',
  alert: 'ki-information',
  apps: 'ki-category',
  archive: 'ki-archive',
  arrow: 'ki-arrow-right',
  bell: 'ki-notification',
  branch: 'ki-arrow-mix',
  calendar: 'ki-calendar',
  check: 'ki-check',
  clock: 'ki-time',
  chevDown: 'ki-down',
  chevLeft: 'ki-left',
  chevRight: 'ki-right',
  code: 'ki-code',
  copy: 'ki-copy',
  cpu: 'ki-technology-1',
  database: 'ki-data',
  disk: 'ki-external-drive',
  download: 'ki-exit-down',
  external: 'ki-exit-right-corner',
  files: 'ki-files',
  filter: 'ki-filter',
  folder: 'ki-folder',
  gear: 'ki-setting-2',
  globe: 'ki-compass',
  home: 'ki-home',
  inbox: 'ki-directbox-default',
  info: 'ki-information-2',
  language: 'ki-flag',
  layers: 'ki-abstract-26',
  link: 'ki-fasten',
  mail: 'ki-sms',
  memory: 'ki-simcard',
  menu: 'ki-burger-menu-5',
  moon: 'ki-moon',
  more: 'ki-dots-horizontal',
  okCircle: 'ki-check-circle',
  package: 'ki-cube-2',
  plus: 'ki-plus',
  refresh: 'ki-arrows-circle',
  search: 'ki-magnifier',
  server: 'ki-row-horizontal',
  services: 'ki-element-11',
  shield: 'ki-shield-tick',
  sliders: 'ki-setting-4',
  star: 'ki-star',
  store: 'ki-shop',
  sun: 'ki-sun',
  tools: 'ki-wrench',
  trash: 'ki-trash',
  upload: 'ki-exit-up',
  user: 'ki-user',
  users: 'ki-users',
  x: 'ki-cross',
  xCircle: 'ki-cross-circle',
} as const

export type IconName = keyof typeof GLYPHS

/** Icons that point along the reading direction and mirror in RTL; every other icon never mirrors. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(['arrow', 'chevLeft', 'chevRight'])

/** Catalog section icons (lucide names in `@xpanel/catalog` navigation data) drawn with the v2 set. */
const CATALOG_ICONS: Readonly<Record<string, IconName>> = {
  Activity: 'activity', ArchiveRestore: 'archive', Boxes: 'apps', CalendarDays: 'calendar', Code: 'code',
  Database: 'database', FolderOpen: 'folder', Globe: 'globe', HardDrive: 'disk', Inbox: 'inbox',
  LayoutDashboard: 'home', ListFilter: 'filter', Mail: 'mail', Package: 'package', Server: 'server',
  ServerCog: 'services', ShieldCheck: 'shield', SlidersHorizontal: 'sliders', Store: 'store',
  UserCog: 'user', Users: 'users', Wrench: 'tools',
}

export const catalogIcon = (lucideName: string): IconName => CATALOG_ICONS[lucideName] ?? 'layers'

// The glyph size is a font size. Complete literal utilities, so the stylesheet build keeps them and no page needs
// an inline style; a size between two steps takes the nearest one. `leading-none` keeps the glyph box square: the
// size utilities carry their own line height.
const SIZES: readonly (readonly [number, string])[] = [
  [10, 'text-[10px]'], [12, 'text-xs'], [13, 'text-[13px]'], [14, 'text-sm'], [15, 'text-[15px]'], [16, 'text-base'],
  [18, 'text-lg'], [20, 'text-xl'], [22, 'text-[22px]'], [24, 'text-2xl'], [28, 'text-[28px]'], [30, 'text-3xl'],
  [32, 'text-[32px]'], [36, 'text-4xl'], [40, 'text-[40px]'], [48, 'text-5xl'],
]
const sizeClass = (size: number): string => {
  let best = SIZES[0]!
  for (const entry of SIZES) if (Math.abs(entry[0] - size) < Math.abs(best[0] - size)) best = entry
  return best[1]
}

/** A decorative inline icon; meaning is always carried by adjacent text or an `aria-label` on the control.
 *  `size` is the glyph's font size in pixels. */
export const icon = (name: IconName, size = 18): string =>
  `<i class="v2-icon ki-filled ${GLYPHS[name]} ${sizeClass(size)} leading-none${DIRECTIONAL.has(name) ? ' v2-flip' : ''}" aria-hidden="true"></i>`
