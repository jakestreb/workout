export enum Result {
  Failed = 0,
  Incomplete,
  Pending,
  Complete
}

export enum Difficulty {
  Easy = 0,
  Intermediate,
  Hard
}

export function getKeys(e: any): number[] {
	const keys = [];
	for (const value in e) {
		if (!isNaN(Number(value))) {
			keys.push(Number(value));
		}
	}
	return keys;
}
