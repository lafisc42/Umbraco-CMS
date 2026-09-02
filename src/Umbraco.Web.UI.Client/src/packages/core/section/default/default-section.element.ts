import type { ManifestSection, UmbSectionElement } from '../types.js';
import type { ManifestSectionRoute } from '../extensions/section-route.extension.js';
import UmbSectionMainViewElement from '../section-main-views/section-main-views.element.js';
import { UMB_BACKOFFICE_CONTEXT } from '../../../../apps/backoffice/backoffice.context.js';
import type { UmbBackofficeContext } from '../../../../apps/backoffice/backoffice.context.js';
import { aliasToPath } from '@umbraco-cms/backoffice/utils';
import {
	css,
	customElement,
	html,
	nothing,
	repeat,
	state,
	type PropertyValues,
} from '@umbraco-cms/backoffice/external/lit';
import {
	createExtensionApi,
	createExtensionElement,
	UmbExtensionsElementInitializer,
	UmbExtensionsManifestInitializer,
} from '@umbraco-cms/backoffice/extension-api';
import { umbExtensionsRegistry } from '@umbraco-cms/backoffice/extension-registry';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_MARK_ATTRIBUTE_NAME } from '@umbraco-cms/backoffice/const';
import type { IRoute, IRoutingInfo, PageComponent, UmbRoute } from '@umbraco-cms/backoffice/router';
import type { UmbExtensionElementInitializer } from '@umbraco-cms/backoffice/extension-api';

/**
 * @class UmbBaseSectionElement
 * @description - Element hosting sections and section navigation.
 */
@customElement('umb-section-default')
export class UmbDefaultSectionElement extends UmbLitElement implements UmbSectionElement {
	public manifest?: ManifestSection;

	@state()
	private _routes?: Array<UmbRoute>;

	@state()
	private _sidebarApps?: Array<UmbExtensionElementInitializer<any>>;

	@state()
	private _splitPanelPosition = '300px';

	@state()
	private _isCompactLayout = false;

	@state()
	private _sidebarDrawerOpen = false;

	#backofficeContext?: UmbBackofficeContext;
	#compactLayoutQuery = window.matchMedia('(max-width: 800px)');

