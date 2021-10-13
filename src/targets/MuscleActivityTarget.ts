import * as body from '../data/body.json';
import MuscleActivity from '../MuscleActivity';
import Reporter from '../Reporter';
import Workout from '../Workout';

interface MuscleRecord {
	name: string;
	children?: MuscleRecord[];
}

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
			const childMuscles: string[] = getChildren(m);
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

function searchBody(name: string): MuscleRecord {
	const doSearch = function(muscle: MuscleRecord): MuscleRecord|null {
		if (muscle.name === name) {
			return muscle;
		}
		if (muscle.children) {
			return muscle.children.reduce<MuscleRecord|null>((a, b) => a || doSearch(b), null);
		}
		return null;
	}

	const result = doSearch(body);
	if (!result) { throw new Error(`Muscle not found: ${name}`); }
	return result;
}

function getChildren(name: string): string[] {
	const doGetChildren = function(record: MuscleRecord): string[] {
		if (record.children) {
			return ([] as string[]).concat.apply([], record.children.map(doGetChildren));
		}
		return [record.name];
	}

	const record = searchBody(name);
	return record.children ? doGetChildren(record) : [];
}
