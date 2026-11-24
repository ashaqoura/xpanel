import type { Translate } from '../../../../../i18n.ts'
import { formField, type FieldControl } from '../../../components/form-field.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { netTable } from '../domains/common.ts'
import { buttonIcon, ki, type Keenicon } from '../server/common.ts'

/** A TLS workspace button: closed unless `enabled`, with the Keenicon it names or its hooks imply; `small` is the row and toolbar size. */
export function tlsButton(label: string, hooks?: HookAttributes, options: { enabled?: boolean; primary?: boolean; danger?: boolean; submit?: boolean; small?: boolean; icon?: Keenicon | false } = {}): string {
  const glyph = options.icon === false ? undefined : options.icon ?? buttonIcon(undefined, hooks)
  return `<button type="${options.submit ? 'submit' : 'button'}" class="v2-btn${options.primary ? ' v2-btn--primary' : ''}${options.danger ? ' v2-btn--danger' : ''} kt-btn ${options.danger ? 'kt-btn-destructive' : options.primary ? 'kt-btn-primary' : 'kt-btn-outline'}${options.small ? ' kt-btn-sm' : ''}"${hookAttrs(hooks)}${options.enabled ? '' : ' disabled'}>${glyph ? ki(glyph, options.small ? 'text-sm' : 'text-base') : ''}${escapeHtml(label)}</button>`
}
/** A TLS workspace field: closed unless the control says otherwise. `row` is the Metronic settings row of a wide form. */
export const tlsField = (id: string, label: string, control: FieldControl, help?: string, layout: 'row' | 'stacked' = 'stacked'): string =>
  formField({ id: `v2-whm-network-${id}`, label, layout, control: { ...control, disabled: control.disabled ?? true }, ...(help ? { help } : {}) })
/** Class lists of the section parts this family draws itself, in the Metronic type scale. */
export const TLS_HEADING = 'text-sm font-semibold text-mono'
export const TLS_TEXT = 'text-sm text-secondary-foreground'
export const TLS_ACTIONS = 'v2-whm-network__actions flex flex-wrap items-center justify-end gap-2.5'
// Settings rows stacked 20px apart, their controls growing with the row as Metronic's, and a group of
// sections; both also hold where the network stylesheet is not loaded.
export const TLS_ROWS = 'v2-whm-network__fields grid grid-cols-1 gap-5'
const ROWS = TLS_ROWS
const GROUPS = 'v2-whm-network__groups flex flex-col gap-5 min-w-0'

/**
 * WHM views of a store: browse an owned account or root's own store (SSL Storage Manager), generate a key, certificate and
 * CSR at once, or install a certificate from root's store for the services that take one.
 */
export function v2WhmSslStore(t: Translate, mode: 'storage' | 'generate' | 'service', accounts: readonly { username: string }[], canManage: boolean, server = false): string {
  const parts = v2WhmSslStoreParts(t, mode, accounts, canManage, server)
  return `<div class="${GROUPS}"${hookAttrs(parts.hooks)}>${parts.bodyHtml.replace('<!--ssl-store-toolbar-->', `<div class="${TLS_ACTIONS}">${parts.toolbarHtml}</div>`)}</div>`
}

/**
 * The same store split for a card: `hooks` make the card itself the controller root, so the "Read SSL storage" button
 * can stand in the card header toolbar (Metronic account/api-keys) and still be found inside the root.
 */
export function v2WhmSslStoreCardParts(t: Translate, mode: 'storage' | 'service', accounts: readonly { username: string }[], canManage: boolean, server = false): { hooks: HookAttributes; toolbarHtml: string; bodyHtml: string } {
  const parts = v2WhmSslStoreParts(t, mode, accounts, canManage, server)
  return { ...parts, toolbarHtml: parts.toolbarHtml.replace('class="v2-btn kt-btn kt-btn-outline"', 'class="v2-btn kt-btn kt-btn-outline kt-btn-sm"').replace('text-base', 'text-sm'), bodyHtml: parts.bodyHtml.replace('<!--ssl-store-toolbar-->', '') }
}

