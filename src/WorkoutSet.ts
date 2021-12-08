import type Exercise from './exercises/Exercise';
import type MuscleScores from './muscles/MuscleScores';
import type RepsWeight from './muscles/RepsWeight';
import fromJsonObject from './exercises/fromJsonObject';

export default class WorkoutSet {
	public static DIFFICULTY_RATIOS = {
		[Difficulty.Easy]: 0.7,
		[Difficulty.Intermediate]: 0.9,
		[Difficulty.Hard]: 1.1,
	}

	public static fromJsonObject(obj: any): WorkoutSet {
		const exercise = fromJsonObject(obj.exercise);
		return new WorkoutSet(exercise, obj.reps);
	}

	public readonly exercise: Exercise;
	public readonly repsWeight: RepsWeight;

	constructor(exercise: Exercise, repsWeight: RepsWeight) {
		this.exercise = exercise;
		this.repsWeight = repsWeight;
	}

	public get totalReps(): number {
		return this.reps[0] * this.reps.length;
	}

	public get time(): number {
		return this.exercise.getTime(this.reps.length, this.reps[0]);
	}

	public getScaled(): WorkoutSet[] {
		const ratios: number[] = Object.values(WorkoutSet.DIFFICULTY_RATIOS);

		return ratios.map(r =>
			new WorkoutSet(this.exercise,
				this.repsWeight.copy().scale({
					reps: r,
					weight: r,
				})
			)
		);
	}

	public getScores(user: DBUser): MuscleScores {
		return this.exercise.getMuscleScores(this.repsWeight, user);
	}

	public toString(): string {
		return `${this.exercise} ${this.reps.length}x${this.reps[0]}`;
	}

	public repString(): string {
		return `${this.reps.length}x${this.reps[0]}`;
	}
}
