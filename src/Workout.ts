import WorkoutSet from './WorkoutSet';

export default class Workout {

	public readonly sets: WorkoutSet[];

	constructor(sets: WorkoutSet[]) {
		this.sets = sets;
	}

	public toString(): string {
		return `${this.sets.join('\n')}\n`;
	}
}
