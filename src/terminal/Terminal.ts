import Component from './Component';
import * as EventEmitter from 'events';

export default class Terminal extends EventEmitter {

	private _components: Component[] = [];

	constructor() {
		super();
		process.stdout.on('resize', () => {
			this._components.map(c => c.onResize());
			this.updateDisplay();
		});
	}

	public updateDisplay(): void {
		const rows = process.stdout.rows!;
		const cols = process.stdout.columns!;
		const charMap = blankCharMap(rows, cols);
		this._components.forEach(c => {	c.addToCharMap(charMap); });
		this._print(charMap);
	}

	public kill(): void {
		(process.stdout as any).cursorTo(0, process.stdout.rows!);
	}

	public add(component: Component) {
		this._components.push(component);
		component.addKeyBindings();
		component.on('update', () => { this.updateDisplay(); });
	}

	private _print(charMap: string[][]) {
		const printString = charMap.map(row => row.join('')).join('\n');
		process.stdout.write(printString);
		(process.stdout as any).cursorTo(0, 0);
	}
}

function blankCharMap(rows: number, cols: number): string[][] {
	const charMap = new Array(rows).fill(null);
	charMap.forEach((_, i) => {
		charMap[i] = new Array(cols).fill(' ');
	});
	return charMap;
}
