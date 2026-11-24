import { v2FileToolsCards } from '../operations/owner-tools.ts'
import type { SurfaceAuthority } from '../../../../../models/theme-surface.ts'
import { scopePrimaryPanelFacts } from '../home.ts'
import type { PanelSurfaceProps } from '../../../../contract.ts'
import type { Translate } from '../../../../../i18n.ts'
import { card } from '../../../components/card.ts'
import { notice } from '../../../components/notice.ts'
import { pageHeader } from '../../../components/page-header.ts'
import { escapeHtml, hookAttrs, type HookAttributes } from '../../../html.ts'
import { icon } from '../../../icons.ts'
import { fileGlyphs, fileNameCell, fileWorkspaceTemplates, filePresentation, trashGlyph } from './templates.ts'

export interface V2FilesPageProps {
  readonly surface: PanelSurfaceProps
  /** Core resolves account authorization and host capability before rendering. */
  readonly canManage: boolean
  readonly authority?: SurfaceAuthority
}

const technical = (text: string | number): string => `<bdi dir="ltr" class="v2-mono">${escapeHtml(text)}</bdi>`

/** Keenicons the v2 icon set lacks. Inside a button the button sizes the glyph. */
const GLYPH = {
  trash: '<i class="ki-filled ki-trash" aria-hidden="true"></i>',
  newFile: '<i class="ki-filled ki-add-files" aria-hidden="true"></i>',
  newFolder: '<i class="ki-filled ki-add-folder" aria-hidden="true"></i>',
  upload: '<i class="ki-filled ki-exit-up" aria-hidden="true"></i>',
  parent: '<i class="ki-filled ki-arrow-up" aria-hidden="true"></i>',
  move: '<i class="ki-filled ki-arrow-right-left" aria-hidden="true"></i>',
  extract: '<i class="ki-filled ki-folder-up" aria-hidden="true"></i>',
  save: '<i class="ki-filled ki-check" aria-hidden="true"></i>',
  close: '<i class="ki-filled ki-cross" aria-hidden="true"></i>',
} as const

// The button hierarchy of the file manager: Upload is the one primary action; the rest are outline, small in rows
// and in the selection strip, and soft red for the trash.
const BUTTON = {
  primary: 'v2-btn v2-btn--primary kt-btn kt-btn-primary',
  outline: 'v2-btn kt-btn kt-btn-outline',
  ghost: 'v2-btn v2-btn--ghost kt-btn kt-btn-ghost',
  danger: 'v2-btn v2-btn--soft-danger kt-btn kt-btn-outline kt-btn-destructive',
} as const

function button(label: string, hooks: HookAttributes, disabled = false, primary = false, look: { icon?: string; kind?: 'outline' | 'ghost' | 'danger'; small?: boolean } = {}): string {
  return `<button type="button" class="${primary ? BUTTON.primary : BUTTON[look.kind ?? 'outline']}"${hookAttrs(hooks)}${disabled ? ' disabled' : ''}>${look.icon ?? ''}${escapeHtml(label)}</button>`
}

function fileRows(t: Translate, props: V2FilesPageProps, trash: boolean): string {
  const files = props.surface.files?.filter(file => trash ? file.trashed === true : !file.trashed)
  if (!files?.length) {
    const message = files === undefined ? t('Directory contents have not been read.') : trash ? t('The trash is empty') : t('This directory is empty.')
    return `<tr><td colspan="7"><p role="status">${escapeHtml(message)}</p></td></tr>`
  }
  const label = (message: string): string => ` data-label="${escapeHtml(t(message))}"`
  return files.map(file => `<tr data-file-path="${escapeHtml(file.path)}"${trash ? '' : ` data-file-kind="${file.kind === 'folder' ? 'directory' : 'file'}"`}><td><label><input class="kt-checkbox kt-checkbox-sm" type="checkbox" disabled aria-label="${escapeHtml(file.name)}"></label></td><td>${fileNameCell(trash ? trashGlyph() : fileGlyphs(), `<span class="v2-file-name text-sm font-medium text-mono">${technical(file.name)}</span>`, `<span class="v2-file-path">${technical(file.path)}</span><span class="text-[0.8125rem] leading-[var(--lh-cap)] font-normal text-muted-foreground">${escapeHtml(t(file.kind === 'folder' ? msgctxt('files', 'Folder') : msgctxt('files', 'File')))}</span>`)}</td><td>${technical(`${file.sizeBytes} B`)}</td><td${label(trash ? msgctxt('xpanel', 'Deleted (UTC)') : msgctxt('xpanel', 'Modified (UTC)'))}>${trash ? escapeHtml(t('Not recorded')) : `<time datetime="${escapeHtml(file.modifiedAt)}">${technical(file.modifiedAt)}</time>`}</td><td${label('Permissions')}>${technical(file.modeOctal)}</td><td${label('Owner')}>${escapeHtml(t('Not read'))}</td><td><span class="text-[0.8125rem] leading-[var(--lh-cap)] text-muted-foreground">${escapeHtml(t('Refresh files'))}</span></td></tr>`).join('')
}

