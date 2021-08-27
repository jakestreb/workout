
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

	public setTarget(key: string, target: number): void {
		const entry: NumericResult|{} = this._entries[key] || {};
		this._entries[key] = { min: -1, max: -1, ...entry, target };
	}

	public getDiscrepancies(): string[] {
		const diffs: string[] = [];
		for (const key in this._entries) {
			const entry = this._entries[key];
			if (entry.target < entry.min) {
				diffs.push(`${key}\nexpected: ${entry.target}\nsmallest: ${entry.min}\n`);
			} else if (entry.target > entry.max) {
				diffs.push(`${key}\nexpected: ${entry.target}\ngreatest: ${entry.max}\n`);
			}
		}
		return diffs;
	}
}