import type Exercise from './exercises/Exercise';
import type MuscleActivity from './muscles/MuscleActivity';
import fromJsonObject from './exercises/fromJsonObject';

export default class WorkoutSet {

	public static fromJsonObject(obj: any): WorkoutSet {
		const exercise = fromJsonObject(obj.exercise);
		return new WorkoutSet(exercise, obj.reps);
	}

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
		return `${this.exercise} ${this.reps.length}x${this.reps[0]}`;
	}

	public repString(): string {
		return `${this.reps.length}x${this.reps[0]}`;
	}
}
