import Exercise from '../Exercise';
import ExerciseSet from '../ExerciseSet';
import MuscleActivity from '../MuscleActivity';
import Picker from './Picker';
import WorkoutTarget from '../targets/WorkoutTarget'
import { Result } from '../enums';
import * as util from '../util';

export default class RepPicker extends Picker<ExerciseSet> {

	private readonly _exercises: Exercise[];
	private readonly _target: WorkoutTarget;

	constructor(exercises: Exercise[], target: WorkoutTarget) {
		super();

		this._exercises = exercises;
		this._target = target
	}

	public get checks() {
		return [
			() => this._checkTime(),
			() => this._checkFocus()
		];
	}

	public get sets(): ExerciseSet[] {
		return this.items;
	}

	public buildGenerator(): Generator<ExerciseSet> {
		if (this.index < this._exercises.length) {
			return this._exercises[this.index].generateSets();
		}
		return generateNothing();
	}

	public checkProgress(): Result {
		if (this.index < this._exercises.length) {
			return Result.Incomplete;
		}
		return super.checkProgress();
	}

	private get _transitionTime() {
		return (this._exercises.length - 1) * Exercise.transitionTime;
	}

	private get _totalTime() {
		return util.sum(this.sets.map(s => s.time)) + this._transitionTime;
	}

	private _checkTime(): Result {
		if (this._target.checkTime(this._totalTime)) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	private _checkFocus(): Result {
		const activity = MuscleActivity.combine(
			...this.sets.map(s => s.exercise.activityPerRep.multiply(s.totalReps))
		);
		return this._target.checkFocus(activity) ? Result.Complete : Result.Failed;
	}
}

function* generateNothing() {
	return
}
