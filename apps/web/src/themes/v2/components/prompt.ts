/** The native dialog preserves browser focus containment while keeping all presentation in V2. The confirm button
 *  keeps the v2 classes alone so the danger tone of the prompt can recolour it. */
export const V2_PROMPT_TEMPLATE = `<template data-xp-template="prompt-dialog"><dialog class="v2-prompt" data-xp-prompt aria-labelledby="v2-prompt-title" aria-describedby="v2-prompt-body"><form method="dialog" data-xp-slot="form"><div class="v2-prompt__head"><h2 id="v2-prompt-title" class="kt-modal-title" data-xp-prompt-title data-xp-slot="title"></h2><p id="v2-prompt-body" data-xp-prompt-body data-xp-slot="body"></p></div><div class="v2-field v2-prompt__field kt-form-item" data-xp-prompt-field data-xp-slot="field"><label for="v2-prompt-input" class="kt-form-label" data-xp-prompt-label data-xp-slot="label"></label><input id="v2-prompt-input" class="kt-input max-[959px]:text-base" data-xp-prompt-input data-xp-slot="input" autocomplete="off"></div><div class="v2-prompt__foot"><button type="button" class="v2-btn kt-btn kt-btn-outline" value="cancel" data-xp-prompt-cancel data-xp-slot="cancel"></button><button type="submit" class="v2-btn v2-btn--primary" value="confirm" data-xp-prompt-confirm data-xp-slot="confirm"></button></div></form></dialog></template>`

// The native dialog takes the Metronic modal values here (20px by 16px parts, footer actions at the end):
// kt-modal-content would force it visible while closed.
export const V2_PROMPT_CSS = `.v2-prompt{position:fixed;inset:0;margin:auto;inline-size:min(500px,calc(100% - 32px));max-block-size:calc(100dvh - 32px);padding:0;border:1px solid var(--line);border-radius:var(--radius-notice);background:var(--popover,var(--surface));color:var(--popover-foreground,var(--text));box-shadow:var(--v2-elev);overflow:auto}
.v2-prompt:not([open]){display:none}
.v2-prompt::backdrop{background:var(--scrim);backdrop-filter:blur(4px)}
.v2-prompt>form{display:flex;flex-direction:column;gap:var(--space-3);min-inline-size:0;padding:var(--space-3)}
.v2-prompt__head{display:flex;flex-direction:column;gap:var(--space-1);min-inline-size:0;overflow-wrap:anywhere}
.v2-prompt__head>p{font-size:.875rem;line-height:1.5;color:var(--text-2)}
.v2-prompt__head code{padding:.125rem .375rem;border-radius:var(--radius-chip);background:var(--sunken);color:var(--text)}
.v2-prompt__foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
.v2-prompt[data-prompt-tone="danger"] [data-xp-prompt-confirm]{background:var(--destructive);border-color:transparent;color:var(--destructive-foreground)}`
