import { EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS } from './constants.js';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'condition',
		alias: EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS,
		name: 'Narrow Viewport Condition',
		api: () => import('./narrow-viewport.condition.js'),
	},
];
