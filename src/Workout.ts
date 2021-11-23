import Exercise from './exercises/Exercise';
import MuscleActivity from './muscles/MuscleActivity';
import WorkoutSet from './WorkoutSet';
import * as util from './global/util';

export default class Workout {

	// TODO: Change
	public static avgTime = 45 * 60;
	public static intensityScaler = 250;

	public static fromJsonObject(obj: any): Workout {
		const sets: WorkoutSet[] = obj.sets.map((s: any) => WorkoutSet.fromJsonObject(s));
		return new Workout(sets);
	}

	public readonly sets: WorkoutSet[];

	constructor(sets: WorkoutSet[]) {
		this.sets = sets;
	}

	public get time(): number {
		return util.sum(this.sets.map(s => s.time)) + this._transitionTime;
	}

	public get activity(): MuscleActivity {
		return MuscleActivity.combine(...this.sets.map(s => s.activity));
	}

	public get intensity(): number {
		const relativeTime = 30 * 60 / Workout.avgTime;
		return this.activity.total / (relativeTime * Workout.intensityScaler);
	}

	private get _transitionTime() {
		return (this.sets.length - 1) * Exercise.transitionTime;
	}

	public toString(): string {
		return this.sets.join('\n');
	}
}
