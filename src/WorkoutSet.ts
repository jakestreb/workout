import type Exercise from './exercises/Exercise';
import type MuscleScores from './muscles/MuscleScores';
import fromJsonObject from './exercises/fromJsonObject';
import type RepsWeight from './exercises/RepsWeight';

export default class WorkoutSet {
	public static DIFFICULTY_RATIOS = [0.7, 0.9, 1.1];

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

	public get time(): number {
		return this.exercise.getTime(this.repsWeight);
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
		return `${this.exercise} ${this.repsWeight.toString()}`;
	}
}
