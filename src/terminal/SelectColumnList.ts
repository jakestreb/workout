import ColumnList from './ColumnList';

export default class SelectColumnList extends ColumnList {
	public selectedIndex: number = 0;

	public renderItem(item: string, index: number): string|string[] {
		if (index === this.selectedIndex) {
			const arrItem = item.split('');
			arrItem[0] = `\x1b[30m\x1b[47m${arrItem[0]}`;
			arrItem[arrItem.length - 1] = `${arrItem[arrItem.length - 1]}\x1b[0m`;
			return arrItem;
		}
		return super.renderItem(item, index);
	}

	public update(items: string[]) {
		this.items = items;
		this.emit('hover', this.selectedIndex);
		this.updatePing();
	}

	public addKeyBindings() {
		process.stdin.on('data', async (key) => {
			if (key === '\u001B[A') { // up
				this._decreaseIndex();
				this.emit('hover', this.selectedIndex);
			} else if (key === '\u001B[B') { // down
				this._increaseIndex();
				this.emit('hover', this.selectedIndex);
			} else if (key === '\u000D') { // enter
				this.emit('select', this.selectedIndex);
			}
		});
	}

	private _increaseIndex() {
		this.selectedIndex = mod(this.selectedIndex + 1, this.len);
		this.updatePing();
	}

	private _decreaseIndex() {
		this.selectedIndex = mod(this.selectedIndex - 1, this.len);
		this.updatePing();
	}
}

function mod(x: number, n: number): number {
	return ((x % n) + n) % n;
}
