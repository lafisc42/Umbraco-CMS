import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbStringState } from '@umbraco-cms/backoffice/observable-api';

/**
 * Remembers the last browsed parent so the workspace can offer a way back into the list.
 */
export class ExampleMobileContentNavigationContext extends UmbContextBase {
	#parentUnique = new UmbStringState<string | null>(null);
	public readonly parentUnique = this.#parentUnique.asObservable();

	constructor(host: UmbControllerHost) {
		super(host, EXAMPLE_MOBILE_CONTENT_NAVIGATION_CONTEXT);
	}

	setParentUnique(unique: string | null) {
		this.#parentUnique.setValue(unique);
	}

	getParentUnique(): string | null {
		return this.#parentUnique.getValue();
	}
}

export const EXAMPLE_MOBILE_CONTENT_NAVIGATION_CONTEXT = new UmbContextToken<ExampleMobileContentNavigationContext>(
	'ExampleMobileContentNavigationContext',
);
