// Row actions are small Metronic buttons: outline for the neutral ones, the soft destructive for remove and force.
const BUTTON = 'v2-btn kt-btn kt-btn-sm kt-btn-outline'
const BUTTON_DANGER = 'v2-btn kt-btn kt-btn-sm kt-btn-outline kt-btn-destructive'
const DANGER = new Set(['remove', 'force'])

/** V2 presentation for authenticated operations refreshes. */
export function v2OpsClientTemplates(family: 'shares' | 'nodes' | 'integrations'): string {
  const template = (name: string, body: string) => `<template data-xp-template="ops-${name}">${body}</template>`
  const value = (name: string, technical = false) => `<td><${technical ? 'bdi dir="ltr" class="v2-mono"' : 'span'} data-xp-slot="${name}"></${technical ? 'bdi' : 'span'}></td>`
  const button = (name: string) => `<button type="button" class="${DANGER.has(name) ? BUTTON_DANGER : BUTTON}" data-xp-action="${name}" disabled hidden><span data-xp-slot="${name}-label"></span></button>`
  const actions = (...names: string[]) => `<td><div class="v2-admin-actions flex flex-wrap items-center gap-2.5">${names.map(button).join('')}</div></td>`
  const empty = (name: string, columns: number) => template(name + '-empty', `<tr><td colspan="${columns}" data-xp-slot="message"></td></tr>`)
  if (family === 'shares') return template('share-row', `<tr>${value('path', true)}${value('clients')}${value('state')}${actions('remove')}</tr>`) + empty('share', 4) + template('share-foreign', '<li><bdi dir="ltr" class="v2-mono" data-xp-slot="path"></bdi></li>')
  if (family === 'nodes') return template('node-row', `<tr>${value('label')}${value('hostname', true)}${value('role')}${value('version', true)}${value('enrollment')}${actions('verify', 'repin', 'remove', 'force')}</tr>`) + empty('node', 6)
  return template('endpoint-row', `<tr>${value('url', true)}${value('events', true)}${value('secret')}${value('active')}${actions('test', 'remove')}</tr>`) + empty('endpoint', 5)
    + template('delivery-row', `<tr>${value('reference')}${value('event', true)}${value('state')}${value('attempts', true)}${value('status', true)}</tr>`) + empty('delivery', 5)
    + template('event', '<label class="v2-admin-check flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" class="kt-checkbox kt-checkbox-sm" data-xp-action="select" disabled><bdi dir="ltr" class="v2-mono" data-xp-slot="event"></bdi></label>')
}
