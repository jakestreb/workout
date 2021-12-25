interface BuildArg {
	reps: number;
	sets: number;
	weight?: number|null;
}

export default class RepsWeight {

	public static WEIGHT_INC = 5;

	// May be irregular values - should not be read directly
	private _reps: number;
	private _sets: number;
	private _weight: number|null;

	constructor({ reps, sets, weight }: BuildArg) {
		this._reps = reps;
		this._sets = sets;
		this._weight = weight || null;
	}

	public get reps(): number {
		return Math.round(this._reps);
	}

	public get sets(): number {
		return this._sets;
	}

	public get weight(): number|null {
		return roundWeight(this._weight);
	}

	public scale({ reps, sets, weight }: { [key: string]: number }): this {
		this._reps *= reps;
		this._sets *= sets;
		this._weight = this._weight ? this._weight * weight : null;
		return this;
	}

	public incWeight(inc: number): this {
		this._weight = incWeight(this._weight, inc);
		return this;
	}

	public scaleReps(factor: number): this {
		this._reps = incCount(this._reps, this._reps * (factor - 1));
		return this;
	}

	public incSets(inc: number): this {
		this._sets = incCount(this._sets, inc);
		return this;
	}

	// TODO: Remove
	// Returns an array of this and neighboring whole-numbered repsWeight values
	// public getAdjacent(): RepsWeight[] {
	// 	let weightIters: (number|null)[] = [];
	// 	let setIters: number[] = [];
	// 	let repIters: number[] = [];
	// 	let largeRepIters: number[] = [];
	// 	[-1, 0, 1].forEach(n => {
	// 		weightIters.push(incWeight(this._weight, n));
	// 		setIters.push(incCount(this._sets, n));
	// 	});
	// 	[0.7, 1, 1.3].forEach(x => {
	// 		repIters.push(incCount(this._reps, this._reps * (x - 1)));
	// 	});
	// 	[0.5, 1, 1.5].forEach(x => {
	// 		largeRepIters.push(incCount(this._reps, this._reps * (x - 1)));
	// 	});

	// 	const results: RepsWeight[] = [];
	// 	// util.uniq(weightIters).forEach(weight => {
	// 	// 	const reps = this.reps;
	// 	// 	const sets = this.sets;
	// 	// 	results.push(new RepsWeight({ reps, sets, weight }));
	// 	// });
	// 	// util.uniq(setIters).forEach(sets => {
	// 	// 	const weight = this.weight;
	// 	// 	const reps = this.reps;
	// 	// 	results.push(new RepsWeight({ reps, sets, weight }));
	// 	// });
	// 	// util.uniq(repIters).forEach(reps => {
	// 	// 	const weight = this.weight;
	// 	// 	const sets = this.sets;
	// 	// 	results.push(new RepsWeight({ reps, sets, weight }));
	// 	// });
	// 	util.uniq(weightIters).forEach(weight => {
	// 		util.uniq(setIters).forEach(sets => {
	// 			util.uniq(repIters).forEach(reps => {
	// 				results.push(new RepsWeight({ reps, sets, weight }));
	// 			});
	// 		});
	// 		util.uniq(largeRepIters).forEach(reps => {
	// 			const sets = this._sets;
	// 			results.push(new RepsWeight({ reps, sets, weight }));
	// 		});
	// 	});

	// 	return results;
	// }

	public copy(): RepsWeight {
		return new RepsWeight({ reps: this._reps, sets: this._sets, weight: this._weight });
	}

	public toString(): string {
		const weightStr = this.weight ? ` ${this.weight}` : '';
		return `${this.sets}x${this.reps}${weightStr}`;
	}
}

function incCount(n: number, inc: number): number {
	return Math.max(Math.round(n + inc), 1);
}

function incWeight(weight: number|null, inc: number): number|null {
	if (!weight) {
		return weight;
	}
	const weightInc = (inc || 0) * RepsWeight.WEIGHT_INC;
	return Math.max(roundWeight(weight)! + weightInc, RepsWeight.WEIGHT_INC);
}

function roundWeight(weight: number|null): number|null {
	const inc = RepsWeight.WEIGHT_INC;
    return weight ? Math.round(weight / inc) * inc : null;
}
