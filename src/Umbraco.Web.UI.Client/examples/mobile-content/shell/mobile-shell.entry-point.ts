import {
	EXAMPLE_CONTENT_SECTION_PATHNAME,
	EXAMPLE_MOBILE_CONTENT_BREAKPOINT,
	EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS,
	EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME,
} from '../constants.js';
import { UMB_CURRENT_USER_CONTEXT } from '@umbraco-cms/backoffice/current-user';
import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';

const narrowViewport = window.matchMedia(`(max-width: ${EXAMPLE_MOBILE_CONTENT_BREAKPOINT}px)`);

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

/*
 * The mobile section stands in for the Content section, but under its own pathname: the router keeps
 * the rendered section element while the path stays the same, so the two cannot share one. Instead,
 * every URL below `section/content` is rewritten to the mobile section while it applies, and back
 * again when it does not. This also catches core actions that navigate to the Content section.
 */
let mobileSectionAllowed = false;

/**
 *
 */
function syncLocation() {
	const useMobile = mobileSectionAllowed && narrowViewport.matches;
	const from = useMobile ? EXAMPLE_CONTENT_SECTION_PATHNAME : EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME;
	const to = useMobile ? EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME : EXAMPLE_CONTENT_SECTION_PATHNAME;
	const pattern = new RegExp(`/section/${from}(?=/|$)`);
	if (!pattern.test(location.pathname)) return;
	const path = location.pathname.replace(pattern, `/section/${to}`);
	history.replaceState(null, '', path + location.search + location.hash);
}

export const onInit: UmbEntryPointOnInit = (host, extensionRegistry) => {
	if (narrowViewport.matches) {
		EXCLUDED_ON_NARROW_VIEWPORTS.forEach((alias) => extensionRegistry.exclude(alias));
	}

	const shadowRoot = getShellShadowRoot();
	if (shadowRoot && !shadowRoot.adoptedStyleSheets.includes(shellStyles)) {
		shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, shellStyles];
	}

	host.consumeContext(UMB_CURRENT_USER_CONTEXT, (context) => {
		host.observe(
			context?.allowedSections,
			(allowedSections) => {
				mobileSectionAllowed = allowedSections?.includes(EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS) ?? false;
				syncLocation();
			},
			'exampleMobileContentAllowedSections',
		);
	});
	narrowViewport.addEventListener('change', syncLocation);
	window.addEventListener('changestate', syncLocation);
};

export const onUnload: UmbEntryPointOnUnload = () => {
	narrowViewport.removeEventListener('change', syncLocation);
	window.removeEventListener('changestate', syncLocation);
	const shadowRoot = getShellShadowRoot();
	if (!shadowRoot) return;
	shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.filter((sheet) => sheet !== shellStyles);
};
