import Exercise from './Exercise';
import MuscleActivity from './MuscleActivity';
import * as util from './global/util';

export default class WorkoutSet {

	public readonly exercise: Exercise;
	public readonly reps: number[];

	constructor(exercise: Exercise, reps: number[]) {
		this.exercise = exercise;
		this.reps = reps;
	}

	public get totalReps(): number {
		return this.reps[0] * this.reps.length;
	}

	public get activity(): MuscleActivity {
		return this.exercise.activityPerRep.multiply(this.totalReps);
	}

	public get time(): number {
		return this.exercise.getTime(this.reps.length, this.reps[0]);
	}

	public toString(): string {
		return `${this.exercise} ${this.reps.length}x${this.reps[0]} (${util.timeString(this.time)})`;
	}
}
