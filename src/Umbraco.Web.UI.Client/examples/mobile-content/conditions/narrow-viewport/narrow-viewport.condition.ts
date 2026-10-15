import { EXAMPLE_MOBILE_CONTENT_BREAKPOINT } from '../../constants.js';
import type { ExampleNarrowViewportConditionConfig } from './types.js';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbConditionControllerArguments, UmbExtensionCondition } from '@umbraco-cms/backoffice/extension-api';

export class ExampleNarrowViewportCondition
	extends UmbConditionBase<ExampleNarrowViewportConditionConfig>
	implements UmbExtensionCondition
{
	#mediaQuery: MediaQueryList;

	constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<ExampleNarrowViewportConditionConfig>) {
		super(host, args);
		const maxWidth = this.config.maxWidth ?? EXAMPLE_MOBILE_CONTENT_BREAKPOINT;
		this.#mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
		this.#mediaQuery.addEventListener('change', this.#onChange);
		this.permitted = this.#mediaQuery.matches;
	}

	#onChange = (event: MediaQueryListEvent) => {
		this.permitted = event.matches;
	};

	override destroy() {
		this.#mediaQuery.removeEventListener('change', this.#onChange);
		super.destroy();
	}
}

export { ExampleNarrowViewportCondition as api };
