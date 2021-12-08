import Exercise from './exercises/Exercise';
import MuscleTarget from './muscles/MuscleTarget';
import * as util from './global/util';
import data from './data';

import type MuscleScores from './muscles/MuscleScores';

export default class WorkoutTarget {

	public static maxLeftoverTime: number = 5 * 60;

	public muscleTarget: MuscleTarget;
	public timeTarget: number;

	private _possibleExercises: JSONExercise[] = [];

	constructor(target: IWorkoutTarget) {
		this.muscleTarget = new MuscleTarget(target.minScores);

		const time = target.timeMinutes * 60;
		this.timeTarget = time;

		this._initPossibleExercises();
	}

	public get exerciseRecords() {
		return this._possibleExercises;
	}

	// Checks that the focus is in the right muscles
	public checkFocusMuscles(scores: MuscleScores): boolean {
		return this.muscleTarget.hasSameMuscles(scores);
	}

	// Checks that the focus is in the right muscles and is the right magnitude
	public checkFocus(scores: MuscleScores): boolean {
		return this.muscleTarget.isSatisfiedBy(scores);
	}

	public checkTime(time: number, tolerance: number = 0): Result {
		const minTime = this.timeTarget - WorkoutTarget.maxLeftoverTime - tolerance;
		const maxTime = this.timeTarget + tolerance;

		if (time < minTime) {
			return Result.Incomplete;
		} else if (time >= minTime && time <= maxTime) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	private _initPossibleExercises(): void {
		for (const e of util.weightedSelector(data.exercises.all())) {
			const exercise = new Exercise(e);
			const overlaps = this.muscleTarget.overlaps(exercise.scoresPerRep);
			if (overlaps) {
				this._possibleExercises.push(e);
			}
		}
	}
}