function fileTable(t: Translate, props: V2FilesPageProps, trash: boolean): string {
  const headers = [t('Select all'), t('Name'), t('Size'), t(trash ? msgctxt('xpanel', 'Deleted (UTC)') : msgctxt('xpanel', 'Modified (UTC)')), t('Permissions'), t('Owner'), t('Actions')]
  return `<div class="v2-table-scroll kt-scrollable-x-auto" role="region" tabindex="0" aria-label="${escapeHtml(t('Account files'))}" data-file-table-wrap><table class="v2-table kt-table align-middle" data-file-manager-table="true"><thead><tr>${headers.map((label, index) => `<th scope="col">${index === 0 ? `<label><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-file-select-all disabled aria-label="${escapeHtml(label)}"></label>` : escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${fileRows(t, props, trash)}</tbody></table></div>`
}

function editor(t: Translate, disabled: boolean): string {
  return card({ title: t(msgctxt('theme:v2', 'Text editor')), titleId: 'v2-file-editor-heading', bodyHtml: `<div data-in-browser-editor class="v2-file-editor"><div class="v2-field"><span class="v2-file-label kt-form-label">${escapeHtml(t('Selected file'))}</span><bdi dir="ltr" class="v2-mono text-sm font-medium text-mono" data-file-selected-path></bdi></div><div class="v2-field"><label class="kt-form-label" for="jailed-code-editor">${escapeHtml(t('File contents'))}</label><textarea id="jailed-code-editor" name="contents" class="v2-mono kt-textarea" rows="14" dir="ltr" data-editor-path="" spellcheck="false"${disabled ? ' disabled' : ''}></textarea></div><div class="v2-field"><label class="kt-form-label" for="jailed-editor-charset">${escapeHtml(t('Character set'))}</label><span class="v2-select"><select id="jailed-editor-charset" class="v2-mono kt-select rtl:ps-6 rtl:pe-3" dir="ltr" data-editor-charset${disabled ? ' disabled' : ''}>${['UTF-8', 'ISO-8859-1', 'US-ASCII'].map(value => `<option value="${value}">${value}</option>`).join('')}</select></span><label><input class="kt-checkbox kt-checkbox-sm" type="checkbox" data-editor-fallback disabled> ${escapeHtml(t('Keep UTF-8 if a character does not fit'))}</label><span class="v2-field__help kt-form-description">${escapeHtml(t('Choose the encoding the file uses before you edit it. A wrong choice can corrupt the text.'))}</span></div><div class="v2-file-actions justify-end">${button(t('Close editor'), { 'data-file-editor-close': true }, false, false, { kind: 'ghost', icon: GLYPH.close })}${button(t('Reload file'), { 'data-action': 'reload-file' }, true, false, { icon: icon('refresh', 16) })}${button(t('Save text'), { 'data-action': 'save-file' }, true, true, { icon: GLYPH.save })}</div><p class="v2-field__help kt-form-description">${escapeHtml(t('Your draft will be replaced only after the new file or directory is read successfully.'))}</p></div>` })
}

function permissionPolicy(t: Translate): string {
  // Permissions are changed per entry from its row or details; this card states the policy those changes follow.
  return card({ title: t('Permissions'), titleId: 'v2-file-permissions-heading', bodyHtml: `<p class="flex items-start gap-2 text-secondary-foreground"><i class="ki-filled ki-lock text-base text-muted-foreground" aria-hidden="true"></i><span>${escapeHtml(t('Maximum 0640 for files and 0750 for folders; world-writable modes are refused.'))}</span></p>` })
}

/** File bodies use the existing account file controller; core mounts the surrounding shell. */
export function renderV2FilesPage(t: Translate, props: V2FilesPageProps): string {
  const surface = scopePrimaryPanelFacts(props.surface, props.authority)
  props = { ...props, surface }
  const account = props.surface.account
  const trash = props.surface.activeRoute === '/files/trash'
  const title = t(trash ? msgctxt('xpanel-files', 'Trash') : 'File manager')
  const route = trash ? '/files/trash' : '/files/manager'
  const head = pageHeader(t, { breadcrumb: [{ label: t('Home'), href: '/home' }, { label: t('Files') }, { label: title }], route, title, description: t('Chroot enforced inside account home directory (0750 home, 0640 files, symlink traversal blocked).') })
  const disabled = !account || props.authority?.presentation === 'read-only' || !props.canManage
  const actions = `${button(t('Refresh files'), { 'data-action': 'refresh-files' }, disabled, false, { icon: icon('refresh', 16) })}${trash ? '' : `${button(t('New File'), { 'data-action': 'new-file' }, disabled, false, { icon: GLYPH.newFile })}${button(t('New Folder'), { 'data-action': 'new-folder' }, disabled, false, { icon: GLYPH.newFolder })}${button(t('Upload File'), { 'data-action': 'upload-file' }, disabled, true, { icon: GLYPH.upload })}<input type="file" data-file-upload hidden${disabled ? ' disabled' : ''}>`}${button(t('Empty trash'), { 'data-action': 'empty-trash' }, disabled, false, { icon: GLYPH.trash, kind: 'danger' })}`
  // The breadcrumb strip: the way up, then the home path and the folder open under it.
  const location = trash ? '' : `<nav class="v2-file-location" aria-label="${escapeHtml(t('Current directory'))}">${button(t('Parent folder'), { 'data-action': 'parent-directory' }, true, false, { icon: GLYPH.parent, small: true })}<span class="v2-file-crumbs">${icon('home', 16)}<bdi dir="ltr" class="v2-mono" data-file-home-path>${escapeHtml(account?.home ?? t('Not read'))}</bdi><span class="text-muted-foreground" aria-hidden="true">/</span><bdi dir="ltr" class="v2-mono font-medium text-mono" data-file-current-path></bdi></span></nav>`
  const TAB = 'kt-tab-toggle -mb-px aria-[current=page]:text-primary aria-[current=page]:border-b-primary'
  const views = `<nav class="v2-file-views kt-tabs kt-tabs-line border-b-0 self-stretch items-stretch" aria-label="${escapeHtml(t(msgctxt('theme:v2', 'File manager views')))}"><a class="${TAB}" href="/files/manager"${trash ? '' : ' aria-current="page"'}>${icon('folder', 16)}${escapeHtml(t('Files'))}</a><a class="${TAB}" href="/files/trash"${trash ? ' aria-current="page"' : ''}><i class="v2-icon ki-filled ki-trash text-base" aria-hidden="true"></i>${escapeHtml(t(msgctxt('xpanel-files', 'Trash')))}</a></nav>`
  const empty = trash ? `<div class="v2-file-trash-empty" data-trash-empty hidden><span class="flex items-center justify-center size-12 rounded-full border border-border bg-accent/60 text-muted-foreground" aria-hidden="true"><i class="ki-filled ki-trash text-2xl" aria-hidden="true"></i></span><h2 class="text-base font-semibold text-mono">${escapeHtml(t('The trash is empty'))}</h2><p class="text-secondary-foreground">${escapeHtml(t('Files you move to the trash stay here until you restore them or delete them for good.'))}</p></div>` : ''
  const tree = trash ? '' : card({ title: t('Folders'), titleId: 'v2-file-tree-heading', bodyHtml: `<ul class="v2-file-tree"><li>${icon('home', 16)}${technical(account?.home ?? t('Not read'))}<ul>${(props.surface.files ?? []).filter(file => file.kind === 'folder' && !file.trashed).map(file => `<li>${icon('folder', 16)}${technical(file.name)}</li>`).join('')}</ul></li></ul><p class="v2-field__help kt-form-description">${escapeHtml(t(msgctxt('theme:v2', 'Open a folder from the file list.')))}</p>` })
  // Copy, Move, Compress and Extract share the page's file-manager gate.
  const relocatable = !disabled && (props.authority === undefined || props.authority.qualifiedTools.has('file-manager'))
  const selectionGlyph = { copy: icon('copy', 14), move: GLYPH.move, compress: icon('archive', 14), extract: GLYPH.extract } as const
  const unsupported = trash ? '' : `<div class="v2-file-actions" aria-label="${escapeHtml(t(msgid('Selection actions')))}">${([['copy', 'Copy'], ['move', 'Move'], ['compress', 'Compress'], ['extract', 'Extract']] as const).map(([action, label]) => button(t(label), { 'data-file-selection-action': action, 'data-capability-unavailable': !relocatable }, true, false, { icon: selectionGlyph[action], small: true })).join('')}</div>`
  const fileTools = !trash && !disabled && account ? v2FileToolsCards(t, account.username) : ''
  const dropzone = trash || disabled ? '' : `<div class="v2-dropzone" data-file-dropzone role="button" tabindex="0" aria-label="${escapeHtml(t(msgid('Drop files here to upload into this folder')))}"><span class="flex items-center justify-center size-12 rounded-full border border-border bg-background text-primary" aria-hidden="true"><i class="ki-filled ki-cloud-add text-2xl" aria-hidden="true"></i></span><span class="v2-dropzone__title font-medium text-mono">${escapeHtml(t(msgid('Drop files here to upload into this folder')))}</span><span class="v2-dropzone__hint text-[0.8125rem] leading-[var(--lh-cap)] text-muted-foreground">${escapeHtml(t('Files up to 2 MiB. The upload stays inside this account.'))}</span></div>`
  const controls = `<div class="v2-file-controls v2-card kt-card"><div class="${trash ? 'v2-card__head kt-card-header flex-wrap gap-x-6 gap-y-2 border-b-0' : 'v2-card__head kt-card-header flex-wrap gap-x-6 gap-y-2'}">${views}<div class="v2-file-toolbar kt-card-toolbar flex-wrap">${actions}</div></div><div class="v2-file-controls__body v2-card__body kt-card-content">${disabled ? notice(t, { tone: 'warn', text: t('File operations are unavailable.') }) : ''}${location || unsupported ? `<div class="v2-file-strip">${location}${unsupported}</div>` : ''}<p data-file-status role="status" aria-live="polite" hidden></p><progress data-file-archive-progress aria-label="${escapeHtml(t(msgid('Archive in progress')))}" hidden></progress>${trash ? '' : `<p class="v2-field__help kt-form-description">${escapeHtml(t('Files up to 2 MiB. The upload stays inside this account.'))}</p>`}</div></div>`
  const list = card({ title: title, titleId: 'v2-file-list-heading', flush: true, actionsHtml: filePresentation(t, 'controls'), bodyHtml: `${fileTable(t, props, trash)}${filePresentation(t, 'no-matches')}${empty}` })
  return `${head}<div class="v2-files" data-file-manager="${trash ? 'trash' : 'browse'}" data-section="jailed-file-manager" ${account ? `data-account-username="${escapeHtml(account.username)}" data-account-home="${escapeHtml(account.home)}"` : ''}${disabled ? ' data-read-only="true"' : ''}>${controls}${trash ? '' : `<details class="v2-file-tree-disclosure"><summary class="v2-btn kt-btn kt-btn-outline">${icon('folder', 14)}${escapeHtml(t('Folders'))}${icon('chevDown', 14)}</summary>${tree}</details>`}<div class="v2-file-browser">${list}</div>${trash ? filePresentation(t, 'details') : `<div class="v2-file-details"><div>${dropzone}${filePresentation(t, 'closed')}<div data-file-editor-panel hidden>${editor(t, disabled)}</div></div><div class="v2-file-side">${filePresentation(t, 'details')}<div class="v2-file-side__stack">${permissionPolicy(t)}${filePresentation(t, 'uploads')}</div></div></div>`}${fileWorkspaceTemplates(t, trash)}</div>${fileTools}`
}

export { renderV2DirectoryPrivacyPage, type V2DirectoryPrivacyPageProps } from './privacy.ts'
export { V2_FILES_CSS } from './styles.ts'
