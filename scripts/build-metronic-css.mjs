// Rebuilds apps/web/src/vendor/metronic/styles.css from a licensed Metronic Tailwind HTML package.
// The Metronic sources are not part of this repository: pass the extracted `metronic-tailwind-html-demos`
// directory (after `npm install` there) as the first argument or in METRONIC_HTML_DIR. Tailwind scans the v2
// theme sources, so every utility class the theme markup names is present in the committed stylesheet.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const metronic = resolve(process.argv[2] ?? process.env.METRONIC_HTML_DIR ?? '')
if (!existsSync(join(metronic, 'src/css/config.ktui.css')) || !existsSync(join(metronic, 'node_modules/@tailwindcss/cli'))) {
  process.stderr.write('Pass the extracted metronic-tailwind-html-demos directory with its dependencies installed.\n')
  process.exit(1)
}
const posix = path => path.split(/[\\/]/).join('/')
const vendor = join(root, 'apps/web/src/vendor/metronic')
mkdirSync(vendor, { recursive: true })
const entry = join(metronic, 'src/css/xpanel.entry.css')
// Project standards (docs/STANDARDS.md "UI and internationalization" and "Typography and spacing roles"; owner's
// decision, .tools/metronic/GUIDE.md §11): where Metronic's sizing conflicts with the standard, the standard wins.
// The block sits in KTUI's own `components` layer after the KTUI import, so it beats the KTUI rule of the same
// specificity, and its min-* sizes clamp every kt size variant (sm, lg, icon) without page edits. It changes only
// metrics and state contrast; Metronic's palette, radii and component look stay. The --target, --lh-* and
// --v2-panel-padding values come from the v2 tokens (themes/v2/tokens.ts, base.ts). Name Metronic variables here
// (--kt-muted-foreground, --input), not --muted/--accent: the build renames those to --kt-muted/--kt-accent.
const STANDARDS = `@layer components {
  /* 44px targets; ordinary controls are body text (16/24, 26 in Arabic). */
  .kt-btn { min-height: var(--target); min-width: var(--target); font-size: 1rem; line-height: var(--lh-text); }
  .kt-input, .kt-select, .kt-input-addon { min-height: var(--target); }
  .kt-input, .kt-select, .kt-textarea, .kt-input-addon { font-size: 1rem; line-height: var(--lh-text); }
  .kt-tabs.kt-tabs-line .kt-tab-toggle { min-height: var(--target); min-width: var(--target); justify-content: center; font-size: 1rem; line-height: var(--lh-text); }
  /* The inner input of a composite kt-input fills its 44px frame (overlapping the 1px border) as its own target. */
  .kt-input:not(input) > input { min-height: var(--target); margin-block: -1px; }
  .kt-menu-link, .kt-dropdown-menu-link { min-height: var(--target); }
  @media (max-width: 959px) { .kt-input, .kt-select, .kt-textarea { line-height: 1.5rem; } }
  /* A left-to-right value inside a right-to-left field keeps the field's start edge (the same swap formField
     writes as rtl:ps-6 rtl:pe-3), so hand-written selects need no per-page classes. */
  [dir='rtl'] .kt-select[dir='ltr'] { padding-inline: 1.5rem .75rem; }
  /* Type roles: label 14/22, caption 13/20, card heading 18/28; table cells body 16/24 under 14/22 headers. */
  .kt-form-label, .kt-label { font-size: .875rem; line-height: var(--lh-label); }
  .kt-form-description, .kt-form-message, .kt-badge { font-size: .8125rem; line-height: var(--lh-cap); }
  .kt-form-description, .kt-form-message { margin-top: 0; }
  .kt-card-title { font-size: 1.125rem; line-height: var(--lh-card); }
  .kt-table { font-size: 1rem; line-height: var(--lh-text); }
  .kt-table thead th { font-size: .875rem; line-height: var(--lh-label); }
  /* A field label sits 8px above its control, its glyphs on the control's text edge (base FORM_FIELD_CSS). */
  .kt-form-item { gap: .5rem; }
  .v2-field > .kt-form-label { display: block; }
  /* One focus envelope: the 2px outline from the v2 base, no KTUI ring, the boundary keeps its color. */
  :is(.kt-btn, .kt-input, .kt-select, .kt-textarea, .kt-checkbox, .kt-radio, .kt-switch):focus-visible,
  .kt-input:not(input):has(input:focus-visible) { --tw-ring-shadow: 0 0 #0000; --tw-ring-offset-shadow: 0 0 #0000; }
  :is(.kt-input, .kt-select, .kt-textarea):focus-visible:not([aria-invalid='true']),
  .kt-input:not(input):has(input:focus-visible) { border-color: var(--input); }
  /* Read-only text controls are filled; disabled buttons stay readable and neutral (no opacity, stable hover). */
  :is(.kt-input, .kt-textarea)[readonly]:not(:disabled), .kt-input:not(input):has(input[readonly]:not(:disabled)) { background-color: var(--subtle); }
  /* No colour transition on buttons: half-way between the disabled and the enabled look the label would fall
     below the text contrast the standard requires (the sign-in acceptance test samples that moment). */
  .kt-btn { transition: none; }
  .kt-btn:is(:disabled, [aria-disabled='true']) { opacity: 1 !important; color: var(--kt-muted-foreground) !important; box-shadow: none !important; transition: none !important; }
  .kt-btn:not(.kt-btn-ghost, .kt-btn-dim):is(:disabled, [aria-disabled='true']) { border-color: var(--line) !important; background-color: var(--sunken) !important; }
  .kt-btn:is(:disabled, [aria-disabled='true']) :is(i, svg) { color: inherit !important; }
  /* Cards: the padding is on the .v2-card itself (24px, 16px on phones), so the KTUI parts add none of their own. */
  .v2-card > .kt-card-header { min-height: 0; padding-inline: 0; }
  .v2-card > .kt-card-header:is(:last-child, :has(+ .kt-card-table)) { border-bottom-width: 0; }
  .v2-card > .kt-card-content { padding: 0; }
  .v2-card > .kt-card-footer { padding-inline: 0; padding-bottom: 0; }
  .kt-card-table .kt-table :is(th, td):first-child { padding-inline-start: var(--v2-panel-padding); }
  .kt-card-table .kt-table :is(th, td):last-child { padding-inline-end: var(--v2-panel-padding); }
}
`
// Layer order: the v2 theme's own rules sit above Tailwind's reset and below the KTUI components and utilities,
// so a Metronic class on an element always wins over the older v2 rule for the same property.
writeFileSync(entry, `@layer theme, base, v2, components, utilities;
@import 'tailwindcss';
@source '../../dist/assets/vendors/ktui/';
@source '../../dist/html/demo3/';
@source '../../node_modules/@keenthemes/ktui/src/components/alert/';
@source '../../node_modules/@keenthemes/ktui/src/components/toast/';
@source '../../node_modules/@keenthemes/ktui/src/components/rating/';
@source '${posix(join(root, 'apps/web/src/themes/v2'))}';
@source '${posix(join(vendor, 'safelist.txt'))}';
@import "./config.ktui";
@import '../../node_modules/@keenthemes/ktui/styles.css';
@import "./components/index";
@theme {
  --font-sans: 'Inter', 'IBM Plex Sans Arabic', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', 'IBM Plex Sans Arabic', ui-monospace, Consolas, 'Liberation Mono', sans-serif;
  /* Project standards: the small text utilities are the standard's type roles (caption 13/20, label 14/22, body
     16/24, card heading 18/28; the --lh-* tokens on the root carry the taller Arabic line heights). */
  --text-xs: .8125rem; --text-xs--line-height: var(--lh-cap, 1.25rem);
  --text-sm: .875rem; --text-sm--line-height: var(--lh-label, 1.375rem);
  --text-base: 1rem; --text-base--line-height: var(--lh-text, 1.5rem);
  --text-lg: 1.125rem; --text-lg--line-height: var(--lh-card, 1.75rem);
}
${STANDARDS}`)
const out = join(metronic, `xpanel-styles.${process.pid}.css`)
const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: metronic, stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
run([join(metronic, 'node_modules/@tailwindcss/cli/dist/index.mjs'), '-i', entry, '-o', out, '--minify'])
run([join(metronic, 'node_modules/postcss-cli/index.js'), out, '--replace', '--use', 'postcss-nesting', '--no-map'])
// Two adjustments keep Metronic and the v2 contract apart:
// - v2 already owns the custom properties --muted and --accent (text and brand colors that installed theme
//   packages may set), so Metronic's own --muted* and --accent* become --kt-muted* and --kt-accent*;
// - core marks the color scheme with data-theme on <html>, so the `.dark` scope becomes [data-theme=dark];
// - Metronic declares its palette variables outside every layer, where nothing layered could change them. They move
//   into the `base` layer so the v2 tokens (layer `v2`, themes/v2/tokens.ts) are the one source of color.
const PALETTE = /(:root\{--background:[^}]*\})(\[data-theme=dark\]\{--background:[^}]*\})/
const built = readFileSync(out, 'utf8')
  .replace(/--(muted|accent)(?![\w])/g, '--kt-$1')
  .replace(/\.dark(?![\w\-]|\x5c)/g, '[data-theme=dark]')
unlinkSync(out)
if (!built.includes('.kt-btn') || !PALETTE.test(built)) {
  process.stderr.write('The built stylesheet lacks the KTUI components or the Metronic palette block.\n')
  process.exit(1)
}
const css = built.replace(PALETTE, '@layer base{$1$2}')
const staged = join(vendor, `styles.${process.pid}.tmp`)
writeFileSync(staged, css)
renameSync(staged, join(vendor, 'styles.css'))
process.stdout.write(`apps/web/src/vendor/metronic/styles.css ${css.length} bytes\n`)
