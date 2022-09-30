import { Result } from '../global/enum';

export default abstract class Picker<T> {

	public readonly items: T[] = [];

	// Map from number of progress checks passed to a count of instances
	// Useful for debugging
	public readonly progressMap: { [n: number]: number } = {};

	private readonly _generators: Generator<T>[] = [];

	constructor() {

	}

	public abstract get checks(): (() => Result)[];

	public get index() {
		return this.items.length;
	}

	public abstract buildGenerator(): Generator<T>;

	public checkProgress(): Result {
		return this._checkAll(...this.checks);
	}

	public* pick(): Generator<T[], T[]|null, Result|undefined> {
		this._generators.push(this.buildGenerator());
		while (true) {
			let feedback: Result|undefined = Result.Incomplete;
			const status = this._add();

			// If the status check is successful, yield
			if (status === Result.Complete) {
				feedback = yield this.items || Result.Complete;
			}

			// If nothing from current generator works, backtrack
			if (status === Result.Failed || feedback === Result.Failed || feedback === Result.Complete) {
				if (this.index === 0) {
					return null;
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

	private _checkAll(...args: (() => Result)[]): Result {
		let worst = Result.Complete;
		let i = 0;
		for (const arg of args) {
			const result = arg();
			if (result < worst) {
				this.progressMap[i] = this.progressMap[i] || 0;
				this.progressMap[i] += 1;
				worst = result;
			}
			if (worst === Result.Failed) {
				return worst;
			}
			i++;
		}
		return worst;
	}
}
