import Exercise from './Exercise';
import MuscleActivityTarget from './MuscleActivityTarget';
import MuscleActivity from './MuscleActivity';
import Reporter from './Reporter';
import * as util from './util';

interface Target {
	name: string;
	intensity: number;
	time: number;
}

const TRANSITION_TIME_S = 120;
const MAX_LEFTOVER_TIME_S = 5 * 60;

export default class ExercisePicker {

	private readonly _tags: string[];
	private readonly _exercises: Exercise[] = [];
	private readonly _generators: Generator<Exercise>[];

	private readonly _totalTime: number;
	private readonly _activityTarget: MuscleActivityTarget;

	private readonly _timeReporter: Reporter;

	constructor(tags: string[], target: Target) {
		this._tags = tags;
		this._totalTime = target.time;
		this._activityTarget = MuscleActivityTarget.fromTarget(target.name, target.intensity, target.time);

		this._generators = [Exercise.generator(this._tags[0], [])];

		this._timeReporter = new Reporter();
		this._timeReporter.setTarget('time', this._totalTime);
	}

	public pick(): Exercise[]|void {
		while (this._index < this._capacity) {
			const gen = this._generators[this._index];
			let added = false;

			// Try exercises from current generator until one works
			let curr = gen.next();
			while (!curr.done) {
				added = this._addExercise(curr.value);
				if (added) {
					break;
				}
				curr = gen.next();
			}

			if (this._index === 0) {
				const issue = this._getDiscrepancies()[0];
				throw new Error(issue);
			}

			// If no exercises from current generator work, backtrack
			if (!added) {
				this._removeExercise();
			}
		}
		return this._exercises;
	}

	private get _capacity() {
		return this._tags.length;
	}

	private get _index() {
		return this._exercises.length;
	}

	private get _transitionTime() {
		return (this._capacity - 1) * TRANSITION_TIME_S;
	}

	// Returns true if add is successful, false if not
	private _addExercise(exercise: Exercise): boolean {
		this._exercises.push(exercise);
		if (!this._checkTargets()) {
			this._exercises.pop();
			return false;
		}
		if (this._index < this._capacity) {
			const tag = this._tags[this._index];
			this._generators.push(Exercise.generator(tag, this._exercises));
		}
		return true;
	}

	private _removeExercise(): void {
		this._exercises.pop();
		this._generators.pop();
	}

	private _checkTargets(): boolean {
		return this._checkTime() && this._checkFocus();
	}

	private _checkFocus(): boolean {
		const latestActivity = this._exercises[this._exercises.length - 1].muscleActivity;
		const isLatestAllowed = this._activityTarget.allows(latestActivity);

		if (this._index < this._capacity) {
			// Ensure latest exercise hits at least one target and does not include avoided muscles
			return this._activityTarget.overlaps(latestActivity) && isLatestAllowed;
		}

		const allActivity = MuscleActivity.combine(...this._exercises.map(e => e.muscleActivity))

		// Ensure the final focus is within tolerances
		return this._activityTarget.isSatisfiedBy(allActivity) && isLatestAllowed;
	}

	private _checkTime(): boolean {
		const elapsedTime = util.sum(this._exercises.map(e => e.totalSeconds)) + this._transitionTime;
		const isUnderTime = elapsedTime <= this._totalTime;
		console.warn('elapsed', elapsedTime);

		if (this._index < this._capacity) {
			// Ensure the time is not over at any step
			return isUnderTime;
		}

		this._timeReporter.record('time', elapsedTime);

		// Ensure the final time is within 5 minutes of the requested, and not over
		return isUnderTime && (elapsedTime >= this._totalTime - MAX_LEFTOVER_TIME_S);
	}

	private _getDiscrepancies(): string[] {
		// todo: doesnt represent why it failed
		return [...this._timeReporter.getDiscrepancies(), ...this._activityTarget.getDiscrepancies()];
	}
}
