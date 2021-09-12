import Exercise from './Exercise';
import WorkoutSet from './WorkoutSet';
import * as util from './util';

export default class Workout {

	public readonly sets: WorkoutSet[];

	constructor(sets: WorkoutSet[]) {
		this.sets = sets;
	}

	public get time() {
		return util.sum(this.sets.map(s => s.time)) + this._transitionTime;
	}

	private get _transitionTime() {
		return (this.sets.length - 1) * Exercise.transitionTime;
	}

	public toString(): string {
		return `${this.sets.join('\n')}\n(${util.timeString(this.time)})\n`;
	}
}
