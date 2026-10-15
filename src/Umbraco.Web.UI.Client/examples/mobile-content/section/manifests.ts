import { EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS, EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME } from '../constants.js';
import { EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS } from '../conditions/narrow-viewport/constants.js';
import { UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS } from '@umbraco-cms/backoffice/section';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'section',
		alias: EXAMPLE_MOBILE_CONTENT_SECTION_ALIAS,
		name: 'Mobile Content Section',
		// Above the Content section so a narrow viewport lands here first.
		weight: 1100,
		element: () => import('./mobile-content-section.element.js'),
		meta: {
			label: '#exampleMobileContent_sectionLabel',
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
