import Exercise from '../exercises/Exercise';
import MuscleActivity from '../MuscleActivity';
import Picker from './Picker';
import WorkoutPhaseTarget from '../targets/WorkoutPhaseTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import { Result } from '../global/enums';

export default class RepPicker extends Picker<WorkoutSet> {

	private readonly _exercises: Exercise[];
	private readonly _target: WorkoutPhaseTarget;

	constructor(exercises: Exercise[], target: WorkoutPhaseTarget) {
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

	public get sets(): WorkoutSet[] {
		return this.items;
	}

	public buildGenerator(): Generator<WorkoutSet> {
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

	private _checkTime(): Result {
		const w = new Workout(this.sets);
		if (this._target.checkTime(w.time) === Result.Complete) {
			return Result.Complete;
		}
		return Result.Failed;
	}

	private _checkFocus(): Result {
		const activity = MuscleActivity.combine(...this.sets.map(s => s.activity));
		return this._target.checkFocus(activity) ? Result.Complete : Result.Failed;
	}
}

function* generateNothing() {
	return
}
