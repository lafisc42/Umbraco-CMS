import { EXAMPLE_MOBILE_CONTENT_BREAKPOINT } from '../constants.js';
import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';

/*
 * Three footer buttons do not fit a phone-width workspace, so the least essential one is left out.
 * Exclusion is permanent for the session; it is decided once, at startup, from the viewport width.
 */
const EXCLUDED_ON_NARROW_VIEWPORTS = ['Umb.WorkspaceAction.Document.SaveAndPreview'];

/*
 * The app shell pins a desktop minimum width inside its own shadow root, out of reach for themes and
 * package stylesheets. This entry point adopts one more stylesheet into that shadow root so the shell
 * can shrink below the breakpoint. It depends on the shell's element name and internal ids, which are
 * not part of the extension contract and may change between releases.
 */
const SHELL_ELEMENT_NAME = 'umb-app';

const shellStyles = new CSSStyleSheet();
shellStyles.replaceSync(`
	@media (max-width: ${EXAMPLE_MOBILE_CONTENT_BREAKPOINT}px) {
		:host {
			min-width: 0;
		}
		:host,
		#router-slot {
			height: 100dvh;
		}
	}
`);

/**
 * @returns {ShadowRoot | undefined} The shadow root of the app shell, if it is in the document.
 */
function getShellShadowRoot(): ShadowRoot | undefined {
	return document.querySelector(SHELL_ELEMENT_NAME)?.shadowRoot ?? undefined;
}

export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
	if (window.matchMedia(`(max-width: ${EXAMPLE_MOBILE_CONTENT_BREAKPOINT}px)`).matches) {
		EXCLUDED_ON_NARROW_VIEWPORTS.forEach((alias) => extensionRegistry.exclude(alias));
	}

	const shadowRoot = getShellShadowRoot();
	if (!shadowRoot || shadowRoot.adoptedStyleSheets.includes(shellStyles)) return;
	shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, shellStyles];
};

export const onUnload: UmbEntryPointOnUnload = () => {
	const shadowRoot = getShellShadowRoot();
	if (!shadowRoot) return;
	shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.filter((sheet) => sheet !== shellStyles);
};
