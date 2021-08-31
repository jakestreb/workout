import Exercise from './Exercise';

export default class ExerciseSet {

	public readonly exercise: Exercise;
	public readonly reps: number[];

	constructor(exercise: Exercise, reps: number[]) {
		this.exercise = exercise;
		this.reps = reps;
	}

	public get totalReps(): number {
		return this.reps[0] * this.reps.length;
	}

	public get time(): number {
		return this.totalReps * this.exercise.secondsPerRep + (this.reps.length - 1) * Exercise.restTime;
	}

	public toString(): string {
		return `${this.exercise} ${this.reps.length}x${this.reps[0]}`;
	}
}
