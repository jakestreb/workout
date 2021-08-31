import { Result } from './enums';

export default abstract class Picker<T> {

	public readonly items: T[] = [];

	private readonly _generators: Generator<T>[] = [];

	constructor() {

	}

	public get index() {
		return this.items.length;
	}

	public abstract buildGenerator(): Generator<T>;

	public abstract checkProgress(): Result;

	public* pick(): Generator<T[]> {
		this._generators.push(this.buildGenerator());
		while (true) {
			const status = this._add();

			// If the status check is successful, yield
			if (status === Result.Complete) {
				yield this.items;
			}

			// If nothing from current generator works, backtrack
			if (status === Result.Failed) {
				if (this.index === 0) {
					return;
				}
				this._remove();
			}
		}
	}

	private _add(): Result {
		// Try items from current generator until one works
		const gen = this._generators[this.index];

		let curr = gen.next();
		while (!curr.done) {
			this.items.push(curr.value);
			const status = this.checkProgress();
			if (status === Result.Failed) {
				this.items.pop();
				curr = gen.next();
				continue;
			}
			this._generators.push(this.buildGenerator());
			return status;
		}

		return Result.Failed;
	}

	private _remove(): void {
		this.items.pop();
		this._generators.pop();
	}
}
