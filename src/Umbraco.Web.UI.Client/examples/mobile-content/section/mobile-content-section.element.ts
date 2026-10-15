import { EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX } from '../constants.js';
import { ExampleMobileContentBrowseElement } from '../browse/browse.element.js';
import { EXAMPLE_MOBILE_CONTENT_BROWSE_PATHNAME, getBrowsePath } from './paths.js';
import { ExampleMobileContentNavigationContext } from './navigation.context.js';
import { aliasToPath } from '@umbraco-cms/backoffice/utils';
import { css, customElement, html, nothing, state } from '@umbraco-cms/backoffice/external/lit';
import {
	createExtensionApi,
	createExtensionElement,
	UmbExtensionsManifestInitializer,
} from '@umbraco-cms/backoffice/extension-api';
import { umbExtensionsRegistry } from '@umbraco-cms/backoffice/extension-registry';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import type { ManifestSection, ManifestSectionRoute, UmbSectionElement } from '@umbraco-cms/backoffice/section';
import type {
	IRoute,
	IRoutingInfo,
	PageComponent,
	UmbRoute,
	UmbRouterSlotChangeEvent,
} from '@umbraco-cms/backoffice/router';

/**
 * Section element with a single-column layout: a drill-down list of documents and, on the same router,
 * every registered section route (which is how the regular document workspace is reached).
 */
@customElement('example-mobile-content-section')
export class ExampleMobileContentSectionElement extends UmbLitElement implements UmbSectionElement {
	public manifest?: ManifestSection;

	@state()
	private _routes?: Array<UmbRoute>;

	@state()
	private _activePath?: string;

	@state()
	private _parentUnique: string | null = null;

	#navigation = new ExampleMobileContentNavigationContext(this);

	constructor() {
		super();
		this.observe(this.#navigation.parentUnique, (unique) => (this._parentUnique = unique), null);
		this.#observeRoutes();
	}

	#observeRoutes() {
		new UmbExtensionsManifestInitializer<ManifestSectionRoute, 'sectionRoute', ManifestSectionRoute>(
			this,
			umbExtensionsRegistry,
			'sectionRoute',
			null,
			async (extensions) => {
				const routes = await Promise.all(
					extensions
						.filter((extension) => extension.manifest.element)
						.map(async (extension) => {
							const manifest = extension.manifest;
							const api = await createExtensionApi(this, manifest);
							if (api) {
								(api as { manifest?: ManifestSectionRoute }).manifest = manifest;
							}
							return {
								path: api?.getPath?.() || manifest.meta?.path || aliasToPath(manifest.alias),
								component: () => createExtensionElement(manifest),
								setup: (element: PageComponent, info: IRoutingInfo) => {
									api?.setup?.(element, info);
								},
							} satisfies IRoute;
						}),
				);

				this._routes = [
					...routes,
					{
						path: `${EXAMPLE_MOBILE_CONTENT_BROWSE_PATHNAME}/:unique`,
						component: ExampleMobileContentBrowseElement,
						setup: (component: PageComponent, info: IRoutingInfo) => {
							(component as ExampleMobileContentBrowseElement).parentUnique = info.match.params.unique;
						},
					},
					{
						path: '**',
						component: ExampleMobileContentBrowseElement,
						setup: (component: PageComponent) => {
							(component as ExampleMobileContentBrowseElement).parentUnique = null;
						},
					},
				];
			},
			'exampleMobileContentSectionRoutes',
		);
	}

	#onRouteChange = (event: UmbRouterSlotChangeEvent) => {
		this._activePath = event.target.localActiveViewPath;
	};

	#isBrowsing(): boolean {
		return !this._activePath || this._activePath.startsWith(EXAMPLE_MOBILE_CONTENT_BROWSE_PATHNAME);
	}

	override render() {
		return html`
			${this.#isBrowsing()
				? nothing
				: html`<div id="bar">
						<uui-button
							compact
							href=${getBrowsePath(this._parentUnique)}
							label=${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_back`)}></uui-button>
					</div>`}
			${this._routes
				? html`<umb-router-slot
						id="router-slot"
						.routes=${this._routes}
						@change=${this.#onRouteChange}></umb-router-slot>`
				: nothing}
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: flex;
				flex-direction: column;
				height: 100%;
				width: 100%;
				overflow: hidden;
			}

			#bar {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				min-height: 44px;
				padding: 0 var(--uui-size-space-2);
				background: var(--uui-color-surface);
				border-bottom: 1px solid var(--uui-color-border);
			}

			#router-slot {
				flex: 1 1 auto;
				min-height: 0;
				display: block;
				overflow: hidden;
			}
		`,
	];
}

export { ExampleMobileContentSectionElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'example-mobile-content-section': ExampleMobileContentSectionElement;
	}
}
