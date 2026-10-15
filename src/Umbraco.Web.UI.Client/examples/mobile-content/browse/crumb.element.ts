import { getBrowsePath } from '../section/paths.js';
import { UmbDocumentTreeItemDataResolver } from '@umbraco-cms/backoffice/document';
import type { UmbDocumentTreeItemModel } from '@umbraco-cms/backoffice/document';
import { css, customElement, html, nothing, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('example-mobile-content-crumb')
export class ExampleMobileContentCrumbElement extends UmbLitElement {
	#resolver = new UmbDocumentTreeItemDataResolver(this);
	#item?: UmbDocumentTreeItemModel;

	@property({ attribute: false })
	public set item(value: UmbDocumentTreeItemModel | undefined) {
		this.#item = value;
		this.#resolver.setData(value);
		this.requestUpdate();
	}
	public get item(): UmbDocumentTreeItemModel | undefined {
		return this.#item;
	}

	@state()
	private _name = '';

	constructor() {
		super();
		this.observe(this.#resolver.name, (name) => (this._name = name ?? ''), null);
	}

	override render() {
		if (!this.#item) return nothing;
		return html`<a href=${getBrowsePath(this.#item.unique)}>${this._name}</a>`;
	}

	static override styles = css`
		:host {
			display: inline;
			white-space: nowrap;
		}

		a {
			color: var(--uui-color-text-alt);
			text-decoration: none;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'example-mobile-content-crumb': ExampleMobileContentCrumbElement;
	}
}
