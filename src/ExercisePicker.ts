import Exercise from './Exercise';
import MuscleActivityTarget from './MuscleActivityTarget';
import MuscleActivity from './MuscleActivity';
import * as util from './util';

interface Target {
	name: string;
	intensity: number;
	timeMinutes: number;
}

const TRANSITION_TIME_S = 40;
const MAX_LEFTOVER_TIME_S = 5 * 60;

export default class ExercisePicker {

	private readonly _tags: string[];
	private _exercises: Exercise[] = [];
	private _generators: Generator<Exercise>[];

	private readonly _activityTarget: MuscleActivityTarget;
	private readonly _totalTime: number;

	constructor(tags: string[], target: Target) {
		this._tags = tags;
		this._activityTarget = MuscleActivityTarget.fromTarget(target.name, target.intensity);
		this._totalTime = target.timeMinutes * 60;

 		this._generators = [Exercise.generator(this._tags[0], [])];
	}

	public pick(): Exercise[]|void {
		if (this._index === this._capacity) {
			return this._exercises;
		}
		const generator = this._generators[this._index];

		// Try exercises from current generator until one works
		for (const exercise of generator) {
    		if (this._addExercise(exercise)) {
    			return this.pick();
    		}
    	}

    	// If no exercises from current generator work, backtrack
    	if (this._index > 0) {
    		this._removeExercise();
    		return this.pick();
    	}

    	return;
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
		return this._checkFocus() && this._checkTime();
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

		if (this._index < this._capacity) {
			// Ensure the time is not over at any step
			return isUnderTime;
		}

		// Ensure the final time is within 5 minutes of the requested, and not over
		return isUnderTime && (elapsedTime >= this._totalTime - MAX_LEFTOVER_TIME_S);
	}
}
