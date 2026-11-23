// v2 design tokens carry the Metronic (KTUI) palette: colors only through these properties, light by default, dark on
// `data-theme="dark"`. They stay the one source of color: the last line of each scheme points Metronic's own
// variables (--background, --foreground, --card, --primary, --border, --input, --secondary, --kt-muted, --kt-accent,
// --mono, --radius) at the v2 tokens, so a `kt-*` component, a Tailwind utility and an older v2 rule always agree,
// and an installed theme package that sets a v2 token recolors all three.
// Latin text is set in Inter (Metronic's typeface) and Arabic text in IBM Plex Sans Arabic, both self-hosted.
// Mono ends in the sans family, never the generic monospace: that face often carries
// disconnected Arabic glyphs, so Arabic inside a mono run takes the joined Arabic sans.

const ROOT = '[data-ui-theme="v2"]'

const METRONIC_BRIDGE = '--background:var(--bg);--foreground:var(--text);--card:var(--surface);--card-foreground:var(--text);--popover:var(--surface);--popover-foreground:var(--text);\
--primary:var(--accent-fill);--primary-foreground:var(--on-accent);--secondary:var(--sunken);--secondary-foreground:var(--text-2);\
--kt-muted:var(--sunken);--kt-muted-foreground:var(--muted);--kt-accent:var(--sunken);--kt-accent-foreground:var(--text-2);\
--mono-foreground:var(--bg);--border:var(--line);--input:var(--line-strong);--radius:calc(var(--radius-control) + 2px)'

export const V2_TOKENS_CSS = `${ROOT}{color-scheme:light;\
--bg:#FFFFFF;--surface:#FFFFFF;--subtle:color-mix(in oklab,var(--sunken) 55%,var(--bg));--sunken:#F4F4F5;--line:#ECECEE;--line-strong:#E4E4E7;\
--text:#09090B;--text-2:#18181B;--muted:#71717B;\
--accent:#2B7FFF;--accent-fill:#2B7FFF;--accent-fill-hover:color-mix(in oklab,var(--accent-fill) 88%,#000);--accent-soft:color-mix(in oklab,var(--accent) 10%,transparent);--accent-line:color-mix(in oklab,var(--accent) 28%,transparent);--on-accent:#FFFFFF;\
--ok:#15803D;--ok-soft:#F0FDF4;--ok-line:#BBF7D0;--warn:#A16207;--warn-soft:#FEFCE8;--warn-line:#FEF08A;\
--bad:#DC2626;--bad-soft:#FEF2F2;--bad-line:#FECACA;\
--nav:var(--sunken);--nav-2:var(--bg);--nav-line:var(--line-strong);--nav-text:var(--text-2);--nav-muted:var(--muted);--nav-strong:var(--text);--nav-ok:#16A34A;--nav-warn:#CA8A04;--nav-bad:#DC2626;--nav-accent:var(--accent);--nav-focus:var(--accent);\
--code:#18181B;--code-text:#E4E4E7;--code-muted:#A1A1AA;--chart-2:#8B5CF6;\
--shadow:0 1px 2px 0 rgba(0,0,0,.05);--scrim:rgba(0,0,0,.3);--focus:var(--accent);\
--font-sans:'Inter','IBM Plex Sans Arabic',system-ui,sans-serif;--font-mono:'IBM Plex Mono','IBM Plex Sans Arabic',ui-monospace,Consolas,'Liberation Mono',sans-serif;\
--lh-body:1.5;--lh-head:1.25;\
--space-1:8px;--space-2:16px;--space-3:20px;--space-4:30px;\
--radius-card:12px;--radius-notice:8px;--radius-control:6px;--radius-chip:4px;--radius-pill:999px;--target:2.125rem;\
--mono:var(--text);${METRONIC_BRIDGE}}
${ROOT}[data-theme="dark"]{color-scheme:dark;\
--bg:#09090B;--surface:#09090B;--sunken:#18181B;--line:#27272A;--line-strong:#27272A;\
--text:#FAFAFA;--text-2:#FAFAFA;--muted:#71717B;\
--accent:#51A2FF;--accent-fill:#155DFC;\
--ok:#4ADE80;--ok-soft:rgba(34,197,94,.12);--ok-line:rgba(34,197,94,.32);--warn:#FACC15;--warn-soft:rgba(234,179,8,.12);--warn-line:rgba(234,179,8,.32);\
--bad:#F87171;--bad-soft:rgba(239,68,68,.12);--bad-line:rgba(239,68,68,.32);\
--nav-ok:#4ADE80;--nav-warn:#FACC15;--nav-bad:#F87171;\
--code:#09090B;--code-muted:#71717A;--chart-2:#A78BFA;--shadow:0 1px 2px 0 rgba(0,0,0,.4);--scrim:rgba(0,0,0,.6);\
--mono:color-mix(in oklab,var(--text) 84%,var(--bg))}
${ROOT}:lang(ar){--font-sans:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}
${ROOT}:lang(ar){--lh-body:1.65;--lh-head:1.35}
${ROOT} [lang="ar"]{font-family:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif}
`
