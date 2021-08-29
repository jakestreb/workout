
interface NumericResult {
	target: number;
	min: number;
	max: number;
}

export default class Reporter {

	private _entries: {[key: string]: NumericResult} = {};

	constructor() {

	}

	public record(key: string, num: number): void {
		const result: NumericResult = this._entries[key] || { target: 0, min: -1, max: -1 };
		if (num < result.min || result.min === -1) {
			result.min = num;
		}
		if (num > result.max) {
			result.max = num;
		}
	}

	public reset(): void {
		for (const key in this._entries) {
			const entry = this._entries[key];
			entry.min = -1;
			entry.max = -1;
		}
	}

	public setTarget(key: string, target: number): void {
		const entry: NumericResult|{} = this._entries[key] || {};
		this._entries[key] = { min: -1, max: -1, ...entry, target };
	}

	public getDiscrepancies(): string[] {
		const diffs: string[] = [];
		for (const key in this._entries) {
			const entry = this._entries[key];
			if (entry.target < entry.min) {
				diffs.push(`${key}\nexpected: ${Math.round(entry.target)}\nsmallest: ${Math.round(entry.min)}\n`);
			} else if (entry.target > entry.max) {
				diffs.push(`${key}\nexpected: ${Math.round(entry.target)}\ngreatest: ${Math.round(entry.max)}\n`);
			}
		}
		return diffs;
	}
}
