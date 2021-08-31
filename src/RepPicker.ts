import Exercise from './Exercise';
import ExerciseSet from './ExerciseSet';
import MuscleActivity from './MuscleActivity';
import MuscleActivityTarget from './MuscleActivityTarget';
import Picker from './Picker';
import Reporter from './Reporter';
import Workout from './Workout'
import { Result } from './enums';
import * as util from './util';

export default class RepPicker extends Picker<ExerciseSet> {

	private readonly _exercises: Exercise[];
	private readonly _activityTarget: MuscleActivityTarget;
	private readonly _minTime: number;
	private readonly _maxTime: number;

	private readonly _timeReporter: Reporter;

	constructor(exercises: Exercise[], activityTarget: MuscleActivityTarget, time: number) {
		super();

		this._exercises = exercises;
		this._activityTarget = activityTarget

		this._minTime = time - Workout.maxLeftoverTime;
		this._maxTime = time;

		this._timeReporter = new Reporter();
		this._timeReporter.setTarget('time', time);
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
		return util.worstResult(this._checkTime(), this._checkFocus());
	}

	public getDiscrepancies(): string[] {
		return [...this._timeReporter.getDiscrepancies(), ...this._activityTarget.getDiscrepancies()];
	}

	private get _transitionTime() {
		return (this._exercises.length - 1) * Exercise.transitionTime;
	}

	private _checkFocus(): Result {
		const activity = MuscleActivity.combine(
			...this.sets.map(s => s.exercise.activityPerRep.multiply(s.totalReps))
		);

		// Ensure the final focus is within tolerances
		return this._activityTarget.isSatisfiedBy(activity) ? Result.Complete : Result.Failed;
	}

	private _checkTime(): Result {
		const time = util.sum(this.sets.map(s => s.time)) + this._transitionTime;
		this._timeReporter.record('time', time);

		if (time >= this._minTime && time <= this._maxTime) {
			return Result.Complete;
		}
		return Result.Failed;
	}
}

function* generateNothing() {
	return
}
