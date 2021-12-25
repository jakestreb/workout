import Exercise from './exercises/Exercise';
import MuscleScores from './muscles/MuscleScores';
import { Difficulty, Result } from './global/enum';
import * as util from './global/util';
import data from './data';

export default class WorkoutTarget {

	public static MAX_LEFTOVER_TIME_FACTOR: number = 0.1;

	// TODO: Remove?
	public muscleTarget: MuscleScores;

	public timeTarget: number;
	public difficulty: Difficulty;

	private _possibleExercises: Exercise[] = [];

	constructor(target: IWorkoutTarget) {
		this.muscleTarget = new MuscleScores(target.scores);
		this.timeTarget = target.timeMinutes * 60;
		this.difficulty = target.difficulty;

		this._initPossibleExercises();
	}

	public get possibleExercises() {
		return this._possibleExercises;
	}

	public hasAllMuscles(scores: MuscleScores): boolean {
		return scores.hasAllOf(this.muscleTarget);
	}

	public avgScoreDistance(scores: MuscleScores): number {
		return this.muscleTarget.avgDistance(scores);
	}

	public checkTime(time: number): Result {
		const maxLeftoverTime = this.timeTarget * WorkoutTarget.MAX_LEFTOVER_TIME_FACTOR;
		const minTime = this.timeTarget - maxLeftoverTime;
		const maxTime = this.timeTarget;

		if (time < minTime) {
			return Result.Incomplete;
		} else if (time > maxTime) {
			return Result.Failed;
		}
		return Result.Complete;
	}

	private _initPossibleExercises(): void {
		for (const e of util.weightedSelector(data.exercises.all())) {
			const exercise = new Exercise(e.name);
			const overlaps = exercise.muscleScoreFactors.hasSubsetOf(this.muscleTarget);
			if (overlaps) {
				this._possibleExercises.push(exercise);
			}
		}
	}
}
