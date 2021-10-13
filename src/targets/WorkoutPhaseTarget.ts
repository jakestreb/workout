import * as exerciseRecords from '../data/exercises.json';
import Exercise from '../exercises/Exercise';
import MuscleActivity from '../MuscleActivity';
import MuscleActivityTarget from './MuscleActivityTarget';
import Reporter from '../Reporter';
import { Result } from '../global/enums';
import * as util from '../global/util';

export default class WorkoutPhaseTarget {

	public static maxLeftoverTime: number = 5 * 60;

	public muscleActivityTarget: MuscleActivityTarget;
	public timeTarget: number;

	private _timeReporter: Reporter
	private _possibleExercises: any[] = [];

	constructor(muscles: string[], intensity: number, time: number) {
		this.muscleActivityTarget = MuscleActivityTarget.fromMuscles(muscles, intensity, time);

		this.timeTarget = time;
		this._timeReporter = new Reporter();
		this._timeReporter.setTarget('time', time);

		this._initPossibleExercises();
	}

	public get exerciseRecords() {
		return this._possibleExercises;
	}

	// Checks that the focus is in the right muscles
	public checkFocusMuscles(muscleActivity: MuscleActivity, phase: number): boolean {
		return this.muscleActivityTarget.hasSameMuscles(muscleActivity);
	}

	// Checks that the focus is in the right muscles and is the right magnitude
	public checkFocus(muscleActivity: MuscleActivity, phase: number): boolean {
		return this.muscleActivityTarget.isSatisfiedBy(muscleActivity);
	}

	public checkTime(time: number, tolerance: number = 0): Result {
		this._timeReporter.record('time', time);

		const minTime = this.timeTarget - WorkoutPhaseTarget.maxLeftoverTime - tolerance;
		const maxTime = this.timeTarget + tolerance;

		if (time < minTime) {
			return Result.Incomplete;
		} else if (time >= minTime && time <= maxTime) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	public throw(): void {
		this._timeReporter.throw();
		this.muscleActivityTarget.reporter.throw();
	}

	private _initPossibleExercises(): void {
		for (const e of util.weightedSelector(exerciseRecords)) {
			const exercise = new Exercise(e);
			const overlaps = this.muscleActivityTarget.overlaps(exercise.activityPerRep);
			if (overlaps) {
				this._possibleExercises.push(e);
			}
		}
	}
}
