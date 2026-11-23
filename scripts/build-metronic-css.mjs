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
}
`)
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
