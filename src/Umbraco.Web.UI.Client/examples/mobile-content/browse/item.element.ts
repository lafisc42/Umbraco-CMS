import { getBrowsePath, getEditPath } from '../section/paths.js';
import { EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX } from '../constants.js';
import { UmbDocumentTreeItemDataResolver } from '@umbraco-cms/backoffice/document';
import type { UmbDocumentTreeItemModel } from '@umbraco-cms/backoffice/document';
import { UmbEntityContext } from '@umbraco-cms/backoffice/entity';
import { css, customElement, html, ifDefined, nothing, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

/**
 * One row of the drill-down list. Tapping the row descends into children when there are any,
 * otherwise it opens the editor. Entity actions stay visible, independent of hover support.
 */
@customElement('example-mobile-content-item')
export class ExampleMobileContentItemElement extends UmbLitElement {
	#resolver = new UmbDocumentTreeItemDataResolver(this);
	#entityContext = new UmbEntityContext(this);
	#item?: UmbDocumentTreeItemModel;

	@property({ attribute: false })
	public set item(value: UmbDocumentTreeItemModel | undefined) {
		this.#item = value;
		this.#resolver.setData(value);
		this.#entityContext.setEntityType(value?.entityType);
		this.#entityContext.setUnique(value?.unique ?? null);
		this.requestUpdate();
	}
	public get item(): UmbDocumentTreeItemModel | undefined {
		return this.#item;
	}

	@state()
	private _name = '';

	@state()
	private _icon?: string;

	@state()
	private _isDraft = false;

	constructor() {
		super();
		this.observe(this.#resolver.name, (name) => (this._name = name ?? ''), null);
		this.observe(this.#resolver.icon, (icon) => (this._icon = icon), null);
		this.observe(this.#resolver.isDraft, (isDraft) => (this._isDraft = isDraft ?? false), null);
	}

	override render() {
		const item = this.#item;
		if (!item) return nothing;

		const editPath = getEditPath(item.unique);
		const mainPath = item.hasChildren ? getBrowsePath(item.unique) : editPath;

		return html`
			<a id="main" href=${mainPath}>
				<umb-icon name=${ifDefined(this._icon)}></umb-icon>
				<span id="name">${this._name}</span>
				${this._isDraft
					? html`<span id="state">${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_draft`)}</span>`
					: nothing}
			</a>
			${item.hasChildren
				? html`<uui-button
						compact
						href=${editPath}
						label=${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_edit`)}></uui-button>`
				: nothing}
			<umb-entity-actions-bundle></umb-entity-actions-bundle>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				min-height: 48px;
				padding: 0 var(--uui-size-space-3);
				border-bottom: 1px solid var(--uui-color-border);
			}

			#main {
				flex: 1 1 auto;
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				min-width: 0;
				min-height: 48px;
				color: inherit;
				text-decoration: none;
			}

			#name {
				flex: 1 1 auto;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			#state {
				flex: 0 0 auto;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'example-mobile-content-item': ExampleMobileContentItemElement;
	}
}
