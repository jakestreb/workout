import data from '../data';
import Reporter from '../Reporter';
import Workout from '../Workout';

import type MuscleActivity from '../muscles/MuscleActivity';

export default class MuscleActivityTarget {

	public static intensityTolerance = 1;

	public readonly reporter: Reporter = new Reporter();

	private _intensity: number;
	private _activity: number;

	private _lowerTolerance: number;
	private _upperTolerance: number;

	// Sets contain muscle names (no groups)
	private readonly _added: Set<string> = new Set();

	constructor(muscles: string[], intensity: number, time: number) {
		this._intensity = intensity;
		this._activity = (time / Workout.avgTime) * Workout.intensityScaler * intensity;

		this._lowerTolerance = this._activity *
			(this._intensity - MuscleActivityTarget.intensityTolerance) / this._intensity;
		this._upperTolerance = this._activity *
			(this._intensity + MuscleActivityTarget.intensityTolerance) / this._intensity;

		muscles.forEach(m => {
			const childMuscles: string[] = data.muscles.getComponents(m).map(m => m.name);
			if (childMuscles.length > 0) {
				childMuscles.forEach(m => { this._added.add(m); });
			} else {
				this._added.add(m);
			}
		});
	}

	public overlaps(muscleActivity: MuscleActivity): boolean {
		for (const m of this._added) {
			if (muscleActivity.get(m)) {
				return true;
			}
		}
		return false;
	}

	public hasSameMuscles(muscleActivity: MuscleActivity): boolean {
		for (const m of this._added) {
			if (!muscleActivity.get(m)) {
				return false;
			}
		}
		return true;
	}

	public isSatisfiedBy(muscleActivity: MuscleActivity): boolean {
		const relevantActivity = muscleActivity.getTotal(Array.from(this._added));
		this.reporter.record(`${this._added}`, relevantActivity);
		const belowTolerance = relevantActivity < this._lowerTolerance;
		const aboveTolerance = relevantActivity > this._upperTolerance;
		if (belowTolerance || aboveTolerance) {
			return false;
		}
		this.reporter.reset();
		return true;
	}
}
