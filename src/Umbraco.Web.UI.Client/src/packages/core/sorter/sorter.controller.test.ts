import { UmbSorterController } from './sorter.controller.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import { customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

@customElement('test-my-sorter')
class UmbSorterTestElement extends UmbLitElement {
	sorter = new UmbSorterController<string, HTMLElement>(this, {
		getUniqueOfElement: (element) => {
			return element.id;
		},
		getUniqueOfModel: (modelEntry) => {
			return modelEntry;
		},
		identifier: 'Umb.SorterIdentifier.Test',
		itemSelector: '.item',
		containerSelector: '#container',
		disabledItemSelector: '.disabled',
		// TODO: In theory missing model change callback? [NL]
	});

	getAllItems() {
		return Array.from(this.shadowRoot!.querySelectorAll('.item')) as HTMLElement[];
	}

	getSortableItems() {
		return Array.from(this.shadowRoot!.querySelectorAll('.item:not(.disabled')) as HTMLElement[];
	}

	getDisabledItems() {
		return Array.from(this.shadowRoot!.querySelectorAll('.item.disabled')) as HTMLElement[];
	}

	override render() {
		return html`<div id="container">
			<div id="1" class="item">Item 1</div>
			<div id="2" class="item">Item 2</div>
			<div id="3" class="item disabled">Item 3</div>
			<div id="4" class="item">Item 4</div>
		</div>`;
	}
}

