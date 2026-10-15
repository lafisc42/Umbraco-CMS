import type { EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS } from './constants.js';
import type { UmbConditionConfigBase } from '@umbraco-cms/backoffice/extension-api';

export interface ExampleNarrowViewportConditionConfig extends UmbConditionConfigBase<
	typeof EXAMPLE_NARROW_VIEWPORT_CONDITION_ALIAS
> {
	/**
	 * Permits the extension while the viewport is at most this wide, in CSS pixels.
	 * @example 800
	 */
	maxWidth?: number;
}

declare global {
	interface UmbExtensionConditionConfigMap {
		ExampleNarrowViewportConditionConfig: ExampleNarrowViewportConditionConfig;
	}
}
