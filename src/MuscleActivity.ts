import * as util from './global/util';

export default class MuscleActivity {

	public static combine(...args: MuscleActivity[]): MuscleActivity {
		return args.reduce((a, b) => a.add(b), new MuscleActivity());
	}

	private readonly _activity: {[muscle: string]: number} = {};

	constructor() {

	}

	public get keys() {
		return Object.keys(this._activity);
	}

	public get total() {
		return util.sum(this.keys.map(k => this.get(k)));
	}

	// Note that muscle groups should not be pushed to MuscleActivity
	public set(muscleName: string, activity: number) {
		this._activity[muscleName] = activity;
	}

	public get(muscleName: string) {
		return this._activity[muscleName] || 0;
	}

	public add(muscleActivity: MuscleActivity): MuscleActivity {
		muscleActivity.keys.forEach(k => {
			this._activity[k] = (this._activity[k] || 0) + muscleActivity.get(k);
		});
		return this;
	}

	public multiply(factor: number): MuscleActivity {
		const m = new MuscleActivity();
		this.keys.forEach(key => {
			m.set(key, this.get(key) * factor);
		});
		return m;
	}

	public toString(): string {
		return this.keys
			.sort((a, b) => this.get(b) - this.get(a))
			.map(key => `${key}: ${this.get(key)}`)
			.join('\n');
	}
}
