import { UMB_SECTION_PATH_PATTERN } from '@umbraco-cms/backoffice/section';

export const EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS = 'Example.Section.MobileContent';

export const EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME = 'mobile-content';

/**
 * Pathname of the core Content section, which the mobile section stands in for on narrow viewports.
 */
export const EXAMPLE_CONTENT_SECTION_PATHNAME = 'content';
export const EXAMPLE_MOBILE_CONTENT_SECTION_PATH = UMB_SECTION_PATH_PATTERN.generateAbsolute({
	sectionName: EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME,
});

/**
 * Viewport width (CSS px) up to which the mobile section is offered and the shell floor is lifted.
 * Matches the breakpoint the core section layout already uses for its split panel.
 */
export const EXAMPLE_MOBILE_CONTENT_BREAKPOINT = 800;

/**
 * Prefix of the localization keys this package registers at runtime.
 */
export const EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX = 'exampleMobileContent';
