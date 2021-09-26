import Component from './Component';

export default class ColumnList extends Component {
	public items: string[] = [];

	public get len() {
		return this.items.length;
	}

	public update(items: string[]) {
		this.items = items;
		this.updatePing();
	}

	public renderItem(item: string, index: number): string|string[] {
		return item;
	}

	public addToCharMap(charMap: string[][]) {
		const x = this.x;
		const y = this.y;
		for (let j = 0; j < this.len && j + y < charMap.length; j++) {
			const printed = this.renderItem(this.items[j], j);
			for (let i = 0; i < printed.length && i + x < charMap[0].length; i++) {
				charMap[y + j][x + i] = printed[i];
			}
		}
	}

	public addKeyBindings() {

	}
}
