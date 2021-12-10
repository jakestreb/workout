import MuscleScores from '../muscles/MuscleScores';
import Exercise from '../exercises/Exercise';
import type UserRecords from '../exercises/UserRecords';
import Picker from './Picker';
import type WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import * as util from '../global/util';

export default class RepPicker extends Picker<WorkoutSet> {

	private readonly _exercises: Exercise[];
	private readonly _target: WorkoutTarget;
	private readonly _userRecords: UserRecords;
	private readonly _user: DBUser;

	constructor(exercises: Exercise[], target: WorkoutTarget, userRecords: UserRecords) {
		super();

		this._exercises = exercises;
		this._target = target;
		this._userRecords = userRecords;
		this._user = userRecords.user;
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
			return this._generateSets(this._exercises[this.index]);
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
		const scores = MuscleScores.combine(...this.sets.map(s => s.getFocusScores(this._user)));
		return this._target.checkFocus(scores) ? Result.Complete : Result.Failed;
	}

	private* _generateSets(exercise: Exercise) {
		const recs = this._userRecords.getRecommendations(exercise.name);
		const sets = recs.map(r => new WorkoutSet(exercise, r));
		const scaled = ([] as WorkoutSet[]).concat(...sets.map(s => s.getScaled()));

		for (const set of util.randomSelector(scaled)) {
			yield set;
		}
	}
}

function* generateNothing() {
	return;
}
