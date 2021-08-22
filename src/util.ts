
interface WeightedItem {
	weight: number;
	[propName: string]: any;
}

export function* randomSelector<T>(array: T[]): Generator<T> {
	let copy = array.slice();
	while (copy.length > 0) {
		const r = Math.floor(Math.random() * copy.length);
		yield copy[r];
		copy.splice(r, 1);
	}
	return;
}

export function* weightedSelector(array: WeightedItem[]): Generator<WeightedItem> {
	let copy = array.slice();
	let total = sum(array.map(x => x.weight));

	while (copy.length > 0) {
		const r = Math.random() * total;

		let sum = 0;
		for (let i = 0; i < array.length; i++) {
			sum += copy[i].weight;
			if (r <= sum) {
				yield copy[i];
				total -= copy[i].weight;
				copy.splice(i, 1);
				break;
			}
		}
	}
	return;
}

export function sum(array: number[]): number {
	return array.reduce((a, b) => a + b, 0);
}
