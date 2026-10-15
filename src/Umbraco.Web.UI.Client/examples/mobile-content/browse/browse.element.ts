import { getBrowsePath, getEditPath } from '../section/paths.js';
import { EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX } from '../constants.js';
import {
	EXAMPLE_MOBILE_CONTENT_NAVIGATION_CONTEXT,
	type ExampleMobileContentNavigationContext,
} from '../section/navigation.context.js';
import './crumb.element.js';
import './item.element.js';
import {
	UMB_DOCUMENT_ENTITY_TYPE,
	UMB_DOCUMENT_ROOT_ENTITY_TYPE,
	UmbDocumentItemDataResolver,
	UmbDocumentItemRepository,
	UmbDocumentTreeRepository,
} from '@umbraco-cms/backoffice/document';
import type { UmbDocumentTreeItemModel } from '@umbraco-cms/backoffice/document';
import { UmbEntityContext } from '@umbraco-cms/backoffice/entity';
import { css, customElement, html, nothing, property, repeat, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

const PAGE_SIZE = 50;

/**
 * Lists the children of one document (or the root) as a single column. One level per screen,
 * breadcrumbs for the way up, the regular entity actions for the current parent.
 */
@customElement('example-mobile-content-browse')
export class ExampleMobileContentBrowseElement extends UmbLitElement {
	#treeRepository = new UmbDocumentTreeRepository(this);
	#itemRepository = new UmbDocumentItemRepository(this);
	#parentResolver = new UmbDocumentItemDataResolver(this);
	#entityContext = new UmbEntityContext(this);
	#navigation?: ExampleMobileContentNavigationContext;
	#parentUnique: string | null = null;
	#loadedFor: string | null | undefined;

	@property({ attribute: false })
	public set parentUnique(value: string | null) {
		this.#parentUnique = value;
		this.#navigation?.setParentUnique(value);
		if (this.isConnected) this.#load();
	}
	public get parentUnique(): string | null {
		return this.#parentUnique;
	}

	@state()
	private _items: Array<UmbDocumentTreeItemModel> = [];

	@state()
	private _total = 0;

	@state()
	private _ancestors: Array<UmbDocumentTreeItemModel> = [];

	@state()
	private _parentName = '';

	@state()
	private _loading = false;

	constructor() {
		super();
		this.consumeContext(EXAMPLE_MOBILE_CONTENT_NAVIGATION_CONTEXT, (context) => {
			this.#navigation = context;
			context?.setParentUnique(this.#parentUnique);
		});
		this.observe(this.#parentResolver.name, (name) => (this._parentName = name ?? ''), null);
	}

	override connectedCallback() {
		super.connectedCallback();
		if (this.#loadedFor !== this.#parentUnique) this.#load();
	}

	#requestChildren(skip: number) {
		const unique = this.#parentUnique;
		const paging = { skip, take: PAGE_SIZE };
		return unique
			? this.#treeRepository.requestTreeItemsOf({ parent: { unique, entityType: UMB_DOCUMENT_ENTITY_TYPE }, paging })
			: this.#treeRepository.requestTreeRootItems({ paging });
	}

	async #load() {
		const unique = this.#parentUnique;
		this.#loadedFor = unique;
		this._loading = true;
		this._items = [];
		this._total = 0;
		this._ancestors = [];
		this.#parentResolver.setData(undefined);
		this.#entityContext.setEntityType(unique ? UMB_DOCUMENT_ENTITY_TYPE : UMB_DOCUMENT_ROOT_ENTITY_TYPE);
		this.#entityContext.setUnique(unique);

		const [children, ancestors, parent] = await Promise.all([
			this.#requestChildren(0),
			unique
				? this.#treeRepository.requestTreeItemAncestors({ treeItem: { unique, entityType: UMB_DOCUMENT_ENTITY_TYPE } })
				: Promise.resolve({ data: [] as Array<UmbDocumentTreeItemModel> }),
			unique ? this.#itemRepository.requestItems([unique]) : Promise.resolve({ data: undefined }),
		]);

		if (unique !== this.#parentUnique) return;

		this._items = children.data?.items ?? [];
		this._total = children.data?.total ?? 0;
		this._ancestors = (ancestors.data ?? []).filter((ancestor) => ancestor.unique !== unique);
		this.#parentResolver.setData(parent.data?.[0]);
		this._loading = false;
	}

	async #loadMore() {
		const unique = this.#parentUnique;
		const { data } = await this.#requestChildren(this._items.length);
		if (unique !== this.#parentUnique || !data) return;
		this._items = [...this._items, ...data.items];
		this._total = data.total;
	}

	#renderCrumbs() {
		if (!this.#parentUnique) return nothing;
		return html`
			<nav id="crumbs">
				<a href=${getBrowsePath(null)}>${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_root`)}</a>
				${this._ancestors.map(
					(ancestor) =>
						html`<span>/</span><example-mobile-content-crumb .item=${ancestor}></example-mobile-content-crumb>`,
				)}
			</nav>
		`;
	}

	#renderTitle() {
		const unique = this.#parentUnique;
		return html`
			<div id="title">
				<h2>${unique ? this._parentName : this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_root`)}</h2>
				${unique
					? html`<uui-button
							compact
							href=${getEditPath(unique)}
							label=${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_edit`)}></uui-button>`
					: nothing}
				<umb-entity-actions-bundle></umb-entity-actions-bundle>
			</div>
		`;
	}

	#renderList() {
		return html`
			<div id="list">
				${this._loading ? html`<uui-loader-bar></uui-loader-bar>` : nothing}
				${repeat(
					this._items,
					(item) => item.unique,
					(item) => html`<example-mobile-content-item .item=${item}></example-mobile-content-item>`,
				)}
				${!this._loading && this._items.length === 0
					? html`<p id="empty">${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_empty`)}</p>`
					: nothing}
				${this._items.length < this._total
					? html`<uui-button
							id="more"
							label=${this.localize.term(`${EXAMPLE_MOBILE_CONTENT_LOCALIZATION_PREFIX}_loadMore`)}
							@click=${this.#loadMore}></uui-button>`
					: nothing}
			</div>
		`;
	}

	override render() {
		return html`
			<header>${this.#renderCrumbs()}${this.#renderTitle()}</header>
			${this.#renderList()}
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow: hidden;
			}

			header {
				flex: 0 0 auto;
				padding: var(--uui-size-space-3) var(--uui-size-space-3) var(--uui-size-space-2);
				background: var(--uui-color-surface);
				border-bottom: 1px solid var(--uui-color-border);
			}

			#crumbs {
				display: flex;
				gap: var(--uui-size-space-2);
				overflow-x: auto;
				white-space: nowrap;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				padding-bottom: var(--uui-size-space-1);
			}

			#crumbs a {
				color: inherit;
				text-decoration: none;
			}

			#title {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				min-height: 40px;
			}

			#title h2 {
				flex: 1 1 auto;
				min-width: 0;
				margin: 0;
				font-size: var(--uui-type-h5-size);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			#list {
				flex: 1 1 auto;
				min-height: 0;
				overflow-y: auto;
				-webkit-overflow-scrolling: touch;
			}

			#empty {
				margin: var(--uui-size-space-5) var(--uui-size-space-3);
				color: var(--uui-color-text-alt);
			}

			#more {
				display: block;
				margin: var(--uui-size-space-3);
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'example-mobile-content-browse': ExampleMobileContentBrowseElement;
	}
}
