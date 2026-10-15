export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'backofficeEntryPoint',
		alias: 'Example.EntryPoint.MobileShell',
		name: 'Mobile Shell Entry Point',
		js: () => import('./mobile-shell.entry-point.js'),
	},
];
