import Exercise from './Exercise';

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

	public get time(): number {
		return this.exercise.getTime(this.reps.length, this.reps[0]);
	}

	public toString(): string {
		const min = Math.floor(this.time / 60);
		let s = `0${Math.floor(this.time % 60)}`;
		s = s.slice(s.length - 2);
		return `${this.exercise} ${this.reps.length}x${this.reps[0]} (${min}:${s})`;
	}
}