	#onCompactLayoutChange = (event: MediaQueryListEvent) => {
		this._isCompactLayout = event.matches;
		if (!event.matches) {
			this.#backofficeContext?.closeSectionSidebarDrawer();
		}
	};

	#onSidebarDrawerClick = (event: Event) => {
		const followsLink = event
			.composedPath()
			.some((target) => target instanceof HTMLAnchorElement && target.hasAttribute('href'));
		if (followsLink) {
			this.#backofficeContext?.closeSectionSidebarDrawer();
		}
	};

	#onSidebarDrawerKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			this.#backofficeContext?.closeSectionSidebarDrawer();
		}
	};

	#onSidebarDrawerBackdropClick = () => {
		this.#backofficeContext?.closeSectionSidebarDrawer();
	};

	constructor() {
		super();

		this._isCompactLayout = this.#compactLayoutQuery.matches;

		this.consumeContext(UMB_BACKOFFICE_CONTEXT, (backofficeContext) => {
			this.#backofficeContext = backofficeContext;
			this.observe(
				backofficeContext?.sectionSidebarDrawerOpen,
				(open) => {
					this._sidebarDrawerOpen = open ?? false;
				},
				'observeSectionSidebarDrawerOpen',
			);
		});

		new UmbExtensionsElementInitializer(this, umbExtensionsRegistry, 'sectionSidebarApp', null, (sidebarApps) => {
			const oldValue = this._sidebarApps;
			sidebarApps.forEach((sidebarApp) => {
				sidebarApp.component?.setAttribute(UMB_MARK_ATTRIBUTE_NAME, 'section-sidebar:' + sidebarApp.manifest.alias);
			});
			this._sidebarApps = sidebarApps;
			this.requestUpdate('_sidebarApps', oldValue);
		});

		this.#observeRoutes();

		const splitPanelPosition = localStorage.getItem('umb-split-panel-position');
		if (splitPanelPosition) {
			this._splitPanelPosition = splitPanelPosition;
		}
	}

	#observeRoutes(): void {
		new UmbExtensionsManifestInitializer<ManifestSectionRoute, 'sectionRoute', ManifestSectionRoute>(
			this,
			umbExtensionsRegistry,
			'sectionRoute',
			null,
			async (sectionRouteExtensions) => {
				// TODO: we only support extensions with an element prop
				const extensionsWithElement = sectionRouteExtensions.filter((extension) => extension.manifest.element);
				const extensionsWithoutElement = sectionRouteExtensions.filter((extension) => !extension.manifest.element);
				if (extensionsWithoutElement.length > 0) {
					throw new Error('sectionRoute extensions must have an element');
				}

				const routes: Array<IRoute> = await Promise.all(
					extensionsWithElement.map(async (extensionController) => {
						const api = await createExtensionApi(this, extensionController.manifest);

						if (api) {
							(api as any).manifest = extensionController.manifest;
						}

						return {
							path:
								api?.getPath?.() ||
								extensionController.manifest.meta?.path ||
								aliasToPath(extensionController.manifest.alias),
							component: () => createExtensionElement(extensionController.manifest),
							setup: (element: PageComponent, info: IRoutingInfo) => {
								api?.setup?.(element, info);
							},
						};
					}),
				);

				this.#createRoutes(routes);
			},
			'umbRouteExtensionApisInitializer',
		);
	}

	#createRoutes(routes: Array<IRoute>) {
		this._routes = [
			...routes,
			{
				path: '**',
				component: UmbSectionMainViewElement,
				setup: (element) => {
					(element as UmbSectionMainViewElement).sectionAlias = this.manifest?.alias;
				},
			},
		];
	}

	#onSplitPanelChange(event: CustomEvent) {
		const position = event.detail.position;
		localStorage.setItem('umb-split-panel-position', position.toString());
	}

	override connectedCallback() {
		super.connectedCallback();
		this.#compactLayoutQuery.addEventListener('change', this.#onCompactLayoutChange);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.#compactLayoutQuery.removeEventListener('change', this.#onCompactLayoutChange);
		document.removeEventListener('keydown', this.#onSidebarDrawerKeydown);
	}

	protected override updated(changedProperties: PropertyValues): void {
		super.updated(changedProperties);
		if (!changedProperties.has('_sidebarDrawerOpen')) return;

		if (this._sidebarDrawerOpen) {
			document.addEventListener('keydown', this.#onSidebarDrawerKeydown);
			// The drawer leaves its inert/hidden state in this same update; focus only lands once that has been applied.
			requestAnimationFrame(() => this.shadowRoot?.querySelector<HTMLElement>('#sidebar-drawer')?.focus());
		} else {
			document.removeEventListener('keydown', this.#onSidebarDrawerKeydown);
		}
	}

	override render() {
		const hasSidebarApps = !!this._sidebarApps && this._sidebarApps.length > 0;
		return html`
			<umb-split-panel
				lock="start"
				snap="300px"
				@position-changed=${this.#onSplitPanelChange}
				.position=${this._splitPanelPosition}>
				${hasSidebarApps && !this._isCompactLayout
					? html`
							<!-- TODO: these extensions should be combined into one type: sectionSidebarApp with a "subtype" -->
							<umb-section-sidebar slot="start">${this.#renderSidebarApps()}</umb-section-sidebar>
						`
					: nothing}
				<umb-section-main slot="end">
					${this._routes && this._routes.length > 0
						? html`<umb-router-slot id="router-slot" .routes=${this._routes}></umb-router-slot>`
						: nothing}
					<slot></slot>
				</umb-section-main>
			</umb-split-panel>
			${hasSidebarApps && this._isCompactLayout ? this.#renderSidebarDrawer() : nothing}
		`;
	}

	#renderSidebarApps() {
		return repeat(
			this._sidebarApps!,
			(app) => app.alias,
			(app) => app.component,
		);
	}

	#renderSidebarDrawer() {
		return html`
			${this._sidebarDrawerOpen
				? html`<div id="sidebar-drawer-backdrop" @click=${this.#onSidebarDrawerBackdropClick}></div>`
				: nothing}
			<umb-section-sidebar
				id="sidebar-drawer"
				tabindex="-1"
				?open=${this._sidebarDrawerOpen}
				?inert=${!this._sidebarDrawerOpen}
				@click=${this.#onSidebarDrawerClick}>
				${this.#renderSidebarApps()}
			</umb-section-sidebar>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				flex: 1 1 auto;
				height: 100%;
				display: flex;
				position: relative;
			}

			#sidebar-drawer-backdrop {
				position: absolute;
				inset: 0;
				z-index: 20;
				background-color: var(--uui-modal-color-backdrop, rgba(0, 0, 0, 0.5));
			}

			#sidebar-drawer {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				height: auto;
				width: min(var(--umb-section-sidebar-width), 85vw);
				z-index: 21;
				box-shadow: var(--uui-shadow-depth-3);
				transform: translateX(-100%);
				visibility: hidden;
				transition:
					transform 160ms ease-out,
					visibility 0s 160ms;
			}

			#sidebar-drawer[open] {
				transform: none;
				visibility: visible;
				transition:
					transform 160ms ease-out,
					visibility 0s;
			}

			@media (prefers-reduced-motion: reduce) {
				#sidebar-drawer {
					transition: none;
				}
			}

			umb-split-panel {
				--umb-split-panel-start-min-width: 200px;
				--umb-split-panel-start-max-width: 400px;
				--umb-split-panel-end-min-width: 600px;
				--umb-split-panel-slot-overflow: visible;
			}
			@media only screen and (min-width: 800px) {
				umb-split-panel {
					--umb-split-panel-initial-position: 300px;
				}
			}
			@media only screen and (max-width: 800px) {
				umb-split-panel {
					--umb-split-panel-start-min-width: 0px;
					--umb-split-panel-end-min-width: 0px;
				}
			}
		`,
	];
}

export { UmbDefaultSectionElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'umb-section-default': UmbDefaultSectionElement;
	}
}
