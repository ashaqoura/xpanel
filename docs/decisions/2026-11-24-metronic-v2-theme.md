# The v2 theme is built on Metronic 9

Date: 2026-11-24. Owner decision.

## Problem

The v2 theme had its own hand-written stylesheet, shell and inline SVG icon set. The owner chose Metronic 9 (Tailwind 4 + KTUI, demo 3 layout) as the v2 visual language. Metronic is a commercial package that is not in the repository, its controls are 34px high where the [standards](../STANDARDS.md) require 44px targets, and its rules would otherwise compete with the existing v2 rules and with installed theme packages that set v2 tokens.

## Decision

- `apps/web/src/vendor/metronic/` holds the compiled Metronic stylesheet (`styles.css`), the Keenicons filled icon font (`keenicons-filled.woff`) and its CSS (`keenicons.css`), and `safelist.txt`. `apps/web/src/vendor/inter/` holds the Inter variable font (Latin and Latin Extended, from `@fontsource-variable/inter` 5.2.8) with its SIL Open Font License 1.1.
- `apps/web/src/vendor/metronic.ts` serves them from the panel's own origin under `/assets/metronic/` with content-hash URLs. Each Inter file's SHA-256 is pinned; a mismatch fails the import. The release ships these files as required files.
- `styles.css` is generated and committed, so the server still runs without a build step. Only regenerating it needs the licensed package: extract `metronic-tailwind-html-demos`, run `npm install` there, then from the repository root run `node scripts/build-metronic-css.mjs <that directory>` (or set `METRONIC_HTML_DIR`). Tailwind scans `apps/web/src/themes/v2` and `safelist.txt`, so every utility class the theme markup names is present. The build renames Metronic's `--muted*` and `--accent*` to `--kt-muted*` and `--kt-accent*`, maps `.dark` to `[data-theme=dark]`, and moves Metronic's palette variables into the `base` layer.
- Cascade layers are ordered `theme, base, v2, components, utilities`. Every v2 stylesheet is emitted inside `@layer v2`, so a `kt-*` class or a Tailwind utility on an element beats an older v2 rule for the same property, whatever its specificity. An `!important` declaration in the `v2` layer beats the later layers. The Metronic stylesheet declares the order and is linked before every v2 stylesheet.
- `apps/web/src/themes/v2/tokens.ts` stays the one source of colour. The v2 tokens carry the Metronic palette, and Metronic's own variables (`--background`, `--primary`, `--border`, `--input` and the others) point at them, so an installed theme package that sets a v2 token recolours Metronic components too. The palette departs from Metronic only for WCAG AA text contrast: the light primary is blue-600, muted text is one step stronger, and the dark primary is a light blue that carries dark text. Text-control borders reach 3:1 in both schemes.
- The tokens also carry `--target` (44px), spacing steps 8, 16, 24 and 32, and the type-role line heights (`--lh-cap`, `--lh-label`, `--lh-text`, `--lh-card`, `--lh-page`), taller in Arabic.
- Latin text in the v2 theme is Inter and Arabic text is IBM Plex Sans Arabic; IBM Plex Mono stays the technical face. Inter is the owner's explicit choice for the v2 theme. The classic theme keeps IBM Plex Sans.
- Icons are Keenicons (filled) through `apps/web/src/themes/v2/icons.ts`. The hand-drawn SVG icon set is removed.
- Shell: a fixed 64px header, a full 280px vertical menu that a header button hides and shows, a tab row for the current section while the menu is hidden, and a slide-in drawer below 960px. The hidden state is restored before first paint by the same-origin head script `/assets/v2-sidebar-state.js` on workspace documents.

## Exceptions

- **Standards over Metronic sizing.** Where Metronic's metrics conflict with [STANDARDS.md](../STANDARDS.md), the standard wins. The "project standards" block in `scripts/build-metronic-css.mjs` sits in KTUI's `components` layer and enforces 44px minimum targets on `kt-btn`, inputs, selects, tabs and menu items, body-size controls (16/24), the label, caption, card-heading and table type roles, the 8px label gap, the single 2px focus outline, readable disabled buttons, and card padding on the card itself. Metronic's palette, radii and component look are unchanged. Hand-written `kt-*` markup complies without per-page classes.
- **Licensing.** Metronic is licensed per project, and the repository upstream is public under the AGPL. The Metronic sources are never committed, and the generated stylesheet and Keenicons files must not be published in a public repository unless the Metronic license allows it. Inter and IBM Plex are OFL and carry no such restriction.
- **Classic theme.** The classic theme, `apps/web/src/tokens.ts` and the [design notes](../design/artifact-design-system.md) it follows are unchanged.

## Tests

- `apps/web/src/themes/v2/document.test.ts`: the Metronic icon and component stylesheets are linked from the panel origin before every v2 stylesheet, every v2 stylesheet is a single `@layer v2` block, and the sidebar-state script loads on workspace documents only.
- `apps/web/src/themes/v2/assets.test.ts`: the tokens, the dark and Arabic overrides, and the shared foundation stylesheet budget of 13 KiB gzip (raised from 12 KiB because the foundation now carries the control sizes and type roles).
- The browser drivers assert Inter for English and IBM Plex Sans Arabic for Arabic in the v2 theme, and the navigation suite accepts only `/assets/fonts/` and the two `/assets/metronic/inter-*` files as font sources.

## Not established

- The browser acceptance drivers passed 27 of 27 in real Chromium on Windows with Node 26.13 behind a local shim for the 26.12.1 pin, outside the pinned three-partition runner. That is not formal browser acceptance on the pinned runtime.
- The Linux CI lanes have not run on this theme.
