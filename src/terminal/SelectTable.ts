import Table from './Table';

export default class SelectTable extends Table {
	public selectedIndex: number = 0;
	public selectedKeys: Set<string> = new Set();

	public update(items: string[][]) {
		super.update(items);
		this.selectedIndex = Math.min(this.selectedIndex, this.items.length - 1);
		this.emit('hover', this.selectedIndex);
		this.updatePing();
	}

	public addToCharMap(charMap: string[][]) {
		if (this.rows === 0) {
			return;
		}
		const x = this.x - 2;
		const y = this.y;
		const yd = this.ySpacing + 1;
		for (let j = 0; j < (this.rows * yd) && j + y < charMap.length; j++) {
			let render: string[] = this.rowToString(this.items[j]).split('');
			let select: string = this.selectedKeys.has(this.items[j][0]) ? '>' : ' ';
			if (j === this.selectedIndex) {
				render[0] = `\x1b[30m\x1b[47m${render[0]}`;
				render[render.length - 1] = `${render[render.length - 1]}\x1b[0m`;
			}
			render = [select, ' '].concat(render);
			for (let i = 0; i < render.length && i + x < charMap[0].length; i++) {
				charMap[y + j][x + i] = render[i];
			}
		}
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
				this._toggleSelected();
				this.emit('select', this.selectedIndex);
			}
		});
	}

	private _increaseIndex() {
		this.selectedIndex = mod(this.selectedIndex + 1, this.rows);
		this.updatePing();
	}

	private _decreaseIndex() {
		this.selectedIndex = mod(this.selectedIndex - 1, this.rows);
		this.updatePing();
	}

	private _toggleSelected() {
		const key = this.items[this.selectedIndex][0];
		if (this.selectedKeys.has(key)) {
			this.selectedKeys.delete(key);
		} else {
			this.selectedKeys.add(key);
		}
		this.updatePing();
	}
}

function mod(x: number, n: number): number {
	return ((x % n) + n) % n;
}
