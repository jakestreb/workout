import Exercise from './Exercise';
import MuscleActivityTarget from './MuscleActivityTarget';
import MuscleActivity from './MuscleActivity';
import Reporter from './Reporter';
import { Result } from './enums';
import * as util from './util';

interface Target {
	name: string;
	intensity: number;
	time: number;
}

const TRANSITION_TIME_S = 120;
const MAX_LEFTOVER_TIME_S = 5 * 60;

export default class ExercisePicker {

	private readonly _exercises: Exercise[] = [];
	private readonly _generators: Generator<Exercise>[];

	private readonly _totalTime: number;
	private readonly _activityTarget: MuscleActivityTarget;

	private readonly _timeReporter: Reporter;

	constructor(target: Target) {
		this._totalTime = target.time;
		this._activityTarget = MuscleActivityTarget.fromTarget(target.name, target.intensity, target.time);

		this._generators = [Exercise.generator()];

		this._timeReporter = new Reporter();
		this._timeReporter.setTarget('time', this._totalTime);
	}

	public* pick(): Generator<Exercise[]> {
		while (true) {
			// Try exercises from current generator until one works
			const gen = this._generators[this._index];
			let curr = gen.next();
			let status = Result.Failed;
			while (!curr.done && status === Result.Failed) {
				status = this._addExercise(curr.value);
				curr = gen.next();
			}

			// If the workout is complete, yield
			if (status === Result.Complete) {
				yield this._exercises;
				this._timeReporter.reset();
				status = Result.Failed;
			}

			if (this._index === 0) {
				return;
			}

			// If no exercises from current generator work, backtrack
			if (status === Result.Failed) {
				this._removeExercise();
			}
		}
	}

	public getDiscrepancies(): string[] {
		return [...this._timeReporter.getDiscrepancies(), ...this._activityTarget.getDiscrepancies()];
	}

	private get _index() {
		return this._exercises.length;
	}

	private get _transitionTime() {
		return (this._index - 1) * TRANSITION_TIME_S;
	}

	// Returns true if add is successful, false if not
	private _addExercise(exercise: Exercise): Result {
		this._exercises.push(exercise);
		const result = this._checkTargets();
		if (result === Result.Failed) {
			this._exercises.pop();
		} else {
			this._generators.push(Exercise.generator(this._exercises));
		}
		return result;
	}

	private _removeExercise(): void {
		this._exercises.pop();
		this._generators.pop();
	}

	private _checkTargets(): Result {
		return worstResult(this._checkTime(), this._checkFocus());
	}

	private _checkFocus(): Result {
		const latestActivity = this._exercises[this._exercises.length - 1].muscleActivity;
		const isLatestAllowed = this._activityTarget.allows(latestActivity);

		if (isLatestAllowed && this._activityTarget.overlaps(latestActivity)) {
			const allActivity = MuscleActivity.combine(...this._exercises.map(e => e.muscleActivity))

			// Ensure the final focus is within tolerances
			return this._activityTarget.isSatisfiedBy(allActivity);

		}
		return Result.Failed;
	}

	private _checkTime(): Result {
		const elapsedTime = util.sum(this._exercises.map(e => e.totalSeconds)) + this._transitionTime;
		const isUnderTime = elapsedTime <= this._totalTime;

		this._timeReporter.record('time', elapsedTime);

		if (isUnderTime && (elapsedTime >= this._totalTime - MAX_LEFTOVER_TIME_S)) {
			// Return complete if the final time is within 5 minutes under requested
			return Result.Complete;
		} else if (isUnderTime) {
			return Result.Incomplete;
		}
		return Result.Failed;
	}
}

// Short circuit if any values are 0
function worstResult(...args: Result[]): Result {
	let min = Infinity;
	for (const arg of args) {
		if (arg === 0) {
			return 0;
		} else if (arg < min) {
			min = arg;
		}
	}
	return min;
}
