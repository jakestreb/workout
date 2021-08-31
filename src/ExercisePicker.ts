import Exercise from './Exercise';
import MuscleActivityTarget from './MuscleActivityTarget';
import MuscleActivity from './MuscleActivity';
import Picker from './Picker';
import Workout from './Workout';
import { Result } from './enums';
import * as util from './util';

export default class ExercisePicker extends Picker<Exercise> {

	private static _timeTolerance: number = 5 * 60;

	private readonly _activityTarget: MuscleActivityTarget;
	private readonly _minTime: number;
	private readonly _maxTime: number;

	constructor(activityTarget: MuscleActivityTarget, time: number) {
		super();

		this._minTime = time - Workout.maxLeftoverTime - ExercisePicker._timeTolerance;
		this._maxTime = time + ExercisePicker._timeTolerance;
		this._activityTarget = activityTarget
	}

	public get exercises() {
		return this.items;
	}

	public buildGenerator(): Generator<Exercise> {
		return Exercise.generator(this.exercises);
	}

	public checkProgress(): Result {
		return util.worstResult(this._checkOrder(), this._checkTime(), this._checkFocus());
	}

	private get _transitionTime() {
		return (this.index - 1) * Exercise.transitionTime;
	}

	private _checkOrder(): Result {
		for (let i = 1; i < this.exercises.length; i++) {
			if (this.exercises[i].sortIndex < this.exercises[i - 1].sortIndex) {
				return Result.Failed;
			}
		}
		return Result.Complete;
	}

	private _checkFocus(): Result {
		const latestActivity = this.exercises[this.exercises.length - 1].activityPerRep;

		if (this._activityTarget.allows(latestActivity) && this._activityTarget.overlaps(latestActivity)) {
			const activityPerRep = MuscleActivity.combine(...this.exercises.map(e => e.activityPerRep));

			// Ensure the final focus is within tolerances
			return this._activityTarget.isCoveredBy(activityPerRep) ? Result.Complete : Result.Incomplete;
		}
		return Result.Failed;
	}

	private _checkTime(): Result {
		const timeEstimate = util.sum(this.exercises.map(e => e.timeEstimate)) + this._transitionTime;

		if (timeEstimate < this._minTime) {
			return Result.Incomplete;
		} else if (timeEstimate >= this._minTime && timeEstimate <= this._maxTime) {
			return Result.Complete;
		}
		return Result.Failed;
	}
}
