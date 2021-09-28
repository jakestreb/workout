import * as EventEmitter from 'events';

export default abstract class Component extends EventEmitter {
	public x: number;
	public y: number;

	private _hPos: number;
	private _vPos: number;

	constructor(hPos: number, vPos: number) {
		super();
		this._hPos = hPos;
		this._vPos = vPos;
		this.onResize();
	}

	public updatePing(): void {
		this.emit('update');
	}

	public onResize(): void {
		const rows = process.stdout.rows!;
		const cols = process.stdout.columns!;
		this.x = Math.round(this._hPos * cols);
		this.y = Math.round(this._vPos * rows);
	}

	public addKeyBindings(): void {

	}

	public abstract addToCharMap(charMap: string[][]): void;
}
