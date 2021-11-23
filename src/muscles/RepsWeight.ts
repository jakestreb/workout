interface BuildArg {
	reps: number[];
	weight?: number|null;
}

export default class RepsWeight {

	public static WEIGHT_INC = 5;

	// May be irregular values - should not be read directly
	private _reps: number[];
	private _weight: number|null;

	constructor({ reps, weight }: BuildArg) {
		this._reps = reps;
		this._weight = weight || null;
	}

	public get reps(): number[] {
		return new Array(this._reps.length).fill(Math.round(this._reps[0]));
	}

	public get weight(): number|null {
		const w = this._weight;
		const inc = RepsWeight.WEIGHT_INC;
	    return w ? Math.round(w / inc) * inc : null;
	}

	public scale({ reps, weight }: { [key: string]: number }): this {
		// TODO: Scale number of sets
		this._reps = new Array(this._reps.length).fill(this._reps[0] * reps);
		this._weight = this._weight ? this._weight * weight : null;
		return this;
	}

	public copy(): RepsWeight {
		return new RepsWeight({ reps: this._reps, weight: this._weight });
	}
}
