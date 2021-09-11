import * as util from './util';

export default class MuscleActivity {

	public static combine(...args: MuscleActivity[]): MuscleActivity {
		return args.reduce((a, b) => a.add(b), new MuscleActivity());
	}

	private readonly _activity: {[muscle: string]: number} = {};

	constructor() {

	}

	// Note that muscle groups should not be pushed to MuscleActivity
	public set(muscleName: string, activity: number) {
		this._activity[muscleName] = activity;
	}

	public get(muscleName: string) {
		return this._activity[muscleName];
	}

	public keys() {
		return Object.keys(this._activity);
	}

	public total() {
		return util.sum(this.keys().map(k => this.get(k)));
	}

	public add(muscleActivity: MuscleActivity): MuscleActivity {
		muscleActivity.keys().forEach(k => {
			this._activity[k] = (this._activity[k] || 0) + muscleActivity.get(k);
		});
		return this;
	}

	public multiply(factor: number): MuscleActivity {
		const m = new MuscleActivity();
		this.keys().forEach(key => {
			m.set(key, this.get(key) * factor);
		});
		return m;
	}
}
