interface NumericResult {
	target: number;
	min: number;
	max: number;
}

export default class Reporter {

	private _entries: {[key: string]: NumericResult} = {};

	public record(key: string, num: number): void {
		const result: NumericResult = this._entries[key] || { target: 0, min: -1, max: -1 };
		if (num < result.min || result.min === -1) {
			result.min = num;
		}
		if (num > result.max || result.max === -1) {
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

	public throw(): void {
		for (const key in this._entries) {
			const entry = this._entries[key];
			const expected = `Required ${key} near ${Math.round(entry.target)}`;
			if (entry.min === -1) {
				continue;
			} else if (entry.target < entry.min) {
				throw new Error(`${expected} and received at lowest ${Math.round(entry.min)}`);
			} else if (entry.target > entry.max) {
				throw new Error(`${expected} and received at highest ${Math.round(entry.max)}`);
			}
		}
	}
}
