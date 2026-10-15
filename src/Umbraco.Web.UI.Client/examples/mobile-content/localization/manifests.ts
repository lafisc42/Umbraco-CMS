export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'localization',
		alias: 'Example.Localization.MobileContent.En',
		name: 'Mobile Content Localization (en)',
		js: () => import('./en.js'),
		meta: {
			culture: 'en',
		},
	},
	{
		type: 'localization',
		alias: 'Example.Localization.MobileContent.De',
		name: 'Mobile Content Localization (de)',
		js: () => import('./de.js'),
		meta: {
			culture: 'de',
		},
	},
];
