interface WeightedItem {
	weight: number;
}

export function* randomSelector<T>(array: T[], options = { infinite: false }): Generator<T> {
	let copy = array.slice();
	while (copy.length > 0) {
		const r = Math.floor(Math.random() * copy.length);
		yield copy[r];
		if (!options.infinite) {
			copy.splice(r, 1);
		}
	}
	return;
}

export function* weightedSelector<T extends WeightedItem>(array: T[]): Generator<T> {
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

export function avg(array: number[]): number {
	return sum(array) / array.length;
}

export function uniq(array: any[]) {
	const onlyUnique = (value: any, index: number, self: any[]) => self.indexOf(value) === index;
	return array.filter(onlyUnique);
}

// https://stackoverflow.com/a/53577159
export function stdDev(array: number[]) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export function weightedAvg(numbers: number[], weights: number[]): number {
	const total = sum(weights);
	return numbers.reduce((n, i) => n * (weights[i] / total), 0);
}

export function overlapping<T>(a: T[], b: T[]): T[] {
	const result: T[] = [];
	const aSet = new Set(a);
	b.forEach(val => {
		if (aSet.has(val)) {
			result.push(val);
		}
	});
	return result;
}

export function timeString(timeSeconds: number): string {
	const min = Math.floor(timeSeconds / 60);
	let s = `0${Math.floor(timeSeconds % 60)}`;
	s = s.slice(s.length - 2);
	return `${min}:${s}`;
}

export async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export function setEquals<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) {
    	return false;
    }
    for (const itemA of a) {
    	if (!b.has(itemA)) {
    		return false;
    	}
    }
    return true;
}

export async function forever(callback: () => any, sleep: number = 0) {
	const kill = await callback();
	if (!kill) {
    	setTimeout(() => forever(callback, sleep), sleep);
    }
}

export function maxIndex(a: number[]) {
	// https://stackoverflow.com/a/30850912
	return a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

export function round(n: number, decimals: number) {
	const factor = Math.pow(10, decimals);
	return Math.round((n + Number.EPSILON) * factor) / factor;
}

// Modify normally distributed dataset mean and standard deviation
// https://math.stackexchange.com/a/2894689
export function normalScale(vals: number[], mean: number, std: number): number[] {
	const initMean = avg(vals);
	const initStd = stdDev(vals);
	const initVariance = Math.pow(initStd, 2);
	const variance = Math.pow(std, 2);

	const coeff = Math.sqrt(variance / initVariance);
	const shift = mean - (initMean * coeff);

	return vals.map(n => n * coeff + shift);
}

// Splits total into whole-numbered values according to the given ratios
export function splitEvenly(total: number, ratios: number[]): number[] {
	const counts = ratios.map(r => r * total);
	const decimals = counts.map(c => c - Math.floor(c));

	while (total > sum(counts.map(Math.floor))) {
		const i = maxIndex(decimals);
		counts[i] = Math.ceil(counts[i]);
		decimals[i] = 0;
	}

	return counts.map(Math.floor);
}
