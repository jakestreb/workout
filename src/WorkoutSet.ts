import type Exercise from './exercises/Exercise';
import type MuscleScores from './muscles/MuscleScores';
import fromJsonObject from './exercises/fromJsonObject';
import type RepsWeight from './exercises/RepsWeight';

export default class WorkoutSet {
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

	public getFocusScores(user: DBUser): MuscleScores {
		return this.exercise.getFocusScores(this.repsWeight, user);
	}

	public toString(): string {
		return `${this.exercise} ${this.repsWeight.toString()}`;
	}
}
