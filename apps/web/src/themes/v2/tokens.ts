// v2 design tokens carry the Metronic (KTUI) palette: colors only through these properties, light by default, dark on
// `data-theme="dark"`. They stay the one source of color: the last line of each scheme points Metronic's own
// variables (--background, --foreground, --card, --primary, --border, --input, --secondary, --kt-muted, --kt-accent,
// --mono, --radius) at the v2 tokens, so a `kt-*` component, a Tailwind utility and an older v2 rule always agree,
// and an installed theme package that sets a v2 token recolors all three.
// The palette departs from Metronic's defaults only where WCAG AA text contrast (4.5:1) needs it: the light primary
// is blue-600 instead of blue-500, muted text is one step stronger, and the dark primary is a light blue that carries
// dark text.
// KTUI's dark primary badges and links name blue-600 directly, so the dark scheme points that step at the accent too.
// Text-control boundaries (--line-strong, Metronic's --input) keep 3:1 against the page and the card in both
// schemes (WCAG 1.4.11); card and table hairlines (--line) stay light. --target is the 44px interaction target and
// the --lh-* tokens are the standard's type-role line heights (caption, label, body and controls, card heading, page
// heading), taller for Arabic glyphs.
// Latin text is set in Inter (Metronic's typeface) and Arabic text in IBM Plex Sans Arabic, both self-hosted.
// Mono ends in the sans family, never the generic monospace: that face often carries
// disconnected Arabic glyphs, so Arabic inside a mono run takes the joined Arabic sans.

const ROOT = '[data-ui-theme="v2"]'

const METRONIC_BRIDGE = '--background:var(--bg);--foreground:var(--text);--card:var(--surface);--card-foreground:var(--text);--popover:var(--surface);--popover-foreground:var(--text);\
--primary:var(--accent-fill);--primary-foreground:var(--on-accent);--secondary:var(--sunken);--secondary-foreground:var(--text-2);\
--kt-muted:var(--sunken);--kt-muted-foreground:var(--muted);--kt-accent:var(--sunken);--kt-accent-foreground:var(--text-2);\
--mono-foreground:var(--bg);--border:var(--line);--input:var(--line-strong);--radius:calc(var(--radius-control) + 2px)'

export const V2_TOKENS_CSS = `${ROOT}{color-scheme:light;\
--bg:#FFFFFF;--surface:#FFFFFF;--subtle:color-mix(in oklab,var(--sunken) 55%,var(--bg));--sunken:#F4F4F5;--line:#ECECEE;--line-strong:#8B8B95;\
--text:#09090B;--text-2:#18181B;--muted:#6B6B76;\
--accent:#155DFC;--accent-fill:#155DFC;--accent-fill-hover:color-mix(in oklab,var(--accent-fill) 88%,#000);--accent-soft:color-mix(in oklab,var(--accent) 10%,transparent);--accent-line:color-mix(in oklab,var(--accent) 28%,transparent);--on-accent:#FFFFFF;\
--ok:#15803D;--ok-soft:#F0FDF4;--ok-line:#BBF7D0;--warn:#A16207;--warn-soft:#FEFCE8;--warn-line:#FEF08A;\
--bad:#B91C1C;--bad-soft:#FEF2F2;--bad-line:#FECACA;\
--nav:var(--sunken);--nav-2:var(--bg);--nav-line:var(--line);--nav-text:var(--text-2);--nav-muted:var(--muted);--nav-strong:var(--text);\
--code:#18181B;--code-text:#E4E4E7;--code-muted:#A1A1AA;--chart-2:#8B5CF6;\
--shadow:0 1px 2px 0 rgba(0,0,0,.05);--scrim:rgba(0,0,0,.3);--focus:var(--accent);\
--font-sans:'Inter','IBM Plex Sans Arabic',system-ui,sans-serif;--font-mono:'IBM Plex Mono','IBM Plex Sans Arabic',ui-monospace,Consolas,'Liberation Mono',sans-serif;\
--lh-body:1.5;--lh-head:1.25;--lh-cap:20px;--lh-label:22px;--lh-text:24px;--lh-card:28px;--lh-page:34px;\
--space-1:8px;--space-2:16px;--space-3:24px;--space-4:32px;\
--radius-card:12px;--radius-notice:8px;--radius-control:6px;--radius-chip:4px;--radius-pill:999px;--target:2.75rem;\
--mono:var(--text);${METRONIC_BRIDGE}}
${ROOT}[data-theme="dark"]{color-scheme:dark;\
--bg:#09090B;--surface:#09090B;--sunken:#18181B;--line:#27272A;--line-strong:#66666F;\
--text:#FAFAFA;--text-2:#FAFAFA;--muted:#9F9FA9;\
--accent:#51A2FF;--accent-fill:#51A2FF;--on-accent:#09090B;--color-blue-600:var(--accent);\
--ok:#4ADE80;--ok-soft:rgba(34,197,94,.12);--ok-line:rgba(34,197,94,.32);--warn:#FACC15;--warn-soft:rgba(234,179,8,.12);--warn-line:rgba(234,179,8,.32);\
--bad:#F87171;--bad-soft:rgba(239,68,68,.12);--bad-line:rgba(239,68,68,.32);\
--code:#09090B;--code-muted:#71717A;--chart-2:#A78BFA;--shadow:0 1px 2px 0 rgba(0,0,0,.4);--scrim:rgba(0,0,0,.6);\
--mono:color-mix(in oklab,var(--text) 84%,var(--bg))}
${ROOT}:lang(ar){--font-sans:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}
${ROOT}:lang(ar){--lh-body:1.65;--lh-head:1.35;--lh-cap:22px;--lh-label:24px;--lh-text:26px;--lh-card:30px;--lh-page:36px}
${ROOT} [lang="ar"]{font-family:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}
`
