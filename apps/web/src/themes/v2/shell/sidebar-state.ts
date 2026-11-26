// Restores the saved desktop sidebar state before the first paint. Core owns the <html> attributes the server
// renders, so this synchronous same-origin head script copies the stored choice onto the root element and the shell
// CSS keys off it; the workspace runtime keeps the root attribute and the shell attribute in sync afterwards.

import { pageScript, pageScriptTag } from '../../../page-scripts.ts'

export const SIDEBAR_STORAGE_KEY = 'xpanel.sidebar.collapsed'

export const V2_SIDEBAR_STATE_SCRIPT = pageScript('v2-sidebar-state', `(function(){try{if(window.localStorage&&localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='1')document.documentElement.setAttribute('data-sidebar-collapsed','true')}catch(_error){}})();
`)

export const v2SidebarStateScriptTag = (): string => pageScriptTag(V2_SIDEBAR_STATE_SCRIPT, 'xpanel-v2-sidebar-state')
