import Exercise from './exercises/Exercise';
import MuscleScores from './muscles/MuscleScores';
import WorkoutSet from './WorkoutSet';
import * as util from './global/util';

export default class Workout {
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

	public getScores(user: DBUser): MuscleScores {
		return MuscleScores.combine(...this.sets.map(s => s.getScores(user)));
	}

	private get _transitionTime() {
		return (this.sets.length - 1) * Exercise.TRANSITION_TIME;
	}

	public toString(): string {
		return this.sets.join('\n');
	}
}
