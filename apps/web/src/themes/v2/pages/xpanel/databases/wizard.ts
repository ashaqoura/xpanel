import { DB_PRIVILEGES } from '@xpanel/core'
import { escapeHtml } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { dbButton, dbCard, dbField, dbGlyph, technical, type DatabasePageProps } from './common.ts'

/** Database Wizard and PostgreSQL Database Wizard; whm-db-tools-client.ts drives the steps. */
export function renderV2DbWizard(props: DatabasePageProps, t: (message: string) => string, input: { engine: 'mariadb' | 'postgresql'; username: string; canManage: boolean }): string {
  const tool = input.engine === 'postgresql' ? 'postgresql-database-wizard' : 'database-wizard'
  const verified = input.canManage && props.catalog?.some(row => row.id === tool && row.status === 'verified' && row.delivery.status === 'verified') === true
  const prefix = technical(input.username + '_'), check = (attrs: string, label: string): string => `<label class="v2-db-check"><input class="kt-checkbox kt-checkbox-sm" type="checkbox" ${attrs} disabled> <span>${label}</span></label>`
  const access = input.engine === 'postgresql' ? `<p class="v2-db-notes">${escapeHtml(t(msgid('The user becomes the owner of the database and gets all access to it.')))}</p>`
    : check('data-db-wizard-all', escapeHtml(t(msgid('All privileges')))) + `<div class="v2-db-options">${DB_PRIVILEGES.map(right => check(`value="${right}" data-db-wizard-privilege`, technical(right))).join('')}</div>`
  return dbCard(input.engine === 'postgresql' ? 'pg-wizard' : 'wizard', t(input.engine === 'postgresql' ? msgid('PostgreSQL Database Wizard') : msgid('Database Wizard')),
    `<div data-db-wizard data-engine="${input.engine}" data-username="${escapeHtml(input.username)}" data-can-manage="${verified}">
<div data-db-wizard-step="1">${dbField('v2-db-wizard-name', t(msgid('Step 1: Database name')), `<input class="kt-input" id="v2-db-wizard-name" dir="ltr" maxlength="64" autocomplete="off" data-db-wizard-name disabled><p class="v2-field__help kt-form-description">${prefix}</p>`)}</div>
<div data-db-wizard-step="2" hidden>${dbField('v2-db-wizard-user', t(msgid('Step 2: User name')), `<input class="kt-input" id="v2-db-wizard-user" dir="ltr" maxlength="32" autocomplete="off" data-db-wizard-user disabled><p class="v2-field__help kt-form-description">${prefix}</p>`)}${dbField('v2-db-wizard-password', t(msgid('Password')), '<input class="kt-input" id="v2-db-wizard-password" type="password" dir="ltr" maxlength="128" autocomplete="new-password" spellcheck="false" data-db-wizard-password disabled>')}${dbButton(t(msgid('Generate password')), { 'data-db-wizard-generate': true }, { disabled: true, icon: dbGlyph.key, small: true })}</div>
<div data-db-wizard-step="3" hidden><p class="font-medium text-mono">${escapeHtml(t(msgid('Step 3: Access')))}</p>${access}</div>
<div data-db-wizard-step="4" hidden><p class="text-foreground" data-db-wizard-summary></p><div class="v2-db-actions">${dbButton(t(msgid('Add another database')), { 'data-db-wizard-again': true }, { icon: icon('plus', 16) })}${dbButton(t(msgid('Add another user')), { 'data-db-wizard-another-user': true }, { icon: icon('plus', 16) })}</div></div>
<div class="v2-db-actions justify-end">${dbButton(t(msgid('Back')), { 'data-db-wizard-back': true }, { disabled: true, kind: 'ghost' })}${dbButton(t(msgid('Next')), { 'data-db-wizard-next': true }, { primary: true, disabled: true })}</div>
<p class="v2-db-notes" data-db-wizard-status data-state="idle" role="status"></p></div>`)
}
