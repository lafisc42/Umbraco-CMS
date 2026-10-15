import { manifests as conditionManifests } from './conditions/narrow-viewport/manifests.js';
import { manifests as localizationManifests } from './localization/manifests.js';
import { manifests as sectionManifests } from './section/manifests.js';
import { manifests as shellManifests } from './shell/manifests.js';

export const manifests: Array<UmbExtensionManifest> = [
	...conditionManifests,
	...localizationManifests,
	...sectionManifests,
	...shellManifests,
];
