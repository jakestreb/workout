import * as targetRecords from '../data/targets.json';
import * as body from '../data/body.json';
import MuscleActivity from '../MuscleActivity';
import Reporter from '../Reporter';
import Workout from '../Workout';
import * as util from '../global/util';

interface MuscleRecord {
	name: string;
	children?: MuscleRecord[];
}

interface MuscleGroup {
	name: string;
	activity: number;
	muscles: string[];
}

interface Muscle {
	name: string;
	activity: number;
}

const intensityTolerance = 1;

export default class MuscleActivityTarget {
	// Creates all component targets
	static fromTarget(targetName: string, intensity: number, timeSeconds: number) {
		const targetRecord = targetRecords.find(t => t.name === targetName);
		if (!targetRecord) { throw new Error('Target not found'); }

		const totalWeight = util.sum(targetRecord.muscles.map(c => c.weight));

		const activityTarget = new MuscleActivityTarget(intensity);

		targetRecord.muscles.forEach(m => {
			const name = m.name;
			const muscleScaler = m.weight / totalWeight;
			const timeScaler = timeSeconds / Workout.avgTime;
			const activity = muscleScaler * timeScaler * Workout.intensityScaler * intensity;
			const muscles: string[] = getChildren(name);
			if (muscles.length > 0) {
				activityTarget.addGroup({ name, activity, muscles });
			} else {
				activityTarget.addMuscle({ name, activity });
			}
		});

		return activityTarget;
	}

	public readonly reporter: Reporter = new Reporter();

	private readonly _muscles: Muscle[] = [];
	private readonly _groups: MuscleGroup[] = [];

	// Sets contain muscle names (no groups)
	private readonly _avoid: Set<string> = new Set();
	private readonly _added: Set<string> = new Set();

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
		this.reporter.setTarget(muscle.name, muscle.activity);
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
		this.reporter.setTarget(group.name, group.activity);
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

	public hasSameMuscles(muscleActivity: MuscleActivity): boolean {
		for (const m of this._muscles) {
			if (!muscleActivity.get(m.name)) {
				return false;
			}
		}
		for (const g of this._groups) {
			// Check that all muscles in the group have some activation
			g.muscles.forEach(name => {
				if (!muscleActivity.get(name)) {
					return false;
				}
			});
		}
		return true;
	}

	public isSatisfiedBy(muscleActivity: MuscleActivity): boolean {
		for (const m of this._muscles) {
			this.reporter.record(m.name, muscleActivity.get(m.name));
			const belowTolerance = muscleActivity.get(m.name) < this._lowerTolerance(m.activity);
			const aboveTolerance = muscleActivity.get(m.name) > this._upperTolerance(m.activity);
			if (belowTolerance || aboveTolerance) {
				return false;
			}
		}
		for (const g of this._groups) {
			const actual = util.sum(g.muscles.map(name => muscleActivity.get(name)));
			this.reporter.record(g.name, actual);
			const belowTolerance = actual < this._lowerTolerance(g.activity);
			const aboveTolerance = actual > this._upperTolerance(g.activity);
			if (belowTolerance || aboveTolerance) {
				return false;
			}
		}
		this.reporter.reset();
		return true;
	}

	private _lowerTolerance(activity: number): number {
		return activity * (this._intensity - intensityTolerance) / this._intensity;
	}

	private _upperTolerance(activity: number): number {
		return activity * (this._intensity + intensityTolerance) / this._intensity;
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
