import Component from './Component';

export default class Table extends Component {
	public items: string[][] = [];

	public xSpacing: number = 2;
	public ySpacing: number = 0;

	public get rows(): number {
		return this.items.length;
	}

	public columnWidth(index: number) {
		if (this.rows === 0) {
			throw new Error('No rows in table');
		}
		return Math.max(...this.items.map(row => row[index].length));
	}

	public update(items: string[][]): void {
		const width = Math.max(...items.map(row => row.length));
		items.forEach(row => {
			while (row.length < width) {
				row.push('');
			}
		});
		this.items = items;
		this.updatePing();
	}

	public rowToString(row: string[]): string {
		const rowItems = row.map((s, i) => extendTo(s, this.columnWidth(i), i > 0));
		const rowStr = rowItems.join(new Array(this.xSpacing).fill(' ').join(''));
		return rowStr;
	}

	public addToCharMap(charMap: string[][]) {
		if (this.rows === 0) {
			return;
		}
		const x = this.x;
		const y = this.y;
		const yd = this.ySpacing + 1;
		for (let j = 0; j < (this.rows * yd) && j + y < charMap.length; j++) {
			const render = this.rowToString(this.items[j]);
			for (let i = 0; i < render.length && i + x < charMap[0].length; i++) {
				charMap[y + j][x + i] = render[i];
			}
		}
	}
}

function extendTo(s: string, len: number, rightJustify: boolean = false): string {
	const extension = new Array(len - s.length).fill(' ').join('');
	return rightJustify ? extension + s : s + extension;
}
