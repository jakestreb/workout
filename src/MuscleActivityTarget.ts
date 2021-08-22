import * as targetRecords from './sample_data/targets.json';
import * as body from './sample_data/body.json';
import MuscleActivity from './MuscleActivity';
import * as util from './util';

interface Muscle {
	name: string;
	weight?: number;
	components?: Muscle[];
}

// Number of total reps with average intensity exercises to be categorized at intensity 10
const HARD_WORKOUT_REPS = 250

// Allowed intensity difference when determining if muscle activity is similar
const INTENSITY_TOLERANCE = 2;

export default class MuscleActivityTarget extends MuscleActivity {

	// Creates all component targets
	static fromTarget(targetName: string, intensity: number) {
		const targetRecord = targetRecords.find(t => t.name === targetName);
		if (!targetRecord) { throw new Error('Target not found'); }

		// Fetch muscle data with components / default weights
		const muscles = targetRecord.muscles.map(m => ({ ...searchBody(m.muscle), weight: m.weight }));

		// Break muscles into components
		const components = ([] as Muscle[]).concat.apply([], muscles.map(getComponents));

		// Confirm components have no duplicates
		const uniqueSet = new Set(components.map(c => c.name));
		if (uniqueSet.size < components.length) { throw new Error('Target contains overlapping muscles'); }

		const muscleActivity = new MuscleActivityTarget(intensity);
		const totalWeight = util.sum(components.map(c => c.weight!));
		components.forEach(c => {
			muscleActivity.push(c.name, (c.weight! / totalWeight) * intensity * HARD_WORKOUT_REPS);
		});

		return muscleActivity;
	}

	private _avoid: Set<string> = new Set();
	private readonly _intensity: number;

	constructor(intensity: number) {
		super();
		this._intensity = intensity;
	}

	public push(muscleName: string, activity: number) {
		if (activity === 0) {
			this._avoid.add(muscleName);
		} else {
			this.map[muscleName] = activity;
		}
	}

	public allows(activity: MuscleActivity): boolean {
		for (const m of this._avoid) {
			if (activity.get(m)) {
				return false;
			}
		}
		return true;
	}

	public isSatisfiedBy(activity: MuscleActivity): boolean {
		for (const m of Object.keys(this.map)) {
			const [low, high] = this._getTolerances(m);
			const actual = activity.get(m);
			if (!actual || actual < low || actual > high) {
				return false;
			}
		}
		return true;
	}

	private _getTolerances(muscle: string): [number, number] {
		const value = this.get(muscle);
		const lower = (this._intensity - INTENSITY_TOLERANCE) / this._intensity;
		const upper = (this._intensity + INTENSITY_TOLERANCE) / this._intensity;
		return [value * lower, value * upper];
	}
}

function searchBody(name: string): Muscle {
	const doSearch = function(muscle: Muscle): Muscle|null {
		if (muscle.name === name) {
			return muscle;
		}
		if (muscle.components) {
			return muscle.components.reduce<Muscle|null>((a, b) => a || doSearch(b), null);
		}
		return null;
	}
	const result = doSearch(body);
	if (!result) { throw new Error(`Muscle not found: ${name}`); }
	return result;
}

function getComponents(muscle: Muscle): Muscle[] {
	if (muscle.components) {
		return ([] as Muscle[]).concat.apply([], muscle.components.map(getComponents));
	}
	return [muscle];
}
