import Exercise from '../Exercise';
import ExercisePair from '../ExercisePair';
import MuscleActivity from '../MuscleActivity';
import Picker from './Picker';
import WorkoutTarget from '../targets/WorkoutTarget';
import { Result } from '../global/enums';
import * as util from '../global/util';

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
		const selected: string[] = [];
		this.exercises.forEach(e => {
			selected.push(...e.names);
		});
		return anyGenerator(this._target, selected);
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
		const activityPerRep = MuscleActivity.combine(...this.exercises.map(e => e.activityPerRep));

		return this._target.checkFocusMuscles(activityPerRep) ? Result.Complete : Result.Incomplete;
	}
}

function* anyGenerator(target: WorkoutTarget, previouslySelected: string[] = []): Generator<Exercise> {
	const gens: Generator<Exercise>[] = [
		Exercise.generator(target, previouslySelected),
		ExercisePair.generator(target, previouslySelected)
	];
	while (gens.length > 0) {
		const index = Math.floor(Math.random() * gens.length);
		const curr = gens[index].next();
		if (curr.done) {
			gens.splice(index, 1);
			continue;
		}
		yield curr.value;
	}
}