describe('UmbSorterController', () => {
	let element: UmbSorterTestElement;

	beforeEach(async () => {
		element = await fixture(html`<test-my-sorter></test-my-sorter>`);
		//await aTimeout(10);
	});

	it('is defined with its own instance', () => {
		expect(element).to.be.instanceOf(UmbSorterTestElement);
		expect(element.sorter).to.be.instanceOf(UmbSorterController);
	});

	describe('Public API', () => {
		describe('methods', () => {
			it('has a enable method', () => {
				expect(element.sorter).to.have.property('enable').that.is.a('function');
			});

			it('has a disable method', () => {
				expect(element.sorter).to.have.property('disable').that.is.a('function');
			});

			it('has a setModel method', () => {
				expect(element.sorter).to.have.property('setModel').that.is.a('function');
			});

			it('has a hasItem method', () => {
				expect(element.sorter).to.have.property('hasItem').that.is.a('function');
			});

			it('has a getItem method', () => {
				expect(element.sorter).to.have.property('getItem').that.is.a('function');
			});

			it('has a setupItem method', () => {
				expect(element.sorter).to.have.property('setupItem').that.is.a('function');
			});

			it('has a destroyItem method', () => {
				expect(element.sorter).to.have.property('destroyItem').that.is.a('function');
			});

			it('has a hasOtherItemsThan method', () => {
				expect(element.sorter).to.have.property('hasOtherItemsThan').that.is.a('function');
			});

			it('has a moveItemInModel method', () => {
				expect(element.sorter).to.have.property('moveItemInModel').that.is.a('function');
			});

			it('has a updateAllowIndication method', () => {
				expect(element.sorter).to.have.property('updateAllowIndication').that.is.a('function');
			});

			it('has a removeAllowIndication method', () => {
				expect(element.sorter).to.have.property('removeAllowIndication').that.is.a('function');
			});

			it('has a notifyDisallowed method', () => {
				expect(element.sorter).to.have.property('notifyDisallowed').that.is.a('function');
			});

			it('has a notifyRequestMove method', () => {
				expect(element.sorter).to.have.property('notifyRequestMove').that.is.a('function');
			});

			it('has a destroy method', () => {
				expect(element.sorter).to.have.property('destroy').that.is.a('function');
			});
		});
	});

	describe('Init', () => {
		it('should find all items', () => {
			const items = element.getAllItems();
			expect(items.length).to.equal(4);
		});

		it('sets all allowed draggable items to draggable="false"', async () => {
			const items = element.getSortableItems();
			expect(items.length).to.equal(3);
			await aTimeout(100);
			items.forEach((item) => {
				expect(item.draggable).to.be.false;
			});
		});

		it('sets all disabled items non draggable', async () => {
			const items = element.getDisabledItems();
			expect(items.length).to.equal(1);
			await aTimeout(100);
			items.forEach((item) => {
				expect(item.draggable).to.be.false;
			});
		});
	});

	describe('disable', () => {
		it('sets all items to non draggable', async () => {
			element.sorter.disable();
			const items = element.getAllItems();
			await aTimeout(100);
			items.forEach((item) => {
				expect(item.draggable).to.be.false;
			});
		});
	});

	describe('enable', () => {
		it('sets all allowed items to draggable="false"', async () => {
			const items = element.getSortableItems();
			expect(items.length).to.equal(3);

			await aTimeout(100);
			await element.updateComplete;

			// Expect all items to be draggable
			items.forEach((item) => {
				expect(item.draggable).to.be.false;
			});
		});

		it('sets all disabled items non draggable', async () => {
			const items = element.getDisabledItems();
			expect(items.length).to.equal(1);
			await aTimeout(100);
			items.forEach((item) => {
				expect(item.draggable).to.be.false;
			});
		});
	});

	describe('setModel & getModel', () => {
		it('it sets the model', () => {
			const model = ['1', '2', '3', '4'];
			element.sorter.setModel(model);
			expect(element.sorter.getModel()).to.deep.equal(model);
		});
	});

	describe('hasItem', () => {
		beforeEach(() => {
			element.sorter.setModel(['1', '2', '3', '4']);
		});

		it('returns true if item exists', () => {
			expect(element.sorter.hasItem('1')).to.be.true;
		});

		it('returns false if item does not exist', () => {
			expect(element.sorter.hasItem('5')).to.be.false;
		});
	});

	describe('getItem', () => {
		beforeEach(() => {
			element.sorter.setModel(['1', '2', '3', '4']);
		});

		it('returns the item if it exists', () => {
			expect(element.sorter.getItem('1')).to.equal('1');
		});

		it('returns undefined if item does not exist', () => {
			expect(element.sorter.getItem('5')).to.be.undefined;
		});
	});

	describe('touch pointer reordering', () => {
		const LONG_PRESS = 350;

		const dispatchPointer = (
			target: EventTarget,
			type: string,
			x: number,
			y: number,
			pointerType: 'touch' | 'mouse' = 'touch',
		) => {
			target.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					composed: true,
					cancelable: true,
					pointerId: 1,
					pointerType,
					isPrimary: true,
					button: 0,
					buttons: type === 'pointerup' ? 0 : 1,
					clientX: x,
					clientY: y,
				}),
			);
		};

		const centerOf = (el: HTMLElement) => {
			const rect = el.getBoundingClientRect();
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, bottom: rect.bottom };
		};

		beforeEach(async () => {
			element.sorter.setModel(['1', '2', '3', '4']);
			await aTimeout(100);
		});

		it('moves the pressed item to where the finger is released after a long press', async () => {
			const [first, , , last] = element.getAllItems();
			const start = centerOf(first);
			const end = centerOf(last);

			dispatchPointer(first, 'pointerdown', start.x, start.y);
			await aTimeout(LONG_PRESS);
			expect(first.hasAttribute('drag-placeholder'), 'placeholder styling while dragging').to.be.true;

			dispatchPointer(window, 'pointermove', end.x, end.bottom - 2);
			await aTimeout(50);
			dispatchPointer(window, 'pointerup', end.x, end.bottom - 2);
			await aTimeout(50);

			expect(element.sorter.getModel()).to.deep.equal(['2', '3', '4', '1']);
			expect(first.hasAttribute('drag-placeholder')).to.be.false;
		});

		it('does not start a drag when the finger moves before the long press completes', async () => {
			const [first, , , last] = element.getAllItems();
			const start = centerOf(first);
			const end = centerOf(last);

			dispatchPointer(first, 'pointerdown', start.x, start.y);
			await aTimeout(50);
			dispatchPointer(window, 'pointermove', start.x, start.y + 30);
			await aTimeout(LONG_PRESS);
			dispatchPointer(window, 'pointermove', end.x, end.bottom - 2);
			await aTimeout(50);
			dispatchPointer(window, 'pointerup', end.x, end.bottom - 2);

			expect(element.sorter.getModel()).to.deep.equal(['1', '2', '3', '4']);
		});

		it('leaves mouse pointers to the native drag and drop path', async () => {
			const [first, , , last] = element.getAllItems();
			const start = centerOf(first);
			const end = centerOf(last);

			dispatchPointer(first, 'pointerdown', start.x, start.y, 'mouse');
			await aTimeout(LONG_PRESS);
			expect(first.hasAttribute('drag-placeholder')).to.be.false;
			dispatchPointer(window, 'pointermove', end.x, end.bottom - 2, 'mouse');
			await aTimeout(50);
			dispatchPointer(window, 'pointerup', end.x, end.bottom - 2, 'mouse');

			expect(element.sorter.getModel()).to.deep.equal(['1', '2', '3', '4']);
		});
	});
});
