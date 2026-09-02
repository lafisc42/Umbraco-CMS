import { UMB_BACKOFFICE_CONTEXT } from '../backoffice.context.js';
import type { UmbBackofficeContext } from '../backoffice.context.js';
import { css, html, customElement, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('umb-backoffice-header')
export class UmbBackofficeHeaderElement extends UmbLitElement {
	@state()
	private _sidebarDrawerOpen = false;

	#backofficeContext?: UmbBackofficeContext;

	constructor() {
		super();

		this.consumeContext(UMB_BACKOFFICE_CONTEXT, (backofficeContext) => {
			this.#backofficeContext = backofficeContext;
			this.observe(
				backofficeContext?.sectionSidebarDrawerOpen,
				(open) => {
					const wasOpen = this._sidebarDrawerOpen;
					this._sidebarDrawerOpen = open ?? false;
					if (wasOpen && !this._sidebarDrawerOpen) {
						this.shadowRoot?.querySelector<HTMLElement>('#sidebar-toggle')?.focus();
					}
				},
				'observeSectionSidebarDrawerOpen',
			);
		});
	}

	#onSidebarToggleClick() {
		this.#backofficeContext?.toggleSectionSidebarDrawer();
	}

	override render() {
		return html`
			<div id="appHeader">
				<uui-button
					id="sidebar-toggle"
					look="primary"
					compact
					label=${this.localize.term('general_menu')}
					aria-expanded=${this._sidebarDrawerOpen}
					@click=${this.#onSidebarToggleClick}>
					<uui-icon name="icon-list"></uui-icon>
				</uui-button>
				<umb-backoffice-header-logo></umb-backoffice-header-logo>
				<umb-backoffice-header-sections></umb-backoffice-header-sections>
				<umb-backoffice-header-apps></umb-backoffice-header-apps>
			</div>
		`;
	}

	static override readonly styles = [
		css`
			:host {
				width: 100%;
			}

			#appHeader {
				--uui-focus-outline-color: var(--uui-color-header-contrast-emphasis);
				background-color: var(--umb-header-background-color, var(--uui-color-header-surface));
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 0 var(--uui-size-space-5);
			}

			umb-backoffice-header-sections {
				flex: 1 1 auto;
			}

			#sidebar-toggle {
				display: none;
				font-size: 18px;
				margin-right: var(--uui-size-space-3);
				--uui-button-background-color: transparent;
				--uui-button-background-color-hover: var(--uui-color-emphasis);
			}

			@media (max-width: 800px) {
				#sidebar-toggle {
					display: inline-block;
				}
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-backoffice-header': UmbBackofficeHeaderElement;
	}
}
