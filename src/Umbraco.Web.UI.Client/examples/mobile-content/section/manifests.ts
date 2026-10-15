import { EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS, EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME } from '../constants.js';
import { EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS } from '../conditions/narrow-viewport/constants.js';
import { UMB_CONTENT_SECTION_ALIAS } from '@umbraco-cms/backoffice/content';
import { UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS } from '@umbraco-cms/backoffice/section';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'section',
		alias: EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS,
		name: 'Mobile Content Section',
		weight: 1000,
		// Takes the place of the Content section while the viewport is narrow.
		overwrites: UMB_CONTENT_SECTION_ALIAS,
		element: () => import('./mobile-content-section.element.js'),
		meta: {
			label: '#sections_content',
			pathname: EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME,
		},
		conditions: [
			{
				alias: UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS,
				match: EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS,
			},
			{
				alias: EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS,
			},
		],
	},
];
