import BodyProfile from '../muscles/BodyProfile';
import MuscleScores from '../muscles/MuscleScores';
import Exercise from '../exercises/Exercise';
import Picker from './Picker';
import WorkoutTarget from '../WorkoutTarget'
import Workout from '../Workout';
import WorkoutSet from '../WorkoutSet';
import * as util from '../global/util';

export default class RepPicker extends Picker<WorkoutSet> {

	private readonly _exercises: Exercise[];
	private readonly _target: WorkoutTarget;
	private readonly _bodyProfile: BodyProfile;
	private readonly _user: DBUser;

	constructor(exercises: Exercise[], target: WorkoutTarget, bodyProfile: BodyProfile) {
		super();

		this._exercises = exercises;
		this._target = target;
		this._bodyProfile = bodyProfile;
		this._user = bodyProfile.user;
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
		const scores = MuscleScores.combine(...this.sets.map(s => s.getScores(this._user)));
		return this._target.checkFocus(scores) ? Result.Complete : Result.Failed;
	}

	private* _generateSets(exercise: Exercise) {
		const repsWeight = exercise.getRecommendation(this._bodyProfile);
		const personalBestSet = new WorkoutSet(exercise, repsWeight);

		const sets = personalBestSet.getScaled();
		for (const set of util.randomSelector(sets)) {
			yield set;
		}
	}
}

function* generateNothing() {
	return;
}