function v2WhmSslStoreParts(t: Translate, mode: 'storage' | 'generate' | 'service', accounts: readonly { username: string }[], canManage: boolean, server: boolean): { hooks: HookAttributes; toolbarHtml: string; bodyHtml: string } {
  const id = 'ssl-store-' + mode, unread = t(msgid('SSL storage has not been read.'))
  const options = [...server ? [{ value: '', label: t(msgid('Server store (root)')) }] : [], ...accounts.map(item => ({ value: item.username, label: item.username }))]
  const account = mode === 'service' ? '' : `<div class="${ROWS}">${tlsField(id + '-account', t(msgid('Account')), { kind: 'select', dir: 'ltr', disabled: !canManage, hooks: { 'data-ssl-store-account': true }, options }, undefined, 'row')}</div>`
  const toolbarHtml = tlsButton(t(msgid('Read SSL storage')), { 'data-ssl-store-refresh': true })
  const head = `${account}<p role="status" data-ssl-store-status data-state="unread">${escapeHtml(unread)}</p><!--ssl-store-toolbar-->`
  const template = `<template data-xp-template="ssl-store-action"><button type="button" class="v2-btn kt-btn kt-btn-outline kt-btn-sm" data-xp-slot="label" disabled></button></template>`
  const hooks: HookAttributes = { 'data-ssl-store': true, 'data-ssl-store-mode': mode, ...(mode === 'service' ? { 'data-ssl-store-scope': 'server' } : {}), ...(server ? { 'data-ssl-store-server': 'true' } : {}), 'data-ssl-store-username': '', 'data-ssl-store-can-read': String(canManage), 'data-ssl-store-can-manage': String(canManage) }
  const result = (body: string) => ({ hooks, toolbarHtml, bodyHtml: body + template })
  const root = result
  const table = (key: string, hook: string, caption: string, columns: string[]) => netTable(t, id + '-' + key, caption, columns, [], unread, { [hook]: true })
  const certificates = table('certificates', 'data-ssl-store-certificates', t(msgid('Certificates')), [t(msgid('ID')), t(msgid('Names')), t(msgid('Issuer')), t(msgid('Expires (UTC)')), t(msgid('Private key')), t(msgid('Public key')), t(msgid('Actions'))])
  const viewer = `<section class="${GROUPS}" data-ssl-store-viewer hidden aria-labelledby="v2-whm-${id}-viewer"><h3 class="${TLS_HEADING}" id="v2-whm-${id}-viewer" data-ssl-store-viewer-title></h3><pre class="v2-mono v2-whm-network__pem" dir="ltr" data-ssl-store-pem></pre><div class="${TLS_ACTIONS}">${tlsButton(t(msgid('Close')), { 'data-ssl-store-viewer-close': true })}</div></section>`
  // Without authority the same layout renders with no live form, so nothing can submit.
  const form = (hook: string, extra: string, body: string) => `<${canManage ? 'form' : 'div'} class="${GROUPS}" ${canManage ? hook : hook.replace(/-form$/, '-layout')}${extra}>${body}</${canManage ? 'form' : 'div'}>`
  if (mode === 'storage') {
    return root(head + `<p class="${TLS_TEXT}">${escapeHtml(t(msgid('Keys, signing requests and certificates are files in ~/ssl of this account, readable only by it, and account backups include them. A private key is shown only when you choose View.')))}</p>`
      + `<p class="${TLS_TEXT}">${escapeHtml(t(msgid('Items that share a public key belong together: a key, its signing requests and the certificates issued for it.')))}</p>`
      + certificates + table('keys', 'data-ssl-store-keys', t(msgid('Private keys')), [t(msgid('ID')), t(msgid('Type')), t(msgid('Public key')), t(msgid('Actions'))])
      + table('csrs', 'data-ssl-store-csrs', t(msgid('Certificate signing requests')), [t(msgid('ID')), t(msgid('Names')), t(msgid('Public key')), t(msgid('Actions'))]) + viewer)
  }
  if (mode === 'service') {
    const service = tlsField(id + '-service', t(msgid('Service')), { kind: 'select', name: 'service', required: true, options: [{ value: 'mail', label: t(msgid('Mail: SMTP, IMAP and POP3')) }] }, undefined, 'row')
    return root(head + certificates + form('data-ssl-store-service-form', '', `<div class="${ROWS}">${tlsField(id + '-certificate', t(msgid('Stored certificate')), { kind: 'select', name: 'storeCertificateId', required: true, options: [] }, undefined, 'row')}${service}${tlsField(id + '-bundle', t(msgid('CA bundle (optional)')), { kind: 'textarea', name: 'caBundlePem', rows: 4, dir: 'ltr', mono: true, spellcheck: false, autocomplete: 'off' }, undefined, 'row')}</div>`
      + `<div class="${TLS_ACTIONS}">${canManage ? tlsButton(t(msgid('Install')), undefined, { primary: true, submit: true, icon: 'upload' }) : ''}</div>`)
      + `<p class="${TLS_TEXT}">${escapeHtml(t(msgid('Postfix and Dovecot use the saved certificate that covers the server hostname and expires last; it must be issued by a certificate authority. The panel listener keeps its own certificate lifecycle, and FTP takes no certificate.')))}</p>` + viewer)
  }
  return root(head + form('data-ssl-store-certificate-form', ' data-ssl-store-with-csr="true"', `<div class="${ROWS}">${tlsField(id + '-key-type', t(msgid('Key type')), { kind: 'select', name: 'keyType', options: [] }, undefined, 'row')}${tlsField(id + '-days', t(msgid('Valid for (days)')), { kind: 'input', type: 'number', name: 'days', value: '365', min: 1, max: 3650, required: true, dir: 'ltr' }, undefined, 'row')}${tlsField(id + '-names', t(msgid('Names')), { kind: 'textarea', name: 'names', rows: 3, dir: 'ltr', mono: true, spellcheck: false, autocomplete: 'off', required: true }, t(msgid('One host name per line. The first name is the common name.')), 'row')}${tlsField(id + '-org', t(msgid('Organization')), { kind: 'input', name: 'organization', maxlength: 64, dir: 'auto' }, undefined, 'row')}${tlsField(id + '-country', t(msgid('Country code')), { kind: 'input', name: 'country', maxlength: 2, dir: 'ltr' }, undefined, 'row')}${tlsField(id + '-email', t(msgid('Contact email')), { kind: 'input', type: 'email', name: 'email', maxlength: 200, dir: 'ltr' }, undefined, 'row')}${tlsField(id + '-passphrase', t(msgid('Challenge passphrase (optional)')), { kind: 'input', type: 'password', name: 'passphrase', maxlength: 64, dir: 'ltr', autocomplete: 'off' }, t(msgid('Some certificate authorities ask for it to revoke a certificate. It is written into the request and not stored anywhere else.')), 'row')}</div>`
    + `<div class="${TLS_ACTIONS}">${tlsButton(t(msgid('Generate key, certificate and CSR')), undefined, { primary: true, submit: canManage, icon: 'key' })}</div>`)
    + `<p class="${TLS_TEXT}">${escapeHtml(t(msgid('The new private key, self-signed certificate and signing request are saved in ~/ssl of the chosen account. Send the signing request to a certificate authority, then install the certificate it returns.')))}</p>`)
}
