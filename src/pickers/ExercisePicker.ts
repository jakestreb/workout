import Exercise from '../Exercise';
import MuscleActivity from '../MuscleActivity';
import Picker from './Picker';
import WorkoutTarget from '../targets/WorkoutTarget';
import { Result } from '../enums';
import * as util from '../util';

export default class ExercisePicker extends Picker<Exercise> {

	private static _timeTolerance: number = 5 * 60;

	private readonly _target: WorkoutTarget;

	constructor(target: WorkoutTarget) {
		super();

		this._target = target;
	}

	public get checks() {
		return [
			() => this._checkOrder(),
			() => this._checkTime(),
			() => this._checkFocus()
		];
	}

	public get exercises() {
		return this.items;
	}

	public buildGenerator(): Generator<Exercise> {
		return Exercise.generator(this.exercises);
	}

	private get _transitionTime() {
		return (this.index - 1) * Exercise.transitionTime;
	}

	private get _timeEstimate() {
		return util.sum(this.exercises.map(e => e.timeEstimate)) + this._transitionTime;
	}

	private _checkOrder(): Result {
		for (let i = 1; i < this.exercises.length; i++) {
			if (this.exercises[i].sortIndex < this.exercises[i - 1].sortIndex) {
				return Result.Failed;
			}
		}
		return Result.Complete;
	}

	private _checkTime(): Result {
		return this._target.checkTime(this._timeEstimate, ExercisePicker._timeTolerance);
	}

	private _checkFocus(): Result {
		const latestActivity = this.exercises[this.exercises.length - 1].activityPerRep;

		if (this._target.checkSingleFocus(latestActivity)) {
			const activityPerRep = MuscleActivity.combine(...this.exercises.map(e => e.activityPerRep));

			return this._target.checkFocusMuscles(activityPerRep) ? Result.Complete : Result.Incomplete;
		}
		return Result.Failed;
	}
}
