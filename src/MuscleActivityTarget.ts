import * as targetRecords from './data/targets.json';
import * as body from './data/body.json';
import MuscleActivity from './MuscleActivity';
import * as util from './util';

interface MuscleRecord {
	name: string;
	children?: MuscleRecord[];
}

interface MuscleGroup {
	name: string;
	activity: number;
	muscles: string[]
}

interface Muscle {
	name: string;
	activity: number;
}

// Allowed intensity difference when determining if muscle activity is similar
const INTENSITY_TOLERANCE = 1;

const AVG_WORKOUT_REPS = 250;
const AVG_WORKOUT_TIME_S = 60 * 45;

export default class MuscleActivityTarget {

	// Creates all component targets
	static fromTarget(targetName: string, intensity: number, timeSeconds: number) {
		const targetRecord = targetRecords.find(t => t.name === targetName);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.muscles.map(c => c.weight));

		const activityTarget = new MuscleActivityTarget(intensity);

		targetRecord.muscles.forEach(m => {
			const name = m.name;
			const activity = (m.weight / totalWeight) * intensity * AVG_WORKOUT_REPS * (timeSeconds / AVG_WORKOUT_TIME_S);
			const muscles: string[] = getChildren(name);
			if (muscles.length > 0) {
				activityTarget.addGroup({ name, activity, muscles });
			} else {
				activityTarget.addMuscle({ name, activity });
			}
		});

		return activityTarget;
	}

	private readonly _muscles: Muscle[] = [];
	private readonly _groups: MuscleGroup[] = [];

	// Sets contain muscle names (no groups)
	private readonly _avoid: Set<string> = new Set();
	private readonly _added: Set<string> = new Set();

	private readonly _lower_tolerance_multiplier: number = (this._intensity - INTENSITY_TOLERANCE) / this._intensity
	private readonly _upper_tolerance_multiplier: number = (this._intensity + INTENSITY_TOLERANCE) / this._intensity

	constructor(private _intensity: number) {

	}

	public addMuscle(muscle: Muscle) {
		if (muscle.activity === 0) {
			this._avoid.add(muscle.name);
		} else {
			if (this._added.has(muscle.name)) { throw new Error('Duplicate muscle added'); }
			this._added.add(muscle.name);
			this._muscles.push(muscle);
		}
	}

	public addGroup(group: MuscleGroup) {
		if (group.activity === 0) {
			group.muscles.forEach(name => {
				this._avoid.add(name);
			});
		} else {
			group.muscles.forEach(name => {
				if (this._added.has(name)) { throw new Error('Duplicate muscle added'); }
				this._added.add(name);
			});
			this._groups.push(group);
		}
	}

	public allows(muscleActivity: MuscleActivity): boolean {
		for (const m of this._avoid) {
			if (muscleActivity.get(m)) {
				return false;
			}
		}
		return true;
	}

	public overlaps(muscleActivity: MuscleActivity): boolean {
		for (const m of this._added) {
			if (muscleActivity.get(m)) {
				return true;
			}
		}
		return false;
	}

	public isSatisfiedBy(muscleActivity: MuscleActivity): boolean {
		for (const m of this._muscles) {
			if (!this._isWithinTolerances(muscleActivity.get(m.name), m.activity)) {
				return false;
			}
		}
		for (const g of this._groups) {
			const actual = util.sum(g.muscles.map(name => muscleActivity.get(name)));
			if (!this._isWithinTolerances(actual, g.activity)) {
				return false;
			}
		}
		return true;
	}

	private _isWithinTolerances(activity: number, targetActivity: number): boolean {
		if (!activity) {
			return false;
		}
		const low = targetActivity * this._lower_tolerance_multiplier;
		const high = targetActivity * this._upper_tolerance_multiplier;
		return activity >= low && activity <= high;
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
	return doGetChildren(record);
}
